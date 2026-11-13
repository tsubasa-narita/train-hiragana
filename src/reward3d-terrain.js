import * as THREE from '../vendor/three/three.module.js';

// A single watertight rock volume, including its traversable tunnel. The outer
// skin rolls out from the portal, over the ridge, under the sea and back into
// the rear opening. The return rings form the bore: there are no end caps,
// rectangular skirts, intersecting hill sheets, or hidden black portal disks.
export function createTunnelMountain({ at, keep, mesh, instances, random, config, rockMap }) {
  const front = -25, length = 585, sides = 120, rings = 144, capRings = 18;
  const tau = Math.PI * 2;
  function aperture(angle) {
    if (angle <= Math.PI) return { offset: 3.65 * Math.cos(angle), y: 3.9 + 3.65 * Math.sin(angle) };
    const t = (angle - Math.PI) / Math.PI * 3;
    if (t < 1) return { offset: -3.65, y: 3.9 - t * 4.3 };
    if (t < 2) return { offset: -3.65 + (t - 1) * 7.3, y: -.4 };
    return { offset: 3.65, y: -.4 + (t - 2) * 4.3 };
  }
  function surface(u, angle) {
    const opening = aperture(angle);
    // Both end cross-sections retain a full mountain mass. In particular the
    // front foot is already below the bay, rather than tapering up to the bore.
    const envelope = .76 + .3 * Math.pow(Math.max(0, Math.sin(Math.PI * u)), .85) - .12 * u;
    const shoulder = Math.cos(angle), elevation = Math.sin(angle);
    const offset = opening.offset + envelope * (32 + 133 * shoulder);
    // A lower coastal shoulder at the entrance leaves sky behind a frontal
    // train shot. The ridge rises inland; the bore and submerged foot stay put.
    const ridgeHeight = 111 + 42 * THREE.MathUtils.smoothstep(u, 0, .32);
    const baseY = opening.y + envelope * (-64 + ridgeHeight * elevation);
    // Spatially anchored outcrops cross the cap/body boundary. Angular sine
    // folds are deliberately absent: they made every ravine aim at the portal.
    const relief = Math.sin(u * 19 + offset * .034 + baseY * .012) * 4.5
      + Math.sin(u * 37 - offset * .071 + baseY * .043) * 2;
    const y = baseY + relief * Math.max(0, elevation);
    const depth = 30 + 7 * Math.sin(offset * .024 + y * .017) + 4 * Math.cos(y * .033 - offset * .014);
    return { s: front - depth - (length - 60) * u, y, offset };
  }
  function annulus(t, angle, rear = false) {
    const opening = aperture(angle), edge = surface(rear ? 1 : 0, angle);
    const mouthS = front - (rear ? length : 0);
    const offset = THREE.MathUtils.lerp(opening.offset, edge.offset, t);
    const y = THREE.MathUtils.lerp(opening.y, edge.y, t);
    // A bowed, irregular escarpment, not a flat end plate. Extra relief is a
    // function of location on the rock face, and vanishes at its shared edges.
    const bow = t * (.45 + .55 * t);
    const relief = Math.sin(offset * .087 + y * .039) * 22 + Math.cos(y * .071 - offset * .033) * 13
      + Math.sin(offset * .21 - y * .14) * 5;
    const s = THREE.MathUtils.lerp(mouthS, edge.s, bow) + t * (1 - t) * relief;
    return at(s, y, offset);
  }
  const positions = [], uv = [], indices = [];
  // Shared vertices across the angular seam and both mouths make this a closed
  // manifold. The inner and outer mouths share the same ring, not duplicate caps.
  const sampleRings = [{ kind: 'front', t: 0 }];
  for (let j = 1; j <= capRings; j++) sampleRings.push({ kind: 'front', t: j / capRings });
  for (let j = 1; j <= rings; j++) sampleRings.push({ kind: 'outer', t: j / rings });
  for (let j = 1; j <= capRings; j++) sampleRings.push({ kind: 'rear', t: 1 - j / capRings });
  for (let j = 1; j < rings; j++) sampleRings.push({ kind: 'bore', t: 1 - j / rings });
  const sections = sampleRings.length;
  for (let j = 0; j < sections; j++) {
    const { kind, t } = sampleRings[j];
    for (let i = 0; i < sides; i++) {
      const angle = tau * i / sides;
      let p;
      if (kind === 'front' || kind === 'rear') p = annulus(t, angle, kind === 'rear');
      else if (kind === 'outer') { const q = surface(t, angle); p = at(q.s, q.y, q.offset); }
      else { const q = aperture(angle); p = at(front - length * t, q.y, q.offset); }
      positions.push(p.x, p.y, p.z);
      uv.push((p.x + p.z * .23) / 31, (p.y + p.z * .17) / 27);
    }
  }
  for (let j = 0; j < sections; j++) for (let i = 0; i < sides; i++) {
    const a = j * sides + i, n = j * sides + (i + 1) % sides;
    const b = ((j + 1) % sections) * sides + i, bn = ((j + 1) % sections) * sides + (i + 1) % sides;
    indices.push(a, n, b, n, bn, b);
  }
  const geometry = keep(new THREE.BufferGeometry());
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const colors = [], color = new THREE.Color();
  const deep = new THREE.Color(0x354954), slate = new THREE.Color(0x697770), limestone = new THREE.Color(0xb5b29a);
  const moss = new THREE.Color(0x536e43), grass = new THREE.Color(0x81905b), bore = new THREE.Color(0x343c39);
  const normal = geometry.attributes.normal;
  for (let j = 0; j < sections; j++) for (let i = 0; i < sides; i++) {
    const v = j * sides + i, p = v * 3, y = positions[p + 1], x = positions[p], z = positions[p + 2];
    const strata = .5 + .5 * Math.sin(y * .27 + Math.sin(x * .031 + z * .07) * 2.8);
    const mottling = Math.sin(x * .12 + z * .09) * Math.sin(y * .18 - z * .04);
    color.copy(deep).lerp(slate, THREE.MathUtils.smoothstep(y, -120, -10));
    color.lerp(limestone, (.24 + strata * .26 + mottling * .16) * THREE.MathUtils.smoothstep(y, -65, 25));
    const vegetation = THREE.MathUtils.smoothstep(normal.getY(v) + mottling * .12, .49, .84)
      * THREE.MathUtils.smoothstep(y, -5, 22);
    color.lerp(moss, vegetation).lerp(grass, vegetation * (.22 + .18 * mottling));
    color.multiplyScalar(.94 + strata * .09 + mottling * .045);
    if (sampleRings[j].kind === 'bore') color.copy(bore).multiplyScalar(.88 + strata * .1);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const material = keep(new THREE.MeshStandardMaterial({ vertexColors: true, map: rockMap,
    bumpMap: rockMap, bumpScale: .38, roughness: .98 }));
  const mountain = mesh(geometry, material, 'sculpted-closed-tunnel-mountain');
  mountain.castShadow=true;
  mountain.userData = { closed: true, tunnelFront: front, tunnelRear: front - length, sections, sides, capRings };

  // The foliage follows the actual surface normal; steep escarpments stay bare.
  // Several offset crowns per tree make an interlocking canopy, with clearings
  // and dark ravines rather than evenly scattered identical green balls.
  const crowns = [], trunks = [], flowers = [];
  const palette = [0x244d3a, 0x356248, 0x476d46, 0x5f7846, 0x73834a, 0x3e6544];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < 1100 && crowns.length < 1467; i++) {
    const u = .018 + random() * .95, angle = .1 + random() * (Math.PI - .2);
    const sample = (t, a) => {
      if (i % 5 === 0) return annulus(t, a);
      const q = surface(t, a); return at(q.s, q.y, q.offset);
    };
    const p = sample(u, angle), pu = sample(u + .0001, angle), pa = sample(u, angle + .0001);
    a.set(pa.x - p.x, pa.y - p.y, pa.z - p.z);
    b.set(pu.x - p.x, pu.y - p.y, pu.z - p.z); n.crossVectors(a, b).normalize();
    const clearing = Math.sin(u * 57 + angle * 5) * Math.sin(angle * 12 - u * 18);
    if (n.y < .54 || p.y < 5 || clearing > .64 || (u < .035 && Math.abs(p.z) < 9)) continue;
    const height = 3.5 + random() * 5.8, width = height * (.6 + random() * .28), tint = palette[i % palette.length];
    trunks.push({ x: p.x, y: p.y + height * .27, z: p.z, sx: .22 + height * .025, sy: height * .72, sz: .22 + height * .025 });
    for (let k = 0; k < 3; k++) {
      const phase = k * 2.4 + random(), scale = .72 + random() * .3;
      crowns.push({ x: p.x + Math.cos(phase) * width * .22, y: p.y + height * (.58 + k * .1),
        z: p.z + Math.sin(phase) * width * .24, sx: width * .58 * scale, sy: height * (.32 + random() * .13),
        sz: width * .52 * scale, ry: random() * tau, color: tint });
    }
    if (u < .25 && i % 9 === 0) flowers.push({ x: p.x, y: p.y + height * .82, z: p.z,
      sx: width * .48, sy: height * .24, sz: width * .47, color: config?.id === 'toyoko' ? 0xe9bacd : 0xe8d6bf });
  }
  const crownGeometry = keep(new THREE.IcosahedronGeometry(1, 1));
  instances(crownGeometry, keep(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 })), crowns, 'irregular-ridge-forest');
  instances(keep(new THREE.CylinderGeometry(1, 1.35, 1, 5)),
    keep(new THREE.MeshStandardMaterial({ color: 0x514a38, roughness: 1 })), trunks, 'forest-trunks');
  instances(crownGeometry, keep(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .95 })), flowers, 'portal-blossom-groves');
  return mountain;
}
