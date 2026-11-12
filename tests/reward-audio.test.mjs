import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { rewardMoment } from '../src/reward-timeline.js';

let serial = 0;
async function finishResume(audio) {
  audio.state = 'running';audio.resolveResume();
  await audio.resuming;
  // Drain the consumer's resume/catch/then chain, regardless of its depth.
  await nextTurn();
}
function scoreClock(t) {
  let now = 1700000000000;
  t.mock.method(Date, 'now', () => now);
  return { advance(milliseconds) { now += milliseconds; } };
}
async function harness(t, { state = 'running', panner = true, failAt, resumeRejects = false, stopThrows = false, sampleRate = 8000, disconnectThrows = false, deferredResume = false, resumeHops = 0 } = {}) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const instances = [], buffers = [];
  const param = () => ({ value: 0, events: [],
    setValueAtTime(value, time) { assert.ok(Number.isFinite(value) && Number.isFinite(time));this.events.push(['set', value, time]); },
    linearRampToValueAtTime(value, time) { assert.ok(Number.isFinite(value) && Number.isFinite(time));this.events.push(['ramp', value, time]); },
  });
  class Node {
    constructor(kind, audio) { this.kind = kind;this.audio = audio;this.connections = [];this.disconnects = 0;this.gain = param();this.frequency = param();this.Q = param();this.pan = param();audio.nodes.push(this); }
    connect(next) { if (failAt === 'connect') throw Error('connection failure');this.connections.push(next);return next; }
    disconnect() { this.disconnects++;this.connections = [];if (disconnectThrows) throw Error('closed graph'); }
    start(time) { if (failAt === 'start') throw Error('start failure');this.started = time; }
    stop(time) { (this.stops ??= []).push(time);if (stopThrows && time === undefined) throw Error('already stopped'); }
    finish() { this.onended?.(); }
  }
  class AudioContext {
    constructor() {
      if (failAt === 'constructor') throw Error('unsupported');
      this.state = state;this.currentTime = 100;this.sampleRate = sampleRate;this.nodes = [];this.destination = {};this.resumes = 0;
      if (!panner) this.createStereoPanner = undefined;
      if (deferredResume) this.resuming = new Promise(resolve => { this.resolveResume = resolve; });
      instances.push(this);
    }
    resume() {
      this.resumes++;
      let ready = resumeRejects ? Promise.reject(Error('gesture required')) : this.resuming ?? Promise.resolve();
      // Promise completion order is the contract, not a fixed microtask count.
      for (let i = 0; i < resumeHops; i++) ready = ready.then(value => value);
      return ready;
    }
    createBuffer(channels, count, sampleRate) {
      assert.equal(channels, 1);assert.equal(sampleRate, Math.min(22050, this.sampleRate));
      const data = new Float32Array(count), buffer = { data, sampleRate, getChannelData: channel => { assert.equal(channel, 0);return data; } };
      buffers.push(buffer);return buffer;
    }
    createBufferSource() { return new Node('source', this); }
    createBiquadFilter() { return new Node('filter', this); }
    createGain() { if (failAt === 'gain') throw Error('gain failure');return new Node('gain', this); }
    createStereoPanner() { return new Node('panner', this); }
  }
  globalThis.window = { AudioContext };
  const api = await import(`../src/reward-audio.js?audio-test=${serial++}`);
  t.after(() => {
    api.playRewardSound(false);
    if (original) Object.defineProperty(globalThis, 'window', original);else delete globalThis.window;
  });
  return { ...api, instances, buffers, get audio() { return instances.at(-1); },
    get source() { return instances.at(-1)?.nodes.filter(node => node.kind === 'source').at(-1); },
  };
}
const released = nodes => {
  for (const node of nodes) { assert.equal(node.disconnects, 1, `${node.kind} disconnected once`);assert.deepEqual(node.connections, []); }
  for (const node of nodes.filter(node => node.kind === 'source')) { assert.equal(node.onended, null);assert.equal(node.buffer, null); }
};
const rms = (data, start, end, sampleRate = 8000) => {
  const values = data.subarray(Math.round(start * sampleRate), Math.round(end * sampleRate));
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
};
function dominantMotorFrequency(data, center, sampleRate = 8000) {
  const start = Math.round((center - .12) * sampleRate), count = Math.round(.24 * sampleRate);
  let strongest = 0, frequency = 0;
  for (let hz = 65; hz <= 190; hz++) {
    let real = 0, imaginary = 0;
    for (let i = 0; i < count; i++) {
      const sample = data[start + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / (count - 1)));
      const angle = 2 * Math.PI * hz * i / sampleRate;
      real += sample * Math.cos(angle);imaginary += sample * Math.sin(angle);
    }
    const power = real * real + imaginary * imaginary;
    if (power > strongest) { strongest = power;frequency = hz; }
  }
  return frequency;
}

