import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/three.module.js';
import { createTrainModel, REWARD_3D_TRAINS } from '../src/reward3d-trains.js';

const formations = { yokosuka: 11, 'shonan-shinjuku': 10, saikyo: 10, toyoko: 8 };
const closeTo = (actual, expected, tolerance = 1e-5) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} should be near ${expected}`);

test('3D catalog has four distinct commuter train formations', () => {
  assert.deepEqual(REWARD_3D_TRAINS.map(train => train.id), Object.keys(formations));
  assert.equal(new Set(REWARD_3D_TRAINS.map(train => train.model)).size, 4);
  for (const train of REWARD_3D_TRAINS) {
    assert.equal(train.cars, formations[train.id], train.id);
    assert.ok(train.stripes.length > 0);
    assert.ok(train.name && train.model && train.destination && train.image && train.bookId);
  }
  assert.throws(() => createTrainModel('hayabusa'), RangeError);
});

for (const config of REWARD_3D_TRAINS) {
  test(`${config.id}: full scale consist, real geometry, rail alignment and resource cleanup`, t => {
    // Runs without document/CanvasTexture or a WebGL context.
    const model = createTrainModel(config), { group, wheels } = model;
    t.after(() => model.dispose());
    assert.ok(group instanceof THREE.Group);
    assert.equal(group.userData.trainId, config.id);
    const count = formations[config.id];
    assert.equal(group.userData.carCount, count);
    const cars = group.userData.carMetadata;
    assert.equal(cars.length, count);
    closeTo(model.length, 20 + (count - 1) * 20.6);
    closeTo(group.userData.length, model.length);
    assert.deepEqual(cars.filter(car => car.green).map(car => car.index),
      ['yokosuka', 'shonan-shinjuku'].includes(config.id) ? [3, 4] : []);
    for (const [index, car] of cars.entries()) {
      assert.equal(car.index, index);
      closeTo(car.centerX, -20.6 * index);
      assert.equal(car.passengerDoorsPerSide, car.green ? 2 : 4);
      if (index) {
        const gap = cars[index - 1].centerX - car.centerX - 20;
        assert.ok(gap > .2 && gap < 1, 'coupled 20 m bodies must not overlap or float apart');
      }
    }
    group.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(group), size = bounds.getSize(new THREE.Vector3());
    for (const value of [...bounds.min, ...bounds.max, ...size]) assert.ok(Number.isFinite(value));
    assert.ok(size.x >= model.length && size.x < model.length + 2, 'body geometry must span the entire consist');
    assert.ok(size.z > 2.7 && size.z < 3.5, 'commuter cars are approximately three metres wide');
    assert.ok(size.y > 3.8 && size.y < 6, 'roof and pantograph height must use metre scale');
    closeTo(bounds.getCenter(new THREE.Vector3()).z, 0, .1);
    assert.ok(bounds.min.y >= .1 && bounds.min.y < .3, 'wheels sit at the railhead');
    assert.ok(bounds.min.x < cars.at(-1).centerX - 9.5);
    assert.ok(bounds.max.x > cars[0].centerX + 9.5, 'both cab ends must have geometry');

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
    closeTo(group.userData.wheelRadius, .43);
    assert.equal(group.userData.spinAxis, 'z');
    const axis = new THREE.Vector3(0, 0, 1), rotation = new THREE.Quaternion();
    for (const wheel of wheels) {
      assert.equal(wheel.userData.spinAxis, 'z');
      closeTo(wheel.userData.radius, .43);
      const position = wheel.getWorldPosition(new THREE.Vector3());
      closeTo(position.y - .43, .15);
      closeTo(position.z, 0);
      const car = cars.reduce((nearest, item) => Math.abs(item.centerX - position.x) < Math.abs(nearest.centerX - position.x) ? item : nearest);
      assert.ok(Math.abs(position.x - car.centerX) > 5 && Math.abs(position.x - car.centerX) < 8.5);
      const axleBox = new THREE.Box3().setFromObject(wheel);
      assert.ok(axleBox.min.z < -.65 && axleBox.max.z > .65, 'each axle includes wheels at both rails');
      wheel.getWorldQuaternion(rotation);
      assert.ok(axis.clone().applyQuaternion(rotation).distanceTo(axis) < 1e-5, 'rear cab retains the same wheel spin direction');
      wheel.rotation.z = -.75; wheel.updateMatrixWorld(true);
      closeTo(wheel.getWorldPosition(new THREE.Vector3()).y, position.y);
    }
    for (const car of cars) {
      assert.equal(wheels.filter(wheel => Math.abs(wheel.position.x - car.centerX) < 9).length, 4, 'each car has its own axles');
      // Inspect actual instances near each car instead of trusting metadata alone.
      const occupied = new THREE.Box3(), matrix = new THREE.Matrix4(), world = new THREE.Matrix4();
      for (const mesh of instances) {
        for (let i = 0; i < mesh.count; i++) {
          mesh.getMatrixAt(i, matrix); world.multiplyMatrices(mesh.matrixWorld, matrix);
          const box = mesh.geometry.boundingBox.clone().applyMatrix4(world);
          if (Math.abs(box.getCenter(new THREE.Vector3()).x - car.centerX) < 10) occupied.union(box);
        }
      }
      const carSize = occupied.getSize(new THREE.Vector3());
      assert.ok(carSize.x > 19 && carSize.x < 22, 'each metadata car has a full length body');
      assert.ok(carSize.y > 3 && carSize.z > 2.7, 'each car needs height and both sides');
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
