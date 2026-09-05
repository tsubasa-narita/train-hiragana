import { stopVoice } from './voice.js';
import { rewardText } from './voice-lines.js';
export const REWARD_TRAINS = [
  { id: 'hayabusa', name: 'はやぶさ', image: 'reward_train_hayabusa.png' },
  { id: 'komachi', name: 'こまち', image: 'reward_train_komachi.png' },
  { id: 'nozomi', name: 'のぞみ', image: 'reward_train_nozomi.png' },
  { id: 'kagayaki', name: 'かがやき', image: 'reward_train_kagayaki.png' },
  { id: 'yamanote', name: 'やまのてせん', image: 'reward_train_yamanote.png' },
  { id: 'doctor-yellow', name: 'どくたーいえろー', image: 'reward_train_doctor_yellow.png' },
];
let previousId, activeClose, context;
export function chooseReward() {
  const candidates = REWARD_TRAINS.filter(t => t.id !== previousId);
  const train = candidates[Math.floor(Math.random() * candidates.length)];
  previousId = train.id;
  return train;
}
export function stopTrainReward() { activeClose?.(false); }

// Quiet rail rumble, rhythmic wheel clicks, and an air rush moving left to right.
function playPassSound(enabled) {
  if (!enabled) return () => {};
  try {
    context ??= new (window.AudioContext || window.webkitAudioContext)();
    context.resume();
    const now = context.currentTime, duration = 5.2;
    const gain = context.createGain(), filter = context.createBiquadFilter();
    const panner = context.createStereoPanner?.();
    gain.gain.setValueAtTime(.001, now);
    gain.gain.exponentialRampToValueAtTime(.12, now + 2);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    if (panner) {
      gain.connect(panner); panner.connect(context.destination);
      panner.pan.setValueAtTime(-1, now); panner.pan.linearRampToValueAtTime(1, now + duration);
    } else gain.connect(context.destination);
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      const beat = (i / context.sampleRate) % .36;
      samples[i] = (Math.random() * 2 - 1) * (beat < .025 || (beat > .10 && beat < .125) ? .9 : .23);
    }
    const noise = context.createBufferSource(); noise.buffer = buffer;
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 2.5);
    filter.frequency.linearRampToValueAtTime(220, now + duration);
    noise.connect(filter); filter.connect(gain); noise.start(now); noise.stop(now + duration);
    return () => { try { noise.stop(); } catch {} gain.disconnect(); panner?.disconnect(); };
  } catch { return () => {}; }
}

export function showTrainReward({ train = chooseReward(), sound = true, speak, onDone } = {}) {
  stopTrainReward();
  // Unlock audio during the answer tap, before awaiting the image on iOS.
  if (sound) {
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
    } catch {}
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'reward-dialog';
  dialog.setAttribute('aria-labelledby', 'reward-title');
  dialog.innerHTML = `<div class="reward-sky"><span class="reward-eyebrow">✦ せいかい！ ごほうび でんしゃ ✦</span><h2 id="reward-title">${train.name} が やってきた！</h2><p class="reward-status" role="status">でんしゃを よんでいるよ…</p><div class="reward-scene"><div class="reward-sun"></div><div class="reward-mountains"></div><div class="reward-track"></div><img class="reward-runner" src="./assets/rewards/${train.image}" alt="${train.name}"/><div class="reward-fallback" hidden>🚄</div><span class="reward-platform">ひらがなえき</span></div></div><div class="reward-controls"><button class="secondary" data-reward="replay" disabled>↻ もういっかい はしる</button><button class="primary" data-reward="continue" autofocus>つづける →</button></div>`;
  document.body.append(dialog);
  const runner = dialog.querySelector('.reward-runner');
  const status = dialog.querySelector('.reward-status');
  const replay = dialog.querySelector('[data-reward="replay"]');
  let timer, loadTimer, stopSound = () => {}, closed = false, runId = 0;
  const close = (continueGame = true) => {
    if (closed) return;
    closed = true; runId++; clearTimeout(timer); clearTimeout(loadTimer); stopSound();
    stopVoice(); dialog.close(); dialog.remove(); activeClose = null;
    if (continueGame) onDone?.();
  };
  activeClose = close;
  const run = () => {
    if (closed) return;
    clearTimeout(timer); stopSound();
    dialog.classList.remove('running', 'arrived');
    // Restart the same train when the child chooses to see it again.
    void runner.offsetWidth;
    dialog.classList.add('running');
    status.textContent = 'がたん ごとん、しゅっぱつ！';
    replay.disabled = true;
    speak?.(rewardText(train));
    stopSound = playPassSound(sound);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer = setTimeout(() => {
      if (closed) return;
      dialog.classList.remove('running'); dialog.classList.add('arrived');
      status.textContent = 'かっこいいね！ もういっかい みる？';
      replay.disabled = false; stopSound();
    }, reduced ? 1200 : 5400);
  };
  const loadId = ++runId;
  let loaded = false;
  const ready = (failed = false) => {
    if (closed || loadId !== runId || loaded) return;
    loaded = true; clearTimeout(loadTimer);
    if (failed) {
      runner.hidden = true; dialog.querySelector('.reward-fallback').hidden = false;
    }
    run();
  };
  runner.decode().then(() => ready()).catch(() => ready(true));
  loadTimer = setTimeout(() => ready(true), 5000);
  dialog.querySelector('[data-reward="continue"]').onclick = () => close();
  replay.onclick = run;
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.showModal();
  return train;
}
