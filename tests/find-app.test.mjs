import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAINS } from '../src/data.js';
import { trainFactText } from '../src/train-facts.js';
import { ANNOUNCEMENT_FILES } from '../src/announcement-manifest.js';
import { VOICE_FILES } from '../src/voice-manifest.js';

// Exercise the app's real event handlers with controlled audio/timers. A pending
// recording must own the next-question timer until it ends or the user skips it.
test('find settings, narration timing, manual skip and history work together', async t => {
  const rootEvents = {}, windowEvents = {}, stored = new Map();
  const root = {innerHTML:'', addEventListener:(name,fn)=>rootEvents[name]=fn,querySelectorAll:()=>[]};
  const players = [];
  const factFile = text => ANNOUNCEMENT_FILES[text] || VOICE_FILES[text];
  const entries = [];
  globalThis.document = {querySelector:selector=>selector==='#app'?root:null};
  globalThis.location = {pathname:'/',search:''};
  globalThis.matchMedia = ()=>({matches:false});
  globalThis.window = {localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)},addEventListener:(name,fn)=>windowEvents[name]=fn,scrollTo(){}};
  globalThis.history = {state:null,replaceState(value){this.state=structuredClone(value);},pushState(value){entries.push(value);this.state=value;},go(){}};
  globalThis.Audio = class {
    constructor(){players.push(this);}
    play(){return Promise.resolve();}
    pause(){this.paused=true;}
  };
  t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});
  const flush = async()=>{await Promise.resolve();await Promise.resolve();};
  await import('../src/app.js');
  const click = (action,extra={})=>rootEvents.click({target:{closest:()=>({dataset:{action,...extra}})}});
  const change = (name,value)=>rootEvents.change({target:{name,value}});
  click('settings'); change('find-choices','3'); click('start-find');
  assert.equal(history.state.choices.length,3);
  assert.equal(history.state.station,0);
  const card = history.state.journey[0], target = card.name[history.state.letterIndex];
  click('answer',{letter:target});
  assert.ok(root.innerHTML.includes(history.state.currentFact));
  const clip = players.at(-1);
  assert.ok(clip.src.endsWith(factFile(history.state.currentFact)));
  const selectedFact = history.state.currentFact;
  click('answer',{letter:target});
  assert.equal(history.state.currentFact,selectedFact);
  assert.equal(players.at(-1),clip,'repeated taps do not restart the fact');
  t.mock.timers.tick(5000);await flush();
  assert.equal(history.state.station,0,'intro does not advance before audio finishes');
  clip.onended();await flush();t.mock.timers.tick(1);await flush();
  assert.equal(history.state.station,1);
  const second = history.state.journey[1];
  click('answer',{letter:second.name[history.state.letterIndex]});
  const skipped = players.at(-1);
  click('next'); await flush();
  assert.equal(skipped.paused,true);
  assert.equal(history.state.station,2);
  click('settings');change('find-choices','2');
  const savedGame = structuredClone(history.state);
  // Restore the actual question snapshot as browser popstate would.
  savedGame.screen='game';savedGame.trail=['home'];savedGame.answered=false;
  windowEvents.popstate({state:savedGame});
  assert.equal(history.state.choices.length,2);
  const progress=JSON.parse(stored.get('train-hiragana-v1'));
  assert.equal(progress.findChoices,2);
  assert.equal(progress.level,'match');
  const third = history.state.journey[2];
  click('answer',{letter:third.name[history.state.letterIndex]});
  click('sound');click('sound');await flush();
  const resumed = players.at(-1);
  assert.ok(resumed.src.endsWith(factFile(history.state.currentFact)));
  t.mock.timers.tick(5000);await flush();
  assert.equal(history.state.station,2,'sound-on resumes the fact instead of cutting it off');
  resumed.onended();await flush();t.mock.timers.tick(1);await flush();
  assert.equal(history.state.station,3);
  click('home');
  t.mock.timers.reset();
  assert.equal(TRAINS.length,205);
});
