import { VOICE_FILES, VOICE_SPOKEN } from './voice-manifest.js';
import { ANNOUNCEMENT_FILES } from './announcement-manifest.js';

let player;
let sequence = 0;
let finishPlayback;

export function stopVoice() {
  sequence++;
  finishPlayback?.(false);
  finishPlayback = null;
  if (player) {
    player.onerror = null;
    player.onended = null;
    player.pause();
  }
  globalThis.speechSynthesis?.cancel();
}

export function playVoice(text) {
  text = text === 'ー' ? 'のばす おと' : text;
  stopVoice();
  const current = sequence;
  return startVoice(text, current);
}

// One request owns the entire sequence; a new tap or navigation cancels it.
export async function playVoiceSequence(texts) {
  stopVoice();
  const current = sequence;
  for (const [index, text] of texts.entries()) {
    if (current !== sequence || !await startVoice(text === 'ー' ? 'のばす おと' : text, current, index > 0)) return false;
  }
  return true;
}

function startVoice(text, current, reuse = false) {
  return new Promise(resolve => {
    let finished = false;
    const finish = result => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      if (finishPlayback === finish) finishPlayback = null;
      resolve(result);
    };
    const timeout = setTimeout(() => {
      if (current === sequence) stopVoice();
      else finish(false);
    }, 20000);
    finishPlayback = finish;
    let usedFallback = false;
    const fallback = () => {
      if (current !== sequence || usedFallback) return;
      if (!globalThis.speechSynthesis) { finish(false); return; }
      usedFallback = true;
      if (player) { player.onended = null; player.pause(); }
      const utterance = new SpeechSynthesisUtterance(VOICE_SPOKEN[text] || text);
      utterance.lang = 'ja-JP'; utterance.rate = .9; utterance.pitch = 1;
      const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'));
      const quality = v => /natural|neural|premium|enhanced/i.test(v.name) ? 2 : /nanami|kyoko|google/i.test(v.name) ? 1 : 0;
      voices.sort((a, b) => quality(b) - quality(a));
      if (voices[0]) utterance.voice = voices[0];
      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);
      speechSynthesis.speak(utterance);
    };
    const file = ANNOUNCEMENT_FILES[text] || VOICE_FILES[text];
    if (!file) { fallback(); return; }
    try {
      // Reuse the user-activated element for queued cues on mobile browsers.
      // Independent taps get a fresh element, isolating interrupted media events.
      player = reuse && player ? player : new Audio();
      player.src = new URL(`../assets/voice/${file}`, import.meta.url).href;
      player.playbackRate = 1;
      player.onerror = fallback;
      player.onended = () => finish(current === sequence);
      player.play().catch(fallback);
    } catch { fallback(); }
  });
}
