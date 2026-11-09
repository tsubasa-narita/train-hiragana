import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAINS, QUIZ_CARDS, pickQuizCard, makeJourney, readProgress } from '../src/data.js';
import { newTrace } from '../src/trace.js';
import { newFillJourney } from '../src/fill-engine.js';
import { nextConnectTrain } from '../src/connect-engine.js';
import { CONNECT_MODELS } from '../src/connect-assets.js';

test('image selection prioritizes unstamped IDs including variants, and preserves the rest of the deck', () => {
  const cards = [{id:'a', image:'a'}, {id:'a', quizId:'alternate', image:'a2'}, {id:'b', image:'b'}];
  const decks = {あ:['a:a', 'alternate:a2', 'b:b']};
  assert.equal(pickQuizCard(cards, 'あ', {}, decks, ['a']).id, 'b');
  assert.deepEqual(decks.あ, ['a:a', 'alternate:a2']);
  assert.equal(pickQuizCard(cards, 'あ', {}, decks, ['a','b']).id, 'a');
  const restored = {あ:['a:a']};
  assert.equal(pickQuizCard(cards, 'あ', {}, restored, ['a']).id, 'b');
  assert.deepEqual(restored.あ, ['a:a']);
});

test('find and trace use saved stamps while retaining explicit selection and letter constraints', () => {
  const pool = QUIZ_CARDS.filter(t => t.name.startsWith('あ'));
  const target = pool.at(-1).id;
  const stamps = readProgress({getItem: () => JSON.stringify({stamps: TRAINS.filter(t => t.id !== target).map(t => t.id)})}).stamps;
  assert.equal(makeJourney(undefined, ['あ'], 'find', 0, {}, {}, stamps)[0].id, target);
  assert.equal(newTrace(['あ'], 'あ', {}, {}, stamps).card.id, target);
  const preferred = pool.find(t => t.id !== target && !t.kind);
  assert.equal(makeJourney(preferred.id, ['あ'], 'find', 0, {}, {}, stamps)[0].id, preferred.id);
});

test('fill prioritizes unplayed trains but respects a manually chosen train', () => {
  const target = TRAINS.at(-1), preferred = TRAINS[0];
  const stamps = TRAINS.filter(t => t.id !== target.id).map(t => t.id);
  assert.equal(newFillJourney({stamps}).cards[0].id, target.id);
  assert.equal(newFillJourney({stamps, preferredId:preferred.id}).cards[0].id, preferred.id);
  assert.equal(newFillJourney({stamps: TRAINS.map(t => t.id)}).cards.length, 5);
});

test('connect prioritizes unplayed eligible trains, then garage and journey history', () => {
  const candidates = TRAINS.filter(t => CONNECT_MODELS[t.id]);
  const [a,b,c] = candidates;
  const stamps = TRAINS.filter(t => t.id !== b.id).map(t => t.id);
  assert.equal(nextConnectTrain(TRAINS, [a], [b.id], stamps).id, b.id);
  assert.notEqual(nextConnectTrain(TRAINS, [b], [b.id], stamps).id, b.id);
  assert.equal(nextConnectTrain([a,b,c], [a], [b.id], [a.id,b.id,c.id]).id, c.id);
});
