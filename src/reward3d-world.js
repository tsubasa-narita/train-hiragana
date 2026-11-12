import * as THREE from '../vendor/three/three.module.js';

function seeded(seed = 4827) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
export function createRailwayWorld(scene, { warm = false, blossom = false, night = false } = {}) {
  const random = seeded(), group = new THREE.Group();
  let disposed = false;
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
    ctx.fillStyle=night?'#25313b':'#536749'; ctx.fillRect(0,0,256,256);
    for(let i=0;i<9500;i++) { const n=random(); ctx.fillStyle=night?`rgba(${n>.5?'83,99,109':'9,17,25'},.13)`:`rgba(${n>.5?'164,164,105':'29,55,31'},.18)`; ctx.fillRect(random()*256,random()*256,1+random()*3,1+random()*5); }
  });
  grassMap.wrapS=grassMap.wrapT=THREE.RepeatWrapping; grassMap.repeat.set(85,85);
  const ground=mesh(keep(new THREE.PlaneGeometry(1400,1400)),material({map:grassMap,color:night?0x687787:0xffffff,roughness:night?.38:1,metalness:night?.2:0}),0,-6.6,0);
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true;

  const waterMap=texture(256,256,ctx=>{
    ctx.fillStyle='#638d9c';ctx.fillRect(0,0,256,256);
    for(let i=0;i<1300;i++){ctx.strokeStyle=`rgba(211,236,230,${random()*.14})`;ctx.beginPath();const x=random()*256,y=random()*256;ctx.moveTo(x,y);ctx.lineTo(x+random()*25+5,y+.5);ctx.stroke();}
  });
  waterMap.wrapS=waterMap.wrapT=THREE.RepeatWrapping;waterMap.repeat.set(3,25);
  const river=mesh(keep(new THREE.PlaneGeometry(72,1200)),material({map:waterMap,color:night?0x102434:0x7eafbd,metalness:.5,roughness:night?.19:.28}),25,-6.4,0);
  river.rotation.x=-Math.PI/2;
  const bank=material({color:night?0x26333c:0xaaa895,roughness:.85});
  for(const x of [-13,63]) { const m=mesh(box(),bank,x,-6.15,0,4,1,1200);m.receiveShadow=true; }

  // Concrete piers, separate deck girders, gravel, sleepers and four railheads.
  const concrete=material({color:night?0x253140:0xb5b2a6,roughness:.85}), edge=material({color:night?0x455260:0xc8c7bb,roughness:night?.4:.7});
  const gravelMap=texture(256,128,ctx=>{
    ctx.fillStyle='#777975';ctx.fillRect(0,0,256,128);
    for(let i=0;i<3500;i++){const v=Math.floor(65+random()*100);ctx.fillStyle=`rgb(${v},${v+2},${v})`;ctx.beginPath();ctx.ellipse(random()*256,random()*128,random()*2+1,random()*1.3+.5,random()*3,0,7);ctx.fill();}
  });
  gravelMap.wrapS=gravelMap.wrapT=THREE.RepeatWrapping;gravelMap.repeat.set(130,2);
  mesh(box(),concrete,-50,-.7,2.2,750,1.1,10.4).receiveShadow=true;
  mesh(box(),material({map:gravelMap,color:night?0x52606b:0xffffff,roughness:night?.63:1}),-50,-.06,2.2,750,.18,9.4).receiveShadow=true;
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
  instances(box(),material({color:night?0x666c6c:0xa7a69b,roughness:night?.55:.9}),sleepers);
  instances(box(),material({color:0x494940,roughness:.55}),fasteners);
  const rail=material({color:0xa9b3b7,metalness:.94,roughness:night?.13:.22}), railSide=material({color:0x786552,metalness:.5,roughness:.6});
  for(const z of [-.5335,.5335,4.4-.5335,4.4+.5335]) {
    mesh(box(),rail,-45,.128,z,750,.044,.075);
    mesh(box(),railSide,-45,.075,z,750,.1,.035);
  }
  // Low maintenance railings stay below the windows and do not hide the train.
  const posts=[]; for(let x=-420;x<330;x+=4) for(const z of [-2.8,7.2])posts.push({x,y:.3,z,sx:.055,sy:.8,sz:.055});
  const metal=material({color:0x7f8b8d,metalness:.6,roughness:.45});
  instances(box(),metal,posts);
  for(const z of [-2.8,7.2])mesh(box(),metal,-45,.68,z,750,.045,.045);

  // Overhead line equipment: the contact wire sits above the raised pantographs.
  const poles=[],insulators=[];for(let x=-400;x<330;x+=40){
    for(const z of [7.9])poles.push({x,y:2.9,z,sx:.19,sy:7.2,sz:.19});
    poles.push({x,y:6.35,z:2.2,sx:.17,sy:.17,sz:11.5});
    for(const z of [0,4.4]){
      poles.push({x,y:5.95,z,sx:.08,sy:.8,sz:.08});
      insulators.push({x,y:6.08,z,sx:.22,sy:.13,sz:.22});
    }
  }
  instances(box(),metal,poles);
  instances(box(),material({color:0x9ea9a4,roughness:.65}),insulators);
  const wire=material({color:0x333f42,metalness:.45,roughness:.5});
  for(const z of [0,4.4]) {mesh(box(),wire,-45,5.6,z,750,.018,.022);mesh(box(),wire,-45,6.1,z,750,.018,.018);}
  const drops=[];for(let x=-400;x<330;x+=8)for(const z of [0,4.4])drops.push({x,y:5.85,z,sx:.012,sy:.5,sz:.012});instances(box(),wire,drops);

  // Four building uses: occupied offices, apartments, dark glass and masonry.
  // Albedo and illumination are separate: an unoccupied window never glows.
  const cityGeometry=keep(box().clone()),cityUv=cityGeometry.attributes.uv;
  for(const face of cityGeometry.groups){
    const vertices=new Set();
    for(let i=face.start;i<face.start+face.count;i++)vertices.add(cityGeometry.index.getX(i));
    for(const vertex of vertices){
      if(face.materialIndex===2||face.materialIndex===3)cityUv.setXY(vertex,.01,.99);
      else cityUv.setY(vertex,cityUv.getY(vertex)*.94);
    }
  }
  const cityBatches=Array.from({length:4},()=>[]),roofs=[],podiums=[],mullions=[],beacons=[];
  for(let style=0;style<4;style++){
    const windows=[];
    for(let row=0;row<28;row++){
      const occupiedFloor=random()>(style===2?.68:.2),officeBand=random();
      for(let col=0;col<12;col++){
        const lit=occupiedFloor&&random()<(style===0?.48:style===1?.34:.18);
        windows.push({x:col*21+5,y:row*17+7,w:style===1?10:14,h:style===1?10:11,lit,
          color:random()>.17?'#dfba84':'#8dabb9',brightness:.2+random()*.58,
          blind:random()>.67,officeBand});
      }
    }
    const facade=texture(256,512,ctx=>{
      ctx.fillStyle=['#28333d','#494b4d','#1b2b39','#4b4742'][style];ctx.fillRect(0,0,256,512);
      for(const w of windows){
        ctx.fillStyle=night?'#101e2a':'#526976';ctx.fillRect(w.x,w.y,w.w,w.h);
        ctx.fillStyle='rgba(119,139,151,.22)';ctx.fillRect(w.x,w.y,w.w,1);
        if(w.blind){ctx.fillStyle='rgba(79,83,83,.45)';ctx.fillRect(w.x,w.y,w.w,4);}
      }
      ctx.fillStyle='#222b34';ctx.fillRect(0,482,256,30);
    });
    const emission=night?texture(256,512,ctx=>{
      ctx.fillStyle='#000';ctx.fillRect(0,0,256,512);
      for(const w of windows)if(w.lit){
        ctx.globalAlpha=w.brightness;ctx.fillStyle=w.color;ctx.fillRect(w.x,w.y,w.w,w.h);
        ctx.globalAlpha=.1;ctx.fillStyle='#000';ctx.fillRect(w.x+w.w*.45,w.y,1,w.h);
        if(w.blind){ctx.globalAlpha=.65;ctx.fillRect(w.x,w.y,w.w,4);}
      }
      ctx.globalAlpha=1;
    }):null;
    const cityMat=material({map:facade,color:night?0xa0abba:0xe1dfd5,emissive:night?0xfff3dd:0x000000,
      emissiveMap:emission,emissiveIntensity:night?1.05:0,metalness:style===2?.5:.18,roughness:style===2?.32:.72});
    for(let i=style;i<176;i+=4){
      const x=-390+random()*850,z=36+random()*205;
      // Preserve the river corridor while keeping a continuous city on its banks.
      if(x>-12&&x<66)continue;
      const h=6+Math.pow(random(),1.8)*48,w=6+random()*14,d=8+random()*17;
      cityBatches[style].push({x,y:-6.55+h/2,z,sx:w,sy:h,sz:d,color:['#b3bec6','#bcb5aa','#9dacba','#b1ada9'][i%4]});
      roofs.push({x,y:-6.55+h+.14,z,sx:w+.18,sy:.28,sz:d+.18});
      roofs.push({x:x+w*.16,y:-6.55+h+.8,z:z+d*.1,sx:w*.3,sy:1.1,sz:d*.32});
      if(i%3===0)podiums.push({x,y:-4.55,z,sx:w+3,sy:4,sz:d+3});
      if(style===2){
        for(const dx of [-.32,0,.32])mullions.push({x:x+w*dx,y:-6.55+h/2,z:z-d*.5-.035,sx:.1,sy:h,sz:.06});
      }
      if(night&&h>38)beacons.push({x:x-w*.4,y:-6.55+h+.4,z:z-d*.4,sx:.09,sy:.12,sz:.09});
    }
    instances(cityGeometry,cityMat,cityBatches[style]);
  }
  instances(box(),material({color:night?0x27313e:0x899296,roughness:.8}),roofs);
  instances(box(),material({color:night?0x30343c:0xa6a398,roughness:.8}),podiums);
  instances(box(),material({color:0x46525d,metalness:.6,roughness:.42}),mullions);
  if(beacons.length)instances(box(),material({color:0xb1473a,emissive:0xff432b,emissiveIntensity:1.2}),beacons);

  const trunks=[],leaves=[];
  const crown=keep(new THREE.IcosahedronGeometry(1,2)),crownPosition=crown.attributes.position;
  for(let i=0;i<crownPosition.count;i++){
    const x=crownPosition.getX(i),y=crownPosition.getY(i),z=crownPosition.getZ(i);
    const r=1+.1*Math.sin(x*13+y*8)*Math.sin(z*11-x*5)+.05*Math.sin(y*23+z*8);
    crownPosition.setXYZ(i,x*r,y*r,z*r);
  }
  crown.computeVertexNormals();
  for(let i=0;i<430;i++){
    const x=-400+random()*850,z=(random()>.5?1:-1)*(14+random()*170);
    if(x>-13&&x<63)continue;
    const s=.65+random()*1.6,h=3+random()*5;
    trunks.push({x,y:-6.6+h*.38,z,sx:.18*s,sy:h*.76,sz:.18*s});
    for(let j=0;j<5;j++){
      const angle=j*2.4+random()*.5,r=j===0?0:s*(.6+random()*.5);
      leaves.push({x:x+Math.cos(angle)*r,y:-6.6+h-(j===0?0:random()*h*.3),z:z+Math.sin(angle)*r,
        sx:s*(1+random()*.55),sy:s*(1.15+random()*.65),sz:s*(.9+random()*.55),ry:angle,
        color:blossom&&i%4===0?'#d6a5b3':(night?['#203a37','#29423b','#34483c','#233d36']:['#385a3a','#526e3d','#6d7f49','#49673d'])[(i+j)%4]});
    }
  }
  instances(box(),material({color:0x786651,roughness:1}),trunks);
  instances(crown,material({color:0xffffff,roughness:1}),leaves);
  // Distant ridges have continuous silhouettes, rather than a flat backdrop.
  for(let layer=0;layer<3;layer++){
    const geometry=keep(new THREE.PlaneGeometry(1800,260,100,8)),p=geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),ridge=30+14*Math.sin(x*.009+layer)+10*Math.sin(x*.021+1.7)+5*Math.sin(x*.043);
      p.setY(i,(y/260+.5)*ridge-7);p.setZ(i,Math.sin(x*.018)*8);
    }
    geometry.computeVertexNormals();
    const ridge=mesh(geometry,material({color:(night?[0x142439,0x1a2b42,0x213149]:[0x8ba9a0,0x9db5b1,0xb0c4c1])[layer],roughness:1,side:THREE.DoubleSide}),0,0,290+layer*65);
    ridge.name='distant-ridge';
  }
  // The sky is a smooth atmospheric gradient with a warm horizon.
  const skyMaterial=keep(new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{
    top:{value:new THREE.Color(night?0x07152d:warm?0x508bb8:0x409fdc)},bottom:{value:new THREE.Color(night?0x344769:warm?0xffd3a2:0xe8f2f6)},time:{value:0},
  },vertexShader:'varying vec3 vPosition; void main(){vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 vPosition; uniform vec3 top; uniform vec3 bottom; uniform float time;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.04+vec2(4.7,8.2);a*=.5;}return v;}
      void main(){vec3 d=normalize(vPosition);float h=clamp(d.y,0.,1.);vec3 sky=mix(bottom,top,pow(h,.42));
        vec2 p=d.xz/max(d.y+.2,.2)*2.+vec2(time*.003,0.);
        float cloud=smoothstep(.52,.73,fbm(p))*smoothstep(.02,.15,h)*(1.-smoothstep(.65,.9,h));
        sky=mix(sky,${night?'vec3(.012,.027,.055)':'vec3(.96,.97,.98)'},cloud*${night?'.62':'.8'});
        ${night?`float dusk=pow(max(0.,dot(d,normalize(vec3(-.6,.025,.8)))),12.)*exp(-h*17.);
        sky+=vec3(.046,.018,.027)*dusk;`:
        'float sun=pow(max(dot(d,normalize(vec3(-.35,.3,.8))),0.),650.);sky+=vec3(1.,.85,.6)*sun*.6;'}
        gl_FragColor=vec4(sky,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` }));
  const sky=mesh(keep(new THREE.SphereGeometry(950,32,16)),skyMaterial,0,0,0);sky.renderOrder=-10;
  // Wet maintenance lanes catch long coloured city-light reflections. Their
  // procedural ripples stay on the ground instead of obscuring the cab.
  const rainResources=[];
  if(night){
    const wetMap=texture(1024,128,ctx=>{
      ctx.fillStyle='#14202c';ctx.fillRect(0,0,1024,128);
      for(let i=0;i<95;i++){
        const x=random()*1024,y=random()*128,r=10+random()*60;
        const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
        gradient.addColorStop(0,i%5?'rgba(114,150,179,.17)':'rgba(191,146,91,.17)');
        gradient.addColorStop(1,'rgba(20,32,44,0)');ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);
      }
      for(let i=0;i<1400;i++){
        ctx.fillStyle='rgba(8,15,22,.15)';ctx.fillRect(random()*1024,random()*128,3+random()*17,.5);
      }
    });
    wetMap.wrapS=wetMap.wrapT=THREE.RepeatWrapping;wetMap.repeat.set(30,1);
    const puddleMap=texture(512,128,ctx=>{
      ctx.fillStyle='#929292';ctx.fillRect(0,0,512,128);
      for(let i=0;i<65;i++){
        const x=random()*512,y=random()*128,r=8+random()*40,g=ctx.createRadialGradient(x,y,0,x,y,r);
        g.addColorStop(0,'#181818');g.addColorStop(.65,'#353535');g.addColorStop(1,'rgba(146,146,146,0)');
        ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
      }
    });
    puddleMap.colorSpace=THREE.NoColorSpace;puddleMap.wrapS=puddleMap.wrapT=THREE.RepeatWrapping;puddleMap.repeat.set(40,1);
    const wet=material({map:wetMap,color:0x94a7b7,metalness:.42,roughness:.48,roughnessMap:puddleMap,envMapIntensity:1.35});
    const laneGeometry=keep(new THREE.PlaneGeometry(750,.7));
    for(const z of [-2,2.2,6.4]){
      const lane=mesh(laneGeometry,wet,-45,.042,z);lane.rotation.x=-Math.PI/2;lane.receiveShadow=true;
    }
    // Small, shielded real fixtures and their soft, broken contact reflections.
    const lights=[],housings=[],reflections=[];
    for(let x=-390;x<330;x+=24){
      housings.push({x,y:.38,z:-2.75,sx:.21,sy:.12,sz:.2});
      lights.push({x,y:.383,z:-2.86,sx:.1,sy:.035,sz:.018});
      reflections.push({x:x+.25,y:.044,z:-2.05,sx:2.8,sy:.64,sz:1});
    }
    instances(box(),material({color:0x27333e,metalness:.7,roughness:.4}),housings);
    instances(box(),material({color:0xb5c8d4,emissive:0x9abfdf,emissiveIntensity:1.1}),lights);
    const reflectedLight=keep(new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
      fragmentShader:`varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float a=exp(-p.x*p.x*5.-p.y*p.y*7.);
        float ripple=.35+.65*pow(.5+.5*sin(vUv.x*173.+sin(vUv.y*37.)*4.),3.);
        gl_FragColor=vec4(.22,.35,.48,a*ripple*.11);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`}));
    // Rotate the geometry itself so instanced transforms remain on the deck.
    const reflectionGeometry=keep(new THREE.PlaneGeometry(1,1));reflectionGeometry.rotateX(-Math.PI/2);
    reflections.forEach(t=>{t.sz=t.sy;t.sy=1;});
    const reflected=instances(reflectionGeometry,reflectedLight,reflections);reflected.name='wet-contact-reflections';

    const count=500,positions=new Float32Array(count*6);
    for(let i=0;i<count;i++){const x=-50+random()*150,y=random()*19,z=-35+random()*75;positions.set([x,y,z,x-.08,y-.7,z],i*6);}
    const g=keep(new THREE.BufferGeometry());g.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const rain=new THREE.LineSegments(g,keep(new THREE.LineBasicMaterial({color:0x81b6e0,transparent:true,opacity:.18,depthWrite:false})));group.add(rain);rainResources.push(rain);
  }
  return {
    group, sky,
    update(time,frame){if(disposed)return;if(night&&rainResources[0]){rainResources[0].position.set((frame?.headX||0)-20,-(time*8)%15,0);}waterMap.offset.x=time*.012;skyMaterial.uniforms.time.value=time;},
    dispose(){if(disposed)return;disposed=true;group.traverse(object=>{if(object.isInstancedMesh)object.dispose();});for(const value of resources)value.dispose?.();group.removeFromParent();group.clear();},
  };
}

export function createReflectionEnvironment(renderer, warm = false, scenario = warm?'depot':'skybridge', hdr) {
  if(hdr){
    const source=hdr.clone(),generator=new THREE.PMREMGenerator(renderer);
    try{return generator.fromEquirectangular(source);}finally{source.dispose();generator.dispose();}
  }
  const mode=typeof scenario==='string'?scenario:scenario?.id;
  const depot=mode==='depot',night=mode==='night';
  const stage=new THREE.Scene(),sources=[],pmrem=new THREE.PMREMGenerator(renderer);
  // Linear HDR radiance: a coherent coloured sky and dark lower hemisphere
  // create shape in stainless steel rather than filling every normal with white.
  const geometry=new THREE.SphereGeometry(90,48,24);
  const sky=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    uniforms:{
      zenith:{value:new THREE.Color(night?0x315d94:depot?0x3e6c94:0x4d95d2)},
      horizon:{value:new THREE.Color(night?0x8fa5c0:depot?0xf3c18c:0xd3e6ec)},
      earth:{value:new THREE.Color(night?0x263242:depot?0x292c2b:0x3c4b48)},
      isDepot:{value:depot?1:0},isNight:{value:night?1:0},
    },
    vertexShader:'varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 vDirection;uniform vec3 zenith;uniform vec3 horizon;uniform vec3 earth;uniform float isDepot;uniform float isNight;
      void main(){vec3 d=normalize(vDirection);float h=max(0.,d.y);
        vec3 c=mix(horizon,zenith,pow(h,.42));
        float glow=pow(max(0.,dot(d,normalize(vec3(.75,.15,.35)))),24.);
        c+=mix(vec3(.42,.32,.18),vec3(.09,.16,.28),isNight)*glow;
        c=mix(earth,c,smoothstep(-.16,.035,d.y));
        // Shed roof above, long open daylight side and a warm exit at +X.
        float roof=smoothstep(.25,.48,d.y)*isDepot;
        c=mix(c,vec3(.018,.027,.032),roof*.88);
        float exit=pow(max(0.,d.x),18.)*(1.-smoothstep(.3,.65,abs(d.y)));
        c+=isDepot*exit*vec3(1.5,.82,.3);
        float city=pow(.5+.5*sin(atan(d.z,d.x)*19.),16.)*exp(-abs(d.y-.025)*55.);
        c+=isNight*city*vec3(.23,.17,.1);
        gl_FragColor=vec4(c*(1.+isNight*.1),1.);
      }`});
  stage.add(new THREE.Mesh(geometry,sky));sources.push(geometry,sky);
  const strips=depot?[
    [[-12,26,0],[66,.35,3.8],0xc6e2fa,2.1],
    [[0,15,24],[68,.45,.35],0xffc781,3.8],
    [[48,5,-2],[.4,13,15],0xffd29a,2.5],
  ]:night?[
    [[18,12,35],[55,7,.35],0x9ebeda,1.4],
    [[0,15,38],[64,.45,.35],0x9fbce4,2.3],
    [[28,6,-25],[.5,9,1.2],0xe9b978,2.5],
    [[-35,18,-12],[.4,15,1.1],0x8db7db,1.6],
  ]:[
    [[0,38,-8],[75,.45,3.8],0xd9edff,2.5],
    [[44,9,12],[.4,12,18],0xffe1ab,2.8],
  ];
  for(const [position,scale,color,intensity] of strips){
    const shape=new THREE.BoxGeometry(...scale),surface=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),toneMapped:false});
    const object=new THREE.Mesh(shape,surface);object.position.set(...position);stage.add(object);sources.push(shape,surface);
  }
  try{return pmrem.fromScene(stage,.025,.1,200);}
  finally{pmrem.dispose();for(const resource of sources)resource.dispose();stage.clear();}
}
