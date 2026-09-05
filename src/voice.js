import { VOICE_FILES } from './voice-manifest.js';

let player;
let sequence = 0;

export function stopVoice() {
  sequence++;
  if (player) {
    player.onerror = null;
    player.pause();
  }
  globalThis.speechSynthesis?.cancel();
}

export function playVoice(text) {
  stopVoice();
  const current = sequence;
  let usedFallback = false;
  const fallback = () => {
    if (current !== sequence || usedFallback || !globalThis.speechSynthesis) return;
    usedFallback = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP'; utterance.rate = .9; utterance.pitch = 1;
    const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'));
    const quality = v => /natural|neural|premium|enhanced/i.test(v.name) ? 2 : /nanami|kyoko|google/i.test(v.name) ? 1 : 0;
    voices.sort((a, b) => quality(b) - quality(a));
    if (voices[0]) utterance.voice = voices[0];
    speechSynthesis.speak(utterance);
  };
  const file = VOICE_FILES[text];
  if (!file) { fallback(); return; }
  try {
    player ??= new Audio();
    player.src = new URL(`../assets/voice/${file}`, import.meta.url).href;
    player.playbackRate = 1;
    player.onerror = fallback;
    player.play().catch(fallback);
  } catch { fallback(); }
}
