import * as THREE from '../vendor/three/three.module.js';
import { mergeGeometries } from '../vendor/three/addons/utils/BufferGeometryUtils.js';

// The local bow points along +X. Cross-sections taper both to the keel and
// to the forward stem, so the ferry reads as a boat from the viaduct above.
function ferryHull() {
  const sections = [[-.5,.27],[-.43,.49],[-.17,.54],[.21,.51],[.37,.36],[.48,.12],[.52,.016]];
  const vertices=[],indices=[];
  for (const [x,width] of sections) {
    for (const [y,z] of [[.10,-1],[-.025,-1],[-.16,-.54],[-.19,0],[-.16,.54],[-.025,1],[.10,1]]) {
      vertices.push(x,y,width*z);
    }
  }
  for (let i=0;i<sections.length-1;i++) {
    for (let j=0;j<6;j++) {
      const a=i*7+j,b=a+7;
      indices.push(a,b,a+1,a+1,b,b+1);
    }
    indices.push(i*7,i*7+6,i*7+7,i*7+6,i*7+13,i*7+7);
  }
  indices.push(0,1,6,1,2,6,2,5,6,2,3,4,2,4,5);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function fittings(parts) {
  const geometries=parts.map(({x,y,z,length,height,width,lean=0})=>
    new THREE.BoxGeometry(length,height,width).rotateZ(lean).translate(x,y,z));
  const merged=mergeGeometries(geometries,false);
  geometries.forEach(geometry=>geometry.dispose());
  return merged;
}

export function createFerries(group, own, routes, { waterline, night=false, reduced=false }={}) {
  const boxes=[];
  for (const z of [-.284,.284]) {
    for(let i=0;i<5;i++)boxes.push({x:-.28+i*.103,y:.235,z,length:.073,height:.097,width:.012});
  }
  boxes.push({x:.210,y:.244,z:0,length:.018,height:.11,width:.53,lean:.24});
  const models=[
    [ferryHull(),new THREE.MeshStandardMaterial({color:0x7eabc3,metalness:.14,roughness:.5,side:THREE.DoubleSide})],
    [fittings([
      {x:-.095,y:.219,z:0,length:.59,height:.23,width:.556},
      {x:-.081,y:.350,z:0,length:.66,height:.059,width:.661},
      {x:-.18,y:.404,z:0,length:.085,height:.15,width:.14,lean:.26},
      {x:.11,y:.435,z:0,length:.016,height:.23,width:.026},
      {x:.11,y:.512,z:0,length:.021,height:.015,width:.21},
    ]),new THREE.MeshStandardMaterial({color:0xf0e9d7,roughness:.58})],
    [fittings(boxes),new THREE.MeshStandardMaterial({color:night?0xffd7a2:0x31657a,roughness:.25,
      emissive:night?0xffa951:0x000000,emissiveIntensity:night?1.45:0})],
    [fittings([
      {x:.08,y:.352,z:-.316,length:.042,height:.038,width:.038},
      {x:.08,y:.352,z:.316,length:.042,height:.038,width:.038},
    ]),new THREE.MeshStandardMaterial({color:0xc96d4a,emissive:0xb64a21,emissiveIntensity:night?.7:0})],
  ];
  const boats=models.map(([geometry,material])=>{
    const object=new THREE.InstancedMesh(own(geometry),own(material),routes.length);
    object.name='coastal-ferries';
    object.frustumCulled=false;
    group.add(object);
    return object;
  });
  const clock={value:0};
  const wakeMaterial=own(new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,
    uniforms:{clock,tint:{value:new THREE.Color(night?0x88a9bf:0xdbf5f2)},visibility:{value:night?.46:.80}},
    vertexShader:`
      varying vec2 vUv;
      void main(){
        vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);
      }`,
    fragmentShader:`
      uniform float clock,visibility;
      uniform vec3 tint;
      varying vec2 vUv;
      void main(){
        float lengthFromStern=1.-vUv.x;
        float side=abs(vUv.y-.5);
        float spread=.059+lengthFromStern*.39;
        float ripple=.014*sin(lengthFromStern*39.-clock*4.0+vUv.y*7.);
        float rim=1.-smoothstep(.006,.041,abs(side-spread+ripple));
        float prop=(1.-smoothstep(.016,.16,side))*exp(-lengthFromStern*4.0);
        float foam=.68+.32*sin(lengthFromStern*62.+side*37.-clock*5.);
        float alpha=(rim*.68+prop*.52)*foam*smoothstep(0.,.11,lengthFromStern)
          *(1.-smoothstep(.35,1.,lengthFromStern))*visibility;
        gl_FragColor=vec4(tint,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  const wakeGeometry=own(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2));
  const wakes=new THREE.InstancedMesh(wakeGeometry,wakeMaterial,routes.length);
  wakes.name='ferry-v-shaped-wakes';
  wakes.frustumCulled=false;
  group.add(wakes);
  const pose=new THREE.Object3D();
  const initialColors=[0x6d8c99,0x7e9790,0xb98760,0x94a8b4];
  routes.forEach((_,index)=>boats[0].setColorAt(index,new THREE.Color(initialColors[index%initialColors.length])));
  function update(seconds) {
    const time=reduced?0:seconds;
    clock.value=time;
    routes.forEach(({x,z,length,width,height=width,heading,speed},index)=>{
      const dx=Math.cos(heading),dz=-Math.sin(heading);
      const distance=time*speed;
      pose.position.set(x+dx*distance,waterline+Math.sin(time*1.6+index)*.045,z+dz*distance);
      pose.rotation.set(0,heading,Math.sin(time*1.3+index)*.008);
      pose.scale.set(length,height,width);
      pose.updateMatrix();
      boats.forEach(boat=>boat.setMatrixAt(index,pose.matrix));
      const trail=length*2.35,behind=trail/2+length*.36;
      pose.position.set(x+dx*(distance-behind),waterline+.027,z+dz*(distance-behind));
      pose.rotation.set(0,heading,0);
      pose.scale.set(trail,1,width*3.8);
      pose.updateMatrix();
      wakes.setMatrixAt(index,pose.matrix);
    });
    for(const object of [...boats,wakes])object.instanceMatrix.needsUpdate=true;
  }
  update(0);
  return update;
}
