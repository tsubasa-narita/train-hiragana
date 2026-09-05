import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { TRAINS, BASIC_KANA, KANA_ROWS, makeChoices, makeJourney, readProgress } from '../src/data.js';
test('all train images exist and names use kana available in the alphabet', () => {
  assert.equal(new Set(TRAINS.map(t => t.id)).size, TRAINS.length);
  for (const t of TRAINS) {
    assert.ok(existsSync(`assets/trains/${t.image}`), t.image);
    for (const letter of t.name) assert.ok(KANA_ROWS.join('').includes(letter), letter);
  }
  assert.equal(BASIC_KANA.length, 46);
});
test('every kana including voiced letters has exactly one correct choice', () => {
  for (const train of TRAINS) for (const c of train.name) for (const count of [2,3]) {
    const choices = makeChoices(c, count);
    assert.equal(choices.length, count);
    assert.equal(new Set(choices).size, count);
    assert.equal(choices.filter(x => x === c).length, 1);
  }
});
test('journeys have five different trains and honor the chosen starting train', () => {
  for (const t of TRAINS) {
    const journey = makeJourney(t.id);
    assert.equal(journey.length, 5);
    assert.equal(journey[0].id, t.id);
    assert.equal(new Set(journey.map(x => x.id)).size, 5);
  }
  assert.equal(makeJourney('unknown').length, 5);
});
test('unavailable, malformed, or invalid storage cannot break the app', () => {
  assert.deepEqual(readProgress(null).stamps, []);
  assert.deepEqual(readProgress({getItem: () => '{broken'}).stamps, []);
  const result = readProgress({ getItem: () => JSON.stringify({ stamps: ['hayabusa','hayabusa','invalid'], trips: -3, level: 'invalid' }) });
  assert.deepEqual(result.stamps, ['hayabusa']);
  assert.equal(result.trips, 0);
  assert.equal(result.level, 'match');
  assert.equal(readProgress({getItem: () => 'null'}).sound, true);
});