test('muted playback allocates nothing; explicit unlock shares one context', async t => {
  const h = await harness(t);
  h.unlockRewardAudio(false);h.playRewardSound(false)();
  assert.equal(h.instances.length, 0);
  h.unlockRewardAudio(true);h.unlockRewardAudio(true);
  assert.equal(h.instances.length, 1);assert.equal(h.audio.resumes, 2);
  assert.equal(h.audio.nodes.length, 0);
});

test('unmuting can unlock sound even when the reward originally began muted', async t => {
  const h = await harness(t);h.unlockRewardAudio(false);h.playRewardSound(false)();
  const stop = h.playRewardSound(true, { offset: 4 });
  assert.equal(h.instances.length, 1);assert.equal(h.source.started, 100);assert.equal(h.source.stops[0], 106);
  stop();released(h.audio.nodes);
});

test('unlock returns a promise which waits for context resume without starting playback', async t => {
  const h = await harness(t, { state: 'suspended', deferredResume: true });
  const ready = h.unlockRewardAudio(true);assert.equal(typeof ready?.then, 'function');
  let finished = false;ready.then(() => { finished = true; });
  await Promise.resolve();assert.equal(finished, false);
  h.audio.state = 'running';h.audio.resolveResume();await ready;
  assert.equal(finished, true);assert.equal(h.audio.nodes.length, 0);assert.equal(h.buffers.length, 0);
  h.playRewardSound(true, { offset: 6 });assert.equal(h.source.stops[0], 104);
});

test('awaiting unlock safely absorbs a rejected resume request', async t => {
  const h = await harness(t, { state: 'suspended', resumeRejects: true });
  await assert.doesNotReject(() => h.unlockRewardAudio(true));
  assert.equal(h.audio.nodes.length, 0);
  assert.equal(h.unlockRewardAudio(false), undefined);
});

test('ten-second synthetic score has soft opening, acceleration, running and a short ending', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);
  const stop = h.playRewardSound(true), data = h.buffers[0].data;
  assert.equal(data.length, 80000);assert.equal(h.source.started, 100);assert.deepEqual(h.source.stops, [110]);
  for (const [start, end] of [[1.5, 2.8], [3.5, 7], [8.25, 9.6]]) assert.ok(rms(data, start, end) > .015, `${start}–${end} is audible`);
  const opening = rms(data, .2, .8);
  assert.ok(opening > .004 && opening < .02, 'opening cue remains quiet beneath the spoken train name');
  assert.ok(opening < rms(data, 1.5, 2.8) * .45);
  assert.equal(rms(data, 9.9, 10), 0, 'fanfare ends with a quiet tail');
  assert.ok(data.every(value => Number.isFinite(value) && Math.abs(value) < .32));
  const master = h.audio.nodes.find(node => node.kind === 'gain');
  assert.deepEqual(master.gain.events, [['set', 0, 100], ['ramp', .55, 100.025], ['set', .55, 109.975], ['ramp', 0, 110]]);
  stop();stop();released(h.audio.nodes);
});

test('absolute offset reproduces only the remaining score, including a partly played fanfare', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);
  h.playRewardSound(true, { sceneId: 'night', shinkansen: true });
  const full = h.buffers.at(-1).data;
  for (const offset of [1.6, 4.6, 5.3, 8.6, 9.4]) {
    const stop = h.playRewardSound(true, { sceneId: 'night', shinkansen: true, offset });
    const remaining = h.buffers.at(-1).data;
    assert.deepEqual(remaining, full.subarray(Math.round(offset * 8000), Math.round(offset * 8000) + remaining.length));
    assert.ok(Math.abs(h.source.stops[0] - (110 - offset)) < 1 / 8000);
    stop();
  }
  released(h.audio.nodes);
});

