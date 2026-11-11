import { TRAINS, QUIZ_CARDS, shuffle } from './data.js';

// Small kana add another reading rule; introduce them in a later step.
export function wordTrains(length, trains = TRAINS) {
  return trains.filter(train => [...train.name].length === length && /^[ぁ-ゖー]+$/.test(train.name) && !/[ぁぃぅぇぉっゃゅょゎ]/.test(train.name));
}
export function wordOptions(train, length, count = 3, random = Math.random) {
  count = count === 4 ? 4 : 3;
  const alternatives = wordTrains(length).filter(item => item.name !== train.name);
  // Put similar beginnings first so the entire spoken name matters.
  const sameInitial = shuffle(alternatives.filter(item => item.name[0] === train.name[0]), random);
  const others = shuffle(alternatives.filter(item => item.name[0] !== train.name[0]), random);
  const names = [...new Set([train.name, ...sameInitial.map(t => t.name), ...others.map(t => t.name)])];
  return shuffle(names.slice(0, count), random);
}
export function readWordPreferences(storage) {
  let value;
  try { value = JSON.parse(storage?.getItem('train-word-v1')) || {}; } catch { value = {}; }
  return { length: [2, 3, 4].includes(value.length) ? value.length : 2, choices: value.choices === 4 ? 4 : 3, auto: value.auto !== false };
}
export function newWordJourney({ length = 2, choices = 3, stamps = [], recent = [], random = Math.random } = {}) {
  length = [2, 3, 4].includes(length) ? length : 2;
  choices = choices === 4 ? 4 : 3;
  const pool = wordTrains(length);
  const cards = [];
  for (let i = 0; i < 5; i++) {
    const used = cards.map(card => card.id);
    const candidates = shuffle(pool.filter(train => train.id !== cards.at(-1)?.id), random);
    candidates.sort((a, b) => (used.includes(a.id) - used.includes(b.id)) ||
      (stamps.includes(a.id) - stamps.includes(b.id)) || (recent.includes(a.id) - recent.includes(b.id)));
    const base = candidates[0];
    const variants = QUIZ_CARDS.filter(card => card.id === base.id && !card.kind);
    const train = shuffle(variants.length ? variants : [base], random)[0];
    cards.push({ ...train, options: wordOptions(train, length, choices, random) });
  }
  return { version: 2, cards, length, choices, station: 0, phase: 'intro', credited: false, helped: false, wrong: '' };
}
export function restoreWordJourney(state, choices = 3) {
  if (!state || state.version === 2) return state;
  state.choices = choices === 4 ? 4 : 3;
  for (const card of state.cards) card.options = wordOptions(card, state.length, state.choices);
  if (['intro', 'answer', 'hint'].includes(state.phase)) {
    state.phase = 'intro'; state.helped = false; state.wrong = '';
  }
  state.version = 2;
  return state;
}
export function wordAnswer(state, name) {
  if (state.phase !== 'answer') return false;
  const card = state.cards[state.station];
  if (!card.options.includes(name)) return false;
  if (name !== card.name) { state.wrong = name; return false; }
  state.wrong = ''; state.phase = 'celebrate';
  return true;
}
export function advanceWord(state) {
  if (state.phase !== 'ready' || state.station >= state.cards.length - 1) return false;
  state.station++; state.phase = 'intro'; state.credited = false; state.helped = false; state.wrong = ''; state.audioFailed = false;
  return true;
}
