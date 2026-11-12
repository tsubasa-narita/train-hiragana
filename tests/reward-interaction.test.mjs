import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAINS } from '../src/data.js';
import {
  REWARD_TRAINS, REWARD_BOOK_IDS, REWARD_DURATION, chooseReward,
  rewardBookId, showTrainReward, stopTrainReward,
} from '../src/reward.js';

test('four cinematic rewards resolve only explicit valid book entries', () => {
  assert.equal(REWARD_DURATION, 7000);
  assert.deepEqual(REWARD_TRAINS.map(train => train.id), ['yokosuka', 'shonan-shinjuku', 'saikyo', 'toyoko']);
  assert.equal(Object.keys(REWARD_BOOK_IDS).length, 4);
  for (const [reward, book] of Object.entries(REWARD_BOOK_IDS)) {
    assert.ok(REWARD_TRAINS.some(train => train.id === reward));
    assert.ok(TRAINS.some(train => train.id === book));
    assert.equal(rewardBookId({ id: reward }, TRAINS), book);
  }
  assert.equal(rewardBookId({ id: 'shiokaze' }, TRAINS), null);
  assert.equal(rewardBookId({ id: 'hayabusa' }, []), null);
  assert.equal(rewardBookId({ id: 'toString' }, TRAINS), null);
  assert.equal(rewardBookId({ id: '__proto__' }, TRAINS), null);
  for (const train of REWARD_TRAINS) {
    for (let i = 0; i < 8; i++) {
      const other = chooseReward(train.id);
      assert.notEqual(other.id, train.id);
      assert.ok(REWARD_TRAINS.includes(other));
    }
  }
});

// Minimal DOM surface used by the dialog. These tests need no browser or WebGL.
class Element extends EventTarget {
  constructor(tagName) {
    super();
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.hidden = false;
    this.className = '';
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      toggle: (name, enabled) => {
        const names = new Set(this.className.split(/\s+/).filter(Boolean));
        if (enabled) names.add(name); else names.delete(name);
        this.className = [...names].join(' ');
      },
    };
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') this.className = value;
    if (name === 'hidden') this.hidden = true;
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  append(child) { child.parentElement = this; this.children.push(child); }
  remove() {
    if (this.parentElement) {
      const siblings = this.parentElement.children;
      siblings.splice(siblings.indexOf(this), 1);
      this.parentElement = null;
    }
  }
  replaceWith(next) {
    const parent = this.parentElement;
    assert.ok(parent, 'replacement canvas must occupy the existing scene container');
    parent.children.splice(parent.children.indexOf(this), 1, next);
    next.parentElement = parent;
    this.parentElement = null;
  }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return (this.text ?? '') + this.children.map(child => child.textContent).join(''); }
  set innerHTML(html) {
    this.markup = html;
    this.children = [];
    const stack = [this];
    for (const token of html.match(/<[^>]+>|[^<]+/g) ?? []) {
      if (token.startsWith('</')) { stack.pop(); continue; }
      if (!token.startsWith('<')) {
        stack.at(-1).text = (stack.at(-1).text ?? '') + token;
        continue;
      }
      const tag = token.match(/^<([\w-]+)/)[1];
      const child = new Element(tag);
      for (const match of token.slice(tag.length + 1, -1).matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
        child.setAttribute(match[1], match[2] ?? '');
      }
      stack.at(-1).append(child);
      if (!['img', 'br', 'input'].includes(tag)) stack.push(child);
    }
  }
  querySelectorAll(selector) {
    const parts = selector.split(/\s+/);
    const matches = (node, part) => part.startsWith('.') ? node.classList.contains(part.slice(1))
      : part.startsWith('#') ? node.getAttribute('id') === part.slice(1)
        : part.startsWith('[') ? node.getAttribute('data-reward') === part.match(/="([^"]+)"/)[1]
          : node.tagName === part;
    const results = [];
    const visit = node => {
      for (const child of node.children) {
        if (matches(child, parts.at(-1))) {
          let ancestor = child.parentElement, index = parts.length - 2;
          while (ancestor && index >= 0) {
            if (matches(ancestor, parts[index])) index--;
            ancestor = ancestor.parentElement;
          }
          if (index < 0) results.push(child);
        }
        visit(child);
      }
    };
    visit(this);
    return results;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  showModal() { assert.ok(this.parentElement, 'append before showModal'); this.open = true; }
  close() { this.open = false; }
}

