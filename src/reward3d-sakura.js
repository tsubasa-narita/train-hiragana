import * as THREE from '../vendor/three/three.module.js';
import { detailSurface, sceneryDetailTexture } from './reward3d-surface.js';
import { branchletGeometry, branchletMaterial, grassTuftGeometry } from './reward3d-vegetation.js';
import { CLOUD_RELIEF } from './reward3d-clouds.js';

const TRACK_START = -340;
const TRACK_END = 390;
const WATER_LEVEL = -3.65;
const RIVER_START = -230;
const RIVER_END = 305;
const { lerp, smoothstep, euclideanModulo } = THREE.MathUtils;
const TAU = Math.PI * 2;

function riverCenter(z) {
  return 72 - .52 * z + 18 * Math.sin(z / 38) - 64 * smoothstep(z, 12, 140);
}

function riverWidth(z) {
  return 12 + 3 * Math.cos(z * .035) + 2 * Math.sin(z * .048);
}

function bankDistance(x, z) {
  return Math.abs(x - riverCenter(z)) - riverWidth(z);
}

function groundHeight(x, z) {
  const bank = bankDistance(x, z);
  const terrace = -2.8 + 1.02 * Math.sin(x * .035 + z * .058)
    + .56 * Math.sin(z * .22 + x * .045) + .35 * Math.cos(x * .17 - z * .14);
  const meadow = terrace + 6 * smoothstep(z, 43, 125);
  const approach = (1 - smoothstep(Math.abs(z), 1.45, 8.5)) * smoothstep(bank, 4, 10);
  const bankHeight = lerp(WATER_LEVEL - 2.5, meadow, smoothstep(bank, -4, 7));
  return lerp(bankHeight, -.23, approach);
}

// An upward-facing grid shared by the valley floor, water and mountain slopes.
function surface(columns, rows, vertex, makeColor) {
  const positions = [], colors = [], uvs = [], indices = [];
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const u = column / columns, v = row / rows;
      const [x, y, z] = vertex(u, v);
      positions.push(x, y, z);
      uvs.push(u, v);
      if (makeColor) {
        const color = makeColor(x, y, z, u, v);
        colors.push(color.r, color.g, color.b);
      }
      if (row && column) {
        const d = row * (columns + 1) + column;
        const c = d - 1, b = d - columns - 1, a = b - 1;
        indices.push(a, c, b, b, c, d);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (makeColor) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function boxAt(x, y, z, sx, sy, sz, color) {
  return { x, y, z, sx, sy, sz, color };
}

// The unit box's long axis is x, including for sloped bridge members.
function beam(a, b, height, width, color) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const run = Math.hypot(dx, dz);
  return {
    ...boxAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2,
      Math.hypot(run, dy), height, width, color),
    ry: -Math.atan2(dz, dx), rz: Math.atan2(dy, run)
  };
}

