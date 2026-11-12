import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseRewardExperience,resolveRewardExperience,REWARD_SCENARIOS} from '../src/reward3d-scenarios.js';
import {createTrainModel} from '../src/reward3d-trains.js';
import {bendTrainModel} from '../src/reward3d-curve.js';
import * as THREE from '../vendor/three/three.module.js';

test('all twelve combinations appear once per bag and survive a reload',async()=>{
  const original=globalThis.localStorage;let stored=null;
  globalThis.localStorage={getItem:()=>stored,setItem:(_,v)=>{stored=v;}};
  try{
    const seen=new Set();let previous;
    for(let i=0;i<12;i++){
      // Different module instance simulates a fresh page with persisted storage.
      const module=await import(`../src/reward3d-scenarios.js?reload=${i}`);
      const choice=module.chooseRewardExperience(previous,()=>.42);
      const key=`${choice.sceneId}:${choice.id}`;
      assert.ok(!seen.has(key));seen.add(key);previous=choice;
    }
    assert.equal(seen.size,12);
    const next=chooseRewardExperience(previous,()=>0);
    assert.notEqual(next.id,previous.id);assert.notEqual(next.sceneId,previous.sceneId);
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});
test('replay retains exact approved scene and train; old history remains valid',()=>{
  for(const s of REWARD_SCENARIOS){const reward=resolveRewardExperience({id:'yokosuka',sceneId:s.id});assert.equal(reward.sceneId,s.id);assert.equal(reward.id,'yokosuka');}
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
test('Another changes a restored pair even when it was the last unconsumed pair',async()=>{
  const original=globalThis.localStorage;let saved=JSON.stringify({bag:['night:yokosuka'],last:'depot:saikyo'});
  globalThis.localStorage={getItem:()=>saved,setItem:(_,v)=>{saved=v;}};
  try{
    const module=await import('../src/reward3d-scenarios.js?restored');
    const next=module.chooseRewardExperience({id:'yokosuka',sceneId:'night'},()=>0);
    assert.notEqual(`${next.sceneId}:${next.id}`,'night:yokosuka');
    let previous=next;
    for(let cycle=0;cycle<2;cycle++){
      const seen=new Set([`${previous.sceneId}:${previous.id}`]);
      for(let i=1;i<12;i++){previous=module.chooseRewardExperience(previous,()=>.35);seen.add(`${previous.sceneId}:${previous.id}`);}
      assert.equal(seen.size,12);previous=module.chooseRewardExperience(previous,()=>.35);
    }
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});
test('curved consist retains car spacing and independently spinning local wheels',()=>{
  const train=createTrainModel('yokosuka');const wheel=train.wheels[train.wheels.length-1];
  const oldX=wheel.position.x;
  bendTrainModel(train,600);train.group.updateMatrixWorld(true);
  const point=wheel.getWorldPosition(new THREE.Vector3());
  assert.ok(Math.abs(point.x-600*Math.sin(oldX/600))<.2);
  assert.ok(point.z>20);assert.notEqual(wheel.parent,train.group);
  wheel.rotation.z=10;train.group.updateMatrixWorld(true);
  assert.ok(wheel.getWorldPosition(new THREE.Vector3()).distanceTo(point)<1e-8);
  train.dispose();
});
