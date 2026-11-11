import { TRAINS, QUIZ_CARDS, shuffle } from './data.js';

// Small kana add another reading rule; introduce them in a later step.
export function wordTrains(length, trains = TRAINS) {
  return trains.filter(train => [...train.name].length === length && /^[ぁ-ゖー]+$/.test(train.name) && !/[ぁぃぅぇぉっゃゅょゎ]/.test(train.name));
}
// A photograph cannot identify the service when both names use the same livery.
// Never ask a child to distinguish those services from the picture alone.
const sharedAppearance = [
  ['あそ', 'ゆふ'], ['あずさ', 'かいじ'], ['ひたち', 'ときわ'],
  ['さくら', 'みずほ'], ['のぞみ', 'こだま', 'ひかり'],
  ['とき', 'つるぎ', 'かがやき', 'たにがわ'], ['わかしお', 'さざなみ'],
];
export function distinguishableWords(a, b) {
  return a.name !== b.name && !sharedAppearance.some(group => group.includes(a.name) && group.includes(b.name));
}
export function readWordPreferences(storage) {
  let value;
  try { value = JSON.parse(storage?.getItem('train-word-v1')) || {}; } catch { value = {}; }
  return { length: [2, 3, 4].includes(value.length) ? value.length : 2, auto: value.auto !== false };
}
export function newWordJourney({ length = 2, stamps = [], recent = [], random = Math.random } = {}) {
  length = [2, 3, 4].includes(length) ? length : 2;
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
    const alternatives = pool.filter(item => distinguishableWords(train, item));
    // Where possible, reading only the initial must not decide the answer.
    const sameInitial = alternatives.filter(item => item.name[0] === train.name[0]);
    const other = shuffle(sameInitial.length ? sameInitial : alternatives, random)[0];
    cards.push({ ...train, options: shuffle([train.name, other.name], random) });
  }
  return { cards, length, station: 0, phase: 'answer', credited: false, helped: false, wrong: '' };
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
  state.station++; state.phase = 'answer'; state.credited = false; state.helped = false; state.wrong = '';
  return true;
}
