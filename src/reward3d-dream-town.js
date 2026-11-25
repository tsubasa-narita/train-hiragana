import * as THREE from '../vendor/three/three.module.js';
import { mergeGeometries } from '../vendor/three/addons/utils/BufferGeometryUtils.js';

// Unit box with softened mould edges. The flat top still takes decals and trim.
export function mouldedBox(radius=.027) {
  const s=new THREE.Shape();
  s.moveTo(-.5+radius,-.5+radius);
  s.lineTo(.5-radius,-.5+radius);s.lineTo(.5-radius,.5-radius);s.lineTo(-.5+radius,.5-radius);s.closePath();
  return new THREE.ExtrudeGeometry(s,{depth:1-2*radius,bevelThickness:radius,bevelSize:radius,bevelSegments:2})
    .translate(0,0,-.5+radius);
}

function hipRoof(hip) {
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([
    -.5,0,-.5, -.5,0,.5, .5,0,.5, .5,0,-.5, -hip,1,0, hip,1,0,
  ],3));
  g.setIndex([0,5,3,0,4,5,1,2,5,1,5,4,0,1,4,3,5,2,0,3,2,0,2,1]);
  const roof=g.toNonIndexed();g.dispose();roof.computeVertexNormals();
  return roof;
}

function buildingModels(kit) {
  const {own,box,material,batch,random}=kit;
  const walls=[], gable=[], hipped=[], tileRows=[], ridges=[], trim=[], recesses=[], glazing=[], fine=[], fences=[], posts=[], leaves=[];
  const paint=[0xf5c785,0xf3e0be,0xe3a382,0xa2c8ad,0xa5c8d7,0xe8d5af];
  const tiles=[0xbb6955,0x536576,0x507d7d,0x846155,0x916279];

  function window(x,y,z,w,h,side,tint){
    // The surrounding moulding, glass and sash catch different highlights.
    recesses.push([x,y,z,w+.13,h+.13,.13,side,0,0,0x616066]);
    const dx=Math.sin(side)*.084,dz=Math.cos(side)*.084;
    glazing.push([x+dx,y,z+dz,w,h,.043,side,0,0,tint]);
    for(const [ww,hh] of [[w,.049],[.046,h]])fine.push([x+dx*1.29,y,z+dz*1.29,ww,hh,.044,side,0,0,0xf1e4cc]);
  }

  function house(x,z,i,row){
    const shop=i===2&&row===1,hip=i%2===0;
    const w=(shop?8.2:6.0)+random()*1.5,d=4.8+random()*1.5,h=(shop?4.1:3.7)+random()*3.2;
    const rise=1.2+random()*(shop?.7:1.65),base=-.48,roofY=h+base;
    const wall=paint[Math.floor(random()*paint.length)],tile=tiles[Math.floor(random()*tiles.length)];
    const aw=w+.62,ad=d+.62;
    walls.push([x,base+h/2,z,w,h,d,0,0,0,wall]);
    (hip?hipped:gable).push([x,roofY,z,aw,rise,ad,0,0,0,tile]);
    ridges.push([x,roofY+rise+.05,z,aw*(hip?.64:1.01),.125,.19,0,0,0,tile]);
    const pitch=Math.atan2(rise,ad*.5);
    for(const side of [-1,1]){
      for(let j=1;j<=5;j++){
        const f=j/6;
        tileRows.push([x,roofY+rise*f+.027,z+side*ad*.5*(1-f),aw*(hip?1-.36*f:1)-.045,.05,.086,
          0,side*pitch,0,tile]);
      }
      trim.push([x,roofY-.08,z+side*ad*.505,aw,.16,.145,0,0,0,0xe6d5b7]);
    }
    trim.push([x,base+.23,z,w+.073,.46,d+.073,0,0,0,0x8f9386]);
    for(const side of [-1,1])trim.push([x+side*(w*.5-.12),roofY/2,z-d/2-.029,.18,h-.22,.10,0,0,0,0xe7d5b9]);
    const front=z-d/2,doorX=x+w*.08;
    recesses.push([doorX,base+1.05,front-.06,1.18,2.1,.17,0,0,0,0x61584e]);
    trim.push([doorX,base+1.05,front-.154,.98,1.90,.067,0,0,0,shop?0xa5644f:0x876156],
      [doorX,base+.14,front-.39,1.39,.28,.61,0,0,0,0xc4b49d]);
    fine.push([doorX+.29,base+1.01,front-.209,.08,.083,.07,0,0,0,0xd8bf8e]);
    for(const side of [-1,1]){
      window(x+side*w*.30,base+1.58,front-.103,shop?1.65:1.04,1.1,Math.PI,0x82aab4);
      window(x+side*w*.28,roofY-1.30,front-.103,1.06,1.04,Math.PI,0xe1c581);
      window(x+side*(w*.5+.065),roofY-1.57,z+.38,.94,1.0,side*Math.PI/2,0xa1b9bc);
      trim.push([x+side*w*.28,roofY-1.91,front-.13,1.29,.12,.29,0,0,0,0xf7e5c8]);
    }
    if(shop){
      const awningW=w*.80;
      trim.push([x,base+2.88,front-.59,awningW,.13,1.21,0,-.19,0,0xa55344]);
      for(let j=0;j<7;j++)fine.push([x+awningW*((j+.5)/7-.5),base+2.84,front-1.173,awningW/7,.19,.067,0,0,0,j%2?0xf2d8a9:0xb75d4c]);
    }else if(i%3===1){
      const chimneyX=x+w*.30;
      trim.push([chimneyX,roofY+rise*.57,z+.59,.55,1.56,.62,0,0,0,0xae7969],
        [chimneyX,roofY+rise*.57+.79,z+.59,.71,.17,.70,0,0,0,0x7e6156]);
    }
    const tx=x-w*.61,tz=front-.65;
    posts.push([tx,.47,tz,.24,1.7,.25]);
    const green=[0x659975,0x91a55b,0x548f66][i%3];
    leaves.push([tx,1.66,tz,.92,1.23,.91,0,0,0,green], [tx+.42,1.54,tz-.13,.54,.79,.65,0,0,0,green]);
    if((i+row)%3===0){
      fences.push([x+w*.34,.13,front-.98,2.30,.066,.11]);
      for(let j=0;j<7;j++)fences.push([x+w*.34+(j-3)*.33,.22,front-.98,.085,.81,.09]);
    }
  }
  for(const centre of [-101,-31,39,109,179,249]){
    for(const [row,z] of [[0,12.7],[1,36.3]]){
      for(let i=0;i<5;i++)house(centre+(i-2)*10.8,z,i,row);
    }
  }
  batch(own(mouldedBox()),material({color:0xffffff}),walls,true).name='moulded-miniature-houses';
  const roofFinish=material({color:0xffffff,roughness:.84});
  batch(own(hipRoof(.50)),roofFinish,gable,true);
  batch(own(hipRoof(.32)),roofFinish,hipped,true);
  batch(box,roofFinish,[...tileRows,...ridges]).name='roof-tile-courses';
  const moulding=material({color:0xffffff,roughness:.69});
  batch(box,moulding,[...trim,...recesses,...fine]);
  batch(box,material({color:0xffffff,metalness:.13,roughness:.27,emissive:0x496a78,emissiveIntensity:.071}),glazing);
  batch(box,material({color:0xe7d3a6}),fences);
  batch(box,material({color:0x785545}),posts);
  batch(own(new THREE.IcosahedronGeometry(1,1)),material({color:0xffffff,roughness:.94}),leaves,true);
}

