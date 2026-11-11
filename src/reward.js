import { playVoiceSequence, stopVoice } from './voice.js';
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
export function rewardLetters(mode, journey) {
  return journey.map(card => {
    const letters = [...card.name];
    if (mode === 'trace') return card.reviewLetter ?? card.focusLetter;
    if (mode === 'fill') return letters[card.hole];
    if (mode === 'connect') return letters.at(-1);
    return letters[card.targets?.[0]];
  }).filter(letter => /^[ぁ-ゖー]$/.test(letter));
}
export const REWARD_ROUTES = [
  { id: 'rainbow', name: 'にじの はしを わたろう', start: 'にじに むかって、しゅっぱつ！', middle: 'にじの はしを、すいすい！' },
  { id: 'station', name: 'えきで ひとやすみ', start: 'がたん ごとん、えきへ いこう！', middle: 'えきが みえてきたよ！' },
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
    context.resume().catch(() => {});
    const now = context.currentTime, duration = 5.2;
    const gain = context.createGain(), filter = context.createBiquadFilter();
    const panner = context.createStereoPanner?.();
    gain.gain.setValueAtTime(.001, now);
    gain.gain.exponentialRampToValueAtTime(.025, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(.15, now + 3.95);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    if (panner) {
      gain.connect(panner); panner.connect(context.destination);
      panner.pan.setValueAtTime(-1, now); panner.pan.linearRampToValueAtTime(1, now + duration);
    } else gain.connect(context.destination);
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      const time = i / context.sampleRate;
      const beat = (time * 2.4 + .48 * time * time) % 1;
      samples[i] = (Math.random() * 2 - 1) * (beat < .06 || (beat > .30 && beat < .37) ? .9 : .23);
    }
    const noise = context.createBufferSource(); noise.buffer = buffer;
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(1600, now + 3.95);
    filter.frequency.linearRampToValueAtTime(220, now + duration);
    noise.connect(filter); filter.connect(gain); noise.start(now); noise.stop(now + duration);
    return () => { try { noise.stop(); } catch {} gain.disconnect(); panner?.disconnect(); };
  } catch { return () => {}; }
}

