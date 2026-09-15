import { tracePromptText } from './voice-lines.js';
import { QUIZ_CARDS, ROWS, orderedLetters } from './data.js';
import { KANA_STROKES } from './kana-strokes.js';
import { sampleStroke, createTracker } from './trace-engine.js';

export function newTrace(rows = [], letter, recent = {}) {
  const letters = orderedLetters(rows);
  letter = letters.includes(letter) ? letter : letters[0];
  const matching = QUIZ_CARDS.filter(t => t.name.startsWith(letter));
  const pool = matching.length ? matching : QUIZ_CARDS.filter(t => t.focusLetter === letter || (!t.focusLetter && t.name.includes(letter)));
  const varied = pool.filter(t => t.image !== recent[letter]);
  const cards = varied.length ? varied : pool;
  const card = cards[Math.floor(Math.random() * cards.length)];
  return { rows: [...rows], letters, letter, card, stroke: 0, index: 0, complete: false, completedCards: [], credited: false, rewardPending: false };
}

// The nose points along +x; rotation follows the tangent, even on loops.
const locomotive = `<g class="trace-locomotive"><ellipse cx="0" cy="4.6" rx="7" ry="1.5" fill="#24483f" opacity=".15"/><path d="M-7-3Q-7-5-5-5H1Q4-5 6-2L8 1Q9 3 6 3H-6Q-7 3-7 1Z" fill="#fafdf8" stroke="#226c61" stroke-width=".65"/><path d="M-6-4H1Q3-4 5-1H-6Z" fill="#269889"/><path d="M-6 1H7" stroke="#e692a6" stroke-width="1.1"/><path d="M1-3H3L5-1H1Z" fill="#264e60"/><rect x="-4.5" y="-3" width="2.5" height="2" rx=".5" fill="#c3f3ed"/><circle cx="-4" cy="3.5" r="1.1" fill="#315867"/><circle cx="4" cy="3.5" r="1.1" fill="#315867"/><circle cx="6.5" cy=".1" r=".7" fill="#ffdb7d"/></g>`;

