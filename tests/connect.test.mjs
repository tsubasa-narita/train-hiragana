import test from 'node:test';
import assert from 'node:assert/strict';
import { newConnect, connectLetter, connectChoices, readGarage } from '../src/connect-engine.js';
import { TRAINS } from '../src/data.js';
import { CONNECT_MODELS, carriageRow, spriteStyle } from '../src/connect-assets.js';
import { statSync } from 'node:fs';

test('first supported train builds guided cars; other first trains need one letter', () => {
  const train = TRAINS.find(t => t.id === 'komachi');
  const first = newConnect(train, true);
  assert.equal(first.index, 0);
  for (const letter of train.name) {
    assert.deepEqual(connectChoices(train, first), [letter]);
    assert.equal(connectLetter(train, first, letter), true);
  }
  const other = TRAINS.find(t => t.id === 'nozomi');
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

test('all nineteen dedicated trains have full guided assembly and reusable middle cars', () => {
  assert.equal(Object.keys(CONNECT_MODELS).length, 19);
  for (const [id, model] of Object.entries(CONNECT_MODELS)) {
    const train = TRAINS.find(t => t.id === id), state = newConnect(train, true);
    assert.equal(state.index, 0);
    assert.ok(statSync(`assets/connect/${model.file}`).size > 1000);
    const letters = [...train.name];
    assert.equal(carriageRow(0, letters.length), 0);
    assert.equal(carriageRow(letters.length - 1, letters.length), 2);
    for (let i = 1; i < letters.length - 1; i++) assert.equal(carriageRow(i, letters.length), 1);
    model.bounds.forEach(([top, bottom], row) => {
      assert.ok(top >= 0 && bottom <= 1024 && bottom > top);
      assert.ok(spriteStyle(model, row).includes('background-position'));
    });
    for (const letter of letters) {
      assert.deepEqual(connectChoices(train, state), [letter]);
      assert.ok(connectLetter(train, state, letter));
    }
    assert.equal(state.phase, 'ready');
  }
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