test('remaining duration caps playback without stretching or restarting timeline events', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);
  h.playRewardSound(true);const full = h.buffers.at(-1).data;
  h.playRewardSound(true, { duration: 1.5, offset: 8.5 });
  assert.deepEqual(h.buffers.at(-1).data, full.subarray(68000));assert.equal(h.source.stops[0], 101.5);
  h.playRewardSound(true, { duration: .75, offset: 5 });
  assert.deepEqual(h.buffers.at(-1).data, full.subarray(40000, 46000));assert.equal(h.source.stops[0], 100.75);
});

test('motor pitch follows the shared timeline through the 4.6-second end of acceleration', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);
  for (const shinkansen of [false, true]) {
    h.playRewardSound(true, { shinkansen });const data = h.buffers.at(-1).data;
    const low = shinkansen ? 98 : 78, high = shinkansen ? 176 : 138, topSpeed = shinkansen ? 30 : 24;
    for (const seconds of [1.9, 3.8, 4.9, 6.8]) {
      const expected = low + (high - low) * rewardMoment(seconds * 1000, shinkansen).speed / topSpeed;
      const actual = dominantMotorFrequency(data, seconds);
      assert.ok(Math.abs(actual - expected) < 2, `${shinkansen ? 'Shinkansen' : 'commuter'} at ${seconds}: ${actual} Hz vs ${expected} Hz`);
    }
  }
});

test('high-rate devices use a bounded synthesis buffer and still finish at ten seconds', async t => {
  const h = await harness(t, { sampleRate: 48000 });h.unlockRewardAudio(true);
  const stop = h.playRewardSound(true), buffer = h.buffers.at(-1);
  assert.equal(buffer.sampleRate, 22050);assert.equal(buffer.data.length, 220500);
  assert.equal(h.source.stops[0], 110);stop();released(h.audio.nodes);
});

test('night passing sound and stereo motion are centred on absolute second 5.3', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);
  h.playRewardSound(true, { sceneId: 'night' });const full = h.buffers.at(-1).data;
  assert.ok(rms(full, 5.2, 5.4) > rms(full, 4.3, 4.5));
  assert.ok(rms(full, 5.2, 5.4) > rms(full, 6.2, 6.4));
  h.playRewardSound(true, { sceneId: 'night', offset: 5.3 });
  assert.equal(h.audio.nodes.filter(node => node.kind === 'panner').at(-1).pan.events[0][1], 0);
  h.playRewardSound(true, { sceneId: 'night', offset: 6 });
  const pan = h.audio.nodes.filter(node => node.kind === 'panner').at(-1).pan.events;
  assert.ok(pan[0][1] > 0, 'returning after the pass begins on its outgoing side');
  assert.ok(pan.every(([, value]) => value >= 0 && value <= .16));
});

test('rapid replacement, mute and stale completion release each voice exactly once', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);
  for (let i = 0; i < 8; i++) {
    const oldStop = h.playRewardSound(true), oldSource = h.source, lateEnd = oldSource.onended;
    const stop = h.playRewardSound(true, { offset: 8.2, shinkansen: true }), current = h.source;
    oldStop();lateEnd();assert.equal(current.disconnects, 0);
    h.playRewardSound(false);stop();assert.equal(current.disconnects, 1);
  }
  released(h.audio.nodes);
});

test('natural completion releases all nodes and the AudioBuffer without a UI stop', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);
  const stop = h.playRewardSound(true, { offset: 9 });h.source.finish();stop();released(h.audio.nodes);
});

test('suspended contexts never queue stale sound; a fresh foreground call uses its supplied offset', async t => {
  const h = await harness(t, { state: 'suspended', resumeRejects: true });
  h.unlockRewardAudio(true);await Promise.resolve();h.playRewardSound(true)();
  assert.equal(h.audio.nodes.length, 0);assert.equal(h.buffers.length, 0);
  h.audio.state = 'running';h.playRewardSound(true, { offset: 8.5 });
  assert.equal(h.source.stops[0], 101.5);
});

