import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync, readFileSync } from 'node:fs';
import { TRAINS, KANA_ROWS } from '../src/data.js';
import { REWARD_TRAINS } from '../src/reward.js';
import { VOICE_FILES } from '../src/voice-manifest.js';
import { questionText, hintText, praiseText, rewardText, VOICE_SAMPLE } from '../src/voice-lines.js';
import { playVoice, stopVoice } from '../src/voice.js';

test('all reachable narration has a generated audio file', () => {
  const expected = [VOICE_SAMPLE, 'おとが でるよ', 'のばす おと'];
  for (const train of TRAINS) {
    expected.push(train.name, praiseText(train));
    for (const c of train.name) expected.push(questionText(train, c), hintText(c));
  }
  for (const train of REWARD_TRAINS) expected.push(rewardText(train));
  expected.push(...KANA_ROWS.join('').replaceAll(' ', '').replace('ー', ''));
  for (const text of expected) {
    assert.ok(VOICE_FILES[text], text);
    assert.ok(statSync(`assets/voice/${VOICE_FILES[text]}`).size > 1000, text);
  }
  const manifest = JSON.parse(readFileSync('assets/voice/lines.json', 'utf8'));
  assert.equal(manifest.lines.find(l => l.text === 'は').spoken, 'ハ。');
  assert.equal(manifest.lines.find(l => l.text === 'っ').spoken, 'ちいさい、ツ。');
});

test('recorded speech cancels older playback and falls back only for the current request', async () => {
  const players = [], spoken = [];
  let fail;
  globalThis.Audio = class {
    constructor() { players.push(this); }
    pause() { this.paused = true; }
    play() { this.paused = false; return new Promise((_, reject) => { fail = reject; }); }
  };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.speechSynthesis = { cancel() {}, getVoices: () => [], speak: u => spoken.push(u.text) };
  playVoice('は');
  const oldFail = fail;
  playVoice('こ');
  oldFail(new Error('late failure'));
  await Promise.resolve();
  assert.deepEqual(spoken, []);
  assert.ok(players[0].src.endsWith(VOICE_FILES['こ']));
  assert.equal(players.length, 1);
  const pendingFailure = fail;
  stopVoice();
  pendingFailure(new Error('after mute'));
  await Promise.resolve();
  assert.equal(players[0].paused, true);
  assert.deepEqual(spoken, []);
  playVoice('あ');
  players[0].onerror();
  fail(new Error('same failure reported twice'));
  await Promise.resolve();
  assert.deepEqual(spoken, ['あ']);
  stopVoice();
});
