import * as THREE from '../vendor/three/three.module.js';
import {GLTFLoader} from '../vendor/three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from '../vendor/three/addons/libs/meshopt_decoder.module.js';
import {HDRLoader} from '../vendor/three/addons/loaders/HDRLoader.js';
import {REWARD_3D_TRAINS} from './reward3d-catalog.js';
import {isToyReward} from './reward3d-scenarios.js';
import {sceneryDetailTexture} from './reward3d-surface.js';

// Only immutable CPU templates are cached. Every running scene owns its cloned
// geometry/material/texture objects and releases its complete GPU allocation.
const libraries=new Map(),pending=new Map();
const hdrNames={depot:'small_hangar_01',night:'shanghai_bund',skybridge:'railway_bridge_02',sakura:'railway_bridge_02',snow:'shanghai_bund',aquarium:'shanghai_bund',diorama:'small_hangar_01'},hdrs=new Map(),hdrJobs=new Map();
const environmentName=scenario=>hdrNames[scenario]||hdrNames.depot;
export function rewardEnvironment(scenario){return hdrs.get(environmentName(scenario));}
export async function prepareEnvironment(scenario){
  const name=environmentName(scenario);
  if(hdrs.has(name))return;
  if(!hdrJobs.has(name))hdrJobs.set(name,new HDRLoader().loadAsync(new URL(`../assets/reward3d/environment/${name}.hdr`,import.meta.url).href).then(texture=>{
    texture.mapping=THREE.EquirectangularReflectionMapping;hdrs.set(name,texture);
  }).catch(error=>{hdrJobs.delete(name);throw error;}));
  return hdrJobs.get(name);
}
// Decode quantized attributes and bake prototype transforms just once, during
// loading. Scene clones then need only copy ready-to-use CPU geometry.
function prepareGeometry(mesh){
  const g=mesh.geometry.clone();
  for(const name of ['position','normal','tangent']){
    const source=g.getAttribute(name);if(!source||source.array instanceof Float32Array)continue;
    const data=new Float32Array(source.count*source.itemSize);
    for(let i=0;i<source.count;i++)for(let k=0;k<source.itemSize;k++)data[i*source.itemSize+k]=source.getComponent(i,k);
    g.setAttribute(name,new THREE.Float32BufferAttribute(data,source.itemSize));
  }
  g.applyMatrix4(mesh.matrixWorld);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
function headlampAnchors(cab){
  const sides=[new THREE.Box3(),new THREE.Box3()];
  const point=new THREE.Vector3(),size=new THREE.Vector3();
  cab.traverse(mesh=>{
    if(!mesh.isMesh||!mesh.material.name.startsWith('HEADLAMP'))return;
    const positions=mesh.geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      point.fromBufferAttribute(positions,i);
      sides[point.z<0?0:1].expandByPoint(point);
    }
  });
  return sides.filter(bounds=>!bounds.isEmpty()).map(bounds=>{
    bounds.getSize(size);
    const radius=THREE.MathUtils.clamp(Math.max(size.y,size.z),.14,.46);
    return {position:bounds.getCenter(new THREE.Vector3()),radius};
  });
}
export async function prepareTrainModels(ids){
  await Promise.all(ids.map(id=>{
    if(libraries.has(id))return;
    if(!pending.has(id)){
      const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const job=loader.loadAsync(new URL(`../assets/reward3d/${id}.glb`,import.meta.url).href).then(gltf=>{
        gltf.scene.updateMatrixWorld(true);
        for(const name of ['CAB','STANDARD','PANTOGRAPH','AXLE'])if(!gltf.scene.getObjectByName(name))throw Error(`Missing ${id}/${name} prototype`);
        const originals=new Set();
        gltf.scene.traverse(mesh=>{if(mesh.isMesh){originals.add(mesh.geometry);mesh.geometry=prepareGeometry(mesh);}});
        for(const geometry of originals)geometry.dispose();
        gltf.scene.userData.headlamps=headlampAnchors(gltf.scene.getObjectByName('CAB'));
        libraries.set(id,gltf.scene);
      }).catch(error=>{pending.delete(id);throw error;});
      pending.set(id,job);
    }
    return pending.get(id);
  }));
}

