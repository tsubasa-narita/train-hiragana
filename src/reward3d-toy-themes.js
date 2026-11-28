import * as THREE from '../vendor/three/three.module.js';

const TAU=Math.PI*2;

export function toyPark(kit,rounded,{reduced,fast}){
  const {own,batch,mesh,material,group}=kit;
  const floor=mesh(own(new THREE.PlaneGeometry(780,400)),material({color:0x9dd2a3}),0,-6,26);
  floor.rotation.x=-Math.PI/2;
  const candy=material({color:0xffffff,roughness:.42}), blue=material({color:0x3369a9,roughness:.36});
  const booth=[],path=[],roofs=[],y=-6;
  for(const [x,z,color] of [[-25,10,0x5ccac5],[15,22,0xf5ab69],[74,24,0xa4a4e5],[141,13,0xf4ae6f],[174,19,0x63bfa9]]){
    booth.push([x,y+2.4,z,7.4,4.8,5.6,0,0,0,color]);
    booth.push([x,y+2.85,z-2.85,4.7,1.9,.21,0,0,0,0x374869]);
    roofs.push([x,y+5.24,z,4.95,2.3,4.95,Math.PI/4,0,0,0xf28a84]);
  }
  for(let i=-18;i<=25;i++){
    path.push([i*8,y+.045,11,7.94,.1,4.4,0,0,0,i%2?0xf5c789:0xe9ae78]);
    path.push([i*8,y+.11,13.2,7.94,.21,.23,0,0,0,0xffe2b9]);
  }
  batch(rounded,candy,[...booth,...path],true);
  batch(own(new THREE.ConeGeometry(1,1,4)),candy,roofs,true);
  const stems=[],crowns=[];
  for(let i=0;i<19;i++){
    const x=-58+i*13.7,z=22+5*Math.sin(i*1.53)+(i%2?8:0);
    if(x>31&&x<66)continue;
    const size=1.9+.52*Math.sin(i*2.8);
    stems.push([x,y+1.2,z,.36,2.4,.36]);
    crowns.push([x,y+2.60+size*.57,z,size,size*1.33,size*.85,0,0,0,[0x64b77e,0x74bc91,0x87bf68][i%3]]);
  }
  batch(rounded,material({color:0x987d68,roughness:.72}),stems,true);
  batch(own(new THREE.SphereGeometry(1,12,8)),candy,crowns,true);

  const wheelX=fast?70:48,wheelY=8.6,wheelZ=17,radius=9;
  const wheel=new THREE.Group();
  wheel.position.set(wheelX,wheelY,wheelZ);group.add(wheel);
  const rim=own(new THREE.TorusGeometry(radius,.19,8,64));
  for(const z of [-.81,.81])wheel.add(mesh(rim,blue,0,0,z));
  const spokes=[];
  for(let i=0;i<10;i++){
    const a=i*TAU/10;
    for(const z of [-.81,.81])spokes.push([Math.cos(a)*radius*.51,Math.sin(a)*radius*.51,z,radius,.105,.16,0,0,a]);
  }
  wheel.add(batch(rounded,blue,spokes));
  batch(rounded,blue,[-1,1].map(side=>[wheelX+side*3.32,1.5,wheelZ+1.3,.56,16,.80,0,0,side*.43]),true);
  const cabinColors=[0xf38b81,0x78cec4,0xfac55e,0xb3a5ec,0x68b3eb];
  const gondolas=Array.from({length:10},(_,i)=>{
    const pod=new THREE.Group();group.add(pod);
    const shell=material({color:cabinColors[i%5],roughness:.36});
    pod.add(mesh(rounded,shell,0,-.63,0,2.2,1.05,1.52));
    pod.add(mesh(rounded,blue,0,.30,0,2.0,.85,1.3));
    pod.add(mesh(rounded,shell,0,.75,0,2.34,.27,1.60));
    return pod;
  });
  return time=>{
    const today=reduced?0:time*.31;
    wheel.rotation.z=today;
    gondolas.forEach((pod,index)=>{
      const a=index*TAU/10+today;
      pod.position.set(wheelX+radius*Math.cos(a),wheelY+radius*Math.sin(a),wheelZ);
    });
  };
}

