import * as THREE from '../vendor/three/three.module.js';

function seeded(seed = 4827) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
export function createRailwayWorld(scene, { warm = false, blossom = false, night = false } = {}) {
  const random = seeded(), group = new THREE.Group();
  group.name = 'riverside-viaduct'; scene.add(group);
  const resources = new Set(), geometries = new Map();
  const keep = value => { resources.add(value); return value; };
  const material = options => keep(new THREE.MeshStandardMaterial(options));
  const box = () => {
    if (!geometries.has('box')) geometries.set('box', keep(new THREE.BoxGeometry(1, 1, 1)));
    return geometries.get('box');
  };
  const mesh = (geometry, mat, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const item = new THREE.Mesh(geometry, mat); item.position.set(x,y,z); item.scale.set(sx,sy,sz);
    group.add(item); return item;
  };
  function instances(geometry, mat, transforms, shadow = false) {
    const item = new THREE.InstancedMesh(geometry, mat, transforms.length), dummy = new THREE.Object3D();
    transforms.forEach((t,i) => {
      dummy.position.set(t.x,t.y,t.z); dummy.scale.set(t.sx ?? 1,t.sy ?? 1,t.sz ?? 1);
      dummy.rotation.set(t.rx || 0,t.ry || 0,t.rz || 0); dummy.updateMatrix(); item.setMatrixAt(i,dummy.matrix);
      if (t.color) item.setColorAt(i,new THREE.Color(t.color));
    });
    item.castShadow = shadow; item.receiveShadow = true; group.add(item); return item;
  }
  function texture(width, height, draw) {
    const canvas = document.createElement('canvas'); canvas.width=width; canvas.height=height;
    draw(canvas.getContext('2d')); const map = keep(new THREE.CanvasTexture(canvas));
    map.colorSpace = THREE.SRGBColorSpace; map.anisotropy=4; return map;
  }
  const grassMap = texture(256,256,ctx => {
    ctx.fillStyle='#879364'; ctx.fillRect(0,0,256,256);
    for(let i=0;i<9500;i++) { const n=random(); ctx.fillStyle=`rgba(${n>.5?'192,191,143':'54,84,44'},.22)`; ctx.fillRect(random()*256,random()*256,1+random()*3,1+random()*5); }
  });
  grassMap.wrapS=grassMap.wrapT=THREE.RepeatWrapping; grassMap.repeat.set(85,85);
  const ground=mesh(keep(new THREE.PlaneGeometry(1400,1400)),material({map:grassMap,color:night?0x263343:0xffffff,roughness:1}),0,-6.6,0);
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true;

  const waterMap=texture(256,256,ctx=>{
    ctx.fillStyle='#638d9c';ctx.fillRect(0,0,256,256);
    for(let i=0;i<1300;i++){ctx.strokeStyle=`rgba(211,236,230,${random()*.14})`;ctx.beginPath();const x=random()*256,y=random()*256;ctx.moveTo(x,y);ctx.lineTo(x+random()*25+5,y+.5);ctx.stroke();}
  });
  waterMap.wrapS=waterMap.wrapT=THREE.RepeatWrapping;waterMap.repeat.set(3,25);
  const river=mesh(keep(new THREE.PlaneGeometry(72,1200)),material({map:waterMap,color:0x7eafbd,metalness:.45,roughness:.28}),25,-6.4,0);
  river.rotation.x=-Math.PI/2;
  const bank=material({color:0xaaa895,roughness:.95});
  for(const x of [-13,63]) { const m=mesh(box(),bank,x,-6.15,0,4,1,1200);m.receiveShadow=true; }

  // Concrete piers, separate deck girders, gravel, sleepers and four railheads.
  const concrete=material({color:night?0x344158:0xb5b2a6,roughness:.85}), edge=material({color:night?0x51607b:0xc8c7bb,roughness:.7});
  const gravelMap=texture(256,128,ctx=>{
    ctx.fillStyle='#777975';ctx.fillRect(0,0,256,128);
    for(let i=0;i<3500;i++){const v=Math.floor(65+random()*100);ctx.fillStyle=`rgb(${v},${v+2},${v})`;ctx.beginPath();ctx.ellipse(random()*256,random()*128,random()*2+1,random()*1.3+.5,random()*3,0,7);ctx.fill();}
  });
  gravelMap.wrapS=gravelMap.wrapT=THREE.RepeatWrapping;gravelMap.repeat.set(130,2);
  mesh(box(),concrete,-50,-.7,2.2,750,1.1,10.4).receiveShadow=true;
  mesh(box(),material({map:gravelMap,roughness:1}),-50,-.06,2.2,750,.18,9.4).receiveShadow=true;
  for(const z of [-3,7.4]) { mesh(box(),edge,-50,-.1,z,750,.35,.25).receiveShadow=true; }
  const piers=[];
  for(let x=-400;x<330;x+=32) {
    piers.push({x,y:-3.8,z:2.2,sx:2.0,sy:6.4,sz:3.4});
    piers.push({x,y:-1.4,z:2.2,sx:2.4,sy:.65,sz:9.5});
  }
  instances(box(),concrete,piers);
  const sleepers=[], fasteners=[];
  for(let x=-420;x<330;x+=.66) for(const z of [0,4.4]) {
    sleepers.push({x,y:.015,z,sx:.25,sy:.14,sz:2.35});
    for(const rail of [-.5335,.5335]) fasteners.push({x,y:.105,z:z+rail,sx:.12,sy:.045,sz:.2});
  }
  instances(box(),material({color:0xa7a69b,roughness:.9}),sleepers);
  instances(box(),material({color:0x494940,roughness:.55}),fasteners);
  const rail=material({color:0xa9b3b7,metalness:.94,roughness:.22}), railSide=material({color:0x786552,metalness:.5,roughness:.6});
  for(const z of [-.5335,.5335,4.4-.5335,4.4+.5335]) {
    mesh(box(),rail,-45,.14,z,750,.07,.075);
    mesh(box(),railSide,-45,.075,z,750,.1,.035);
  }
  // Low maintenance railings stay below the windows and do not hide the train.
  const posts=[]; for(let x=-420;x<330;x+=4) for(const z of [-2.8,7.2])posts.push({x,y:.3,z,sx:.055,sy:.8,sz:.055});
  const metal=material({color:0x7f8b8d,metalness:.6,roughness:.45});
  instances(box(),metal,posts);
  for(const z of [-2.8,7.2])mesh(box(),metal,-45,.68,z,750,.045,.045);

  // Overhead line equipment: the contact wire sits above the raised pantographs.
  const poles=[];for(let x=-400;x<330;x+=40){
    for(const z of [-3.5,7.9])poles.push({x,y:2.9,z,sx:.19,sy:7.2,sz:.19});
    poles.push({x,y:6.35,z:2.2,sx:.17,sy:.17,sz:11.5});
    for(const z of [0,4.4]){
      poles.push({x,y:5.95,z,sx:.08,sy:.8,sz:.08});
      mesh(box(),material({color:0xbbc5bc,roughness:.8}),x,6.08,z,.22,.13,.22);
    }
  }
  instances(box(),metal,poles);
  const wire=material({color:0x333f42,metalness:.45,roughness:.5});
  for(const z of [0,4.4]) {mesh(box(),wire,-45,5.6,z,750,.018,.022);mesh(box(),wire,-45,6.1,z,750,.018,.018);}
  const drops=[];for(let x=-400;x<330;x+=8)for(const z of [0,4.4])drops.push({x,y:5.85,z,sx:.012,sy:.5,sz:.012});instances(box(),wire,drops);

  const cityMap=texture(128,256,ctx=>{
    ctx.fillStyle=night?'#101d32':'#b5c0be';ctx.fillRect(0,0,128,256);
    for(let y=8;y<256;y+=15)for(let x=7;x<128;x+=13){ctx.fillStyle=night?(random()>.5?'#ffd092':random()>.3?'#50c8ff':'#111f32'):(random()>.3?'#64818e':'#d7dfd9');ctx.fillRect(x,y,7,9);ctx.fillStyle='rgba(255,255,235,.28)';ctx.fillRect(x,y,2,9);}
  });
  const buildingMat=material({map:cityMap,color:night?0x76879d:0xe1dfd5,emissive:night?0xffffff:0x000000,emissiveMap:night?cityMap:null,emissiveIntensity:night?.65:0,metalness:.18,roughness:.6});
  const buildings=[],roofs=[];
  for(let i=0;i<150;i++){
    const x=-350+random()*750;if(x>-25&&x<80)continue;
    const z=45+random()*190,h=4+Math.pow(random(),2)*34,w=5+random()*12,d=7+random()*14;
    buildings.push({x,y:-6.55+h/2,z,sx:w,sy:h,sz:d,color:['#d9d6cb','#c1d4d8','#a3b3bb','#e4d9c4'][i%4]});
    roofs.push({x,y:-6.55+h+.3,z,sx:w+.3,sy:.6,sz:d+.3});
    roofs.push({x:x+1,y:-6.55+h+1,z:z+1,sx:2.3,sy:1.4,sz:3.6});
  }
  instances(box(),buildingMat,buildings);
  instances(box(),material({color:0x899296,roughness:.85}),roofs);

  const trunks=[],leaves=[];
  for(let i=0;i<430;i++){
    const x=-400+random()*850,z=(random()>.5?1:-1)*(14+random()*170);
    if(x>-13&&x<63)continue;
    const s=.7+random()*1.5,h=2.5+random()*2;
    trunks.push({x,y:-6.6+h/2,z,sx:.2*s,sy:h,sz:.2*s});
    for(let j=0;j<2;j++)leaves.push({x:x+(j-.5)*s,y:-6.6+h+j*.5,z,sx:1.9*s,sy:1.5*s,sz:1.7*s,color:blossom&&i%4===0?'#e5b3bf':['#4e754f','#688655','#7b925c','#57784c'][i%4]});
  }
  instances(box(),material({color:0x786651,roughness:1}),trunks);
  instances(keep(new THREE.IcosahedronGeometry(1,1)),material({color:0xffffff,roughness:1}),leaves);
  // Distant ridges have continuous silhouettes, rather than a flat backdrop.
  for(let layer=0;layer<3;layer++){
    const geometry=keep(new THREE.PlaneGeometry(1800,260,100,8)),p=geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),ridge=30+14*Math.sin(x*.009+layer)+10*Math.sin(x*.021+1.7)+5*Math.sin(x*.043);
      p.setY(i,(y/260+.5)*ridge-7);p.setZ(i,Math.sin(x*.018)*8);
    }
    geometry.computeVertexNormals();
    const ridge=mesh(geometry,material({color:[0x8ba9a0,0x9db5b1,0xb0c4c1][layer],roughness:1,side:THREE.DoubleSide}),0,0,290+layer*65);
    ridge.name='distant-ridge';
  }
  // The sky is a smooth atmospheric gradient with a warm horizon.
  const skyMaterial=keep(new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{
    top:{value:new THREE.Color(night?0x020b23:warm?0x508bb8:0x409fdc)},bottom:{value:new THREE.Color(night?0x274d83:warm?0xffd3a2:0xe8f2f6)},time:{value:0},
  },vertexShader:'varying vec3 vPosition; void main(){vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 vPosition; uniform vec3 top; uniform vec3 bottom; uniform float time;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.04+vec2(4.7,8.2);a*=.5;}return v;}
      void main(){vec3 d=normalize(vPosition);float h=clamp(d.y,0.,1.);vec3 sky=mix(bottom,top,pow(h,.28));
        vec2 p=d.xz/max(d.y+.2,.2)*2.+vec2(time*.003,0.);
        float cloud=smoothstep(.52,.73,fbm(p))*smoothstep(.02,.15,h)*(1.-smoothstep(.65,.9,h));
        sky=mix(sky,${night?'vec3(.06,.12,.25)':'vec3(.96,.97,.98)'},cloud*.8);
        float sun=pow(max(dot(d,normalize(vec3(-.35,.3,.8))),0.),650.);sky+=vec3(1.,.85,.6)*sun*.6;
        gl_FragColor=vec4(sky,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` }));
  const sky=mesh(keep(new THREE.SphereGeometry(950,32,16)),skyMaterial,0,0,0);sky.renderOrder=-10;
  // Wet maintenance lanes catch long coloured city-light reflections. Their
  // procedural ripples stay on the ground instead of obscuring the cab.
  const rainResources=[];
  if(night){
    const wetMap=texture(128,512,ctx=>{
      ctx.fillStyle='#08152a';ctx.fillRect(0,0,128,512);
      for(let i=0;i<90;i++){const x=random()*128,y=random()*512;ctx.fillStyle=i%3?'rgba(59,161,255,.30)':'rgba(255,175,71,.40)';ctx.fillRect(x,y,1+random()*3,10+random()*65);}
    });
    wetMap.wrapS=wetMap.wrapT=THREE.RepeatWrapping;wetMap.repeat.set(1,60);
    for(const z of [-2,6.4])mesh(box(),material({map:wetMap,color:0xb9d7ff,metalness:.8,roughness:.16,emissiveMap:wetMap,emissive:0x9cbfff,emissiveIntensity:.45}),-45,.12,z,750,.025,.65);
    const lights=[];
    for(let x=-390;x<330;x+=24){lights.push({x,y:.4,z:-2.75,sx:.12,sy:.08,sz:.15});}
    instances(box(),material({color:0xc5e7ff,emissive:0x6cbfff,emissiveIntensity:2.5}),lights);

    const count=500,positions=new Float32Array(count*6);
    for(let i=0;i<count;i++){const x=-50+random()*150,y=random()*19,z=-35+random()*75;positions.set([x,y,z,x-.08,y-.7,z],i*6);}
    const g=keep(new THREE.BufferGeometry());g.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const rain=new THREE.LineSegments(g,keep(new THREE.LineBasicMaterial({color:0x81b6e0,transparent:true,opacity:.18,depthWrite:false})));group.add(rain);rainResources.push(rain);
  }
  return {
    group, sky,
    update(time,frame){if(night&&rainResources[0]){rainResources[0].position.set((frame?.headX||0)-20,-(time*8)%15,0);}waterMap.offset.x=time*.012;skyMaterial.uniforms.time.value=time;},
    dispose(){group.traverse(object=>{if(object.isInstancedMesh)object.dispose();});for(const value of resources)value.dispose?.();scene.remove(group);group.clear();},
  };
}

export function createReflectionEnvironment(renderer, warm = false) {
  const stage = new THREE.Scene();stage.background=new THREE.Color(warm?0xd5c5b0:0xc3d2df);
  const sources=[];
  for(const [position,scale,color] of [
    [[0,60,0],[180,1,180],0xffffff],[[0,0,65],[160,70,1],0xb1cde0],
    [[0,-20,0],[180,1,180],0x757c70],[[50,18,-30],[2,30,140],0xffe5bb],
  ]){
    const geometry=new THREE.BoxGeometry(...scale),material=new THREE.MeshBasicMaterial({color});
    const object=new THREE.Mesh(geometry,material);object.position.set(...position);stage.add(object);sources.push(geometry,material);
  }
  const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(stage,.08,.1,200);
  pmrem.dispose();for(const resource of sources)resource.dispose();return target;
}
