import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseRewardExperience,resolveRewardExperience,REWARD_SCENARIOS} from '../src/reward3d-scenarios.js';
import {createTrainModel} from '../src/reward3d-trains.js';
import {REWARD_3D_TRAINS} from '../src/reward3d-catalog.js';
import {bendTrainModel} from '../src/reward3d-curve.js';
import {createAquariumWorld,createDioramaWorld} from '../src/reward3d-dream.js';
import {createPlayroomWorld} from '../src/reward3d-playroom.js';
import * as THREE from '../vendor/three/three.module.js';

const allPairs=REWARD_SCENARIOS.flatMap(scene=>REWARD_3D_TRAINS.map(train=>`${scene.id}:${train.id}`));

test('both new worlds match explicit and legacy track gauges',()=>{
  for(const createWorld of [createAquariumWorld,createDioramaWorld]){
    for(const [config,gauge] of [[{},1.067],[{gauge:1.435},1.435]]){
      const scene=new THREE.Scene(),world=createWorld(scene,{config,reduced:true});
      try{
        const rails=scene.getObjectByName('track-rail-sections'),matrix=new THREE.Matrix4();
        rails.getMatrixAt(0,matrix);assert.ok(Math.abs(matrix.elements[14]+gauge/2)<1e-6);
        rails.getMatrixAt(3,matrix);assert.ok(Math.abs(matrix.elements[14]-gauge/2)<1e-6);
      }finally{world.dispose();}
      assert.equal(scene.children.length,0);
    }
  }
});

test('all 120 combinations appear once per bag and survive a reload',async()=>{
  assert.equal(allPairs.length,120);
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

test('a legacy four-train bag migrates to a complete current cycle',async()=>{
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

test('expansion adds every new pairing to an in-progress bag without replaying consumed movies',async()=>{
  const original=globalThis.localStorage;
  const remaining='night:yokosuka';
  const storage=new Map([['train-reward-cinema-bag-v2',JSON.stringify({bag:[remaining],last:'depot:hayabusa'})]]);
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
  try{
    const {previewRewardExperience,chooseRewardExperience}=await import('../src/reward3d-scenarios.js?seasonal-expansion');
    const next=previewRewardExperience(undefined,()=>.6);
    assert.equal(storage.size,1,'preview leaves existing storage untouched');
    const claimed=chooseRewardExperience(undefined,()=>0,next);
    assert.deepEqual(claimed,next);
    const saved=JSON.parse(storage.get('train-reward-cinema-bag-v6'));
    const universe=[saved.last,...saved.bag];
    assert.equal(universe.length,100);
    assert.equal(new Set(universe).size,100);
    assert.ok(universe.includes(remaining));
    assert.ok(!universe.includes('depot:hayabusa'));
    assert.ok(universe.includes('snow:laview')&&universe.includes('sakura:yamanote')&&universe.includes('depot:hinotori'));
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});
test('the previous release queues the four additions without replaying consumed scenes',async()=>{
  const original=globalThis.localStorage;
  const remaining='night:yokosuka';
  const oldKey='train-reward-cinema-bag-v3';
  const storage=new Map([[oldKey,JSON.stringify({bag:[remaining],last:'depot:hayabusa'})]]);
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
  try{
    const {chooseRewardExperience}=await import('../src/reward3d-scenarios.js?dream-expansion');
    chooseRewardExperience(undefined,()=>.6);
    const saved=JSON.parse(storage.get('train-reward-cinema-bag-v6'));
    const universe=[saved.last,...saved.bag];
    assert.equal(universe.length,71);
    assert.ok(universe.includes(remaining));
    assert.ok(universe.includes('aquarium:rapit')&&universe.includes('diorama:hayabusa')&&universe.includes('depot:doctor-yellow'));
    assert.ok(!universe.includes('depot:hayabusa'));
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});
test('new toy courses are added to an active bag with its current progress intact',async()=>{
  const original=globalThis.localStorage;
  const oldKey='train-reward-cinema-bag-v5',remaining='playroom:rapit',last='depot:hayabusa';
  const storage=new Map([[oldKey,JSON.stringify({bag:[remaining],last})]]);
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
  try{
    const {chooseRewardExperience}=await import('../src/reward3d-scenarios.js?playroom-expansion');
    chooseRewardExperience(undefined,()=>.5);
    const saved=JSON.parse(storage.get('train-reward-cinema-bag-v6'));
    const universe=[saved.last,...saved.bag];
    assert.deepEqual(new Set(universe),new Set([remaining,...allPairs.filter(pair=>pair.startsWith('toy-'))]));
  }finally{if(original===undefined)delete globalThis.localStorage;else globalThis.localStorage=original;}
});
test('plastic rails meet the same wheel height and gauge as each train',()=>{
  for(const sceneId of ['playroom','toy-park','toy-space'])for(const gauge of [1.067,1.435]){
    const scene=new THREE.Scene(),world=createPlayroomWorld(scene,{config:{gauge,sceneId},reduced:true});
    try{
      const rails=scene.getObjectByName('playroom-railheads'),matrix=new THREE.Matrix4(),point=new THREE.Vector3(0,.5,0);
      rails.getMatrixAt(0,matrix);point.applyMatrix4(matrix);
      assert.ok(Math.abs(point.y-.15)<1e-6);
      assert.ok(Math.abs(point.z+gauge/2)<1e-6);
      rails.getMatrixAt(2,matrix);
      assert.ok(Math.abs(matrix.elements[14]-gauge/2)<1e-6);
    }finally{world.dispose();}
    assert.equal(scene.children.length,0);
  }
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
