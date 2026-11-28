import * as THREE from '../vendor/three/three.module.js';
import { mergeGeometries } from '../vendor/three/addons/utils/BufferGeometryUtils.js';

// Vehicle-specific front curvature, window outline, lamps and seating palette.
const designs = {
  hinotori: { roof:4.04, setback:1.52, taper:.52, profile:4.4, glass:[2.96,1.61,2.04,3.8], lamps:[.48,1.93,.84,.095], seat:'#aa5547', metal:.47 },
  laview: { roof:3.91, setback:2.58, taper:.04, profile:3.9, glass:[2.99,2.25,1.46,2.02], lamps:[.99,2.02,.26,.085], seat:'#f1bb32', metal:.76 },
  'saphir-odoriko': { roof:3.94, setback:1.36, taper:.62, profile:4.8, glass:[2.88,1.96,1.64,3.5], lamps:[.88,1.55,.39,.145], seat:'#b89664', metal:.32 },
  rapit: { roof:4.11, setback:1.55, taper:1.75, profile:3.7, glass:[3.20,1.80,.88,4.0], lamps:[1.02,2.72,.22,.22], seat:'#80654f', metal:.28 },
};

function superellipse(angle, power) {
  return [Math.cos(angle), Math.sin(angle)].map(value => Math.sign(value)*Math.abs(value)**(2/power));
}

// Two-dimensional grids wrap the shell and glazing around the same analytic
// surface. No intersecting flat windshield or hand-placed nose billboard.
function surface(rows, columns, point, name) {
  const positions=[], uv=[], indices=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){
    positions.push(...point(i/rows,j/columns));
    uv.push(j/columns,i/rows);
  }
  for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){
    const a=i*(columns+1)+j,b=a+columns+1;
    indices.push(a,a+1,b,a+1,b+1,b);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.name=name;
  return geometry;
}

function panel(width, height, radius) {
  const x=-width/2,y=-height/2,s=new THREE.Shape();
  s.moveTo(x+radius,y);
  s.lineTo(-x-radius,y);s.quadraticCurveTo(-x,y,-x,y+radius);
  s.lineTo(-x,-y-radius);s.quadraticCurveTo(-x,-y,-x-radius,-y);
  s.lineTo(x+radius,-y);s.quadraticCurveTo(x,-y,x,-y-radius);
  s.lineTo(x,y+radius);s.quadraticCurveTo(x,y,x+radius,y);
  const geometry=new THREE.ShapeGeometry(s,5),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)-x)/width,(uv.getY(i)-y)/height);
  return geometry;
}

function porthole(width,height) {
  const shape=new THREE.Shape();shape.absellipse(0,0,width/2,height/2,0,Math.PI*2,false);
  const geometry=new THREE.ShapeGeometry(shape,24),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,.5+uv.getX(i)/width,.5+uv.getY(i)/height);
  return geometry;
}

function windowTexture(seat) {
  const width=96,height=64,data=new Uint8Array(width*height*4),seatColor=new THREE.Color(seat);
  seatColor.convertLinearToSRGB();
  const smooth=THREE.MathUtils.smoothstep;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const u=(x+.5)/width,v=(y+.5)/height;
    const reflection=.35+.37*v+.12*Math.sin(u*3+v*2);
    const ceiling=(1-smooth(Math.abs(v-.875-.035*u),.014,.043))*.40;
    const oppositeWindow=smooth(v,.27,.36)*(1-smooth(v,.65,.72))*
      smooth(u,.22,.27)*(1-smooth(u,.58,.67));
    const pillar=(1-smooth(Math.abs(u-.18),.012,.052))*.09;
    const pixel=[.10+.19*reflection+ceiling,.14+.22*reflection+ceiling,
      .18+.24*reflection+ceiling*.88].map((c,i)=>c+oppositeWindow*[.12,.17,.20][i]-pillar);
    for(const [center,top,span] of [[.29,.47,.19],[.72,.60,.22]]){
      const side=(u-center+.034*(v-.4))/span;
      const mask=1-smooth(Math.abs(side),.43,.53);
      const seatTop=1-smooth(v+side*side*.15,top-.04,top+.015);
      const lift=.5+.25*smooth(v,.05,.48)+.10*(1-side);
      const head=smooth(v,top-.20,top-.11)*seatTop;
      for(let i=0;i<3;i++){
        const tint=[seatColor.r,seatColor.g,seatColor.b][i]*lift+head*.08;
        pixel[i]=THREE.MathUtils.lerp(pixel[i],tint,mask*seatTop*.96);
      }
    }
    const reflectedStrip=.115*(1-smooth(Math.abs(v-.68-u*.21),.014,.065));
    const edge=smooth(u,0,.08)*(1-smooth(u,.92,1))*smooth(v,0,.10);
    data.set([...pixel.map(c=>Math.round(Math.min(1,c*.72+c*.28*edge+reflectedStrip)*255)),255],(y*width+x)*4);
  }
  const map=new THREE.DataTexture(data,width,height);
  map.colorSpace=THREE.SRGBColorSpace;
  map.magFilter=THREE.LinearFilter;
  map.minFilter=THREE.LinearMipmapLinearFilter;
  map.generateMipmaps=true;
  map.needsUpdate=true;
  return map;
}

