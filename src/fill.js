import { TRAINS } from './data.js';
import { fillIndices, fillAnswer } from './fill-engine.js';
import { questionText, hintText, praiseText } from './voice-lines.js';

export function fillMarkup(state, preferences, rows, failed = false, sound = true) {
  const top = '<div class="fill-top"><button class="quiet" data-action="home">← ホーム</button><span>もじを のせよう</span></div>';
  const warning = failed ? '<p role="status">きろくを ほぞんできませんが、このまま あそべます。</p>' : '';
  if (!state || state.finished) {
    const eligible = TRAINS.filter(t => fillIndices(t, rows, preferences.extras).length);
    return `<main class="fill-play">${top}<section class="fill-picker"><div class="eyebrow">ひとつ のせたら、できあがり！</div><h1>どの でんしゃに のせる？</h1><p>なまえの あいている ところに、もじを ひとつ。<br>5つ できたら、ごほうびの でんしゃ！</p><p class="fill-row-note">${rows.length ? rows.join('・') + 'ぎょう' : 'ぜんぶの ぎょう'}の もじを のせるよ</p><button class="primary" data-fill="random">おまかせで あそぶ →</button><div class="fill-trains">${eligible.map(t => `<button data-fill="choose" data-id="${t.id}"><img loading="lazy" src="./assets/trains/${t.image}" alt=""><b>${t.name}</b></button>`).join('')}</div>${warning}</section></main>`;
  }
  const card = state.cards[state.station], letters = [...card.name], target = letters[card.hole];
  const done = ['celebrate', 'ready'].includes(state.phase), intro = state.phase === 'intro';
  const show = state.level !== 'listen' || !sound || state.helped || done;
  const name = letters.map((c, i) => i === card.hole
    ? `<span class="fill-name-hole ${done ? 'filled' : 'open'} ${state.helped ? 'helped' : ''}" aria-label="${done ? c : show ? 'おてほん ' + c : 'あいている ところ'}">${show ? c : ''}</span>`
    : `<span class="fill-name-letter">${c}</span>`).join('');
  return `<main class="fill-play">${top}<section class="fill-workshop"><div class="fill-progress" aria-label="5もんちゅう ${state.station + (done ? 1 : 0)}もん できたよ">${[0,1,2,3,4].map(i => `<span class="${i < state.station || i === state.station && done ? 'done' : ''}">${i < state.station || i === state.station && done ? '✓' : i + 1}</span>`).join('')}<small>5つで ごほうび</small></div><div class="fill-picture"><img src="./assets/trains/${card.image}" alt="${card.name}のイラスト"></div><div class="fill-full-name" aria-label="${done ? card.name : 'なまえの もじを のせよう'}">${name}</div>
  <p class="fill-instruction" role="status">${done ? 'できたね！' : intro ? 'なまえと もじを きこう ♪' : show ? 'おなじ もじを タッチ' : 'きこえた もじを タッチ'}</p>
  ${done ? `<div class="fill-complete-actions"><button class="primary" data-fill="next" ${state.phase !== 'ready' ? 'disabled' : ''}>${state.station === 4 ? '★ ごほうびの でんしゃ！' : 'つぎの でんしゃ →'}</button><button class="quiet" data-fill="pause" aria-pressed="${!preferences.auto}">${preferences.auto ? 'Ⅱ じどうで すすむのを とめる' : '▶ じどうで すすむ'}</button></div>` : `<div class="fill-options" aria-label="のせる もじ">${card.options.map(c => state.helped && c !== target ? '<span class="fill-option-space" aria-hidden="true"></span>' : `<button data-fill="answer" data-letter="${c}" ${state.phase !== 'answer' ? 'disabled' : ''}>${c}</button>`).join('')}</div><div class="fill-tools"><button class="secondary" data-fill="repeat" ${state.phase !== 'answer' ? 'disabled' : ''}>♪ もういちど</button><button class="secondary" data-fill="help" ${state.phase !== 'answer' ? 'disabled' : ''}>おてつだい</button>${intro ? '<button class="quiet" data-fill="skip">すぐ あそぶ →</button>' : ''}</div>`}${warning}</section></main>`;
}

export function mountFill(root, state, callbacks) {
  let active = true, timer, watchdog;
  const current = () => active && callbacks.isCurrent(state);
  const play = texts => callbacks.sound ? callbacks.sequence(texts) : Promise.resolve(true);
  // A stalled clip must never leave a child waiting for the media timeout.
  async function narrate(texts, finish, minimum = 0) {
    const start = Date.now();
    watchdog = setTimeout(() => { if (current()) callbacks.stop(); }, 12000);
    const heard = await play(texts).catch(() => false);
    clearTimeout(watchdog);
    if (!current()) return;
    if (!heard && state.level === 'listen') state.helped = true;
    timer = setTimeout(() => { if (current()) finish(); }, Math.max(0, minimum - (Date.now() - start)));
  }
  const card = state?.cards?.[state.station], target = card && [...card.name][card.hole];
  if (card && state.phase === 'intro') narrate([questionText(card, target)], () => { state.phase = 'answer'; callbacks.change(); });
  if (card && state.phase === 'hint') narrate([target, hintText(target)], () => { state.phase = 'answer'; callbacks.change(); });
  if (card && state.phase === 'celebrate') {
    narrate([target, praiseText(card)], () => { callbacks.chime(); state.phase = 'ready'; callbacks.change(); }, 1000);
  }
  if (card && state.phase === 'ready' && callbacks.auto) timer = setTimeout(() => { if (current()) callbacks.next(); }, 1000);
  function click(event) {
    const button = event.target.closest('button[data-fill]');
    if (!button || button.disabled) return;
    const action = button.dataset.fill;
    if (action === 'choose') return callbacks.start(button.dataset.id);
    if (action === 'random') return callbacks.start();
    if (!card) return;
    if (action === 'pause') return callbacks.pause();
    if (action === 'next' && state.phase === 'ready') return callbacks.next();
    if (action === 'skip' && state.phase === 'intro') { callbacks.stop(); state.phase = 'answer'; return callbacks.change(); }
    if (state.phase !== 'answer') return;
    if (action === 'repeat') { state.phase = 'intro'; callbacks.change(); }
    if (action === 'help') { state.helped = true; state.phase = 'hint'; callbacks.change(); }
    if (action === 'answer') {
      if (fillAnswer(state, button.dataset.letter)) callbacks.credit(state);
      callbacks.change();
    }
  }
  root.addEventListener('click', click);
  return () => { active = false; clearTimeout(timer); clearTimeout(watchdog); root.removeEventListener('click', click); };
}
