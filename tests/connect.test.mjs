import test from 'node:test';
import assert from 'node:assert/strict';
import { newConnect, connectLetter, connectChoices, readGarage } from '../src/connect-engine.js';
import { TRAINS } from '../src/data.js';

test('first Komachi builds three guided cars; other first trains need one letter', () => {
  const train = TRAINS.find(t => t.id === 'komachi');
  const first = newConnect(train, true);
  assert.equal(first.index, 0);
  for (const letter of train.name) {
    assert.deepEqual(connectChoices(train, first), [letter]);
    assert.equal(connectLetter(train, first, letter), true);
  }
  const other = TRAINS.find(t => t.id === 'hayabusa');
  assert.equal(newConnect(other, true).index, [...other.name].length - 1);
  assert.equal(first.phase, 'ready');
  assert.equal(connectLetter(train, first, 'ち'), false);
  const next = newConnect(train);
  assert.equal(connectLetter(train, next, 'ま'), false);
  assert.equal(next.index, 0);
  assert.equal(next.help, 1);
  assert.equal(connectLetter(train, next, 'ち'), false);
  assert.deepEqual(connectChoices(train, next), ['こ']);
  for (const letter of train.name) assert.equal(connectLetter(train, next, letter), true);
  assert.equal(next.phase, 'ready');
});

test('every train including long names and repeated letters can be completed', () => {
  for (const train of TRAINS) {
    const state = newConnect(train);
    for (const letter of train.name) {
      const choices = connectChoices(train, state);
      assert.ok(choices.includes(letter), train.name);
      assert.equal(new Set(choices).size, choices.length);
      assert.ok(choices.length <= 3);
      assert.ok(connectLetter(train, state, letter));
    }
    assert.equal(state.phase, 'ready');
    assert.deepEqual(JSON.parse(JSON.stringify(state)), state);
  }
});

test('garage tolerates unavailable or damaged storage and removes invalid duplicates', () => {
  assert.deepEqual(readGarage(null, TRAINS), []);
  assert.deepEqual(readGarage({ getItem() { throw Error(); } }, TRAINS), []);
  assert.deepEqual(readGarage({ getItem: () => '{' }, TRAINS), []);
  assert.deepEqual(readGarage({ getItem: () => '{"id":"komachi"}' }, TRAINS), []);
  assert.deepEqual(readGarage({ getItem: () => '["komachi","komachi","unknown",4]' }, TRAINS), ['komachi']);
});
