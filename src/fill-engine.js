import { TRAINS, QUIZ_CARDS, BASIC_KANA, KANA_ROWS, kanaRow, normalizeRows, shuffle } from './data.js';

export const FILL_LEVELS = ['match', 'guided', 'listen'];
const extraKana = [...KANA_ROWS.slice(10).join('').replaceAll(' ', '')];
// Avoid making tiny marks or closely related shapes the deciding difference.
const similar = ['あお', 'ぬめね', 'はほま', 'わねれ', 'るろ', 'さきち', 'いり', 'つっ', 'しじ', 'うぅ', 'よょ', 'ゆゅ', 'やゃ'];
export function fillIndices(train, rows = [], extras = false) {
  const selected = normalizeRows(rows);
  return [...train.name].flatMap((c, i) => (BASIC_KANA.includes(c) || extras && extraKana.includes(c)) &&
    (!selected.length || selected.includes(kanaRow(c))) ? [i] : []);
}
export function fillOptions(letter, level = 'match', random = Math.random) {
  if (level === 'guided') return [letter];
  const base = letter.normalize('NFD')[0];
  const pool = BASIC_KANA.filter(c => c !== letter && c !== base && !similar.some(group => group.includes(letter) && group.includes(c)));
  return shuffle([letter, shuffle(pool, random)[0]], random);
}
export function newFillJourney({ rows = [], level = 'match', extras = false, recent = {}, preferredId, random = Math.random } = {}) {
  const eligible = TRAINS.filter(t => fillIndices(t, rows, extras).length);
  const pool = shuffle(eligible, random);
  const preferred = pool.findIndex(t => t.id === preferredId);
  if (preferred > 0) pool.unshift(...pool.splice(preferred, 1));
  const cards = [];
  for (let i = 0; i < 5 && pool.length; i++) {
    const base = pool[i % pool.length];
    const variants = QUIZ_CARDS.filter(card => card.id === base.id && !card.kind);
    const train = shuffle(variants.length ? variants : [base], random)[0];
    const indices = fillIndices(train, rows, extras);
    const fresh = indices.filter(index => index !== recent[train.id]);
    const index = shuffle(fresh.length ? fresh : indices, random)[0];
    cards.push({ ...train, hole: index, options: fillOptions([...train.name][index], level, random) });
  }
  return { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, cards, station: 0,
    rows: normalizeRows(rows), level, extras, phase: 'intro', helped: level === 'guided', credited: false };
}
export function fillAnswer(state, letter) {
  if (state.phase !== 'answer') return false;
  const card = state.cards[state.station];
  if (letter !== [...card.name][card.hole]) { state.helped = true; state.phase = 'hint'; return false; }
  state.phase = 'celebrate';
  return true;
}
export function advanceFill(state) {
  if (state.phase !== 'ready' || state.station >= state.cards.length - 1) return false;
  state.station++; state.phase = 'intro'; state.credited = false;
  state.helped = state.level === 'guided';
  return true;
}
export function readFillPreferences(storage) {
  let value;
  try { value = JSON.parse(storage?.getItem('train-fill-v1')) || {}; } catch { value = {}; }
  return { level: FILL_LEVELS.includes(value.level) ? value.level : 'match', extras: value.extras === true,
    auto: value.auto !== false,
    recent: Object.fromEntries(Object.entries(value.recent && typeof value.recent === 'object' ? value.recent : {})
      .filter(([id, index]) => TRAINS.some(t => t.id === id && Number.isInteger(index) && index >= 0 && index < [...t.name].length))),
    completed: Array.isArray(value.completed) ? value.completed.filter(id => typeof id === 'string').slice(-30) : [] };
}
