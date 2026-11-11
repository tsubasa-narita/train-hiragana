import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAINS } from '../src/data.js';
import { REWARD_TRAINS, REWARD_BOOK_IDS, rewardBookId, rewardLetters, showTrainReward } from '../src/reward.js';

test('reward identities resolve only explicit valid book entries', () => {
  for (const [reward, book] of Object.entries(REWARD_BOOK_IDS)) {
    assert.ok(REWARD_TRAINS.some(train => train.id === reward));
    assert.ok(TRAINS.some(train => train.id === book));
    assert.equal(rewardBookId({ id: reward }, TRAINS), book);
  }
  assert.equal(rewardBookId({ id: 'shiokaze' }, TRAINS), null);
  assert.equal(rewardBookId({ id: 'hayabusa' }, []), null);
  assert.equal(rewardBookId({ id: 'toString' }, TRAINS), null);
});

test('the reward reviews the actual target letters in order, including repeated letters', () => {
  const card = { name: 'こまち', targets: [1], hole: 2, reviewLetter: 'を' };
  assert.deepEqual(rewardLetters('find', [card, { name: 'ひのとり', targets: [2] }, card]), ['ま', 'と', 'ま']);
  assert.deepEqual(rewardLetters('fill', [card]), ['ち']);
  assert.deepEqual(rewardLetters('trace', [card, { name: 'いぬ', focusLetter: 'ん' }]), ['を', 'ん']);
  assert.deepEqual(rewardLetters('connect', [card, { name: 'はやぶさ' }, { name: 'かがやき' }]), ['ち', 'さ', 'き']);
});

test('reward waits for departure, responds silently, arrives, replays and skips', async t => {
  const elements = new Map();
  const element = () => ({ hidden: false, textContent: '', focus() {} });
  for (const key of ['.reward-runner','.reward-status','.reward-fallback', ...['start','replay','book','touch','horn','continue'].map(x=>`[data-reward="${x}"]`)]) elements.set(key, element());
  const classes = new Set();
  const dialog = {
    dataset: {}, classList: { add: x=>classes.add(x), remove: (...xs)=>xs.forEach(x=>classes.delete(x)), contains:x=>classes.has(x) },
    setAttribute(){}, querySelector:key=>elements.get(key), querySelectorAll:()=>[], addEventListener(name,fn){this[name]=fn;},
    showModal(){}, close(){}, remove(){this.removed=true;},
  };
  globalThis.document = {createElement: name => name === 'dialog' ? dialog : element(), body:{append(){}}};
  globalThis.window = {matchMedia:()=>({matches:true})};
  globalThis.Image = class { decode(){return Promise.resolve();} };
  t.mock.timers.enable({apis:['setTimeout']});
  let done=0, book=0;
  showTrainReward({train:REWARD_TRAINS[0], sound:false, onDone:()=>done++, onBook:()=>book++});
  await Promise.resolve();
  t.mock.timers.tick(6000);
  assert.equal(classes.has('running'),false);
  elements.get('[data-reward="start"]').onclick();
  assert.ok(classes.has('running'));
  assert.equal(elements.get('[data-reward="horn"]').hidden,false);
  elements.get('[data-reward="horn"]').onclick();
  assert.match(elements.get('.reward-status').textContent,/ぽーっ/);
  t.mock.timers.tick(1200);
  assert.ok(classes.has('arrived'));
  assert.equal(elements.get('[data-reward="book"]').hidden,false);
  elements.get('[data-reward="replay"]').onclick();
  assert.ok(classes.has('running'));
  elements.get('[data-reward="continue"]').onclick();
  t.mock.timers.tick(6000);
  assert.equal(done,1); assert.equal(book,0); assert.equal(dialog.removed,true);
  t.mock.timers.reset();
});