function harness(t, { reduced = false } = {}) {
  const descriptors = new Map(['document', 'window', 'speechSynthesis'].map(key =>
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const document = new EventTarget(), listeners = new Set();
  document.body = new Element('body');
  document.hidden = false;
  document.createElement = tag => new Element(tag);
  const add = document.addEventListener.bind(document), remove = document.removeEventListener.bind(document);
  document.addEventListener = (name, fn) => { if (name === 'visibilitychange') listeners.add(fn); add(name, fn); };
  document.removeEventListener = (name, fn) => { if (name === 'visibilitychange') listeners.delete(fn); remove(name, fn); };
  let voiceStops = 0;
  Object.assign(globalThis, {
    document,
    window: { matchMedia: query => { assert.equal(query, '(prefers-reduced-motion: reduce)'); return { matches: reduced }; } },
    speechSynthesis: { cancel() { voiceStops++; } },
  });
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 1700000000000 });
  t.after(() => {
    stopTrainReward();
    t.mock.timers.reset();
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  });
  const engines = [];
  const module = {
    createReward3D(canvas, train, options) {
      assert.ok(document.body.querySelector('dialog').open, 'show the native dialog before scene creation');
      const engine = { canvas, train: { ...train }, options, elapsed: 0, plays: 0, pauses: 0, resumes: 0, disposals: 0,
        play() { this.plays++; }, pause() { this.pauses++; }, resume() { this.resumes++; }, dispose() { this.disposals++; },
      };
      engines.push(engine);
      return engine;
    },
  };
  const open = options => showTrainReward({ train: REWARD_TRAINS[0], sound: false, loadScene: async () => module, ...options });
  const dialog = () => document.body.querySelector('dialog');
  const button = name => dialog().querySelector(`[data-reward="${name}"]`);
  return {
    document, listeners, engines, module, open, dialog, button,
    get voiceStops() { return voiceStops; },
    click(name) { const node = button(name); assert.ok(node && !node.hidden, `${name} must be visible`); node.onclick(); },
    visibility(hidden) { document.hidden = hidden; document.dispatchEvent(new Event('visibilitychange')); },
  };
}
async function settled() { await Promise.resolve(); await Promise.resolve(); }
function deferred() { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; }
function assertArrivalControls(h, visible) {
  for (const name of ['replay', 'another', 'book']) assert.equal(h.button(name).hidden, !visible, name);
  assert.equal(h.button('continue').hidden, false);
  assert.equal(h.button('mute').hidden, false);
  assert.equal(h.button('start').hidden, true);
}

test('native dialog opens during loading and successful 3D loading starts playback automatically', async t => {
  const h = harness(t, { reduced: true }), loading = deferred();
  h.open({ loadScene: () => loading.promise });
  assert.equal(h.dialog().open, true);
  assert.equal(h.dialog().dataset.phase, 'loading');
  assertArrivalControls(h, false);
  loading.resolve(h.module);
  await settled();
  assert.equal(h.engines.length, 1);
  assert.equal(h.engines[0].plays, 1);
  assert.equal(h.engines[0].options.reduced, true);
  assert.equal(h.dialog().dataset.renderer, 'webgl');
  assert.equal(h.dialog().dataset.phase, 'running');
  assert.equal(h.dialog().querySelector('.reward-loading').hidden, true);
  assert.equal(h.dialog().querySelector('.reward-fallback').hidden, true);
  assertArrivalControls(h, false);
});

test('3D engine owns progress and completion; replay reuses the engine', async t => {
  const h = harness(t); let done = 0;
  h.open({ onDone: () => done++ }); await settled();
  const engine = h.engines[0];
  engine.options.onFrame(.45);
  assert.equal(h.dialog().querySelector('.reward-progress i').style.transform, 'scaleX(0.45)');
  t.mock.timers.tick(30000);
  assert.equal(h.dialog().dataset.phase, 'running', 'no competing UI timer may finish the WebGL clip');
  engine.options.onComplete();
  assert.equal(h.dialog().dataset.phase, 'arrived');
  assertArrivalControls(h, true);
  assert.equal(done, 0, 'arrival must wait for the child to continue');
  h.click('replay');
  assert.equal(h.engines.length, 1);
  assert.equal(engine.plays, 2);
  assert.equal(h.dialog().dataset.phase, 'running');
  assertArrivalControls(h, false);
  assert.equal(h.dialog().querySelector('.reward-progress i').style.transform, 'scaleX(0)');
  h.click('continue'); assert.equal(done, 1);
});

