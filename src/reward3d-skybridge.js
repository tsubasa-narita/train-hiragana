import * as THREE from '../vendor/three/three.module.js';

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
  const group = new THREE.Group();
  group.name = 'skybridge-world';
  group.userData = { radius: SKY_RADIUS, railTop: .15, gauge: 1.067, deckWidth: 7, cloudCount: 28 };
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
  for (const offset of [-.5335, .5335]) {
    ribbon(railHeads, -400, 450, 1, .125, offset, .05, .068);
    ribbon(railWebs, -400, 450, 1, .085, offset, .06, .035);
  }
  for (let s = -400; s <= 450; s += .66) {
    sleepers.push({ ...at(s, .025), sx: .22, sy: .09, sz: 2.22 });
    for (const offset of [-.5335, .5335]) clips.push({ ...at(s, .095, offset), sx: .13, sy: .035, sz: .19 });
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
    piers.push({ ...at(s, -49), sx: 3.9, sy: 94, sz: 6.25 });
    pierCaps.push({ ...at(s, -2), sx: 5.3, sy: 1.5, sz: 7.3 });
    pierCaps.push({ ...at(s, -34), sx: 5, sy: 2, sz: 6.8 });
  }
  instances(box, stone, archRibs, 'sweeping-arch-ribs');
  instances(box, stone, spandrels, 'open-arch-spandrels');
  instances(box, stone, piers, 'piers-to-minus-96m');
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

  // A genuine open portal at s=-25: the terrain is behind that face and the
  // large crest is on positive Z. The front car's nose is already outside.
  const rockMap=canvasTexture(512,512,ctx=>{
    ctx.scale(2,2);
    ctx.fillStyle='#74867c';ctx.fillRect(0,0,256,256);
    for(let i=0;i<2400;i++){
      const x=random()*256,y=random()*256,w=3+random()*28,h=1+random()*8;
      ctx.fillStyle=random()>.45?'rgba(37,55,49,.16)':'rgba(197,194,158,.17)';
      ctx.fillRect(x,y,w,h);
    }
    ctx.strokeStyle='rgba(35,49,43,.27)';ctx.lineWidth=1;
    for(let i=0;i<55;i++){let x=random()*256,y=random()*256;ctx.beginPath();ctx.moveTo(x,y);for(let j=0;j<4;j++){x+=random()*20-7;y+=random()*12;ctx.lineTo(x,y);}ctx.stroke();}
  });
  rockMap.wrapS=rockMap.wrapT=THREE.RepeatWrapping;rockMap.anisotropy=4;
  const rock = keep(new THREE.MeshStandardMaterial({ color: 0xd1d8ca,map:rockMap,bumpMap:rockMap,bumpScale:.15,roughness:1,side:THREE.DoubleSide }));
  const cliffGeometry = keep(new THREE.PlaneGeometry(375, 100, 60, 30));
  const cp = cliffGeometry.attributes.position;
  function mountainHeight(s, offset) {
    const along = Math.max(0, Math.sin(Math.PI * (s + 420) / 440));
    const crest=Math.exp(-Math.pow(offset/34,2));
    return 7+24*crest*(.45+.55*along)+2*Math.sin(s*.073+offset*.052)*crest;
  }
  const terrainColors = [];
  for (let i = 0; i < cp.count; i++) {
    const s = cp.getX(i) - 212.5, offset = cp.getY(i);
    const y = mountainHeight(s, offset), p = at(s, y, offset);
    cp.setXYZ(i, p.x, p.y, p.z);
    const color = new THREE.Color(y > 65 ? 0x9ca595 : 0x66886b);
    color.multiplyScalar(.86 + random() * .25); terrainColors.push(color.r, color.g, color.b);
  }
  cliffGeometry.setAttribute('color', new THREE.Float32BufferAttribute(terrainColors, 3));
  cliffGeometry.computeVertexNormals();
  mesh(cliffGeometry, keep(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide })), 'tunnel-mountain-positive-z');

  // Close both terrain edges down to the bay; the hillside must never look
  // like a thin floating sheet when the camera reveals the bridge from above.
  const sidePositions=[],sideUv=[],sideIndices=[];
  for(const offset of [-50,50]){
    const base=sidePositions.length/3;
    for(let i=0;i<=60;i++){
      const s=-400+375*i/60,top=at(s,mountainHeight(s,offset),offset),bottom=at(s,-130,offset);
      sidePositions.push(top.x,top.y,top.z,bottom.x,bottom.y,bottom.z);sideUv.push(s/12,top.y/12,s/12,-130/12);
      if(i<60){const n=base+i*2;sideIndices.push(n,n+1,n+2,n+1,n+3,n+2);}
    }
  }
  const sideGeometry=keep(new THREE.BufferGeometry());sideGeometry.setAttribute('position',new THREE.Float32BufferAttribute(sidePositions,3));
  sideGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(sideUv,2));sideGeometry.setIndex(sideIndices);sideGeometry.computeVertexNormals();
  mesh(sideGeometry,rock,'mountain-rock-sides');

  // Profile is in (offset,height), extruded backwards along the track tangent.
  const mouth = new THREE.Shape();
  mouth.moveTo(-50, -130); mouth.lineTo(50, -130); mouth.lineTo(50, -10);
  for (let offset = 50; offset >= -50; offset -= 1) mouth.lineTo(offset, mountainHeight(-25, offset));
  mouth.lineTo(-50, -130);
  const opening = new THREE.Path();
  opening.moveTo(-3.65, -.3); opening.lineTo(-3.65, 3.9);
  opening.absarc(0, 3.9, 3.65, Math.PI, 0, true);
  opening.lineTo(3.65, -.3); opening.closePath(); mouth.holes.push(opening);
  const faceGeometry=keep(new THREE.ShapeGeometry(mouth,48)),facePositions=faceGeometry.attributes.position,faceUv=faceGeometry.attributes.uv;
  for(let i=0;i<facePositions.count;i++){
    const x=facePositions.getX(i),y=facePositions.getY(i);
    faceUv.setXY(i,x/12,y/12);
  }
  faceGeometry.computeVertexNormals();
  const cliffFace = mesh(faceGeometry, rock, 'mountain-face-with-open-tunnel');
  const portalPose = at(-25);
  cliffFace.position.set(portalPose.x, 0, portalPose.z); cliffFace.rotation.y = portalPose.ry - Math.PI / 2;

  const arch = new THREE.Shape();
  arch.moveTo(-4.75, -.25); arch.lineTo(-4.75, 3.9);
  arch.absarc(0, 3.9, 4.75, Math.PI, 0, true);
  arch.lineTo(4.75, -.25); arch.lineTo(3.65, -.25); arch.lineTo(3.65, 3.9);
  arch.absarc(0, 3.9, 3.65, 0, Math.PI, false);
  arch.lineTo(-3.65, -.25); arch.closePath();
  const portal = mesh(keep(new THREE.ExtrudeGeometry(arch, { depth: 1.2, bevelEnabled: false, curveSegments: 40 })), trim, 'cream-stone-portal');
  const portalFront = at(-24.8);
  portal.position.set(portalFront.x, 0, portalFront.z); portal.rotation.y = portalFront.ry - Math.PI / 2;

  // Curved barrel lining, never a black disk closing the opening.
  const barrelPositions = [], barrelIndices = [], cross = 28, segments = 100;
  for (let j = 0; j <= segments; j++) for (let i = 0; i <= cross; i++) {
    const a = Math.PI * i / cross, offset = 3.65 * Math.cos(a), y = 3.9 + 3.65 * Math.sin(a);
    const p = at(-400 + 375 * j / segments, y, offset); barrelPositions.push(p.x, p.y, p.z);
  }
  for (let j = 0; j < segments; j++) for (let i = 0; i < cross; i++) {
    const a = j * (cross + 1) + i, b = a + cross + 1;
    barrelIndices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const barrel = keep(new THREE.BufferGeometry());
  barrel.setAttribute('position', new THREE.Float32BufferAttribute(barrelPositions, 3));
  barrel.setIndex(barrelIndices); barrel.computeVertexNormals();
  const liningMat = keep(new THREE.MeshStandardMaterial({ color: 0x484a43, roughness: 1, side: THREE.DoubleSide }));
  mesh(barrel, liningMat, 'curved-tunnel-barrel');
  const tunnelWalls = [];
  for (const offset of [-3.65, 3.65]) ribbon(tunnelWalls, -400, -25, 2, 1.8, offset, 4.2, .3);
  instances(box, liningMat, tunnelWalls, 'curved-tunnel-sidewalls');
  const lamps = [];
  for (let s = -385; s < -25; s += 18) lamps.push({ ...at(s, 7.34), sx: 1.2, sy: .055, sz: .2 });
  instances(box, keep(new THREE.MeshBasicMaterial({ color: 0xffd298 })), lamps, 'warm-tunnel-ceiling-lights');

  const foliage = [], blossoms = [];
  for (let i = 0; i < 250; i++) {
    const s = -395 + random() * 365, offset = -45 + random() * 90;
    if (Math.abs(offset) < 6) continue;
    const y = mountainHeight(s, offset), size = 2 + random() * 4;
    if (y < -2) continue;
    foliage.push({ ...at(s, y + size * .45, offset), sx: size, sy: size * .85, sz: size,
      color: [0x688856, 0x7d995d, 0x49725a, 0x98a56c][i % 4] });
    if (i % 5 === 0) blossoms.push({ ...at(s, y + size * .9, offset + .5), sx: size * .7, sy: size * .35, sz: size * .65,
      color: config?.id === 'toyoko' ? 0xf4d1df : (i % 2 ? 0xffe9bf : 0xf0c9d7) });
  }
  const foliageGeometry = keep(new THREE.IcosahedronGeometry(1, 2));
  instances(foliageGeometry, keep(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 })), foliage, 'mountainside-woodland');
  instances(foliageGeometry, keep(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9 })), blossoms, 'sunlit-blossom-canopies');

  // Azure bay at -116 m. Its shader gives a long sunlight path and fine
  // moving wavelets without a second full-screen transparent water layer.
  const seaMaterial = keep(new THREE.ShaderMaterial({ uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 vWorld; void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 vWorld; uniform float time;
      void main(){vec2 p=vWorld.xz;float ripple=sin(p.x*.73+p.y*1.13+time*.55)*sin(p.y*.48-p.x*.23-time*.35);
        float distanceFade=smoothstep(100.,1500.,p.y);
        vec3 col=mix(vec3(.018,.36,.63),vec3(.30,.66,.79),distanceFade);
        col+=vec3(.03,.09,.11)*ripple*.22;
        float sunPath=exp(-pow((p.x+85.+p.y*.12)/(32.+p.y*.09),2.));
        float sparkle=pow(max(0.,sin(p.x*1.4+p.y*1.9+time*.4)*sin(p.y*.83-time*.7)),14.);
        col+=vec3(1.,.91,.68)*sunPath*(.12+sparkle*.75);
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` }));
  const sea = mesh(keep(new THREE.PlaneGeometry(2400, 1600)), seaMaterial, 'vast-blue-bay');
  sea.rotation.x = -Math.PI / 2; sea.position.set(100, -116, 890);

  // Layered distant mountain silhouettes, all on positive Z. Vertex colour
  // haze stays vivid even when the engine's generic distance fog is active.
  for (let layer = 0; layer < 3; layer++) {
    const positions = [], indices = [], colors = [], base = new THREE.Color([0x5999af, 0x78b3c5, 0xa1ccd6][layer]);
    for (let i = 0; i <= 100; i++) {
      const x = -1000 + 2000 * i / 100;
      const height = 40 + 45 * Math.pow(.5 + .5 * Math.sin(x * .009 + layer * 2), 2)
        + 37 * Math.pow(.5 + .5 * Math.sin(x * .024 + 1 + layer), 3);
      positions.push(x, -119, 0, x, -119 + height, 0);
      for (const shade of [.85, 1.12]) colors.push(base.r * shade, base.g * shade, base.b * shade);
      if (i < 100) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geometry = keep(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.setIndex(indices);
    const ridge = mesh(geometry, keep(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false })), `bay-mountain-layer-${layer}`);
    ridge.position.set(0, 0, 570 + layer * 135);
  }
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
  const islandGeometry = keep(new THREE.SphereGeometry(1, 18, 10));
  instances(islandGeometry, keep(new THREE.MeshBasicMaterial({ color: 0xc3d8c6, fog: false })), shores, 'pale-island-shorelines');
  instances(islandGeometry, keep(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, fog: false })), islands, 'green-bay-islands');
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
  rainbow.position.set(-50, 13, 335); rainbow.renderOrder = 1;

  // One softly shaded texture shared by just 28 billboards. No white sphere
  // pile, no full-screen cloud quad, and every cloud's top is below -18 m.
  const cloudMap = canvasTexture(256, 128, ctx => {
    ctx.clearRect(0, 0, 256, 128);
    for (let i = 0; i < 36; i++) {
      const x = 35 + random() * 186, y = 62 + (random() - .5) * 34;
      const radius = 18 + random() * 28;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255,255,255,.65)');
      gradient.addColorStop(.4, 'rgba(255,255,255,.5)');
      gradient.addColorStop(.76, 'rgba(255,255,255,.16)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    ctx.globalCompositeOperation = 'source-in';
    const tint = ctx.createLinearGradient(0, 15, 0, 115);
    tint.addColorStop(0, '#fff9ec'); tint.addColorStop(.38, '#f9fcff');
    tint.addColorStop(.72, '#d4e6f3'); tint.addColorStop(1, '#98bfdc');
    ctx.fillStyle = tint; ctx.fillRect(0, 0, 256, 128);
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
        vec3 color=mix(vec3(.48,.76,.96),vec3(.035,.29,.69),pow(h,.45));
        vec2 p=d.xz/max(.22,d.y+.18)*2.4+vec2(time*.002,0.);
        float cloud=smoothstep(.54,.76,fbm(p))*smoothstep(.04,.20,h)*(1.-smoothstep(.7,.95,h));
        color=mix(color,vec3(.98,.985,1.),cloud*.8);
        float sun=max(0.,dot(d,normalize(vec3(-.48,.46,-.2))));
        color+=vec3(1.,.81,.5)*(pow(sun,20.)*.13+pow(sun,800.)*.9);
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
