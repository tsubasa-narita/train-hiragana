import { stopVoice } from './voice.js';
import {REWARD_DURATION,rewardMoment,chapterText} from './reward-timeline.js';
import {unlockRewardAudio,playRewardSound} from './reward-audio.js';
export {REWARD_DURATION,unlockRewardAudio};
import { quizImageFile } from './quiz-images.js';
import { REWARD_3D_TRAINS } from './reward3d-catalog.js';
import {resolveRewardExperience,rewardScenario,previewRewardExperience,chooseRewardExperience} from './reward3d-scenarios.js';
import {createRewardPreloader} from './reward-preload.js';
const preloader=createRewardPreloader({preview:()=>previewRewardExperience(),claim:plan=>chooseRewardExperience(undefined,Math.random,plan)});
export function preloadTrainReward(){return preloader.warm();}

export const REWARD_TRAINS = REWARD_3D_TRAINS;
export const REWARD_BOOK_IDS = Object.freeze(Object.fromEntries(REWARD_TRAINS.map(train=>[train.id,train.bookId])));
export function rewardBookId(train,trains) {
  const id=Object.hasOwn(REWARD_BOOK_IDS,train?.id)?REWARD_BOOK_IDS[train.id]:null;
  return trains.some(item=>item.id===id)?id:null;
}
let activeClose,previousId;
export function chooseReward(excludeId=previousId) {
  const pool=REWARD_TRAINS.filter(train=>train.id!==excludeId);
  const train=pool[Math.floor(Math.random()*pool.length)];previousId=train.id;return train;
}
export function stopTrainReward(){activeClose?.(false);}
export function showTrainReward({ train:requested, sound=true, speak, onDone, onBook, onPlayed, onSoundChange,
  loadScene=()=>import('./reward3d.js') }={}){
  stopTrainReward();unlockRewardAudio(sound);
  const current=REWARD_TRAINS.some(train=>train.id===requested?.id)?resolveRewardExperience(requested):preloader.take();
  current.played=requested?.id===current.id&&requested?.played===true;
  const dialog=document.createElement('dialog');dialog.className='reward-dialog reward-cinema';
  dialog.setAttribute('aria-labelledby','reward-title');
  dialog.innerHTML=`<header class="reward-heading"><div><span class="reward-eyebrow">ごほうびの でんしゃ</span><h2 id="reward-title"></h2><small class="reward-model-name"></small></div><button class="reward-mute" data-reward="mute"></button></header>
    <div class="reward-scene"><canvas class="reward-canvas" aria-label="線路と風景の中を走る立体の電車"></canvas>
      <div class="reward-loading" role="status"><span class="reward-loading-ring"></span>でんしゃを よんでいるよ…</div>
      <div class="reward-fallback" hidden><img alt=""><small>この端末ではイラストで表示しています</small></div>
      <div class="reward-film-edge" aria-hidden="true"></div><div class="reward-progress" aria-hidden="true"><i></i></div>
    </div><p class="reward-status" role="status">でんしゃが やってくるよ</p>
    <div class="reward-controls"><button class="reward-secondary" data-reward="book" hidden>でんしゃ ずかん</button><button class="reward-secondary" data-reward="continue">おしまい →</button></div>`;
  document.body.append(dialog);
  const get=key=>dialog.querySelector(key),button=key=>get(`[data-reward="${key}"]`);
  let canvas=get('canvas');
  const status=get('.reward-status'),loading=get('.reward-loading'),fallback=get('.reward-fallback');
  const progress=get('.reward-progress i');
  let scene,closed=false,loadingScene=false,runSound=()=>{},fallbackTimer,loadTimer,loadVersion=0,wasPlaying=false;
  let fallbackElapsed=0,fallbackStarted=0;
  let phase='loading',chapter='',soundVersion=0;
  function soundAt(offset=0){return playRewardSound(sound,{duration:Math.max(.2,REWARD_DURATION/1000-offset),sceneId:current.sceneId,offset,shinkansen:current.family==='e5'||current.family==='e6'});}
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
    button('book').hidden=next!=='arrived';
  }
  function finish(){
    if(closed)return;runSound();runSound=()=>{};clearTimeout(fallbackTimer);controls('arrived');
    progress.style.transform='scaleX(1)';status.textContent='かっこよかったね！';
    if(!current.played){current.played=true;onPlayed?.(current);}
  }
  function run(){
    if(closed||loadingScene)return;
    if(current.played){scene?.seek?.(REWARD_DURATION);finish();return;}
    if(document.hidden){wasPlaying=true;controls('waiting');return;}
    clearTimeout(fallbackTimer);runSound();stopVoice();controls('running');progress.style.transform='scaleX(0)';
    chapter='';status.textContent=scene?chapterText('anticipation',current.sceneId):'ごほうびの でんしゃだよ！';
    if(sound)speak?.(current.name);
    runSound=soundAt();
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
        reduced,onFrame:t=>{
          if(closed)return;progress.style.transform=`scaleX(${t})`;
          const next=rewardMoment(t*REWARD_DURATION).chapter;
          if(phase==='running'&&next!==chapter){chapter=next;dialog.dataset.chapter=next;status.textContent=chapterText(next,current.sceneId);}
        },
        onComplete:finish,onError:useFallback,
      });
      if(closed||version!==loadVersion){scene?.dispose();scene=null;return;}
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
      runSound=soundAt((scene?scene.elapsed:fallbackElapsed)/1000);
    }
  }
  activeClose=close;labels();
  button('mute').onclick=async()=>{
    sound=!sound;onSoundChange?.(sound);labels();runSound();stopVoice();
    const version=++soundVersion;
    await unlockRewardAudio(sound);
    if(!closed&&!document.hidden&&sound&&phase==='running'&&version===soundVersion)
      runSound=soundAt((scene?scene.elapsed:Math.min(REWARD_DURATION,fallbackElapsed+Date.now()-fallbackStarted))/1000);
  };
  button('continue').onclick=()=>close();button('book').onclick=()=>{close(false);onBook?.(current);};
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  document.addEventListener('visibilitychange',visibility);dialog.showModal();
  void prepare();return current;
}