test('saved scene/train pair restores exactly and another updates that pair for history',async t=>{
  const h=harness(t),changes=[];
  const current=h.open({train:{id:'yokosuka',sceneId:'night'},onTrainChange:r=>changes.push({...r})});await settled();
  assert.equal(current.sceneId,'night');assert.equal(h.engines[0].train.sceneId,'night');
  h.engines[0].options.onComplete();h.click('replay');
  assert.equal(h.dialog().dataset.scenario,'night');assert.equal(h.engines[0].plays,2);
  h.engines[0].options.onComplete();h.click('another');await settled();
  assert.equal(h.engines[1].train.sceneId,changes[0].sceneId);
  assert.equal(current.sceneId,changes[0].sceneId);
  assert.equal(h.dialog().dataset.scenario,changes[0].sceneId);
});

test('loading while hidden defers the complete WebGL clip until visible',async t=>{
  const h=harness(t),loading=deferred();
  h.open({loadScene:()=>loading.promise});h.visibility(true);loading.resolve(h.module);await settled();
  assert.equal(h.engines[0].plays,0);assert.equal(h.dialog().dataset.phase,'waiting');
  h.visibility(false);assert.equal(h.engines[0].plays,1);assert.equal(h.dialog().dataset.phase,'running');
});

test('closing during Blender asset preparation cannot create a late renderer',async t=>{
  const h=harness(t),preparing=deferred();
  h.open({loadScene:async()=>({...h.module,prepareReward3D:()=>preparing.promise})});await settled();
  assert.equal(h.engines.length,0);h.click('continue');preparing.resolve();await settled();
  assert.equal(h.engines.length,0);assert.equal(h.dialog(),null);
});

test('hidden fallback also waits for foreground before its seven second timer',async t=>{
  const h=harness(t),loading=deferred();
  h.open({loadScene:()=>loading.promise});h.visibility(true);loading.resolve({createReward3D(){throw Error('no GPU');}});await settled();
  t.mock.timers.tick(30000);assert.equal(h.dialog().dataset.phase,'waiting');
  h.visibility(false);t.mock.timers.tick(6999);assert.equal(h.dialog().dataset.phase,'running');
  t.mock.timers.tick(1);assert.equal(h.dialog().dataset.phase,'arrived');
});

test('another train notifies history and replaces the disposed renderer canvas in the same scene', async t => {
  const h = harness(t), changes = [];
  h.open({ onTrainChange: train => changes.push({ ...train }) }); await settled();
  const previous = h.engines[0], container = previous.canvas.parentElement;
  previous.options.onComplete(); h.click('another');
  assert.equal(previous.disposals, 1);
  assert.equal(changes.length, 1);
  assert.notEqual(`${changes[0].sceneId}:${changes[0].id}`,`${previous.train.sceneId}:${previous.train.id}`);
  assert.equal(h.dialog().dataset.phase, 'loading');
  assertArrivalControls(h, false);
  await settled();
  const next = h.engines[1];
  assert.equal(next.plays, 1);
  assert.notEqual(next.canvas, previous.canvas);
  assert.equal(previous.canvas.parentElement, null);
  assert.equal(next.canvas.parentElement, container);
  assert.equal(next.train.id, changes[0].id);
  assert.equal(h.dialog().querySelector('#reward-title').textContent, changes[0].name);
});

test('book disposes before opening the current train without continuing the quiz', async t => {
  const h = harness(t), books = []; let done = 0;
  h.open({ onDone: () => done++, onBook: train => {
    assert.equal(h.dialog(), null);
    assert.equal(h.engines.at(-1).disposals, 1);
    books.push({ ...train });
  } });
  await settled();
  h.engines[0].options.onComplete(); h.click('another'); await settled();
  h.engines[1].options.onComplete(); h.click('book');
  assert.equal(books.length, 1);
  assert.equal(books[0].id, h.engines[1].train.id);
  assert.equal(done, 0);
  assert.equal(h.listeners.size, 0);
});