function finishTrainMaterial(material, grain, {sceneId, id}, clock) {
  const name=material.name;
  const metal=/^(?:ALUMINIUM|STAINLESS|DOOR_STEEL|TRIM)/.test(name);
  const paint=/^(?:CAB_PAINT|LIVERY_)/.test(name);
  const glass=/^(?:CAB_GLASS|GLASS|PASSENGER_GLASS)/.test(name);
  const runningGear=/^(?:MACHINERY|ROOF)/.test(name);
  if(!metal&&!paint&&!glass&&!runningGear)return;
  if(isToyReward(sceneId)){
    if(!glass){
      material.metalness=.07;
      material.metalnessMap=null;
      material.roughnessMap=null;
      material.roughness=runningGear?.52:.29;
      if(metal)material.color.lerp(new THREE.Color(0xf1ebdf),.24);
    }
    if(material.isMeshPhysicalMaterial){
      material.clearcoat=runningGear?.29:.65;
      material.clearcoatRoughness=.23;
    }
    return;
  }

  if(metal){
    material.roughness=THREE.MathUtils.clamp(material.roughness*.86,.23,.53);
    if(material.isMeshPhysicalMaterial){
      material.clearcoat*=.68;
      material.anisotropy=.29;
    }
  }
  if(paint){
    material.roughness*=.87;
    // LaView's silver nose has a softer metallic highlight than gloss paint.
    if(material.isMeshPhysicalMaterial){
      material.clearcoat=id==='laview'?.55:Math.max(.64,material.clearcoat);
      material.clearcoatRoughness=id==='laview'?.17:.12;
    }
  }
  if(glass&&material.isMeshPhysicalMaterial){
    material.clearcoat=Math.max(material.clearcoat,.64);
    material.clearcoatRoughness=.085;
    material.roughness=Math.max(.10,material.roughness*.9);
  }
  const mode=metal?1:paint?2:glass?3:4;
  const underwater=sceneId==='aquarium'&&(metal||paint);
  material.customProgramCacheKey=()=>`rail-finish-${mode}-${underwater}`;
  material.onBeforeCompile=shader=>{
    shader.uniforms.trainGrain={value:grain};
    shader.uniforms.wetFinish={value:sceneId==='night'?1:0};
    shader.vertexShader='varying vec3 panelPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\npanelPosition = position;');
    if(underwater){
      shader.uniforms.trainTime=clock;
      shader.vertexShader='varying vec3 lightPosition;\n'+shader.vertexShader.replace('#include <project_vertex>', `
        #include <project_vertex>
        vec4 vehicleLightPoint=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          vehicleLightPoint=instanceMatrix*vehicleLightPoint;
        #endif
        lightPosition=(modelMatrix*vehicleLightPoint).xyz;
      `);
      shader.fragmentShader=`
        varying vec3 lightPosition;
        uniform float trainTime;
      `+shader.fragmentShader.replace('#include <emissivemap_fragment>', `
        #include <emissivemap_fragment>
        vec2 water=lightPosition.xz+lightPosition.y*vec2(.41,.54);
        float a=sin(water.x*2.2+water.y*1.02+sin(water.y*1.32-trainTime*.73)*1.4+trainTime*1.3);
        float b=sin(water.y*2.55-water.x*.67+sin(water.x*.83)*.94-trainTime*1.28);
        float crest=pow(max(0.,1.-abs(a+b)*1.19),6.);
        float coverage=.27+.73*smoothstep(.95,3.8,lightPosition.y);
        totalEmissiveRadiance+=diffuseColor.rgb*vec3(.46,.84,1.01)*crest*coverage*.18;
      `);
    }
    shader.fragmentShader=`
      #define TRAIN_FINISH ${mode}
      varying vec3 panelPosition;
      uniform sampler2D trainGrain;
      uniform float wetFinish;
    `+shader.fragmentShader.replace('#include <roughnessmap_fragment>', `
      #include <roughnessmap_fragment>
      vec2 panel = vec2(panelPosition.x + panelPosition.z*.83, panelPosition.y);
      vec2 sheet = panel * vec2(.67, 7.7);
      float grain = texture2D(trainGrain, sheet).g - .5;
      float unevenness = texture2D(trainGrain, panel * vec2(.27,.79)).r - .5;
      float sill = 1. - smoothstep(.69,1.64,panelPosition.y);
      #if TRAIN_FINISH == 1
        // Brushed cross-grain is finer than the panel's broad satin reflection.
        roughnessFactor += grain*.085 + unevenness*.076;
        diffuseColor.rgb *= 1. + grain*.065 + unevenness*.032 - sill*.052;
      #elif TRAIN_FINISH == 2
        roughnessFactor += unevenness*.058 + sill*.052;
        diffuseColor.rgb *= 1. + unevenness*.040 - sill*.042;
      #elif TRAIN_FINISH == 3
        float droplets = smoothstep(.07,.34,texture2D(trainGrain,panel*vec2(7.,14.)).b-.45);
        roughnessFactor += wetFinish*min(.095,droplets*.16);
      #else
        roughnessFactor += unevenness*.24;
        diffuseColor.rgb *= 1. + grain*.14 + unevenness*.32;
      #endif
      roughnessFactor = clamp(roughnessFactor,.06,1.);
    `).replace('#include <opaque_fragment>', `
      #if TRAIN_FINISH == 3 && !defined(OPAQUE)
        // More reflection at a grazing angle, with the cab legible head-on.
        float glassEdge = pow(1. - abs(dot(normal, normalize(vViewPosition))), 3.);
        diffuseColor.a = mix(diffuseColor.a, 1., glassEdge*.18);
      #endif
      #include <opaque_fragment>
    `);
  };
}

