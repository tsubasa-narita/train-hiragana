import { stopVoice } from './voice.js';
import { rewardText } from './voice-lines.js';
import { BOOK_REWARD_TRAINS } from './book-rewards.js';
import { rewardTrainMarkup } from './reward-trains.js';
import { sceneryMarkup } from './reward-scene.js';
import { rewardModelMarkup, REWARD_MODEL_ASSETS } from './reward-models.js';
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
  ...BOOK_REWARD_TRAINS,
];
// Explicit identities avoid guessing from names or linking a different train.
export const REWARD_BOOK_IDS = Object.freeze({
  hayabusa: 'hayabusa', komachi: 'komachi', nozomi: 'nozomi', kagayaki: 'kagayaki',
  yamanote: 'yamanote', 'doctor-yellow': 'doctor-yellow', azusa: 'azusa', sakura: 'sakura',
  'narita-express': 'narita-express', marunouchi: 'marunouchi', rapit: 'rapit', tsubasa: 'tsubasa',
  enoden: 'enoden', sonic: 'sonic', yufuin: 'yufuin', momotaro: 'momotaro', 'spacia-x': 'spacia-x',
  laview: 'laview', hinotori: 'hinotori', 'saphir-odoriko': 'saphir-odoriko', cassiopeia: 'cassiopeia',
  'e4-max': 'e4-max', sunrise: 'sunrise', haruka: 'haruka', 'chuo-e233': 'chuo',
  'reward-book-urbanliner': 'book-urbanliner', 'reward-book-shinano': 'book-shinano',
  'reward-book-hida': 'book-hida', 'reward-book-lilac': 'book-lilac',
  'reward-book-aoniyoshi': 'book-aoniyoshi', 'reward-book-seven-stars': 'book-nanatsuboshi',
  'reward-book-shikishima': 'book-shikishima', 'reward-book-royal-express': 'book-royal-express',
  'reward-book-west-express-ginga': 'book-west-express-ginga',
  'reward-book-resort-shirakami': 'book-resort-shirakami',
});
export function rewardBookId(train, trains) {
  const id = Object.hasOwn(REWARD_BOOK_IDS, train?.id) ? REWARD_BOOK_IDS[train.id] : null;
  return trains.some(item => item.id === id) ? id : null;
}
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

export function showTrainReward({ train = chooseReward(), sound = true, speak, onDone, onBook } = {}) {
  stopTrainReward();
  // Also unlocked on the start tap, since automatic progression has no user activation.
  unlockRewardAudio(sound);
  const model = REWARD_MODEL_ASSETS[train.id];
  const trainVisual = rewardModelMarkup(train) || rewardTrainMarkup(train);
  const fallbackVisual = (rewardTrainMarkup(train) || rewardTrainMarkup({ id: 'nozomi', name: 'でんしゃ' })).replace('reward-runner', 'reward-fallback-train');
  const dialog = document.createElement('dialog');
  dialog.className = 'reward-dialog';
  dialog.setAttribute('aria-labelledby', 'reward-title');
  dialog.innerHTML = `<div class="reward-sky"><span class="reward-eyebrow">✦ せいかい！ ごほうび でんしゃ ✦</span><h2 id="reward-title">${train.name} が やってきた！</h2><p class="reward-status" role="status">しゅっぱつを おしてね！</p><div class="reward-scene">${trainVisual || `<img class="reward-runner" src="./assets/rewards/${train.image}" alt="${train.name}"/>`}<div class="reward-fallback" hidden>${fallbackVisual}</div><button class="reward-touch" data-reward="touch" aria-label="でんしゃを タッチ" hidden></button></div></div><div class="reward-controls"><button class="primary" data-reward="start" autofocus>🚃 しゅっぱつ！</button><button class="primary" data-reward="replay" hidden>↻ もういちど！</button><button class="secondary" data-reward="book" hidden>📖 この でんしゃを ずかんで みる</button><button class="secondary" data-reward="continue">つづける →</button></div>`;
  document.body.append(dialog);
  dialog.querySelector('.reward-scene').insertAdjacentHTML('beforeend', sceneryMarkup());
  const routeLabel = document.createElement('p'); routeLabel.className = 'reward-route';
  dialog.querySelector('.reward-status').before(routeLabel);
  const runner = dialog.querySelector('.reward-runner');
  const status = dialog.querySelector('.reward-status');
  const replay = dialog.querySelector('[data-reward="replay"]');
  const start = dialog.querySelector('[data-reward="start"]');
  const book = dialog.querySelector('[data-reward="book"]');
  const touch = dialog.querySelector('[data-reward="touch"]');
  dialog.dataset.route = 'rainbow';
  routeLabel.textContent = 'しゅっぱつ しんこう！';
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
    status.textContent = `${route.start} でんしゃを タッチしてね！`;
    start.hidden = true; replay.hidden = true; book.hidden = true; touch.hidden = false;
    speak?.(rewardText(train));
    stopSound = playPassSound(sound);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) phaseTimer = setTimeout(() => { if (!closed) status.textContent = route.middle; }, 2100);
    timer = setTimeout(() => {
      if (closed) return;
      dialog.classList.remove('running'); dialog.classList.add('arrived');
      status.textContent = 'とうちゃく！ たのしかったね！';
      replay.hidden = false; book.hidden = false; touch.hidden = true; clearTimeout(phaseTimer); stopSound();
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
  };
  if (model) {
    const image = new Image();
    image.src = new URL(`../assets/rewards/sideview/${model.file}`, import.meta.url).href;
    image.decode().then(() => ready()).catch(() => ready(true));
  } else if (trainVisual) Promise.resolve().then(() => ready());
  else runner.decode().then(() => ready()).catch(() => ready(true));
  loadTimer = setTimeout(() => ready(true), 5000);
  dialog.querySelector('[data-reward="continue"]').onclick = () => close();
  start.onclick = run;
  replay.onclick = run;
  touch.onclick = () => {
    if (!dialog.classList.contains('running')) return;
    status.textContent = 'ぽーっ！ しゅっしゅっ！';
    if (!sound) return;
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
      const oscillator = context.createOscillator(), gain = context.createGain(), now = context.currentTime;
      oscillator.frequency.setValueAtTime(440, now); gain.gain.setValueAtTime(.08, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .35);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(now); oscillator.stop(now + .35);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch {}
  };
  book.onclick = () => { close(false); onBook?.(train); };
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.showModal();
  return train;
}
