import * as THREE from '../vendor/three/three.module.js';

// Coordinates are metres: the exit is x=0, the single track is z=0,
// and the railhead is y=.15. The camera-facing wall is deliberately open.
export function createDepotWorld(scene, { config } = {}) {
  const group = new THREE.Group();
  group.name = 'depot-hero-world';
  scene.add(group);
  const resources = new Set();
  const keep = resource => { resources.add(resource); return resource; };
  const box = keep(new THREE.BoxGeometry(1, 1, 1));
  const sphere = keep(new THREE.IcosahedronGeometry(1, 2));
  // A single irregular crown is reused at several scales and rotations.
  const crown=keep(sphere.clone()),crownPositions=crown.attributes.position;
  for(let i=0;i<crownPositions.count;i++){
    const x=crownPositions.getX(i),y=crownPositions.getY(i),z=crownPositions.getZ(i);
    const r=1+.13*Math.sin(x*12+y*9)*Math.sin(z*9-x*4)+.06*Math.sin(y*19+z*11);
    crownPositions.setXYZ(i,x*r,y*r,z*r);
  }
  crown.computeVertexNormals();
  const steel = options => keep(new THREE.MeshStandardMaterial(options));
  const basic = options => keep(new THREE.MeshBasicMaterial(options));
  let seed = 11427, disposed = false;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x-a)/(b-a), 0, 1); return t*t*(3-2*t); };
  function mesh(geometry, material, x, y, z, sx=1, sy=1, sz=1, parent=group) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x,y,z); object.scale.set(sx,sy,sz);
    object.receiveShadow = !material.transparent;
    parent.add(object); return object;
  }
  function batch(geometry, material, transforms, castShadow=false) {
    const object = new THREE.InstancedMesh(geometry, material, transforms.length);
    const dummy = new THREE.Object3D();
    transforms.forEach((t,i) => {
      dummy.position.set(t.x,t.y,t.z); dummy.scale.set(t.sx??1,t.sy??1,t.sz??1);
      dummy.rotation.set(t.rx||0,t.ry||0,t.rz||0); dummy.updateMatrix();
      object.setMatrixAt(i,dummy.matrix);
      if(t.color !== undefined) object.setColorAt(i,new THREE.Color(t.color));
    });
    object.castShadow=castShadow; object.receiveShadow=true; group.add(object); return object;
  }
  function canvasMap(width,height,draw) {
    const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
    draw(canvas.getContext('2d'));
    const map=keep(new THREE.CanvasTexture(canvas)); map.colorSpace=THREE.SRGBColorSpace;
    map.anisotropy=4; return map;
  }
  function repeatingMap(draw,rx,ry) {
    const map=canvasMap(256,256,draw);
    map.wrapS=map.wrapT=THREE.RepeatWrapping; map.repeat.set(rx,ry); return map;
  }
  const frameMetal=steel({color:0x243840,metalness:.65,roughness:.48,envMapIntensity:.65});
  const litMetal=steel({color:0x687c82,metalness:.7,roughness:.38,envMapIntensity:.8});
  const darkMetal=steel({color:0x28343c,metalness:.6,roughness:.6});
  const concrete=steel({color:0x626c69,roughness:.94});
  const yellow=steel({color:0xe4ae3e,metalness:.3,roughness:.55});
  const accent=steel({color:config?.color||0x2d7897,metalness:.35,roughness:.5});
  const lampMaterial=steel({color:0xffdf9e,emissive:0xffb94e,emissiveIntensity:2.6,roughness:.35});

  const grassMap=repeatingMap(ctx=>{
    ctx.fillStyle='#526343';ctx.fillRect(0,0,256,256);
    for(let i=0;i<70;i++){
      const x=random()*256,y=random()*256,r=12+random()*65,g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,i%3?'rgba(137,132,76,.32)':'rgba(27,56,34,.45)');
      g.addColorStop(1,'rgba(59,78,43,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
    }
    for(let i=0;i<5500;i++){
      ctx.fillStyle=random()>.5?'rgba(166,157,99,.15)':'rgba(30,55,29,.2)';
      ctx.fillRect(random()*256,random()*256,1+random()*3,1+random()*5);
    }
  },32,32);
  const ground=mesh(keep(new THREE.PlaneGeometry(1600,1600)),steel({map:grassMap,roughness:1}),0,-.12,0);
  ground.rotation.x=-Math.PI/2; ground.name='depot-meadow';
  const floorMap=repeatingMap(ctx=>{
    ctx.fillStyle='#414c4d';ctx.fillRect(0,0,256,256);
    for(let i=0;i<4000;i++){
      const n=Math.floor(40+random()*65);ctx.fillStyle=`rgba(${n},${n+5},${n+8},.15)`;
      ctx.fillRect(random()*256,random()*256,random()*5+1,random()*3+1);
    }
    ctx.strokeStyle='rgba(23,37,43,.3)';ctx.lineWidth=2;
    ctx.strokeRect(1,1,254,254);
    for(let i=0;i<18;i++){
      const x=random()*256,y=random()*256,r=8+random()*35,g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,'rgba(10,21,24,.27)');g.addColorStop(1,'rgba(10,21,24,0)');
      ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
    }
  },68,3);
  mesh(box,steel({map:floorMap,roughness:.68,metalness:.14}),-135,-.12,0,270,.18,13);
  // A weathered service apron anchors the shed in a working railway yard.
  const apronMap=repeatingMap(ctx=>{
    ctx.fillStyle='#777364';ctx.fillRect(0,0,256,256);
    for(let i=0;i<9500;i++){
      const v=45+Math.floor(random()*100);ctx.fillStyle=`rgba(${v+8},${v+5},${v},.16)`;
      ctx.fillRect(random()*256,random()*256,1+random()*2,1+random()*2);
    }
    ctx.strokeStyle='rgba(39,43,38,.25)';ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(0,128);ctx.lineTo(256,128);ctx.moveTo(128,0);ctx.lineTo(128,256);ctx.stroke();
  },50,4);
  const apron=mesh(keep(new THREE.PlaneGeometry(650,25)),steel({map:apronMap,roughness:.92}),40,-.105,0);
  apron.rotation.x=-Math.PI/2;
  const drainage=[],yardMarkings=[];
  for(let x=-265;x<300;x+=3.6){
    drainage.push({x,y:-.087,z:-4.55,sx:3.2,sy:.035,sz:.27});
    if(x>5)yardMarkings.push({x,y:-.082,z:-8.2,sx:1.45,sy:.012,sz:.075});
  }
  batch(box,darkMetal,drainage);batch(box,steel({color:0xc3b995,roughness:.95}),yardMarkings);
  const ballastMap=repeatingMap(ctx=>{
    ctx.fillStyle='#696d68';ctx.fillRect(0,0,256,256);
    for(let i=0;i<5500;i++){
      const v=Math.floor(64+random()*100);ctx.fillStyle=`rgb(${v+6},${v+4},${v})`;
      ctx.beginPath();ctx.ellipse(random()*256,random()*256,1+random()*2.6,.5+random()*1.8,random()*3,0,7);ctx.fill();
    }
  },230,2);
  mesh(box,steel({map:ballastMap,roughness:1}),-10,-.04,0,580,.14,3.45);

  // A continuous track, including the portions hidden behind the train.
  const sleepers=[],clips=[];
  for(let x=-300;x<=280;x+=.66){
    sleepers.push({x,y:.015,z:0,sx:.23,sy:.11,sz:2.3});
    for(const z of [-.5335,.5335])clips.push({x,y:.092,z,sx:.14,sy:.038,sz:.19});
  }
  batch(box,steel({color:0x989b90,roughness:.9}),sleepers);
  batch(box,darkMetal,clips);
  const railhead=steel({color:0xc1c9c5,metalness:.94,roughness:.2});
  const railWeb=steel({color:0x6e5844,metalness:.72,roughness:.58});
  for(const z of [-.5335,.5335]){
    mesh(box,railhead,-10,.128,z,580,.044,.072);
    mesh(box,railWeb,-10,.067,z,580,.08,.033);
    mesh(box,railWeb,-10,.035,z,580,.025,.13);
  }

  // Raised inspection walkways and the yellow edge run into the dark distance.
  const walkway=[],floorStripes=[],railings=[];
  for(const z of [-3.1,3.1]){
    walkway.push({x:-135,y:.13,z,sx:270,sy:.36,sz:1.4});
    floorStripes.push({x:-135,y:.315,z:z+Math.sign(z)*-.62,sx:270,sy:.014,sz:.10});
    for(let x=-266;x<0;x+=3.2){
      walkway.push({x,y:.324,z,sx:.035,sy:.018,sz:1.38});
      if(z>0)railings.push({x,y:.8,z:3.73,sx:.055,sy:1.05,sz:.055});
    }
  }
  batch(box,concrete,walkway);batch(box,yellow,floorStripes);
  railings.push({x:-135,y:1.31,z:3.73,sx:270,sy:.045,sz:.045});
  batch(box,litMetal,railings);

  // Long, inhabited engine shed. All repeated steel sections share two draws.
  const steelwork=[],steelFlanges=[],roofPanels=[],glassPanels=[],wallRibs=[],braces=[];
  for(let x=-270;x<=0;x+=15){
    for(const z of [-6.5,6.5]){
      steelwork.push({x,y:4.65,z,sx:.24,sy:9.3,sz:.28});
      for(const dz of [-.17,.17])steelFlanges.push({x,y:4.65,z:z+dz,sx:.43,sy:9.3,sz:.055});
      steelwork.push({x,y:.2,z,sx:.72,sy:.4,sz:.72});
      braces.push({x,y:8.5,z:z-Math.sign(z)*.9,sx:.15,sy:2.45,sz:.15,rx:Math.sign(z)*-.76});
    }
    steelwork.push({x,y:8.9,z:0,sx:.22,sy:.38,sz:13.25});
    steelFlanges.push({x,y:8.67,z:0,sx:.42,sy:.06,sz:13.25});
    steelFlanges.push({x,y:9.12,z:0,sx:.42,sy:.06,sz:13.25});
    // Triangular truss web at the roof line, well above pantograph clearance.
    for(let z=-5.4;z<6;z+=1.8)braces.push({x,y:9.5,z,sx:.1,sy:.1,sz:2.0,rx:(Math.round((z+5.4)/1.8)%2?1:-1)*.38});
    steelwork.push({x,y:9.9,z:0,sx:.18,sy:.16,sz:13.25});
    if(x<0){
      for(const z of [-4.9,4.9])roofPanels.push({x:x+7.5,y:10.12,z,sx:14.95,sy:.14,sz:3.65});
      glassPanels.push({x:x+7.5,y:10.13,z:0,sx:14.8,sy:.045,sz:6.0});
      for(let dx=1.5;dx<15;dx+=3)steelFlanges.push({x:x+dx,y:10.17,z:0,sx:.065,sy:.08,sz:6.1});
    }
  }
  for(const z of [-3.05,0,3.05])steelwork.push({x:-135,y:10.14,z,sx:270,sy:.13,sz:.12});
  batch(box,frameMetal,steelwork,true);batch(box,litMetal,steelFlanges);batch(box,frameMetal,braces);
  batch(box,steel({color:0x283e47,metalness:.45,roughness:.73,side:THREE.DoubleSide,envMapIntensity:.5}),roofPanels,true);
  batch(box,steel({color:0x819c9c,emissive:0xffc37a,emissiveIntensity:.12,transparent:true,opacity:.47,metalness:.15,roughness:.4,depthWrite:false}),glassPanels);
  const wallMap=repeatingMap(ctx=>{
    ctx.fillStyle='#344b53';ctx.fillRect(0,0,256,256);
    for(let i=0;i<3600;i++){
      ctx.fillStyle=random()>.5?'rgba(129,148,140,.05)':'rgba(8,19,25,.09)';
      ctx.fillRect(random()*256,random()*256,1+random()*3,2+random()*18);
    }
    const soot=ctx.createLinearGradient(0,0,0,256);
    soot.addColorStop(0,'rgba(4,13,20,.65)');soot.addColorStop(.32,'rgba(8,18,23,.03)');
    soot.addColorStop(.82,'rgba(8,18,23,.15)');soot.addColorStop(1,'rgba(11,18,22,.6)');
    ctx.fillStyle=soot;ctx.fillRect(0,0,256,256);
    ctx.fillStyle='rgba(178,130,64,.35)';ctx.fillRect(0,206,256,3);
  },30,1);
  mesh(box,steel({map:wallMap,color:0xb0babc,metalness:.25,roughness:.83,envMapIntensity:.4}),-135,4.6,6.65,270,9.2,.22);
  mesh(box,darkMetal,-270,4.7,0,.25,9.4,13.4);
  // No z=-6.5 wall: the director can pass through the open side safely.
  for(let x=-269;x<0;x+=1.5)wallRibs.push({x,y:4.7,z:6.48,sx:.065,sy:9.2,sz:.09});
  batch(box,litMetal,wallRibs);
  for(const y of [1.2,4.8,7.6])mesh(box,frameMetal,-135,y,6.42,270,.14,.14);

  // Service pipes, insulators and pendant lights give the long hall a scale.
  const pipeGeometry=keep(new THREE.CylinderGeometry(1,1,1,8));
  const pipes=[],pipeClamps=[],lamps=[],bulbs=[],lampWires=[],insulators=[];
  for(const [y,z,r] of [[7.6,5.95,.105],[8.05,5.95,.07],[7.9,-5.9,.08]]){
    pipes.push({x:-135,y,z,sx:r,sy:270,sz:r,rz:Math.PI/2});
    for(let x=-262;x<0;x+=9)pipeClamps.push({x,y,z,sx:.09,sy:r*3.1,sz:r*3.1});
  }
  for(let x=-262;x<-1;x+=15){
    for(const z of [-4.55,4.55]){
      lampWires.push({x,y:8.05,z,sx:.025,sy:1.35,sz:.025});
      lamps.push({x,y:7.42,z,sx:.56,sy:.16,sz:.56});
      bulbs.push({x,y:7.32,z,sx:.37,sy:.055,sz:.37});
    }
    insulators.push({x,y:6.25,z:0,sx:.19,sy:.24,sz:.19});
    lampWires.push({x,y:7.5,z:0,sx:.045,sy:2.5,sz:.045});
  }
  batch(pipeGeometry,litMetal,pipes);batch(box,darkMetal,pipeClamps);
  batch(box,darkMetal,lamps);batch(box,lampMaterial,bulbs);batch(box,frameMetal,lampWires);
  const ceramic=steel({color:0xc9d4c7,roughness:.45,metalness:.15});
  const wireMaterial=steel({color:0x394544,metalness:.75,roughness:.4});
  for(const y of [5.6,6.25])mesh(box,wireMaterial,-10,y,0,580,.018,.018);
  const hangers=[],outsidePosts=[];
  for(let x=-294;x<=280;x+=8)hangers.push({x,y:5.925,z:0,sx:.012,sy:.65,sz:.012});
  for(let x=18;x<=280;x+=36){
    for(const z of [-5.8,5.8])outsidePosts.push({x,y:3.2,z,sx:.18,sy:6.65,sz:.18});
    outsidePosts.push({x,y:6.5,z:0,sx:.17,sy:.16,sz:11.8});
    insulators.push({x,y:6.28,z:0,sx:.2,sy:.22,sz:.2});
  }
  batch(box,wireMaterial,hangers);batch(box,litMetal,outsidePosts);batch(box,ceramic,insulators);

  // The 9.4 m wide roller shutter rises vertically and gathers in its cassette.
  const facade=[],hazards=[],blackHazards=[];
  for(const z of [-5.65,5.65])facade.push({x:.03,y:4.6,z,sx:.6,sy:9.2,sz:2.0});
  facade.push({x:.03,y:9.42,z:0,sx:.7,sy:1.22,sz:13.4});
  batch(box,steel({color:0x72838a,metalness:.6,roughness:.48}),facade,true);
  for(const z of [-4.85,4.85]){
    mesh(box,litMetal,.04,4.5,z,.34,9,.22);
    mesh(box,yellow,.39,1.5,z,.08,3,.3);
    for(let y=.2;y<3;y+=.38)blackHazards.push({x:.438,y,z,sx:.015,sy:.18,sz:.31});
    hazards.push({x:1.05,y:.55,z,sx:.19,sy:1.1,sz:.19});
  }
  batch(box,yellow,hazards);batch(box,darkMetal,blackHazards);
  mesh(box,darkMetal,-.12,9.12,0,1.05,.72,9.9);
  mesh(box,litMetal,.45,9.22,0,.07,.07,9.65);
  const shutterRows=44,slatPitch=.2,slatMatrix=new THREE.Object3D();
  const shutter=new THREE.InstancedMesh(box,steel({color:0x718995,metalness:.75,roughness:.36}),shutterRows);
  shutter.name='animated-depot-shutter';shutter.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // Its bounding sphere changes during the opening, so keep this tiny batch visible.
  shutter.frustumCulled=false;shutter.castShadow=true;shutter.receiveShadow=true;group.add(shutter);
  const shutterBottom=mesh(box,yellow,0,.08,0,.2,.12,9.35);
  const statusMaterial=steel({color:0xe6a742,emissive:0xe6a742,emissiveIntensity:1.5,roughness:.3});
  mesh(sphere,statusMaterial,.54,7.72,-5.47,.13,.13,.13);
  const signMap=canvasMap(1024,128,ctx=>{
    ctx.fillStyle='#20363c';ctx.fillRect(0,0,1024,128);
    ctx.fillStyle='#f6d590';ctx.fillRect(18,19,8,90);
    ctx.font='bold 68px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('01  /  HERO DEPOT',527,67);
  });
  const sign=mesh(keep(new THREE.PlaneGeometry(6.1,.76)),basic({map:signMap}),.402,9.42,0);
  sign.rotation.y=Math.PI/2;
  // Cabinets and inspection tools stay outside the vehicle and camera envelopes.
  const cabinets=[],cabinetDoors=[],serviceMarkings=[];
  for(let x=-250;x<-4;x+=30){
    cabinets.push({x,y:.85,z:5.55,sx:1.15,sy:1.65,sz:.7});
    cabinetDoors.push({x,y:.95,z:5.18,sx:.96,sy:1.2,sz:.025});
    serviceMarkings.push({x,y:1.48,z:5.15,sx:.6,sy:.08,sz:.02});
  }
  batch(box,accent,cabinets);batch(box,litMetal,cabinetDoors);batch(box,yellow,serviceMarkings);

  // Cable trays, roof ventilators, wall glazing and bench hardware share batches.
  const fittings=[],equipment=[],clerestory=[],windowFrames=[],benchTops=[],ladder=[];
  for(let x=-260;x<-3;x+=15){
    fittings.push({x,y:5.15,z:6.17,sx:13.4,sy:.07,sz:.37});
    fittings.push({x,y:5.3,z:6.32,sx:13.4,sy:.24,sz:.05});
    equipment.push({x:x-2,y:10.5,z:4.8,sx:2.4,sy:.68,sz:1.8});
    equipment.push({x:x-2,y:10.89,z:4.8,sx:2.8,sy:.12,sz:2.2});
    clerestory.push({x,y:7.2,z:6.505,sx:10.8,sy:1.65,sz:.035});
    for(const y of [6.34,8.06])windowFrames.push({x,y,z:6.45,sx:11,sy:.07,sz:.12});
    for(let dx=-5.4;dx<5.5;dx+=1.8)windowFrames.push({x:x+dx,y:7.2,z:6.44,sx:.06,sy:1.75,sz:.12});
    if(x%3===-2){
      benchTops.push({x:x+3,y:1,z:5.6,sx:2.1,sy:.09,sz:.8});
      for(const dx of [2.2,3.8])fittings.push({x:x+dx,y:.5,z:5.6,sx:.08,sy:1,sz:.6});
    }
  }
  for(const x of [-61,-151]){
    for(const dx of [-.28,.28])ladder.push({x:x+dx,y:3.9,z:6.15,sx:.05,sy:7.5,sz:.05});
    for(let y=.25;y<7.7;y+=.32)ladder.push({x,y,z:6.12,sx:.61,sy:.035,sz:.06});
  }
  batch(box,darkMetal,fittings);batch(box,darkMetal,equipment);
  batch(box,steel({color:0x567989,emissive:0x769fa9,emissiveIntensity:.18,metalness:.35,roughness:.29}),clerestory);
  batch(box,frameMetal,windowFrames);batch(box,litMetal,ladder);
  batch(box,steel({color:0x6e6554,roughness:.85}),benchTops);

  // Use explicit translucent geometry for the golden shafts, independently of shadows.
  const shaftsPosition=[],shaftsUv=[],shaftsIndex=[];
  for(const x of [-6,-22,-39,-58,-82,-113,-152,-197,-240]){
    // Crossed feathered ribbons read as a volume from both director angles.
    for(let ribbon=0;ribbon<2;ribbon++){
      const i=shaftsPosition.length/3,z=-2.1+ribbon*.8;
      shaftsPosition.push(x-1,9.86,z,x+1,9.86,z,x-5,.34,4.4+ribbon*.5,x-13,.34,4.4+ribbon*.5);
      shaftsUv.push(0,1,1,1,1,0,0,0);shaftsIndex.push(i,i+1,i+2,i,i+2,i+3);
    }
  }
  const shaftGeometry=keep(new THREE.BufferGeometry());
  shaftGeometry.setAttribute('position',new THREE.Float32BufferAttribute(shaftsPosition,3));
  shaftGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(shaftsUv,2));shaftGeometry.setIndex(shaftsIndex);
  const shaftMaterial=keep(new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
    uniforms:{time:{value:0},strength:{value:.15}},
    vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float time;uniform float strength;
      void main(){float edge=pow(max(0.,sin(vUv.x*3.14159265)),2.5);
        float fade=smoothstep(0.,.23,vUv.y)*(1.-smoothstep(.88,1.,vUv.y));
        float dust=.88+.08*sin(vUv.y*32.+time*.42)+.04*sin(vUv.x*65.-vUv.y*13.);
        gl_FragColor=vec4(vec3(1.,.73,.36),strength*edge*fade*dust);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  const shafts=mesh(shaftGeometry,shaftMaterial,0,0,0);shafts.name='golden-skylight-shafts';shafts.renderOrder=3;
  const poolMaterial=keep(new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    uniforms:{strength:{value:.25}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float strength;void main(){
      vec2 p=(vUv-.5)*2.;float a=pow(max(0.,1.-dot(p,p)),2.);
      gl_FragColor=vec4(1.,.68,.28,a*strength);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
  }));
  const poolGeometry=keep(new THREE.PlaneGeometry(1,1));
  for(const x of [-10,-27,-44,-64,-88]){
    const pool=mesh(poolGeometry,poolMaterial,x,.332,3.1,12,1.32,1);pool.rotation.x=-Math.PI/2;
  }
  const dustPositions=[];
  for(let i=0;i<160;i++)dustPositions.push(-3-random()*95,.7+random()*8.6,-2+random()*7);
  const dustGeometry=keep(new THREE.BufferGeometry());dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dustPositions,3));
  const dustMaterial=keep(new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{time:{value:0}},
    vertexShader:`uniform float time;varying float fade;void main(){vec3 p=position;
      p.x+=sin(time*.16+position.y)*.17;p.y+=sin(time*.24+position.x)*.12;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(22./max(1.,-mv.z),1.,2.6);fade=.2+.8*fract(sin(position.x*13.1)*43758.5);}`,
    fragmentShader:`varying float fade;void main(){float a=1.-smoothstep(.08,.5,length(gl_PointCoord-.5));
      gl_FragColor=vec4(.9,.61,.25,a*fade*.22);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`}));
  const dust=new THREE.Points(dustGeometry,dustMaterial);dust.name='sunlit-depot-dust';group.add(dust);
  // Warm exit light, cool interior fill, and a restrained warm practical.
  const exitLight=new THREE.SpotLight(0xffdb9d,1450,100,.46,.75,2);
  exitLight.position.set(15,18,-7);exitLight.target.position.set(-18,1,2.3);
  exitLight.castShadow=true;exitLight.shadow.mapSize.set(512,512);
  exitLight.shadow.camera.near=.5;exitLight.shadow.camera.far=100;
  exitLight.shadow.bias=-.00025;exitLight.shadow.normalBias=.04;
  const coolFill=new THREE.PointLight(0x8ebddd,90,58,2);coolFill.position.set(-21,6,-4.2);
  const warmPractical=new THREE.PointLight(0xffc578,65,35,2);warmPractical.position.set(-5,7.1,4.4);
  group.add(exitLight,exitLight.target,coolFill,warmPractical);

  // The outside is a sunlit railway meadow, not another elevated viaduct.
  const trunks=[],foliage=[],grasses=[],flowers=[],fence=[],shrubs=[];
  const bark=steel({color:0x64523d,roughness:1}),trunkGeometry=keep(new THREE.CylinderGeometry(.55,1,1,7));
  for(let i=0;i<240;i++){
    const x=-30+random()*620;
    const z=(i%2?1:-1)*(16+Math.pow(random(),1.3)*145);
    if(x<3&&Math.abs(z)<24)continue;
    const h=3.8+random()*7.5,s=.65+random()*1.45,lean=(random()-.5)*.09;
    trunks.push({x,y:h*.34-.12,z,sx:.24*s,sy:h*.68,sz:.24*s,rz:lean});
    for(let j=0;j<6;j++){
      const angle=j*2.4+i*.63,r=j===0?0:s*(.65+random()*.65);
      const branchY=h*(.6+random()*.2);
      if(j>0&&j<4)trunks.push({x:x+Math.cos(angle)*s*.38,y:branchY,z:z+Math.sin(angle)*s*.38,
        sx:.095*s,sy:1.7*s,sz:.095*s,rz:-Math.cos(angle)*.75,rx:Math.sin(angle)*.75});
      foliage.push({x:x+Math.cos(angle)*r,y:h-(j===0?0:random()*h*.3),z:z+Math.sin(angle)*r,
        sx:s*(1.05+random()*.6),sy:s*(1.35+random()*.7),sz:s*(.95+random()*.65),ry:angle,
        color:[0x385a38,0x55733e,0x657d43,0x7d894e,0x486742,0x627742][(i+j)%6]});
    }
    if(i%2===0)shrubs.push({x:x+random()*6-3,y:.5+random()*.3,z:z+random()*6-3,sx:1.2+random()*2,sy:.7+random()*.6,sz:1+random()*2,color:[0x526841,0x6b7947,0x3d603b][i%3]});
  }
  for(let i=0;i<550;i++){
    const x=2+random()*360,z=(i%2?1:-1)*(12.8+random()*10),h=.14+random()*.35;
    grasses.push({x,y:h/2-.11,z,sx:.07+random()*.12,sy:h,sz:.08,rz:(random()-.5)*.6,color:[0x879050,0x637b42,0x99985c][i%3]});
    if(i%9===0)flowers.push({x,y:h-.03,z,sx:.09,sy:.07,sz:.09,color:i%2?0xf3d181:0xe3dfcf});
  }
  batch(trunkGeometry,bark,trunks);
  const leafMaterial=steel({color:0xffffff,roughness:.95});
  batch(crown,leafMaterial,foliage,true);batch(crown,leafMaterial,shrubs);
  const bladeGeometry=keep(new THREE.BufferGeometry());
  bladeGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.12,.5,.05,0,-.5,-.5,0,-.5,.5,.03,.4,.1],3));
  bladeGeometry.computeVertexNormals();
  batch(bladeGeometry,steel({color:0xffffff,roughness:1,side:THREE.DoubleSide}),grasses);
  batch(sphere,steel({color:0xffffff,roughness:1}),flowers);
  for(let x=8;x<290;x+=4)fence.push({x,y:.47,z:10,sx:.08,sy:1.15,sz:.08});
  for(const y of [.37,.9])fence.push({x:148,y,z:10,sx:284,sy:.045,sz:.045});
  batch(box,litMetal,fence);
  // Distant silhouettes are low enough to keep the departure shot bright.
  const buildings=[],rooflines=[];
  for(let i=0;i<35;i++){
    const h=3+random()*10;
    const x=-90+random()*760,z=150+random()*150,w=7+random()*13,d=7+random()*15;
    buildings.push({x,y:h/2-.12,z,sx:w,sy:h,sz:d,color:[0x919d92,0xb0b0a0,0x859b96,0xb5b4a3][i%4]});
    rooflines.push({x,y:h+.03,z,sx:w+.4,sy:.35,sz:d+.4});
    if(i%3===0)rooflines.push({x:x+1,y:h+.6,z,sx:w*.25,sy:1.1,sz:d*.33});
  }
  batch(box,steel({color:0xffffff,roughness:.85}),buildings);
  batch(box,steel({color:0x65766f,roughness:.9}),rooflines);
  for(let layer=0;layer<3;layer++){
    const geometry=keep(new THREE.PlaneGeometry(1800,100,80,1));
    const positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i),top=positions.getY(i)>0;
      positions.setY(i,top?33+layer*12+Math.sin(x*.01+layer)*16+Math.sin(x*.026+layer)*8+Math.sin(x*.061)*2:-.2);
    }
    geometry.computeVertexNormals();
    mesh(geometry,steel({color:[0x6e927e,0x89a497,0xa6b6aa][layer],roughness:1,side:THREE.DoubleSide}),0,0,340+layer*90);
  }
  const skyMaterial=keep(new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,
    uniforms:{time:{value:0}},
    vertexShader:'varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 vDirection;uniform float time;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
      void main(){vec3 d=normalize(vDirection);float h=max(0.,d.y);
        vec3 color=mix(vec3(.95,.69,.39),vec3(.12,.34,.57),pow(h,.38));
        vec2 p=d.xz/max(.18,d.y+.18)*2.+time*.002;
        float cloud=smoothstep(.55,.76,noise(p)+.2*noise(p*2.1));
        cloud*=smoothstep(.04,.2,h)*(1.-smoothstep(.55,.85,h));
        color=mix(color,vec3(.82,.79,.66),cloud*.4);
        float sun=pow(max(0.,dot(d,normalize(vec3(.65,.36,.47)))),700.);
        color+=vec3(1.,.76,.35)*sun;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  const sky=mesh(keep(new THREE.SphereGeometry(950,32,16)),skyMaterial,0,0,0);
  sky.name='depot-morning-sky';sky.renderOrder=-10;

  function update(seconds=0,frame={}) {
    if(disposed)return;
    const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
    const opening=smooth(.35,1.6,time),lift=opening*9.05;
    for(let i=0;i<shutterRows;i++){
      const y=.12+i*slatPitch+lift,stacked=y>8.92;
      // Slats collect above the opening, rather than floating through the roof.
      slatMatrix.position.set(-.04,stacked?8.97+(shutterRows-1-i)*.006:y,0);
      slatMatrix.scale.set(stacked?.3:.16,stacked?.025:.205,9.35);
      slatMatrix.updateMatrix();shutter.setMatrixAt(i,slatMatrix.matrix);
    }
    shutter.instanceMatrix.needsUpdate=true;
    shutterBottom.position.y=.055+Math.min(lift,8.83);
    statusMaterial.color.set(opening>.96?0x8fcb83:0xe6a742);
    statusMaterial.emissive.copy(statusMaterial.color);
    shaftMaterial.uniforms.time.value=time;
    shaftMaterial.uniforms.strength.value=.105+.055*opening;
    dustMaterial.uniforms.time.value=time;
    poolMaterial.uniforms.strength.value=.12+.19*opening;
    exitLight.intensity=650+1000*opening;
    skyMaterial.uniforms.time.value=time;
    // Optional frame data is only used for the moving cool fill; geometry is fixed.
    const headX=Number.isFinite(frame?.headX)?frame.headX:-14+109*THREE.MathUtils.clamp((time-1.65)/5.35,0,1)**2;
    coolFill.position.x=THREE.MathUtils.clamp(headX-7,-28,-6);
    coolFill.intensity=90*(1-.65*smooth(1,32,headX));
  }
  update(0);
  return {
    group,sky,update,
    dispose(){
      if(disposed)return;disposed=true;
      group.traverse(object=>{
        if(object.isInstancedMesh)object.dispose();
        if(object.isLight){object.shadow?.dispose();object.dispose?.();}
      });
      for(const resource of resources)resource.dispose();
      group.removeFromParent();group.clear();
    },
  };
}
