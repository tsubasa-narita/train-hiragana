import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { TRAINS, QUIZ_CARDS, targetIndices } from '../src/data.js';
import { trainFacts } from '../src/train-facts.js';

test('the 15 new trains have unique quiz images and two sourced route descriptions', () => {
  const added = TRAINS.filter(train => /^n15-(mendel|herschel|einstein)-/.test(train.id));
  assert.equal(added.length, 15);
  assert.equal(new Set(added.map(train => train.name)).size, 15);
  assert.equal(new Set(added.map(train => train.image)).size, 15);
  for (const train of added) {
    assert.ok(existsSync(`assets/trains/${train.image}`), train.id);
    assert.ok(QUIZ_CARDS.some(card => card.id === train.id), train.id);
    assert.ok(targetIndices(train, []).includes(0), train.id);
    const facts = trainFacts(train);
    assert.equal(facts.length, 2, train.id);
    assert.ok(facts.every(fact => fact.text && fact.places.length && fact.source.startsWith('https://')), train.id);
    assert.notEqual(facts[0].text, facts[1].text, train.id);
  }
});
