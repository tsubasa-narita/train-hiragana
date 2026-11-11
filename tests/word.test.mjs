import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { newWordJourney, wordTrains, wordAnswer, advanceWord, readWordPreferences, distinguishableWords } from '../src/word-engine.js';
import { wordMarkup, mountWord } from '../src/word.js';
import { trainFacts } from '../src/train-facts.js';
import { WORD_EXTRA_TRAINS } from '../src/word-extra-trains.js';

test('each word length has two distinct whole-name choices and five varied, unstamped-first questions', () => {
  for (const length of [2,3,4]) {
    const pool = wordTrains(length);
    const fresh = pool.at(-1);
    const state = newWordJourney({ length, stamps: pool.filter(t => t.id !== fresh.id).map(t => t.id) });
    assert.equal(state.cards[0].id, fresh.id);
    assert.equal(state.cards.length, 5);
    assert.equal(new Set(state.cards.map(t => t.id)).size, 5);
    for (const card of state.cards) {
      assert.equal(new Set(card.options).size, 2);
      assert.ok(card.options.includes(card.name));
      assert.ok(card.options.every(name => [...name].length === length));
      const sameInitial = pool.filter(item => item.name[0] === card.name[0] && distinguishableWords(card, item));
      if (sameInitial.length) assert.ok(card.options.every(name => name[0] === card.name[0]), 'look beyond the initial where possible');
      assert.ok(!/[ぁぃぅぇぉっゃゅょゎ]/.test(card.name));
      assert.ok(existsSync(`assets/trains/${card.image}`));
    }
  }
});
test('a wrong or duplicate answer never completes a question or skips a station', () => {
  const state = newWordJourney(), card = state.cards[0];
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
  state.station = 4; state.phase = 'ready';
  assert.equal(advanceWord(state), false);
});
test('identical-looking services cannot become competing answers to one train picture', () => {
  for (const names of [['あそ','ゆふ'],['あずさ','かいじ'],['ひたち','ときわ'],['さくら','みずほ'],['のぞみ','ひかり'],['かがやき','たにがわ']]) {
    assert.equal(distinguishableWords({name:names[0]}, {name:names[1]}),false);
  }
  for (const length of [2,3,4]) for (let i = 0; i < 100; i++) {
    for (const card of newWordJourney({length}).cards) {
      const other = card.options.find(name => name !== card.name);
      assert.ok(distinguishableWords(card,{name:other}));
    }
  }
});
test('word preferences validate storage and do not automatically raise the reading length', () => {
  assert.deepEqual(readWordPreferences(), {length:2,auto:true});
  assert.deepEqual(readWordPreferences({getItem:()=>'{broken'}), {length:2,auto:true});
  assert.deepEqual(readWordPreferences({getItem:()=>'{"length":99,"auto":false}'}), {length:2,auto:false});
  assert.deepEqual(readWordPreferences({getItem:()=>'{"length":4}'}), {length:4,auto:true});
});
test('the question has no model name and only reveals segmented reading on explicit help', () => {
  const state = newWordJourney({length:3});
  const html = wordMarkup(state, {auto:true}, true);
  assert.ok(!html.includes('class="word-hint"'));
  assert.ok(!html.includes(`${state.cards[0].name}のイラスト`));
  assert.equal((html.match(/data-word="answer"/g) || []).length, 2);
  state.helped = true;
  assert.ok(wordMarkup(state, {auto:true}, true).includes('おてつだい：この なまえ'));
});
test('entering the word question stays silent and disposed hint callbacks cannot mutate it', async () => {
  const state = newWordJourney();
  let listener, resolveVoice, spoken = [], changes = 0;
  const root = { addEventListener: (_, fn) => { listener = fn; }, removeEventListener() {}, querySelectorAll: () => [] };
  const callbacks = { sound:true, isCurrent:()=>true, speak:text=>{spoken.push(text); return new Promise(resolve=>{resolveVoice=resolve;});}, change:()=>changes++, stop(){}, auto:true };
  const dispose = mountWord(root,state,callbacks);
  assert.deepEqual(spoken, []);
  dispose();
  state.helped = true; state.phase = 'hint';
  const stop = mountWord(root,state,callbacks);
  assert.equal(spoken.length, 1);
  stop(); resolveVoice(true);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(changes, 0);
  assert.equal(state.phase, 'hint');
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