test('cancel continues once and late engine callbacks cannot update the removed dialog', async t => {
  const h = harness(t); let done = 0, books = 0, changes = 0;
  h.open({ onDone: () => done++, onBook: () => books++, onTrainChange: () => changes++ }); await settled();
  const dialog = h.dialog(), engine = h.engines[0], progress = dialog.querySelector('.reward-progress i');
  const before = progress.style.transform, stops = h.voiceStops;
  const cancel = new Event('cancel', { cancelable: true });
  dialog.dispatchEvent(cancel);
  assert.equal(cancel.defaultPrevented, true);
  assert.equal(dialog.open, false);
  assert.equal(h.dialog(), null);
  assert.equal(engine.disposals, 1);
  assert.ok(h.voiceStops > stops);
  assert.equal(h.listeners.size, 0);
  dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
  engine.options.onFrame(.9); engine.options.onComplete(); engine.options.onError(new Error('late context loss'));
  h.visibility(true); h.visibility(false); t.mock.timers.tick(60000); stopTrainReward();
  assert.equal(progress.style.transform, before);
  assert.equal(engine.disposals, 1);
  assert.equal(engine.pauses + engine.resumes, 0);
  assert.deepEqual([done, books, changes], [1, 0, 0]);
});

test('continue during module loading prevents late renderer creation and callbacks', async t => {
  const h = harness(t), loading = deferred(); let done = 0;
  h.open({ loadScene: () => loading.promise, onDone: () => done++ });
  h.click('continue'); loading.resolve(h.module); await settled(); t.mock.timers.tick(60000);
  assert.equal(h.engines.length, 0);
  assert.equal(h.dialog(), null);
  assert.equal(h.listeners.size, 0);
  assert.equal(done, 1);
});

test('programmatic stop and replacement close the previous reward without onDone', async t => {
  const h = harness(t); let done = 0;
  h.open({ onDone: () => done++ }); await settled();
  const previous = h.dialog();
  h.open({ train: REWARD_TRAINS[2], onDone: () => done++ }); await settled();
  assert.equal(previous.open, false);
  assert.equal(h.engines[0].disposals, 1);
  assert.equal(h.document.body.children.length, 1);
  assert.equal(h.listeners.size, 1);
  stopTrainReward(); stopTrainReward();
  assert.equal(h.engines[1].disposals, 1);
  assert.equal(h.listeners.size, 0);
  assert.equal(done, 0);
});

test('background visibility pauses and resumes only an active clip', async t => {
  const h = harness(t); h.open(); await settled();
  const engine = h.engines[0], stops = h.voiceStops;
  h.visibility(true);
  assert.equal(engine.pauses, 1);
  assert.ok(h.voiceStops > stops);
  h.visibility(false); assert.equal(engine.resumes, 1);
  engine.options.onComplete(); h.visibility(true); h.visibility(false);
  assert.equal(engine.resumes, 1, 'an arrived clip must not restart on focus');
});

test('fallback excludes ten background seconds and resumes only its remaining five seconds', async t => {
  const h = harness(t); let done = 0;
  h.open({ loadScene: async () => { throw new Error('no WebGL'); }, onDone: () => done++ });
  await settled();
  const started = Date.now();
  assert.equal(h.dialog().dataset.renderer, 'illustration');
  t.mock.timers.tick(2000);
  assert.equal(Date.now() - started, 2000);
  assert.equal(h.dialog().dataset.phase, 'running');
  h.visibility(true);
  t.mock.timers.tick(10000);
  assert.equal(Date.now() - started, 12000);
  assert.equal(h.dialog().dataset.phase, 'running', 'background time must not complete the fallback');
  assertArrivalControls(h, false);
  h.visibility(false);
  t.mock.timers.tick(4999);
  assert.equal(h.dialog().dataset.phase, 'running', 'the last visible millisecond is still required');
  assertArrivalControls(h, false);
  t.mock.timers.tick(1);
  assert.equal(Date.now() - started, 17000);
  assert.equal(h.dialog().dataset.phase, 'arrived', 'resume must use five remaining seconds rather than restart seven');
  assertArrivalControls(h, true);
  assert.equal(done, 0, 'arrival still waits for an explicit continue');
});