export function traceMarkup(state) {
  const paths = KANA_STROKES[state.letter];
  return `<main class="trace-page"><div class="trace-heading"><div><div class="eyebrow">ゆびで はしる、もじの せんろ</div><h1>なぞって はしろう</h1><p class="trace-heading-clue">${state.card.name} の「${state.letter}」</p></div><button class="quiet" data-action="home">← ホーム</button></div>
    <div class="trace-journey" aria-label="5文字の旅"><b>${(state.completedCards || []).length} / 5 もじ かけたよ</b><span>5もじで ごほうび！</span><button class="quiet" data-trace="prompt">♪ もういちど きく</button></div>
    <section class="trace-picker" aria-label="なぞる文字を選ぶ"><label>ぎょう <select id="trace-row"><option value="" ${!state.rows.length ? 'selected' : ''}>ぜんぶ</option>${state.rows.length > 1 ? '<option value="selected" selected>ホームで えらんだ ぎょう</option>' : ''}${ROWS.map(r => `<option value="${r.id}" ${state.rows.length === 1 && state.rows[0] === r.id ? 'selected' : ''}>${r.letters.join ? r.letters.join('・') : [...r.letters].join('・')}</option>`).join('')}</select></label><div class="trace-letters">${state.letters.map(c => `<button data-trace-letter="${c}" aria-label="${c}をなぞる" aria-pressed="${c === state.letter}">${c}</button>`).join('')}</div></section>
    <div class="trace-layout"><section class="trace-workbench" aria-label="指でなぞる練習"><div class="trace-instruction"><span class="trace-signal"></span><p id="trace-status" role="status" aria-live="polite"></p><span class="trace-count"></span></div>
    <svg class="trace-board" viewBox="0 0 109 109" aria-label="${state.letter}。${paths.length}画。番号の電車から、線に沿って指を動かしてね。" role="img"><defs><pattern id="trace-paper" width="10.9" height="10.9" patternUnits="userSpaceOnUse"><circle cx="5.45" cy="5.45" r=".25" fill="#bdcec8"/></pattern></defs><rect width="109" height="109" rx="7" fill="url(#trace-paper)"/><path d="M54.5 4V105M4 54.5H105" stroke="#dce5dc" stroke-width=".4" stroke-dasharray="1.5 2"/>
      ${paths.map((d, i) => `<path class="trace-guide" data-stroke="${i}" d="${d}"/><path class="trace-ink" data-ink="${i}" d="${d}"/>`).join('')}
      <g class="trace-direction"><path fill="none" stroke="#b66b22" stroke-width="1"/><path class="trace-arrow" d="M-2-2L0 0-2 2" fill="none" stroke="#b66b22" stroke-width="1"/></g><g class="trace-start"><circle r="4.4" fill="#fff4d1" stroke="#cc923f" stroke-width=".6"/><text text-anchor="middle" dy="1.5" font-size="4.2" font-weight="700" fill="#81571d"></text></g><g class="trace-engine">${locomotive}</g>
    </svg><div class="trace-tools"><button class="secondary" data-trace="demo">▷ おてほん</button><button class="quiet" data-trace="reset">↺ はじめから</button></div><p class="trace-tip">でんしゃから、せんに そって ゆびを すべらせよう。<br>ゆびを はなしても、つづきから できるよ。</p></section>
    <aside class="trace-destination"><div class="trace-ticket-top"><span>もじの とうちゃくえき</span><span>🎫</span></div><div class="trace-clue"><b>${state.card.name}</b> の <strong>「${state.letter}」</strong></div><div class="trace-mystery" ${state.complete ? 'hidden' : ''}><div class="trace-secret">？<span>★</span></div><h2>どんな でんしゃかな？</h2><p>じゅんばんに なぞると<br>でんしゃが あらわれるよ。</p><div class="trace-stops" aria-label="書き終えた画数">${paths.map((_, i) => `<span data-stop="${i}">${i + 1}</span>`).join('')}</div></div>
    <div class="trace-arrival" ${state.complete ? '' : 'hidden'}><span class="trace-celebration">★ じょうずに かけたね！ ★</span><img src="./assets/trains/${state.card.image}" alt="${state.card.name}のイラスト"/><h2>${state.card.name}</h2><p>「${state.letter}」えきに とうちゃく！</p><button class="secondary" data-trace="voice">♪ なまえを きく</button><button class="primary" data-trace="next" ${state.rewardPending ? 'disabled' : ''}>${state.rewardPending ? 'ごほうびが くるよ…' : 'つぎの もじへ →'}</button></div></aside></div>
    <details class="trace-parents"><summary>おうちのかたへ・書き順データ</summary><p>清音46文字を、書き順と線の進む方向に沿って練習します。番号の位置から始め、次の線に移るときは指を離してください。少しのはみ出しは大丈夫。急いだり、指を押し付けたりする必要はありません。「おてほん」を一緒に見てから試せます。絵は書き終えるまで表示せず、完成後は自分のペースで次へ進めます。</p><p>書き順・字形：<a href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener">KanjiVG</a> © Ulrich Apel・貢献者（<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>）。SVGの筆画を抽出し、色・電車・案内を加えて表示しています。</p></details></main>`;
}

