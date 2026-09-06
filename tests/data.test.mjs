import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { TRAINS, QUIZ_CARDS, BASIC_KANA, KANA_ROWS, ROWS, kanaRow, targetIndices, makeChoices, makeJourney, readProgress } from '../src/data.js';
import { REWARD_TRAINS, chooseReward } from '../src/reward.js';
test('reward images exist and random rewards never immediately repeat', () => {
  for (const t of REWARD_TRAINS) assert.ok(existsSync(`assets/rewards/${t.image}`), t.image);
  let previous;
  for (let i = 0; i < 100; i++) { const train = chooseReward(); assert.notEqual(train.id, previous); previous = train.id; }
});
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
test('journeys have five questions and honor the chosen starting train', () => {
  for (const t of TRAINS) {
    const journey = makeJourney(t.id);
    assert.equal(journey.length, 5);
    assert.equal(journey[0].id, t.id);
    assert.ok(journey.every(t => t.targets.length));
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
  assert.deepEqual(readProgress({getItem: () => JSON.stringify({rows:['あ','invalid','あ','わ']})}).rows, ['あ','わ']);
});
test('each row has a train starting in that row and filtered quizzes never leave selected rows', () => {
  for (const row of ROWS) {
    assert.ok(TRAINS.some(t => kanaRow(t.name[0]) === row.id), row.id);
    for (const mode of ['find','connect']) {
      const journey = makeJourney(undefined, [row.id], mode);
      assert.equal(journey.length, 5);
      for (const train of journey) {
        assert.ok(train.targets.length);
        for (const i of train.targets) {
          const c = train.name[i];
          assert.equal(kanaRow(c), row.id);
          const choices = makeChoices(c, 3, [row.id]);
          assert.equal(choices.length, 3);
          assert.equal(new Set(choices).size, 3);
          for (const choice of choices) assert.equal(kanaRow(choice), row.id);
        }
      }
      if (mode === 'find') {
        assert.deepEqual([...new Set(journey.map(t => t.name[t.targets[0]]))].sort(), [...row.letters].sort());
        for (const train of journey) {
          const c = train.name[train.targets[0]];
          if (QUIZ_CARDS.some(t => t.name.startsWith(c) && targetIndices(t).includes(0))) assert.equal(train.targets[0], 0);
        }
      }
    }
  }
  assert.equal(kanaRow('ぷ'), 'は');
  assert.equal(kanaRow('っ'), 'た');
  assert.equal(kanaRow('ー'), undefined);
  const train = TRAINS.find(t => t.id === 'komachi');
  assert.deepEqual(targetIndices(train, ['ま']), [1]);
});
test('all 46 basic hiragana have illustrated quiz cards', () => {
  for (const c of BASIC_KANA) assert.ok(QUIZ_CARDS.some(t => targetIndices(t).some(i => t.name[i] === c)), c);
  for (const card of QUIZ_CARDS) assert.ok(existsSync(`assets/trains/${card.image}`), card.image);
});
