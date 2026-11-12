import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/three.module.js';
import { createTrainModel, REWARD_3D_TRAINS } from '../src/reward3d-trains.js';

const formations = { yokosuka: 11, 'shonan-shinjuku': 10, saikyo: 10, toyoko: 8, yamanote: 11, komachi: 7, hayabusa: 10 };
const closeTo = (actual, expected, tolerance = 1e-5) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} should be near ${expected}`);

test('3D catalog has seven distinct commuter and Shinkansen formations', () => {
  assert.deepEqual(REWARD_3D_TRAINS.map(train => train.id).sort(), Object.keys(formations).sort());
  assert.equal(new Set(REWARD_3D_TRAINS.map(train => train.model)).size, 7);
  for (const train of REWARD_3D_TRAINS) {
    assert.equal(train.cars, formations[train.id], train.id);
    assert.ok(train.stripes.length > 0);
    assert.ok(train.name && train.model && train.destination && train.image && train.bookId);
  }
  const byId = Object.fromEntries(REWARD_3D_TRAINS.map(train => [train.id, train]));
  assert.equal(byId.yamanote.family, 'e235');
  assert.deepEqual(byId.yamanote.greenCars, []);
  assert.equal(byId.yamanote.pitch ?? 20.6, 20.6);
  for (const [id, family, bodyLength, pitch, frontExtra, width, frontX] of [
    ['hayabusa', 'e5', 24.5, 25, 1.5, 3.35, 13.75],
    ['komachi', 'e6', 20, 20.5, 2.575, 2.945, 12.575],
  ]) {
    const config = byId[id];
    assert.equal(config.family, family);
    closeTo(config.bodyLength ?? config.carLength, bodyLength);
    closeTo(config.pitch, pitch);closeTo(config.frontExtra, frontExtra);
    closeTo(config.width, width);closeTo(config.gauge, 1.435);closeTo(config.frontX, frontX);
  }
  assert.throws(() => createTrainModel('missing-train'), RangeError);
});

for (const config of REWARD_3D_TRAINS) {
  test(`${config.id}: full scale consist, real geometry, rail alignment and resource cleanup`, t => {
    // Runs without document/CanvasTexture or a WebGL context.
    const model = createTrainModel(config), { group, wheels } = model;
    t.after(() => model.dispose());
    assert.ok(group instanceof THREE.Group);
    assert.equal(group.userData.trainId, config.id);
    const count = formations[config.id];
    const bodyLength = config.bodyLength ?? config.carLength ?? 20;
    const pitch = config.pitch ?? 20.6, frontExtra = config.frontExtra ?? 0;
    const width = config.width ?? 2.95, halfGauge = (config.gauge ?? 1.067) / 2;
    const wheelRadius = config.wheelRadius ?? .43;
    assert.equal(group.name, `reward-train-${config.id}`);
    assert.equal(group.userData.carCount, count);
    const cars = group.userData.carMetadata;
    assert.equal(cars.length, count);
    closeTo(model.length, bodyLength + (count - 1) * pitch + 2 * frontExtra);
    closeTo(group.userData.length, model.length);
    if (config.frontX !== undefined) {
      closeTo(model.frontX, config.frontX);
      closeTo(model.rearX, -(count - 1) * pitch - config.frontX);
    }
    assert.deepEqual(cars.filter(car => car.green).map(car => car.index),
      config.greenCars);
    for (const [index, car] of cars.entries()) {
      assert.equal(car.index, index);
      closeTo(car.centerX, -pitch * index);
      assert.equal(car.passengerDoorsPerSide, car.green ? 2 : (config.doorsPerSide ?? 4));
      if (index) {
        const gap = cars[index - 1].centerX - car.centerX - bodyLength;
        closeTo(gap, pitch - bodyLength);
        assert.ok(gap > .2 && gap < 1, 'coupled bodies must not overlap or float apart');
      }
    }
    group.updateMatrixWorld(true);
    const bounds = new THREE.Box3();
    for(const item of group.children)if(!item.userData.groundEffect)bounds.union(new THREE.Box3().setFromObject(item));
    const size = bounds.getSize(new THREE.Vector3());
    for (const value of [...bounds.min, ...bounds.max, ...size]) assert.ok(Number.isFinite(value));
    assert.ok(size.x >= model.length - 1e-5 && size.x < model.length + 2, 'body geometry must span the entire consist');
    assert.ok(size.z > width - .25 && size.z < width + .55, `body width matches ${width} m configuration: ${size.z}`);
    assert.ok(size.y > 3.8 && size.y < 6, 'roof and pantograph height must use metre scale');
    closeTo(bounds.getCenter(new THREE.Vector3()).z, 0, .1);
    assert.ok(bounds.min.y >= .1 && bounds.min.y < .3, 'wheels sit at the railhead');
    assert.ok(bounds.min.x < cars.at(-1).centerX - bodyLength / 2 - frontExtra + .5);
    assert.ok(bounds.max.x > cars[0].centerX + bodyLength / 2 + frontExtra - .5, 'both cab ends must have full geometry');

    const meshes = [], geometries = new Set(), materials = new Set(), textures = new Set(), instances = [];
    group.traverse(object => {
      for (const value of object.matrixWorld.elements) assert.ok(Number.isFinite(value), `${object.name} transform`);
      if (!object.isMesh) return;
      meshes.push(object);
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
      if (object.isInstancedMesh) {
        instances.push(object);
        assert.ok(object.count > 0);
        for (const value of object.instanceMatrix.array) assert.ok(Number.isFinite(value), 'instance transforms must be finite');
      }
    });
    assert.ok(meshes.length > count, 'scene contains renderable rolling stock');
    assert.ok(instances.length > 0, 'repeated detail is batched into actual InstancedMesh geometry');
    assert.ok(instances.some(mesh => mesh.count >= count), 'repeated parts cover a full consist');
    assert.ok(geometries.size < meshes.length, 'cars and axles share geometry');
    let vertices = 0;
    for (const geometry of geometries) {
      const positions = geometry.getAttribute('position');
      assert.ok(positions?.count >= 3, 'meshes need triangle vertices');
      vertices += positions.count;
      for (const [name, attribute] of Object.entries(geometry.attributes)) {
        for (const value of attribute.array) assert.ok(Number.isFinite(value), `${name} contains a nonfinite vertex`);
      }
      if (geometry.index) {
        for (const index of geometry.index.array) assert.ok(index >= 0 && index < positions.count, 'triangle indices reference existing vertices');
      }
      geometry.computeBoundingBox();
      assert.equal(geometry.boundingBox.isEmpty(), false);
    }
    assert.ok(vertices > 1000, 'train has shaped surfaces rather than an empty placeholder');
    assert.ok([...materials].some(material => material.transparent), 'glass needs a transparent material');
    assert.ok([...materials].some(material => material.metalness > .5), 'steel needs a metallic material');
    assert.ok(textures.size > 0, 'destination/reflection textures exist without document');

    assert.equal(wheels.length, count * 4, 'two bogies with two axles each per car');
    assert.equal(new Set(wheels).size, wheels.length);
    const expectedAxles = cars.flatMap(car => {
      const reversed = car.index === count - 1;
      const isCab = car.index === 0 || reversed;
      const bogies = isCab && config.cabBogieCenters ? config.cabBogieCenters : (config.bogieCenters ?? [-6.8, 6.8]);
      return bogies.flatMap(center => [-1.05, 1.05].map(offset => car.centerX + (reversed && isCab && config.cabBogieCenters ? -center : center) + offset));
    }).sort((a, b) => a - b);
    const actualAxles = wheels.map(wheel => wheel.getWorldPosition(new THREE.Vector3()).x).sort((a, b) => a - b);
    actualAxles.forEach((value, index) => closeTo(value, expectedAxles[index]));
    closeTo(group.userData.wheelRadius, wheelRadius);
    assert.equal(group.userData.spinAxis, 'z');
    const axis = new THREE.Vector3(0, 0, 1), rotation = new THREE.Quaternion();
    for (const wheel of wheels) {
      assert.equal(wheel.userData.spinAxis, 'z');
      closeTo(wheel.userData.radius, wheelRadius);
      const position = wheel.getWorldPosition(new THREE.Vector3());
      closeTo(position.y - wheelRadius, .15);
      closeTo(position.z, 0);
      const axleBox = new THREE.Box3().setFromObject(wheel);
      assert.ok(axleBox.min.z < -halfGauge && axleBox.max.z > halfGauge, 'each axle includes wheels at both configured rails');
      assert.ok(axleBox.min.z > -halfGauge - .45 && axleBox.max.z < halfGauge + .45, 'wheel width remains appropriate to the configured gauge');
      wheel.getWorldQuaternion(rotation);
      assert.ok(axis.clone().applyQuaternion(rotation).distanceTo(axis) < 1e-5, 'rear cab retains the same wheel spin direction');
      wheel.rotation.z = -.75; wheel.updateMatrixWorld(true);
      closeTo(wheel.getWorldPosition(new THREE.Vector3()).y, position.y);
    }
    for (const car of cars) {
      assert.equal(wheels.filter(wheel => Math.abs(wheel.getWorldPosition(new THREE.Vector3()).x - car.centerX) < pitch / 2).length, 4, 'each car has its own axles');
      // Inspect actual geometry near each car instead of trusting metadata alone.
      const occupied = new THREE.Box3(), matrix = new THREE.Matrix4(), world = new THREE.Matrix4();
      for (const mesh of meshes) {
        if (mesh.userData.groundEffect) continue;
        for (let i = 0; i < (mesh.isInstancedMesh ? mesh.count : 1); i++) {
          if (mesh.isInstancedMesh) { mesh.getMatrixAt(i, matrix); world.multiplyMatrices(mesh.matrixWorld, matrix); }
          else world.copy(mesh.matrixWorld);
          const box = mesh.geometry.boundingBox.clone().applyMatrix4(world);
          if (Math.abs(box.getCenter(new THREE.Vector3()).x - car.centerX) < pitch / 2) occupied.union(box);
        }
      }
      const carSize = occupied.getSize(new THREE.Vector3());
      assert.ok(carSize.x > bodyLength - 1 && carSize.x < bodyLength + frontExtra + 2, `each metadata car has a full length body: ${carSize.x}`);
      assert.ok(carSize.y > 3 && carSize.z > width - .25, 'each car needs height and both sides');
    }

    const parent = new THREE.Scene(); parent.add(group);
    const resources = [...geometries, ...materials, ...textures, ...instances];
    const disposed = new Map(resources.map(resource => [resource, 0]));
    for (const resource of resources) resource.addEventListener('dispose', () => disposed.set(resource, disposed.get(resource) + 1));
    model.dispose();
    assert.equal(group.parent, null);
    assert.equal(parent.children.length, 0);
    assert.equal(group.children.length, 0);
    assert.equal(wheels.length, 0);
    for (const [resource, calls] of disposed) assert.equal(calls, 1, `${resource.type ?? 'texture'} released exactly once`);
    model.dispose();
    for (const calls of disposed.values()) assert.equal(calls, 1, 'cleanup must be idempotent');
  });
}
