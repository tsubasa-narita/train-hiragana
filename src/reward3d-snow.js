import * as THREE from '../vendor/three/three.module.js';
import { detailSurface, sceneryDetailTexture } from './reward3d-surface.js';
import { CLOUD_RELIEF } from './reward3d-clouds.js';

const TRACK_START = -365;
const TRACK_END = 415;
const RAIL_TOP = .15;
const { clamp, lerp, smoothstep } = THREE.MathUtils;

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// The ploughed cut remains level. Only the far side rises into the foothills.
function snowHeight(x, z) {
  const verge = smoothstep(Math.abs(z), 1.35, 5.5);
  const ripples = .13 * Math.sin(x * .15 + z * .41) + .09 * Math.cos(x * .23 - z * .64);
  const rolls = .47 * Math.sin(x * .041 + z * .17) + .30 * Math.sin(x * .087 - z * .19);
  const hillside = smoothstep(z, 32, 145) * (7 + 3.5 * Math.sin(x * .024 + z * .031));
  return -.46 + verge * (ripples + rolls * smoothstep(z, 1, 15)) + hillside;
}

function gridGeometry(columns, rows, sample) {
  const positions = [], indices = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) positions.push(...sample(col, row));
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const a = row * (columns + 1) + col, b = a + columns + 1;
      if ((row + col) % 2) indices.push(a, b, a + 1, b, b + 1, a + 1);
      else indices.push(a, b, b + 1, a, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function colorGeometry(geometry, shade) {
  const { position, normal } = geometry.attributes;
  const colors = new Float32Array(position.count * 3), color = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    shade(color, position.getX(i), position.getY(i), position.getZ(i), normal.getY(i), normal.getZ(i));
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

// Extrude a counterclockwise y/z profile along x. Each face has an independent
// normal, and the long faces can map ballast grain in metres.
function profileGeometry(profile, length = 1, repeat = 1) {
  const positions = [], uvs = [], indices = [], colors = [];
  const color = new THREE.Color();
  for (let i = 0; i < profile.length; i++) {
    const [y, z, tint = 0xffffff] = profile[i];
    const [nextY, nextZ] = profile[(i + 1) % profile.length];
    const base = positions.length / 3;
    positions.push(-length / 2, y, z, -length / 2, nextY, nextZ,
      length / 2, nextY, nextZ, length / 2, y, z);
    const width = Math.hypot(nextY - y, nextZ - z) / repeat;
    uvs.push(0, 0, 0, width, length / repeat, width, length / repeat, 0);
    color.setHex(tint);
    for (let corner = 0; corner < 4; corner++) colors.push(color.r, color.g, color.b);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  for (const end of [-1, 1]) {
    const base = positions.length / 3;
    for (const [y, z] of profile) {
      positions.push(end * length / 2, y, z);
      uvs.push(y / repeat, z / repeat);
      colors.push(.45, .45, .45);
    }
    // The gable and ballast profiles are convex. The open rail ends are far
    // outside the travel window, so the concave rail profile needs no cap.
    if (profile.length <= 4) {
      for (let i = 1; i < profile.length - 1; i++) {
        if (end === 1) indices.push(base, base + i, base + i + 1);
        else indices.push(base, base + i + 1, base + i);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function ballastGrain() {
  const size = 64, data = new Uint8Array(size * size * 4), random = seededRandom(91833);
  for (let i = 0; i < size * size; i++) {
    const shade = 48 + 36 * random();
    data.set([shade, shade + 4, shade + 11, 255], i * 4);
  }
  for (let i = 0; i < 1050; i++) {
    const x = Math.floor(random() * size), y = Math.floor(random() * size);
    const length = 1 + Math.floor(random() * 3), shade = 76 + 62 * random();
    for (let dx = 0; dx < length; dx++) {
      const offset = (y * size + (x + dx) % size) * 4;
      data.set([shade, shade + 5, shade + 10, 255], offset);
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function coniferGeometry(sides, tiers, seed) {
  const random = seededRandom(seed), positions = [], colors = [], indices = [];
  const needle = new THREE.Color(0x233f3e), powder = new THREE.Color(0xcddcfa);
  const color = new THREE.Color();
  for (let tier = 0; tier < tiers; tier++) {
    const t = tier / (tiers - 1), start = positions.length / 3;
    const y = lerp(.19, .68, t), radius = lerp(1, .44, t), height = lerp(.46, .32, t);
    const twist = random() * 2, snow = Array.from({ length: sides }, () => random());
    const tips = Array.from({ length: sides }, () => random());
    const rings = [[0, .76], [.12, 1], [.39, .69], [.72, .34]];
    for (const [offset, width] of rings) {
      for (let i = 0; i < sides; i++) {
        const angle = (i + twist) / sides * Math.PI * 2;
        const jagged = sides > 8 && i % 2 === 0 && offset < .4;
        const r = radius * width * (.78 + tips[i] * .36 + (jagged ? .21 : 0));
        const droop = (tips[i] - .5) * .18 - (jagged ? .12 : 0);
        positions.push(Math.cos(angle) * r, y + height * (offset + droop), Math.sin(angle) * r);
        const coating = smoothstep(offset + snow[i] * .61, .35, .82) * lerp(.25, .97, snow[i]);
        color.copy(needle).lerp(powder, coating).multiplyScalar(.84 + tips[i] * .22);
        colors.push(color.r, color.g, color.b);
      }
    }
    const top = positions.length / 3;
    positions.push(0, y + height, 0);
    colors.push(powder.r * .8, powder.g * .8, powder.b * .8);
    for (let i = 0; i < sides; i++) {
      const next = (i + 1) % sides;
      // Lower boughs face back down under the tips, leaving a shaded skirt.
      for (let ring = 0; ring < rings.length - 1; ring++) {
        const a = start + ring * sides, b = a + sides;
        indices.push(a + i, b + i, a + next, a + next, b + i, b + next);
      }
      const last = start + (rings.length - 1) * sides;
      indices.push(last + i, top, last + next);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function ridgeGeometry({ peaks, center, front, back, rock, snow, haze, phase }, reduced) {
  const columns = reduced ? 96 : 176, rows = reduced ? 10 : 19;
  const random = seededRandom(17021 + phase);
  const geometry = gridGeometry(columns, rows, (col, row) => {
    const x = lerp(-1060, 660, col / columns) + (col > 0 && col < columns ? (random() - .5) * 7 : 0);
    const across = row / rows;
    const ridge = center + 16 * Math.sin(x * .012 + phase) + 9 * Math.cos(x * .029 - phase);
    const z = across < .5 ? lerp(front, ridge, across * 2) : lerp(ridge, back, across * 2 - 1);
    const foot = x + (ridge - z) * (.28 * Math.sin(phase + x * .005) - .12);
    let crest = 11 + 5 * Math.sin(foot * .031 + phase);
    for (const [summit, span, height] of peaks) {
      const shoulder = Math.max(0, 1 - Math.abs(foot - summit) / span);
      crest = Math.max(crest, height * Math.pow(shoulder, .78));
    }
    const ribs = Math.sin(foot * .18 + z * .068 + phase) * Math.cos(foot * .079 - z * .059);
    const profile = Math.pow(Math.sin(Math.PI * across), 1.48);
    const gullies = Math.sin(foot * .105 + phase + 1.28 * Math.sin(z * .035));
    const y = -12 + profile * (crest * (.92 + .11 * ribs + .052 * gullies) + 4 * random());
    return [x, y, z];
  });
  const rockColor = new THREE.Color(rock), snowColor = new THREE.Color(snow), hazeColor = new THREE.Color(haze);
  colorGeometry(geometry, (color, x, y, z, up, facing) => {
    const chute = .5 + .5 * Math.sin(x * .157 - z * .16 + Math.sin(z * .085 + phase));
    const coat = smoothstep(up * .74 + chute * .30 + y * .006, .54, 1.12);
    const planes = clamp(.94 - facing * .14 + Math.sin(x * .039 + z * .03) * .065, .74, 1.17);
    color.copy(rockColor).lerp(snowColor, coat).multiplyScalar(planes);
    color.lerp(hazeColor, (1 - smoothstep(y, -8, 57)) * .73);
  });
  return geometry;
}

export function createSnowWorld(scene, { config, reduced = false } = {}) {
  const gauge = config?.gauge || 1.067;
  const trackLength = TRACK_END - TRACK_START, trackCenter = (TRACK_START + TRACK_END) / 2;
  const group = new THREE.Group();
  group.name = 'snow-world';
  group.userData = { gauge, railTop: RAIL_TOP, trackStart: TRACK_START, trackEnd: TRACK_END };
  scene.add(group);

  const resources = new Set(), transform = new THREE.Object3D(), tint = new THREE.Color();
  const keep = resource => { resources.add(resource); return resource; };
  const standard = options => keep(new THREE.MeshStandardMaterial(options));
  const box = keep(new THREE.BoxGeometry());
  let disposed = false;

  function mesh(name, geometry, material) {
    const object = new THREE.Mesh(geometry, material);
    object.name = name;
    group.add(object);
    return object;
  }

  function batch(name, geometry, material, placements) {
    const object = keep(new THREE.InstancedMesh(geometry, material, placements.length));
    placements.forEach(({ x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, color }, index) => {
      transform.position.set(x, y, z);
      transform.scale.set(sx, sy, sz);
      transform.rotation.set(rx, ry, rz);
      transform.updateMatrix();
      object.setMatrixAt(index, transform.matrix);
      if (color !== undefined) object.setColorAt(index, tint.set(color));
    });
    object.name = name;
    object.instanceMatrix.needsUpdate = true;
    object.computeBoundingSphere();
    group.add(object);
    return object;
  }

  const skyMaterial = keep(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, toneMapped: false,
    uniforms: {
      horizon: { value: new THREE.Color(0x899abf) },
      zenith: { value: new THREE.Color(0x111f49) },
      twilight: { value: new THREE.Color(0xe4a7ac) },
      moonDirection: { value: new THREE.Vector3(-.92, .275, .47).normalize() },
    },
    vertexShader: `
      varying vec3 vDirection;
      void main() {
        vDirection = position;
        vec4 projected = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0);
        gl_Position = projected.xyww;
      }
    `,
    fragmentShader: `
      uniform vec3 horizon, zenith, twilight, moonDirection;
      varying vec3 vDirection;
      ${CLOUD_RELIEF}
      void main() {
        vec3 ray = normalize(vDirection);
        float elevation = max(0.0, ray.y);
        vec3 evening = normalize(vec3(.55, .17, .82));
        float west = pow(max(0.0, dot(ray, evening)), 4.0);
        vec3 color = mix(horizon, zenith, smoothstep(-0.035, 0.54, ray.y));
        color = mix(color, twilight, (.24 + west * .49) * exp(-6.3 * abs(ray.y - .065)));
        color = seasonalClouds(color, ray, vec2(9.3, 3.07), evening,
          vec3(.14, .17, .30), mix(vec3(.32, .40, .57), vec3(.81, .49, .50), west), .49);
        float lunar = length(ray - moonDirection);
        float disc = 1.0 - smoothstep(0.009, 0.0105, lunar);
        float halo = exp(-lunar * 38.0);
        color += vec3(0.22, 0.30, 0.53) * halo * smoothstep(0.0, 0.1, elevation);
        color = mix(color, vec3(0.88, 0.93, 1.0), disc);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
  }));
  const sky = mesh('blue-hour-sky', keep(new THREE.SphereGeometry(1, 28, 16)), skyMaterial);
  sky.frustumCulled = false;
  sky.renderOrder = -100;

  const groundRows = [-185, -100, -61, -42, -30, -20, -13, -8, -5, -3.1, -2.5, -1.8, 0,
    1.8, 2.5, 3.1, 4.6, 6, 8, 11, 15, 20, 26, 33, 42, 54, 68, 87, 110, 139, 175, 222, 286];
  const groundColumns = reduced ? 78 : 138;
  const ground = keep(gridGeometry(groundColumns, groundRows.length - 1, (col, row) => {
    const x = lerp(-490, 470, col / groundColumns), z = groundRows[row];
    return [x, snowHeight(x, z), z];
  }));
  const snowBlue = new THREE.Color(0x93accb), snowWhite = new THREE.Color(0xe2edfd);
  colorGeometry(ground, (color, x, y, z) => {
    const wind = .68 + .19 * Math.sin(x * .103 + z * .27) + .13 * Math.cos(x * .43 - z * .39);
    const roadDirt = .31 * (1 - smoothstep(Math.abs(z), 1.8, 4.6));
    const glenShade = .12 * smoothstep(z, 27, 90) * (1 - smoothstep(y, 2, 7));
    color.copy(snowBlue).lerp(snowWhite, clamp(wind - roadDirt - glenShade, 0, 1));
  });
  const detail = keep(sceneryDetailTexture());
  const snowSurface = detailSurface(standard({ vertexColors:true, roughness:.84 }), detail, {
    projection:[1,.13,0], scale:[20,11], strength:[.28,.22,.21], tint:0xc7ddfa
  });
  mesh('wind-sculpted-snowfield', ground, snowSurface).receiveShadow = true;

  const mountainMaterial = detailSurface(keep(new THREE.MeshBasicMaterial({ vertexColors:true, fog:false })),detail,{
    projection:[1,.37,1.25], scale:[78,46], strength:[.34,.32,.18], tint:0xbfcee3
  });
  const ridges = [
    { name: 'far-alpine-divide', center: 402, front: 249, back: 535, phase: 4,
      rock: 0x6378a2, snow: 0xa5b9dd, haze: 0x768db4,
      peaks: [[-914, 188, 133], [-750, 185, 164], [-648, 128, 126], [-521, 158, 190], [-420, 106, 146],
        [-288, 195, 175], [-149, 155, 192], [-38, 119, 143], [104, 163, 163], [241, 182, 148], [405, 173, 175]] },
    { name: 'glacier-ridge', center: 248, front: 138, back: 364, phase: 11,
      rock: 0x405a82, snow: 0xa7c0e5, haze: 0x6682a6,
      peaks: [[-870, 154, 105], [-684, 165, 127], [-574, 140, 87], [-457, 157, 120], [-318, 149, 84],
        [-190, 156, 118], [-96, 133, 104], [24, 126, 81], [146, 130, 116], [270, 149, 96], [433, 162, 122]] },
    { name: 'near-snow-ridge', center: 139, front: 64, back: 220, phase: 20,
      rock: 0x314767, snow: 0x8da6cc, haze: 0x506e93,
      peaks: [[-793, 151, 65], [-629, 127, 43], [-506, 137, 57], [-370, 157, 73], [-237, 127, 44],
        [-123, 121, 56], [-8, 98, 37], [75, 110, 49], [206, 149, 65], [322, 144, 57], [471, 128, 88]] },
  ];
  for (const ridge of ridges) mesh(ridge.name, keep(ridgeGeometry(ridge, reduced)), mountainMaterial);

  const ballastHalfWidth = Math.max(1.43, gauge / 2 + .76);
  const ballast = keep(profileGeometry([
    [-.61, -ballastHalfWidth - .47], [-.086, -ballastHalfWidth],
    [-.086, ballastHalfWidth], [-.61, ballastHalfWidth + .47],
  ], trackLength, 1.7));
  const ballastBed = mesh('exposed-gravel-bed', ballast, standard({ map: keep(ballastGrain()), roughness: 1 }));
  ballastBed.position.x = trackCenter;
  ballastBed.receiveShadow = true;

  const rail = keep(profileGeometry([
    [-.002, -.069, 0x788497], [.034, -.069, 0x656c7e], [.034, -.019, 0x8193ac],
    [.102, -.019, 0x9aa9b9], [.109, -.037, 0xa5b4ca], [RAIL_TOP, -.033, 0xf3f8ff],
    [RAIL_TOP, .033, 0xc0cde1], [.109, .037, 0x9aa9b9], [.102, .019, 0x8193ac],
    [.034, .019, 0x656c7e], [.034, .069, 0x788497], [-.002, .069, 0x50586a],
  ], trackLength));
  batch('steel-rail-profiles', rail, standard({ vertexColors: true, metalness: .63, roughness: .23,
    emissive: 0x607995, emissiveIntensity: .09, envMapIntensity: .75 }),
  [-gauge / 2, gauge / 2].map(z => ({ x: trackCenter, y: 0, z })));

  const sleepers = [], plates = [], masts = [], porcelain = [];
  const trackRandom = seededRandom(38119);
  const timber = [0x46505c, 0x4b4a52, 0x555561, 0x474554];
  for (let x = TRACK_START + .4; x < TRACK_END - .3; x += .71) {
    sleepers.push({ x, y: -.033, z: 0, sx: .237, sy: .104, sz: gauge + 1.17,
      color: timber[Math.floor(trackRandom() * timber.length)] });
    for (const z of [-gauge / 2, gauge / 2]) {
      plates.push({ x, y: .028, z, sx: .133, sy: .035, sz: .193 });
    }
  }
  batch('exposed-sleeper-timbers', box, standard({ roughness: .92 }), sleepers).receiveShadow = true;
  batch('rail-base-fasteners', box, standard({ color: 0x384557, roughness: .62, metalness: .48 }), plates);

  for (let x = TRACK_START + 19; x < TRACK_END; x += 47) {
    masts.push({ x, y: 2.98, z: 4.85, sx: .14, sy: 6.95, sz: .14 });
    masts.push({ x, y: 6.28, z: 2.37, sx: .07, sy: .09, sz: 5.15 });
    masts.push({ x, y: 5.72, z: 3.36, sx: .05, sy: .05, sz: 3.15, rx: -.36 });
    masts.push({ x, y: 5.94, z: 0, sx: .025, sy: .62, sz: .025 });
    porcelain.push({ x, y: 6.26, z: .45, sx: .16, sy: .17, sz: .16 });
  }
  for (const y of [5.61, 6.05]) masts.push({ x: trackCenter, y, z: 0, sx: trackLength, sy: .018, sz: .019 });
  batch('slender-far-side-catenary', box, standard({ color: 0x64778c, metalness: .35, roughness: .59 }), masts);
  batch('catenary-insulators', box, standard({ color: 0xa8bec8, roughness: .47 }), porcelain);

  // Snow fencing follows the cut behind the railway. Its timber is exposed
  // on the vertical faces, with a shallow layer of snow on top of each rail.
  const fencePosts=[],fenceSlats=[],fenceSnow=[];
  for(const [start,end,z] of [[-47,-20,7.3],[48,81,8.2],[137,169,9.5],[218,253,8.4]]){
    for(let x=start;x<=end-2.5;x+=2.5){
      const base=snowHeight(x,z);
      fencePosts.push({x,y:base+.76,z,sx:.13,sy:1.52,sz:.14});
      const next=snowHeight(x+2.5,z),slope=Math.atan2(next-base,2.5);
      for(const y of [.40,.78,1.17]){
        const rail={x:x+1.25,y:(base+next)/2+y,z:z-.069,sx:2.52,sy:.15,sz:.052,rz:slope};
        fenceSlats.push(rail);
        if(y===1.17)fenceSnow.push({...rail,y:rail.y+.092,sy:.046,sz:.074});
      }
    }
  }
  batch('wooden-snow-fences',box,standard({color:0x74605d,roughness:.93}),[...fencePosts,...fenceSlats]);
  batch('snow-caps-on-fences',box,standard({color:0xc7dcef,roughness:.89}),fenceSnow);

  const buildings = [
    [-171, 24, 5.3, 3.5, 4.1], [-154, 35, 7.2, 4.3, 5.1], [-132, 17, 5.6, 3.4, 4.1],
    [-113, 25, 9.1, 4.7, 6.2], [-97, 37, 5.1, 3.3, 4.6], [-78, 20, 6.8, 3.9, 5.5],
    [-45, 30, 6.4, 3.9, 5.3], [-27, 40, 7.6, 4.6, 5.2], [-6, 25, 6.3, 3.8, 5.5],
    [15, 36, 5.1, 3.3, 4.0], [39, 19, 7.4, 4.4, 5.6], [55, 30, 5.7, 3.3, 4.5],
    [84, 36, 6.3, 4.0, 5.1], [109, 47, 7.5, 4.7, 5.7], [120, 28, 5.1, 3.5, 4.1],
    [144, 34, 14.5, 6.5, 8.6], [168, 42, 8.3, 4.1, 6.6], [191, 22, 6.4, 3.7, 5.0],
    [232, 35, 6.5, 4.2, 5.7], [256, 27, 8.4, 4.5, 6.2], [-216, 47, 6.3, 3.6, 4.4],
    [-245, 27, 6.1, 3.3, 4.9], [-292, 35, 7.2, 4.1, 5.9], [304, 33, 8.3, 4.8, 5.8],
  ];
  const villageRandom = seededRandom(641509), range = (lo, hi) => lerp(lo, hi, villageRandom());
  for (let i = 0; i < (reduced ? 10 : 19); i++) {
    const x = -237 + i * (reduced ? 53 : 27) + range(-10, 10), z = range(61, 100);
    buildings.push([x, z, range(4.6, 8.2), range(2.8, 4.3), range(3.8, 5.6)]);
  }

  const walls = [], gables = [], roofPanels = [], plaster = [], details = [], frames = [], light = [];
  const amber = [0xffc071, 0xffd897, 0xffab52, 0xe98846, 0xffce86];
  const siding = [0x514b61, 0x695654, 0x696a7a, 0x794e49, 0x494b5b];
  const poolPositions = [], poolUVs = [], poolIndices = [];

  function lightPool(x, z, rx, rz) {
    const base = poolPositions.length / 3, steps = 4;
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const u = j / steps, v = i / steps;
        const px = x + (u * 2 - 1) * rx, pz = z + (v * 2 - 1) * rz;
        poolPositions.push(px, snowHeight(px, pz) + .12, pz);
        poolUVs.push(u, v);
        if (i < steps && j < steps) {
          const a = base + i * (steps + 1) + j, b = a + steps + 1;
          poolIndices.push(a, b, a + 1, a + 1, b, b + 1);
        }
      }
    }
  }

  function windowAt(x, y, z, width, height, color, side = false) {
    const ry = side ? Math.PI / 2 : Math.PI;
    const front = offset => ({ x: x + (side ? offset : 0), z: z - (side ? 0 : offset) });
    frames.push({ ...front(.028), y, sx: width + .16, sy: height + .17, ry, color: 0x302638 });
    light.push({ ...front(.043), y, sx: width, sy: height, ry, color });
    frames.push({ ...front(.062), y, sx: .065, sy: height, ry, color: 0x5c3b35 });
    frames.push({ ...front(.062), y: y - height * .06, sx: width, sy: .048, ry, color: 0x5c3b35 });
  }

  for (const [index, [x, z, width, height, depth]] of buildings.entries()) {
    const lodge = x === 144, y = snowHeight(x, z) - .14, eave = y + height;
    const rise = depth * (lodge ? .49 : range(.42, .58));
    const finish = siding[index % siding.length], roofRun = depth / 2 + .52;
    const slope = Math.atan2(rise, depth / 2), roofLength = roofRun / Math.cos(slope);
    const front = z - depth / 2;
    walls.push({ x, y: y + height / 2, z, sx: width, sy: height, sz: depth, color: finish });
    gables.push({ x, y: eave, z, sx: width, sy: rise, sz: depth, color: finish });
    plaster.push({ x, y: y + .24, z, sx: width + .16, sy: .54, sz: depth + .18, color: 0x929eaf });
    details.push({ x, y: eave - .25, z, sx: width + .15, sy: .18, sz: depth + .12, color: 0x403542 });
    details.push({ x: x + width * .30, y: eave + rise * .54, z: z + depth * .27,
      sx: .53, sy: 1.92, sz: .57, color: 0x685966 });
    for (const side of [-1, 1]) {
      const panelY = eave + rise - Math.tan(slope) * roofRun / 2;
      const panelZ = z + side * roofRun / 2;
      details.push({ x, y: panelY, z: panelZ, sx: width + 1.09,
        sy: .19, sz: roofLength, rx: side * slope, color: 0x34384d });
      roofPanels.push({ x, y: panelY + .165, z: panelZ, sx: width + 1.04,
        sy: .19, sz: roofLength * .976, rx: side * slope, color: index % 3 ? 0xe3edfd : 0xc6daf1 });
    }
    const bays = lodge ? 6 : width > 6.3 ? 3 : 2;
    const floors = lodge || height > 3.7 ? 2 : 1;
    for (let floor = 0; floor < floors; floor++) {
      for (let bay = 0; bay < bays; bay++) {
        const offset = (bay + .5) / bays - .5;
        const lit = lodge || (bay + floor + index) % 6 !== 0;
        const color = lit ? amber[(index + bay * 2 + floor) % amber.length] : 0x546288;
        windowAt(x + offset * width * .88, y + (floor ? height * .72 : height * .37), front - .02,
          lodge ? 1.04 : .66, lodge ? 1.23 : .86, color);
      }
      for (const offset of [-.26, .25]) {
        windowAt(x + width / 2 + .025, y + (floor ? height * .72 : height * .37), z + offset * depth,
          lodge ? .93 : .61, lodge ? 1.18 : .80, amber[(index + floor + 1) % amber.length], true);
      }
    }
    if (z < 50) lightPool(x, front - (lodge ? 2.8 : .9), width * .62, lodge ? 4.7 : 2.5);
  }

  // The clock tower marks the last village. Its two illuminated faces read
  // from the approaching three-quarter view and the closing side view.
  const towerX = 148.2, towerZ = 35.3, towerBase = snowHeight(towerX, towerZ);
  const clockY = towerBase + 11.6, towerFront = towerZ - 1.82;
  walls.push({ x: towerX, y: towerBase + 6.65, z: towerZ, sx: 3.64, sy: 13.4, sz: 3.64, color: 0x655468 });
  for (const lift of [9.9, 13.15]) {
    plaster.push({ x: towerX, y: towerBase + lift, z: towerZ, sx: 4.01, sy: .25, sz: 4.01, color: 0xc6c4c9 });
  }
  const clock = keep(new THREE.CircleGeometry(1, 24));
  const faces = [], outerFaces = [];
  for (const side of [false, true]) {
    const x = towerX + (side ? 1.85 : 0), z = side ? towerZ : towerFront - .03;
    const ry = side ? Math.PI / 2 : Math.PI;
    outerFaces.push({ x, y: clockY, z, ry, sx: 1.13, sy: 1.13 });
    faces.push({ x: x + (side ? .017 : 0), y: clockY, z: z - (side ? 0 : .017), ry, sx: .96, sy: .96 });
    for (let tick = 0; tick < 12; tick++) {
      const angle = tick * Math.PI / 6, across = Math.sin(angle) * .79;
      details.push({ x: x + (side ? .04 : -across), y: clockY + Math.cos(angle) * .79,
        z: z + (side ? -across : -.04), sx: .047, sy: tick % 3 === 0 ? .14 : .087, sz: .029,
        ry, rz: -angle, color: 0x533544 });
    }
    for (const [angle, length] of [[-.99, .64], [.73, .48]]) {
      const across = Math.sin(angle) * length * .43;
      details.push({ x: x + (side ? .055 : -across), y: clockY + Math.cos(angle) * length * .43,
        z: z + (side ? -across : -.055), sx: .07, sy: length, sz: .035, ry, rz: -angle, color: 0x492e3b });
    }
  }
  const clockTrim = keep(new THREE.MeshBasicMaterial({ color: 0x69415b }));
  batch('clock-bezels', clock, clockTrim, outerFaces);
  batch('amber-clock-faces', clock,
    keep(new THREE.MeshBasicMaterial({ color: 0xffda8e, toneMapped: false })), faces);

  const spire = mesh('clock-tower-steep-roof', keep(new THREE.ConeGeometry(3.15, 5.5, 4)),
    standard({ color: 0x5b6f92, roughness: .85 }));
  spire.position.set(towerX, towerBase + 15.88, towerZ);
  spire.rotation.y = Math.PI / 4;
  const spireSnow = mesh('clock-tower-roof-snow', keep(new THREE.ConeGeometry(2.69, 5.08, 4)),
    standard({ color: 0xd2e3f7, roughness: .88 }));
  spireSnow.position.set(towerX, towerBase + 16.42, towerZ);
  spireSnow.rotation.y = Math.PI / 4;
  details.push({ x: towerX, y: towerBase + 19.1, z: towerZ, sx: .12, sy: .67, sz: .12, color: 0x9d806e });

  const timberMaterial = standard({ roughness: .87 });
  const sidingMaterial = detailSurface(standard({ roughness:.92 }), detail, {
    projection:[1,.72,1.1], scale:[5.7,3.6], strength:[.15,.16,.17], tint:0xe4d9d1
  });
  const gable = keep(profileGeometry([[0, -.5], [1, 0], [0, .5]]));
  batch('alpine-houses-and-lodge', box, sidingMaterial, walls);
  batch('steep-timber-gables', gable, sidingMaterial, gables);
  batch('eaves-chimneys-and-clock-hands', box, timberMaterial, details);
  batch('capped-rooftops-and-stone-plinths', box, standard({ roughness: .89 }), [...roofPanels, ...plaster]);
  const windowFace = keep(new THREE.PlaneGeometry());
  batch('village-window-joinery', windowFace, timberMaterial, frames);
  batch('warm-village-windows', windowFace, keep(new THREE.MeshBasicMaterial({ toneMapped: false })), light);

  const poolGeometry = keep(new THREE.BufferGeometry());
  poolGeometry.setAttribute('position', new THREE.Float32BufferAttribute(poolPositions, 3));
  poolGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(poolUVs, 2));
  poolGeometry.setIndex(poolIndices);
  const poolMaterial = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        float fade = 1.0 - smoothstep(0.0, 0.5, length(vUv - 0.5));
        gl_FragColor = vec4(1.0, 0.51, 0.18, fade * fade * 0.21);
        #include <colorspace_fragment>
      }
    `,
  }));
  mesh('lantern-light-on-the-snow', poolGeometry, poolMaterial);

  const landscapeRandom = seededRandom(274331);
  const between = (min, max) => lerp(min, max, landscapeRandom());
  const denseTrees = [], distantTrees = [], trunks = [], drifts = [], rocks = [];
  for (let i = 0; i < (reduced ? 155 : 300); i++) {
    const band = Math.floor(i / 5), groveX = -324 + (band * 31) % 671;
    const groveZ = 8 + (band * 23) % 142;
    const x = groveX + between(-13, 13), z = Math.max(6, groveZ + between(-8, 11));
    if (z < 44 && x > 121 && x < 179) continue;
    if (buildings.some(([bx, bz, w, , d]) => Math.abs(x - bx) < w / 2 + 3.6 && Math.abs(z - bz) < d / 2 + 4.4)) continue;
    const height = between(3.5, z < 26 ? 8.8 : 12.7), radius = height * between(.15, .225);
    const y = snowHeight(x, z) - .25, lean = between(-.032, .032);
    const color = new THREE.Color().setRGB(between(.76, .97), between(.82, 1), between(.88, 1));
    const trees = z < 54 && !reduced ? denseTrees : distantTrees;
    trees.push({ x, y, z, sx: radius, sy: height, sz: radius * between(.85, 1.12),
      ry: between(0, Math.PI * 2), rz: lean, color });
    trunks.push({ x: x - height * lean * .13, y: y + height * .135, z,
      sx: radius * .15, sy: height * .31, sz: radius * .16, rz: lean });
  }
  for (let i = 0; i < (reduced ? 85 : 172); i++) {
    const x = between(-341, 376), z = i % 5 ? between(5.9, 88) : between(-26, -4.1);
    const sy = z > 0 ? between(.20, .72) : between(.10, .23), y = snowHeight(x, z) - sy * .51;
    drifts.push({ x, y, z, sx: between(.7, 3.1), sy, sz: between(.46, 1.28), ry: between(-.6, .6),
      color: i % 3 ? 0xe2efff : 0xb9cfea });
    if (i % 4 === 0 && z > 10) {
      rocks.push({ x: x + .3, y: y + sy * .52, z, sx: between(.31, .95), sy: sy * .75,
        sz: between(.29, .64), ry: between(0, 3), color: i % 8 ? 0x566b89 : 0x445671 });
    }
  }
  // Broken ploughed banks sit just beyond the ballast. Keep the camera side
  // low enough for the bogies and rails to remain visible in close-ups.
  for (let x = -165; x < 255; x += between(2.1, 5.2)) {
    for (const side of [-1, 1]) {
      const z = side * between(2.6, 3.5), sy = between(.10, side > 0 ? .33 : .20);
      drifts.push({ x: x + between(-.5, .5), y:snowHeight(x,z) - sy*.44, z,
        sx: between(.9,2.65), sy, sz: between(.32,.63), ry:between(-.08,.08),
        color:side > 0 ? 0xcdddf6 : 0xbecfe7 });
    }
  }
  const snowball = keep(new THREE.SphereGeometry(1, 8, 4));
  batch('low-wind-packed-drifts', snowball, standard({ roughness: .93 }), drifts);
  batch('granite-showing-through-snow', keep(new THREE.DodecahedronGeometry(1)), standard({ roughness: 1 }), rocks);
  batch('conifer-trunks', keep(new THREE.CylinderGeometry(.63,1,1,6)),
    standard({ color:0x514440, roughness:.97 }), trunks);
  const needles = detailSurface(standard({ vertexColors:true, roughness:.94 }),detail,{
    projection:[1,.73,1.1],scale:[3.5,4.2],strength:[.25,.37,.39],tint:0xc3d3dc
  });
  if (denseTrees.length) batch('near-snow-laden-firs', keep(coniferGeometry(14, 5, 6953)), needles, denseTrees);
  batch('far-snow-laden-firs', keep(coniferGeometry(6, 3, 20267)), needles, distantTrees);

  const snowfall = reduced ? null : createSnowfall(keep, mesh);

  return {
    group, sky,
    update(seconds, { headX = 0, train, moment } = {}) {
      if (disposed || !snowfall) return;
      snowfall.uniforms.seconds.value = seconds;
      snowfall.uniforms.headX.value = headX;
      snowfall.uniforms.noseX.value = headX + (train?.frontX ?? 10);
      snowfall.uniforms.speed.value = moment?.speed ?? 0;
      snowfall.uniforms.density.value = .76 + .24 * (moment?.reveal ?? 0);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      group.clear();
      for (const resource of resources) resource.dispose();
      resources.clear();
    },
  };
}

function createSnowfall(keep, mesh) {
  const random = seededRandom(79547), offsets = [], motions = [];
  const geometry = keep(new THREE.InstancedBufferGeometry());
  const ambientCount = 780, wakeCount = 168;
  for (let i = 0; i < ambientCount; i++) {
    offsets.push(random() * 180, random() * 21, -24 + random() * 79);
    motions.push(.025 + random() * .062, .64 + random() * .74, random() * Math.PI * 2);
  }
  // Loose snow from beside the first two cars shares the drifting-flake batch.
  for (let i = 0; i < wakeCount; i++) {
    offsets.push(6 + random() * 30, -1, (i % 2 ? 1 : -1) * (1.2 + random() * .63));
    motions.push(.13 + random() * .18, .70 + random() * .8, random());
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.setAttribute('flakeOffset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
  geometry.setAttribute('flakeMotion', new THREE.InstancedBufferAttribute(new Float32Array(motions), 3));
  geometry.instanceCount = ambientCount + wakeCount;

  const material = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { seconds: { value: 0 }, headX: { value: -26 }, noseX: { value: -16 },
      speed: { value: 0 }, density: { value: .76 } },
    vertexShader: `
      attribute vec3 flakeOffset, flakeMotion;
      uniform float seconds, headX, noseX, speed;
      varying vec2 vCorner;
      varying float vAlpha;
      void main() {
        vec3 world;
        vec2 size = vec2(.83, 1.09) * flakeMotion.x;
        if (flakeOffset.y < 0.0) {
          float age = fract(seconds * flakeMotion.y + flakeMotion.z);
          float moving = smoothstep(4.0, 21.0, speed);
          float lift = pow(age, .65) * moving;
          world = vec3(noseX - flakeOffset.x - age * speed * .47,
            -.03 + sin(age * 2.4) * flakeMotion.x * 2.6 * moving,
            flakeOffset.z + sign(flakeOffset.z) * lift * (1.4 + flakeMotion.y));
          vAlpha = moving * .43 * smoothstep(0.0, .15, age) * (1.0 - smoothstep(.25, 1.0, age));
          size *= mix(.42, 1.66, age) * vec2(1.65, .75);
        } else {
          float wind = sin(seconds * 1.65 + flakeMotion.z);
          float span = mod(flakeOffset.x + seconds * .65 + wind * .56 - headX, 180.0);
          float lift = mod(flakeOffset.y - seconds * flakeMotion.y, 21.0);
          world = vec3(headX - 123.0 + span, lift - .2, flakeOffset.z + wind * .52);
          vAlpha = smoothstep(0.0, 9.0, span) * (1.0 - smoothstep(170.0, 180.0, span));
          vAlpha *= smoothstep(0.0, 1.0, lift) * (1.0 - smoothstep(19.0, 21.0, lift));
        }
        vec4 view = modelViewMatrix * vec4(world, 1.0);
        float depth = -view.z;
        vAlpha *= smoothstep(2.4, 9.0, depth) * (1.0 - smoothstep(50.0, 100.0, depth));
        vCorner = position.xy;
        view.xy += position.xy * size;
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: `
      uniform float density;
      varying vec2 vCorner;
      varying float vAlpha;
      void main() {
        float opacity = 1.0 - smoothstep(0.09, 1.0, dot(vCorner, vCorner));
        gl_FragColor = vec4(0.77, 0.86, 1.0, opacity * vAlpha * density * 0.66);
        #include <colorspace_fragment>
      }
    `,
  }));
  const flakes = mesh('soft-drifting-snowflakes', geometry, material);
  flakes.frustumCulled = false;
  flakes.renderOrder = 10;
  return material;
}