function stationModels(kit) {
  const {own,box,mesh,batch,material,glow}=kit;
  const platforms=[],trim=[],structure=[], panels=[], lights=[], tile=[], seats=[];
  const roof=own(hipRoof(.46));
  const clock=own(new THREE.CylinderGeometry(1,1,1,24));clock.rotateX(Math.PI/2);
  const rim=material({color:0x334c58,roughness:.42}), face=glow(0xffefd7,.7), hand=material({color:0x263b41});
  for(const x of [-27,116]){
    platforms.push([x,.185,4.85,38,.92,4.29]);
    trim.push([x,.657,2.78,37.55,.036,.15]);
    for(let i=-17;i<=17;i++)tile.push([x+i*1.05,.658,3.0,.32,.022,.10]);
    panels.push([x-.9,4.31,5.06,29.1,1.07,3.75]);
    structure.push([x-.9,4.298,3.16,29.09,.16,.141], [x-.9,4.298,6.96,29.09,.16,.141]);
    for(let i=-12;i<=12;i+=6){
      structure.push([x+i,2.46,5.32,.22,3.61,.23], [x+i,4.18,5.07,.19,.21,3.54],
        [x+i,3.86,4.78,.13,1.23,.14,0,.96], [x+i,3.86,5.85,.13,1.23,.14,0,-.96]);
      lights.push([x+i-.3,4.02,4.60,1.24,.079,.19]);
    }
    for(const dx of [-8,6,15])seats.push([x+dx,1.10,5.77,2.46,.15,.55], [x+dx,1.43,6.01,2.46,.51,.10]);
    for(const [end,step] of [[-1,.22],[1,.41]])platforms.push([x+end*19.12,step/2,4.82,.7,step,2.03]);
    mesh(clock,rim,x+7.3,3.40,3.151,.49,.49,.13);
    mesh(clock,face,x+7.3,3.40,3.069,.422,.422,.061);
    mesh(box,hand,x+7.31,3.51,3.03,.046,.249,.041).rotation.z=.41;
    mesh(box,hand,x+7.42,3.37,3.03,.26,.041,.041).rotation.z=-.27;
  }
  batch(own(mouldedBox(.014)),material({color:0xcdb59b}),platforms).name='station-platform-and-steps';
  batch(box,material({color:0xe5b84f,roughness:.84}),[...trim,...tile]);
  batch(roof,material({color:0x3c7482,roughness:.41}),panels,true);
  batch(box,material({color:0x506d70,roughness:.65}),structure);
  batch(box,glow(0xf8dfb9,.86),lights);
  batch(box,material({color:0xa17a5d}),seats);
}

