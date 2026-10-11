import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAINS, BASIC_KANA, ROWS, kanaRow } from '../src/data.js';
import { fillIndices, fillOptions, newFillJourney, fillAnswer, advanceFill, readFillPreferences } from '../src/fill-engine.js';
import { fillMarkup, mountFill } from '../src/fill.js';
import { VOICE_FILES } from '../src/voice-manifest.js';
import { ANNOUNCEMENT_FILES } from '../src/announcement-manifest.js';
import { questionText, hintText, praiseText } from '../src/voice-lines.js';

test('every train, including long names, finishes after exactly one accepted answer', () => {
  for (const train of TRAINS) {
    const state = newFillJourney({preferredId: train.id});
    assert.equal(state.cards[0].id, train.id);
    assert.equal(state.cards.length, 5);
    assert.equal(new Set(state.cards.map(t => t.id)).size, 5);
    const card = state.cards[0], target = [...card.name][card.hole];
    state.phase = 'answer';
    assert.equal(fillAnswer(state, target), true);
    assert.equal(state.phase, 'celebrate');
    assert.equal(fillAnswer(state, target), false);
    assert.equal(state.station, 0);
    state.phase = 'ready';
    assert.equal(advanceFill(state), true);
    assert.equal(state.station, 1);
    assert.equal(state.phase, 'intro');
  }
});
test('holes respect selected rows and clean kana, with explicit extra-letter support', () => {
  for (const row of ROWS) {
    const state = newFillJourney({rows:[row.id]});
    for (const card of state.cards) {
      const target = [...card.name][card.hole];
      assert.ok(BASIC_KANA.includes(target));
      assert.equal(kanaRow(target), row.id);
    }
  }
  const sample = {name:'ぱぴぷぺぽゃゅょっー'};
  assert.deepEqual(fillIndices(sample), []);
  assert.equal(fillIndices(sample, [], true).length, 10);
  assert.equal(fillIndices(sample, ['は'], true).length, 5);
});
test('holes move beyond the initial and avoid the previous position', () => {
  const train = TRAINS.find(t => t.id === 'komachi');
  const positions = new Set();
  for (let i = 0; i < 20; i++) positions.add(newFillJourney({preferredId:train.id}).cards[0].hole);
  assert.ok(positions.size > 1);
  for (const index of [0,1,2]) assert.notEqual(newFillJourney({preferredId:train.id,recent:{[train.id]:index}}).cards[0].hole,index);
});
test('wrong answers preserve the question, offer help, and never count as completion', () => {
  const state = newFillJourney(), card = state.cards[0];
  const saved = structuredClone(card);
  assert.equal(fillAnswer(state, card.options[0]), false, 'intro does not accept input');
  state.phase = 'answer';
  assert.equal(fillAnswer(state, card.options.find(c => c !== [...card.name][card.hole])), false);
  assert.equal(state.phase, 'hint');
  assert.equal(state.helped, true);
  assert.equal(state.credited, false);
  assert.deepEqual(state.cards[0], saved);
  assert.equal(advanceFill(state), false);
});
test('choices are distinct, exact kana, and avoid known confusing shape pairs', () => {
  for (const c of BASIC_KANA) {
    const options = fillOptions(c);
    assert.equal(options.length, 2);
    assert.equal(new Set(options).size, 2);
    assert.ok(options.includes(c));
    assert.deepEqual(fillOptions(c,'guided'), [c]);
  }
  for (let i = 0; i < 30; i++) {
    assert.ok(!fillOptions('は').includes('ほ'));
    assert.ok(!fillOptions('ぬ').includes('め'));
    assert.ok(!fillOptions('ば').includes('は'));
  }
});
test('support preferences survive storage, and invalid values are ignored', () => {
  const value = {level:'guided', extras:true, auto:false, recent:{komachi:1,bad:3,hayabusa:-1},completed:['trip']};
  assert.deepEqual(readFillPreferences({getItem:()=>JSON.stringify(value)}), {...value,recent:{komachi:1}});
  assert.equal(readFillPreferences(null).level, 'match');
  assert.equal(readFillPreferences({getItem:()=>'{'}).auto, true);
  assert.equal(readFillPreferences({getItem:()=>'{"level":"bad"}'}).level, 'match');
});
test('one gap and large focus remain present in long-name markup without requiring a scroll track', () => {
  const state = newFillJourney({preferredId:TRAINS.reduce((a,b)=>a.name.length>b.name.length?a:b).id});
  state.phase = 'answer';
  const html = fillMarkup(state, {auto:true}, []);
  assert.equal((html.match(/class="fill-name-hole /g)||[]).length, 1);
  assert.equal((html.match(/data-fill="answer"/g)||[]).length, 2);
  assert.ok(html.includes('class="fill-focus"'));
  assert.ok(!html.includes('connect-track'));
  assert.deepEqual(JSON.parse(JSON.stringify(state)),state);
});
test('all new-mode narration reuses the published announcer recordings', () => {
  for (const train of TRAINS) for (const index of fillIndices(train, [], true)) {
    const c = [...train.name][index];
    for (const text of [questionText(train,c),hintText(c),praiseText(train),c==='ー'?'のばす おと':c]) {
      assert.ok(VOICE_FILES[text], text);
      assert.ok(ANNOUNCEMENT_FILES[text], text);
    }
  }
});
test('disposing the view cancels an old narration result before it can change a new screen', async () => {
  const state = newFillJourney();
  let finish, changes = 0;
  const root = {addEventListener(){},removeEventListener(){}};
  const dispose = mountFill(root,state,{sound:true,isCurrent:()=>true,sequence:()=>new Promise(resolve=>{finish=resolve}),change:()=>changes++,stop(){}});
  dispose(); finish(true);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(changes,0);
  assert.equal(state.phase,'intro');
});
test('listen mode supplies a visible answer when sound is off', () => {
  const state = newFillJourney({level:'listen'});
  state.phase = 'answer';
  const target = [...state.cards[0].name][state.cards[0].hole];
  const html = fillMarkup(state,{auto:true},[],false,false);
  assert.ok(html.includes(`class="fill-seat  ">${target}</div>`));
  assert.ok(html.includes('おなじ もじを のせよう'));
});
test('rapid repeated taps award only one completion and never advance a question', () => {
  const state = newFillJourney(); state.phase = 'answer';
  let click, credits = 0;
  const root = {addEventListener(type, handler){if(type==='click')click=handler;},removeEventListener(){}};
  const dispose = mountFill(root,state,{isCurrent:()=>true,credit:()=>credits++,change(){}});
  const target = [...state.cards[0].name][state.cards[0].hole];
  const event = {target:{closest:()=>({disabled:false,dataset:{fill:'answer',letter:target}})}};
  for(let i=0;i<10;i++) click(event);
  assert.equal(credits,1);
  assert.equal(state.station,0);
  dispose();
});
test('history movement cancels narration callbacks even before the old DOM is disposed', async () => {
  const state = newFillJourney(); state.phase = 'celebrate';
  let finish, moving = false, changes = 0, chimes = 0;
  const root = {addEventListener(){},removeEventListener(){}};
  const dispose = mountFill(root,state,{sound:true,isCurrent:()=>!moving,sequence:()=>new Promise(resolve=>{finish=resolve}),change:()=>changes++,chime:()=>chimes++,stop(){}});
  moving = true; finish(false);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(changes,0); assert.equal(chimes,0);
  assert.equal(state.phase,'celebrate');
  dispose();
});
