import * as THREE from '../vendor/three/three.module.js';
import { ramp } from './reward-timeline.js';
import { detailSurface, sceneryDetailTexture } from './reward3d-surface.js';

const TRACK_LENGTH = 650;

function scenery(scene, name, seed) {
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
        gl_FragColor=vec4(light,.025+.18*edge+.055*glint);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  mesh(shell,glass,0,3.35,0).renderOrder=7;
  const arches=[], braces=[], lights=[];
  for(let x=-316;x<=316;x+=23){
    arches.push([x,3.35,0,1,1,1,Math.PI/2]);
    for(const side of [-1,1]){
      braces.push([x,-.6,side*5.2,1.65,1.4,1.35]);
      lights.push([x+.03,1.4,side*7.72,1.05,.115,.22]);
    }
  }
  const ring=own(new THREE.TorusGeometry(8.62,.095,7,48));
  batch(ring,material({color:0x628b99,metalness:.63,roughness:.31}),arches);
  batch(box,material({color:0x426b7e,metalness:.34}),braces);
  batch(box,glow(0x71defb,1.4),lights);
}

function seaLife(kit,reduced) {
  const {own,mesh,batch,material,random}=kit;
  const rock=own(new THREE.IcosahedronGeometry(1,1));
  const rocks=[], coral=[], blades=[];
  for(let i=0;i<190;i++){
    const x=random()*670-335,z=(i%2?1:-1)*(10+random()*96),scale=1.8+random()*8;
    rocks.push([x,-15+random()*3,z,scale,scale*.31,scale*.63,random()*6.28,0,0,[0x254669,0x376479,0x355572][i%3]]);
    if(Math.abs(z)>56)continue;
    for(let k=0;k<5;k++){
      const height=.45+random()*3.15;
      coral.push([x+(random()-.5)*3,-13.3+height*.5,z+(random()-.5)*4,.15+random()*.27,height,.19+random()*.28,
        random()*6.28,(random()-.5)*.54,(random()-.5)*.72,[0xff806f,0xce558b,0xf2bf7d,0x575dbc][i%4]]);
    }
    for(let k=0;k<5;k++)blades.push([x+(random()-.5)*3,-12.5,z+(random()-.5)*4,.24,2+random()*3,.68,random()*6.28,0,.2*Math.sin(k),0x438e7f]);
  }
  batch(rock,material({color:0xffffff,roughness:.99}),rocks);
  batch(own(new THREE.CapsuleGeometry(.5,0,2,6)),material({color:0xffffff,emissive:0x5b2c56,emissiveIntensity:.09}),coral);
  batch(own(new THREE.SphereGeometry(.5,6,4)),material({color:0xffffff}),blades);

  // One instanced school. Motion is solved from movie time, including seeks.
  const fish=own(new THREE.BufferGeometry());
  fish.setAttribute('position',new THREE.Float32BufferAttribute([
    1,0,0, .08,.28,0, -.52,0,0, .06,-.24,0, -.09,0,.22, -.09,0,-.22,
    -.42,0,0, -.91,.33,0, -.86,0,0, -.91,-.31,0,
  ],3));
  fish.setIndex([0,1,4,1,2,4,2,3,4,3,0,4,0,5,1,1,5,2,2,5,3,3,5,0,6,7,8,6,8,9]);fish.computeVertexNormals();
  const time={value:0};
  const fishMaterial=material({color:0xffffff,emissive:0x136b83,emissiveIntensity:.55, side:THREE.DoubleSide,metalness:.18,roughness:.45});
  fishMaterial.onBeforeCompile=shader=>{
    shader.uniforms.swimTime=time;
    shader.vertexShader='uniform float swimTime;\n'+shader.vertexShader.replace('#include <begin_vertex>',`
      #include <begin_vertex>
      float phase=swimTime*5.1+instanceMatrix[3].x*.51+instanceMatrix[3].z*.26;
      transformed.z+=sin(phase+position.x*2.7)*(.19-position.x*.15);
      transformed.y+=sin(phase*.35)*.35;`);
  };
  const school=[];
  for(let i=0;i<(reduced?65:132);i++){
    const layer=i%3,scale=.27+random()*.88;
    school.push([(random()-.5)*73,5.9+layer*3.2+random()*5.1,14+random()*22,scale,scale,scale,-.25,0,0,[0xfdc76b,0x8ce9f3,0xcfe8ff][layer]]);
  }
  const fishGroup=batch(fish,fishMaterial,school);

  const ray=own(new THREE.BufferGeometry()),vertices=[],index=[];
  const span=30,rows=32,columns=12;
  for(let i=0;i<=rows;i++){
    const w=i/rows*2-1,z=w*span/2,tip=Math.abs(w);
    const front=4.7-8.4*tip**1.33,back=-4.7+.96*tip-.03*tip**2;
    for(let j=0;j<=columns;j++){
      const f=j/columns;
      vertices.push(THREE.MathUtils.lerp(front,back,f),Math.sin(Math.PI*f)*.83*(1-tip**1.5),z);
      if(i<rows&&j<columns){const a=i*(columns+1)+j;index.push(a,a+columns+1,a+1,a+1,a+columns+1,a+columns+2);}
    }
  }
  ray.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));ray.setIndex(index);ray.computeVertexNormals();
  const fins=own(new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{time},
    vertexShader:`uniform float time;varying vec3 vFin;
      void main(){ vec3 p=position;vFin=p;p.y+=pow(abs(p.z)/15.,1.55)*sin(time*2.5-abs(p.z)*.08)*2.75;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
    fragmentShader:`varying vec3 vFin;void main(){
        float markings=pow(max(0.,sin(abs(vFin.z)*.47+vFin.x*.5)),10.);
        vec3 dorsal=mix(vec3(.021,.095,.15),vec3(.16,.44,.53),.58*markings);
        vec3 belly=mix(vec3(.082,.26,.34),vec3(.32,.55,.61),.36*markings);
        gl_FragColor=vec4(gl_FrontFacing?dorsal:belly,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  const manta=mesh(ray,fins);manta.name='swimming-manta';
  const torso=mesh(own(new THREE.SphereGeometry(1,15,9)),material({color:0x235c71,emissive:0x164357,emissiveIntensity:.47}),0,0,0,5.2,.85,1.95);
  manta.add(torso);
  const tail=mesh(own(new THREE.CylinderGeometry(.028,.29,9,10)),material({color:0x245a70}),-8.4,-.12,0);
  tail.rotation.z=-Math.PI/2;manta.add(tail);
  return (seconds, headX) => {
    const swimTime=reduced?5:seconds;
    time.value=swimTime;
    fishGroup.position.x=headX+swimTime*3.7-22;
    manta.position.set(headX + 20 - swimTime * 4.8, 11 + 3.9 * Math.sin(ramp(2.5,8.7,swimTime)*Math.PI), 19 - swimTime * .93);
    manta.rotation.set(.31-.29*ramp(3,8,swimTime),.65,-.08);
  };
}

export function createAquariumWorld(scene,{config,reduced}) {
  const kit=scenery(scene,'undersea-railway',187401),{box,own,material,mesh,batch,glow,random}=kit;
  const substrate=detailSurface(material({color:0x506779}),own(sceneryDetailTexture()),{
    projection:[.64,.2,.75],scale:[9.3,6.7],strength:[.25,.18,.20],tint:0xd3e7ea,
  });
  mesh(box,substrate,0,-15.6,0,850,4.5,400);
  const columns=[];
  for(let x=-300;x<=300;x+=26)columns.push([x,-7.6,0,2.3,14.8,5.2]);
  batch(box,material({color:0x3a5970}),columns);
  mesh(box,material({color:0x1d4059,metalness:.30}),0,-.59,0,TRACK_LENGTH,.81,7.9);
  track(kit,config.gauge,true);tunnel(kit);
  const waveClock=waterSurface(kit),swim=seaLife(kit,reduced);
  const motes=[];
  for(let i=0;i<170;i++){
    const s=.025+random()*.105;
    motes.push([random()*450-225,random()*31-11,random()*60-16,s,s,s]);
  }
  const drift=batch(own(new THREE.IcosahedronGeometry(1,0)),glow(0x73cce4,.78),motes);
  return {update(time,{headX}){waveClock.value=reduced?0:time;swim(time,headX);drift.position.x=headX-time*.24;},dispose:kit.dispose};
}

function miniatureTown(kit) {
  const {own,box,material,batch,mesh,glow,random}=kit;
  const walls=[], roofs=[], windows=[], doors=[], chimneys=[], trees=[], trunks=[], lanes=[];
  const roofShape=new THREE.Shape();
  roofShape.moveTo(-.53,0);roofShape.lineTo(0,1);roofShape.lineTo(.53,0);roofShape.closePath();
  const gable=own(new THREE.ExtrudeGeometry(roofShape,{depth:1,bevelEnabled:false}));
  gable.translate(0,0,-.5);gable.rotateY(Math.PI/2);
  const paint=[0xf5c786,0xf6dfae,0xe6916e,0xa3d3b7,0x9cc9df,0xe8dfc6];
  const tiles=[0xb75d54,0x526478,0x5f8585,0x8b675e,0x8d5b63];
  const towns=[-101,-31,39,109,179,249];
  for(const centre of towns){
    for(const z of [12.7,36.0])for(let i=0;i<5;i++){
      const x=centre+(i-2)*10.8, w=6.2+random()*2, d=4.7+random()*1.3, h=4.5+random()*3.9;
      const wall=paint[Math.floor(random()*paint.length)], tile=tiles[Math.floor(random()*tiles.length)];
      walls.push([x,h/2-.45,z,w,h,d,0,0,0,wall]);
      roofs.push([x,h-.46,z,w+.55,1.7+random()*1.35,d+.42,0,0,0,tile]);
      chimneys.push([x+w*.23,h+.66,z+.33,.48,1.48,.55,0,0,0,wall]);
      doors.push([x,.58,z-d/2-.022,.88,1.83,.075,0,0,0,0x76554c]);
      for(const edge of [-1,1])for(let row=0;row<2;row++){
        const y=1.25+(h-2.6)*row*.84;
        windows.push([x+edge*w*.28,y,z-d/2-.035,1.06,1.05,.083,0,0,0,row?0xe8c87a:0x78a9b7]);
        chimneys.push([x+edge*w*.28,y-.58,z-d/2-.07,1.26,.105,.19,0,0,0,0xf7ead8]);
      }
      const tx=x-w*.58,tz=z-d*.56;
      trunks.push([tx,.50,tz,.27,1.8,.29]);
      trees.push([tx,1.75,tz,1.04,1.28,.96,0,0,0,[0x659c77,0x86a85c,0x4c9268][i%3]]);
    }
    for(let i=0;i<6;i++) lanes.push([centre-4+i*1.55,-.385,23,.77,.03,6.1]);
  }
  batch(box,material({color:0xffffff}),walls,true);
  batch(gable, material({color:0xffffff,roughness:.93}), roofs,true);
  batch(box,material({color:0xffffff,roughness:.82}),[...chimneys,...doors]);
  batch(box,material({color:0xffffff,emissive:0x458295,emissiveIntensity:.066,roughness:.27}),windows);
  batch(box,material({color:0x785344}),trunks);
  batch(own(new THREE.IcosahedronGeometry(1,1)),material({color:0xffffff,roughness:.96}),trees,true);
  mesh(box,material({color:0x5a6470}),0,-.46,23,TRACK_LENGTH,.13,8.7);
  mesh(box,material({color:0xcbc1a3}),0,-.50,23,TRACK_LENGTH,.19,10.45);
  for(let x=-318;x<=318;x+=8)lanes.push([x,-.383,23,3.4,.022,.12]);
  batch(box,material({color:0xeadaac}),lanes);

  const platforms=[], awnings=[], posts=[], edge=[], sign=[];
  for(const x of [-27,116]){
    platforms.push([x,.19,4.8,38,.91,4.3]);
    edge.push([x,.655,2.72,38,.032,.14]);
    awnings.push([x,4.38,5.07,28.5,.20,3.14]);
    for(let i=-12;i<=12;i+=6)posts.push([x+i,2.46,5.18,.22,3.62,.22]);
    sign.push([x+8,3.35,3.52,2.8,.69,.15]);
  }
  batch(box,material({color:0xcaad8c}),platforms);
  batch(box,material({color:0xeaba54,roughness:.84}),edge);
  batch(box,material({color:0x336b7c,roughness:.45}),awnings,true);
  batch(box,material({color:0x587d82}),posts);
  batch(box,glow(0xe9edd5,.7),sign);
}

function trainController(kit) {
  const {own,box,material,mesh,glow}=kit;
  const stand=material({color:0x213c44,roughness:.31}), light=glow(0xeb9955,1.8);
  const dialFinish=material({color:0xcf5047,roughness:.24,metalness:.23});
  const face=own(new THREE.CylinderGeometry(1,1,1,40));
  mesh(box,stand,-22,2.45,-25,28,6.0,17);
  mesh(box,material({color:0x4d6161,metalness:.32}),-22,5.57,-25,28.6,.38,17.8);
  mesh(face,stand,-28,6.0,-24,6.75,.8,6.75);
  const dial=mesh(face,dialFinish,-28,7.2,-24,4.65,2.15,4.65);
  const pointer=mesh(box,glow(0xffe8bd,.9),0,.512,.62,.085,.040,.46);dial.add(pointer);
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
  const {own,box,material,batch,random}=kit;
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
}

export function createDioramaWorld(scene,{config,reduced}) {
  const kit=scenery(scene,'model-railway-table',365149),{own,box,material,mesh,batch,random}=kit;
  const grain=own(sceneryDetailTexture());
  const wood=detailSurface(material({color:0xb7804c,roughness:.63}),grain,{
    projection:[.42,.42,1],scale:[22,1.8],strength:[.38,.23,.18],tint:0xbc8b6d,
  });
  mesh(box,wood,0,-5.7,19,650,10,112);
  mesh(box,material({color:0x624637,roughness:.75}),0,-10.9,19,653,.48,115);
  const felt=detailSurface(material({color:0x85a66e}),grain,{
    projection:[.63,.18,.57],scale:[2.45,1.8],strength:[.13,.16,.11],tint:0xf3f7ed,
  });
  mesh(box,felt,0,-.72,19,646,.41,108);
  mesh(box,material({color:0xb7a08b}),0,-14.5,26,1600,3,860);
  mesh(box,material({color:0xaeb8aa}),0,74,202,1600,185,10);
  track(kit,config.gauge,false);
  miniatureTown(kit);
  modelParks(kit);
  const blocks=[], windows=[];
  for(const x of [-99,78,236]){
    blocks.push([x,6,73,23,14,14,-.09,0,0,0xf4aa6e], [x+18,5,67,13,11,12,.2,0,0,0x77b9ab],
      [x+69,8,81,19,19,15,-.17,0,0,0x7479a9]);
    for(let i=0;i<4;i++)windows.push([x-8+i*4.7,13.04,73,2.5,.16,10,0,0,0,0xf6bd91]);
  }
  batch(box,material({color:0xffffff,roughness:.55}),[...blocks,...windows],true);
  // Scale is apparent from the wooden ruler and its engraved divisions.
  mesh(box,wood,0,-.14,-18.2,620,.42,4.2);
  const divisions=[];
  for(let i=0;i<315;i++)divisions.push([-311+i*1.98,.085,-19.36,.13,.025,i%5?.73:1.46]);
  batch(box,material({color:0x654938}),divisions);
  const setController=trainController(kit);

  const hubs=material({color:0xd6bca4}), caps=material({color:0x385762,roughness:.37});
  const wheel=own(new THREE.CylinderGeometry(.36,.36,.23,10));wheel.rotateX(Math.PI/2);
  const carBodies=[0xd45e49,0xe4a84e,0x5a90ae,0x6ca77c].map(color=>material({color,roughness:.28}));
  const cars=[];
  for(let i=0;i<8;i++){
    const car=new THREE.Group(),lower=mesh(box,carBodies[i%4],0,.27,0,3.0,.55,1.35);
    const cap=mesh(box,caps,-.32,.70,0,1.34,.45,1.11);
    car.add(lower,cap);
    for(const x of [-.96,.98])for(const z of [-.67,.67])car.add(mesh(wheel,hubs,x,.11,z));
    const direction=i%2===0?1:-1;
    car.rotation.y=direction>0?0:Math.PI;kit.group.add(car);
    cars.push({car,direction,z:23+direction*2.2,start:-320+i*76+random()*17});
  }
  function update(time){
    setController(time);
    for(const {car,direction,z,start} of cars){
      const travel=reduced?0:time*7.7*direction;
      car.position.set(THREE.MathUtils.euclideanModulo(start+320+travel,640)-320,0,z);
    }
  }
  return {update,dispose:kit.dispose};
}