export function createBlenderTrainModel(config){
  const library=libraries.get(config.id);if(!library)return null;
  const cfg={...REWARD_3D_TRAINS.find(t=>t.id===config.id),...config},count=cfg.cars,pitch=cfg.pitch||20.6,carLength=cfg.carLength||20,frontX=cfg.frontX||10.35;
  const group=new THREE.Group();group.name=`blender-train-${cfg.id}`;
  const geometries=new Set(),materials=new Set(),textures=new Set(),wheels=[],headlights=[];
  const clock={value:0};
  const grain=sceneryDetailTexture();textures.add(grain);
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
    finishTrainMaterial(value,grain,cfg,clock);
    if(tail){value.color.set('#bd263e');value.emissive.set('#ff193e');value.emissiveIntensity=1.8;}
    else if(original.name.startsWith('HEADLAMP'))headlights.push(value);
    if(original.name.startsWith('CABIN_LIGHT'))value.emissiveIntensity=cfg.sceneId==='night'?1.1:.32;
    return value;
  }
  function geometry(mesh){
    if(!geometryCache.has(mesh)){
      const g=mesh.geometry.clone();
      geometries.add(g);geometryCache.set(mesh,g);
    }
    return geometryCache.get(mesh);
  }
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0);
  function addPrototype(name,index,rear=false){
    const prototype=library.getObjectByName(name);if(!prototype)return;
    matrix.compose(new THREE.Vector3(-pitch*index,0,0),rotation.setFromAxisAngle(axis,rear?Math.PI:0),new THREE.Vector3(1,1,1));
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
    carMetadata.push({index:i,centerX:-pitch*i,green,passengerDoorsPerSide:green?2:(cfg.doorsPerSide||4)});
  }
  for(const batch of batches.values()){
    const mesh=new THREE.InstancedMesh(batch.geometry,batch.material,batch.transforms.length);
    batch.transforms.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;
    mesh.name=`blender-${batch.name}`;mesh.userData.groundEffect=batch.name.startsWith('contact-shadow');
    mesh.castShadow=!batch.material.transparent&&!batch.material.name.startsWith('CABIN_LIGHT')&&!batch.material.name.startsWith('DISPLAY');
    mesh.receiveShadow=!batch.material.transparent;mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);
  }
  const axle=[];library.getObjectByName('AXLE').traverse(mesh=>{if(mesh.isMesh)axle.push(mesh);});
  for(let i=0;i<count;i++)for(const bogie of (cfg.cabBogieCenters&&(i===0||i===count-1)?cfg.cabBogieCenters.map(x=>i===count-1?-x:x):cfg.bogieCenters||[-6.8,6.8]))for(const offset of [-1.05,1.05]){
    const pivot=new THREE.Group();pivot.name='wheel-axle';pivot.position.set(-pitch*i+bogie+offset,.58,0);pivot.userData={spinAxis:'z',radius:.43};
    for(const source of axle){const mesh=new THREE.Mesh(geometry(source),material(source.material));mesh.castShadow=true;mesh.receiveShadow=true;pivot.add(mesh);}
    group.add(pivot);wheels.push(pivot);
  }
  const length=carLength+(count-1)*pitch+2*(cfg.frontExtra||0);
  group.userData={trainId:cfg.id,assetPipeline:'blender-glb',front:0,carPitch:pitch,frontX,rearX:-pitch*(count-1)-frontX,length,carCount:count,wheelRadius:.43,spinAxis:'z',carMetadata};
  let disposed=false;
  return {group,wheels,length,front:0,frontX,rearX:group.userData.rearX,carCount:count,wheelRadius:.43,config:cfg,
    headlamps:library.userData.headlamps,
    setLightingTime(seconds){clock.value=seconds;},
    setHeadlights(level){for(const m of headlights){m.emissiveIntensity=3.8*level;m.color.setScalar(.2+.8*level);}},
    dispose(){if(disposed)return;disposed=true;group.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();group.clear();wheels.length=0;},
  };
}
