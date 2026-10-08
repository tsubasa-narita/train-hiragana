import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { REWARD_TRAINS } from '../src/reward.js';
import { rewardModelMarkup, REWARD_MODEL_ASSETS } from '../src/reward-models.js';
import { rewardTrainMarkup } from '../src/reward-trains.js';

test('all rewards have a dedicated side-view model and matching drawn fallback', () => {
  assert.equal(Object.keys(REWARD_MODEL_ASSETS).length,36);
  for (const train of REWARD_TRAINS) {
    const model=REWARD_MODEL_ASSETS[train.id];
    assert.ok(model,train.id);
    assert.ok(existsSync(`assets/rewards/sideview/${model.file}`));
    const [left,top,right,bottom]=model.bounds;
    assert.ok(left>=0 && top>=0 && right<=model.width && bottom<=model.height && right>left && bottom>top);
    const markup=rewardModelMarkup(train);
    assert.ok(markup.includes(`data-train-design="${train.id}"`));
    assert.ok(!markup.includes('NaN') && !markup.includes('Infinity'));
    assert.ok(rewardTrainMarkup(train).includes('viewBox="0 0 1600 300"'));
  }
  assert.equal(rewardModelMarkup({id:'unknown'}),'');
});
