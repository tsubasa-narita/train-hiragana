import * as THREE from '../vendor/three/three.module.js';
import { createTrainModel } from './reward3d-trains.js';
import { createRailwayWorld, createReflectionEnvironment } from './reward3d-world.js';

export const REWARD_DURATION = 7000;
const clamp = THREE.MathUtils.clamp;

// Real geometry moves through a fixed world; the camera glides between three
// cinematic views. Seconds, metres and wheel rotation share the same clock.
export function createReward3D(canvas, config, { onFrame, onComplete, onError, reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), warm = config.id === 'shonan-shinjuku';
  scene.background = new THREE.Color(warm ? 0xe3c9aa : 0xb8d3de);
  scene.fog = new THREE.Fog(warm ? 0xd7cbbc : 0xbbcdd0, 200, 750);
  const environment = createReflectionEnvironment(renderer, warm); scene.environment = environment.texture;
  scene.environmentIntensity = .85;
  const hemisphere = new THREE.HemisphereLight(0xe8f4ff, 0x78836c, 1.35); scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(warm ? 0xffdab0 : 0xffefd8, 2.7);
  sun.castShadow = true; sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera, { left:-90, right:65, top:30, bottom:-30, near:1, far:200 });
  sun.shadow.bias = -.00015; sun.shadow.normalBias = .035;
  scene.add(sun, sun.target);
  const camera = new THREE.PerspectiveCamera(44,1,.1,1300);
  const world = createRailwayWorld(scene, { warm, blossom:config.id==='toyoko' });
  const train = createTrainModel(config); scene.add(train.group);
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(28,3.2,-16), new THREE.Vector3(19,2.3,-10),
    new THREE.Vector3(10,3.1,-19), new THREE.Vector3(24,7,-34), new THREE.Vector3(40,14,-58),
  ],false,'catmullrom',.35);
  const targetPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(5,2.3,0), new THREE.Vector3(7,2.3,0),
    new THREE.Vector3(3,2.3,0), new THREE.Vector3(-5,2,0),new THREE.Vector3(-24,1.6,0),
  ]);
  let raf = 0, elapsed = 0, started = 0, running = false, disposed = false, completed = false;
  let frame = 0, slowFrames = 0, previous = 0, qualityReduced = false;
  const oldError = event => { event.preventDefault(); pause(); onError?.('context-lost'); };
  canvas.addEventListener('webglcontextlost',oldError);
  canvas.dataset.renderer='webgl'; canvas.dataset.train=config.id;
  function resize() {
    if (disposed) return;
    const parent = canvas.parentElement;
    const width = Math.max(1,parent.clientWidth),height=Math.max(1,parent.clientHeight);
    renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix();
    if (!running) draw(elapsed);
  }
  function draw(milliseconds) {
    if(disposed)return;
    const seconds=milliseconds/1000,t=clamp(milliseconds/REWARD_DURATION,0,1),travel=24*seconds;
    train.group.position.x=-45+travel;
    train.group.position.y=Math.sin(seconds*11)*.006;
    for(const wheel of train.wheels) wheel.rotation[wheel.userData?.spinAxis || 'z']=-travel/(wheel.userData?.radius || .43);
    const position=cameraPath.getPoint(t),target=targetPath.getPoint(t);
    const aspectScale=Math.max(1,1.05/camera.aspect);
    if (reduced) {camera.position.set(40,16,-150*aspectScale);target.set(-15,1.5,0);}
    else {
      position.z*=aspectScale; position.x+=train.group.position.x;
      camera.position.copy(position);target.x+=train.group.position.x;
    }
    camera.lookAt(target); camera.fov=44+Math.sin(t*Math.PI)*3;camera.updateProjectionMatrix();
    sun.position.set(train.group.position.x+35,55,-32);sun.target.position.set(train.group.position.x-20,0,0);
    world.sky.position.x=camera.position.x;world.update(seconds);
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
    train.dispose();world.dispose();environment.dispose();sun.shadow.map?.dispose();sun.shadow.mapPass?.dispose();
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
