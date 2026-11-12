import { REWARD_DURATION, rewardMoment } from './reward-timeline.js';

// A quiet, entirely synthetic ten-second score. No recorded train sounds.
const SCORE_SECONDS = REWARD_DURATION / 1000;
const TAU = Math.PI * 2;
const noop = () => {};
let context, activeStop;

// Call directly from a user gesture. playRewardSound also attempts this when
// enabling sound, so a reward which began muted can unlock on its mute button.
export function unlockRewardAudio(enabled) {
  if (!enabled) return;
  try {
    if (!context || context.state === 'closed') {
      const host = globalThis.window ?? globalThis;
      const AudioContext = host.AudioContext || host.webkitAudioContext;
      if (!AudioContext) return;
      context = new AudioContext();
    }
    return context.resume()?.catch?.(noop);
  } catch { /* Sound is optional, including on devices without Web Audio. */ }
}

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
function envelope(time, start, end, attack, release) {
  if (time <= start || time >= end) return 0;
  return smooth((time - start) / attack) * smooth((end - time) / release);
}
function random(index, seed) {
  let value = Math.imul(index ^ seed, 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 0xffffffff * 2 - 1;
}
function air(time, seed) {
  // Smooth, repeatable low-band noise rather than sharp white-noise clicks.
  const position = time * 1300, index = Math.floor(position);
  const from = random(index, seed);
  return from + (random(index + 1, seed) - from) * smooth(position - index);
}
const fanfare = [
  { start: 8.2, end: 8.82, frequencies: [261.6256], level: .105 },
  { start: 8.52, end: 9.14, frequencies: [329.6276], level: .1 },
  { start: 8.84, end: 9.48, frequencies: [391.9954], level: .095 },
  { start: 9.12, end: 9.88, frequencies: [261.6256, 329.6276, 391.9954], level: .038 },
];
function sample(time, sceneId, shinkansen) {
  let value = 0;
  if (time < 1.1) {
    const phase = TAU * (196 * time + (293.6648 - 196) * time * time / 2.2);
    // Leave the first spoken Puck train name clearly in front of the score.
    value += envelope(time, 0, 1.1, .23, .34) * (.024 * Math.sin(phase) + .006 * Math.sin(phase / 2));
  }
  if (time > 1.1 && time < 8.2) {
    const moment = rewardMoment(time * 1000, shinkansen), topSpeed = shinkansen ? 30 : 24;
    const low = shinkansen ? 98 : 78, high = shinkansen ? 176 : 138;
    // Integrating speed through distance makes the motor phase continuous at
    // the timeline's 4.6-second transition from acceleration to cruising.
    const motorTime = time - 1.1, cycles = low * motorTime + (high - low) * moment.distance / topSpeed;
    const phase = TAU * cycles + .025 * Math.sin(motorTime * 4);
    value += envelope(time, 1.1, 8.2, .32, .65) *
      (.072 * Math.sin(phase) + .018 * Math.sin(phase * 2) + .007 * Math.sin(phase * 3));
    const movement = moment.speed / topSpeed;
    const rhythm = Math.pow(.5 + .5 * Math.cos(TAU * moment.distance / (shinkansen ? 8.5 : 6.5)), 10);
    const noise = air(time, sceneId === 'depot' ? 11427 : sceneId === 'night' ? 4827 : 73129);
    value += envelope(time, 1.1, 8.15, .55, .6) * noise * (.018 + movement * .02);
    value += envelope(time, 3.2, 7.8, .4, .5) * rhythm * noise * (shinkansen ? .023 : .04);
    if (sceneId === 'night') {
      value += envelope(time, 4.6, 6.1, .22, .35) * Math.exp(-Math.pow((time - 5.3) / .36, 2)) * noise * .095;
    }
  }
  for (const note of fanfare) {
    const level = envelope(time, note.start, note.end, .055, .23) * note.level;
    if (!level) continue;
    for (const frequency of note.frequencies) {
      const phase = TAU * frequency * (time - note.start);
      value += level * (Math.sin(phase) + .09 * Math.sin(phase * 2));
    }
  }
  return .32 * Math.tanh(value / .32);
}
const nightPan = [[0, -.08], [4.6, -.16], [5.3, 0], [6, .16], [7.8, .04], [10, 0]];
const dayPan = [[0, -.08], [7.8, .08], [10, 0]];
function panAt(points, time) {
  for (let i = 1; i < points.length; i++) {
    const [end, to] = points[i], [start, from] = points[i - 1];
    if (time <= end) return from + (to - from) * clamp((time - start) / (end - start));
  }
  return points.at(-1)[1];
}

/**
 * duration caps the remaining seconds to play; offset is absolute score time.
 * Both {duration:10, offset:6} and {duration:4, offset:6} play only seconds 6–10.
 * Each call replaces the previous score. The returned stop function is idempotent.
 */
export function playRewardSound(enabled, { duration = 10, sceneId = 'skybridge', offset = 0, shinkansen = false } = {}) {
  activeStop?.();
  if (!enabled || !Number.isFinite(duration) || !Number.isFinite(offset)) return noop;
  const from = Math.max(0, offset), seconds = Math.min(duration, SCORE_SECONDS - from);
  if (seconds <= 0) return noop;
  const requestedAt = Date.now();
  const ready = unlockRewardAudio(true);
  if (!context || context.state === 'closed') return noop;
  const audio = context, nodes = new Set();
  let source, stopped = false;
  const own = node => { nodes.add(node); return node; };
  function stop() {
    if (stopped) return;
    stopped = true;
    if (activeStop === stop) activeStop = undefined;
    if (source) {
      source.onended = null;
      try { source.stop(); } catch { /* Already ended or never started. */ }
    }
    for (const node of nodes) { try { node.disconnect(); } catch { /* Continue releasing the other nodes. */ } }
    if (source) { try { source.buffer = null; } catch { /* A closed context may reject updates. */ } }
    nodes.clear();
    source = undefined;
  }
  function start(from, seconds) {
    if (stopped) return;
    try {
      // Low-band synthesis needs only a 22.05 kHz buffer, reducing generation
      // work on devices whose AudioContext runs at 48 or 96 kHz.
      const sampleRate = Math.min(22050, audio.sampleRate);
      const count = Math.floor(seconds * sampleRate);
      if (count < 1) { stop();return; }
      const buffer = audio.createBuffer(1, count, sampleRate), data = buffer.getChannelData(0);
      const firstSample = Math.round(from * sampleRate);
      for (let i = 0; i < count; i++) data[i] = sample((firstSample + i) / sampleRate, sceneId, shinkansen);
      const now = audio.currentTime, end = now + count / sampleRate;
      source = own(audio.createBufferSource());source.buffer = buffer;
      const filter = own(audio.createBiquadFilter()), gain = own(audio.createGain());
      filter.type = 'lowpass';filter.frequency.value = 1650;filter.Q.value = .55;
      gain.gain.setValueAtTime(0, now);
      const edge = Math.min(.025, (end - now) / 3);
      gain.gain.linearRampToValueAtTime(.55, now + edge);
      gain.gain.setValueAtTime(.55, end - edge);
      gain.gain.linearRampToValueAtTime(0, end);
      source.connect(filter);filter.connect(gain);
      if (audio.createStereoPanner) {
        const panner = own(audio.createStereoPanner()), points = sceneId === 'night' ? nightPan : dayPan;
        gain.connect(panner);panner.connect(audio.destination);
        panner.pan.setValueAtTime(panAt(points, from), now);
        for (const [time, value] of points) if (time > from && time < from + seconds) panner.pan.linearRampToValueAtTime(value, now + time - from);
        panner.pan.linearRampToValueAtTime(panAt(points, from + seconds), end);
      } else gain.connect(audio.destination);
      source.onended = stop;
      source.start(now);source.stop(end);
    } catch { stop(); }
  }
  activeStop = stop;
  if (audio.state === 'running') start(from, seconds);
  else {
    // A delayed mobile resume must use the current absolute score time, and
    // cancellation/replacement must prevent it from creating a late source.
    try {
      Promise.resolve(ready).then(() => {
        if (stopped) return;
        if (audio.state !== 'running') { stop();return; }
        const skipped = Math.max(0, (Date.now() - requestedAt) / 1000);
        if (skipped >= seconds) { stop();return; }
        start(from + skipped, seconds - skipped);
      }).catch(stop);
    } catch { stop(); }
  }
  return stop;
}
