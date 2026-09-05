import { TRAINS, KANA_ROWS, shuffle, makeChoices, makeJourney, readProgress } from './data.js';
import { showTrainReward, stopTrainReward } from './reward.js';

const root = document.querySelector('#app');
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const progress = readProgress(storage);
let screen = 'home', mode = 'find', journey = [], station = 0, letterIndex = 0, answered = false;
let selectedTrain = 'hayabusa', choices = [], hint = '', wrong = '', savingFailed = false;
let audioContext;
let lastReward;
const icon = (name) => ({ sound: '♪', back: '←', arrow: '→', star: '☆', book: '▤', home: '⌂' }[name]);
const imagePath = t => `./assets/trains/${t.image}`;
function save() {
  try { storage.setItem('train-hiragana-v1', JSON.stringify(progress)); }
  catch { savingFailed = true; }
}
function speak(text) {
  if (!progress.sound || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP'; utterance.rate = .78; utterance.pitch = 1.12;
  const voice = speechSynthesis.getVoices().find(v => v.lang.startsWith('ja'));
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}
function chime() {
  if (!progress.sound) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    [523.25, 659.25, 783.99].forEach((frequency, i) => {
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      const start = audioContext.currentTime + i * .11;
      osc.frequency.value = frequency; osc.type = 'sine';
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.07, start + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + .35);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(start); osc.stop(start + .36);
    });
  } catch { /* The visual celebration also works without audio. */ }
}
function trainSvg(extra = '') {
  return `<svg class="train-art ${extra}" viewBox="0 0 660 240" aria-hidden="true"><defs><linearGradient id="body" x2="0" y2="1"><stop stop-color="#fcfcf5"/><stop offset="1" stop-color="#e3eadd"/></linearGradient></defs><ellipse cx="344" cy="214" rx="285" ry="12" fill="#184e3e" opacity=".1"/><path d="M44 193H615M28 215H642" stroke="#9caf99" stroke-width="4"/><path d="M70 193l-13 22m75-22l-10 22m74-22l-7 22m74-22l-4 22m74-22v22m74-22l4 22m74-22l7 22m74-22l10 22m74-22l13 22" stroke="#a4b5a0" stroke-width="6"/><g class="train-body"><path d="M54 90q0-17 20-17h314q48 0 97 29l124 76q15 14-10 14H72q-18 0-18-18Z" fill="url(#body)" stroke="#d3ddd0" stroke-width="2"/><path d="M54 91q0-18 20-18h314q48 0 97 29l68 42H54Z" fill="#238d79"/><path d="M55 146h501l20 12H55Z" fill="#dd7b96"/><path d="M55 159h523l16 10H55Z" fill="#d2dfd2"/><path d="M421 94q35 7 58 23l34 21h-67l-38-40Z" fill="#264d4b"/><path d="M431 99l40 13" stroke="#91c9b7" stroke-width="4" stroke-linecap="round"/><rect x="78" y="92" width="37" height="35" rx="8" fill="#bce3d7"/><rect x="134" y="92" width="37" height="35" rx="8" fill="#bce3d7"/><rect x="190" y="92" width="37" height="35" rx="8" fill="#bce3d7"/><rect x="246" y="92" width="37" height="35" rx="8" fill="#bce3d7"/><rect x="306" y="87" width="49" height="96" rx="7" fill="none" stroke="#6ca28b" stroke-width="2"/><rect x="316" y="96" width="28" height="31" rx="5" fill="#bce3d7"/><path d="M371 76v114M62 76v110" stroke="#6ca28b" opacity=".6" stroke-width="2"/><ellipse cx="555" cy="174" rx="15" ry="4" fill="#fff8c0"/><text x="87" y="120" fill="#237663" font-size="26" font-weight="bold">あ</text><text x="142" y="120" fill="#237663" font-size="26" font-weight="bold">い</text><text x="198" y="120" fill="#237663" font-size="26" font-weight="bold">う</text><text x="254" y="120" fill="#237663" font-size="26" font-weight="bold">え</text><text x="320" y="120" fill="#237663" font-size="26" font-weight="bold">お</text></g></svg>`;
}
function header() {
  return `<header class="header"><button class="brand" data-action="home" aria-label="ひらがなでんしゃ ホーム"><img src="./assets/icon.svg" alt=""/><span>ひらがな <b>でんしゃ</b></span></button><div class="header-actions"><button class="quiet sound" data-action="sound" aria-label="${progress.sound ? '音を消す' : '音を出す'}" aria-pressed="${progress.sound}">${icon('sound')} <span>おと ${progress.sound ? 'あり' : 'なし'}</span></button><button class="quiet parent" data-action="settings">おうちのかたへ</button></div></header>`;
}
function nav() {
  return `<nav class="bottom-nav" aria-label="メニュー"><button data-action="home" class="${screen === 'home' ? 'active' : ''}"><span>⌂</span>ホーム</button><button data-action="collection" class="${screen === 'collection' ? 'active' : ''}"><span>▤</span>でんしゃ ずかん <small>${progress.stamps.length}/${TRAINS.length}</small></button><button data-action="alphabet" class="${screen === 'alphabet' ? 'active' : ''}"><span>あ</span>あいうえお</button></nav>`;
}
function home() {
  return `<main class="home"><section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> きょうも、もじの たびへ。</div><h1>もじを のせて、<br><em>しゅっぱつ！</em></h1><p>だいすきな でんしゃと、<br>ひらがなに あいに いこう。</p><div class="journey-note"><span>🎫</span> ひとたび 5えき。じぶんの ペースで。</div></div><div class="landscape"><div class="sun"></div><div class="cloud cloud-one"></div><div class="cloud cloud-two"></div><span class="floating-kana kana-ha">は</span><span class="floating-kana kana-ko">こ</span><span class="floating-kana kana-a">あ</span><div class="hill hill-back"></div><div class="hill hill-front"></div><div class="station-sign">ひらがなえき <span>HIRAGANA STATION</span></div>${trainSvg()}<span class="flower flower-one">✳</span><span class="flower flower-two">✳</span></div></section><section class="play-section"><div class="section-heading"><h2>どんな たびに する？</h2><span>すきな あそびを えらんでね</span></div><div class="mode-grid"><button class="mode-card find-card" data-action="start-find"><div class="mode-label">まずは ここから <span>01</span></div><div class="mode-visual"><span class="mini-letter">は</span><span class="dotted-arrow">··· →</span><span class="mini-letter selected">は</span><span class="mini-letter small">こ</span></div><h3>もじを みつけよう <span>↗</span></h3><p>「はやぶさ」の「は」は どれかな？</p><div class="card-footer"><span>おなじ もじを タッチ</span><b>あそぶ →</b></div></button><button class="mode-card connect-card" data-action="start-connect"><div class="mode-label">なれて きたら <span>02</span></div><div class="mode-visual linked"><span class="mini-letter">こ</span><i></i><span class="mini-letter">ま</span><i></i><span class="mini-letter empty">？</span></div><h3>なまえを つなごう <span>↗</span></h3><p>もじの しゃりょうを つなげてみよう。</p><div class="card-footer"><span>ひともじ ずつで だいじょうぶ</span><b>あそぶ →</b></div></button></div></section><section class="ticket" aria-label="旅の記録"><div class="ticket-icon">♧</div><div><h3>きみの でんしゃずかん</h3><p>あそんだ でんしゃが、ずかんに ふえるよ。</p></div><div class="ticket-count"><b>${progress.stamps.length}</b> / ${TRAINS.length}<span>でんしゃ</span></div><button data-action="collection" aria-label="でんしゃずかんを見る">みる <span>→</span></button></section></main>`;
}
function prepare() {
  answered = false; wrong = ''; hint = '';
  const letter = journey[station].name[mode === 'find' ? 0 : letterIndex];
  choices = makeChoices(letter, progress.level === 'match' ? 2 : 3);
}
function start(type, preferredId) {
  stopTrainReward(); lastReward = null;
  mode = type; journey = makeJourney(preferredId); station = 0; letterIndex = 0; screen = 'game'; prepare(); render(); prompt();
}
function reward(replay = false) {
  lastReward = showTrainReward({ train: replay ? lastReward : undefined, sound: progress.sound, speak, onDone: () => {
    if (screen !== 'finish') return;
    document.querySelector('.finish [data-action="home"]')?.focus({ preventScroll: true });
  } });
}
function prompt() {
  const train = journey[station], letter = train.name[mode === 'find' ? 0 : letterIndex];
  speak(`${train.name}。${mode === 'find' ? 'はじめの もじ' : 'つぎの もじ'}、${letter}。${letter} は どれかな？`);
}
function game() {
  const train = journey[station], target = train.name[mode === 'find' ? 0 : letterIndex];
  const showTarget = progress.level === 'match' || hint;
  return `<main class="game"><div class="game-top"><button class="quiet" data-action="home">← えきに もどる</button><span>${mode === 'find' ? 'もじを みつけよう' : 'なまえを つなごう'}</span><b>${station + 1} / 5 えき</b></div><div class="route" aria-label="${station + 1}駅目、全5駅">${journey.map((_, i) => `<span class="${i < station ? 'passed' : i === station ? 'current' : ''}">${i < station ? '✓' : i + 1}</span>`).join('')}</div><section class="game-board"><div class="train-picture"><img src="${imagePath(train)}" alt="${train.name}のイラスト"/><span class="picture-tag" style="--train-color:${train.color}">${train.name}</span></div><div class="question"><span class="eyebrow">${mode === 'find' ? 'はじめの もじは？' : 'もじを じゅんばんに のせよう'}</span><h1>${mode === 'find' ? `${train.name} の <strong>「${showTarget ? target : '？'}」</strong>` : `${train.name} を つくろう`}</h1>${mode === 'connect' ? `<div class="carriages">${[...train.name].map((c, i) => `<span class="carriage ${i < letterIndex || answered ? 'filled' : i === letterIndex ? 'waiting' : ''}">${i < letterIndex || answered ? c : i === letterIndex && showTarget ? `<span class="ghost">${c}</span>` : '・'}</span>`).join('')}</div>` : `<div class="target-letter">${showTarget ? target : '♪'}</div>`}<button class="listen-button" data-action="listen">♪ もういちど きく</button><p class="instruction">${answered ? 'のせられたね！' : showTarget ? 'おなじ もじを タッチしてね' : 'きこえた もじを タッチしてね'}</p><div class="choices">${choices.map(c => `<button class="choice ${wrong === c ? 'try-again' : ''} ${answered && c === target ? 'correct' : ''}" data-action="answer" data-letter="${c}" ${answered ? 'disabled' : ''} aria-label="${c}">${c}</button>`).join('')}</div><div class="feedback ${answered ? 'success' : ''}" role="status" aria-live="polite">${answered ? `✦ ${train.name}、しゅっぱつ！` : hint || 'ゆっくりで だいじょうぶ。'}</div>${answered ? `<button class="primary next-button" data-action="next">${station === 4 ? 'しゅうてんへ' : 'つぎの えきへ'} →</button>` : `<button class="hint-button" data-action="hint">もじを みせて</button>`}</div></section></main>`;
}
function answer(letter) {
  if (screen !== 'game' || answered) return;
  const train = journey[station], target = train.name[mode === 'find' ? 0 : letterIndex];
  if (letter !== target) {
    wrong = letter; hint = `「${target}」を さがしてみよう。`; speak(hint); render(); return;
  }
  wrong = ''; hint = ''; chime();
  if (mode === 'connect' && letterIndex < train.name.length - 1) {
    letterIndex++; prepare(); render(); prompt(); return;
  }
  answered = true;
  if (!progress.stamps.includes(train.id)) progress.stamps.push(train.id);
  if (station === 4) {
    progress.trips++; save(); navigate('finish'); reward(); return;
  }
  save(); render(); speak(`できたね！ ${train.name}！`);
}
function finish() {
  return `<main class="finish"><div class="finish-seal">★</div><div class="eyebrow">5えきの たび、とうちゃく！</div><h1>やったね、<br>すてきな うんてんしゅ！</h1><p>きょうは こんな でんしゃと あそんだよ。</p><div class="earned-trains">${journey.map(t => `<div><img src="${imagePath(t)}" alt=""/><b>${t.name}</b><span>✓</span></div>`).join('')}</div><div class="finish-actions"><button class="primary" data-action="home">えきに もどる ⌂</button><button class="secondary" data-action="collection">ずかんを みる →</button></div><button class="replay-reward" data-action="replay-reward">↻ ごほうびを もういっかい</button><p class="gentle-note">つづきは また こんどでも。おつかれさま！</p></main>`;
}
function collection() {
  return `<main class="library"><div class="page-heading"><div class="eyebrow">きみだけの でんしゃずかん</div><h1>すきな でんしゃ、みつけた？</h1><p>でんしゃを タッチして、なまえを きいてみよう。</p><span class="collection-total">あそんだ でんしゃ <b>${progress.stamps.length} / ${TRAINS.length}</b></span></div><div class="train-grid">${TRAINS.map(t => `<button class="train-card" data-action="train" data-id="${t.id}"><div class="train-thumbnail"><img src="${imagePath(t)}" alt="" loading="lazy"/>${progress.stamps.includes(t.id) ? '<span class="stamp">✓ あそんだよ</span>' : ''}</div><div class="train-card-caption"><b>${t.name}</b><span>♪</span></div><p>${t.detail}</p></button>`).join('')}</div></main>`;
}
function trainDetail() {
  const t = TRAINS.find(t => t.id === selectedTrain);
  return `<main class="train-detail"><button class="quiet" data-action="collection">← ずかんに もどる</button><img class="detail-image" src="${imagePath(t)}" alt="${t.name}のイラスト"/><h1>${t.name}</h1><p>${t.detail}</p><div class="name-letters">${[...t.name].map(c => `<button data-action="kana" data-letter="${c}">${c}</button>`).join('')}</div><div class="finish-actions"><button class="secondary" data-action="train-sound">♪ なまえを きく</button><button class="primary" data-action="train-play">この でんしゃで あそぶ →</button></div></main>`;
}
function alphabet() {
  return `<main class="alphabet"><div class="page-heading"><div class="eyebrow">もじの きっぷうりば</div><h1>あいうえおで あそぼう</h1><p>もじを タッチすると、こえが きこえるよ。</p></div><div class="kana-layout"><div class="kana-board">${KANA_ROWS.map((row, i) => `${i === 10 ? '<h2>てんてん・まるの もじ</h2>' : i === 15 ? '<h2>ちいさい もじ・のばす おと</h2>' : ''}<div class="kana-row">${[...row].map(c => c === ' ' ? '<span></span>' : `<button data-action="kana" data-letter="${c}">${c}</button>`).join('')}</div>`).join('')}</div><aside class="kana-preview"><div class="preview-character" id="preview-character">あ</div><p id="preview-caption" role="status">すきな もじを おしてね</p>${trainSvg()}</aside></div></main>`;
}
function settings() {
  return `<main class="settings"><button class="quiet" data-action="home">← ホームへ</button><h1>おうちのかたへ</h1><p>「好きな電車の名前」を入り口に、文字の形と音に親しむアプリです。最初は一緒に「はやぶさの、は！」と声をかけてみてください。</p><fieldset><legend>あそびの むずかしさ</legend><label><input type="radio" name="level" value="match" ${progress.level === 'match' ? 'checked' : ''}/> <span><b>おなじ文字をみつける（はじめはこちら）</b><small>見本の文字を見ながら、2つの選択肢から選びます。</small></span></label><label><input type="radio" name="level" value="listen" ${progress.level === 'listen' ? 'checked' : ''}/> <span><b>音を聞いてみつける</b><small>大きな文字の見本を隠して3択に。電車名は手がかりとして残ります。ヒントはいつでも表示できます。</small></span></label></fieldset><h2>短い旅を、好きなペースで</h2><p>1回5駅。5問すべて正解すると、ごほうびの電車が走ります。名前の連結では5つの名前を完成させると登場します。制限時間も、減点もありません。1駅ごとに図鑑に記録するので、途中で終わっても大丈夫です。図鑑の電車は最初からすべて見ることができます。</p><h2>音声について</h2><p>端末の日本語読み上げ機能を使います。音が出ない場合は「おと あり」と端末の音量、日本語音声の設定を確認してください。小さい文字や「を」「ぢ」などの読み方は、端末によって異なることがあります。音なしでも文字合わせで遊べます。</p><h2>保存とプライバシー</h2><p>図鑑・設定はこのブラウザ内に保存します。アカウント登録や広告、アクセス解析はありません。履歴を削除すると記録も消えます。${savingFailed ? '<strong>現在、このブラウザでは記録を保存できません。</strong>' : ''}</p><p>完走した旅：${progress.trips}回 ／ あそんだ電車：${progress.stamps.length}種類</p><details><summary>記録をリセットする</summary><p>図鑑の「あそんだよ」と完走回数を消します。設定は残ります。</p><button class="reset-button" data-action="reset">記録を消す</button></details></main>`;
}
function render() {
  const views = { home, game, finish, collection, train: trainDetail, alphabet, settings };
  root.innerHTML = header() + views[screen]() + (screen !== 'game' ? nav() : '') + `<footer>ひらがな でんしゃ <span>きょうも、すきから はじめよう。</span></footer>`;
}
function navigate(next) {
  stopTrainReward();
  window.speechSynthesis?.cancel(); screen = next; render(); window.scrollTo(0, 0);
}
root.addEventListener('click', e => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (['home', 'collection', 'alphabet', 'settings'].includes(action)) return navigate(action);
  if (action === 'sound') { progress.sound = !progress.sound; save(); if (!progress.sound) window.speechSynthesis?.cancel(); render(); if (progress.sound) speak('おとが でるよ'); }
  if (action === 'start-find') start('find');
  if (action === 'start-connect') start('connect');
  if (action === 'listen') { if (!progress.sound) { progress.sound = true; save(); render(); } prompt(); }
  if (action === 'answer') answer(button.dataset.letter);
  if (action === 'replay-reward' && screen === 'finish' && lastReward) reward(true);
  if (action === 'hint') { hint = `「${journey[station].name[mode === 'find' ? 0 : letterIndex]}」を さがしてみよう。`; render(); prompt(); }
  if (action === 'next' && screen === 'game' && answered && station < 4) {
    station++; letterIndex = 0; prepare(); render(); prompt();
  }
  if (action === 'train') { selectedTrain = button.dataset.id; navigate('train'); speak(TRAINS.find(t => t.id === selectedTrain).name); }
  if (action === 'train-sound') speak(TRAINS.find(t => t.id === selectedTrain).name);
  if (action === 'train-play') start('find', selectedTrain);
  if (action === 'kana') {
    const c = button.dataset.letter; speak(c === 'ー' ? 'のばす おと' : c);
    document.querySelectorAll('[data-action="kana"]').forEach(b => b.classList.toggle('playing', b === button));
    const preview = document.querySelector('#preview-character');
    if (preview) {
      preview.textContent = c;
      const train = TRAINS.find(t => t.name.includes(c));
      document.querySelector('#preview-caption').textContent = train ? `${train.name} の「${c}」だね！` : `「${c}」だね！`;
    }
  }
  if (action === 'reset' && window.confirm('図鑑の記録と完走回数を消しますか？')) { progress.stamps = []; progress.trips = 0; save(); render(); }
});
root.addEventListener('change', e => {
  if (e.target.name === 'level') { progress.level = e.target.value; save(); }
});
render();
