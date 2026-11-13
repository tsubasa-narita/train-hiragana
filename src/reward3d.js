import * as THREE from '../vendor/three/three.module.js';
import { REWARD_3D_TRAINS } from './reward3d-catalog.js';
import { bendTrainModel } from './reward3d-curve.js';
import { createDepotWorld } from './reward3d-depot.js';
import { createSkybridgeWorld, skyPose, SKY_RADIUS } from './reward3d-skybridge.js';
import { rewardScenario } from './reward3d-scenarios.js';
import { createTrainModel } from './reward3d-trains.js';
import { prepareTrainModels,createBlenderTrainModel,prepareEnvironment,rewardEnvironment } from './reward3d-assets.js';
import { createRailwayWorld, createReflectionEnvironment } from './reward3d-world.js';

import {REWARD_DURATION,rewardMoment,ramp} from './reward-timeline.js';
import {createFilmFinish} from './reward3d-film.js';
import {createCelebration} from './reward3d-celebration.js';
export {REWARD_DURATION};
const clamp = THREE.MathUtils.clamp;
const buildTrain=config=>createBlenderTrainModel(config)||createTrainModel(config);
function oppositeTrain(config){
  const pool=REWARD_3D_TRAINS.filter(t=>t.id!==config.id&&(t.gauge||1.067)===(config.gauge||1.067));
  return pool[(REWARD_3D_TRAINS.findIndex(t=>t.id===config.id))%pool.length]||config;
}
export async function prepareReward3D(config){
  const ids=[config.id];
  if(config.sceneId==='night')ids.push(oppositeTrain(config).id);
  try{await Promise.all([prepareTrainModels(ids),prepareEnvironment(config.sceneId)]);return true;}catch(error){console.warn('Blender asset unavailable; using local geometry.',error.message);return false;}
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
  const scene = new THREE.Scene(), warm = depot,shinkansen=config.family==='e5'||config.family==='e6';
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
  const camera = new THREE.PerspectiveCamera(44,1,.1,1300),film=createFilmFinish(renderer);
  const celebration=createCelebration(scene,{scenario,color:config.color,reduced});
  let renderStats={calls:0,triangles:0};
  const world = depot?createDepotWorld(scene,{config}):skybridge?createSkybridgeWorld(scene,{config}):createRailwayWorld(scene,{night:true,gauge:config.gauge||1.067});
  const train = buildTrain(config); scene.add(train.group);
  if(skybridge)bendTrainModel(train,SKY_RADIUS);
  const opposite=night?buildTrain({...oppositeTrain(config),sceneId:scenario}):null;
  if(opposite){opposite.group.rotation.y=Math.PI;scene.add(opposite.group);}
  const front=train.frontX||10.35;
  const focus=shinkansen?front-5:front-1.6;
  // Six continuous, timed compositions: face reveal, low launch, wide spectacle,
  // then a big, readable three-quarter hero view for the closing fanfare.
  const times=[0,1.1,3.2,6.7,8.4,10];
  const positions=(skybridge?
    [[front+13,2.7,-3.4],[front+12,2.5,-4.5],[front+7,2.5,-10],[front+13,9,-27],[front+8,5,-19],[front+7,3.6,-16]]:
    depot?[[front+13,2.9,-3],[front+12,2.6,-4],[front+8,2.4,-9],[front+9,4,-14],[front+7,3.5,-14],[front+6,3.1,-13]]:
    [[front+10,2.6,-5],[front+9,2.2,-6],[front+7,2.4,-10],[front+8,3.7,-15],[front+7,3.5,-14],[front+6,3,-13]]).map(v=>new THREE.Vector3(...v));
  const targets=[[focus,2.25,0],[focus,2.15,0],[focus-1,2.05,0],[shinkansen?-3:1,1.8,0],[focus-1,2.05,0],[focus,2.2,0]].map(v=>new THREE.Vector3(...v));
  function director(seconds){
    let i=0;while(i<times.length-2&&seconds>times[i+1])i++;
    const mix=ramp(times[i],times[i+1],seconds);
    return {position:positions[i].clone().lerp(positions[i+1],mix),target:targets[i].clone().lerp(targets[i+1],mix)};
  }
  const start=skybridge?-42:depot?-15:-45;
  const finalDistance=rewardMoment(8200,shinkansen).distance;
  const passingX=start+rewardMoment(5300,shinkansen).distance+front+(opposite?.frontX||front);
  const glowTexture=(()=>{
    const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,248,218,1)');g.addColorStop(.12,'rgba(255,239,184,.8)');g.addColorStop(.4,'rgba(255,227,168,.12)');g.addColorStop(1,'rgba(255,227,168,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);
  })();
  const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:night?.7:.3});
  for(const z of [-1,1]){const glow=new THREE.Sprite(glowMaterial);glow.position.set(shinkansen?(config.family==='e5'?3.7:3.6):10.16,shinkansen?(config.family==='e5'?2.65:2.45):config.id==='toyoko'?3.67:3.72,z*(shinkansen?1.12:1));glow.scale.setScalar(night?.60:.32);train.group.add(glow);}
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
    const moment=rewardMoment(milliseconds,shinkansen),seconds=moment.seconds,t=moment.progress,travel=moment.distance;
    const headS=start+travel,pose=skybridge?skyPose(headS):{x:start+travel,y:0,z:0,yaw:0};
    train.group.position.set(pose.x,pose.y+Math.sin(seconds*11)*.005,pose.z);train.group.rotation.y=pose.yaw;
    train.setHeadlights(moment.headlights);
    glowMaterial.opacity=(night?.60:.26)*moment.headlights;
    for(const wheel of train.wheels)wheel.rotation[wheel.userData?.spinAxis||'z']=-travel/(wheel.userData?.radius||.43);
    if(opposite){opposite.group.position.set(passingX+(5.3-seconds)*42,0,4.4);for(const wheel of opposite.wheels)wheel.rotation.z=-42*seconds/.43;}
    const {position,target}=director(seconds),aspectScale=Math.max(1,1.18/camera.aspect);
    position.z*=aspectScale;
    const portrait=clamp((1.05-camera.aspect)/.35,0,1);
    if(shinkansen&&portrait){
      target.x=THREE.MathUtils.lerp(target.x,front*.5+.3,portrait);
      position.z*=1+.22*portrait*moment.reveal;
      if(depot){const opening=1-ramp(2.8,4.2,seconds);position.x+=4*portrait*opening;target.x+=1.2*portrait*opening;}
      if(skybridge){
        // A long nose shown side-on forces the tall phone camera far away.
        // Keep the broad rainbow reveal, then foreshorten the closing hero
        // shot so headlights and windscreen are legible on a tall display.
        const close=ramp(6.9,9.2,seconds)*portrait;
        position.x=THREE.MathUtils.lerp(position.x,front+17-2*moment.finale,close);
        position.y=THREE.MathUtils.lerp(position.y,6.6-2.4*moment.finale,close);
        position.z=THREE.MathUtils.lerp(position.z,-11+2.5*moment.finale,close);
      }
    }
    if(depot)position.z=THREE.MathUtils.lerp(Math.max(position.z,-5),position.z,ramp(2.8,4.2,seconds));
    // The initial tunnel sightline passes through the opening, not the rock.
    if(skybridge&&seconds<2.8)position.z=THREE.MathUtils.lerp(Math.max(position.z,-3.6),position.z,ramp(1.7,2.8,seconds));
    if(reduced){position.set(front+28,skybridge?18:9,-(skybridge?65:55)*aspectScale);target.set(0,2,0);}
    const axis=new THREE.Vector3(0,1,0);
    position.applyAxisAngle(axis,pose.yaw).add(train.group.position);target.applyAxisAngle(axis,pose.yaw).add(train.group.position);
    camera.position.copy(position);camera.lookAt(target);camera.fov=44-3*moment.finale;camera.updateProjectionMatrix();
    // Fit the actual nose and both rear corners of the windscreen in a phone
    // frame. Backing along the same sightline also preserves portal clearance.
    if(shinkansen&&portrait&&!reduced){
      train.group.updateWorldMatrix(true,false);
      const back=config.family==='e5'?-1.05:-.3;
      const anchors=[new THREE.Vector3(front,1.5,0),new THREE.Vector3(back,3.65,-1.5),new THREE.Vector3(back,3.65,1.5)].map(p=>p.applyMatrix4(train.group.matrixWorld));
      for(let i=0;i<5;i++){
        camera.updateMatrixWorld();let fit=1;
        for(const anchor of anchors){const p=anchor.clone().project(camera);fit=Math.max(fit,Math.abs(p.x)/.84,Math.abs(p.y)/.84);}
        if(fit<=1)break;
        camera.position.sub(target).multiplyScalar(Math.min(fit*1.02,1.6)).add(target);camera.lookAt(target);
      }
    }
    renderer.toneMappingExposure=night?1.08:depot?1.0:.82+.20*moment.reveal;
    scene.environmentIntensity=night?.38:depot?.65:.43+.32*moment.reveal;
    sun.position.set(pose.x+(depot?55:35),55,pose.z-32);sun.target.position.set(pose.x-20,0,pose.z);
    heroFill.position.set(pose.x+20,14,pose.z-20);heroFill.target.position.set(pose.x-10,2,pose.z);
    celebration.update(moment,pose,{x:start+finalDistance},camera);
    if(world.sky)world.sky.position.copy(camera.position);
    world.update(seconds,{headX:pose.x,headS,train,moment});
    renderStats=film.render(scene,camera,moment);
    canvas.dataset.chapter=moment.chapter;
    canvas.dataset.progress=t.toFixed(3);canvas.dataset.frame=String(++frame);
    onFrame?.(t);
  }
  function tick(now) {
    if (!running || disposed) return;
    elapsed=clamp(now-started,0,REWARD_DURATION);draw(elapsed);
    // Keep the same animation duration on slower phones; lower pixel cost only.
    if(previous && now-previous>55 && ++slowFrames>22 && !qualityReduced) {
      qualityReduced=true;film.reduceQuality();renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;resize();
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
    train.dispose();opposite?.dispose();film.dispose();celebration.dispose();glowTexture.dispose();glowMaterial.dispose();world.dispose();environment.dispose();sun.shadow.map?.dispose();sun.shadow.mapPass?.dispose();
    scene.clear();renderer.dispose();renderer.forceContextLoss();
    delete canvas.rewardScene;
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
  const api={play,pause,resume,dispose,
    seek(milliseconds){if(disposed)return;pause();elapsed=clamp(milliseconds,0,REWARD_DURATION);draw(elapsed);},
    get framing(){const project=(x,y)=>{const p=new THREE.Vector3(x,y,0).applyMatrix4(train.group.matrixWorld).project(camera);return {x:(p.x+1)/2,y:(1-p.y)/2,depth:p.z};};return {...project(front,shinkansen?1.5:2.5),cab:project(shinkansen?(config.family==='e5'?-1.05:-.3):front,3)};},
    get elapsed(){return elapsed;},get running(){return running;},
    get stats(){return {...renderStats,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};},
  };
  canvas.rewardScene=api;return api;
}
