import { REWARD_3D_TRAINS } from './reward3d-catalog.js';

export const REWARD_SCENARIOS = Object.freeze([
  Object.freeze({id:'depot',name:'ひみつの しゃこから しゅっぱつ'}),
  Object.freeze({id:'night',name:'きらめく よるの すれちがい'}),
  Object.freeze({id:'skybridge',name:'くもの うえの にじの はし'}),
]);
const KEY='train-reward-cinema-bag-v2';
const pairs=REWARD_SCENARIOS.flatMap(s=>REWARD_3D_TRAINS.map(t=>`${s.id}:${t.id}`));
let memory,storageFailed=false;
function read(){if(storageFailed)return memory;try{return JSON.parse(globalThis.localStorage?.getItem(KEY))||memory;}catch{return memory;}}
function valid(pair){return pairs.includes(pair);}
function decode(pair){const [sceneId,id]=pair.split(':');return {...REWARD_3D_TRAINS.find(t=>t.id===id),sceneId};}
export function rewardScenario(id){return REWARD_SCENARIOS.find(s=>s.id===id)||REWARD_SCENARIOS[0];}

// Consume every scene/train pair before refilling, including across app launches.
// Prefer a different scene AND train, without starving the last pairs in the bag.
function selectRewardExperience(previous,random,preferred,consume){
  let saved=read();
  if(!saved||!Array.isArray(saved.bag)||saved.bag.some(p=>!valid(p))||new Set(saved.bag).size!==saved.bag.length)saved={bag:[],last:null};
  // A restored/history movie can be a pair still in the bag. It has now been
  // watched, so consume it too before choosing Another (including the last pair).
  let bag=[...saved.bag];
  if(previous)bag=bag.filter(p=>p!==`${previous.sceneId}:${previous.id}`);
  if(!bag.length)bag=[...pairs];
  const last=previous|| (valid(saved.last)?decode(saved.last):null);
  let candidates=bag.filter(p=>{const t=decode(p);return t.id!==last?.id&&t.sceneId!==last?.sceneId;});
  if(!candidates.length)candidates=bag.filter(p=>decode(p).id!==last?.id);
  if(!candidates.length)candidates=bag.filter(p=>p!==`${last?.sceneId}:${last?.id}`);
  if(!candidates.length)candidates=bag;
  const preferredPair=preferred?`${preferred.sceneId}:${preferred.id}`:null;
  const selected=candidates.includes(preferredPair)?preferredPair:candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))];
  if(!consume)return decode(selected);
  memory={bag:bag.filter(p=>p!==selected),last:selected};
  try{globalThis.localStorage?.setItem(KEY,JSON.stringify(memory));}catch{storageFailed=true;}
  return decode(selected);
}

// Previewing must not modify progress: the child may leave before the reward.
export function previewRewardExperience(previous,random=Math.random){return selectRewardExperience(previous,random,null,false);}
export function chooseRewardExperience(previous,random=Math.random,preferred){return selectRewardExperience(previous,random,preferred,true);}

export function resolveRewardExperience(requested){
  const train=REWARD_3D_TRAINS.find(t=>t.id===requested?.id);
  if(!train)return chooseRewardExperience();
  const scenario=REWARD_SCENARIOS.find(s=>s.id===requested.sceneId)||REWARD_SCENARIOS[Math.floor(Math.random()*REWARD_SCENARIOS.length)];
  return {...train,sceneId:scenario.id};
}
