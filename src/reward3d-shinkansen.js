import * as THREE from '../vendor/three/three.module.js';

const smooth=(a,b,t)=>a+(b-a)*t;
function rounded(w,h,r){
  const p=new THREE.Shape(),x=-w/2,y=-h/2;
  p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);
  p.lineTo(x+w,y+h-r);p.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  p.lineTo(x+r,y+h);p.quadraticCurveTo(x,y+h,x,y+h-r);p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);return p;
}
function hermite(knots,x,k){
  let i=0;while(i<knots.length-2&&x>knots[i+1][0])i++;
  const a=knots[i],b=knots[i+1],dx=b[0]-a[0],t=THREE.MathUtils.clamp((x-a[0])/dx,0,1);
  const before=knots[Math.max(0,i-1)],after=knots[Math.min(knots.length-1,i+2)];
  const ma=(b[k]-before[k])/(b[0]-before[0]),mb=(after[k]-a[k])/(after[0]-a[0]);
  return (2*t*t*t-3*t*t+1)*a[k]+(t*t*t-2*t*t+t)*dx*ma+(-2*t*t*t+3*t*t)*b[k]+(t*t*t-t*t)*dx*mb;
}

// Independently shaped E5 and E6. The reference axis is the car centre, +X is
// the nose, Y is up. Leading car length includes its additional nose overhang.
export function createShinkansenModel(cfg){
  const e5=cfg.family==='e5',lengthBody=cfg.carLength,pitch=cfg.pitch,front=cfg.frontX,half=lengthBody/2,hw=cfg.width/2;
  const group=new THREE.Group();group.name=`reward-train-${cfg.id}`;
  const resources={g:new Set(),m:new Set(),t:new Set()},wheels=[],batches=new Map();
  const own=g=>(resources.g.add(g),g),mat=(name,props)=>{const m=new THREE.MeshPhysicalMaterial(props);m.name=name;resources.m.add(m);return m;};
  const white=mat('CAB_PAINT',{color:'#e6e9e8',roughness:.23,metalness:.17,clearcoat:.75,clearcoatRoughness:.16,side:THREE.DoubleSide});
  const paint=mat('LIVERY_0',{color:cfg.stripes[0],roughness:.22,metalness:.25,clearcoat:.85,clearcoatRoughness:.13,side:THREE.DoubleSide});
  const belt=mat('LIVERY_1',{color:cfg.stripes[1],roughness:.28,metalness:.4,clearcoat:.5,side:THREE.DoubleSide});
  const steel=mat('STAINLESS',{color:'#74858e',metalness:.83,roughness:.32});
  const dark=mat('MACHINERY',{color:'#27343d',metalness:.62,roughness:.48});
  const rubber=mat('RUBBER',{color:'#111b22',roughness:.76,side:THREE.DoubleSide});
  const headlamp=mat('HEADLAMP',{color:'#fff6df',emissive:'#fff1ce',emissiveIntensity:3.8,roughness:.15,side:THREE.DoubleSide});
  const tail=mat('TAILLAMP',{color:'#e63743',emissive:'#ed1b34',emissiveIntensity:1.8,side:THREE.DoubleSide});
  const cabin=mat('CABIN_LIGHT',{color:'#fff2d3',emissive:'#ffe8bd',emissiveIntensity:.35,roughness:.6});
  const reflectionData=new Uint8Array(16*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<16;x++){const t=y/63;reflectionData.set([30+60*t,49+72*t,60+76*t,255].map(Math.round),(y*16+x)*4);}
  const reflection=new THREE.DataTexture(reflectionData,16,64);reflection.colorSpace=THREE.SRGBColorSpace;reflection.magFilter=THREE.LinearFilter;reflection.needsUpdate=true;resources.t.add(reflection);
  const glass=mat('GLASS',{color:'#7895a2',map:reflection,transparent:true,opacity:.91,metalness:.05,roughness:.07,clearcoat:1,side:THREE.DoubleSide,depthWrite:false});
  const cabGlass=mat('CAB_GLASS',{color:'#617f91',map:reflection,transparent:true,opacity:.98,roughness:.055,clearcoat:1,clearcoatRoughness:.07,envMapIntensity:.75,side:THREE.DoubleSide,depthWrite:false});
  const unit=own(new THREE.BoxGeometry(1,1,1)),cylinder=own(new THREE.CylinderGeometry(1,1,1,10));
  const pantoBox=own(unit.clone()),pantoCylinder=own(cylinder.clone());pantoBox.name=pantoCylinder.name='pantograph';
  const helper=new THREE.Object3D(),carMatrix=new THREE.Matrix4(),q=new THREE.Quaternion();
  const add=(geometry,material,x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{
    helper.position.set(x,y,z);helper.rotation.set(rx,ry,rz);helper.scale.set(sx,sy,sz);helper.updateMatrix();
    const key=`${geometry.uuid}/${material.uuid}`;if(!batches.has(key))batches.set(key,{geometry,material,matrices:[]});
    batches.get(key).matrices.push(new THREE.Matrix4().multiplyMatrices(carMatrix,helper.matrix));
  };
  const box=(m,x,y,z,w,h,d)=>add(unit,m,x,y,z,w,h,d);
  const rod=(a,b,r,material,geometry=cylinder)=>{
    const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),direction=bv.clone().sub(av);
    q.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
    helper.position.copy(av.add(bv).multiplyScalar(.5));helper.quaternion.copy(q);helper.scale.set(r,direction.length(),r);helper.updateMatrix();
    const key=`${geometry.uuid}/${material.uuid}`;if(!batches.has(key))batches.set(key,{geometry,material,matrices:[]});
    batches.get(key).matrices.push(new THREE.Matrix4().multiplyMatrices(carMatrix,helper.matrix));
  };
  const root=e5?-1.25:-.425;
  const knots=e5?[[root,hw,3.65,.65],[1,1.61,3.51,.69],[3.2,1.48,3.15,.73],[5.5,1.25,2.65,.77],[8,.98,2.13,.81],[10.5,.88,1.9,.86],[12.6,.52,1.6,.97],[13.45,.25,1.45,1.1],[front,.035,1.36,1.28]]:
    [[root,hw,3.65,.65],[1.4,1.425,3.43,.69],[3.1,1.28,2.96,.73],[5.8,1.015,2.36,.78],[8,.75,1.91,.82],[10,.62,1.62,.88],[11.8,.36,1.44,.98],[12.42,.16,1.33,1.13],[front,.032,1.27,1.20]];
  function section(x,cab){
    if(!cab||x<=root)return {w:hw,top:3.65,bottom:.65,exponent:.42};
    return {w:Math.max(.02,hermite(knots,x,1)),top:hermite(knots,x,2),bottom:hermite(knots,x,3),exponent:smooth(.42,.85,(x-root)/(front-root))};
  }
  function surface(x,a,cab,lift=0){
    const s=section(x,cab),c=Math.cos(a),sn=Math.sin(a);
    return new THREE.Vector3(x,(s.top+s.bottom)/2+(s.top-s.bottom)/2*Math.sign(c)*Math.pow(Math.abs(c),s.exponent)+lift,s.w*Math.sign(sn)*Math.pow(Math.abs(sn),s.exponent));
  }
  const cut=e5?.6:.80,upper=e5?.642:.831;
  const angles=Array.from({length:65},(_,i)=>i*Math.PI/32);
  for(const f of [cut,upper]){const a=Math.acos(Math.pow(2*f-1,1/.42));angles.push(a,Math.PI*2-a);}
  angles.sort((a,b)=>a-b);
  function shell(cab){
    const xs=Array.from({length:13},(_,i)=>-half+(cab?root+half:lengthBody)*i/12);
    if(cab)for(let i=1;i<=80;i++)xs.push(root+(front-root)*i/80);
    const positions=[],uv=[],indices=[[],[],[]],stride=angles.length;
    for(const x of xs)for(const a of angles){const p=surface(x,a,cab);positions.push(...p);uv.push((x+half)/(cab?half+front:lengthBody),a/(Math.PI*2));}
    for(let j=0;j<xs.length-1;j++)for(let k=0;k<stride-1;k++){
      const a=j*stride+k,n=a+1,b=a+stride,bn=b+1;
      const f=(1+Math.sign(Math.cos((angles[k]+angles[k+1])/2))*Math.pow(Math.abs(Math.cos((angles[k]+angles[k+1])/2)),.42))/2;
      indices[f>upper?1:f>cut?2:0].push(a,n,b,n,bn,b);
    }
    if(cab){
      const centre=positions.length/3,tip=section(front,true);
      positions.push(front,(tip.top+tip.bottom)/2,0);uv.push(1,.5);
      const last=(xs.length-1)*stride;
      for(let k=0;k<stride-1;k++){
        const f=(1+Math.sign(Math.cos((angles[k]+angles[k+1])/2))*Math.pow(Math.abs(Math.cos((angles[k]+angles[k+1])/2)),.42))/2;
        indices[f>upper?1:f>cut?2:0].push(centre,last+k,last+k+1);
      }
    }
    const g=own(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    const all=[];indices.forEach((list,i)=>{g.addGroup(all.length,list.length,i);all.push(...list);});g.setIndex(all);g.computeVertexNormals();
    // Split the paint regions into geometry batches, retaining smooth normals
    // across the narrow belt; each exported primitive has one PBR material.
    const regions=[];
    for(let m=0;m<3;m++){
      const copy=own(g.clone());copy.clearGroups();copy.setIndex(indices[m]);copy.name=cab?'cab-shell':'car-shell';regions.push(copy);
    }
    return regions;
  }
  const cabShell=shell(true),standardShell=shell(false);
  function patch(x0,x1,a0,a1,material,cab,name,lift=.016){
    const positions=[],uv=[],ix=[],nx=16,ny=8;
    for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++){const edge=Math.pow(Math.abs(j/ny*2-1),6),window=name.startsWith('cab-window'),x=smooth(x0+(window?.24*edge:0),x1-(window?.4*edge:0),i/nx),a=smooth(a0,a1,j/ny),p=surface(x,a,cab);p.y+=lift*Math.cos(a);p.z+=lift*Math.sin(a);positions.push(...p);uv.push(i/nx,j/ny);}
    for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const a=i*(ny+1)+j,b=a+ny+1;ix.push(a,a+1,b,a+1,b+1,b);}
    const g=own(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();g.name=name;return {g,material};
  }
  const windowStart=e5?-1.05:-.3,windowEnd=e5?4.1:3.45;
  const gasket=patch(windowStart-.055,windowEnd+.055,-.675,.675,rubber,true,'cab-window-gasket',.022);
  const canopy=patch(windowStart,windowEnd,-.66,.66,cabGlass,true,'cab-window-glazing',.036);
  const lampX=e5?3.7:3.6,lamps=[];
  for(const side of [-1,1]){
    const a=side*1.08;
    lamps.push(patch(lampX-.56,lampX+.56,a-.095,a+.095,rubber,true,'lamp-housing',.019));
    lamps.push(patch(lampX-.43,lampX+.43,a-.048,a+.048,headlamp,true,'nose-lamp',.035));
  }
  const windowGeo=own(new THREE.ShapeGeometry(rounded(e5?.83:.76,.78,.12),10));
  const frameGeo=own(new THREE.ShapeGeometry(rounded(e5?.91:.84,.86,.15),10));
  const doorGeo=own(new THREE.ShapeGeometry(rounded(.79,1.94,.11),8));
  const doorInner=own(new THREE.ShapeGeometry(rounded(.73,1.88,.095),8));
  const doorGlass=own(new THREE.ShapeGeometry(rounded(.29,.67,.065),6));
  const cover=own(new THREE.ShapeGeometry(rounded(4.45,.66,.22),10));cover.name='cab-skirt';
  function sidePlane(g,m,x,y,z){add(g,m,x,y,z,1,1,1,0,z<0?Math.PI:0);}
  const wheelParts=[];
  for(const z of [-cfg.gauge/2,cfg.gauge/2]){
    const g=new THREE.CylinderGeometry(.43,.43,.14,24);g.rotateX(Math.PI/2);g.translate(0,0,z);wheelParts.push(g);
    const hub=new THREE.CylinderGeometry(.18,.18,.17,16);hub.rotateX(Math.PI/2);hub.translate(0,0,z);wheelParts.push(hub);
  }
  const shaft=new THREE.CylinderGeometry(.09,.09,cfg.gauge+.22,10);shaft.rotateX(Math.PI/2);wheelParts.push(shaft);
  const ap=[],an=[],au=[];
  for(const piece of wheelParts){const g=piece.toNonIndexed();for(const name of ['position','normal','uv']){const dst=name==='position'?ap:name==='normal'?an:au;dst.push(...g.getAttribute(name).array);}g.dispose();piece.dispose();}
  const axle=own(new THREE.BufferGeometry());axle.setAttribute('position',new THREE.Float32BufferAttribute(ap,3));axle.setAttribute('normal',new THREE.Float32BufferAttribute(an,3));axle.setAttribute('uv',new THREE.Float32BufferAttribute(au,2));
  const capPositions=[];for(let i=0;i<angles.length-1;i++){const a=surface(-half,angles[i],false),b=surface(-half,angles[i+1],false);capPositions.push(-half,2.15,0,...b,...a);}
  const bulkhead=own(new THREE.BufferGeometry());bulkhead.setAttribute('position',new THREE.Float32BufferAttribute(capPositions,3));bulkhead.computeVertexNormals();bulkhead.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(capPositions.length/3*2),2));
  const metadata=[];
  for(let i=0;i<cfg.cars;i++){
    const cab=i===0||i===cfg.cars-1,rear=i===cfg.cars-1;
    carMatrix.makeRotationY(rear?Math.PI:0);carMatrix.setPosition(-pitch*i,0,0);
    metadata.push({index:i,centerX:-pitch*i,green:false,passengerDoorsPerSide:2});
    (cab?cabShell:standardShell).forEach((g,j)=>add(g,[white,paint,belt][j]));add(bulkhead,rubber);
    if(!cab)add(bulkhead,rubber,0,0,0,1,1,1,0,Math.PI,0);
    const step=e5?1.56:1.38;
    for(let x=-half+3.2;x<half-2.3;x+=step){
      if(cab&&x>root-1.2)continue;
      for(const side of [-1,1]){sidePlane(frameGeo,rubber,x,2.61,side*(hw+.012));sidePlane(windowGeo,glass,x,2.61,side*(hw+.024));box(cabin,x,2.96,side*(hw-.12),.62,.025,.03);}
    }
    for(const x of cab?[-half+1.25,root-.82]:[-half+1.25,half-1.25])for(const side of [-1,1]){
      sidePlane(doorGeo,steel,x,2.13,side*(hw+.01));sidePlane(doorInner,white,x,2.13,side*(hw+.02));sidePlane(doorGlass,glass,x,2.66,side*(hw+.03));
      box(steel,x+.24,1.92,side*(hw+.045),.024,.13,.024);
    }
    const bogies=cab?cfg.cabBogieCenters:cfg.bogieCenters;
    for(const bx of bogies){
      box(dark,bx,.88,0,3.3,.23,2.0);
      for(const side of [-1,1]){sidePlane(cover,white,bx,1.02,side*(hw+.018));box(dark,bx,.68,side*.93,3.0,.16,.12);}
      for(const dx of [-1.05,1.05]){
        const pivot=new THREE.Group();pivot.name='wheel-axle';pivot.userData={spinAxis:'z',radius:.43};pivot.position.set(-pitch*i+(rear?-bx:bx)+dx,.58,0);
        const wheel=new THREE.Mesh(axle,steel);wheel.castShadow=wheel.receiveShadow=true;pivot.add(wheel);group.add(pivot);wheels.push(pivot);
      }
    }
    const floorEnd=cab?root-.4:half-.5,floorStart=-half+.5;
    for(const z of [-1,1])box(dark,(floorStart+floorEnd)/2,.8,z*.6,floorEnd-floorStart,.25,.5);
    if(cab){
      add(gasket.g,gasket.material);add(canopy.g,canopy.material);for(const p of lamps)add(p.g,rear&&p.material===headlamp?tail:p.material);
      // Paired fine wipers lie on the sloped bubble canopy.
      for(const side of [-1,1]){
        const a=surface(2.4,side*.38,true,.06),b=surface(3.5,side*.17,true,.06);rod([...a],[...b],.014,rubber);
      }
      box(steel,-half+.1,4.0,0,.4,.12,.3);
    }else{
      for(const x of [-5,2.8]){box(paint,x,3.70,0,3.3,.11,1.25);for(let k=0;k<14;k++)box(steel,x-1.4+k*.215,3.77,0,.026,.025,.88);}
    }
    if(!cab&&cfg.pantographCars.includes(i)){
      add(pantoBox,dark,-6,3.86,0,2.1,.1,1.1);
      for(const x of [-6.6,-5.4])for(const z of [-.45,.45])add(pantoCylinder,white,x,3.74,z,.095,.22,.095);
      for(const z of [-.38,.38]){rod([-6.65,3.92,z],[-5.5,4.67,z],.035,steel,pantoCylinder);rod([-5.5,4.67,z],[-6,5.42,z],.03,steel,pantoCylinder);}
      add(pantoBox,dark,-6,5.45,0,.18,.07,1.7);add(pantoBox,steel,-6,5.49,0,.07,.02,1.8);
      for(const side of [-1,1])add(pantoBox,paint,-6,4.04,side*.98,4.3,.7,.14);
    }
  }
  for(const {geometry,material,matrices} of batches.values()){
    const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;
    mesh.name=`shinkansen-${geometry.name||material.name}`;mesh.castShadow=!material.transparent&&material!==headlamp&&material!==tail&&material!==cabin;mesh.receiveShadow=!material.transparent;
    mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);
  }
  const length=lengthBody+(cfg.cars-1)*pitch+2*cfg.frontExtra,rearX=-(cfg.cars-1)*pitch-front;
  group.userData={trainId:cfg.id,carPitch:pitch,carCount:cfg.cars,length,frontX:front,rearX,wheelRadius:.43,spinAxis:'z',carMetadata:metadata};
  let disposed=false;
  return {group,wheels,length,front:0,frontX:front,rearX,carCount:cfg.cars,wheelRadius:.43,config:cfg,
    setHeadlights(level){headlamp.emissiveIntensity=3.8*level;},
    dispose(){if(disposed)return;disposed=true;group.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of resources.g)g.dispose();for(const m of resources.m)m.dispose();for(const t of resources.t)t.dispose();group.clear();wheels.length=0;},
  };
}
