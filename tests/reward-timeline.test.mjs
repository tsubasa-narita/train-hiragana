import test from 'node:test';
import assert from 'node:assert/strict';
import {REWARD_DURATION,rewardMoment,chapterText} from '../src/reward-timeline.js';

test('ten-second story and visual cues share exact chapter boundaries',()=>{
  assert.equal(REWARD_DURATION,10000);
  for(const [ms,chapter] of [[0,'anticipation'],[1099,'anticipation'],[1100,'launch'],[3199,'launch'],[3200,'spectacle'],[7799,'spectacle'],[7800,'finale'],[10000,'finale']]){
    assert.equal(rewardMoment(ms).chapter,chapter);
    assert.ok(chapterText(chapter,'skybridge'));
  }
  assert.equal(rewardMoment(-1).seconds,0);assert.equal(rewardMoment(20000).seconds,10);
  assert.equal(rewardMoment(0).headlights,0);assert.equal(rewardMoment(1000).headlights,1);
  assert.equal(rewardMoment(2500).reveal,0);assert.equal(rewardMoment(5000).reveal,1);
});

test('the train waits for its lights, accelerates without a speed jump and keeps the same speed when cameras change',()=>{
  for(const shinkansen of [false,true]){
    const top=shinkansen?30:24;
    assert.equal(rewardMoment(1100,shinkansen).distance,0);
    assert.equal(rewardMoment(1100,shinkansen).speed,0);
    let previous=rewardMoment(0,shinkansen);
    for(let ms=10;ms<=10000;ms+=10){
      const next=rewardMoment(ms,shinkansen);
      assert.ok(next.distance>=previous.distance);assert.ok(next.speed>=previous.speed);
      assert.ok(Math.abs((next.distance-previous.distance)/.01-(next.speed+previous.speed)/2)<.001);
      previous=next;
    }
    assert.ok(Math.abs(rewardMoment(4600,shinkansen).speed-top)<1e-8);
    assert.equal(rewardMoment(10000,shinkansen).speed,top);
    assert.ok(Math.abs(rewardMoment(4600.01,shinkansen).distance-rewardMoment(4599.99,shinkansen).distance)<.001);
    assert.deepEqual(rewardMoment(5300,shinkansen),rewardMoment(5300,shinkansen),'seeking uses no wall clock or randomness');
  }
});
