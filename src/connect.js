import { TRAINS } from './data.js';
import { REWARD_TRAINS } from './reward.js';
import { connectChoices, connectLetter } from './connect-engine.js';
const cutoutFor = t => REWARD_TRAINS.find(r => r.id === t.id);
const picture = t => cutoutFor(t) ? `./assets/rewards/${cutoutFor(t).image}` : `./assets/trains/${t.image}`;
const card = t => `<button class="connect-train" data-connect="choose" data-id="${t.id}"><img src="${picture(t)}" alt="" loading="lazy"><b>${t.name}</b><span>つなぐ →</span></button>`;
function assembly(train, state) {
  if (train.id !== 'komachi') return `<div class="connect-showcase ${cutoutFor(train) ? 'cutout' : 'photo'}"><img src="${picture(train)}" alt="${train.name}"></div>`;
  return `<div class="connect-assembly ${state.phase === 'ready' ? 'assembled' : ''}" aria-label="こまちの しゃりょうが ${state.index}りょう つながったよ"><div class="assembly-lights" aria-hidden="true"></div><span class="assembly-sign">こまち <small>E6</small></span><div class="assembly-belt">${[...train.name].map((letter, i) => `<div class="assembly-car ${i < state.index ? 'coupled' : 'missing'} ${state.joined && i === state.index - 1 ? 'incoming' : ''}" style="--car:${i}"><div class="komachi-sprite sprite-${i}" role="img" aria-label="${i + 1}りょうめ"></div><span class="assembly-letter">${i < state.index ? letter : '・'}</span>${i && i < state.index ? '<i class="assembly-coupler"></i>' : ''}</div>`).join('')}</div><div class="assembly-rail" aria-hidden="true"></div><span class="assembly-caption" aria-hidden="true">${state.phase === 'ready' ? 'こ・ま・ち　れんけつ かんりょう！' : 'もじを のせると、しゃりょうが つながるよ'}</span></div>`;
}
export function connectMarkup(state, garage, storageFailed) {
  const train = TRAINS.find(t => t.id === state?.trainId), completed = state?.completedCards?.length || 0;
  const top = '<div class="connect-top"><button class="quiet" data-action="home">← ホーム</button><span>なまえを つなごう</span><button class="quiet" data-connect="garage">⌂ しゃこ</button></div>';
  const warning = storageFailed ? '<p class="connect-save" role="status">きろくを ほぞんできないけれど、このまま あそべるよ。</p>' : '';
  if (!state || ['garage', 'pick'].includes(state.phase) || !train) {
    const inGarage = state?.phase === 'garage', collected = TRAINS.filter(t => garage.includes(t.id));
    const featured = [TRAINS.find(t => t.id === 'komachi'), ...TRAINS.slice(0, 8).filter(t => t.id !== 'komachi')];
    return `<main class="connect-play">${top}<section class="connect-picker"><span class="eyebrow">${inGarage ? 'きみだけの しゃこ' : 'ひともじずつ、カチャン！'}</span><h1>${inGarage ? 'きみの でんしゃ' : 'どの でんしゃから はじめる？'}</h1><p>${inGarage ? 'でんしゃを タッチして、また つなごう。' : 'なまえを 3つ つなぐと、ごほうびの でんしゃ！'}</p>${state?.resume ? '<button class="primary" data-connect="resume">▶ つづきから</button>' : ''}${inGarage && !collected.length ? '<div class="connect-empty">🚉<p>つくった でんしゃが ここに ならぶよ。</p></div>' : ''}<div class="connect-trains">${(inGarage ? collected : featured).map(card).join('')}</div>${inGarage ? '<button class="secondary" data-connect="pick">ほかの でんしゃを えらぶ</button>' : `<details class="connect-more"><summary>ほかの でんしゃも みる</summary><div class="connect-trains">${TRAINS.slice(8).map(card).join('')}</div></details>`}${warning}</section></main>`;
  }
  const letters = [...train.name], building = state.phase === 'build';
  const cars = `<div class="connect-track" aria-label="${train.name}の しゃりょう">${letters.map((c, i) => `<button class="connect-car ${i < state.index ? 'filled' : 'empty'} ${building && i === state.index ? 'waiting' : ''} ${state.joined && i === state.index - 1 ? 'just-joined' : ''}" data-connect="car" data-letter="${c}" data-index="${i}" aria-label="${i + 1}ばんめ ${c}${i < state.index ? '、つないだよ' : ''}" ${i > state.index && building ? 'disabled' : ''}><span>${i < state.index ? c : i === state.index ? `<span class="connect-ghost">${c}</span>` : '・'}</span><i></i></button>`).join('')}</div>`;
  return `<main class="connect-play" style="--connect-color:${train.color}">${top}<section class="connect-workshop"><div class="connect-progress" aria-label="3もんちゅう ${completed}もん できたよ">${[0, 1, 2].map(i => `<span class="connect-ticket ${i < completed ? 'done' : ''}" aria-hidden="true">${i < completed ? '✓' : i + 1}</span>`).join('')}<span>3つで ごほうび！</span></div><div class="connect-heading"><h1>${building ? `${train.name}を つくろう` : 'つながったね！'}</h1><button class="listen-button" data-connect="name">♪ なまえを きく</button></div>${assembly(train, state)}${cars}
    ${building ? `<div class="connect-instruction" role="status">${state.help ? 'おなじ かたちを みつけよう。' : `「${letters[state.index]}」を つなごう`}</div><div class="connect-tray" aria-label="もじの しゃりょう">${connectChoices(train, state).map(c => `<button class="connect-letter ${state.help && c === letters[state.index] ? 'suggested' : ''}" data-connect="letter" data-letter="${c}">${c}</button>`).join('')}</div><div class="connect-tools"><button class="secondary" data-connect="hint">♪ おてつだい</button><span>タッチでも、はこんでも いいよ</span></div>` : `<div class="connect-ready"><p role="status">${completed >= 3 ? '3つ できたね！ ごほうびが くるよ！' : `${train.name}、できたね！`}</p><button class="primary connect-next" data-connect="next">${completed >= 3 ? '★ ごほうびの でんしゃ！' : 'つぎの でんしゃ →'}</button></div>`}${warning}</section></main>`;
}
export function mountConnect(root, state, callbacks) {
  const { change, choose, pick, garage, resume, next, speak, sound } = callbacks;
  const train = TRAINS.find(t => t.id === state?.trainId);
  let dragged = null, suppressClick = false, clickTimer, finishTimer, context;
  const sounds = new Set();
  function couplingSound() {
    if (!sound) return;
    try {
      context = new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
      [180, 320].forEach((frequency, i) => {
        const oscillator = context.createOscillator(), gain = context.createGain(), now = context.currentTime + i * .06;
        oscillator.type = 'triangle'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.035, now); gain.gain.exponentialRampToValueAtTime(.001, now + .16);
        oscillator.connect(gain); gain.connect(context.destination); oscillator.start(now); oscillator.stop(now + .2);
        sounds.add(oscillator); oscillator.onended = () => { sounds.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Visual feedback still works without audio. */ }
  }
  function answer(letter) {
    if (!train || state.phase !== 'build' || Date.now() < (state.lockedUntil || 0)) return;
    if (!connectLetter(train, state, letter)) { change(); speak(letter); return; }
    state.lockedUntil = Date.now() + 750; state.cue = 'link';
    if (state.phase === 'ready') callbacks.credit(train, state);
    change(); speak(state.phase === 'ready' ? train.name : letter);
  }
  function onClick(event) {
    const button = event.target.closest('[data-connect]');
    if (!button || button.disabled) return;
    if (suppressClick) { suppressClick = false; return; }
    const action = button.dataset.connect;
    if (action === 'choose') return choose(button.dataset.id);
    if (action === 'pick') return pick();
    if (action === 'garage') return garage();
    if (action === 'resume') return resume();
    if (!train) return;
    if (action === 'next' && state.phase === 'ready') return next();
    if (action === 'letter') return answer(button.dataset.letter);
    if (action === 'name') return speak(train.name);
    if (action === 'car') return speak(button.dataset.letter);
    if (action === 'hint' && state.phase === 'build') { state.help = Math.min(2, state.help + 1); change(); speak([...train.name][state.index]); }
  }
  function onDown(event) {
    const button = event.target.closest('[data-connect="letter"]');
    if (!button || event.button !== 0 || !event.isPrimary) return;
    dragged = { button, x: event.clientX, y: event.clientY, moved: false, pointerId: event.pointerId };
    button.setPointerCapture(event.pointerId);
  }
  function onMove(event) {
    if (!dragged || event.pointerId !== dragged.pointerId) return;
    const dx = event.clientX - dragged.x, dy = event.clientY - dragged.y;
    if (Math.hypot(dx, dy) > 9) dragged.moved = true;
    if (dragged.moved) { dragged.button.style.transform = `translate(${dx}px, ${dy}px)`; dragged.button.classList.add('dragging'); }
  }
  function onUp(event) {
    if (!dragged || event.pointerId !== dragged.pointerId) return;
    const { button, moved } = dragged; dragged = null;
    button.style.transform = ''; button.classList.remove('dragging');
    if (!moved || event.type === 'pointercancel') return;
    suppressClick = true; clickTimer = setTimeout(() => { suppressClick = false; }, 0);
    const target = root.querySelector('.connect-car.waiting')?.getBoundingClientRect();
    if (target && event.clientX >= target.left - 40 && event.clientX <= target.right + 40 && event.clientY >= target.top - 45 && event.clientY <= target.bottom + 45) answer(button.dataset.letter);
  }
  root.addEventListener('click', onClick);
  root.addEventListener('pointerdown', onDown); root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp); root.addEventListener('pointercancel', onUp);
  if (state?.cue) { couplingSound(); delete state.cue; callbacks.record(); }
  if (state?.phase === 'ready' && state.completedCards?.length >= 3) finishTimer = setTimeout(next, 1300);
  const track = root.querySelector('.connect-track'), active = root.querySelector('.connect-car.waiting');
  if (track && active) track.scrollLeft = Math.max(0, active.offsetLeft - track.offsetLeft - track.clientWidth / 2 + active.clientWidth / 2);
  const stage = root.querySelector('.connect-assembly'), belt = root.querySelector('.assembly-belt');
  const positionTrain = () => {
    if (!stage || !belt) return;
    const complete = state.phase === 'ready', reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scale = complete && reduced ? Math.min(1, (stage.clientWidth - 24) / 840) : Math.min(1.3, (stage.clientWidth - 32) / 310);
    belt.style.setProperty('--train-start', '16px');
    belt.style.setProperty('--train-end', `${Math.min(16, stage.clientWidth - 16 - 840 * scale)}px`);
    belt.style.setProperty('--train-scale', scale);
    stage.style.setProperty('--rail-top', `${belt.offsetTop + 100 - 20 * scale}px`);
    belt.style.transform = `translateX(${complete ? (stage.clientWidth - 840 * scale) / 2 : 16 - Math.max(0, state.index - 1) * 280 * scale}px) scale(${scale})`;
  };
  positionTrain();
  const observer = stage && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(positionTrain) : null;
  if (stage) observer?.observe(stage);
  return () => {
    clearTimeout(clickTimer); clearTimeout(finishTimer); observer?.disconnect();
    sounds.forEach(oscillator => { try { oscillator.stop(); } catch {} }); context?.close().catch(() => {});
    root.removeEventListener('click', onClick);
    root.removeEventListener('pointerdown', onDown); root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerup', onUp); root.removeEventListener('pointercancel', onUp);
  };
}
