import * as THREE from '../vendor/three/three.module.js';
import { REWARD_3D_TRAINS, isShinkansen } from './reward3d-catalog.js';
import { bendTrainModel } from './reward3d-curve.js';
import { createDepotWorld } from './reward3d-depot.js';
import { createSkybridgeWorld, skyPose, SKY_RADIUS } from './reward3d-skybridge.js';
import { createSakuraWorld } from './reward3d-sakura.js';
import { createSnowWorld } from './reward3d-snow.js';
import { createAquariumWorld, createDioramaWorld } from './reward3d-dream.js';
import { createPlayroomWorld } from './reward3d-playroom.js';
import { rewardScenario, isToyReward } from './reward3d-scenarios.js';
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
  const pool=REWARD_3D_TRAINS.filter(t=>t.id!==config.id&&(t.gauge||1.067)===(config.gauge||1.067)&&isShinkansen(t)===isShinkansen(config));
  if(!pool.length)return config;
  return pool[(REWARD_3D_TRAINS.findIndex(t=>t.id===config.id))%pool.length]||config;
}
export async function prepareReward3D(config){
  const ids=[config.id];
  if(config.sceneId==='night')ids.push(oppositeTrain(config).id);
  try{await Promise.all([prepareTrainModels(ids),prepareEnvironment(config.sceneId)]);return true;}catch(error){console.warn('Blender asset unavailable; using local geometry.',error.message);return false;}
}