export function mountTrace(root, state, { change, complete, speak, choose, reset }) {
  const page = root.querySelector('.trace-page'), svg = page.querySelector('.trace-board');
  const guides = [...svg.querySelectorAll('.trace-guide')];
  const inks = [...svg.querySelectorAll('.trace-ink')];
  const samples = guides.map(sampleStroke);
  const engine = svg.querySelector('.trace-engine'), marker = svg.querySelector('.trace-start');
  const direction = svg.querySelector('.trace-direction');
  const status = page.querySelector('#trace-status');
  const demoButton = page.querySelector('[data-trace="demo"]');
  let tracker, pointer = null, frame = 0, demo = false, disposed = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const local = event => new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
  function trainAt(points, i) {
    const p = points[i], a = points[Math.max(0, i - 2)], b = points[Math.min(points.length - 1, i + 2)];
    engine.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI})`);
  }
  function message(text) { if (status.textContent !== text) status.textContent = text; }
  function paint() {
    const finished = state.complete;
    page.classList.toggle('is-complete', finished);
    page.querySelector('.trace-mystery').hidden = finished;
    page.querySelector('.trace-arrival').hidden = !finished;
    page.querySelector('.trace-count').textContent = `${Math.min(state.stroke + 1, guides.length)} / ${guides.length}`;
    guides.forEach((p, i) => p.classList.toggle('current', !finished && i === state.stroke));
    inks.forEach((p, i) => {
      const length = samples[i].at(-1).s;
      p.style.strokeDasharray = `${length} ${length}`;
      p.style.strokeDashoffset = i < state.stroke ? 0 : i === state.stroke ? length - tracker.point.s : length;
    });
    page.querySelectorAll('[data-stop]').forEach((p, i) => p.classList.toggle('done', i < state.stroke));
    engine.style.display = marker.style.display = direction.style.display = finished ? 'none' : '';
    demoButton.disabled = finished;
    if (finished) { message('できたね！ でんしゃが とうちゃく！'); return; }
    const points = samples[state.stroke], first = tracker.point;
    trainAt(points, tracker.index);
    const ahead = points[Math.min(points.length - 1, tracker.index + 22)];
    const before = points[Math.min(points.length - 1, tracker.index + 18)];
    direction.firstElementChild.setAttribute('d', `M${first.x} ${first.y}L${ahead.x} ${ahead.y}`);
    direction.lastElementChild.setAttribute('transform', `translate(${ahead.x} ${ahead.y}) rotate(${Math.atan2(ahead.y - before.y, ahead.x - before.x) * 180 / Math.PI})`);
    marker.setAttribute('transform', `translate(${Math.max(6, Math.min(103, first.x - 5))} ${Math.max(6, first.y - 5)})`);
    marker.querySelector('text').textContent = state.stroke + 1;
  }
  function ready() {
    tracker = state.complete ? null : createTracker(samples[state.stroke], state.index);
    paint();
    if (!state.complete) message(`${state.stroke + 1}ばんの でんしゃから なぞろう`);
  }
  function stopDemo() {
    cancelAnimationFrame(frame); demo = false; demoButton.textContent = '▷ おてほん';
    if (!disposed) ready();
  }
  function release() {
    if (pointer !== null && svg.hasPointerCapture(pointer)) svg.releasePointerCapture(pointer);
    pointer = null; tracker?.end();
  }
  function down(e) {
    if (pointer !== null || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || state.complete) return;
    stopDemo();
    if (!tracker.begin(local(e))) { message('でんしゃの ところから はじめよう'); return; }
    e.preventDefault(); pointer = e.pointerId; svg.setPointerCapture(pointer);
    message('その ちょうし！ せんに そって すすもう');
  }
  function move(e) {
    if (e.pointerId !== pointer) return;
    e.preventDefault();
    const ok = tracker.move(local(e));
    state.index = tracker.index; paint();
    if (!ok) { message('でんしゃの ところから つづけよう'); release(); change(); return; }
    if (tracker.done) {
      release(); state.stroke++; state.index = 0;
      state.complete = state.stroke === guides.length;
      if (state.complete) { paint(); complete(); }
      else { ready(); change(); }
    }
  }
  function up(e) {
    if (e.pointerId !== pointer) return;
    release(); change();
    if (!state.complete) message('でんしゃから つづけられるよ');
  }
  function click(e) {
    const letter = e.target.closest('[data-trace-letter]')?.dataset.traceLetter;
    if (letter) { choose(state.rows, letter); return; }
    const action = e.target.closest('[data-trace]')?.dataset.trace;
    if (action === 'reset') reset();
    if (action === 'voice') speak(state.card.name);
    if (action === 'prompt') speak(tracePromptText(state.card, state.letter));
    if (action === 'next') choose(state.rows, state.letters[(state.letters.indexOf(state.letter) + 1) % state.letters.length]);
    if (action !== 'demo' || state.complete) return;
    release();
    if (demo) { stopDemo(); return; }
    demo = true; demoButton.textContent = '□ おてほんを とめる';
    if (reduced) {
      message(`${state.stroke + 1}ばん。やじるしの ほうへ なぞろう`);
      speak(state.letter); return;
    }
    const points = samples[state.stroke];
    const duration = Math.max(1800, points.at(-1).s * 30);
    let start;
    message(`${state.stroke + 1}ばんの はしりかたを みてね`);
    function tick(time) {
      if (!demo || disposed) return;
      start ??= time;
      const fraction = Math.min(1, (time - start) / duration);
      trainAt(points, Math.floor(fraction * (points.length - 1)));
      if (fraction < 1) frame = requestAnimationFrame(tick);
      else stopDemo();
    }
    frame = requestAnimationFrame(tick);
  }
  const rowChange = e => { if (e.target.id === 'trace-row' && e.target.value !== 'selected') choose(e.target.value ? [e.target.value] : []); };
  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  svg.addEventListener('lostpointercapture', up);
  page.addEventListener('click', click);
  page.addEventListener('change', rowChange);
  ready();
  // Keep the chosen letter visible without scrolling the document on Android.
  const chip = page.querySelector('[aria-pressed="true"]');
  if (chip) chip.parentElement.scrollLeft = Math.max(0, chip.offsetLeft - chip.parentElement.offsetLeft - 50);
  return () => {
    disposed = true; cancelAnimationFrame(frame); release();
    svg.removeEventListener('pointerdown', down); svg.removeEventListener('pointermove', move);
    svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up); svg.removeEventListener('lostpointercapture', up);
    page.removeEventListener('click', click); page.removeEventListener('change', rowChange);
  };
}
