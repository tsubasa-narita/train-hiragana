import { stopVoice } from './voice.js';
import { quizImageFile } from './quiz-images.js';
import { REWARD_3D_TRAINS } from './reward3d-catalog.js';
import { chooseRewardExperience, resolveRewardExperience, rewardScenario } from './reward3d-scenarios.js';

export const REWARD_TRAINS = REWARD_3D_TRAINS;
export const REWARD_BOOK_IDS = Object.freeze(Object.fromEntries(REWARD_TRAINS.map(train=>[train.id,train.bookId])));
export const REWARD_DURATION = 7000;
export function rewardBookId(train,trains) {
  const id=Object.hasOwn(REWARD_BOOK_IDS,train?.id)?REWARD_BOOK_IDS[train.id]:null;
  return trains.some(item=>item.id===id)?id:null;
}
let activeClose,previousId,context;
export function chooseReward(excludeId=previousId) {
  const pool=REWARD_TRAINS.filter(train=>train.id!==excludeId);
  const train=pool[Math.floor(Math.random()*pool.length)];previousId=train.id;return train;
}
export function stopTrainReward(){activeClose?.(false);}
export function unlockRewardAudio(enabled){
  if(!enabled)return;
  try{context??=new(window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});}catch{}
}
// A restrained motor chord, rail rhythm and passing air, all owned by this clip.
function passSound(enabled,duration=7,sceneId='night',offset=0){
  if(!enabled)return()=>{};
  try{
    unlockRewardAudio(true);if(!context)return()=>{};
    const now=context.currentTime,gain=context.createGain(),filter=context.createBiquadFilter();
    const panner=context.createStereoPanner?.(),nodes=[gain,filter],sources=[];
    gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(.08,now+.7);
    gain.gain.setValueAtTime(.08,now+Math.max(.7,duration-.8));gain.gain.linearRampToValueAtTime(.001,now+duration);
    filter.type='lowpass';filter.frequency.value=1350;filter.connect(gain);
    if(panner){gain.connect(panner);panner.connect(context.destination);panner.pan.setValueAtTime(-.35,now);panner.pan.linearRampToValueAtTime(.35,now+duration);nodes.push(panner);}else gain.connect(context.destination);
    const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),samples=buffer.getChannelData(0);
    for(let i=0;i<samples.length;i++){
      const t=i/context.sampleRate+offset,speed=sceneId==='depot'?Math.max(0,Math.min(1,(t-1.65)/4)):1,beat=(t*(1+speed*2.6))%1;
      const passing=sceneId==='night'?.38*Math.exp(-Math.pow((t-3.8)/.55,2)):0;
      const shutter=sceneId==='depot'&&t>.35&&t<1.6?.11:0;
      samples[i]=(Math.random()*2-1)*((beat<.026||beat>.27&&beat<.296?.58:.14)*speed+passing+shutter);
    }
    const noise=context.createBufferSource();noise.buffer=buffer;noise.connect(filter);noise.start(now);noise.stop(now+duration);sources.push(noise);
    for(const hz of [104,208,312]){
      const motor=context.createOscillator(),level=context.createGain();motor.type='sine';
      motor.frequency.setValueAtTime(hz*(sceneId==='depot'?.55+Math.min(1,offset/7)*.5:.95),now);motor.frequency.linearRampToValueAtTime(hz*1.06,now+duration);
      level.gain.value=.025;motor.connect(level);level.connect(gain);motor.start(now);motor.stop(now+duration);sources.push(motor);nodes.push(level);
    }
    let stopped=false;
    return()=>{if(stopped)return;stopped=true;for(const node of sources){try{node.stop();}catch{}node.disconnect();}for(const node of nodes)node.disconnect();};
  }catch{return()=>{};}
}

