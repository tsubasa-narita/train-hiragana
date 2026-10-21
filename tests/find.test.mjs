import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAINS, QUIZ_CARDS, ROWS, readProgress, makeChoices } from '../src/data.js';
import { trainFactText, trainFactSources } from '../src/train-facts.js';

test('choice count is independent of the model, survives storage and migrates old preferences', () => {
  const read = value => readProgress({getItem:()=>JSON.stringify(value)});
  assert.equal(readProgress(null).findChoices,2);
  assert.equal(read({level:'match'}).findChoices,2);
  assert.equal(read({level:'listen'}).findChoices,3);
  for (const level of ['match','listen']) for (const findChoices of [2,3]) {
    assert.equal(read({level,findChoices}).findChoices,findChoices);
  }
  for (const invalid of [0,1,4,'3',null,{}]) assert.equal(read({findChoices:invalid}).findChoices,2);
  for (const row of ROWS) for (const letter of row.letters) for (const count of [2,3]) {
    const choices = makeChoices(letter,count,[row.id]);
    assert.equal(choices.length,count);
    assert.equal(new Set(choices).size,count);
    assert.equal(choices.filter(c=>c===letter).length,1);
  }
});

test('each train and scene has its pictured train fact instead of generic praise', () => {
  const facts = new Set();
  for (const card of QUIZ_CARDS) {
    const fact = trainFactText(card);
    assert.ok(fact.endsWith('。'),card.id);
    assert.ok(fact.length>5 && fact.length<110,card.id);
    assert.ok(!fact.includes('できたね'),card.id);
    assert.equal(fact,trainFactText(TRAINS.find(t=>t.id===card.id)));
    facts.add(fact);
  }
  assert.ok(facts.size>190);
  assert.match(trainFactText({id:'midosuji'}),/おおさか.*ちかてつ/);
  assert.ok(trainFactSources({id:'midosuji'})[0].includes('osakametro.co.jp'));
  assert.match(trainFactText({id:'numajiri'}),/むかし/);
  assert.match(trainFactText({id:'rumoi'}),/むかし/);
});
