import * as THREE from '../vendor/three/three.module.js';
import { REWARD_3D_TRAINS } from './reward3d-catalog.js';
import { bendTrainModel } from './reward3d-curve.js';
import { createDepotWorld } from './reward3d-depot.js';
import { createSkybridgeWorld, skyPose, SKY_RADIUS } from './reward3d-skybridge.js';
import { rewardScenario } from './reward3d-scenarios.js';
import { createTrainModel } from './reward3d-trains.js';
import { prepareTrainModels,createBlenderTrainModel,prepareEnvironment,rewardEnvironment } from './reward3d-assets.js';
import { createRailwayWorld, createReflectionEnvironment } from './reward3d-world.js';

export const REWARD_DURATION = 7000;
const clamp = THREE.MathUtils.clamp;
const buildTrain=config=>createBlenderTrainModel(config)||createTrainModel(config);
export async function prepareReward3D(config){
  const ids=[config.id];
  if(config.sceneId==='night')ids.push(REWARD_3D_TRAINS[(REWARD_3D_TRAINS.findIndex(t=>t.id===config.id)+1)%4].id);
  try{await Promise.all([prepareTrainModels(ids),prepareEnvironment(config.sceneId)]);}catch(error){console.warn('Blender asset unavailable; using local geometry.',error.message);}
}

