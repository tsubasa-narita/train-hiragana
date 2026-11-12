import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseRewardExperience,resolveRewardExperience,REWARD_SCENARIOS} from '../src/reward3d-scenarios.js';
import {createTrainModel} from '../src/reward3d-trains.js';
import {REWARD_3D_TRAINS} from '../src/reward3d-catalog.js';
import {bendTrainModel} from '../src/reward3d-curve.js';
import * as THREE from '../vendor/three/three.module.js';

const allPairs=REWARD_SCENARIOS.flatMap(scene=>REWARD_3D_TRAINS.map(train=>`${scene.id}:${train.id}`));

test('all twenty-one combinations appear once per bag and survive a reload',async()=>{
  assert.equal(allPairs.length,21);
  const original=globalThis.localStorage;let stored=null;
  globalThis.localStorage={getItem:()=>stored,setItem:(_,v)=>{stored=v;}};
  try{
    const seen=new Set();let previous;
    for(let i=0;i<allPairs.length;i++){
      // Different module instance simulates a fresh page with persisted storage.
      const module=await import(`../src/reward3d-scenarios.js?reload=${i}`);
      const choice=module.chooseRewardExperience(previous,()=>.42);
      const key=`${choice.sceneId}:${choice.id}`;
      assert.ok(!seen.has(key));seen.add(key);previous=choice;
    }
    assert.deepEqual([...seen].sort(),[...allPairs].sort());
    const next=chooseRewardExperience(previous,()=>0);
    assert.notEqual(next.id,previous.id);assert.notEqual(next.sceneId,previous.sceneId);
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});
test('history retains every approved scene and train; legacy history remains valid',()=>{
  for(const train of REWARD_3D_TRAINS)for(const s of REWARD_SCENARIOS){const reward=resolveRewardExperience({id:train.id,sceneId:s.id});assert.equal(reward.sceneId,s.id);assert.equal(reward.id,train.id);}
  const legacy=resolveRewardExperience({id:'saikyo'});
  assert.ok(REWARD_SCENARIOS.some(s=>s.id===legacy.sceneId));
});
test('a full storage quota cannot resurrect an already consumed pair',async()=>{
  const original=globalThis.localStorage;
  const stale=JSON.stringify({bag:['night:yokosuka','night:saikyo','depot:toyoko'],last:null});
  globalThis.localStorage={getItem:()=>stale,setItem(){throw Error('quota');}};
  try{
    const module=await import('../src/reward3d-scenarios.js?quota');const seen=new Set();
    for(let i=0;i<3;i++){const t=module.chooseRewardExperience(undefined,()=>0);seen.add(`${t.sceneId}:${t.id}`);}
    assert.equal(seen.size,3);
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});
test('a new trip consumes the previously restored pair before refilling the bag',async()=>{
  const original=globalThis.localStorage;let saved=JSON.stringify({bag:['night:yokosuka'],last:'depot:saikyo'});
  globalThis.localStorage={getItem:()=>saved,setItem:(_,v)=>{saved=v;}};
  try{
    const module=await import('../src/reward3d-scenarios.js?restored');
    const next=module.chooseRewardExperience({id:'yokosuka',sceneId:'night'},()=>0);
    assert.notEqual(`${next.sceneId}:${next.id}`,'night:yokosuka');
    let previous=next;
    for(let cycle=0;cycle<2;cycle++){
      const seen=new Set([`${previous.sceneId}:${previous.id}`]);
      for(let i=1;i<allPairs.length;i++){previous=module.chooseRewardExperience(previous,()=>.35);seen.add(`${previous.sceneId}:${previous.id}`);}
      assert.deepEqual([...seen].sort(),[...allPairs].sort());previous=module.chooseRewardExperience(previous,()=>.35);
    }
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});

test('a legacy four-train bag migrates to a complete seven-train cycle',async()=>{
  const original=globalThis.localStorage;
  const legacyIds=['yokosuka','shonan-shinjuku','saikyo','toyoko'];
  const legacyBag=REWARD_SCENARIOS.flatMap(s=>legacyIds.map(id=>`${s.id}:${id}`));
  const storage=new Map([['train-reward-cinema-bag-v1',JSON.stringify({bag:legacyBag,last:null})]]);
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
  try{
    const module=await import('../src/reward3d-scenarios.js?legacy-four-trains');
    const seen=new Set();let previous;
    for(let i=0;i<allPairs.length;i++){
      previous=module.chooseRewardExperience(previous,()=>.42);
      const pair=`${previous.sceneId}:${previous.id}`;
      assert.ok(!seen.has(pair),'migration must include new families before repeating any pair');seen.add(pair);
    }
    assert.deepEqual([...seen].sort(),[...allPairs].sort());
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});
for(const config of REWARD_3D_TRAINS)test(`${config.id}: curved consist retains its configured spacing and independently spinning wheels`,()=>{
  const train=createTrainModel(config),originals=train.wheels.map(w=>w.position.x);
  try{
    bendTrainModel(train,600);train.group.updateMatrixWorld(true);
    for(const [i,wheel] of train.wheels.entries()){
      const point=wheel.getWorldPosition(new THREE.Vector3()),oldX=originals[i];
      assert.ok(Math.abs(point.x-600*Math.sin(oldX/600))<.2);
      assert.ok(Math.abs(point.z-600*(1-Math.cos(oldX/600)))<.2);
      assert.notEqual(wheel.parent,train.group);
      wheel.rotation.z=10;train.group.updateMatrixWorld(true);
      assert.ok(wheel.getWorldPosition(new THREE.Vector3()).distanceTo(point)<1e-8);
    }
  }finally{train.dispose();}
});
