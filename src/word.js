import { quizImageFile } from './quiz-images.js';
import { wordAnswer, wordTrains } from './word-engine.js';

export function wordHomeCard() {
  return `<button class="mode-card word-card" data-action="start-word"><div class="mode-label">もじから ことばへ <span>NEW</span></div><div class="mode-visual word-preview"><span>こまち</span><span>さくら</span></div><h3>ことばを よもう <span>↗</span></h3><p>この でんしゃの なまえは、どっちかな？</p><div class="card-footer"><span>2もじから、すこしずつ</span><b>あそぶ →</b></div></button>`;
}
export function wordMarkup(state, preferences, sound, failed = false) {
  const top = `<div class="word-top"><button class="quiet" data-action="home">← ホーム</button>${state && !state.finished ? '<button class="quiet" data-word="pick">ながさを かえる</button>' : '<span>ことばを よもう</span>'}</div>`;
  const warning = failed ? '<p role="status">きろくを ほぞんできませんが、このまま あそべます。</p>' : '';
  if (!state || state.finished) return `<main class="word-play">${top}<section class="word-picker"><div class="eyebrow">もじから、ことばの たびへ</div><h1><span>なまえを </span><span>よんでみよう</span></h1><p>でんしゃの えを みて、なまえの きっぷを えらぼう。<br>こまったら、ひともじずつ きけるよ。</p><div class="word-levels" role="group" aria-label="なまえの ながさ">${[[2,'とき','ひだ','まずは ここから'],[3,'こまち','さくら','なれてきたら'],[4,'はやぶさ','かがやき','もうすこし ながく']].map(([length,a,b,note]) => `<button data-word="length" data-length="${length}" aria-pressed="${preferences.length === length}"><small>${note}</small><b>${length}もじ</b><span class="word-examples"><span>${a}</span><span>${b}</span></span><em>${wordTrains(length).length}しゅるい</em></button>`).join('')}</div><button class="primary word-start" data-word="start">${preferences.length}もじで しゅっぱつ →</button><p class="gentle-note">5つ できたら、ごほうびの でんしゃ！</p><details class="word-parent-note"><summary>おうちのかたへ</summary><p>最初は読み上げず、自分で読む時間を作ります。お手伝いで名前が表示され、文字の音を順に聞けます。2文字は「とき」「ひだ」「あそ」「ゆふ」「のと」「はな」の${wordTrains(2).length}種類です。引退した列車も出題します。長さは自動では変わりません。このモードでは行の設定を使わず、名前の長さで出題します。小さい文字を含む名前は出題しません。</p></details>${warning}</section></main>`;
  const card = state.cards[state.station], done = ['celebrate', 'ready'].includes(state.phase);
  return `<main class="word-play">${top}<section class="word-workshop"><div class="word-progress" aria-label="5もんちゅう ${state.station + Number(done)}もん できたよ">${[0,1,2,3,4].map(i => `<span class="${i < state.station || i === state.station && done ? 'done' : ''}">${i < state.station || i === state.station && done ? '✓' : i + 1}</span>`).join('')}<small>${state.length}もじの たび</small></div><div class="word-picture"><img src="./assets/trains/${quizImageFile(card.image)}" alt="なまえを あてる でんしゃの イラスト"></div><h1 class="word-question">${done ? 'よめたね！' : 'この でんしゃの なまえは？'}</h1><p class="word-instruction" role="status">${done ? 'ひともじずつ、つなげて よもう ♪' : state.wrong ? 'もういちど、ゆっくり よんでみよう。' : 'なまえの きっぷを タッチ'}</p><div class="word-options" aria-label="なまえの きっぷ">${card.options.map(name => `<button data-word="answer" data-name="${name}" aria-label="${name}" class="word-ticket ${done && name === card.name ? 'correct' : ''} ${state.wrong === name ? 'retry' : ''}" ${state.phase !== 'answer' ? 'disabled' : ''}>${[...name].map((c,i) => `<span data-word-index="${i}">${c}</span>`).join('')}${done && name === card.name ? '<i aria-hidden="true">✓</i>' : ''}</button>`).join('')}</div>${done ? `<div class="word-complete-actions"><button class="primary" data-word="next" ${state.phase !== 'ready' ? 'disabled' : ''}>${state.station === 4 ? '★ ごほうびの でんしゃ！' : 'つぎの でんしゃ →'}</button><button class="quiet" data-word="pause" aria-pressed="${!preferences.auto}">${preferences.auto ? 'Ⅱ じどうで すすむのを とめる' : '▶ じどうで すすむ'}</button></div>` : `<div class="word-tools">${sound ? `<button class="secondary" data-word="help" ${state.phase === 'hint' ? 'disabled' : ''}>♪ ひともじずつ きく</button>` : '<button class="secondary" data-word="sound">♪ おとを だして きく</button>'}</div>${state.helped ? `<aside class="word-hint"><p>おてつだい：この なまえを よんでみよう</p><div aria-label="おてつだいの なまえ">${[...card.name].map((c,i) => `<button data-word="letter" data-index="${i}" aria-label="${c}を きく" ${!sound ? 'disabled' : ''}>${c}</button>`).join('')}</div>${state.phase === 'hint' ? '<button class="quiet" data-word="skip">じぶんで えらぶ →</button>' : ''}</aside>` : ''}`}${warning}</section></main>`;
}