export function createExpressModel(config) {
  const {id,cars,pitch,width,frontX,gauge}=config;
  const design=designs[id],laview=id==='laview',saphir=id==='saphir-odoriko',hinotori=id==='hinotori',rapit=id==='rapit';
  const halfWidth=width/2,bottom=rapit?.62:.85,standardRoof=3.81;
  const group=new THREE.Group();
  group.name=`reward-train-${id}`;
  const geometries=new Set(),materials=new Set(),wheels=[],batches=new Map();
  const own=geometry=>{geometries.add(geometry);return geometry;};
  const material=(name,properties)=>{
    const value=new THREE.MeshPhysicalMaterial({side:THREE.DoubleSide,...properties});
    value.name=name;
    materials.add(value);
    return value;
  };
  const body=material('CAB_PAINT',{color:config.stripes[0],metalness:design.metal,roughness:laview?.29:.26,clearcoat:.74,clearcoatRoughness:.21});
  const accent=material('LIVERY_1',{color:config.stripes[1],metalness:.39,roughness:.32,clearcoat:.4});
  const panelMetal=material('STAINLESS',{color:'#6a767c',metalness:.73,roughness:.39});
  const equipment=material('MACHINERY',{color:'#313840',metalness:.56,roughness:.62});
  const rubber=material('RUBBER',{color:'#10171d',roughness:.63});
  const glass=material('CAB_GLASS',{color:laview?'#273940':'#304652',metalness:.09,roughness:.15,clearcoat:.80,transparent:true,opacity:.73,depthWrite:false});
  const glassTexture=windowTexture(design.seat);
  const windows=material('PASSENGER_GLASS',{map:glassTexture,metalness:.08,roughness:.26,clearcoat:.62,emissive:'#ffffff',emissiveMap:glassTexture,emissiveIntensity:.19});
  const cabinPlastic=material('CAB_CONSOLE',{color:'#24313b',roughness:.72});
  const gaugePanel=material('CABIN_LIGHT_SCREEN',{color:'#a6c5c7',emissive:'#74adac',emissiveIntensity:.36});
  const headlamp=material('HEADLAMP',{color:'#fff6e5',emissive:'#fff4d9',emissiveIntensity:3.8,roughness:.18});
  const tail=material('TAILLAMP',{color:'#ba1029',emissive:'#f70e26',emissiveIntensity:1.2});
  const markerLens=material('MARKER_LENS',{color:'#471d25',roughness:.19,clearcoat:.85});
  const box=own(new THREE.BoxGeometry(1,1,1)),pantoBox=own(box.clone());
  pantoBox.name='pantograph';
  const pose=new THREE.Object3D(),carTransform=new THREE.Matrix4();
  function add(geometry, finish, x=0,y=0,z=0, sx=1,sy=1,sz=1, rx=0,ry=0,rz=0) {
    pose.position.set(x,y,z);
    pose.scale.set(sx,sy,sz);
    pose.rotation.set(rx,ry,rz);
    pose.updateMatrix();
    const key=`${geometry.uuid}/${finish.uuid}`;
    if(!batches.has(key))batches.set(key,{geometry,finish,matrices:[]});
    batches.get(key).matrices.push(new THREE.Matrix4().multiplyMatrices(carTransform,pose.matrix));
  }
  const block=(finish,...args)=>add(box,finish,...args);
  const sidePanel=(geometry,finish,x,y,side,offset)=>add(geometry,finish,x,y,side*(halfWidth+offset),1,1,1,0,side<0?Math.PI:0);
  const centre=(design.roof+bottom)/2,halfHeight=(design.roof-bottom)/2;
  function noseX(y,z) {
    const vertical=(y-centre)/halfHeight;
    const radius=(Math.abs(vertical)**design.profile+Math.abs(z/halfWidth)**design.profile)**(1/design.profile);
    const round=laview?1-Math.sqrt(Math.max(0,1-radius**2)):.59*radius**2+.41*radius**5;
    if(rapit)return frontX-design.setback*round-design.taper*(vertical+.31)*.8;
    return frontX-design.setback*round-design.taper*Math.max(0,vertical)**1.25;
  }
  function bodyTube(cab) {
    return own(surface(22,72,(u,v)=>{
      const [height,z]=superellipse(v*2*Math.PI,design.profile);
      const frontY=centre+height*halfHeight,frontZ=z*halfWidth;
      const end=cab?noseX(frontY,frontZ):frontX;
      const x=THREE.MathUtils.lerp(-frontX,end,u);
      const rise=cab?THREE.MathUtils.smoothstep(x,-6,4):0;
      const roof=THREE.MathUtils.lerp(standardRoof,design.roof,rise);
      return [x,(roof+bottom)/2+height*(roof-bottom)/2,frontZ];
    },cab?'cab-shell':'car-shell'));
  }
  const cabBody=bodyTube(true),standardBody=bodyTube(false);
  const gangway=own(panel(1.75,2.48,.17));
  function face(y, z, w, h, power, lift, name, cutout=0) {
    return own(surface(cutout?5:12,48,(u,v)=>{
      const r=THREE.MathUtils.lerp(1,cutout,u);
      const [high,wide]=superellipse(v*2*Math.PI,power);
      const py=y+high*r*h/2,pz=z+wide*r*w/2;
      return [noseX(py,pz)+lift,py,pz];
    },name));
  }
  const [glassY,glassWidth,glassHeight,glassPower]=design.glass;
  // Let the windshield see into the cab. The body and decorative mask both
  // terminate underneath the continuous rubber seal.
  const cap=own(surface(21,72,(u,v)=>{
    const angle=v*2*Math.PI;
    const [height,wide]=superellipse(angle,design.profile);
    const [glassHigh,glassWide]=superellipse(angle,glassPower);
    const y=THREE.MathUtils.lerp(centre+height*halfHeight,glassY+glassHigh*glassHeight*.485,u);
    const z=THREE.MathUtils.lerp(wide*halfWidth,glassWide*glassWidth*.485,u);
    return [noseX(y,z),y,z];
  },'cab-shell'));
  const glassRim=face(glassY,0,glassWidth+(saphir?.19:.085),glassHeight+(saphir?.23:.085),
    glassPower,.028,'cab-window-gasket',saphir?.86:.91);
  const windscreen=face(glassY,0,glassWidth,glassHeight,glassPower,.048,'cab-window-glazing');
  const cabMask=saphir?own(surface(10,48,(u,v)=>{
    const angle=v*2*Math.PI;
    const [maskY,maskZ]=superellipse(angle,4),[high,wide]=superellipse(angle,glassPower);
    const y=THREE.MathUtils.lerp(2.69+maskY*1.235,glassY+high*glassHeight*.485,u);
    const z=THREE.MathUtils.lerp(maskZ*(1.10+.13*Math.max(0,maskY)),wide*glassWidth*.485,u);
    return [noseX(y,z)+.018,y,z];
  },'cab-mask')):null;
  const couplerPocket=face(1.21,0,laview?.68:.80,.32,3.6,.022,'coupler-pocket');
  const [lampZ,lampY,lampWidth,lampHeight]=design.lamps;
  const lamps=[-1,1].map(side=>({
    rim:face(lampY,side*lampZ,lampWidth+(rapit?.065:.105),lampHeight+.071,rapit?2:3.5,.061,'lamp-housing'),
    lens:face(lampY,side*lampZ,lampWidth,lampHeight,rapit?2:3.5,.079,'nose-lamp'),
  }));
  const markerRims=rapit?[-1,1].flatMap(side=>[2.30,3.10].map(y=>({
    socket:face(y,side*1.02,.215,.215,2,.059,'marker-housing'),
    lens:face(y,side*1.02,.145,.145,2,.079,'marker-lens'),
  }))):[];
  const cheekFlutes=rapit?[-1,1].flatMap(side=>[2.26,2.69,3.08].map(y=>own(surface(8,4,(u,v)=>{
    const py=y+.18*u+(v-.5)*Math.sin(Math.PI*u)*.11,pz=side*(1.095+.26*u);
    return [noseX(py,pz)+.042+Math.sin(Math.PI*u)*.048,py,pz];
  },'cheek-flute')))):[];
  const servicePanel=rapit?own(surface(3,32,(u,v)=>{
    const z=(v-.5)*2.34,y=1.16-.23*(Math.abs(z)/1.17)**1.8+(u-.5)*.014;
    return [noseX(y,z)+.026,y,z];
  },'nose-service-panel-seam')):null;
  const lengthWindow=laview?1.58:hinotori?1.64:1.72,heightWindow=laview?1.35:hinotori?1.02:1.04;
  const windowFrame=own(rapit?porthole(.88,1.14):panel(lengthWindow+.085,heightWindow+.085,.11));
  const sideWindow=own(rapit?porthole(.80,1.06):panel(lengthWindow,heightWindow,.085));
  const doorFrame=own(panel(.83,1.99,.075)),door=own(panel(.775,1.94,.065)),doorWindow=own(panel(.31,.74,.07));
  const cabSide=own(rapit?porthole(.51,1.01):panel(laview?.60:.92,laview?.78:.7,.105));
  const skylight=own(panel(1.62,.46,.094));
  const axleParts=[];
  for(const z of [-gauge/2,gauge/2]){
    const wheel=new THREE.CylinderGeometry(.43,.43,.14,20);
    wheel.rotateX(Math.PI/2).translate(0,0,z);
    axleParts.push(wheel);
    const hub=new THREE.CylinderGeometry(.18,.18,.18,12);
    hub.rotateX(Math.PI/2).translate(0,0,z);
    axleParts.push(hub);
  }
  const shaft=new THREE.CylinderGeometry(.083,.083,gauge,8);
  shaft.rotateX(Math.PI/2);
  axleParts.push(shaft);
  const axle=own(mergeGeometries(axleParts,false));
  axleParts.forEach(part=>part.dispose());
  const metadata=[];
  for(let index=0;index<cars;index++){
    const rear=index===cars-1,cab=index===0||rear,centreX=-index*pitch;
    carTransform.makeRotationY(rear?Math.PI:0).setPosition(centreX,0,0);
    metadata.push({index,centerX:centreX,green:false,passengerDoorsPerSide:1});
    add(cab?cabBody:standardBody,body);
    add(gangway,rubber,-frontX,2.12,0,1,1,1,0,-Math.PI/2);
    if(cab){
      add(cap,body);
      if(cabMask)add(cabMask,accent);
      add(glassRim,rubber);
      add(windscreen,glass);
      for(const {rim,lens} of lamps){add(rim,rubber);add(lens,rear?tail:headlamp);}
      markerRims.forEach(({socket,lens},i)=>{add(socket,panelMetal);add(lens,i%2===0?markerLens:rubber);});
      cheekFlutes.forEach(flute=>add(flute,accent));
      if(servicePanel)add(servicePanel,rubber);
      const dashY=glassY-glassHeight*.39;
      const dashX=noseX(dashY-.22,glassWidth*.43)-.69;
      block(cabinPlastic,dashX,dashY-.16,0,.94,.27,glassWidth*.81);
      add(box,cabinPlastic,dashX-.25,dashY-.01,-.31,.32,.10,.69,0,0,-.20);
      add(box,gaugePanel,dashX-.27,dashY+.047,-.42,.16,.013,.22,0,0,-.20);
      block(cabinPlastic,dashX-1.10,dashY+.12,-.39,.17,.64,.42);
      block(cabinPlastic,dashX-1.7,dashY+.22,0,.11,1.32,2.35);
      if(!rapit){
        add(couplerPocket,rubber);
        const couplerX=noseX(1.19,0);
        block(equipment,couplerX-.18,1.19,0,.52,.20,.46);
        block(panelMetal,couplerX+.12,1.17,0,.26,.13,.28);
      }
      const wipers=own(surface(10,3,(u,v)=>{
        const y=glassY+glassHeight*THREE.MathUtils.lerp(-.40,.09,u);
        const z=glassWidth*(THREE.MathUtils.lerp(.27,.12,u)+(v-.5)*.017);
        return [noseX(y,z)+.073,y,z];
      },'windscreen-wiper'));
      add(wipers,rubber);add(wipers,rubber,0,0,0,1,1,-1);
    }else{
      add(gangway,rubber,frontX,2.12,0,1,1,1,0,Math.PI/2);
    }
    for(const side of [-1,1]){
      const doorX=cab?-frontX+1.48:frontX-1.30;
      sidePanel(doorFrame,rubber,doorX,2.02,side,.017);
      sidePanel(door,body,doorX,2.02,side,.027);
      sidePanel(doorWindow,windows,doorX,2.53,side,.035);
      block(panelMetal,doorX+.26,1.87,side*(halfWidth+.05),.028,.15,.034);
      for(let x=cab?-frontX+3.32:-frontX+1.65;x<(cab?(laview?4.9:5.7):doorX-1.12);x+=rapit?1.52:laview?2.06:2.21){
        const y=laview?2.34:hinotori&&cab?2.86:2.62;
        sidePanel(windowFrame,rubber,x,y,side,.034);
        sidePanel(sideWindow,windows,x,y,side,.046);
        if(saphir)add(skylight,glass,x,3.67,side*(halfWidth-.30),1,1,1,side*-.89,side<0?Math.PI:0);
      }
      if(cab)sidePanel(cabSide,glass,laview?6.34:6.96,3.00,side,.016);
      if(!laview&&!rapit){
        const end=cab?frontX-design.setback-.40:frontX-.36,start=-frontX+.33;
        block(accent,(start+end)/2,hinotori?1.67:3.49,side*(halfWidth-.027),end-start,hinotori?.038:.092,.065);
      }
      for(const x of [-3.7,1.2,4.3])block(equipment,x,.79,side*.64,1.65,.29,.59);
      for(const bx of [-6.8,6.8])block(equipment,bx,.65,side*(gauge/2+.17),3.05,.27,.13);
    }
    for(const bx of [-6.8,6.8])for(const dx of [-1.05,1.05]){
      const pivot=new THREE.Group();
      pivot.name='wheel-axle';
      pivot.position.set(centreX+bx+dx,.58,0);
      pivot.userData={spinAxis:'z',radius:.43};
      const mesh=new THREE.Mesh(axle,panelMetal);mesh.castShadow=mesh.receiveShadow=true;
      pivot.add(mesh);group.add(pivot);wheels.push(pivot);
    }
    for(const x of cab?[-4.6]:[-4.6,2.5]){
      block(panelMetal,x,3.83,0,2.1,.21,.91);
      for(let rib=0;rib<8;rib++)block(equipment,x-.8+rib*.22,3.947,0,.06,.027,.78);
    }
    if(config.pantographCars.includes(index)){
      add(pantoBox,panelMetal,-5.65,3.94,0,1.62,.12,1.42);
      for(const side of [-1,1]){
        add(pantoBox,equipment,-5.8,4.39,side*.35,1.18,.057,.047,0,0,.74);
        add(pantoBox,panelMetal,-5.71,5.03,side*.33,.98,.048,.045,0,0,-.88);
      }
      add(pantoBox,panelMetal,-6.05,5.40,0,.15,.055,1.79);
    }
  }
  for(const {geometry,finish,matrices} of batches.values()){
    const mesh=new THREE.InstancedMesh(geometry,finish,matrices.length);
    matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
    mesh.name=`express-${geometry.name||finish.name}`;
    mesh.castShadow=!finish.transparent&&finish!==headlamp&&finish!==tail;
    mesh.receiveShadow=!finish.transparent;
    group.add(mesh);
  }
  const length=config.carLength+(cars-1)*pitch,rearX=-(cars-1)*pitch-frontX;
  group.userData={trainId:id,carPitch:pitch,frontX,rearX,length,carCount:cars,wheelRadius:.43,spinAxis:'z',carMetadata:metadata};
  let disposed=false;
  return {group,wheels,length,front:0,frontX,rearX,carCount:cars,wheelRadius:.43,config,
    setHeadlights(level){headlamp.emissiveIntensity=3.8*level;},
    dispose(){
      if(disposed)return;
      disposed=true;
      group.removeFromParent();
      group.traverse(object=>{if(object.isInstancedMesh)object.dispose();});
      geometries.forEach(geometry=>geometry.dispose());
      materials.forEach(finish=>finish.dispose());
      glassTexture.dispose();
      group.clear();
      wheels.length=0;
    },
  };
}
