import * as THREE from '../vendor/three/three.module.js';
import { ramp } from './reward-timeline.js';
import { buildSeaLife } from './reward3d-dream-sea.js';
import { buildModelTown, buildModelCars, mouldedBox } from './reward3d-dream-town.js';
import { detailSurface, sceneryDetailTexture } from './reward3d-surface.js';

const TRACK_LENGTH = 650;

export function scenery(scene, name, seed) {
  const group = new THREE.Group(), resources = new Set();
  group.name = name; scene.add(group);
  const own = value => (resources.add(value), value);
  const box = own(new THREE.BoxGeometry(1, 1, 1));
  const material = options => own(new THREE.MeshStandardMaterial({ roughness: .8, ...options }));
  const glow = (color, strength = 1) => own(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength) }));
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  function mesh(geometry, finish, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const object = new THREE.Mesh(geometry, finish);
    object.position.set(x, y, z); object.scale.set(sx, sy, sz);
    object.receiveShadow = true; group.add(object); return object;
  }
  // Transforms specify position, size, then yaw, pitch, roll and tint.
  function batch(geometry, finish, items, shadow = false) {
    const object = own(new THREE.InstancedMesh(geometry, finish, items.length)), transform = new THREE.Object3D();
    items.forEach(([x,y,z,sx,sy,sz,ry=0,rx=0,rz=0,tint], index) => {
      transform.position.set(x,y,z); transform.scale.set(sx,sy,sz); transform.rotation.set(rx,ry,rz); transform.updateMatrix();
      object.setMatrixAt(index, transform.matrix);
      if (tint !== undefined) object.setColorAt(index, new THREE.Color(tint));
    });
    object.castShadow = shadow; object.receiveShadow = true; group.add(object); return object;
  }
  return { group, own, box, material, glow, mesh, batch, random,
    dispose() { group.removeFromParent(); group.clear(); for (const resource of resources) resource.dispose(); resources.clear(); },
  };
}

function track(kit, gauge = 1.067, underwater) {
  const { box, mesh, batch, material, glow } = kit;
  const rail = material({ color:0xb8c7cc, metalness:.74, roughness:.27 });
  const ballast = material({ color:underwater?0x253b50:0x5a4b40, roughness:.98 });
  const sleeper = material({ color:underwater?0x566c76:0x8c6148 });
  mesh(box, ballast, 0, -.18, 0, TRACK_LENGTH, .35, 4.65);
  batch(box, rail, [-1,1].flatMap(side => [
    [0,.124,side*gauge/2,TRACK_LENGTH,.052,.071],
    [0,.070,side*gauge/2,TRACK_LENGTH,.056,.033],
    [0,.033,side*gauge/2,TRACK_LENGTH,.018,.132],
  ])).name='track-rail-sections';
  const ties=[];
  for (let x=-TRACK_LENGTH/2; x<TRACK_LENGTH/2; x+=.82) ties.push([x,-.02,0,.24,.14,2.68]);
  batch(box, sleeper, ties);
  if (underwater) {
    const rim=glow(0x4ebbd6,.8);
    for (const side of [-1,1]) mesh(box,rim,0,.03,side*3.1,TRACK_LENGTH,.07,.11);
    mesh(box, rail, 0, 5.48, 0, TRACK_LENGTH, .035, .085);
  }
}

const surfacePattern = `
  float ripples(vec2 p, float time) {
    vec2 wave = p + vec2(sin(p.y*.62 + time*.64), cos(p.x*.48 - time*.51))*.75;
    float a=abs(sin(wave.x*.47 + wave.y*.91 + time*.22) + .52*sin(wave.y*1.28 - time*.69));
    float b=abs(sin(wave.x*1.09 - wave.y*.53 - time*.29) + .46*cos(wave.x*.64 + time*.83));
    return pow(max(0.,1.-min(a,b)),7.)*.65 + pow(max(0.,1.-max(a,b)),3.)*.35;
  }
`;