test('legacy review options have no review UI or letter speech; unsupported saved train normalizes', async t => {
  const h = harness(t), spoken = [];
  const current = h.open({ train: { id: 'hayabusa', name: '旧保存名' }, sound: true,
    speak: value => spoken.push(value), reviewLetters: ['を', 'ま'], words: [{ name: 'ひのとり' }],
  });
  await settled();
  assert.ok(REWARD_TRAINS.some(train => train.id === current.id));
  assert.equal(h.engines[0].train.id, current.id);
  assert.equal(h.dialog().querySelector('#reward-title').textContent, current.name);
  assert.deepEqual(spoken, [current.name]);
  assert.doesNotMatch(h.dialog().markup, /reward-review|review-letter|reward-letter|ひのとり|ふくしゅう/);
  assert.equal(h.button('touch'), null);
  assert.equal(h.button('horn'), null);
  assert.equal(h.button('mute').getAttribute('aria-pressed'), 'true');
  const stops = h.voiceStops;
  h.click('mute');
  assert.equal(h.button('mute').getAttribute('aria-pressed'), 'false');
  assert.ok(h.voiceStops > stops);
  h.engines[0].options.onComplete(); h.click('replay');
  assert.deepEqual(spoken, [current.name], 'muted replay must stay silent');
  h.click('mute'); assert.equal(h.button('mute').getAttribute('aria-pressed'), 'true');
});

for (const failure of ['module rejection', 'renderer creation', 'context loss']) {
  test(`${failure} shows an honest illustration fallback and arrives at exactly seven seconds`, async t => {
    const h = harness(t); let done = 0;
    const options = failure === 'module rejection' ? { loadScene: async () => { throw new Error('offline'); } }
      : failure === 'renderer creation' ? { loadScene: async () => ({ createReward3D() { throw new Error('no WebGL'); } }) } : {};
    h.open({ ...options, onDone: () => done++ }); await settled();
    if (failure === 'context loss') {
      h.engines[0].options.onError(new Error('context lost'));
      assert.equal(h.engines[0].disposals, 1);
    }
    const fallback = h.dialog().querySelector('.reward-fallback'), image = fallback.querySelector('img');
    assert.equal(h.dialog().dataset.renderer, 'illustration');
    assert.equal(fallback.hidden, false);
    assert.match(fallback.textContent, /イラストで表示/);
    assert.match(image.src, /^\.\/assets\/trains\/.+\.(webp|png)$/);
    assert.match(image.alt, /イラスト/);
    assert.equal(h.dialog().querySelector('canvas').hidden, true);
    assert.equal(h.dialog().querySelector('.reward-loading').hidden, true);
    assertArrivalControls(h, false);
    t.mock.timers.tick(6999); assert.equal(h.dialog().dataset.phase, 'running');
    t.mock.timers.tick(1); assert.equal(h.dialog().dataset.phase, 'arrived');
    assertArrivalControls(h, true);
    assert.equal(done, 0);
    h.click('replay');
    t.mock.timers.tick(6999); assert.equal(h.dialog().dataset.phase, 'running');
    t.mock.timers.tick(1); assert.equal(h.dialog().dataset.phase, 'arrived');
    h.click('replay'); h.click('continue'); t.mock.timers.tick(60000);
    assert.equal(done, 1);
    assert.equal(h.dialog(), null);
  });
}

test('a stalled module falls back after its load timeout and a late module cannot replace it', async t => {
  const h = harness(t), loading = deferred();
  h.open({ loadScene: () => loading.promise });
  t.mock.timers.tick(11999); assert.equal(h.dialog().dataset.phase, 'loading');
  t.mock.timers.tick(1);
  assert.equal(h.dialog().dataset.renderer, 'illustration');
  assert.equal(h.dialog().dataset.phase, 'running');
  loading.resolve(h.module); await settled();
  assert.equal(h.engines.length, 0);
  t.mock.timers.tick(6999); assert.equal(h.dialog().dataset.phase, 'running');
  t.mock.timers.tick(1); assert.equal(h.dialog().dataset.phase, 'arrived');
});