export function buildModelTown(kit, length) {
  const {box,own,mesh,batch,material,glow}=kit;
  buildingModels(kit);stationModels(kit);
  mesh(box,material({color:0x5b646a}),0,-.46,23,length,.13,8.7);
  mesh(box,material({color:0xcbc1a3}),0,-.50,23,length,.19,10.45);
  const paint=[],curb=[],lamps=[],bulbs=[];
  for(let x=-318;x<=318;x+=8)paint.push([x,-.383,23,3.4,.022,.12]);
  for(const x of [-101,-31,39,109,179,249]){
    for(let j=0;j<6;j++)paint.push([x-4+j*1.55,-.377,23,.77,.019,6.1]);
    for(const side of [-1,1]){
      const z=23+side*4.83,px=x-6.5;
      curb.push([x,-.329,z,19,.086,.35]);
      lamps.push([px,1.16,z,.14,3.08,.15], [px,2.719,z-side*.34,.19,.12,.77]);
      bulbs.push([px,2.641,z-side*.66,.34,.083,.37]);
    }
  }
  batch(box,material({color:0xeadaac}),paint);
  batch(box,material({color:0xdfcfb0}),curb);
  batch(box,material({color:0x647a7f}),lamps);
  batch(own(mouldedBox(.08)),glow(0xffe5b8,.55),bulbs);
}

function automodel(points,width,rounding){
  const shape=new THREE.Shape();
  points.forEach(([x,y],i)=>shape[i?'lineTo':'moveTo'](x,y));shape.closePath();
  return new THREE.ExtrudeGeometry(shape,{depth:width-2*rounding,bevelThickness:rounding,bevelSize:rounding,bevelSegments:2})
    .translate(0,0,-width/2+rounding);
}

function wheelSet(radius,depth){
  const parts=[];
  for(const x of [-.96,.98])for(const side of [-1,1])parts.push(new THREE.CylinderGeometry(radius,radius,depth,12)
    .rotateX(Math.PI/2).translate(x,.18,side*.65));
  const geometry=mergeGeometries(parts);parts.forEach(part=>part.dispose());
  return geometry;
}

export function buildModelCars(kit,reduced){
  const {own,material,mesh,box,group,random}=kit;
  const wheels=own(wheelSet(.28,.18)),hubs=own(wheelSet(.13,.206));
  const lower=own(automodel([[-1.50,.24],[-1.51,.58],[-1.15,.72],[.96,.69],[1.46,.50],[1.50,.26]],1.33,.062));
  const glass=own(automodel([[-.99,.62],[-.64,1.08],[.32,1.08],[.82,.65]],1.19,.036));
  const van=own(automodel([[-1.31,.55],[-1.30,1.32],[.26,1.32],[.72,.61]],1.25,.055));
  const tires=material({color:0x303738,roughness:.96}),rims=material({color:0xc6c2ae,metalness:.30});
  const windows=material({color:0x426774,roughness:.26,metalness:.24});
  const lamp=material({color:0xf4e6c7,emissive:0x7f5e39,emissiveIntensity:.28});
  const bodyMats=[0xd16b53,0xe7b451,0x6f9eb6,0x6d9c78,0xc88669].map(color=>material({color,roughness:.34}));
  const cars=[];
  for(let i=0;i<12;i++){
    const car=new THREE.Group(),finish=bodyMats[i%bodyMats.length],isVan=i%5===1;
    car.add(mesh(lower,finish),mesh(isVan?van:glass,isVan?finish:windows),mesh(wheels,tires),mesh(hubs,rims));
    if(isVan)car.add(mesh(box,windows,.465,.915,0,.136,.36,1.12));
    else car.add(mesh(box,finish,-.14,1.106,0,1.00,.087,1.14));
    for(const side of [-1,1])car.add(mesh(box,lamp,1.47,.469,side*.484,.14,.14,.22));
    const direction=i%2===0?1:-1;
    car.rotation.y=direction>0?0:Math.PI;group.add(car);
    cars.push({car,direction,z:23+direction*2.2,start:-310+i*53+random()*13});
  }
  return time=>{
    for(const {car,direction,z,start} of cars){
      const travel=reduced?0:time*7.7*direction;
      car.position.set(THREE.MathUtils.euclideanModulo(start+320+travel,640)-320,-.28,z);
    }
  };
}