// Real geometry moves through a fixed world; the camera glides between
// cinematic views. Seconds, metres and wheel rotation share the same clock.
export function createReward3D(canvas, config, { onFrame, onComplete, onError, reduced = false } = {}) {
  const mobile=globalThis.matchMedia('(pointer: coarse)').matches;
  // Only the offscreen target needs antialiasing. The canvas receives one quad.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scenario=rewardScenario(config.sceneId).id,night=scenario==='night',depot=scenario==='depot',skybridge=scenario==='skybridge';
  const sakura=scenario==='sakura',snow=scenario==='snow',seasonal=sakura||snow;
  const aquarium=scenario==='aquarium',diorama=scenario==='diorama',playroom=isToyReward(scenario),dream=aquarium||diorama||playroom;
  const space=scenario==='toy-space',park=scenario==='toy-park';
  const scene = new THREE.Scene(), warm = depot||sakura||playroom,shinkansen=isShinkansen(config);
  const roomColor=space?0x222751:park?0xc7e5ec:0xf6ddb6;
  scene.background = new THREE.Color(aquarium?0x185779:diorama?0xbcc2a8:playroom?roomColor:snow?0x829bc3:warm?0xe3c9aa:0xb8d3de);
  const fogColor=aquarium?0x185779:diorama?0xbcc2a8:playroom?roomColor:snow?0x829bc3:sakura?0xd9cbd1:night?0x0b1934:warm?0xe7c49a:0xc7e3f0;
  scene.fog = new THREE.Fog(fogColor,aquarium?42:playroom?88:night?160:seasonal?120:300,aquarium?350:playroom?290:night?650:seasonal?680:1200);
  const environment = createReflectionEnvironment(renderer,warm,scenario,rewardEnvironment(scenario)); scene.environment = environment.texture;scene.environmentRotation.set(0,night?-1.57:depot?.9:-.4,0);
  scene.environmentIntensity = night?.3:.65;
  renderer.toneMappingExposure=night?1.05:.92;
  const hemisphere = new THREE.HemisphereLight(aquarium?0xb5e5ff:snow?0xb3d8ff:0xe8f4ff,aquarium?0x274a81:snow?0x657ba8:night?0x14213c:0x78836c,aquarium?1.14:playroom?1.18:diorama?.8:snow?1.05:night?.45:depot?.42:.7); scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(aquarium?0xc7edff:playroom||diorama?0xffe6bb:snow?0xffd4b5:night?0x7aafff:warm?0xffdab0:0xffefd8,aquarium?2.45:playroom?2.8:diorama?3.0:snow?2.1:sakura?3.15:night?1.1:depot?4.8:3.9);
  sun.castShadow = true; sun.shadow.mapSize.setScalar(mobile?512:globalThis.innerWidth>900?2048:1024);
  sun.shadow.autoUpdate=!mobile;
  sun.shadow.needsUpdate=true;
  Object.assign(sun.shadow.camera, { left:-50, right:45, top:25, bottom:-25, near:1, far:200 });
  sun.shadow.bias = -.00015; sun.shadow.normalBias = .035;
  scene.add(sun, sun.target);
  // A broad, shadow-free fill emulates station/city spill on the hero body.
  // The key still defines the shadows; this only keeps night steel readable.
  const heroFill=new THREE.DirectionalLight(snow?0x9bcaff:0xd5e5fa,snow?.9:night?1.3:depot?.4:.3);scene.add(heroFill,heroFill.target);
  // Let the headlights reveal the rails and ballast as the train advances.
  // The small cone is unshadowed and only exists in the night scene.
  const headlightThrow = night ? new THREE.SpotLight(0xffe5bd, 0, 34, .27, .83) : null;
  if (headlightThrow) scene.add(headlightThrow, headlightThrow.target);
  const camera = new THREE.PerspectiveCamera(44,1,.1,1300),film=createFilmFinish(renderer,mobile);
  const celebration=createCelebration(scene,{scenario,color:config.color,reduced});
  let renderStats={calls:0,triangles:0};
  const world = aquarium?createAquariumWorld(scene,{config,reduced}):
    playroom?createPlayroomWorld(scene,{config,reduced}):
    diorama?createDioramaWorld(scene,{config,reduced}):
    sakura?createSakuraWorld(scene,{config,reduced}):
    snow?createSnowWorld(scene,{config,reduced}):
    depot?createDepotWorld(scene,{config,reduced}):
    skybridge?createSkybridgeWorld(scene,{config,reduced}):
    createRailwayWorld(scene,{night:true,gauge:config.gauge||1.067,reduced,mobile});
  const consist=playroom?{...config,cars:4,greenCars:config.greenCars?.length?[2]:[],pantographCars:[1]}:config;
  const train = buildTrain(consist); scene.add(train.group);
  if(skybridge)bendTrainModel(train,SKY_RADIUS);
  const opposite=night?buildTrain({...oppositeTrain(config),sceneId:scenario}):null;
  if(opposite){opposite.group.rotation.y=Math.PI;scene.add(opposite.group);}
  const front=train.frontX||10.35;
  const focus=shinkansen?front-5:front-1.6;
  const cabBack=config.cabBack??(config.family==='e5'?-1.05:-.3);
  // Six continuous, timed compositions: face reveal, low launch, wide spectacle,
  // then a big, readable three-quarter hero view for the closing fanfare.
  const times=park||space?[0,1.1,3.2,4.7,6.35,8.4,10]:[0,1.1,3.2,6.7,8.4,10];
  const positions=(aquarium?
    [[front+15,3.85,-4.6],[front+12,3.55,-6],[front+8,4.1,-13],[front-2,7.2,-27],[front+7,5.3,-18],[front+7,4.1,-13]]:
    park?[[front+12,5.7,-9.4],[front+11,4.7,-9.8],[front+10,3.6,-10],[front+11,2.65,-11],[front+10,14,-22],[front+11,8.7,-15],[front+9,4.2,-10]]:
    space?[[front+12,5.7,-9.4],[front+11,4.7,-9.8],[front+9,4.8,-11],[front+8,6,-14],[front+9,9,-19],[front+11,8.7,-15],[front+9,4.2,-10]]:
    playroom?[[front+12,5.7,-9.4],[front+11,4.7,-9.8],[front+9,7.2,-14],[front+6,31,-25],[front+11,8.7,-15],[front+9,4.2,-10]]:
    diorama?[[front+16,18,-32],[front+15,14,-23],[front+7,20,-18],[front-12,61,-15],[front+9,17,-19],[front+8,7,-14]]:
    skybridge?
    [[front+13,2.7,-3.4],[front+12,2.5,-4.5],[front+7,2.5,-10],[front+13,9,-27],[front+8,5,-19],[front+7,3.6,-16]]:
    depot?[[front+(shinkansen?4.2:7.35),3.8,-8.9],[front+(shinkansen?4.4:7.4),3.5,-8.4],[front+8,2.4,-9],[front+9,4,-14],[front+7,3.5,-14],[front+6,3.1,-13]]:
    sakura?[[front+12,3.1,-6],[front+11,2.85,-7],[front+7,2.8,-10],[front+13,10.5,-25],[front+10,5.8,-17],[front+8,4,-12]]:
    snow?[[front+12,3.4,-8],[front+12,2.9,-8],[front+9,2.55,-12],[front+18,8,-26],[front+12,5.3,-16],[front+9,3.45,-12]]:
    [[front+10,2.6,-5],[front+9,2.2,-6],[front+7,2.4,-10],[front+8,3.7,-15],[front+7,3.5,-14],[front+6,3,-13]]).map(v=>new THREE.Vector3(...v));
  const targets=(aquarium?
    [[focus,2.8,0],[focus,2.9,0],[focus-2,3.6,2],[front-10,6.1,7],[focus-2,3.4,1],[focus,2.35,0]]:
    park?[[focus,3.1,1],[focus,3.05,1],[focus,2.65,0],[focus,2.5,1],[focus-3,7.7,4],[focus-3,3.3,2],[focus-1,2.50,0]]:
    space?[[focus,3.1,1],[focus,3.05,1],[focus-1,3.6,1],[focus,6.2,4],[focus-2,7,3],[focus-3,3.3,2],[focus-1,2.50,0]]:
    playroom?[[focus,3.1,1],[focus,3.05,1],[focus-2,3,2],[front-16,1.6,1],[focus-3,3.3,2],[focus-1,2.50,0]]:
    diorama?[[focus-4,1.2,-5],[focus,2.4,1],[focus-1,2,3],[front-15,1.1,9],[focus-2,2.2,1],[focus,2.25,0]]:
    [[focus,2.25,0],[focus,2.15,0],[focus-1,2.05,0],[shinkansen?-3:1,1.8,0],[focus-1,2.05,0],[focus,2.2,0]]).map(v=>new THREE.Vector3(...v));
  function director(seconds){
    let i=0;while(i<times.length-2&&seconds>times[i+1])i++;
    const mix=ramp(times[i],times[i+1],seconds);
    return {position:positions[i].clone().lerp(positions[i+1],mix),target:targets[i].clone().lerp(targets[i+1],mix)};
  }
  const start=skybridge?-42:depot?-20:diorama?-38:playroom?-33:seasonal||aquarium?-26:-45;
  const passingX=start+rewardMoment(5300,shinkansen).distance+front+(opposite?.frontX||front);
  const glowTexture=(()=>{
    const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,248,218,1)');g.addColorStop(.12,'rgba(255,239,184,.8)');g.addColorStop(.4,'rgba(255,227,168,.12)');g.addColorStop(1,'rgba(255,227,168,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);
  })();
  const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:night?.7:.3});
  const lightOrigin=new THREE.Vector3(),viewDirection=new THREE.Vector3();
  const lampGlows=(train.headlamps??[]).map(({position,radius})=>{
    const glow=new THREE.Sprite(glowMaterial);
    glow.scale.setScalar(radius*(night?3.25:2.05));
    scene.add(glow);
    lightOrigin.add(position);
    return {glow,position};
  });
  if(lampGlows.length)lightOrigin.divideScalar(lampGlows.length);
  else lightOrigin.set(front,2.7,0);
  let raf = 0, elapsed = 0, started = 0, running = false, disposed = false, completed = false;
  let frame=0, previous=0, quality=0, slowTime=0;
  const oldError = event => { event.preventDefault(); pause(); onError?.('context-lost'); };
  canvas.addEventListener('webglcontextlost',oldError);
  canvas.dataset.renderer='webgl'; canvas.dataset.train=config.id;canvas.dataset.scenario=scenario;canvas.dataset.asset=train.group.userData.assetPipeline||'procedural-fallback';canvas.dataset.lighting=rewardEnvironment(scenario)?'hdr-ibl':'studio';
  let viewportWidth=0,viewportHeight=0,pixelRatio=0;
  function resize() {
    if (disposed) return;
    const parent = canvas.parentElement;
    const width = Math.max(1,parent.clientWidth),height=Math.max(1,parent.clientHeight);
    const density=Math.min(globalThis.devicePixelRatio||1,mobile?1.25:2);
    const budget=mobile?385000:2050000;
    const scale=[1,.82,.65][quality];
    const ratio=Math.min(density,Math.sqrt(budget/(width*height)))*scale;
    if(width===viewportWidth&&height===viewportHeight&&ratio===pixelRatio)return;
    viewportWidth=width;viewportHeight=height;pixelRatio=ratio;
    if(renderer.getPixelRatio()!==ratio)renderer.setPixelRatio(ratio);
    renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix();
    if (!running) draw(elapsed);
  }
  function draw(milliseconds, silent=false) {
    if(disposed)return;
    const moment=rewardMoment(milliseconds,shinkansen),seconds=moment.seconds,t=moment.progress,travel=moment.distance;
    const headS=start+travel,pose=skybridge?skyPose(headS):{x:start+travel,y:0,z:0,yaw:0};
    train.group.position.set(pose.x,pose.y+Math.sin(seconds*11)*.005,pose.z);train.group.rotation.y=pose.yaw;
    train.setHeadlights(moment.headlights);
    if(aquarium)train.setLightingTime?.(reduced?0:seconds);
    glowMaterial.opacity=(night?.55:.24)*moment.headlights;
    if (headlightThrow) {
      headlightThrow.position.copy(lightOrigin).add(train.group.position);
      headlightThrow.position.x+=.16;
      headlightThrow.target.position.set(pose.x + front + 13, .06, pose.z + .32);
      headlightThrow.intensity = 115 * moment.headlights;
    }
    for(const wheel of train.wheels)wheel.rotation[wheel.userData?.spinAxis||'z']=-travel/(wheel.userData?.radius||.43);
    if(opposite){opposite.group.position.set(passingX+(5.3-seconds)*42,0,4.4);for(const wheel of opposite.wheels)wheel.rotation.z=-42*seconds/.43;}
    const {position,target}=director(seconds),aspectScale=Math.max(1,(seasonal?1.03:1.18)/camera.aspect);
    position.z*=dream?Math.min(1.36,aspectScale):aspectScale;
    const portrait=clamp((1.05-camera.aspect)/.35,0,1);
    const crossing=ramp(3.4,5.25,seconds)*(1-ramp(6.85,8.15,seconds));
    if(!shinkansen&&!dream)target.x=THREE.MathUtils.lerp(target.x,front-3.5,portrait*crossing);
    // Look down over both tracks during the pass so that the opposing car
    // can be followed behind the hero, even on a narrow screen.
    if(night)position.y+=(5+15*portrait)*crossing;
    if(shinkansen&&portrait&&!dream){
      target.x=THREE.MathUtils.lerp(target.x,front*.5+.3,portrait);
      position.z*=1+.22*portrait*moment.reveal;
      if(depot)target.x+=1.2*portrait*(1-ramp(2.8,4.2,seconds));
    }
    // The initial tunnel sightline passes through the opening, not the rock.
    if(skybridge&&seconds<2.8)position.z=THREE.MathUtils.lerp(Math.max(position.z,-3.6),position.z,ramp(1.7,2.8,seconds));
    if(reduced){
      position.set(front+28,diorama||playroom?25:skybridge?18:9,-(skybridge?65:55)*aspectScale);target.set(0,dream?3:2,0);
    }else if(!dream){
      // After the wide crossing, travel ahead of the nose and look back along
      // the consist. A tall frame needs a more frontal angle, not a longer lens.
      const approach=ramp(6.7,9.65,seconds);
      const lean=THREE.MathUtils.lerp(1,.73,portrait);
      position.x=THREE.MathUtils.lerp(position.x,front+(shinkansen?12:8.2),approach);
      position.z=THREE.MathUtils.lerp(position.z,-(shinkansen?12:9)*lean,approach);
      position.y=THREE.MathUtils.lerp(position.y,shinkansen?5.2:3.4,approach);
      target.x=THREE.MathUtils.lerp(target.x,front-(shinkansen?6.2:2.6),approach);
      target.y=THREE.MathUtils.lerp(target.y,night?2.65:2.15,approach);
    }
    const axis=new THREE.Vector3(0,1,0);
    position.applyAxisAngle(axis,pose.yaw).add(train.group.position);target.applyAxisAngle(axis,pose.yaw).add(train.group.position);
    camera.position.copy(position);camera.lookAt(target);camera.fov=44-3*moment.finale;camera.updateProjectionMatrix();
    // Fit the actual nose and both rear corners of the windscreen in a phone
    // frame. Backing along the same sightline also preserves portal clearance.
    if((shinkansen||dream)&&portrait&&!reduced){
      train.group.updateWorldMatrix(true,false);
      const anchorBack=shinkansen?cabBack:front-4.5;
      const anchors=[new THREE.Vector3(front,1.5,0),new THREE.Vector3(anchorBack,3.65,-1.5),new THREE.Vector3(anchorBack,3.65,1.5)].map(p=>p.applyMatrix4(train.group.matrixWorld));
      for(let i=0;i<5;i++){
        camera.updateMatrixWorld();let fit=1;
        for(const anchor of anchors){const p=anchor.clone().project(camera);fit=Math.max(fit,Math.abs(p.x)/.84,Math.abs(p.y)/.84);}
        if(fit<=1)break;
        camera.position.sub(target).multiplyScalar(Math.min(fit*1.02,1.6)).add(target);camera.lookAt(target);
      }
    }
    train.group.updateWorldMatrix(true,false);
    for(const {glow,position} of lampGlows){
      glow.position.copy(position).applyMatrix4(train.group.matrixWorld);
      viewDirection.subVectors(camera.position,glow.position).normalize();
      glow.position.addScaledVector(viewDirection,.085);
    }
    renderer.toneMappingExposure=aquarium?1.02:diorama||playroom?.96:snow?1.12:night?1.08:depot?1.0:.82+.20*moment.reveal;
    scene.environmentIntensity=aquarium?.51:playroom?.49:diorama?.58:snow?.55:night?.38:depot?.65:.43+.32*moment.reveal;
    sun.position.set(pose.x+(depot?55:35),snow?30:55,pose.z-32);sun.target.position.set(pose.x-20,0,pose.z);
    heroFill.position.set(pose.x+20,14,pose.z-20);heroFill.target.position.set(pose.x-10,2,pose.z);
    celebration.update(moment,pose,camera);
    if(world.sky)world.sky.position.copy(camera.position);
    world.update(seconds,{headX:pose.x,headS,train,moment});
    if(mobile&&(!running||frame%2===0))sun.shadow.needsUpdate=true;
    renderStats=film.render(scene,camera,moment);
    if(silent)return;
    canvas.dataset.chapter=moment.chapter;
    canvas.dataset.progress=t.toFixed(3);canvas.dataset.frame=String(++frame);
    onFrame?.(t);
  }
  async function preparePlayback(){
    // Submit the passes first seen at the action and finale while the loading
    // overlay is up. Preserve the opening frame and start the clock afterwards.
    if(disposed)return;
    if(!reduced){
      draw(night?5350:space?5250:4900,true);
      if(night)draw(9210,true);
      draw(0,true);
    }
    const gl=renderer.getContext(),fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);
    if(!fence)return;
    gl.flush();
    const until=performance.now()+160;
    try{
      while(!disposed&&performance.now()<until&&gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED){
        await new Promise(resolve=>setTimeout(resolve,8));
      }
    }finally{if(!disposed)gl.deleteSync(fence);}
  }
  function tick(now) {
    if (!running || disposed) return;
    // React to a sustained slow cadence within the first moving shot.
    // A single delay from a resize, tab switch or startup cannot lower quality.
    if(previous&&quality<2){
      const interval=Math.min(now-previous,80);
      slowTime=interval>23?slowTime+interval:Math.max(0,slowTime-interval*2);
      if(slowTime>(quality===0?260:480)){
        quality++;slowTime=0;
        film.reduceQuality(quality===2);
        if(quality===2)sun.castShadow=false;
        resize();
      }
    }
    previous=now;
    elapsed=clamp(now-started,0,REWARD_DURATION);draw(elapsed);
    if(elapsed>=REWARD_DURATION){running=false;completed=true;onComplete?.();return;}
    raf=requestAnimationFrame(tick);
  }
  function play() {
    if(disposed)return;cancelAnimationFrame(raf);elapsed=0;completed=false;previous=0;slowTime=0;
    running=true;started=performance.now();raf=requestAnimationFrame(tick);
  }
  function pause() {
    if(disposed)return;cancelAnimationFrame(raf);
    if(running)elapsed=clamp(performance.now()-started,0,REWARD_DURATION);
    running=false;
  }
  function resume() {
    if(disposed||running||completed)return;
    running=true;started=performance.now()-elapsed;previous=0;slowTime=0;raf=requestAnimationFrame(tick);
  }
  function dispose() {
    if(disposed)return;pause();disposed=true;observer.disconnect();
    canvas.removeEventListener('webglcontextlost',oldError);
    train.dispose();opposite?.dispose();film.dispose();celebration.dispose();glowTexture.dispose();glowMaterial.dispose();world.dispose();environment.dispose();sun.shadow.map?.dispose();sun.shadow.mapPass?.dispose();
    scene.clear();renderer.dispose();renderer.forceContextLoss();
    delete canvas.rewardScene;
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
  const api={play,pause,resume,dispose,preparePlayback,
    seek(milliseconds){if(disposed)return;pause();elapsed=clamp(milliseconds,0,REWARD_DURATION);draw(elapsed);},
    get framing(){const project=(x,y)=>{const p=new THREE.Vector3(x,y,0).applyMatrix4(train.group.matrixWorld).project(camera);return {x:(p.x+1)/2,y:(1-p.y)/2,depth:p.z};};return {...project(front,shinkansen?1.5:2.5),cab:project(shinkansen?cabBack:front,3)};},
    get elapsed(){return elapsed;},get running(){return running;},
    get stats(){return {...renderStats,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};},
  };
  canvas.rewardScene=api;return api;
}