export function toySpace(kit,rounded,{reduced,fast}){
  const {own,batch,mesh,material,group,random}=kit;
  const floor=mesh(own(new THREE.PlaneGeometry(820,490)),material({color:0x555b9e}),0,-6,26);
  floor.rotation.x=-Math.PI/2;
  const starMat=kit.glow(0xdac9ff,1.25), studioMat=kit.glow(0x22234e);
  mesh(rounded,studioMat,0,52,105,850,134,11);
  const stars=[];
  for(let i=0;i<176;i++){
    const s=.20+random()*.60;
    stars.push([random()*560-220,random()*88-1,98.98,s,s,s,0,0,.78]);
  }
  batch(rounded,starMat,stars).name='glowing-foam-stars';
  const rock=own(new THREE.IcosahedronGeometry(1,1));
  const pebbles=[];
  for(let i=0;i<110;i++){
    const scale=random()*1.25+.40,z=random()*51+6;
    pebbles.push([random()*330-90,-5.95,z,scale,scale*.47,scale*.83,random()*6,0,0,i%2?0x9998c1:0x7f7ca8]);
  }
  batch(rock,material({color:0xffffff,roughness:.96}),pebbles,true);
  const rims=[],basins=[];
  for(const [x,z,r] of [[-45,12,3.4],[-17,24,4.7],[6,9,2.12],[34,24,5.3],[65,12,3.65],[97,25,6.1],[133,13,3.8],[174,25,4.5]]){
    rims.push([x,-5.92,z,r,r,1,0,-Math.PI/2]);
    basins.push([x,-5.93,z,r*.87,r*.87,1,0,-Math.PI/2]);
  }
  batch(own(new THREE.RingGeometry(.83,1,26)),material({color:0x8e88bc}),rims);
  batch(own(new THREE.CircleGeometry(1,26)),material({color:0x49497f}),basins);
  const moon=own(new THREE.SphereGeometry(1,28,18));
  mesh(moon,material({color:0xb181db,roughness:.62}),47,20,51,15,15,15);
  const ring=mesh(own(new THREE.RingGeometry(17,24,64)),
    material({color:0xffba82,side:THREE.DoubleSide,emissive:0xc47855,emissiveIntensity:.39}),
    47,20,51);
  ring.rotation.set(1.17,-.17,.26);
  mesh(moon,material({color:0x5bc8d1,roughness:.72}),150,15,37,9.2,9.2,9.2);
  mesh(moon,material({color:0xf4ab84,roughness:.72}),-49,12,29,6.6,6.6,6.6);
  const rocket=new THREE.Group();
  const launchX=fast?50:37,launchZ=12.5;
  rocket.position.set(launchX,-3.6,launchZ);group.add(rocket);
  const body=material({color:0xffe2bb,roughness:.36}),cap=material({color:0xee6c78,roughness:.40});
  const rocketShell=own(new THREE.CapsuleGeometry(1.65,4,8,18));
  rocket.add(mesh(rocketShell,body,0,4.3,0));
  rocket.add(mesh(own(new THREE.ConeGeometry(1.53,2.8,20)),cap,0,7.55,0));
  const port=own(new THREE.SphereGeometry(1,16,10));
  rocket.add(mesh(port,cap,0,5.43,-1.47,1.02,1.02,.37));
  rocket.add(mesh(port,material({color:0x55c3d0,metalness:.15,roughness:.17}),0,5.43,-1.71,.76,.76,.23));
  for(const side of [-1,1]){
    const fin=mesh(rounded,cap,side*1.53,1.87,0,1.33,2.46,.76);
    fin.rotation.z=-side*.39;rocket.add(fin);
  }
  const flame=mesh(own(new THREE.ConeGeometry(1,1,16)),kit.glow(0xff9f52,1.65),0,.47,0,.91,.8,.91);
  flame.rotation.z=Math.PI;rocket.add(flame);
  const pad=material({color:0x7f8bc2,metalness:.09,roughness:.5});
  mesh(own(new THREE.CylinderGeometry(4.7,5,1,12)),pad,launchX,-5.55,launchZ);
  const smokeFinish=material({color:0xe3cde9,roughness:1,transparent:true,opacity:.56,depthWrite:false});
  const smoke=Array.from({length:5},(_,i)=>mesh(rock,smokeFinish,launchX,-4.5,launchZ+i*.33,.8,.65,.8));
  const gate=[],light=[];
  for(const x of [-27,75,138]){
    for(const z of [-3.3,3.3]){
      gate.push([x,2.42,z,1.30,5.75,1.3],[x,-3.04,z,1.5,5.96,1.55]);
      light.push([x+.68,3.62,z,.10,1.14,.60]);
    }
    gate.push([x,5.65,0,1.38,.85,7.85]);
    light.push([x+.72,5.60,0,.09,.235,5.25]);
  }
  batch(rounded,pad,gate,true);
  batch(rounded,kit.glow(0x67dbe9,1.16),light);
  return time=>{
    const lift=reduced?0:THREE.MathUtils.smoothstep(time,3.8,6.6);
    rocket.position.y=-4.8+lift*16.4;
    flame.visible=lift>0&&lift<1;
    flame.scale.y=.8+lift*1.7+Math.sin(time*33)*.26;
    flame.position.y=.68-flame.scale.y*.45;
    smoke.forEach((puff,i)=>{
      const age=(time-3.88-i*.17)/1.55;
      puff.visible=!reduced&&age>0&&age<1;
      if(puff.visible){
        puff.position.set(launchX+age*(i-1.7)*1.39,-4.3+age*2.4,launchZ+i*.33);
        const size=.65+age*(2.2-i*.19);
        puff.scale.set(size,size*.68,size);
      }
    });
  };
}
