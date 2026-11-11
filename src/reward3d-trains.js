import * as THREE from '../vendor/three/three.module.js';

// Metres, railhead=.15, axle=.58. The leading cab faces +X; car centres 0,-20.6,….
// Basic formations: Yokosuka 11, Shonan-Shinjuku 10, Saikyo 10, Toyoko 8 cars.
import { REWARD_3D_TRAINS } from './reward3d-catalog.js';
export { REWARD_3D_TRAINS };

const CAR_LENGTH = 20;
const PITCH = 20.6;
const WHEEL_RADIUS = .43;
const DOORS = [-7.15,-2.4,2.4,7.15];
const MID_WINDOWS = [{x:-8.9,w:1.32},{x:-4.78,w:2.94},{x:0,w:2.98},{x:4.78,w:2.94},{x:8.9,w:1.32}];
const FRONT_WINDOWS = [{x:-8.9,w:1.32},{x:-4.78,w:2.94},{x:0,w:2.98},{x:4.78,w:2.94}];

function roundedPath(path,x,y,w,h,r=.06) {
  r=Math.min(r,w/2,h/2);
  path.moveTo(x+r,y); path.lineTo(x+w-r,y); path.quadraticCurveTo(x+w,y,x+w,y+r);
  path.lineTo(x+w,y+h-r); path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  path.lineTo(x+r,y+h); path.quadraticCurveTo(x,y+h,x,y+h-r);
  path.lineTo(x,y+r); path.quadraticCurveTo(x,y,x+r,y); path.closePath();
  return path;
}

function roundedShape(w,h,r=.06) { return roundedPath(new THREE.Shape(),-w/2,-h/2,w,h,r); }

// A shallow extruded panel with actual holes, rather than dark rectangles on a box.
function panelGeometry(length,windows,doors=DOORS) {
  const s=roundedPath(new THREE.Shape(),-length/2,1.32,length,2.2,.045);
  for(const {x,w,y=2.78,h=1.03} of windows) s.holes.push(roundedPath(new THREE.Path(),x-w/2,y-h/2,w,h,.075));
  for(const x of doors) s.holes.push(roundedPath(new THREE.Path(),x-.67,1.37,1.34,1.98,.035));
  return new THREE.ExtrudeGeometry(s,{depth:.034,bevelEnabled:false,curveSegments:4});
}

// X-running surface between rounded cross-section points [y,z].
function sweepSurface(profile,length) {
  const positions=[],indices=[],uv=[];
  for(let i=0;i<profile.length;i++) {
    const [y,z]=profile[i]; positions.push(-length/2,y,z,length/2,y,z); uv.push(0,i/(profile.length-1),1,i/(profile.length-1));
    if(i<profile.length-1) { const k=i*2; indices.push(k,k+1,k+2,k+1,k+3,k+2); }
  }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(indices); g.computeVertexNormals(); return g;
}

function mergeGeometry(parts) {
  const positions=[],normals=[],colors=[];
  for(const {geometry,color='#ffffff',matrix=new THREE.Matrix4()} of parts) {
    const g=geometry.index?geometry.toNonIndexed():geometry.clone(); g.applyMatrix4(matrix);
    const p=g.getAttribute('position'), n=g.getAttribute('normal'), c=new THREE.Color(color);
    for(let i=0;i<p.count;i++) {positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colors.push(c.r,c.g,c.b);}
    g.dispose();
  }
  const out=new THREE.BufferGeometry(); out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  out.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3)); out.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  return out;
}

function makeGlassTexture() {
  // Self-contained sky / canopy reflection, still effective without an environment.
  const w=32,h=64,data=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const t=y/(h-1),blend=THREE.MathUtils.smoothstep(t,.4,.69);
    const lower=[39,69,77,93],upper=[146,187,202,151];
    const c=lower.map((v,i)=>Math.round(THREE.MathUtils.lerp(v,upper[i],blend)));
    const i=(y*w+x)*4; data.set(c,i);
  }
  const t=new THREE.DataTexture(data,w,h,THREE.RGBAFormat); t.colorSpace=THREE.SRGBColorSpace;
  t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return t;
}