export function createSakuraWorld(scene, { config, reduced = false } = {}) {
  const gauge = config?.gauge || 1.067;
  const group = new THREE.Group();
  group.name = 'sakura-river-valley';
  group.userData = { gauge, railTop: .15 };
  scene.add(group);

  const resources = new Set();
  const own = resource => { resources.add(resource); return resource; };
  const standard = options => own(new THREE.MeshStandardMaterial(options));
  const lambert = options => own(new THREE.MeshLambertMaterial(options));
  const box = own(new THREE.BoxGeometry(1, 1, 1));
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  const axis = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  let disposed = false;
  let seed = 418162;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const range = (min, max) => lerp(min, max, random());
  const pick = palette => palette[Math.floor(random() * palette.length)];

  function mesh(name, geometry, material) {
    const item = new THREE.Mesh(geometry, material);
    item.name = name;
    group.add(item);
    return item;
  }

  function instances(name, geometry, material, placement, { shadow = false, receive = true } = {}) {
    const item = own(new THREE.InstancedMesh(geometry, material, placement.length));
    item.name = name;
    item.castShadow = shadow && !reduced;
    item.receiveShadow = receive;
    for (let i = 0; i < placement.length; i++) {
      const t = placement[i];
      dummy.position.set(t.x, t.y, t.z);
      dummy.scale.set(t.sx, t.sy, t.sz);
      if (t.tip) {
        direction.set(t.tip[0] - t.x, t.tip[1] - t.y, t.tip[2] - t.z);
        dummy.quaternion.setFromUnitVectors(axis, direction.normalize());
      } else {
        // YXZ applies the elevation of a beam before turning it across the plan.
        dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0, 'YXZ');
      }
      dummy.updateMatrix();
      item.setMatrixAt(i, dummy.matrix);
      if (t.color !== undefined) item.setColorAt(i, tint.set(t.color));
    }
    group.add(item);
    return item;
  }

  function grain(size, dark, light) {
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      const level = Math.round(range(dark, light));
      data[i] = data[i + 1] = data[i + 2] = level;
      data[i + 3] = 255;
    }
    const map = own(new THREE.DataTexture(data, size, size));
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.magFilter = THREE.LinearFilter;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.generateMipmaps = true;
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }

  // Extra samples at the waterline and track shoulder keep both profiles crisp.
  const meadowGreen = new THREE.Color(0x9ca76c);
  const mossGreen = new THREE.Color(0x546f55);
  const dryGrass = new THREE.Color(0xc4b583);
  const petalLitter = new THREE.Color(0xd0a7a1);
  const gravel = new THREE.Color(0xaba390);
  const subsoil = new THREE.Color(0x766d55);
  const xSamples = 90, zSamples = 104;
  const trackShoulder = v => {
    const s = 2 * v - 1;
    return Math.sign(s) * (6 * Math.abs(s) + (s < 0 ? -RIVER_START - 6 : RIVER_END - 6) * Math.abs(s) ** 2);
  };
  const valley = own(surface(xSamples, zSamples, (u, v) => {
    const z = trackShoulder(v);
    const s = 2 * u - 1;
    const center = riverCenter(z);
    const extent = s < 0 ? center - TRACK_START : TRACK_END - center;
    const x = center + Math.sign(s) * (35 * Math.abs(s) + (extent - 35) * Math.abs(s) ** 2);
    return [x, groundHeight(x, z), z];
  }, (x, y, z) => {
    const patch = .48 + .26 * Math.sin(x * .118 + Math.sin(z * .094))
      + .21 * Math.cos(z * .144 - x * .072);
    const distance = bankDistance(x, z);
    const color = mossGreen.clone().lerp(meadowGreen, patch);
    // Broken bands follow the bank's contour and show up in the wide crossing shot.
    const drift = .5 + .5 * Math.sin(z * .14 + x * .046 + Math.sin(z * .27));
    const verge = 1 - smoothstep(Math.abs(distance - 8 - 4 * drift), 1, 9);
    color.lerp(dryGrass, .36 * smoothstep(patch, .45, .93) + .47 * verge);
    color.lerp(petalLitter, .65 * verge * smoothstep(drift, .32, .89));
    color.lerp(gravel, .85 * (1 - smoothstep(distance, 1, 6)));
    color.lerp(subsoil, .75 * (1 - smoothstep(Math.abs(z), 1.6, 5.5)) * smoothstep(distance, 5, 10));
    return color;
  }));
  const valleyPositions = valley.getAttribute('position'), valleyUv = valley.getAttribute('uv');
  for (let i = 0; i < valleyPositions.count; i++) {
    valleyUv.setXY(i, valleyPositions.getX(i) / 7, valleyPositions.getZ(i) / 7);
  }
  const detail = own(sceneryDetailTexture());
  const bankSurface = detailSurface(lambert({vertexColors:true, map:grain(64, 197, 255)}), detail, {
    projection:[1,.23,0], scale:[26,23], strength:[.40,.37,.34], tint:0xd6c4a5
  });
  mesh('grassy-terraces-and-gravel-shores', valley, bankSurface).receiveShadow = true;

  // Rail heads, webs and sleepers run continuously over the deck at the same datum.
  const trackLength = TRACK_END - TRACK_START, trackMid = (TRACK_END + TRACK_START) / 2;
  const bed = own(surface(1, 4, (u, v) => {
    const edges = [[-1.55, -.24], [-1.14, -.067], [0, -.058], [1.14, -.067], [1.55, -.24]];
    const [z, y] = edges[Math.round(v * 4)];
    return [lerp(TRACK_START, TRACK_END, u), y, z * Math.max(1, gauge / 1.15)];
  }));
  const grit = grain(64, 101, 235);
  grit.repeat.set(trackLength / 1.8, 2);
  mesh('ballast-shoulders', bed,
    standard({ color: 0xb2a794, map: grit, roughness: 1 })).receiveShadow = true;
  const heads = [], trackSteel = [], sleepers = [], clips = [];
  for (const z of [-gauge / 2, gauge / 2]) {
    heads.push(boxAt(trackMid, .125, z, trackLength, .05, .067));
    trackSteel.push(boxAt(trackMid, .02, z, trackLength, .101, .027, 0x534337));
    trackSteel.push(boxAt(trackMid, .063, z, trackLength, .025, .084, 0x6a5243));
  }
  for (let x = TRACK_START + .32; x < TRACK_END; x += .65) {
    sleepers.push(boxAt(x, -.026, 0, .23, .075, Math.max(1.98, gauge + .82),
      pick([0x7d776c, 0x948d7f, 0x9f9382, 0x868279])));
    if (x > -85 && x < 222) {
      for (const z of [-gauge / 2, gauge / 2]) {
        clips.push(boxAt(x, .018, z, .117, .032, .185));
      }
    }
  }
  instances('railheads-top-015', box, standard({
    color: 0xd7dce0, metalness: .75, roughness: .27, emissive: 0x222a32, emissiveIntensity: .18
  }), heads);
  instances('rail-webs-and-feet', box, standard({ metalness: .39, roughness: .63 }), trackSteel);
  const clipProfile = own(surface(1, 2, (u, v) => [u - .5, v === .5 ? .5 : -.5, v - .5]));
  instances('rail-fasteners', clipProfile, standard({ color: 0x564e45, metalness: .35, roughness: .69 }), clips);
  instances('sleepers', box, standard({ roughness: .96 }), sleepers);

  // The oxide-red railway deck spans the broad channel below the train.
  const crossingStart = 47, crossingEnd = 97;
  const bridgeWidth = Math.max(3.8, gauge + 2.55);
  const bridgeLength = crossingEnd - crossingStart;
  const bridgeMid = (crossingStart + crossingEnd) / 2;
  const iron = [boxAt(bridgeMid, -.39, 0, bridgeLength, .39, bridgeWidth, 0x473d3a)];
  const masonry = [], catenary = [], wire = [];
  const girderZ = bridgeWidth * .47;
  for (const z of [-girderZ, girderZ]) {
    iron.push(boxAt(bridgeMid, -.92, z, bridgeLength, 1.04, .16, 0x864635));
    iron.push(boxAt(bridgeMid, -.44, z, bridgeLength, .12, .33, 0xad5e44));
    iron.push(boxAt(bridgeMid, -1.48, z, bridgeLength, .15, .33, 0x633f3b));
    for (let x = crossingStart + .6; x < crossingEnd; x += 1.4) {
      iron.push(boxAt(x, -.98, z, .115, 1, .31, 0x9b543e));
    }
  }
  for (const x of [crossingStart + 1, crossingEnd - 1]) {
    masonry.push(boxAt(x, -3.02, 0, 4.5, 5.28, 5.7, 0x9b9385));
    masonry.push(boxAt(x, -1.32, 0, 4.9, .41, 6.1, 0xc6b9a4));
    for (const z of [-2.87, 2.87]) {
      for (let i = 0; i < 5; i++) {
        masonry.push(boxAt(x, -1.69 - i * .55, z, 4.51, .075, .045, 0x77776c));
      }
    }
  }
  // A narrow central cutwater leaves two open spans.
  masonry.push(boxAt(bridgeMid, -3.77, 0, 1.32, 4.65, 3.4, 0xaca99b));
  masonry.push(boxAt(bridgeMid, -1.56, 0, 1.94, .42, 4.18, 0xc4b8a9));
  for (const z of [-1.92, 1.92]) {
    masonry.push({ ...boxAt(bridgeMid, -3.94, z, .93, 4.22, .93, 0x9f9d94), ry: Math.PI / 4 });
  }
  instances('oxide-red-deck-girders', box, standard({ roughness: .59, metalness: .26 }), iron);
  instances('stone-abutments-and-cutwater', box, standard({ roughness: .94 }), masonry);

  function mast(x, z, base) {
    catenary.push(boxAt(x, (6.15 + base) / 2, z, .125, 6.15 - base, .125, 0x657471));
    catenary.push(beam([x, 6, z], [x, 6, -.27], .072, .085, 0x75817b));
    catenary.push(beam([x, 4.82, z], [x, 6, .43], .053, .064, 0x657471));
    catenary.push(boxAt(x, 5.8, 0, .11, .38, .11, 0x949b94));
  }
  for (let x = TRACK_START + 14; x < TRACK_END; x += 43) {
    if (x > crossingStart - 7 && x < crossingEnd + 7) continue;
    mast(x, 3.1, groundHeight(x, 3.1) - .22);
  }
  mast(bridgeMid, girderZ, -.4);
  wire.push(boxAt(trackMid, 5.61, 0, trackLength, .017, .018, 0x464d48));
  instances('far-side-railway-masts', box, standard({ roughness: .55, metalness: .35 }), catenary);
  instances('contact-wire', box, standard({ roughness: .6, metalness: .36 }), wire);

  const waterGeometry = own(surface(1, 180, (u, v) => {
    const z = lerp(RIVER_START, RIVER_END, v);
    return [riverCenter(z) + (2 * u - 1) * (riverWidth(z) + 5), WATER_LEVEL, z];
  }));
  const waterMaterial = own(new THREE.ShaderMaterial({
    fog: true,
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      time: { value: 0 },
      deep: { value: new THREE.Color(0x326c73) },
      shoal: { value: new THREE.Color(0x70a79b) },
      skyTint: { value: new THREE.Color(0xd0e6e8) },
      blossomTint: { value: new THREE.Color(0xe6b4c4) },
      glint: { value: new THREE.Color(0xffefd2) }
    },
    vertexShader: `
      varying vec3 waterPosition;
      varying float across;
      #include <fog_pars_vertex>
      void main() {
        waterPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        across = uv.x;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 deep, shoal, skyTint, blossomTint, glint;
      varying vec3 waterPosition;
      varying float across;
      #include <fog_pars_fragment>
      void main() {
        vec2 p = waterPosition.xz;
        float shortWave = p.y * 6.7 - p.x * .74 - time * 3.2;
        float bend = sin(p.x * .19 + p.y * .12) + .58 * sin(p.y * .53 - p.x * .08);
        float current = p.y * 2.6 + p.x * .44 - time * 2.1 + 2.1 * bend;
        float crossWave = p.x * 1.9 + p.y * 2.1 + time * 1.25 + 1.7 * sin(p.y * .37);
        float wave = .57 * sin(current) + .28 * sin(crossWave)
          + .40 * sin(shortWave + bend) * (1.0 - smoothstep(.8, 2.7, fwidth(shortWave)));
        float band = sin(p.x * .22 + p.y * .105 + sin(p.y * .07) * 2.4);
        float edge = smoothstep(.17, .40, abs(across - .5));
        vec3 normal = normalize(vec3(.037 * cos(p.x + p.y), 1.0, wave * .047));
        vec3 towardEye = normalize(cameraPosition - waterPosition);
        float fresnel = pow(1.0 - max(dot(normal, towardEye), 0.0), 3.6);
        vec3 reflected = mix(skyTint, blossomTint, edge * (.38 + .31 * band));
        float shallows = edge * smoothstep(-.7, .75, sin(p.y*.40 + p.x*.19) + .34 * sin(p.x*.66 - p.y*.27));
        vec3 color = mix(deep, shoal, edge * .65 + wave * .035 + .09 * band + .14 * shallows);
        color = mix(color, reflected, fresnel * .55);
        float crest = smoothstep(.73, 1.17, wave) * smoothstep(.22, .87, band);
        color += glint * crest * (.028 + .09 * fresnel + .115 * shallows);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `
  }));
  mesh('flowing-water-and-canopy-colors', waterGeometry, waterMaterial);

  // A vermilion footbridge curves over the river beyond the steel crossing.
  const footZ = 39;
  const footX = riverCenter(footZ), footSpan = 2 * (riverWidth(footZ) + 6);
  const footXAt = u => footX + (u - .5) * footSpan;
  const landing = u => Math.max(WATER_LEVEL + .1, groundHeight(footXAt(u), footZ) + .03);
  const landingStart = landing(0), landingEnd = landing(1);
  const walkY = u => lerp(landingStart, landingEnd, u) + 2.58 * 4 * u * (1 - u);
  const redwork = [], boards = [], footings = [];
  for (let i = 0; i < 32; i++) {
    const u0 = i / 32, u1 = (i + 1) / 32;
    const x0 = footXAt(u0), x1 = footXAt(u1);
    boards.push(beam([x0, walkY(u0), footZ], [x1, walkY(u1), footZ], .108, 1.52,
      pick([0x765040, 0x846348, 0x6b4e3f])));
    for (const z of [footZ - .79, footZ + .79]) {
      for (const height of [-.13, .45, .94]) {
        redwork.push(beam([x0, walkY(u0) + height, z], [x1, walkY(u1) + height, z],
          height < 0 ? .24 : .075, height < 0 ? .13 : .087));
      }
      if (i % 2 === 0) redwork.push(boxAt(x0, walkY(u0) + .43, z, .093, 1.13, .096));
    }
  }
  for (const u of [.02, .98]) {
    footings.push(boxAt(footXAt(u), walkY(u) - .83, footZ, 1.9, 1.48, 2.2, 0x9e9b89));
    for (const z of [footZ - .79, footZ + .79]) {
      redwork.push(boxAt(footXAt(u), walkY(u) + .43, z, .15, 1.18, .14));
    }
  }
  for (const u of [.26, .74]) {
    for (const z of [footZ - .57, footZ + .57]) {
      redwork.push(boxAt(footXAt(u), (walkY(u) - 5.6) / 2, z, .17, walkY(u) + 5.6, .18));
    }
  }
  instances('arched-vermilion-footbridge', box, standard({ color: 0xac4934, roughness: .7 }), redwork);
  instances('footbridge-deck-boards', box, standard({ roughness: .94 }), boards);
  instances('footbridge-stone-landings', box, standard({ roughness: .94 }), footings);

  // A riverside rest shelter sits by the far landing. Its roof is made of
  // separate slopes and a tiled ridge, leaving the blossom canopy visible.
  const shelterX=footXAt(.98)+5.5,shelterZ=footZ+2.6;
  const shelterY=groundHeight(shelterX,shelterZ);
  const shelterWood=[],shelterTiles=[],shelterStone=[];
  for(const dx of [-2.25,2.25])for(const dz of [-1.47,1.47]){
    shelterWood.push(boxAt(shelterX+dx,shelterY+1.24,shelterZ+dz,.169,2.51,.169,0x8f543b));
    shelterStone.push(boxAt(shelterX+dx,shelterY+.067,shelterZ+dz,.38,.27,.38,0x978b72));
  }
  for(const dz of [-1.47,1.47])shelterWood.push(boxAt(shelterX,shelterY+2.48,shelterZ+dz,5.43,.21,.23,0x744938));
  shelterWood.push(boxAt(shelterX,shelterY+.49,shelterZ+1.04,4.32,.12,.55,0x95684c));
  for(const side of [-1,1]){
    const rot=side*.40;
    shelterTiles.push({...boxAt(shelterX,shelterY+2.90,shelterZ+side*.99,5.9,.18,2.25,0x526c69),rx:rot});
    for(let i=-11;i<=11;i++)
      shelterTiles.push({...boxAt(shelterX+i*.253,shelterY+3.0,shelterZ+side*.99,.072,.10,2.2,0x617c74),rx:rot});
  }
  shelterTiles.push(boxAt(shelterX,shelterY+3.40,shelterZ,6,.225,.29,0x526963));
  instances('river-shelter-carpentry',box,standard({roughness:.82}),[...shelterWood,...shelterStone]);
  instances('river-shelter-roof-tiles',box,standard({roughness:.73}),shelterTiles);

  const stoneGeometry = own(new THREE.IcosahedronGeometry(1, 1));
  const shoreStones = [];
  for (let i = 0; i < (reduced ? 140 : 255); i++) {
    const z = range(-38, 154);
    const side = random() < .47 ? -1 : 1;
    const x = riverCenter(z) + side * (riverWidth(z) + range(2.8, 8.8));
    if (Math.abs(z) < 3.5 || Math.abs(z - footZ) < 1.5) continue;
    const y = Math.max(WATER_LEVEL - .1, groundHeight(x, z));
    const radius = range(.17, .74);
    shoreStones.push({
      ...boxAt(x, y, z, radius * range(1, 1.65), radius * range(.48, .91), radius,
        pick([0x9eab9d, 0xa49c86, 0x747f7a, 0x8b8980, 0xb3ad9a])),
      ry: range(0, TAU)
    });
  }
  instances('riverbank-stones', stoneGeometry, standard({ roughness: .97 }), shoreStones);

  // A brighter low grove frames the start, a gap opens onto the river,
  // and the line enters a deeper blossom avenue at the finish.
  const bark = [], crowns = [], shadeCrowns = [], blossomTips = [], distantCrowns = [], meadowTufts = [];
  const pinks = [0xf7c4d1, 0xf0adbf, 0xfbe0db, 0xe7aabe, 0xf6cfd3];
  const tips = [0xffe5df, 0xffcedc, 0xfff2e8, 0xf5c5cf, 0xfce0dd];
  const distantPinks = [0xc897ad, 0xd4a4b6, 0xddadba, 0xb995ab, 0xe0b1bd];
  const greens = [0x53734e, 0x6f8c59, 0x85a367, 0x5f835a, 0x8f9e68];
  const woods = [0x59423e, 0x725850, 0x5b5146, 0x816558];

  function branch(a, b, width, color) {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    bark.push({ ...boxAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2,
      width, length, width, color), tip: b });
  }

  function nearTree(x, z, h) {
    const y = groundHeight(x, z) - .12;
    const leanX = range(-.56, .56), leanZ = range(-.4, .56);
    const fork = [x + leanX, y + .38 * h, z + leanZ];
    const color = pick(woods);
    const rotation = range(0, TAU);
    branch([x, y, z], fork, h * .05, color);
    branch(fork, [x + leanX * 1.8, y + .8 * h, z + leanZ * 1.8], h * .028, color);
    const top = z < 14 && x > -92 && x < 218 ? shadeCrowns : crowns;
    top.push(boxAt(fork[0], y + .90 * h, fork[2], h * .28, h * .17, h * .23, pick(pinks)));
    for (let i = 0; i < 4; i++) {
      const angle = rotation + i * TAU / 4 + range(-.29, .29);
      const reach = h * range(.34, .55);
      const bx = fork[0] + Math.cos(angle) * reach;
      const bz = fork[2] + Math.sin(angle) * reach;
      const by = y + h * range(.63, .91);
      const elbow = [lerp(fork[0], bx, .52), by - h * .21, lerp(fork[2], bz, .52)];
      branch(fork, elbow, h * .028, color);
      branch(elbow, [bx, by, bz], h * .016, color);
      const upperTwig = [elbow[0] - Math.sin(angle) * .12 * h, by + .08 * h, elbow[2] + Math.cos(angle) * .12 * h];
      branch(elbow, upperTwig, h * .012, color);
      blossomTips.push(boxAt(...upperTwig, .15*h, .11*h, .16*h, pick(tips)));
      crowns.push({
        ...boxAt(bx, by, bz, h * range(.23, .31), h * range(.105, .17), h * range(.19, .26), pick(pinks)),
        ry: angle
      });
      for (let j = 0; j < (reduced ? 2 : 4); j++) {
        const azimuth = angle + range(-1.2, 1.2);
        const offset = h * range(.11, .25);
        const bud = h * range(.079, .143);
        blossomTips.push({
          ...boxAt(bx + offset * Math.cos(azimuth), by + h * range(-.085, .18), bz + offset * Math.sin(azimuth),
            bud * 1.29, bud * .85, bud, pick(tips)),
          ry: azimuth, rz: range(-.5, .5)
        });
      }
    }
  }

  function grove(from, to, stride, nearZ, farZ, minH, maxH) {
    for (let origin = from; origin < to; origin += stride) {
      const x = origin + range(-stride * .35, stride * .35), z = range(nearZ, farZ);
      if (bankDistance(x, z) > 6) nearTree(x, z, range(minH, maxH));
    }
  }
  grove(-166, 35, reduced ? 8.9 : 6.6, 7.1, 13.8, 3.7, 6.6);
  grove(-120, 39, reduced ? 11.5 : 8.7, 16, 27, 4.7, 7.6);
  grove(107, 275, reduced ? 10 : 6.5, 7.2, 13.1, 4.3, 6.9);
  grove(96, 295, reduced ? 13 : 9.7, 16, 28, 4.7, 7.5);
  nearTree(-36, 7.6, 7.1);
  nearTree(-58, 10.9, 6.6);
  nearTree(31, 15.4, 6.2);
  nearTree(100, 9.4, 5.4);
  nearTree(167, 7.6, 7.4);
  nearTree(188, 8.9, 6.3);

  for (let i = 0; i < (reduced ? 39 : 56); i++) {
    const centerX = range(-310, 353), centerZ = range(25, 124);
    const palette = random() < .76 ? distantPinks : greens;
    for (let j = 0; j < (reduced ? 3 : 4); j++) {
      const x = centerX + range(-8.5, 8.5), z = centerZ + range(-4.8, 4.8);
      if (bankDistance(x, z) < 9.5 || (Math.abs(z - footZ) < 5 && Math.abs(x - footX) < 31)) continue;
      const h = range(2.15, 5.4), y = groundHeight(x, z), lean = range(-.36, .36);
      const color = pick(palette);
      const crownX = x + lean;
      branch([x, y - .38, z], [crownX, y + h * .79, z], h * .036, pick(woods));
      distantCrowns.push({
        ...boxAt(crownX, y + h * .78, z, h * range(.32, .48), h * range(.23, .35), h * range(.29, .40), color),
        ry: range(0, TAU), rz: range(-.24, .24)
      });
      if (j % 3 === 0) {
        distantCrowns.push(boxAt(crownX + h * .23, y + h * .69, z - h * .13,
          h * .31, h * .22, h * .28, pick(palette)));
      }
    }
  }

  const crownGeometry = own(new THREE.IcosahedronGeometry(1, 1));
  const crownVertices = crownGeometry.getAttribute('position'), crownColors = [];
  for (let i = 0; i < crownVertices.count; i++) {
    const x = crownVertices.getX(i), y = crownVertices.getY(i), z = crownVertices.getZ(i);
    const ripple = Math.sin(x * 12 + y * 5) * Math.cos(z * 10 - y * 9);
    const scale = 1 + .14 * ripple + .095 * Math.sin(z * 7 + x * 4);
    crownVertices.setXYZ(i, x * scale, y * scale, z * scale);
    const shade = .85 + .10 * y + .07 * ripple;
    crownColors.push(shade, shade * (.965 + y * .03), shade);
  }
  crownGeometry.setAttribute('color', new THREE.Float32BufferAttribute(crownColors, 3));
  // A small tile of overlapping florets resolves into soft clumps when the
  // camera pulls back. Mipmaps keep distant banks of blossom steady in motion.
  const blossomTile = document.createElement('canvas');
  blossomTile.width = blossomTile.height = 128;
  const paint = blossomTile.getContext('2d');
  paint.fillStyle = '#ead8de';
  paint.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 110; i++) {
    const x = range(0, 128), y = range(0, 128), radius = range(1.7, 4.6);
    const phase = range(0, TAU);
    paint.fillStyle = pick(['#fff6eb', '#faeaf0', '#fff3f3', '#d5bbc6']);
    for (let j = 0; j < 5; j++) {
      const angle = phase + j * TAU / 5;
      const px = x + Math.cos(angle) * radius * .65;
      const py = y + Math.sin(angle) * radius * .65;
      paint.beginPath();
      paint.arc(px, py, radius * .55, 0, TAU);
      paint.fill();
    }
  }
  const blossomGrain = own(new THREE.CanvasTexture(blossomTile));
  blossomGrain.colorSpace = THREE.SRGBColorSpace;
  const blossomMaterial = lambert({ vertexColors: true, map: blossomGrain, emissive: 0x542536, emissiveIntensity: .12 });
  const cherryBark = detailSurface(standard({roughness:.96}),detail,{
    projection:[1,.74,.55],scale:[.85,1.3],strength:[.28,.36,.45],tint:0xbba49a
  });
  instances('forked-cherry-trunks', own(new THREE.CylinderGeometry(.57, 1, 1, 6, 1, true)), cherryBark, bark);
  const showsSprigs = lobe => !reduced && lobe.z <= 85 && distantPinks.includes(lobe.color);
  if (!reduced) {
    const sprigs=[];
    for(const lobe of [...crowns,...shadeCrowns]){
      if(lobe.x < -150||lobe.x > 254)continue;
      sprigs.push({...lobe,sx:lobe.sx*1.13,sy:lobe.sy*1.11,sz:lobe.sz*1.15,color:0xffe1dc});
      lobe.sx*=.49;lobe.sy*=.59;lobe.sz*=.51;
    }
    const flowerMaterial=branchletMaterial(own,true);
    const smallSprig=own(branchletGeometry(false));
    const distantSprigs=distantCrowns.filter(showsSprigs).map(lobe=>({...lobe,sy:lobe.sy*.86}));
    instances('individual-cherry-flowers',own(branchletGeometry()),flowerMaterial,sprigs);
    instances('blossom-tips',smallSprig,flowerMaterial,blossomTips);
    instances('distant-cherry-sprigs',smallSprig,flowerMaterial,distantSprigs);
  }else{
    instances('bright-blossom-clusters',crownGeometry,blossomMaterial,blossomTips);
  }
  instances('layered-cherry-canopies', crownGeometry, blossomMaterial, crowns);
  instances('shadow-casting-cherry-canopies', crownGeometry, blossomMaterial, shadeCrowns, { shadow: true });
  const hillsideCanopy=own(new THREE.SphereGeometry(1,7,4));
  instances('distant-hillside-groves',hillsideCanopy,lambert({}),distantCrowns.filter(lobe=>!showsSprigs(lobe)));

  const blade = own(grassTuftGeometry());
  for (let i = 0; i < (reduced ? 330 : 770); i++) {
    const x = range(-132, 245);
    const z = i % 5 === 0 ? range(-15, -2.1) : range(2.45, 44);
    if (bankDistance(x, z) < 4.8) continue;
    const height = range(.22, .72);
    meadowTufts.push({ ...boxAt(x, groundHeight(x, z) - .04, z, height, height, height, pick(greens)), ry: range(0, TAU) });
  }
  instances('spring-grass-and-river-reeds', blade, lambert({ side: THREE.DoubleSide, vertexColors:true }), meadowTufts);

  // Separate ridges curve across the background so the peaks shift by depth.
  const ridges = [
    { z: 112, wrap: 95, width: 125, height: 38, seed: 17, base: 0x64887e, peak: 0x547e79 },
    { z: 206, wrap: 161, width: 187, height: 66, seed: 31, base: 0x7e9ba5, peak: 0x68839a },
    { z: 381, wrap: 233, width: 250, height: 112, seed: 59, base: 0xa4b9cb, peak: 0x8198b5 }
  ];
  for (const [index, ridge] of ridges.entries()) {
    const footColor = new THREE.Color(ridge.base), topColor = new THREE.Color(ridge.peak);
    const rock = new THREE.Color(0xb9c8d7);
    const geometry = own(surface(96, 14, (u, v) => {
      const x = lerp(-850, 580, u);
      const centerZ = ridge.z - ridge.wrap * (1 - smoothstep(x, -720, -240));
      const z = centerZ + (v - .37) * ridge.width + 14 * Math.sin(x * .016 + ridge.seed);
      const summit = .46 + .21 * Math.sin(x * .013 + ridge.seed)
        + .17 * Math.sin(x * .027 - ridge.seed) + .094 * Math.cos(x * .071 + ridge.seed);
      const slope = Math.sin(Math.PI * v) ** 1.65;
      const folds = slope * Math.sin(v * 18 + x * .054 + index) * ridge.height * .025;
      const valleyCut = index === 0 ? smoothstep(bankDistance(x, z), 7, 35) : 1;
      const y = -9 + (ridge.height * Math.max(.16, summit) * slope + folds) * valleyCut;
      return [x, y, z];
    }, (x, y, z, u, v) => {
      const facet = .17 + .13 * Math.sin(x * .11 + z * .06);
      const high = smoothstep(y, 2, ridge.height * .64);
      const color = footColor.clone().lerp(topColor, high).multiplyScalar(1 - facet * high);
      if (index === 2) {
        const snow = smoothstep(y + 5 * Math.sin(x * .061), 65, 87) * smoothstep(v, .17, .48);
        color.lerp(rock, .81 * snow);
      }
      return color;
    }));
    const finish = detailSurface(own(new THREE.MeshBasicMaterial({ vertexColors:true })), detail, {
      projection:[1,.34,1.15], scale:[102,58], strength:[.35,.19,.13], tint:0xaabcca
    });
    mesh(`mountain-ridge-${index + 1}`, geometry, finish);
  }

  // This dome is the camera-centred sky interface used by the reward director.
  const skyMaterial = own(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      horizon: { value: new THREE.Color(0xf2e8e6) },
      zenith: { value: new THREE.Color(0x5a9cdd) },
      time: { value: 0 },
    },
    vertexShader: `
      varying vec3 skyDirection;
      void main() {
        skyDirection = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 horizon, zenith;
      uniform float time;
      varying vec3 skyDirection;
      ${CLOUD_RELIEF}
      void main() {
        vec3 d = normalize(skyDirection);
        float height = smoothstep(-.042, .54, d.y);
        vec3 color = mix(horizon, zenith, pow(height, .42));
        vec3 sunDirection = normalize(vec3(.47, .70, -.39));
        float warmth = pow(max(0.0, dot(d, sunDirection)), 8.0);
        color += vec3(.16, .069, .031) * warmth;
        color = seasonalClouds(color, d, vec2(1.8 + time * .003, 8.5), sunDirection,
          vec3(.49, .57, .70), vec3(1.25, 1.11, .98), .46);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  }));
  const sky = mesh('spring-sky', own(new THREE.SphereGeometry(940, 28, 14)), skyMaterial);
  sky.renderOrder = -10;
  sky.frustumCulled = false;

  const petalGeometry = own(new THREE.BufferGeometry());
  petalGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, .13, -.22, .29, 0, -.34, .69, -.08, -.21, .96, 0,
    0, .85, .1, .21, .96, 0, .34, .69, -.08, .22, .29, 0, 0, .53, .18
  ], 3));
  petalGeometry.setIndex([0, 8, 1, 1, 8, 2, 2, 8, 3, 3, 8, 4, 4, 8, 5, 5, 8, 6, 6, 8, 7, 7, 8, 0]);
  petalGeometry.computeVertexNormals();
  const petalMaterial = lambert({ side: THREE.DoubleSide, emissive: 0x9b526a, emissiveIntensity: .23 });
  const petalCount = reduced ? 60 : 176;
  const petals = own(new THREE.InstancedMesh(petalGeometry, petalMaterial, petalCount));
  petals.name = 'drifting-sakura-petals';
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  petals.frustumCulled = false;
  group.add(petals);
  const petalData = Array.from({ length: petalCount }, (_, i) => {
    petals.setColorAt(i, tint.set(pick(tips)));
    return {
      x: range(-210, 250), z: range(2.8, 34), height: range(0, 8.8),
      drift: range(.38, 1.18), fall: range(.32, .84), phase: range(0, TAU), size: range(.074, .19)
    };
  });

  function update(seconds, { headX = -26, moment } = {}) {
    if (disposed) return;
    const time = Number.isFinite(seconds) ? seconds : 0;
    const anchor = Number.isFinite(headX) ? headX : -26;
    const reveal = moment?.reveal ?? 0;
    waterMaterial.uniforms.time.value = reduced ? time * .45 : time;
    skyMaterial.uniforms.time.value = reduced ? 0 : time;
    for (let i = 0; i < petalData.length; i++) {
      const p = petalData[i];
      const flutter = time * p.drift + p.phase;
      const x = euclideanModulo(p.x + time * p.drift - anchor + 76, 106) - 76;
      const h = euclideanModulo(p.height - time * p.fall, 8.8);
      const z = p.z + .62 * Math.sin(flutter);
      const ground = Math.max(WATER_LEVEL, groundHeight(anchor + x, z));
      const fade = smoothstep(x, -76, -64) * (1 - smoothstep(x, 19, 30))
        * smoothstep(h, 0, .5) * (1 - smoothstep(h, 7.86, 8.8));
      dummy.position.set(anchor + x, ground + .2 + h, z);
      dummy.rotation.set(flutter * .83, p.phase + time * 1.83, flutter * .59, 'XYZ');
      dummy.scale.setScalar(Math.max(.0001, p.size * fade * (1 + .16 * reveal)));
      dummy.updateMatrix();
      petals.setMatrixAt(i, dummy.matrix);
    }
    petals.instanceMatrix.needsUpdate = true;
  }

  update(0);
  return {
    group, sky, update,
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      group.clear();
      for (const resource of resources) resource.dispose();
      resources.clear();
    }
  };
}
