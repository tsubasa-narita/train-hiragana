import * as THREE from '../vendor/three/three.module.js';
import {GLTFLoader} from '../vendor/three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from '../vendor/three/addons/libs/meshopt_decoder.module.js';
import {HDRLoader} from '../vendor/three/addons/loaders/HDRLoader.js';
import {REWARD_3D_TRAINS} from './reward3d-catalog.js';

// Only immutable CPU templates are cached. Every running scene owns its cloned
// geometry/material/texture objects and releases its complete GPU allocation.
const libraries=new Map(),pending=new Map();
const hdrNames={depot:'small_hangar_01',night:'shanghai_bund',skybridge:'railway_bridge_02'},hdrs=new Map(),hdrJobs=new Map();
export function rewardEnvironment(scenario){return hdrs.get(scenario);}
export async function prepareEnvironment(scenario){
  if(hdrs.has(scenario))return;
  if(!hdrJobs.has(scenario))hdrJobs.set(scenario,new HDRLoader().loadAsync(new URL(`../assets/reward3d/environment/${hdrNames[scenario]||hdrNames.depot}.hdr`,import.meta.url).href).then(texture=>{
    texture.mapping=THREE.EquirectangularReflectionMapping;hdrs.set(scenario,texture);
  }).catch(error=>{hdrJobs.delete(scenario);throw error;}));
  return hdrJobs.get(scenario);
}
export async function prepareTrainModels(ids){
  await Promise.all(ids.map(id=>{
    if(libraries.has(id))return;
    if(!pending.has(id)){
      const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const job=loader.loadAsync(new URL(`../assets/reward3d/${id}.glb`,import.meta.url).href).then(gltf=>{
        gltf.scene.updateMatrixWorld(true);
        for(const name of ['CAB','STANDARD','PANTOGRAPH','AXLE'])if(!gltf.scene.getObjectByName(name))throw Error(`Missing ${id}/${name} prototype`);
        libraries.set(id,gltf.scene);
      }).catch(error=>{pending.delete(id);throw error;});
      pending.set(id,job);
    }
    return pending.get(id);
  }));
}