function destinationTexture(text) {
  if(typeof document==='undefined') {
    const t=new THREE.DataTexture(new Uint8Array([215,235,212,255]),1,1);t.needsUpdate=true;return t;
  }
  const c=document.createElement('canvas');c.width=512;c.height=128;
  const ctx=c.getContext('2d');ctx.fillStyle='#07100f';ctx.fillRect(0,0,c.width,c.height);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 82px "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif';
  ctx.shadowColor='#a8efd6';ctx.shadowBlur=3;ctx.fillStyle='#e7f1d8';ctx.fillText(text,256,67,480);
  ctx.shadowBlur=0;ctx.fillStyle='rgba(0,0,0,.16)';for(let y=0;y<128;y+=4)ctx.fillRect(0,y,512,1);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}

/**
 * Build one complete, independently disposable consist; no global GPU resources.
 * config may be a catalog entry, {id,…overrides}, or an id string.
 * wheels contains 4 axle Groups/car (two wheels per Group); spin rotation.z.
 */
export function createTrainModel(config=REWARD_3D_TRAINS[0]) {
  const input=typeof config==='string'?{id:config}:config;
  const base=REWARD_3D_TRAINS.find(c=>c.id===input?.id);
  if(!base) throw new RangeError(`Unknown reward train: ${input?.id}`);
  const cfg={...base,...input};
  const carCount=Math.max(2,Math.min(12,Math.round(Number(cfg.cars)||8)));
  const group=new THREE.Group();group.name=`reward-train-${cfg.id}`;
  const wheels=[], geometries=new Set(),materials=new Set(),textures=new Set(),batches=new Map();
  const ownG=g=>(geometries.add(g),g),ownT=t=>(textures.add(t),t);
  const mat=props=>{const m=new THREE.MeshPhysicalMaterial(props);materials.add(m);return m;};
  const steel=mat({color:'#bdc7ca',metalness:.82,roughness:.29,clearcoat:.22,clearcoatRoughness:.3,side:THREE.DoubleSide});
  const doorSteel=mat({color:'#cbd3d5',metalness:.8,roughness:.25,clearcoat:.25,side:THREE.DoubleSide});
  const roofMat=mat({color:'#858f95',metalness:.65,roughness:.56,side:THREE.DoubleSide});
  const trim=mat({color:'#59636a',metalness:.72,roughness:.29});
  const rubber=mat({color:'#192126',metalness:.04,roughness:.86});
  const machinery=mat({color:'#414e56',metalness:.62,roughness:.58});
  const aluminium=mat({color:'#a6b3bb',metalness:.9,roughness:.3});
  const white=mat({color:'#e3e6e3',metalness:.22,roughness:.31,clearcoat:.4});
  const faceBlack=mat({color:'#101d23',metalness:.22,roughness:.22,clearcoat:.7});
  const stripes=cfg.stripes.map(color=>mat({color,metalness:.38,roughness:.3,clearcoat:.45}));
  const glass=mat({color:'#b3d7d6',map:ownT(makeGlassTexture()),metalness:.15,roughness:.13,transparent:true,opacity:.92,depthWrite:false,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:.09,envMapIntensity:1.2});
  const cabGlass=mat({color:'#27464b',metalness:.28,roughness:.12,clearcoat:1,transparent:true,opacity:.83,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.5});
  const reflection=mat({color:'#c4e5e9',metalness:.12,roughness:.19,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide});
  const inside=mat({color:'#c6c9b9',metalness:.02,roughness:.85});
  const seat=mat({color:cfg.id==='toyoko'?'#8a5655':cfg.id==='yokosuka'?'#326f97':'#3f6879',roughness:.96});
  const greenSeat=mat({color:'#72575d',roughness:.92});
  const light=mat({color:'#fff7cf',emissive:'#ffedb3',emissiveIntensity:3.8,roughness:.18});
  const tailLight=mat({color:'#bb2435',emissive:'#ee1735',emissiveIntensity:1.8,roughness:.24});
  const cabinLight=mat({color:'#fff5d9',emissive:'#fff1cf',emissiveIntensity:.65,roughness:.6});
  const display=mat({map:ownT(destinationTexture(cfg.destination)),color:'#ffffff',emissive:'#c9ead1',emissiveMap:null,emissiveIntensity:.32,roughness:.64});
  display.emissiveMap=display.map;
  const unitBox=ownG(new THREE.BoxGeometry(1,1,1));
  const unitCylinder=ownG(new THREE.CylinderGeometry(1,1,1,10));
  const rectCache=new Map(),ringCache=new Map();
  function rect(w,h,r=.06) {
    const key=`${w}/${h}/${r}`;
    if(!rectCache.has(key)) {
      const g=ownG(new THREE.ShapeGeometry(roundedShape(w,h,r),5));
      // ShapeGeometry uses metre coordinates as UVs. Normalize for signs/glazing.
      const p=g.getAttribute('position'),uv=g.getAttribute('uv');
      for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/w+.5,p.getY(i)/h+.5);
      rectCache.set(key,g);
    }
    return rectCache.get(key);
  }
  function ring(w,h,r=.07,border=.045) {
    const key=`${w}/${h}/${r}/${border}`;
    if(!ringCache.has(key)) {const s=roundedShape(w,h,r);s.holes.push(roundedPath(new THREE.Path(),-w/2+border,-h/2+border,w-border*2,h-border*2,Math.max(.008,r-border)));
      ringCache.set(key,ownG(new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:false,curveSegments:4})));}
    return ringCache.get(key);
  }
  const helper=new THREE.Object3D(),carMatrix=new THREE.Matrix4();
  const quaternion=new THREE.Quaternion();
  let carX=0,reverse=false;
  function add(g,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0) {
    helper.position.set(x,y,z);helper.rotation.set(rx,ry,rz);helper.scale.set(sx,sy,sz);helper.updateMatrix();
    const matrix=new THREE.Matrix4().multiplyMatrices(carMatrix,helper.matrix);
    const key=`${g.uuid}/${m.uuid}`;
    if(!batches.has(key))batches.set(key,{geometry:g,material:m,matrices:[]});
    batches.get(key).matrices.push(matrix);
  }
  const box=(m,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>add(unitBox,m,x,y,z,w,h,d,rx,ry,rz);
  function rod(m,a,b,r=.025) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),direction=end.clone().sub(start);
    quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
    helper.position.copy(start.add(end).multiplyScalar(.5));helper.quaternion.copy(quaternion);helper.scale.set(r,direction.length(),r);helper.updateMatrix();
    const key=`${unitCylinder.uuid}/${m.uuid}`;
    if(!batches.has(key))batches.set(key,{geometry:unitCylinder,material:m,matrices:[]});
    batches.get(key).matrices.push(new THREE.Matrix4().multiplyMatrices(carMatrix,helper.matrix));
  }
  function sidePanel(g,m,x,y,z) {add(g,m,x,y,z,1,1,1,0,z<0?Math.PI:0);}
  function sideWindow(x,y,w,h,side,green=false) {
    const z=side*1.462;
    sidePanel(ring(w+.07,h+.07,.095,.052),rubber,x,y,z);
    sidePanel(ring(w-.025,h-.025,.055,.018),aluminium,x,y,z+side*.008);
    sidePanel(rect(w-.06,h-.06,.05),glass,x,y,z+side*.018);
    // The bright top rim and a narrow off-centre pane distinguish glass from voids.
    box(reflection,x-.12*w,y+h*.29,z+side*.024,w*.78,.026,.006);
    if(w>1.6) box(aluminium,x,y,z+side*.026,.025,h-.08,.022);
    box(green?greenSeat:seat,x,y-h*.32,side*1.18,w-.16,.32,.22);
    box(inside,x,y+h*.38,side*1.25,w-.12,.055,.11);
    box(cabinLight,x,y+h*.33,side*.96,w-.2,.027,.055);
  }
  const doorShape=roundedPath(new THREE.Shape(),-.64,1.39,1.28,1.92,.025);
  for(const x of [-.325,.325])doorShape.holes.push(roundedPath(new THREE.Path(),x-.215,2.48,.43,.68,.045));
  const doorGeometry=ownG(new THREE.ExtrudeGeometry(doorShape,{depth:.023,bevelEnabled:false,curveSegments:4}));
  function passengerDoor(x,side) {
    const z=side*1.457;
    sidePanel(doorGeometry,doorSteel,x,0,z);
    sidePanel(ring(1.38,2.04,.06,.045),trim,x,2.36,z+side*.01);
    box(rubber,x,2.35,z+side*.033,.018,1.91,.012);
    box(aluminium,x,1.37,z+side*.043,1.34,.035,.1);
    for(const dx of [-.325,.325]) {
      sidePanel(ring(.48,.73,.06,.027),rubber,x+dx,2.82,z+side*.03);
      sidePanel(rect(.425,.675,.04),glass,x+dx,2.82,z+side*.049);
      box(reflection,x+dx,3.035,z+side*.054,.34,.018,.006);
    }
    for(const dx of [-.09,.09])box(trim,x+dx,2.13,z+side*.04,.025,.12,.018);
    box(light,x+.48,3.42,z,.055,.037,.02);
  }

  const roofProfile=[[3.49,-1.45],[3.64,-1.41],[3.79,-1.28],[3.91,-1.06],[3.98,-.7],[4.015,0],[3.98,.7],[3.91,1.06],[3.79,1.28],[3.64,1.41],[3.49,1.45]];
  const bellyProfile=[[1.33,1.45],[1.2,1.38],[1.15,1.24],[1.15,-1.24],[1.2,-1.38],[1.33,-1.45]];
  const roofGeo=ownG(sweepSurface(roofProfile,19.7)),bellyGeo=ownG(sweepSurface(bellyProfile,19.72));
  const middlePanel=ownG(panelGeometry(19.7,MID_WINDOWS)),frontPanel=ownG(panelGeometry(19.7,[...FRONT_WINDOWS,{x:9.02,w:1.05,y:2.9,h:.9}]));
  const greenWindows=[];
  for(let i=0;i<8;i++)for(const y of [1.82,3.1])greenWindows.push({x:-5.92+i*1.69,w:1.46,y,h:.72});
  const greenPanel=ownG(panelGeometry(19.7,greenWindows,[-8.2,8.2]));
  const wheelProfile=[new THREE.Vector2(.13,-.09),new THREE.Vector2(.31,-.09),new THREE.Vector2(.405,-.075),new THREE.Vector2(.43,-.055),new THREE.Vector2(.43,.055),new THREE.Vector2(.415,.085),new THREE.Vector2(.452,.09),new THREE.Vector2(.452,.115),new THREE.Vector2(.36,.115),new THREE.Vector2(.31,.09),new THREE.Vector2(.13,.09),new THREE.Vector2(.13,-.09)];
  const wheelLathe=new THREE.LatheGeometry(wheelProfile,24);wheelLathe.rotateX(Math.PI/2);
  // Flange extends inwards; tread contact radius stays .43, visible flange is .452.
  const axleCylinder=new THREE.CylinderGeometry(.092,.092,1.6,10);axleCylinder.rotateX(Math.PI/2);
  const hub=new THREE.CylinderGeometry(.13,.13,.06,12);hub.rotateX(Math.PI/2);
  const wheelParts=[{geometry:axleCylinder,color:'#4f5b63'}];
  for(const side of [-1,1]) {
    wheelParts.push({geometry:wheelLathe,color:'#6c767c',matrix:new THREE.Matrix4().makeTranslation(0,0,side*.615)});
    wheelParts.push({geometry:hub,color:'#a2adb1',matrix:new THREE.Matrix4().makeTranslation(0,0,side*.75)});
    for(let k=0;k<6;k++) {
      const bolt=new THREE.BoxGeometry(.035,.035,.016);
      wheelParts.push({geometry:bolt,color:'#c2c9ca',matrix:new THREE.Matrix4().makeTranslation(.2*Math.cos(k*Math.PI/3),.2*Math.sin(k*Math.PI/3),side*.73)});
    }
  }
  const axleGeo=ownG(mergeGeometry(wheelParts));
  for(const p of new Set(wheelParts.map(p=>p.geometry)))p.dispose();
  const axleMat=mat({color:'#ffffff',vertexColors:true,metalness:.83,roughness:.4});
  function bogie(x) {
    box(machinery,x,.87,0,3.24,.23,2.03);
    for(const s of [-1,1]) {
      box(machinery,x,.66,s*.96,3.1,.18,.16);
      rod(machinery,[x-1.25,.68,s*.99],[x+.3,.85,s*.99],.065);
      for(const dx of [-.7,.7]) {
        add(unitCylinder,rubber,x+dx,1.02,s*.77,.28,.15,.28);
        add(unitCylinder,aluminium,x+dx,1.105,s*.77,.27,.035,.27);
      }
      for(const dx of [-1.05,1.05]) {
        box(machinery,x+dx,.58,s*.92,.3,.29,.22);
        add(unitCylinder,trim,x+dx,.6,s*1.05,.105,.065,.105,Math.PI/2);
        for(let k=0;k<3;k++)box(aluminium,x+dx,.77+k*.035,s*.97,.3,.015,.15);
      }
    }
    for(const dx of [-1.05,1.05]) {
      const pivot=new THREE.Group();pivot.name='wheel-axle';pivot.userData.spinAxis='z';pivot.userData.radius=WHEEL_RADIUS;
      // Keep all spin axes in train coordinates, including the reversed last cab.
      pivot.position.set(x+dx,.58,0).applyMatrix4(carMatrix);
      const mesh=new THREE.Mesh(axleGeo,axleMat);mesh.castShadow=true;mesh.receiveShadow=true;pivot.add(mesh);group.add(pivot);wheels.push(pivot);
    }
  }
  function roofEquipment(i,green) {
    // Ribbed air conditioning housing and dark recessed condenser grilles.
    const acPositions=cfg.family==='5050'?[-4.2,4.2]:[0];
    for(const x of acPositions) {
      box(roofMat,x,4.145,0,cfg.family==='5050'?3.45:5.8,.28,1.56);
      const span=cfg.family==='5050'?2.95:5.2;
      box(trim,x,4.29,0,span,.018,1.12);
      for(let k=0;k<19;k++)box(aluminium,x-span/2+k*span/18,4.307,0,.032,.025,1.08);
      for(const z of [-.69,.69])box(aluminium,x,4.2,z,span,.14,.04);
    }
    for(const s of [-1,1])box(trim,0,3.71,s*1.397,19.4,.025,.025);
    if(!green && i>0 && i<carCount-1 && cfg.pantographCars.includes(i)) {
      const px=-6;
      for(const x of [px-.6,px+.6])for(const z of [-.5,.5]) {
        add(unitCylinder,white,x,4.13,z,.09,.2,.09);
        add(unitCylinder,white,x,4.23,z,.14,.027,.14);
      }
      box(machinery,px,4.28,0,1.65,.075,1.25);
      for(const z of [-.44,.44]) {
        rod(trim,[px-.55,4.32,z],[px+.32,4.88,z],.04);
        rod(aluminium,[px+.32,4.88,z],[px-.05,5.4,z],.033);
        rod(trim,[px-.48,4.35,z],[px+.39,4.88,z],.019);
      }
      box(machinery,px-.05,5.42,0,.16,.07,1.68);box(aluminium,px-.05,5.465,0,.075,.025,1.8);
    }
    if(i===0 || i===carCount-1) {
      box(white,8.2,4.12,0,.47,.18,.36);
      rod(machinery,[8.2,4.15,0],[8.2,4.46,0],.018);
      box(roofMat,7.2,4.09,0,.5,.14,.58);
    }
  }
  function underfloor(green,i) {
    box(machinery,0,1.12,0,18.5,.16,2.42);
    if(!green)for(let k=0;k<5;k++) {
      const x=-4.2+k*2.05;
      box(k%2?machinery:aluminium,x,.81,0,1.72,.46,1.55);
      for(const s of [-1,1]) {
        box(trim,x,.82,s*.79,1.54,.3,.023);
        for(let j=0;j<8;j++)box(aluminium,x-.66+j*.19,.82,s*.81,.028,.255,.014);
        box(aluminium,x,.59,s*.75,1.77,.035,.055);
      }
    }
    if(!green) {rod(machinery,[-4.8,.7,-1],[4.9,.7,-1],.045);box(machinery,-2,.54,.2,1.25,.11,.9);}
    bogie(-6.8);bogie(6.8);
    for(const s of [-1,1])box(trim,0,1.17,s*1.35,19.6,.07,.075);
  }
  function sideLivery(green,front) {
    for(const s of [-1,1]) {
      const z=s*1.498;
      if(green) {
        box(stripes[0],0,2.44,z,19.5,.17,.012);
        if(stripes[1])box(stripes[1],0,2.25,z,19.5,.19,.012);
      } else {
        // Belt passes over the closed door leaves, as on the real stainless cars.
        box(stripes[0],0,2.08,z,19.48,.17,.012);
        if(stripes[1])box(stripes[1],0,1.91,z,19.48,.16,.012);
        if(cfg.family==='e235')box(stripes[0],0,3.46,z,19.4,.08,.012);
      }
      // Brushed seams, skirt reveal, door release buttons and car-end handrails.
      box(aluminium,0,1.48,s*1.471,19.45,.025,.02);
      for(const x of [-9.5,-6.25,-3.32,-1.52,1.52,3.32,6.25,9.5]) {
        if(front&&x>8)continue;
        box(trim,x,1.72,s*1.474,.008,.43,.009);
      }
      for(const x of [-9.46,9.46]) {
        if(front&&x>0)continue;
        rod(aluminium,[x,1.75,s*1.53],[x,2.62,s*1.53],.018);
        for(const y of [1.77,2.6])rod(aluminium,[x,y,s*1.47],[x,y,s*1.53],.018);
      }
      if(cfg.family!=='5050'&&!green)for(const x of DOORS)box(stripes[0],x+.82,2.38,s*1.493,.085,.12,.025);
      // A small side LED sign remains legible when the camera runs beside the cab.
      const plane=rect(1.18,.26,.018);
      sidePanel(plane,faceBlack,-4.85,3.48,s*1.477);
      sidePanel(rect(1.05,.21,.01),display,-4.85,3.48,s*1.495);
    }
  }

  // Rounded cab end cross-section. Local u is horizontal across the face, v is Y.
  const faceShape=new THREE.Shape();
  faceShape.moveTo(-1.23,1.23);faceShape.quadraticCurveTo(-1.43,1.25,-1.43,1.48);
  faceShape.lineTo(-1.43,3.45);faceShape.quadraticCurveTo(-1.42,3.88,-.99,3.96);
  faceShape.quadraticCurveTo(0,4.06,.99,3.96);faceShape.quadraticCurveTo(1.42,3.88,1.43,3.45);
  faceShape.lineTo(1.43,1.48);faceShape.quadraticCurveTo(1.43,1.25,1.23,1.23);faceShape.closePath();
  const faceGeo=ownG(new THREE.ExtrudeGeometry(faceShape,{depth:.16,bevelEnabled:true,bevelSize:.07,bevelThickness:.055,bevelSegments:3,curveSegments:7}));
  // Face planes have their normal +X; the plane's horizontal coordinate is -Z.
  function frontPlane(g,m,y,z=0,x=9.96) {add(g,m,x,y,z,1,1,1,0,Math.PI/2,0);}
  function frontRect(m,y,z,w,h,x=9.97,r=.04) {frontPlane(rect(w,h,r),m,y,z,x);}
  function frontRing(m,y,z,w,h,x=9.985,b=.04) {frontPlane(ring(w,h,.07,b),m,y,z,x);}
  function cab(rear=false) {
    const e235=cfg.family==='e235',tokyu=cfg.family==='5050',suburban=cfg.family==='e233-suburban';
    add(faceGeo,tokyu?steel:white,9.76,0,0,1,1,1,0,Math.PI/2);
    // A different mask, glazing layout and lamp arrangement for every cab family.
    if(e235) {
      frontRect(faceBlack,2.95,0,2.55,1.87,9.985,.2);
      for(const s of [-1,1]) {
        frontRect(stripes[0],2.61,s*1.22,.19,2.35,10.004,.06);
        frontRect(stripes[1],2.61,s*1.04,.17,2.35,10.009,.035);
      }
      frontRect(cabGlass,2.85,0,1.9,1.05,10.025,.1);
      frontRing(trim,2.85,0,1.98,1.12,10.035,.035);
      frontRect(faceBlack,3.61,0,1.46,.34,10.03);
      frontRect(display,3.61,0,1.3,.27,10.047,.015);
      for(const s of [-1,1]) {
        frontRect(trim,3.73,s*.99,.39,.17,10.03);
        for(const dz of [-.095,.095])frontRect(rear?tailLight:light,3.73,s*.99+dz,.14,.09,10.05,.025);
      }
      frontRect(white,1.8,0,1.89,.52,10.01,.07);
    } else if(tokyu) {
      frontRect(faceBlack,2.95,0,2.64,1.83,9.99,.15);
      // The traditional 5050 has an offset black emergency door, not a silver bar.
      frontRect(cabGlass,2.91,-.62,1.06,1.14,10.023,.06);
      frontRect(cabGlass,2.91,1.01,.36,1.14,10.023,.06);
      frontRect(faceBlack,2.52,.32,.62,2.08,10.033,.035);
      frontRect(white,1.75,.32,.59,.53,10.043,.015);
      frontRing(rubber,2.52,.32,.66,2.14,10.053,.025);
      frontRect(cabGlass,2.97,.32,.45,.94,10.064,.03);
      frontRect(stripes[0],2.045,0,2.6,.105,10.07,.025);
      frontRect(trim,2.24,.1,.025,.13,10.08,.01);
      frontRect(faceBlack,3.63,-.37,1.4,.29,10.025,.025);
      frontRect(display,3.63,-.37,1.26,.23,10.045,.01);
      for(const s of [-1,1]) {
        frontRect(trim,1.64,s*.96,.48,.23,10.01,.08);
        frontRect(rear?tailLight:light,1.64,s*1.05,.15,.13,10.035,.06);
        frontRect(rear?tailLight:white,1.64,s*.84,.14,.1,10.035,.035);
      }
    } else {
      frontRect(faceBlack,2.99,0,2.59,1.72,9.985,.18);
      frontRect(cabGlass,2.88,0,2.26,1.04,10.017,.1);
      frontRing(trim,2.88,0,2.34,1.11,10.025,.035);
      frontRect(faceBlack,3.62,0,1.55,.31,10.025,.03);
      frontRect(display,3.62,0,1.38,.24,10.043,.01);
      frontRect(stripes[0],2.02,0,2.63,.21,10.025,.035);
      if(suburban)frontRect(stripes[1],1.81,0,2.63,.19,10.027,.025);
      for(const s of [-1,1]) {
        frontRect(trim,3.66,s*1.025,.38,.19,10.025,.045);
        for(const dz of [-.085,.085])frontRect(rear?tailLight:light,3.66,s*1.025+dz,.125,.11,10.046,.025);
        frontRect(rear?tailLight:rubber,2.22,s*1.17,.135,.085,10.042,.025);
      }
    }
    // Cab interior, two windshield wipers, handrail, antenna and sculpted skirt.
    box(machinery,9.4,2.39,0,.28,.2,2.15);
    for(const s of [-1,1]) {
      rod(rubber,[10.07,2.43,s*.67],[10.08,2.82,s*.83],.017);
      rod(rubber,[10.085,2.68,s*.77],[10.085,3.05,s*.85],.021);
      frontRect(reflection,3.15,s*.6,.52,.035,10.08,.005);
      rod(aluminium,[10.015,1.51,s*.77],[10.015,1.76,s*.77],.018);
    }
    // Chamfered anti-climber / skirt is a tapered prism, not a square bumper.
    const skirtShape=new THREE.Shape();skirtShape.moveTo(-1.3,1.35);skirtShape.lineTo(1.3,1.35);skirtShape.lineTo(1.05,.55);skirtShape.lineTo(.38,.57);skirtShape.lineTo(.32,.88);skirtShape.lineTo(-.32,.88);skirtShape.lineTo(-.38,.57);skirtShape.lineTo(-1.05,.55);skirtShape.closePath();
    const skirtGeo=ownG(new THREE.ExtrudeGeometry(skirtShape,{depth:.23,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2}));
    add(skirtGeo,tokyu?aluminium:white,9.64,0,0,1,1,1,0,Math.PI/2);
    box(machinery,10.04,.92,0,.44,.2,.25);box(trim,10.19,.92,0,.16,.27,.39);
    for(const s of [-1,1])rod(rubber,[9.78,1.1,s*.4],[9.99,.73,s*.43],.045);
    // A proper driver's side window and small separate crew door behind the face.
    for(const s of [-1,1]) {
      sideWindow(9.02,2.9,1.05,.9,s);
      box(trim,8.22,2.28,s*1.491,.016,1.84,.016);
      box(trim,8.62,2.05,s*1.504,.025,.18,.025);
    }
  }

  function gangway(x) {
    carMatrix.identity();
    box(rubber,x,2.31,0,.64,2.08,1.22);
    for(let k=0;k<7;k++) {
      const xx=x-.27+k*.09;
      box(trim,xx,3.36,0,.035,.07,1.31);box(trim,xx,1.28,0,.035,.07,1.31);
      for(const s of [-1,1])box(machinery,xx,2.32,s*.65,.035,2.13,.065);
    }
    box(machinery,x,.9,0,.65,.16,.28);
  }

  const carMetadata=[];
  for(let i=0;i<carCount;i++) {
    carX=-PITCH*i;reverse=i===carCount-1;
    carMatrix.compose(new THREE.Vector3(carX,0,0),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),reverse?Math.PI:0),new THREE.Vector3(1,1,1));
    const front=i===0 || reverse,green=!front&&cfg.greenCars.includes(i);
    carMetadata.push({index:i,centerX:carX,green,passengerDoorsPerSide:green?2:4});
    add(roofGeo,roofMat,0,0,0);add(bellyGeo,steel,0,0,0);
    const pg=green?greenPanel:front?frontPanel:middlePanel;
    for(const s of [-1,1]) {
      // Both side skins use the same X coordinates; DoubleSide handles -Z normals.
      add(pg,steel,0,0,s*1.449,1,1,1,0,0,0);
      const windows=green?greenWindows:front?FRONT_WINDOWS:MID_WINDOWS;
      for(const w of windows)sideWindow(w.x,w.y??2.78,w.w,w.h??1.03,s,green);
      for(const x of green?[-8.2,8.2]:DOORS)passengerDoor(x,s);
    }
    box(inside,0,3.48,0,18.8,.035,2.52);
    box(inside,0,1.46,0,18.8,.06,2.55);
    if(green) {
      box(inside,0,2.48,0,13.8,.08,2.6);
      for(const y of [1.51,2.84])for(let j=0;j<10;j++)for(const s of [-1,1])box(greenSeat,-6.25+j*1.38,y,s*.81,.53,.46,.6);
      // Green-car clover emblem is constructed from four tiny rounded leaves.
      for(const s of [-1,1])for(const [dx,dy] of [[-.055,0],[.055,0],[0,-.055],[0,.055]])sidePanel(rect(.1,.1,.045),stripes[stripes.length-1],-7.1+dx,2.68+dy,s*1.502);
    }
    underfloor(green,i);roofEquipment(i,green);sideLivery(green,front);
    // Stainless end walls and recessed inter-car doorway.
    for(const end of [-1,1]) {
      if(front&&end===1)continue;
      box(steel,end*9.83,2.4,0,.06,2.3,2.65);
      box(rubber,end*9.88,2.34,0,.06,1.94,.96);
      box(cabGlass,end*9.92,2.7,0,.014,.54,.53);
    }
    if(front)cab(reverse);
  }
  for(let i=0;i<carCount-1;i++)gangway(-PITCH*i-10.3);
  carMatrix.identity();
  for(const {geometry,material,matrices} of batches.values()) {
    const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);
    matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;
    mesh.name=`train-${material===glass?'glazing':material===steel?'stainless':'detail'}`;
    mesh.castShadow=!material.transparent&&material!==cabinLight&&material!==display;
    mesh.receiveShadow=!material.transparent;
    mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);
  }
  const length=CAR_LENGTH+(carCount-1)*PITCH;
  group.userData={trainId:cfg.id,front:0,frontX:10.3,rearX:-PITCH*(carCount-1)-10.3,length,carCount,wheelRadius:WHEEL_RADIUS,spinAxis:'z',carMetadata};
  let disposed=false;
  return {group,wheels,length,front:0,frontX:10.3,rearX:group.userData.rearX,carCount,wheelRadius:WHEEL_RADIUS,config:cfg,
    dispose() {if(disposed)return;disposed=true;group.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();group.clear();wheels.length=0;},
  };
}