export function showTrainReward({ train = chooseReward(), letters = [], words = [], sound = true, speak, onDone, onBook } = {}) {
  stopTrainReward();
  // Also unlocked on the start tap, since automatic progression has no user activation.
  unlockRewardAudio(sound);
  const model = REWARD_MODEL_ASSETS[train.id];
  const trainVisual = rewardModelMarkup(train) || rewardTrainMarkup(train);
  const fallbackVisual = (rewardTrainMarkup(train) || rewardTrainMarkup({ id: 'nozomi', name: 'でんしゃ' })).replace('reward-runner', 'reward-fallback-train');
  const dialog = document.createElement('dialog');
  dialog.className = 'reward-dialog';
  dialog.setAttribute('aria-labelledby', 'reward-title');
  const wordReview = words.filter(word => /^[ぁ-ゖー]{2,4}$/.test(word)).slice(0, 5);
  const review = wordReview.length ? wordReview : letters.filter(letter => /^[ぁ-ゖー]$/.test(letter)).slice(0, 5);
  const reviewLabel = wordReview.length ? 'きょう よんだ なまえ' : 'きょうの もじ';
  if (wordReview.length) dialog.classList.add('reward-word-review');
  dialog.innerHTML = `<header class="reward-heading">
    <span class="reward-eyebrow">✦ ごほうび でんしゃ ✦</span>
    <h2 id="reward-title">${train.name}</h2>
  </header>
  <div class="reward-scene">
    ${sceneryMarkup()}
    <div class="reward-signal" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="reward-train-shot">
      ${trainVisual || `<img class="reward-runner" src="./assets/rewards/${train.image}" alt="${train.name}"/>`}
      <div class="reward-fallback" hidden>${fallbackVisual}</div>
    </div>
    <div class="reward-boarding" aria-hidden="true">${review.map((letter, index) => `<span style="--ticket-index:${index};--ticket-offset:${index - (review.length - 1) / 2}">${letter}</span>`).join('')}</div>
    <div class="reward-horn" aria-hidden="true">ぽーっ！</div>
    <button class="reward-touch" data-reward="touch" aria-hidden="true" tabindex="-1" hidden></button>
    <p class="reward-status" role="status">${wordReview.length ? 'なまえの きっぷを のせよう！' : 'もじを のせて しゅっぱつ！'}</p>
  </div>
  ${review.length ? `<section class="reward-review" aria-label="${reviewLabel}">
    <div class="reward-review-label"><b>${reviewLabel}</b>${sound ? '<button data-reward="listen">♪ ぜんぶ きく</button>' : ''}</div>
    <div class="reward-tickets">${review.map((letter, index) => `<button class="reward-ticket" data-reward-letter="${letter}" style="--ticket-index:${index}">${letter}</button>`).join('')}</div>
  </section>` : ''}
  <div class="reward-controls">
    <button class="reward-launch" data-reward="start" autofocus>🚆 しゅっぱつ！</button>
    <button class="reward-launch" data-reward="horn" aria-label="きてきを ならす" hidden>♪ ぽーっ！</button>
    <button class="reward-launch" data-reward="replay" hidden>↻ もういちど！</button>
    <button class="reward-secondary" data-reward="book" aria-label="この でんしゃを ずかんで みる" hidden>▤ ずかんへ</button>
    <button class="reward-secondary" data-reward="continue">おしまい →</button>
  </div>`;
  document.body.append(dialog);
  const runner = dialog.querySelector('.reward-runner');
  const status = dialog.querySelector('.reward-status');
  const replay = dialog.querySelector('[data-reward="replay"]');
  const start = dialog.querySelector('[data-reward="start"]');
  const book = dialog.querySelector('[data-reward="book"]');
  const touch = dialog.querySelector('[data-reward="touch"]');
  const horn = dialog.querySelector('[data-reward="horn"]');
  let route = chooseRewardRoute();
  dialog.dataset.route = route.id;
  let timer, phaseTimer, loadTimer, hornTimer, stopSound = () => {}, closed = false;
  let runningMessage;
  const close = (continueGame = true) => {
    if (closed) return;
    closed = true; clearTimeout(timer); clearTimeout(phaseTimer); clearTimeout(loadTimer); clearTimeout(hornTimer); stopSound();
    stopVoice(); dialog.close(); dialog.remove(); activeClose = null;
    if (continueGame) onDone?.();
  };
  activeClose = close;
  const run = () => {
    if (closed || dialog.classList.contains('running')) return;
    clearTimeout(timer); clearTimeout(phaseTimer); stopSound();
    if (dialog.classList.contains('arrived')) route = chooseRewardRoute();
    dialog.classList.remove('arrived', 'honking');
    dialog.dataset.route = route.id;
    dialog.classList.add('running');
    runningMessage = route.start;
    status.textContent = runningMessage;
    start.hidden = true; replay.hidden = true; book.hidden = true; touch.hidden = false; horn.hidden = false;
    horn.focus({ preventScroll: true });
    speak?.(rewardText(train));
    stopSound = playPassSound(sound);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) phaseTimer = setTimeout(() => {
      runningMessage = route.middle;
      if (!closed && !dialog.classList.contains('honking')) status.textContent = runningMessage;
    }, 2100);
    timer = setTimeout(() => {
      if (closed) return;
      dialog.classList.remove('running', 'honking'); dialog.classList.add('arrived');
      status.textContent = '★ とうちゃく！ ★';
      const focusReplay = document.activeElement === horn || document.activeElement === touch;
      replay.hidden = false; book.hidden = false; touch.hidden = true; horn.hidden = true;
      clearTimeout(phaseTimer); clearTimeout(hornTimer); stopSound();
      if (focusReplay) replay.focus({ preventScroll: true });
    }, reduced ? 1200 : 5300);
  };
  let loaded = false;
  const ready = (failed = false) => {
    if (closed || loaded) return;
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
  for (const ticket of dialog.querySelectorAll('[data-reward-letter]')) {
    ticket.onclick = () => {
      if (sound) speak?.(ticket.dataset.rewardLetter);
      ticket.classList.add('collected');
    };
  }
  const listen = dialog.querySelector('[data-reward="listen"]');
  if (listen) listen.onclick = () => playVoiceSequence(review);
  touch.onclick = horn.onclick = () => {
    if (!dialog.classList.contains('running') || dialog.classList.contains('honking')) return;
    status.textContent = 'ぽーっ！ しゅっしゅっ！';
    dialog.classList.add('honking');
    hornTimer = setTimeout(() => {
      dialog.classList.remove('honking');
      status.textContent = runningMessage;
    }, 560);
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
