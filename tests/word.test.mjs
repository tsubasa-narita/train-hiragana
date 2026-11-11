import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { newWordJourney, wordTrains, wordAnswer, advanceWord, readWordPreferences, wordOptions, restoreWordJourney } from '../src/word-engine.js';
import { wordMarkup, mountWord } from '../src/word.js';
import { trainFacts } from '../src/train-facts.js';
import { WORD_EXTRA_TRAINS } from '../src/word-extra-trains.js';

test('each word length supports three or four distinct names and five varied, unstamped-first questions', () => {
  for (const length of [2,3,4]) for (const choices of [3,4]) {
    const pool = wordTrains(length);
    const fresh = pool.at(-1);
    const state = newWordJourney({ length, choices, stamps: pool.filter(t => t.id !== fresh.id).map(t => t.id) });
    assert.equal(state.cards[0].id, fresh.id);
    assert.equal(state.cards.length, 5);
    assert.equal(new Set(state.cards.map(t => t.id)).size, 5);
    for (const card of state.cards) {
      assert.equal(new Set(card.options).size, choices);
      assert.ok(card.options.includes(card.name));
      assert.ok(card.options.every(name => [...name].length === length));
      const sameInitial = pool.filter(item => item.name[0] === card.name[0] && item.name !== card.name);
      assert.equal(card.options.filter(name => name[0] === card.name[0]).length, 1 + Math.min(choices - 1, sameInitial.length));
      assert.ok(!/[ぁぃぅぇぉっゃゅょゎ]/.test(card.name));
      assert.ok(existsSync(`assets/trains/${card.image}`));
    }
  }
});
test('a wrong or duplicate answer never completes a question or skips a station', () => {
  const state = newWordJourney(), card = state.cards[0];
  assert.equal(wordAnswer(state, card.name), false, 'listen before answering');
  state.phase = 'answer';
  assert.equal(wordAnswer(state, 'invalid'), false);
  assert.equal(wordAnswer(state, card.options.find(name => name !== card.name)), false);
  assert.equal(state.station, 0);
  assert.equal(state.phase, 'answer');
  assert.equal(advanceWord(state), false);
  assert.equal(wordAnswer(state, card.name), true);
  assert.equal(wordAnswer(state, card.name), false);
  assert.equal(advanceWord(state), false);
  state.phase = 'ready';
  assert.equal(advanceWord(state), true);
  assert.equal(state.credited, false);
  assert.equal(state.helped, false);
  assert.equal(state.station, 1);
  assert.equal(state.phase, 'intro', 'every next question begins with the spoken name');
  state.station = 4; state.phase = 'ready';
  assert.equal(advanceWord(state), false);
});
test('every eligible train has exactly one spoken-name answer in both choice counts', () => {
  for (const length of [2,3,4]) for (const train of wordTrains(length)) {
    for (const count of [3,4]) {
      const names = wordOptions(train, length, count);
      assert.equal(names.length, count);
      assert.equal(names.filter(name => name === train.name).length, 1);
      assert.equal(new Set(names).size, count);
    }
  }
});
test('word preferences validate storage and do not automatically raise the reading length', () => {
  assert.deepEqual(readWordPreferences(), {length:2,choices:3,auto:true});
  assert.deepEqual(readWordPreferences({getItem:()=>'{broken'}), {length:2,choices:3,auto:true});
  assert.deepEqual(readWordPreferences({getItem:()=>'{"length":99,"choices":2,"auto":false}'}), {length:2,choices:3,auto:false});
  assert.deepEqual(readWordPreferences({getItem:()=>'{"length":4,"choices":4}'}), {length:4,choices:4,auto:true});
});
test('the question hides its picture, starts with listening, and reveals the train only after success', () => {
  const state = newWordJourney({length:3});
  const html = wordMarkup(state, {auto:true}, true);
  assert.ok(!html.includes('class="word-hint"'));
  assert.ok(!html.includes(`${state.cards[0].name}のイラスト`));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('きこえた なまえは どれ？'));
  assert.equal((html.match(/data-word="answer"/g) || []).length, 3);
  state.helped = true;
  assert.ok(wordMarkup(state, {auto:true}, true).includes('おてつだい：この なまえ'));
  state.phase = 'celebrate';
  assert.ok(wordMarkup(state, {auto:true}, true).includes(`${state.cards[0].name}のイラスト`));
});
test('entering the word question speaks the full name and disposing cancels its completion', async () => {
  const state = newWordJourney();
  let listener, resolveVoice, spoken = [], changes = 0;
  const root = { addEventListener: (_, fn) => { listener = fn; }, removeEventListener() {}, querySelectorAll: () => [] };
  const callbacks = { sound:true, isCurrent:()=>true, speak:text=>{spoken.push(text); return new Promise(resolve=>{resolveVoice=resolve;});}, change:()=>changes++, stop(){}, auto:true };
  const dispose = mountWord(root,state,callbacks);
  assert.deepEqual(spoken, [state.cards[0].name]);
  dispose();
  resolveVoice(true);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(state.phase, 'intro');
  state.helped = true; state.phase = 'hint';
  const stop = mountWord(root,state,callbacks);
  assert.equal(spoken.length, 2);
  stop(); resolveVoice(true);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(changes, 0);
  assert.equal(state.phase, 'hint');
});
test('old two-choice history resumes as a spoken-name question while current journeys stay fixed', () => {
  const state = newWordJourney();
  delete state.version; state.phase = 'answer'; state.helped = true;
  for (const card of state.cards) card.options = [card.name, 'ひだ'];
  restoreWordJourney(state,4);
  assert.equal(state.phase, 'intro');
  assert.equal(state.helped, false);
  assert.ok(state.cards.every(card => new Set(card.options).size === 4));
  restoreWordJourney(state,3);
  assert.equal(state.choices,4, 'settings affect the next journey');
});
test('muting never silently skips the spoken prompt or enables answers', () => {
  const state = newWordJourney();
  const html = wordMarkup(state, {auto:true}, false);
  assert.ok(html.includes('data-word="sound"'));
  let spoken = false;
  const root = {addEventListener(){},removeEventListener(){},querySelectorAll:()=>[]};
  const dispose = mountWord(root,state,{sound:false,isCurrent:()=>true,speak:()=>{spoken=true;},auto:true});
  assert.equal(spoken,false);
  assert.equal(state.phase,'intro');
  assert.equal(wordAnswer(state,state.cards[0].name),false);
  dispose();
});
test('all additional short-name trains have separate images and two researched route facts', () => {
  const additions = wordTrains(2).filter(t => t.id.startsWith('word-'));
  assert.equal(additions.length, 4);
  assert.ok(wordTrains(2).length >= 6);
  assert.equal(new Set(additions.map(t => t.image)).size, 4);
  for (const train of additions) {
    assert.ok(existsSync(`assets/trains/${train.image}`));
    const facts = trainFacts(train);
    assert.equal(facts.length, 2);
    assert.ok(facts.every(fact => fact.places.length && fact.source.startsWith('https://')));
  }
  assert.equal(WORD_EXTRA_TRAINS.length, 4);
  for (const train of WORD_EXTRA_TRAINS) {
    assert.ok(wordTrains([...train.name].length).some(item => item.id === train.id));
    assert.ok(existsSync(`assets/trains/${train.image}`));
    assert.equal(trainFacts(train).length, 2);
  }
});