export function showTrainReward({ train:requested, sound=true, speak, onDone, onBook, onTrainChange, onSoundChange,
  loadScene=()=>import('./reward3d.js') }={}){
  stopTrainReward();unlockRewardAudio(sound);
  const current=resolveRewardExperience(requested);
  const dialog=document.createElement('dialog');dialog.className='reward-dialog reward-cinema';
  dialog.setAttribute('aria-labelledby','reward-title');
  dialog.innerHTML=`<header class="reward-heading"><div><span class="reward-eyebrow">ごほうびの でんしゃ</span><h2 id="reward-title"></h2><small class="reward-model-name"></small></div><button class="reward-mute" data-reward="mute"></button></header>
    <div class="reward-scene"><canvas class="reward-canvas" aria-label="線路と風景の中を走る立体の電車"></canvas>
      <div class="reward-loading" role="status"><span class="reward-loading-ring"></span>でんしゃを よんでいるよ…</div>
      <div class="reward-fallback" hidden><img alt=""><small>この端末ではイラストで表示しています</small></div>
      <div class="reward-film-edge" aria-hidden="true"></div><div class="reward-progress" aria-hidden="true"><i></i></div>
    </div><p class="reward-status" role="status">でんしゃが やってくるよ</p>
    <div class="reward-controls"><button class="reward-launch" data-reward="start" hidden>▶ はしらせる</button><button class="reward-launch" data-reward="replay" hidden>↻ もういちど！</button><button class="reward-secondary" data-reward="another" hidden>ほかも みる</button><button class="reward-secondary" data-reward="book" hidden>でんしゃ ずかん</button><button class="reward-secondary" data-reward="continue">おしまい →</button></div>`;
  document.body.append(dialog);
  const get=key=>dialog.querySelector(key),button=key=>get(`[data-reward="${key}"]`);
  let canvas=get('canvas');
  const status=get('.reward-status'),loading=get('.reward-loading'),fallback=get('.reward-fallback');
  const progress=get('.reward-progress i');
  let scene,closed=false,loadingScene=false,runSound=()=>{},fallbackTimer,loadTimer,loadVersion=0,wasPlaying=false;
  let fallbackElapsed=0,fallbackStarted=0;
  let phase='loading';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function labels(){
    const title=get('#reward-title');
    const parts=current.id==='shonan-shinjuku'?['しょうなん','しんじゅくらいん']:[current.name];
    title.innerHTML=parts.map(part=>`<span>${part}</span>`).join('');
    title.classList.toggle('reward-long-title',parts.length>1);
    get('.reward-model-name').textContent=rewardScenario(current.sceneId).name;
    dialog.dataset.scenario=current.sceneId;
    dialog.style.setProperty('--train-color',current.color);
    canvas.setAttribute('aria-label',`${current.name}が線路と風景の中を走る3Dアニメーション`);
    button('mute').textContent=sound?'♪ おと あり':'♪ おと なし';
    button('mute').setAttribute('aria-pressed',String(sound));
    get('.reward-fallback img').src=`./assets/trains/${quizImageFile(current.image)}`;
    get('.reward-fallback img').alt=`${current.name}のイラスト`;
  }
  function controls(next){
    phase=next;dialog.dataset.phase=next;dialog.classList.toggle('running',next==='running');dialog.classList.toggle('arrived',next==='arrived');
    for(const key of ['replay','another','book'])button(key).hidden=next!=='arrived';
    button('start').hidden=true;
  }
  function finish(){
    if(closed)return;runSound();runSound=()=>{};clearTimeout(fallbackTimer);controls('arrived');
    progress.style.transform='scaleX(1)';status.textContent='かっこよかったね！';
  }
  function run(){
    if(closed||loadingScene)return;
    if(document.hidden){wasPlaying=true;controls('waiting');return;}
    clearTimeout(fallbackTimer);runSound();stopVoice();controls('running');progress.style.transform='scaleX(0)';
    status.textContent='でんしゃが はしるよ！';
    if(sound)speak?.(current.name);
    runSound=passSound(sound,7,current.sceneId);
    if(scene)scene.play();else startFallback(0);
  }
  function startFallback(from){
    fallbackElapsed=from;fallbackStarted=Date.now();
    fallbackTimer=setTimeout(finish,Math.max(0,REWARD_DURATION-from));
  }
  function useFallback(){
    if(closed)return;
    clearTimeout(loadTimer);scene?.dispose();scene=null;canvas.hidden=true;fallback.hidden=false;loading.hidden=true;
    dialog.dataset.renderer='illustration';
    loadingScene=false;run();
  }
  async function prepare(){
    const version=++loadVersion;loadingScene=true;controls('loading');scene?.dispose();scene=null;
    if(version>1){const next=document.createElement('canvas');next.className='reward-canvas';canvas.replaceWith(next);canvas=next;}
    labels();
    loading.hidden=false;fallback.hidden=true;canvas.hidden=false;progress.style.transform='scaleX(0)';
    clearTimeout(loadTimer);loadTimer=setTimeout(()=>{if(!closed&&version===loadVersion){loadVersion++;useFallback();}},12000);
    try{
      const module=await loadScene();if(closed||version!==loadVersion)return;
      if(module.prepareReward3D)await module.prepareReward3D(current);if(closed||version!==loadVersion)return;
      scene=module.createReward3D(canvas,current,{
        reduced,onFrame:t=>{if(!closed)progress.style.transform=`scaleX(${t})`;},
        onComplete:finish,onError:useFallback,
      });
      if(closed||version!==loadVersion){scene.dispose();scene=null;return;}
      clearTimeout(loadTimer);dialog.dataset.renderer='webgl';loadingScene=false;loading.hidden=true;run();
    }catch{if(!closed&&version===loadVersion)useFallback();}
  }
  const close=(continueGame=true)=>{
    if(closed)return;closed=true;loadVersion++;clearTimeout(fallbackTimer);clearTimeout(loadTimer);runSound();stopVoice();scene?.dispose();
    document.removeEventListener('visibilitychange',visibility);dialog.close();dialog.remove();activeClose=null;
    if(continueGame)onDone?.();
  };
  function visibility(){
    if(closed)return;
    if(document.hidden){
      wasPlaying=phase==='running'||phase==='waiting';scene?.pause();runSound();stopVoice();clearTimeout(fallbackTimer);
      if(wasPlaying&&!scene)fallbackElapsed=Math.min(REWARD_DURATION,fallbackElapsed+Date.now()-fallbackStarted);
    }else if(wasPlaying){
      wasPlaying=false;if(phase==='waiting'){run();return;}if(scene)scene.resume();else startFallback(fallbackElapsed);
      runSound=passSound(sound,Math.max(.2,(REWARD_DURATION-(scene?scene.elapsed:fallbackElapsed))/1000),current.sceneId,(scene?scene.elapsed:fallbackElapsed)/1000);
    }
  }
  activeClose=close;labels();
  button('start').onclick=run;button('replay').onclick=run;
  button('another').onclick=()=>{
    if(loadingScene)return;runSound();stopVoice();Object.assign(current,chooseRewardExperience(current));onTrainChange?.(current);void prepare();
  };
  button('mute').onclick=()=>{
    sound=!sound;onSoundChange?.(sound);labels();runSound();stopVoice();
    if(sound&&phase==='running')runSound=passSound(true,scene?Math.max(.2,(REWARD_DURATION-scene.elapsed)/1000):7,current.sceneId,(scene?scene.elapsed:fallbackElapsed)/1000);
  };
  button('continue').onclick=()=>close();button('book').onclick=()=>{close(false);onBook?.(current);};
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  document.addEventListener('visibilitychange',visibility);dialog.showModal();
  void prepare();return current;
}
