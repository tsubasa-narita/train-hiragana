import test from 'node:test';
import assert from 'node:assert/strict';
import {createRewardPreloader} from '../src/reward-preload.js';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness({load}={}){
  const callbacks=new Map(),cancelled=[],claims=[],prepared=[];let previews=0,loads=0,next=0;
  const plan={id:'hayabusa',sceneId:'skybridge'};
  const preloader=createRewardPreloader({
    preview(){previews++;return plan;},claim(value){claims.push(value);return value||{id:'yokosuka',sceneId:'night'};},
    schedule(fn){const token=next++;callbacks.set(token,fn);return token;},cancel(token){cancelled.push(token);callbacks.delete(token);},
    load:async()=>{loads++;return load?load():{prepareReward3D:async value=>{prepared.push(value);return true;}};},
  });
  return {preloader,plan,callbacks,cancelled,claims,prepared,get previews(){return previews;},get loads(){return loads;},
    async idle(){for(const fn of callbacks.values())fn();callbacks.clear();await tick();},
  };
}

test('quiz preloading waits for idle time, loads only one reserved movie and does not award it',async()=>{
  const h=harness();assert.equal(h.preloader.warm(),h.plan);
  for(let i=0;i<10;i++)assert.equal(h.preloader.warm(),h.plan);
  assert.equal(h.previews,1);assert.equal(h.loads,0);assert.equal(h.callbacks.size,1);assert.equal(h.claims.length,0);
  await h.idle();assert.equal(h.loads,1);assert.deepEqual(h.prepared,[h.plan]);
  h.preloader.warm();await h.idle();assert.equal(h.loads,1);
  assert.equal(h.preloader.take(),h.plan);assert.deepEqual(h.claims,[h.plan]);
});

test('a reveal before idle cancels the pending callback, including timer ID zero',()=>{
  const h=harness();h.preloader.warm();assert.equal(h.preloader.take(),h.plan);
  assert.deepEqual(h.cancelled,[0]);assert.equal(h.callbacks.size,0);assert.equal(h.loads,0);
  h.preloader.warm();assert.equal(h.previews,2);
});

test('a direct reveal without a quiz still selects a reward normally',()=>{
  const h=harness();assert.equal(h.preloader.take().id,'yokosuka');assert.deepEqual(h.claims,[undefined]);
});

test('a rejected or failed preload can retry and never prevents the reward',async()=>{
  let attempts=0;
  const h=harness({load:()=>{if(++attempts===1)throw Error('offline');return {prepareReward3D:async()=>attempts>2};}});
  for(let i=0;i<3;i++){h.preloader.warm();await h.idle();}
  assert.equal(h.loads,3);assert.equal(h.previews,1);assert.equal(h.preloader.take(),h.plan);
});

test('taking a plan while its CPU preparation is running cannot overwrite a newer reservation',async()=>{
  let finish;const h=harness({load:()=>({prepareReward3D:()=>new Promise(resolve=>{finish=resolve;})})});
  h.preloader.warm();await h.idle();h.preloader.take();h.preloader.warm();
  finish(false);await tick();assert.equal(h.callbacks.size,1);
});

let serial=0;
async function scenarioHarness(t){
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),data=new Map();let writes=0;
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>data.get(key),setItem:(key,value)=>{writes++;data.set(key,value);}}});
  t.after(()=>{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;});
  const module=await import(`../src/reward3d-scenarios.js?preload-test=${++serial}`);
  return {module,data,get writes(){return writes;}};
}
test('previewing or abandoning quizzes never consumes the saved shuffle bag',async t=>{
  const h=await scenarioHarness(t),{previewRewardExperience,chooseRewardExperience}=h.module;
  const planned=previewRewardExperience(undefined,()=>0);assert.equal(h.writes,0);assert.equal(h.data.size,0);
  for(let i=0;i<8;i++)assert.deepEqual(previewRewardExperience(undefined,()=>0),planned);
  assert.equal(h.writes,0);
  assert.deepEqual(chooseRewardExperience(undefined,()=>.99,planned),planned);assert.equal(h.writes,1);
  assert.notDeepEqual(previewRewardExperience(undefined,()=>0),planned);
});

test('a concurrent reveal can invalidate a plan without replaying an already consumed pair',async t=>{
  const h=await scenarioHarness(t),{previewRewardExperience,chooseRewardExperience}=h.module;
  const planned=previewRewardExperience(undefined,()=>0);
  chooseRewardExperience(undefined,()=>0,planned);
  const actual=chooseRewardExperience(undefined,()=>0,planned);
  assert.notEqual(`${actual.id}:${actual.sceneId}`,`${planned.id}:${planned.sceneId}`);
});
