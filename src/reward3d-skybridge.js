import * as THREE from '../vendor/three/three.module.js';
import { createTunnelMountain } from './reward3d-terrain.js';

export const SKY_RADIUS = 600;

export function skyPose(s) {
  return {
    x: SKY_RADIUS * Math.sin(s / SKY_RADIUS),
    y: 0,
    z: SKY_RADIUS * (1 - Math.cos(s / SKY_RADIUS)),
    yaw: -s / SKY_RADIUS,
  };
}

export function createSkybridgeWorld(scene, { config } = {}) {
  const halfGauge=(config?.gauge||1.067)/2;
  const group = new THREE.Group();
  group.name = 'skybridge-world';
  group.userData = { radius: SKY_RADIUS, railTop: .15, gauge: halfGauge*2, deckWidth: 7, cloudCount: 28, terrain: 'closed-bored-mountain' };
  scene.add(group);
  const resources = new Set();
  const keep = value => { resources.add(value); return value; };
  let seed = 73129, disposed = false;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const box = keep(new THREE.BoxGeometry(1, 1, 1));
  const stone = keep(new THREE.MeshStandardMaterial({ color: 0xe5d8bf, roughness: .84, emissive: 0x30251b, emissiveIntensity: .12 }));
  const trim = keep(new THREE.MeshStandardMaterial({ color: 0xf2e6d2, roughness: .7 }));
  const metal = keep(new THREE.MeshStandardMaterial({ color: 0x859ca4, metalness: .65, roughness: .38 }));
  const darkMetal = keep(new THREE.MeshStandardMaterial({ color: 0x465b65, metalness: .65, roughness: .46 }));
  const mesh = (geometry, material, name) => {
    const object = new THREE.Mesh(geometry, material); object.name = name;
    object.receiveShadow = true; group.add(object); return object;
  };
  function instances(geometry, material, transforms, name) {
    const object = new THREE.InstancedMesh(geometry, material, transforms.length);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < transforms.length; i++) {
      const t = transforms[i];
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
      dummy.scale.set(t.sx ?? 1, t.sy ?? 1, t.sz ?? 1);
      dummy.updateMatrix(); object.setMatrixAt(i, dummy.matrix);
      if (t.color !== undefined) object.setColorAt(i, new THREE.Color(t.color));
    }
    object.name = name; object.receiveShadow = true;
    object.instanceMatrix.needsUpdate = true; group.add(object); return object;
  }
  // Positive offset is the bay side. All civil works use the engine's exact
  // circle, including the normal offset of the two 1,067 mm gauge railheads.
  function at(s, y = 0, offset = 0) {
    const p = skyPose(s), a = s / SKY_RADIUS;
    return { x: p.x - Math.sin(a) * offset, y, z: p.z + Math.cos(a) * offset, ry: p.yaw };
  }
  function beam(a, b, height, width) {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2,
      sx: Math.hypot(dx, dy, dz), sy: height, sz: width,
      ry: -Math.atan2(dz, dx), rz: Math.atan2(dy, Math.hypot(dx, dz)) };
  }
  function ribbon(target, start, end, step, y, offset, height, width) {
    const count = Math.ceil((end - start) / step);
    for (let i = 0; i < count; i++) {
      const s0 = start + (end - start) * i / count, s1 = start + (end - start) * (i + 1) / count;
      target.push(beam(at(s0, y, offset), at(s1, y, offset), height, width));
    }
  }
  function canvasTexture(width, height, draw) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    draw(canvas.getContext('2d'));
    const texture = keep(new THREE.CanvasTexture(canvas));
    texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }

  // Broad pale viaduct, fine ballast and glinting railheads. The highest
  // rail surface is exactly .15 m; sleepers and fixings stay below it.
  const ballastMap = canvasTexture(128, 128, ctx => {
    ctx.fillStyle = '#a49f91'; ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2000; i++) {
      const v = 95 + Math.floor(random() * 90);
      ctx.fillStyle = `rgb(${v + 8},${v + 5},${v})`;
      ctx.fillRect(random() * 128, random() * 128, 1 + random() * 2, 1 + random() * 2);
    }
  });
  ballastMap.wrapS = ballastMap.wrapT = THREE.RepeatWrapping;
  const deck = [], ballast = [], coping = [], railHeads = [], railWebs = [], sleepers = [], clips = [];
  ribbon(deck, -400, 450, 2, -.94, 0, 1.5, 7);
  ribbon(ballast, -400, 450, 2, -.1, 0, .18, 3.2);
  for (const offset of [-3.34, 3.34]) ribbon(coping, -400, 450, 2, -.02, offset, .34, .32);
  for (const offset of [-halfGauge, halfGauge]) {
    ribbon(railHeads, -400, 450, 1, .125, offset, .05, .068);
    ribbon(railWebs, -400, 450, 1, .085, offset, .06, .035);
  }
  for (let s = -400; s <= 450; s += .66) {
    sleepers.push({ ...at(s, .025), sx: .22, sy: .09, sz: 2.22 });
    for (const offset of [-halfGauge, halfGauge]) clips.push({ ...at(s, .095, offset), sx: .13, sy: .035, sz: .19 });
  }
  instances(box, stone, deck, 'seven-metre-curved-deck');
  instances(box, keep(new THREE.MeshStandardMaterial({ map: ballastMap, roughness: 1 })), ballast, 'ballast');
  instances(box, trim, coping, 'deck-coping');
  instances(box, keep(new THREE.MeshStandardMaterial({ color: 0xdce4e5, metalness: .96, roughness: .2 })), railHeads, 'railheads-top-015');
  instances(box, darkMetal, railWebs, 'rail-webs');
  instances(box, keep(new THREE.MeshStandardMaterial({ color: 0x9c9b8b, roughness: .95 })), sleepers, 'sleepers');
  instances(box, darkMetal, clips, 'rail-fasteners');

  // Nine open arches support the visible bridge, with deep piers disappearing
  // into clouds. Parabolic ribs and vertical spandrels leave the bay visible.
  const archRibs = [], piers = [], spandrels = [], pierCaps = [];
  const bridgeStart = -25, span = 475 / 9;
  for (let bay = 0; bay < 9; bay++) {
    const start = bridgeStart + bay * span;
    for (const offset of [-2.64, 2.64]) {
      for (let i = 0; i < 28; i++) {
        const u0 = i / 28, u1 = (i + 1) / 28;
        const archY = u => -3.4 - 31.5 * Math.pow(2 * u - 1, 2);
        archRibs.push(beam(at(start + u0 * span, archY(u0), offset), at(start + u1 * span, archY(u1), offset), 2.3, .92));
      }
      for (let i = 1; i < 10; i++) {
        const u = i / 10, lower = -3.4 - 31.5 * Math.pow(2 * u - 1, 2);
        spandrels.push({ ...at(start + u * span, (lower - 1.7) / 2, offset), sx: .9, sy: -1.7 - lower, sz: .85 });
      }
    }
  }
  for (let i = 0; i <= 9; i++) {
    const s = bridgeStart + i * span;
    piers.push({ ...at(s, -69), sx: 3.9, sy: 134, sz: 6.25 });
    pierCaps.push({ ...at(s, -2), sx: 5.3, sy: 1.5, sz: 7.3 });
    pierCaps.push({ ...at(s, -34), sx: 5, sy: 2, sz: 6.8 });
  }
  instances(box, stone, archRibs, 'sweeping-arch-ribs');
  instances(box, stone, spandrels, 'open-arch-spandrels');
  instances(box, stone, piers, 'piers-rooted-below-bay');
  instances(box, trim, pierCaps, 'pier-cornices');

  const fencePosts = [], fenceRails = [], poles = [], brackets = [], wires = [], insulators = [];
  for (let s = -25; s <= 450; s += 3.3) for (const offset of [-3.34, 3.34]) {
    fencePosts.push({ ...at(s, .48, offset), sx: .05, sy: .92, sz: .05 });
  }
  for (const offset of [-3.34, 3.34]) for (const y of [.48, .95]) ribbon(fenceRails, -25, 450, 2, y, offset, .04, .04);
  // Single bay-side masts keep the camera side and the front windows open.
  for (let s = -385; s < 450; s += 36) {
    poles.push({ ...at(s, 3.3, 3.02), sx: .14, sy: 6.8, sz: .14 });
    brackets.push(beam(at(s, 6.5, 3.02), at(s, 6.5, -.65), .09, .09));
    brackets.push(beam(at(s, 5.35, 3.02), at(s, 6.5, 1.15), .065, .065));
    brackets.push({ ...at(s, 6.02, 0), sx: .045, sy: .96, sz: .045 });
    insulators.push({ ...at(s, 6.36, .02), sx: .19, sy: .26, sz: .19 });
  }
  // Contact wire centre .5 wire thickness above 5.6 keeps its underside at
  // the pantograph shoe height. All wires use the same radius as the train.
  ribbon(wires, -400, 450, 1, 5.61, 0, .02, .023);
  ribbon(wires, -400, 450, 2, 6.15, 0, .018, .018);
  for (let s = -400; s <= 450; s += 8) wires.push({ ...at(s, 5.88), sx: .015, sy: .54, sz: .015 });
  instances(box, metal, fencePosts, 'fine-railing-posts');
  instances(box, metal, fenceRails, 'fine-railing-handrails');
  instances(box, metal, poles, 'bay-side-catenary-masts');
  instances(box, metal, brackets, 'catenary-cantilevers');
  instances(box, darkMetal, wires, 'curved-contact-wires');
  instances(box, keep(new THREE.MeshStandardMaterial({ color: 0xe4ded0, roughness: .45 })), insulators, 'porcelain-insulators');

  // Neutral layered limestone lets vertex colors describe damp lower rock,
  // warm exposed strata and moss. Fine irregular flecks avoid tiled rectangles.
  const rockMap = canvasTexture(256, 256, ctx => {
    ctx.fillStyle = '#c9c6b8'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6000; i++) {
      const value = 150 + Math.floor(random() * 100);
      ctx.fillStyle = `rgba(${value},${value},${value},.24)`;
      ctx.beginPath(); ctx.ellipse(random() * 256, random() * 256, .3 + random() * 1.8, .3 + random(), random() * 3, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 22; i++) {
      const y = i * 13 + random() * 6;
      ctx.strokeStyle = 'rgba(65,69,62,.12)'; ctx.lineWidth = .4 + random(); ctx.beginPath();
      for (let x = -4; x <= 260; x += 4) {
        const h = y + Math.sin(x * .034 + i) * 3 + Math.sin(x * .12 + i * 7);
        if (x === -4) ctx.moveTo(x, h); else ctx.lineTo(x, h);
      }
      ctx.stroke();
    }
  });
  rockMap.wrapS = rockMap.wrapT = THREE.RepeatWrapping; rockMap.anisotropy = 4;
  createTunnelMountain({ at, keep, mesh, instances, random, config, rockMap });

  const arch = new THREE.Shape();
  arch.moveTo(-4.75, -.25); arch.lineTo(-4.75, 3.9);
  arch.absarc(0, 3.9, 4.75, Math.PI, 0, true);
  arch.lineTo(4.75, -.25); arch.lineTo(3.65, -.25); arch.lineTo(3.65, 3.9);
  arch.absarc(0, 3.9, 3.65, 0, Math.PI, false);
  arch.lineTo(-3.65, -.25); arch.closePath();
  const portal = mesh(keep(new THREE.ExtrudeGeometry(arch, { depth: 1.2, bevelEnabled: false, curveSegments: 40 })), trim, 'cream-stone-portal');
  const portalFront = at(-24.8);
  portal.position.set(portalFront.x, 0, portalFront.z); portal.rotation.y = portalFront.ry - Math.PI / 2;

  // Fine recessed voussoir joints read as cut masonry at the opening, rather
  // than a perfectly smooth white hoop. Everything stays outside the bore.
  const portalJoints = [], portalFeet = [];
  for (let i = 0; i <= 23; i++) {
    const a = Math.PI * i / 23;
    portalJoints.push(beam(at(-24.55, 3.9 + 3.69 * Math.sin(a), 3.69 * Math.cos(a)),
      at(-24.55, 3.9 + 4.72 * Math.sin(a), 4.72 * Math.cos(a)), .028, .035));
  }
  for (const offset of [-4.2, 4.2]) {
    portalFeet.push({ ...at(-24.55, .12, offset), sx: 1.45, sy: .65, sz: 1.55 });
    for (let y = .8; y < 3.9; y += .72) portalJoints.push({ ...at(-24.55, y, offset), sx: .04, sy: .025, sz: 1.05 });
  }
  instances(box, keep(new THREE.MeshStandardMaterial({ color: 0x8e9385, roughness: 1 })), portalJoints, 'portal-stone-joints');
  instances(box, trim, portalFeet, 'portal-footing-stones');

  const lamps = [];
  for (let s = -385; s < -25; s += 18) lamps.push({ ...at(s, 7.34), sx: 1.2, sy: .055, sz: .2 });
  instances(box, keep(new THREE.MeshBasicMaterial({ color: 0xffd298 })), lamps, 'warm-tunnel-ceiling-lights');

  // Azure bay at -116 m. Its shader gives a long sunlight path and fine
  // moving wavelets without a second full-screen transparent water layer.
  const seaMaterial = keep(new THREE.ShaderMaterial({ uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 vWorld; void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 vWorld; uniform float time;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
      void main(){vec2 p=vWorld.xz;
        float wave=noise(p*.08+vec2(time*.07,0.))*.65+noise(p*.27-vec2(0.,time*.04))*.35;
        float distanceFade=smoothstep(180.,1500.,p.y);
        vec3 col=mix(vec3(.006,.095,.24),vec3(.12,.32,.47),distanceFade);
        float coastal=exp(-pow((p.y-360.)/100.,2.))*(.5+.5*noise(p*.016));
        col=mix(col,vec3(.018,.30,.36),coastal*.42);
        col+=vec3(.009,.025,.035)*(wave-.35);
        vec3 view=normalize(cameraPosition-vWorld);
        vec3 normal=normalize(vec3((noise(p*.22+time*.03)-.5)*.14,1.,(noise(p*.19-time*.05)-.5)*.12));
        float fresnel=pow(1.-max(0.,dot(view,normal)),4.);
        col=mix(col,vec3(.31,.51,.64),fresnel*.6);
        float sunPath=exp(-pow((p.x+220.+p.y*.19)/(26.+max(0.,p.y)*.05),2.));
        float sparkle=pow(max(0.,noise(p*1.8+vec2(time*.15,-time*.09))),20.);
        col+=vec3(1.,.77,.38)*sunPath*(.07+sparkle*3.2)*(1.-distanceFade*.6);
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` }));
  const sea = mesh(keep(new THREE.PlaneGeometry(5000, 5000)), seaMaterial, 'vast-blue-bay');
  sea.rotation.x = -Math.PI / 2; sea.position.set(100, -116, 500);

  // Actual rounded land volumes, including the horizon: no upright silhouette
  // panels with exposed straight edges when the camera climbs or turns.
  const islandGeometry = keep(new THREE.SphereGeometry(1, 56, 24));
  const ip = islandGeometry.attributes.position, islandColors = [], islandColor = new THREE.Color();
  for (let i = 0; i < ip.count; i++) {
    const x = ip.getX(i), y = ip.getY(i), z = ip.getZ(i);
    const ridge = .67 + .2 * Math.sin(x * 13 + z * 3) + .12 * Math.sin(x * 29 - z * 8) + .06 * Math.cos(x * 47 + z * 19);
    ip.setXYZ(i, x, y > 0 ? y * ridge : y * .3, z * (.9 + .1 * Math.sin(x * 11)));
    islandColor.setRGB(1, 1, 1).multiplyScalar(.72 + Math.max(0, y) * .28);
    islandColors.push(islandColor.r, islandColor.g, islandColor.b);
  }
  islandGeometry.setAttribute('color', new THREE.Float32BufferAttribute(islandColors, 3)); islandGeometry.computeVertexNormals();
  const distantRanges = [];
  for (let layer = 0; layer < 4; layer++) {
    distantRanges.push({ x: -180 + layer * 65, y: -126, z: 580 + layer * 145,
      sx: 1080 + layer * 100, sy: 112 + layer * 25, sz: 125,
      ry: layer % 2 ? .07 : -.045, color: [0x487f96, 0x6697ad, 0x8fb5c7, 0xb1cedb][layer] });
  }
  instances(islandGeometry, keep(new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, fog: false })), distantRanges, 'layered-rounded-coastal-ranges');
  const islands = [], shores = [], town = [], roofs = [], quays = [], boats = [], wakes = [];
  for (let i = 0; i < 13; i++) {
    const x = -620 + i * 105 + random() * 35, z = 350 + random() * 150;
    const width = 55 + random() * 65, h = 10 + random() * 30;
    shores.push({ x, y: -116.4, z, sx: width * 1.1, sy: 5, sz: 48 + random() * 24 });
    islands.push({ x: x - 10, y: -119, z: z + 15, sx: width, sy: h, sz: 52,
      color: [0x6b9b7a, 0x80ad8b, 0x77a39b][i % 3] });
    for (let j = 0; j < 7; j++) {
      const bx = x - width * .5 + j * width / 7, bz = z - 25 + random() * 6, height = 2 + random() * 5;
      town.push({ x: bx, y: -115 + height / 2, z: bz, sx: 3 + random() * 4, sy: height, sz: 4,
        color: [0xf5e6cf, 0xe5eff0, 0xc5dce1, 0xe7d4bb][j % 4] });
      roofs.push({ x: bx, y: -115 + height, z: bz, sx: 5, sy: .5, sz: 4.4 });
    }
    if (i % 3 === 0) {
      quays.push({ x, y: -115, z: z - 43, sx: 4, sy: 2, sz: 40 });
      quays.push({ x: x + 12, y: -111, z: z - 35, sx: .7, sy: 10, sz: .7 });
      quays.push({ x: x + 12, y: -106, z: z - 40, sx: .7, sy: .7, sz: 12 });
    }
  }
  instances(islandGeometry, keep(new THREE.MeshBasicMaterial({ color: 0xc3d8c6, fog: false })), shores, 'pale-island-shorelines');
  instances(islandGeometry, keep(new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 1, fog: false })), islands, 'green-bay-islands');
  instances(box, keep(new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })), town, 'tiny-harbour-town');
  instances(box, keep(new THREE.MeshBasicMaterial({ color: 0x9dafa9, fog: false })), roofs, 'harbour-roofs');
  instances(box, keep(new THREE.MeshBasicMaterial({ color: 0xaabec0, fog: false })), quays, 'quays-and-port-cranes');
  for (let i = 0; i < 12; i++) {
    const x = -470 + random() * 1020, z = 150 + random() * 390;
    boats.push({ x, y: -115.3, z, sx: 2 + random() * 2, sy: .65, sz: 7 + random() * 7, ry: -.2 });
    wakes.push({ x: x - 1.7, y: -115.95, z: z + 13, sx: 2.5, sy: .04, sz: 16, ry: -.2 });
  }
  instances(box, keep(new THREE.MeshBasicMaterial({ color: 0xf4f7ed, fog: false })), boats, 'white-boats-in-the-bay');
  instances(box, keep(new THREE.MeshBasicMaterial({ color: 0x72bdd1, fog: false })), wakes, 'boat-wakes');

  // A large rainbow beyond the bridge, never a camera overlay. The band has
  // feathered inner/outer edges, with violet inside and red outside.
  const rainbowGeometry = keep(new THREE.PlaneGeometry(440, 250));
  const rainbowMaterial = keep(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: {}, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;
      vec3 spectrum(float t){
        vec3 a=vec3(.55,.27,.94),b=vec3(.19,.51,1.),c=vec3(.20,.84,.69),d=vec3(1.,.90,.34),e=vec3(1.,.39,.36);
        if(t<.25)return mix(a,b,t*4.);if(t<.5)return mix(b,c,(t-.25)*4.);
        if(t<.75)return mix(c,d,(t-.5)*4.);return mix(d,e,(t-.75)*4.);
      }
      void main(){vec2 p=vec2((vUv.x-.5)*440.,vUv.y*250.);float r=length(p);
        float t=(r-183.)/15.;float edge=smoothstep(0.,.15,t)*(1.-smoothstep(.83,1.,t));
        float alpha=edge*.43*smoothstep(0.,22.,p.y);if(alpha<.003)discard;
        gl_FragColor=vec4(spectrum(clamp(t,0.,1.)),alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` }));
  const rainbow = mesh(rainbowGeometry, rainbowMaterial, 'distant-bay-rainbow');
  rainbow.position.set(-125, -212, 265); rainbow.renderOrder = 1;

  // One softly shaded texture shared by just 28 billboards. No white sphere
  // pile, no full-screen cloud quad, and every cloud's top is below -18 m.
  const cloudMap = canvasTexture(512, 256, ctx => {
    ctx.clearRect(0, 0, 512, 256);
    // Broad joined base, then rising cauliflower turrets. Each lobe has a
    // narrow soft rim and its own illuminated shoulder, retaining volume.
    const lobes = [];
    for (let i = 0; i < 24; i++) lobes.push({ x: 65 + random() * 385, y: 148 + random() * 30, r: 32 + random() * 29 });
    for (let i = 0; i < 23; i++) {
      const x = 100 + random() * 310;
      lobes.push({ x, y: 109 - Math.sin((x - 80) / 350 * Math.PI) * 26 + random() * 35, r: 26 + random() * 35 });
    }
    lobes.sort((a, b) => b.y - a.y);
    for (const { x, y, r } of lobes) {
      const gradient = ctx.createRadialGradient(x - r * .3, y - r * .32, r * .08, x, y, r);
      gradient.addColorStop(0, 'rgba(255,252,240,.98)');
      gradient.addColorStop(.48, 'rgba(246,250,252,.96)');
      gradient.addColorStop(.78, 'rgba(200,220,235,.86)');
      gradient.addColorStop(.91, 'rgba(178,206,227,.48)');
      gradient.addColorStop(1, 'rgba(167,198,223,0)');
      ctx.fillStyle = gradient; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'source-atop';
    const tint = ctx.createLinearGradient(0, 70, 0, 230);
    tint.addColorStop(0, 'rgba(255,239,202,.12)'); tint.addColorStop(.4, 'rgba(218,237,250,0)');
    tint.addColorStop(1, 'rgba(80,130,178,.48)');
    ctx.fillStyle = tint; ctx.fillRect(0, 0, 512, 256);
  });
  const cloudMaterials = [.83, .73, .66].map(opacity => keep(new THREE.SpriteMaterial({ map: cloudMap, transparent: true,
    opacity, depthWrite: false, depthTest: true, fog: false, toneMapped: true })));
  const clouds = [];
  for (let i = 0; i < 28; i++) {
    const row = Math.floor(i / 7), col = i % 7;
    const width = 83 + random() * 70, height = 32 + random() * 26;
    const cloud = new THREE.Sprite(cloudMaterials[row % 3]);
    const x = -350 + col * 115 + (random() - .5) * 55;
    // A clear window above the water on the right, with lower clouds in depth.
    const z = row === 0 ? 5 + random() * 32 : 65 + row * 57 + random() * 35;
    const y = -18 - height / 2 - row * 11 - random() * 9;
    cloud.position.set(x, y, z); cloud.scale.set(width, height, 1);
    cloud.name = `soft-cloud-${i}`; group.add(cloud);
    clouds.push({ object: cloud, x, y, z, phase: random() * Math.PI * 2 });
  }

  const skyMaterial = keep(new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 vDirection; uniform float time;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float fbm(vec2 p){float f=0.,a=.5;for(int i=0;i<4;i++){f+=a*noise(p);p=p*2.03+vec2(9.7,4.1);a*=.5;}return f;}
      void main(){vec3 d=normalize(vDirection);float h=max(0.,d.y);
        vec3 color=mix(vec3(.46,.66,.80),vec3(.012,.12,.42),pow(h,.55));
        vec3 sunDirection=normalize(vec3(.48,.75,-.44));
        float sun=max(0.,dot(d,sunDirection));
        color=mix(color,vec3(.80,.72,.55),pow(sun,12.)*.20*(1.-h*.4));
        vec2 p=d.xz/max(.18,d.y+.16)*2.3+vec2(time*.0015,0.);
        float density=fbm(p+fbm(p*.7)*.75);
        float cloud=smoothstep(.53,.71,density)*smoothstep(.035,.19,h)*(1.-smoothstep(.64,.88,h));
        vec3 cloudColor=mix(vec3(.49,.64,.78),vec3(1.,.98,.90),smoothstep(.52,.70,density));
        color=mix(color,cloudColor,cloud*.94);
        float cirrus=smoothstep(.65,.78,fbm(p*vec2(.55,4.5)+7.))*smoothstep(.35,.7,h);
        color=mix(color,vec3(.75,.84,.93),cirrus*.3);
        color+=vec3(1.,.66,.28)*(pow(sun,40.)*.18+pow(sun,450.)*.30);
        color+=vec3(2.8,2.2,1.4)*smoothstep(.99935,.9998,sun);
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` }));
  const sky = mesh(keep(new THREE.SphereGeometry(1100, 32, 20)), skyMaterial, 'open-blue-sky');
  sky.renderOrder = -10; sky.receiveShadow = false;

  return {
    group, sky,
    update(seconds, frame = {}) {
      if (disposed) return;
      const time = Number.isFinite(seconds) ? seconds : 0;
      seaMaterial.uniforms.time.value = time;
      skyMaterial.uniforms.time.value = time;
      // The parent centres the sky on its camera. Track and portal are static;
      // cloud movement is deterministic so seek/replay gives the same image.
      group.userData.headS = frame.headS ?? -32 + 24 * time;
      for (const cloud of clouds) {
        cloud.object.position.x = cloud.x + Math.sin(time * .045 + cloud.phase) * 2.2;
        cloud.object.position.y = cloud.y + (Math.sin(time * .08 + cloud.phase) - 1) * .3;
      }
    },
    dispose() {
      if (disposed) return; disposed = true;
      group.traverse(object => { if (object.isInstancedMesh) object.dispose(); });
      for (const resource of resources) resource.dispose();
      resources.clear(); group.removeFromParent(); group.clear(); clouds.length = 0;
    },
  };
}