test('delayed resume advances the absolute offset instead of replaying the opening', async t => {
  const h = await harness(t, { state: 'suspended', deferredResume: true, resumeHops: 8 });
  const clock = scoreClock(t);
  h.playRewardSound(true, { offset: 4.5 });assert.equal(h.audio.nodes.length, 0);
  clock.advance(800);await finishResume(h.audio);
  assert.equal(h.buffers.length, 1, 'the resumed source is created before inspecting its buffer');
  const delayed = h.buffers.at(-1).data;
  assert.ok(Math.abs(h.source.stops[0] - 104.7) < 1 / 8000);
  h.playRewardSound(true, { offset: 5.3 });assert.deepEqual(h.buffers.at(-1).data, delayed);
});

test('cancelling a pending context resume prevents all late node creation', async t => {
  const h = await harness(t, { state: 'suspended', deferredResume: true, resumeHops: 8 });
  scoreClock(t);
  const stop = h.playRewardSound(true, { offset: 5 });stop();stop();
  await finishResume(h.audio);
  assert.equal(h.audio.nodes.length, 0);assert.equal(h.buffers.length, 0);
});

test('a context resuming after the score deadline remains silent', async t => {
  const h = await harness(t, { state: 'suspended', deferredResume: true, resumeHops: 8 });
  const clock = scoreClock(t);
  h.playRewardSound(true, { offset: 9 });clock.advance(1500);
  await finishResume(h.audio);
  assert.equal(h.audio.nodes.length, 0);assert.equal(h.buffers.length, 0);
});

test('a closed context is replaced by the next enabled playback', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);h.audio.state = 'closed';
  h.playRewardSound(true)();assert.equal(h.instances.length, 2);released(h.audio.nodes);
});

test('invalid or completed ranges allocate nothing; negative offsets clamp to the beginning', async t => {
  const h = await harness(t);h.unlockRewardAudio(true);
  for (const options of [{ offset: 10 }, { offset: 20 }, { offset: NaN }, { offset: Infinity }, { duration: 0 }, { duration: -1 }, { duration: NaN }, { duration: Infinity }]) h.playRewardSound(true, options)();
  assert.equal(h.audio.nodes.length, 0);assert.equal(h.buffers.length, 0);
  h.playRewardSound(true, { offset: -2 });assert.equal(h.buffers.at(-1).data.length, 80000);
});

test('browsers without stereo panning still play and release the mono graph', async t => {
  const h = await harness(t, { panner: false });h.unlockRewardAudio(true);
  const stop = h.playRewardSound(true);assert.deepEqual(h.audio.nodes.map(node => node.kind), ['source', 'filter', 'gain']);
  assert.equal(h.audio.nodes.at(-1).connections[0], h.audio.destination);stop();released(h.audio.nodes);
});

for (const failAt of ['gain', 'connect', 'start']) {
  test(`partial ${failAt} failure releases every allocated node`, async t => {
    const h = await harness(t, { failAt });h.unlockRewardAudio(true);
    const stop = h.playRewardSound(true);assert.doesNotThrow(() => { stop();stop(); });released(h.audio.nodes);
  });
}
test('unsupported Web Audio and stop errors are harmless', async t => {
  const h = await harness(t, { stopThrows: true });h.unlockRewardAudio(true);
  h.playRewardSound(true)();released(h.audio.nodes);
  delete globalThis.window.AudioContext;h.audio.state = 'closed';
  assert.doesNotThrow(() => { h.unlockRewardAudio(true);h.playRewardSound(true)(); });
});

test('constructor failures are harmless', async t => {
  const failed = await harness(t, { failAt: 'constructor' });
  assert.doesNotThrow(() => { failed.unlockRewardAudio(true);failed.playRewardSound(true)(); });
  assert.equal(failed.instances.length, 0);
});
test('disconnect failures never prevent remaining graph cleanup', async t => {
  const h = await harness(t, { disconnectThrows: true });h.unlockRewardAudio(true);
  const stop = h.playRewardSound(true);assert.doesNotThrow(() => { stop();stop(); });released(h.audio.nodes);
});