// Real geometry moves through a fixed world; the camera glides between three
// cinematic views. Seconds, metres and wheel rotation share the same clock.
export function createReward3D(canvas, config, { onFrame, onComplete, onError, reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scenario=rewardScenario(config.sceneId).id,night=scenario==='night',depot=scenario==='depot',skybridge=scenario==='skybridge';
  const scene = new THREE.Scene(), warm = depot;
  scene.background = new THREE.Color(warm ? 0xe3c9aa : 0xb8d3de);
  scene.fog = new THREE.Fog(night?0x0b1934:warm?0xe7c49a:0xc7e3f0, night?160:300, night?650:1200);
  const environment = createReflectionEnvironment(renderer,warm,scenario,rewardEnvironment(scenario)); scene.environment = environment.texture;scene.environmentRotation.set(0,night?-1.57:depot?.9:-.4,0);
  scene.environmentIntensity = night?.3:.65;
  renderer.toneMappingExposure=night?1.05:.92;
  const hemisphere = new THREE.HemisphereLight(0xe8f4ff, night?0x14213c:0x78836c, night?.45:depot?.42:.7); scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(night?0x7aafff:warm?0xffdab0:0xffefd8, night?1.1:depot?4.8:3.9);
  sun.castShadow = true; sun.shadow.mapSize.set(globalThis.innerWidth>900?2048:1024,globalThis.innerWidth>900?2048:1024);
  Object.assign(sun.shadow.camera, { left:-50, right:45, top:25, bottom:-25, near:1, far:200 });
  sun.shadow.bias = -.00015; sun.shadow.normalBias = .035;
  scene.add(sun, sun.target);
  // A broad, shadow-free fill emulates station/city spill on the hero body.
  // The key still defines the shadows; this only keeps night steel readable.
  const heroFill=new THREE.DirectionalLight(0xd5e5fa,night?1.3:depot?.4:.3);scene.add(heroFill,heroFill.target);
  const camera = new THREE.PerspectiveCamera(44,1,.1,1300);
  const world = depot?createDepotWorld(scene,{config}):skybridge?createSkybridgeWorld(scene,{config}):createRailwayWorld(scene,{night:true});
  const train = buildTrain(config); scene.add(train.group);
  if(skybridge)bendTrainModel(train,SKY_RADIUS);
  const opposite=night?buildTrain({...REWARD_3D_TRAINS[(REWARD_3D_TRAINS.findIndex(t=>t.id===config.id)+1)%4],sceneId:scenario}):null;
  if(opposite){opposite.group.rotation.y=Math.PI;scene.add(opposite.group);}
  const v=a=>new THREE.Vector3(...a),curve=points=>new THREE.CatmullRomCurve3(points.map(v),false,'catmullrom',.2);
  const cameraPath=curve(depot?[[20,3.2,-8],[17,2.2,-8],[18,2.4,-8],[19,2.8,-10],[21,3.5,-12]]:
    skybridge?[[20,4,-13],[18,3,-12],[20,5,-17],[22,8,-21],[23,12,-25]]:
    [[-6,.9,-3],[16,2.8,-8],[18,2.8,-8],[17,2.8,-7.5],[16,2.8,-6]]);
  const targetPath=curve(depot?[[8,2.6,0],[8,2.5,0],[8,2.5,0],[7,2.5,0],[6,2.3,0]]:
    skybridge?[[7,2.6,0],[8,2.3,0],[6,2.3,0],[6,2,0],[5,1.5,0]]:
    [[-6,.8,0],[8,2.1,0],[8,2.4,0],[8,2.5,0],[9,2.6,0]]);
  const glowTexture=(()=>{
    const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,248,218,1)');g.addColorStop(.12,'rgba(255,239,184,.8)');g.addColorStop(.4,'rgba(255,227,168,.12)');g.addColorStop(1,'rgba(255,227,168,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);
  })();
  const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:night?.7:.3});
  for(const z of [-1,1]){const glow=new THREE.Sprite(glowMaterial);glow.position.set(10.16,config.id==='toyoko'?3.67:3.72,z);glow.scale.setScalar(night?.85:.48);train.group.add(glow);}
  let raf = 0, elapsed = 0, started = 0, running = false, disposed = false, completed = false;
  let frame = 0, slowFrames = 0, previous = 0, qualityReduced = false;
  const oldError = event => { event.preventDefault(); pause(); onError?.('context-lost'); };
  canvas.addEventListener('webglcontextlost',oldError);
  canvas.dataset.renderer='webgl'; canvas.dataset.train=config.id;canvas.dataset.scenario=scenario;canvas.dataset.asset=train.group.userData.assetPipeline||'procedural-fallback';canvas.dataset.lighting=rewardEnvironment(scenario)?'hdr-ibl':'studio';
  function resize() {
    if (disposed) return;
    const parent = canvas.parentElement;
    const width = Math.max(1,parent.clientWidth),height=Math.max(1,parent.clientHeight);
    renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix();
    if (!running) draw(elapsed);
  }
  function draw(milliseconds) {
    if(disposed)return;
    const seconds=milliseconds/1000,t=clamp(milliseconds/REWARD_DURATION,0,1);
    const depart=clamp((seconds-1.65)/5.35,0,1),travel=depot?109*depart*depart:24*seconds;
    const headS=-32+travel,pose=skybridge?skyPose(headS):{x:(depot?-14:-45)+travel,y:0,z:0,yaw:0};
    train.group.position.set(pose.x,pose.y+Math.sin(seconds*11)*.006,pose.z);train.group.rotation.y=pose.yaw;
    train.setHeadlights(depot?THREE.MathUtils.smoothstep(seconds,.15,.65):1);
    glowMaterial.opacity=(night?.7:.3)*(depot?THREE.MathUtils.smoothstep(seconds,.15,.65):1);
    for(const wheel of train.wheels) wheel.rotation[wheel.userData?.spinAxis || 'z']=-travel/(wheel.userData?.radius || .43);
    if(opposite){opposite.group.position.set(180-28*seconds,0,4.4);for(const wheel of opposite.wheels)wheel.rotation.z=-28*seconds/.43;}
    const position=cameraPath.getPoint(t),target=targetPath.getPoint(t),aspectScale=Math.max(1,1.05/camera.aspect);
    position.z*=aspectScale;
    // Keep the opening sightline inside the shutter's jambs in portrait too.
    if(depot)position.z=THREE.MathUtils.lerp(Math.max(position.z,-6),position.z,THREE.MathUtils.smoothstep(seconds,2.8,4));
    if(reduced){position.set(depot?38:40,skybridge?30:12,-(skybridge?110:80)*aspectScale);target.set(-15,1.5,0);}
    const axis=new THREE.Vector3(0,1,0);
    position.applyAxisAngle(axis,pose.yaw).add(train.group.position);target.applyAxisAngle(axis,pose.yaw).add(train.group.position);
    camera.position.copy(position);camera.lookAt(target);camera.fov=night?48:44;camera.updateProjectionMatrix();
    sun.position.set(pose.x+(depot?55:35),55,pose.z-32);sun.target.position.set(pose.x-20,0,pose.z);
    heroFill.position.set(pose.x+20,14,pose.z-20);heroFill.target.position.set(pose.x-10,2,pose.z);
    if(world.sky)world.sky.position.copy(camera.position);
    world.update(seconds,{headX:pose.x,headS,train});
    renderer.render(scene,camera);
    canvas.dataset.progress=t.toFixed(3);canvas.dataset.frame=String(++frame);
    onFrame?.(t);
  }
  function tick(now) {
    if (!running || disposed) return;
    elapsed=clamp(now-started,0,REWARD_DURATION);draw(elapsed);
    // Keep the same animation duration on slower phones; lower pixel cost only.
    if(previous && now-previous>55 && ++slowFrames>22 && !qualityReduced) {
      qualityReduced=true;renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;resize();
    }
    previous=now;
    if(elapsed>=REWARD_DURATION){running=false;completed=true;onComplete?.();return;}
    raf=requestAnimationFrame(tick);
  }
  function play() {
    if(disposed)return;cancelAnimationFrame(raf);elapsed=0;completed=false;previous=0;
    running=true;started=performance.now();raf=requestAnimationFrame(tick);
  }
  function pause() {
    if(disposed)return;cancelAnimationFrame(raf);
    if(running)elapsed=clamp(performance.now()-started,0,REWARD_DURATION);
    running=false;
  }
  function resume() {
    if(disposed||running||completed)return;
    running=true;started=performance.now()-elapsed;previous=0;raf=requestAnimationFrame(tick);
  }
  function dispose() {
    if(disposed)return;pause();disposed=true;observer.disconnect();
    canvas.removeEventListener('webglcontextlost',oldError);
    train.dispose();opposite?.dispose();glowTexture.dispose();glowMaterial.dispose();world.dispose();environment.dispose();sun.shadow.map?.dispose();sun.shadow.mapPass?.dispose();
    scene.clear();renderer.dispose();renderer.forceContextLoss();
    delete canvas.rewardScene;
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
  const api={play,pause,resume,dispose,
    seek(milliseconds){if(disposed)return;pause();elapsed=clamp(milliseconds,0,REWARD_DURATION);draw(elapsed);},
    get elapsed(){return elapsed;},get running(){return running;},
    get stats(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};},
  };
  canvas.rewardScene=api;return api;
}
