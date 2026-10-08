import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync, readFileSync } from 'node:fs';
import { QUIZ_CARDS, KANA_ROWS, BASIC_KANA } from '../src/data.js';
import { REWARD_TRAINS } from '../src/reward.js';
import { VOICE_FILES } from '../src/voice-manifest.js';
import { ANNOUNCEMENT_FILES } from '../src/announcement-manifest.js';
import { questionText, hintText, praiseText, rewardText, tracePromptText, VOICE_SAMPLE } from '../src/voice-lines.js';
import { playVoice, playVoiceSequence, stopVoice } from '../src/voice.js';

test('all reachable narration has a generated audio file', () => {
  const expected = [VOICE_SAMPLE, 'おとが でるよ', 'のばす おと', 'できたね！'];
  for (const train of QUIZ_CARDS) {
    expected.push(train.name, praiseText(train));
    for (const c of BASIC_KANA) if (train.name.startsWith(c) || ('をん'.includes(c) && train.name.includes(c))) expected.push(tracePromptText(train, c));
    for (const c of train.name) expected.push(questionText(train, c), hintText(c));
  }
  for (const train of REWARD_TRAINS) expected.push(rewardText(train));
  expected.push(...KANA_ROWS.join('').replaceAll(' ', '').replace('ー', ''));
  for (const text of expected) {
    const file = ANNOUNCEMENT_FILES[text] || VOICE_FILES[text];
    assert.ok(file, text);
    assert.ok(statSync(`assets/voice/${file}`).size > 1000, text);
  }
  const manifest = JSON.parse(readFileSync('assets/voice/lines.json', 'utf8'));
  assert.equal(manifest.lines.find(l => l.text === 'は').spoken, 'ハ。');
  assert.equal(manifest.lines.find(l => l.text === 'っ').spoken, 'ちいさい、ツ。');
});

test('every app phrase has a published Flash-Lite TTS recording', () => {
  assert.deepEqual(Object.keys(ANNOUNCEMENT_FILES).sort(), Object.keys(VOICE_FILES).sort());
  const manifest = JSON.parse(readFileSync('assets/voice/announcements-lite/manifest.json', 'utf8'));
  assert.equal(manifest.model, 'gemini-3.8-flash-lite-tts');
  for (const file of Object.values(ANNOUNCEMENT_FILES)) {
    assert.ok(file.startsWith('announcements-lite/') && file.endsWith('.mp3'));
    assert.ok(statSync(`assets/voice/${file}`).size > 1000, file);
  }
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
  assert.ok(players[1].src.endsWith(ANNOUNCEMENT_FILES['こ'] || VOICE_FILES['こ']));
  assert.equal(players.length, 2);
  const pendingFailure = fail;
  stopVoice();
  pendingFailure(new Error('after mute'));
  await Promise.resolve();
  assert.equal(players[1].paused, true);
  assert.deepEqual(spoken, []);
  playVoice('あ');
  players[2].onerror();
  fail(new Error('same failure reported twice'));
  await Promise.resolve();
  assert.deepEqual(spoken, ['ア。']);
  playVoice('っ');
  players[3].onerror();
  assert.equal(spoken.at(-1), 'ちいさい、ツ。');
  stopVoice();
});

test('initial cues wait for the train name and cancellation never starts a stale letter', async () => {
  const players = [];
  globalThis.Audio = class {
    constructor() { players.push(this); }
    pause() {}
    play() { return Promise.resolve(); }
  };
  const initial = playVoiceSequence(['こまち', 'こ']);
  assert.equal(players.length, 1);
  players[0].onended();
  await Promise.resolve();
  assert.equal(players.length, 1);
  assert.ok(players[0].src.endsWith(ANNOUNCEMENT_FILES['こ'] || VOICE_FILES['こ']));
  players[0].onended();
  assert.equal(await initial, true);
  const cancelled = playVoiceSequence(['こまち', 'こ']);
  stopVoice();
  assert.equal(await cancelled, false);
  assert.equal(players.length, 2);
  const mark = playVoice('ー');
  assert.ok(players[2].src.endsWith(ANNOUNCEMENT_FILES['のばす おと'] || VOICE_FILES['のばす おと']));
  players[2].onended();
  assert.equal(await mark, true);
  stopVoice();
});
