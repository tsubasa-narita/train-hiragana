import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAINS, QUIZ_CARDS, ROWS, readProgress, makeChoices } from '../src/data.js';
import { trainFacts, trainFactText, trainFactSources, pickTrainFact } from '../src/train-facts.js';

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
    const entries = trainFacts(card);
    assert.ok(entries.length >= 2,card.id);
    assert.equal(new Set(entries.map(f=>f.text)).size,entries.length,card.id);
    for (const entry of entries) {
      assert.match(entry.source,/^https:\/\//);
      assert.ok(entry.text.endsWith('。'));
      assert.ok(!/ながい おはな|おびの|まあるい|ぴかぴか|いろの からだ/.test(entry.text));
    }
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


test('a train rotates between its researched facts across storage and never changes during replay', () => {
  const recent = {};
  for (const train of TRAINS) {
    const first = pickTrainFact(train,recent,()=>0);
    const restored = readProgress({getItem:()=>JSON.stringify({recentFacts:recent})}).recentFacts;
    const second = pickTrainFact(train,restored,()=>0);
    assert.notEqual(first.index,second.index,train.id);
    assert.notEqual(first.text,second.text,train.id);
    assert.equal(trainFactText(train,second.index),second.text);
  }
  const sanitized=readProgress({getItem:()=>JSON.stringify({recentFacts:{hayabusa:1,komachi:-1,unknown:0,nozomi:'0'}})});
  assert.deepEqual(sanitized.recentFacts,{hayabusa:1});
});
