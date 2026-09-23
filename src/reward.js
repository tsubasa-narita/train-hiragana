import { stopVoice } from './voice.js';
import { rewardText } from './voice-lines.js';
export const REWARD_TRAINS = [
  { id: 'hayabusa', name: 'はやぶさ', image: 'reward-hayabusa-v2.webp' },
  { id: 'komachi', name: 'こまち', image: 'reward_train_komachi.png' },
  { id: 'nozomi', name: 'のぞみ', image: 'reward_train_nozomi.png' },
  { id: 'kagayaki', name: 'かがやき', image: 'reward_train_kagayaki.png' },
  { id: 'yamanote', name: 'やまのてせん', image: 'reward_train_yamanote.png' },
  { id: 'doctor-yellow', name: 'どくたーいえろー', image: 'reward_train_doctor_yellow.png' },
  { id: 'azusa', name: 'あずさ', image: 'reward_azusa.webp' },
  { id: 'sakura', name: 'さくら', image: 'reward_sakura.webp' },
  { id: 'narita-express', name: 'なりたえくすぷれす', image: 'reward_narita-express.webp' },
  { id: 'marunouchi', name: 'まるのうちせん', image: 'reward_marunouchi.webp' },
  { id: 'rapit', name: 'らぴーと', image: 'reward-rapit-v2.webp' },
  { id: 'tsubasa', name: 'つばさ', image: 'reward-extra-tsubasa.webp' },
  { id: 'enoden', name: 'えのでん', image: 'reward-extra-enoden.webp' },
  { id: 'sonic', name: 'そにっく', image: 'reward-extra-sonic.webp' },
  { id: 'yufuin', name: 'ゆふいんのもり', image: 'reward-extra-yufuin.webp' },
  { id: 'momotaro', name: 'ももたろう', image: 'reward-extra-momotaro.webp' },
  { id: 'spacia-x', name: 'すぺーしあえっくす', image: 'reward-spacia-x.webp' },
  { id: 'laview', name: 'らびゅー', image: 'reward-laview.webp' },
  { id: 'hinotori', name: 'ひのとり', image: 'reward-hinotori.webp' },
  { id: 'saphir-odoriko', name: 'さふぃーるおどりこ', image: 'reward-saphir-odoriko.webp' },
  { id: 'cassiopeia', name: 'かしおぺあ', image: 'reward-cassiopeia.webp' },
  { id: 'e4-max', name: 'まっくす', image: 'reward-e4-max.webp' },
  { id: 'sunrise', name: 'さんらいず', image: 'reward-sunrise.webp' },
  { id: 'haruka', name: 'はるか', image: 'reward-haruka.webp' },
  { id: 'shiokaze', name: 'しおかぜ', image: 'reward-shiokaze.webp' },
  { id: 'chuo-e233', name: 'ちゅうおうせん', image: 'reward-chuo-e233.webp' },
];
export const REWARD_ROUTES = [
  { id: 'rainbow', name: 'にじの はしを わたろう', start: 'にじに むかって、しゅっぱつ！', middle: 'にじの はしを、すいすい！' },
  { id: 'station', name: 'えきで ひとやすみ', start: 'がたん ごとん、えきへ いこう！', middle: 'とうちゃく！ どうぶつさんに ごあいさつ' },
  { id: 'night', name: 'ほしぞら きゅうこう', start: 'きらきら おほしさまへ、しゅっぱつ！', middle: 'おほしさまが いっぱい！' },
];
let previousRoute;
export function chooseRewardRoute() {
  const candidates = REWARD_ROUTES.filter(route => route.id !== previousRoute);
  const route = candidates[Math.floor(Math.random() * candidates.length)];
  previousRoute = route.id;
  return route;
}
let previousId, activeClose, context;
export function chooseReward() {
  const candidates = REWARD_TRAINS.filter(t => t.id !== previousId);
  const train = candidates[Math.floor(Math.random() * candidates.length)];
  previousId = train.id;
  return train;
}
export function stopTrainReward() { activeClose?.(false); }
export function unlockRewardAudio(enabled) {
  if (!enabled) return;
  try {
    context ??= new (window.AudioContext || window.webkitAudioContext)();
    context.resume().catch(() => {});
  } catch {}
}

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
  // Also unlocked on the start tap, since automatic progression has no user activation.
  unlockRewardAudio(sound);
  const dialog = document.createElement('dialog');
  dialog.className = 'reward-dialog';
  dialog.setAttribute('aria-labelledby', 'reward-title');
  dialog.innerHTML = `<div class="reward-sky"><span class="reward-eyebrow">✦ せいかい！ ごほうび でんしゃ ✦</span><h2 id="reward-title">${train.name} が やってきた！</h2><p class="reward-status" role="status">でんしゃを よんでいるよ…</p><div class="reward-scene"><div class="reward-sun"></div><div class="reward-mountains"></div><div class="reward-track"></div><img class="reward-runner" src="./assets/rewards/${train.image}" alt="${train.name}"/><div class="reward-fallback" hidden>🚄</div><span class="reward-platform">ひらがなえき</span></div></div><div class="reward-controls"><button class="secondary" data-reward="replay" disabled>↻ もういっかい はしる</button><button class="primary" data-reward="continue" autofocus>つづける →</button></div>`;
  document.body.append(dialog);
  const scenery = document.createElement('div');
  scenery.className = 'reward-scenery'; scenery.setAttribute('aria-hidden', 'true');
  scenery.innerHTML = `<div class="reward-rainbow"></div><div class="reward-stars">✦ <i>✧</i> ✦ <i>✧</i> ✦</div><div class="reward-stop"><span class="station-roof"></span><b>ひらがなえき</b><span class="station-friends">🐰 🐻</span></div><div class="reward-sparkles">✧ <i>✦</i> ✧</div>`;
  dialog.querySelector('.reward-scene').append(scenery);
  const routeLabel = document.createElement('p'); routeLabel.className = 'reward-route';
  dialog.querySelector('.reward-status').before(routeLabel);
  const runner = dialog.querySelector('.reward-runner');
  const status = dialog.querySelector('.reward-status');
  const replay = dialog.querySelector('[data-reward="replay"]');
  let timer, phaseTimer, loadTimer, stopSound = () => {}, closed = false, runId = 0;
  const close = (continueGame = true) => {
    if (closed) return;
    closed = true; runId++; clearTimeout(timer); clearTimeout(phaseTimer); clearTimeout(loadTimer); stopSound();
    stopVoice(); dialog.close(); dialog.remove(); activeClose = null;
    if (continueGame) onDone?.();
  };
  activeClose = close;
  const run = () => {
    if (closed) return;
    clearTimeout(timer); clearTimeout(phaseTimer); stopSound();
    dialog.classList.remove('running', 'arrived');
    const route = chooseRewardRoute();
    dialog.dataset.route = route.id; routeLabel.textContent = route.name;
    // Restart the same train when the child chooses to see it again.
    void runner.offsetWidth;
    dialog.classList.add('running');
    status.textContent = route.start;
    replay.disabled = true;
    speak?.(rewardText(train));
    stopSound = playPassSound(sound);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) phaseTimer = setTimeout(() => { if (!closed) status.textContent = route.middle; }, 2100);
    timer = setTimeout(() => {
      if (closed) return;
      dialog.classList.remove('running'); dialog.classList.add('arrived');
      status.textContent = 'かっこいいね！ もういっかい みる？';
      replay.disabled = false; clearTimeout(phaseTimer); stopSound();
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