function waterSurface(kit) {
  const { own, mesh } = kit;
  const material = own(new THREE.ShaderMaterial({ side:THREE.DoubleSide,
    uniforms:{ time:{value:0},deep:{value:new THREE.Color(0x185779)} },
    vertexShader:`varying vec3 vWorld; void main(){ vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.); }`,
    fragmentShader:`uniform float time;uniform vec3 deep;varying vec3 vWorld;
      ${surfacePattern}
      void main(){
        vec3 ray=normalize(vWorld-cameraPosition);
        float above=smoothstep(.04,.49,ray.y);
        float pattern=ripples(vWorld.xz*.53,time)*above;
        vec3 color=mix(deep,vec3(.22,.71,.77),above);
        color+=vec3(.22,.51,.53)*pattern;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  mesh(own(new THREE.PlaneGeometry(1050,850)),material,0,30,0).rotation.x=-Math.PI/2;
  return material.uniforms.time;
}

function archSection(radius, thickness, width) {
  const shape=new THREE.Shape(), angleMin=-.30, angleMax=Math.PI+.30, count=42;
  for(const edge of [1,-1])for(let i=0;i<=count;i++){
    const angle=THREE.MathUtils.lerp(angleMin,angleMax,(edge>0?i:count-i)/count);
    const r=radius+edge*thickness/2;
    shape[edge===1&&i===0?'moveTo':'lineTo'](r*Math.cos(angle),r*Math.sin(angle));
  }
  shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:width,bevelSize:.024,bevelThickness:.023,bevelSegments:2});
  geometry.translate(0,0,-width/2).rotateY(Math.PI/2);
  return geometry;
}

function tunnel(kit) {
  const {own, mesh, batch, box, material, glow}=kit;
  const shell = own(new THREE.CylinderGeometry(8.6,8.6,TRACK_LENGTH,44,1,true,Math.PI*.84,Math.PI*1.32));
  shell.rotateZ(-Math.PI/2);
  const glass = own(new THREE.ShaderMaterial({ side:THREE.DoubleSide,transparent:true,depthWrite:false,
    uniforms:{ light:{ value:new THREE.Color(0x59d9f6) } },
    vertexShader:`varying vec3 vWorld,vNormal;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;vNormal=normal;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
    fragmentShader:`uniform vec3 light;varying vec3 vWorld,vNormal;
      void main(){
        vec3 ray=normalize(cameraPosition-vWorld);
        float edge=pow(1.-abs(dot(ray,normalize(vNormal))),4.);
        float glint=pow(.5+.5*cos(atan(vNormal.z,vNormal.y)*9.0+1.0),16.);
        float overhead=smoothstep(.24,.96,vNormal.y);
        gl_FragColor=vec4(light,.021+.15*edge+.064*glint+.026*overhead);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  mesh(shell,glass,0,3.35,0).renderOrder=7;
  const arches=[], pillars=[], ledges=[], lights=[], plates=[], fasteners=[];
  for(let x=-316;x<=316;x+=23){
    arches.push([x,3.35,0,1,1,1]);
    for(const side of [-1,1]){
      pillars.push([x,-.19,side*7.88,1.40,2.00,.85], [x,-1.16,side*6.7,.87,2.96,.61,0,-side*1.07]);
      ledges.push([x,.73,side*8.0,1.42,.22,1.08]);
      plates.push([x,.905,side*8.00,1.07,.15,.66]);
      lights.push([x+.72,1.14,side*8.02,.78,.10,.13]);
      for(const dx of [-.44,.44])fasteners.push([x+dx,1.005,side*8.1,.1,.115,.1]);
    }
  }
  const casing=material({color:0x487185,metalness:.45,roughness:.36});
  const flange=material({color:0x7ea4ac,metalness:.52,roughness:.37});
  batch(own(archSection(8.60,.18,.34)),casing,arches,true).name='tunnel-pressure-ribs';
  batch(own(archSection(8.68,.13,.59)),flange,arches).name='tunnel-rib-flanges';
  batch(box,casing,pillars,true);
  batch(box,flange,[...plates,...ledges]);
  batch(own(new THREE.CylinderGeometry(1,1,1,6)),casing,fasteners);
  batch(box,glow(0x8ddeef,1.15),lights);
  const muntins=[];
  for(const angle of [-.235,.76,1.57,2.38,Math.PI+.235]){
    muntins.push([0,3.35+8.63*Math.sin(angle),8.63*Math.cos(angle),TRACK_LENGTH,.056,.061,0,-angle]);
  }
  batch(box,material({color:0x3a758c,metalness:.35,roughness:.43}),muntins).name='longitudinal-glass-seams';
}

export function createAquariumWorld(scene,{config,reduced}) {
  const kit=scenery(scene,'undersea-railway',187401),{box,own,material,mesh,batch,glow,random}=kit;
  const substrate=detailSurface(material({color:0x506779}),own(sceneryDetailTexture()),{
    projection:[.64,.2,.75],scale:[9.3,6.7],strength:[.25,.18,.20],tint:0xd3e7ea,
  });
  mesh(box,substrate,0,-15.6,0,850,4.5,400);
  const columns=[],capitals=[],footings=[];
  for(let x=-300;x<=300;x+=26){
    for(const side of [-1,1])columns.push([x,-7.6,side*2.61,1,11.9,1,0,side*.14]);
    capitals.push([x,-1.64,0,3.25,1.32,10.5]);
    footings.push([x,-12.78,0,4.15,1.43,8.5]);
  }
  const cement=material({color:0x3b6379,roughness:.61});
  batch(own(new THREE.CylinderGeometry(1.18,1.43,1,10)),cement,columns,true);
  batch(box,cement,[...capitals,...footings],true);
  const girder=material({color:0x1d4059,metalness:.30});
  mesh(box,girder,0,-.59,0,TRACK_LENGTH,.81,9.5);
  for(const side of [-1,1])mesh(box,girder,0,-.54,side*7.94,TRACK_LENGTH,.38,.72);
  track(kit,config.gauge,true);tunnel(kit);
  const waveClock=waterSurface(kit),swim=buildSeaLife(kit,reduced);
  const motes=[];
  for(let i=0;i<170;i++){
    const s=.025+random()*.105;
    motes.push([random()*450-225,random()*31-11,random()*60-16,s,s,s]);
  }
  const drift=batch(own(new THREE.IcosahedronGeometry(1,0)),glow(0x73cce4,.78),motes);
  return {update(time,{headX}){waveClock.value=reduced?0:time;swim(time,headX);drift.position.x=headX-time*.24;},dispose:kit.dispose};
}

function trainController(kit) {
  const {own,box,batch,material,mesh,glow}=kit;
  const stand=material({color:0x213c44,roughness:.31}), light=glow(0xeb9955,1.8);
  const dialFinish=material({color:0xcf5047,roughness:.24,metalness:.23});
  const face=own(new THREE.CylinderGeometry(1,1,1,40));
  const shell=own(mouldedBox());
  mesh(shell,stand,-22,2.45,-25,28,6.0,17);
  mesh(shell,material({color:0x658079,metalness:.29}),-22,5.57,-25,28.6,.38,17.8);
  mesh(face,stand,-28,6.0,-24,6.75,.8,6.75);
  const grip=own(new THREE.LatheGeometry([
    new THREE.Vector2(0,-.5),new THREE.Vector2(.89,-.5),new THREE.Vector2(.99,-.37),
    new THREE.Vector2(.98,.27),new THREE.Vector2(.93,.43),new THREE.Vector2(.84,.51),new THREE.Vector2(0,.51),
  ],48));
  const dial=mesh(grip,dialFinish,-28,7.2,-24,4.65,2.15,4.65);
  dial.name='moulded-controller-dial';
  const pointer=mesh(box,glow(0xffe8bd,.9),0,.512,.62,.085,.040,.46);dial.add(pointer);
  const marks=[],screws=[],vents=[];
  for(let i=0;i<13;i++){
    const angle=-2.38+i*.397;
    marks.push([-28+5.72*Math.sin(angle),6.424,-24+5.72*Math.cos(angle),.088,.045,i%3===0?.56:.27,angle]);
  }
  for(const dx of [-12.80,12.80])for(const dz of [-7.28,7.28])screws.push([-22+dx,5.803,-25+dz,.36,.069,.36]);
  for(let i=0;i<9;i++)vents.push([-15+i*.61,3.16,-16.42,.36,.15,.072]);
  batch(box,material({color:0xd4d9bc}),marks);
  batch(face,material({color:0x939fa0,metalness:.61}),screws);
  batch(box,material({color:0x142c34}),vents);
  mesh(face,stand,-15,5.98,-22.8,1.70,.52,1.70);
  mesh(face,light,-15,6.04,-22.8,1.24,.37,1.24);
  mesh(box,light,-13,2.45,2.85,.44,.44,.44);
  mesh(box,stand,-13,1.23,2.85,.15,2.60,.15);
  return time=>{
    const departure=ramp(.22,.96,time);
    dial.rotation.y=THREE.MathUtils.lerp(-.95,.87,departure);
    light.color.set(departure>.82?0x91f8bf:0xffad65).multiplyScalar(1.6);
  };
}

function modelParks(kit) {
  const {own,box,material,mesh,batch,random}=kit;
  const beds=[],paths=[],bushes=[],benchParts=[];
  for(let x=-284;x<290;x+=23){
    const near=x<-5&&x>-44?-10.2:-12.2;
    beds.push([x,-.40,near,12.3,.14,4.4,0,0,0,x%3?0x75a578:0x83b18c]);
    paths.push([x,-.31,near,10.1,.045,1.26]);
    for(const offset of [-4.0,3.9]){
      benchParts.push([x+offset,.24,near+.81,1.22,.12,.46], [x+offset,.48,near+1,.13,.46,.13]);
    }
    for(let t=0;t<8;t++){
      const size=.3+random()*.48;
      bushes.push([x+random()*10-5,-.04,near-1.3+random()*.62,size,.4+random()*.42,size,
        0,0,0,[0xffb7a8,0xf6d475,0x9a83bc,0x43765d,0x58956c][t%5]]);
    }
  }
  batch(box,material({color:0xffffff,roughness:.82}),beds);
  batch(box,material({color:0xd9c7a1}),paths);
  batch(box,material({color:0xa25e4a}),benchParts);
  batch(own(new THREE.IcosahedronGeometry(1,1)),material({color:0xffffff,roughness:.85}),bushes,true);
  const pondBase=own(new THREE.CylinderGeometry(1,1,1,32));
  const pebble=own(new THREE.IcosahedronGeometry(1,0));
  const pondWater=material({color:0x5b9c9c,metalness:.35,roughness:.22});
  const pondEdge=material({color:0xa9ac89,roughness:.91});
  const stones=[], boards=[], gardenFence=[];
  for(const x of [29,94,160,225]){
    const z=-11.9;
    mesh(pondBase,pondEdge,x,-.24,z,4.06,.23,2.22);
    mesh(pondBase,pondWater,x,-.10,z,3.65,.088,1.90);
    for(let i=0;i<19;i++){
      const a=i*Math.PI*2/19;
      stones.push([x+3.91*Math.cos(a),-.01,z+2.06*Math.sin(a),.31,.14,.21,0,0,0,i%2?0xbebfb0:0x969c8e]);
    }
    for(let j=-16;j<=16;j++){
      const arc=j*Math.PI/32,top=.02+.46*Math.cos(arc),slope=-Math.sin(arc)*.185;
      boards.push([x+.24*j,top,z,.23,.081,1.22,0,0,slope]);
      if(Math.abs(j)>15)continue;
      for(const side of [-1,1]){
        if(j%4===0)gardenFence.push([x+.24*j,top+.188,z+side*.59,.068,.38,.069]);
        gardenFence.push([x+.24*j,top+.372,z+side*.59,.26,.064,.074,0,0,slope]);
      }
    }
  }
  batch(pebble,material({color:0xffffff}),stones);
  batch(box,material({color:0xac7362}),boards);
  batch(box,material({color:0xd4ae8f}),gardenFence);
}

export function createDioramaWorld(scene,{config,reduced}) {
  const kit=scenery(scene,'model-railway-table',365149),{own,box,material,mesh,batch}=kit;
  const grain=own(sceneryDetailTexture());
  const wood=detailSurface(material({color:0xb7804c,roughness:.63}),grain,{
    projection:[.42,.42,1],scale:[22,1.8],strength:[.38,.23,.18],tint:0xbc8b6d,
  });
  mesh(box,wood,0,-5.7,19,650,10,112);
  mesh(box,material({color:0x624637,roughness:.75}),0,-10.9,19,653,.48,115);
  const cabinetry=[],insets=[],hardware=[];
  for(const x of [-246,-143,-40,63,166,269]){
    cabinetry.push([x,-8.0,-36,98,3.8,.95]);
    insets.push([x,-8.0,-36.53,95,2.85,.16]);
    for(const dx of [-3.3,3.3])hardware.push([x+dx,-7.75,-36.87,.20,.22,.74]);
    hardware.push([x,-7.75,-37.24,6.77,.22,.19]);
  }
  batch(own(mouldedBox(.048)),wood,cabinetry,true).name='model-table-drawer-fronts';
  batch(box,material({color:0x8c583e,roughness:.67}),insets);
  batch(own(mouldedBox(.095)),material({color:0x857166,metalness:.63,roughness:.33}),hardware);
  const felt=detailSurface(material({color:0x85a66e}),grain,{
    projection:[.63,.18,.57],scale:[2.45,1.8],strength:[.13,.16,.11],tint:0xf3f7ed,
  });
  mesh(box,felt,0,-.72,19,646,.41,108);
  mesh(box,material({color:0xb7a08b}),0,-14.5,26,1600,3,860);
  mesh(box,material({color:0xaeb8aa}),0,74,202,1600,185,10);
  const windowCase=[],windowPanes=[];
  for(const x of [-116,111,338]){
    windowCase.push([x,43,196.42,114,51,1.7]);
    windowPanes.push([x,43,195.46,108,44,.30]);
    windowCase.push([x,43,195.1,3.5,45,1.12],[x,44,195.02,109,2.6,1.18]);
    windowCase.push([x,17.0,194.1,119,2.65,6.8]);
  }
  batch(box,material({color:0xe2d1b4,roughness:.67}),windowCase);
  batch(box,material({color:0x9ac1cb,emissive:0x7aabbc,emissiveIntensity:.48,roughness:.47}),windowPanes);
  track(kit,config.gauge,false);
  buildModelTown(kit,TRACK_LENGTH);
  modelParks(kit);
  const blocks=[];
  for(const x of [-99,78,236]){
    blocks.push([x,6,73,23,14,14,-.09,0,0,0xf4aa6e], [x+18,5,67,13,11,12,.2,0,0,0x77b9ab],
      [x+69,8,81,19,19,15,-.17,0,0,0x7479a9]);
  }
  const studs=blocks.flatMap(([x,y,z,w,h,d,angle,,,tint])=>[-.35,-.116,.116,.35].flatMap(column=>[-.23,.23].map(row=>{
    const u=column*w,v=row*d,radius=Math.min(w*.106,d*.134);
    return [x+Math.cos(angle)*u+Math.sin(angle)*v,y+h/2+.40,z-Math.sin(angle)*u+Math.cos(angle)*v,
      radius,.85,radius,angle,0,0,tint];
  })));
  const toyPlastic=material({color:0xffffff,roughness:.42});
  batch(own(mouldedBox()),toyPlastic,blocks,true);
  batch(own(new THREE.CylinderGeometry(.92,1,1,16)),toyPlastic,studs,true).name='toy-brick-studs';
  // Scale is apparent from the wooden ruler and its engraved divisions.
  mesh(box,wood,0,-.14,-18.2,620,.42,4.2);
  const divisions=[];
  for(let i=0;i<315;i++)divisions.push([-311+i*1.98,.085,-19.36,.13,.025,i%5?.73:1.46]);
  batch(box,material({color:0x654938}),divisions);
  const setController=trainController(kit);

  const driveCars=buildModelCars(kit,reduced);
  function update(time){
    setController(time);
    driveCars(time);
  }
  return {update,dispose:kit.dispose};
}