export function createBlenderTrainModel(config){
  const library=libraries.get(config.id);if(!library)return null;
  const cfg={...REWARD_3D_TRAINS.find(t=>t.id===config.id),...config},count=cfg.cars;
  const group=new THREE.Group();group.name=`blender-train-${cfg.id}`;
  const geometries=new Set(),materials=new Set(),textures=new Set(),wheels=[],headlights=[];
  const geometryCache=new Map(),materialCache=new Map(),textureCache=new Map(),batches=new Map();
  function material(original,rear=false){
    const tail=rear&&original.name.startsWith('HEADLAMP'),key=`${original.uuid}/${tail}`;
    if(materialCache.has(key))return materialCache.get(key);
    const value=original.clone();materials.add(value);materialCache.set(key,value);
    for(const key of Object.keys(value))if(value[key]?.isTexture){
      const map=value[key];if(!textureCache.has(map)){const copy=map.clone();copy.anisotropy=4;textureCache.set(map,copy);textures.add(copy);}value[key]=textureCache.get(map);
    }
    if(cfg.id==='yokosuka'&&original.name.startsWith('ALUMINIUM')){value.color.multiplyScalar(.64);value.roughness=Math.max(value.roughness,.4);}
    if(cfg.id==='toyoko'&&original.name.startsWith('CAB_GLASS')){value.color.set('#283f43');value.opacity=.94;value.clearcoat=.4;value.envMapIntensity=.65;}
    if(cfg.id==='toyoko'&&original.name.startsWith('CAB_MASK')){value.color.set('#071014');value.metalness=.02;value.roughness=.22;value.clearcoat=.25;value.envMapIntensity=.5;}
    if(tail){value.color.set('#bd263e');value.emissive.set('#ff193e');value.emissiveIntensity=1.8;}
    else if(original.name.startsWith('HEADLAMP'))headlights.push(value);
    if(original.name.startsWith('CABIN_LIGHT'))value.emissiveIntensity=cfg.sceneId==='night'?1.1:.32;
    return value;
  }
  function geometry(mesh){
    if(!geometryCache.has(mesh)){
      const g=mesh.geometry.clone();
      // Meshopt/KHR quantization can retain normalized integer attributes.
      // Dequantize before baking the node transform; writing metre positions
      // into an integer BufferAttribute would otherwise clamp the geometry.
      for(const name of ['position','normal','tangent']){
        const source=g.getAttribute(name);if(!source||source.array instanceof Float32Array)continue;
        const data=new Float32Array(source.count*source.itemSize);
        for(let i=0;i<source.count;i++)for(let k=0;k<source.itemSize;k++)data[i*source.itemSize+k]=source.getComponent(i,k);
        g.setAttribute(name,new THREE.Float32BufferAttribute(data,source.itemSize));
      }
      g.applyMatrix4(mesh.matrixWorld);g.computeBoundingBox();g.computeBoundingSphere();geometries.add(g);geometryCache.set(mesh,g);
    }
    return geometryCache.get(mesh);
  }
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0);
  function addPrototype(name,index,rear=false){
    const prototype=library.getObjectByName(name);if(!prototype)return;
    matrix.compose(new THREE.Vector3(-20.6*index,0,0),rotation.setFromAxisAngle(axis,rear?Math.PI:0),new THREE.Vector3(1,1,1));
    prototype.traverse(mesh=>{
      if(!mesh.isMesh)return;
      const g=geometry(mesh),m=material(mesh.material,rear),key=`${g.uuid}/${m.uuid}`;
      if(!batches.has(key))batches.set(key,{geometry:g,material:m,name:mesh.name,transforms:[]});
      batches.get(key).transforms.push(matrix.clone());
    });
  }
  const carMetadata=[];
  for(let i=0;i<count;i++){
    const cab=i===0||i===count-1,green=!cab&&cfg.greenCars.includes(i);
    addPrototype(cab?'CAB':green?'GREEN':'STANDARD',i,i===count-1);
    if(!cab&&!green&&cfg.pantographCars.includes(i))addPrototype('PANTOGRAPH',i);
    carMetadata.push({index:i,centerX:-20.6*i,green,passengerDoorsPerSide:green?2:4});
  }
  for(const batch of batches.values()){
    const mesh=new THREE.InstancedMesh(batch.geometry,batch.material,batch.transforms.length);
    batch.transforms.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;
    mesh.name=`blender-${batch.name}`;mesh.userData.groundEffect=batch.name.startsWith('contact-shadow');
    mesh.castShadow=!batch.material.transparent&&!batch.material.name.startsWith('CABIN_LIGHT')&&!batch.material.name.startsWith('DISPLAY');
    mesh.receiveShadow=!batch.material.transparent;mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);
  }
  const axle=[];library.getObjectByName('AXLE').traverse(mesh=>{if(mesh.isMesh)axle.push(mesh);});
  for(let i=0;i<count;i++)for(const bogie of [-6.8,6.8])for(const offset of [-1.05,1.05]){
    const pivot=new THREE.Group();pivot.name='wheel-axle';pivot.position.set(-20.6*i+bogie+offset,.58,0);pivot.userData={spinAxis:'z',radius:.43};
    for(const source of axle){const mesh=new THREE.Mesh(geometry(source),material(source.material));mesh.castShadow=true;mesh.receiveShadow=true;pivot.add(mesh);}
    group.add(pivot);wheels.push(pivot);
  }
  const length=20+(count-1)*20.6;
  group.userData={trainId:cfg.id,assetPipeline:'blender-glb',front:0,frontX:10.35,rearX:-20.6*(count-1)-10.35,length,carCount:count,wheelRadius:.43,spinAxis:'z',carMetadata};
  let disposed=false;
  return {group,wheels,length,front:0,frontX:10.35,rearX:group.userData.rearX,carCount:count,wheelRadius:.43,config:cfg,
    setHeadlights(level){for(const m of headlights){m.emissiveIntensity=3.8*level;m.color.setScalar(.2+.8*level);}},
    dispose(){if(disposed)return;disposed=true;group.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();group.clear();wheels.length=0;},
  };
}