export function mountWord(root, state, callbacks) {
  let active = true, timer, watchdog, version = 0;
  const current = () => active && callbacks.isCurrent(state);
  const card = state?.cards?.[state.station];
  const wait = ms => new Promise(resolve => { timer = setTimeout(resolve, ms); });
  async function cue(text, minimum = 0) {
    const started = Date.now();
    watchdog = setTimeout(() => { if (current()) callbacks.stop(); }, 4500);
    if (callbacks.sound) await callbacks.speak(text).catch(() => false);
    clearTimeout(watchdog);
    if (current()) await wait(Math.max(0, minimum - (Date.now() - started)));
  }
  async function narrate() {
    const run = ++version;
    const valid = () => current() && version === run;
    const nodes = state.phase === 'celebrate'
      ? root.querySelectorAll('.word-ticket.correct [data-word-index]')
      : root.querySelectorAll('.word-hint [data-word="letter"]');
    for (const [i, letter] of [...card.name].entries()) {
      if (!valid()) return;
      nodes.forEach((node,index) => node.classList.toggle('sounding', index === i));
      await cue(letter, 420);
    }
    if (!valid()) return;
    nodes.forEach(node => node.classList.add('sounding'));
    await cue(card.name, 550);
    if (!valid()) return;
    state.phase = state.phase === 'celebrate' ? 'ready' : 'answer';
    callbacks.change();
  }
  if (card && state.phase === 'hint') root.querySelector?.('.word-hint')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  if (card && ['celebrate', 'hint'].includes(state.phase)) void narrate();
  function scheduleNext() {
    clearTimeout(timer);
    if (card && state.phase === 'ready' && callbacks.auto) timer = setTimeout(() => { if (current()) callbacks.next(); }, 1000);
  }
  scheduleNext();
  function click(event) {
    if (!current()) return;
    const button = event.target.closest('button[data-word]');
    if (!button || button.disabled) return;
    const action = button.dataset.word;
    if (action === 'start') return callbacks.start();
    if (action === 'pick') return callbacks.pick();
    if (action === 'length') return callbacks.length(Number(button.dataset.length));
    if (!card) return;
    if (action === 'pause') {
      callbacks.auto = callbacks.pause();
      button.setAttribute('aria-pressed', String(!callbacks.auto));
      button.textContent = callbacks.auto ? 'Ⅱ じどうで すすむのを とめる' : '▶ じどうで すすむ';
      // Keep the in-progress reading and highlight on their current syllable.
      if (state.phase === 'ready') scheduleNext();
      return;
    }
    if (action === 'sound') return callbacks.enableSound();
    if (action === 'next' && state.phase === 'ready') return callbacks.next();
    if (action === 'skip' && state.phase === 'hint') { callbacks.stop(); state.phase = 'answer'; return callbacks.change(); }
    if (action === 'letter' && callbacks.sound) {
      // A deliberate letter tap cancels the automatic hint and stays on this question.
      callbacks.stop(); state.phase = 'answer'; callbacks.change();
      callbacks.speak([...card.name][Number(button.dataset.index)]);
      return;
    }
    if (state.phase !== 'answer') return;
    if (action === 'help') { callbacks.stop(); state.helped = true; state.phase = 'hint'; callbacks.change(); }
    if (action === 'answer') {
      callbacks.stop();
      if (wordAnswer(state, button.dataset.name)) { callbacks.credit(state); callbacks.chime(); }
      callbacks.change();
    }
  }
  root.addEventListener('click', click);
  return () => { active = false; version++; clearTimeout(timer); clearTimeout(watchdog); root.removeEventListener('click', click); };
}
