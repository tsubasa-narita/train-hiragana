import { TRAINS } from './data.js';
import { TRAIN_FACTS_A } from './train-facts-a.js';
import { TRAIN_FACTS_B } from './train-facts-b.js';
import { TRAIN_FACTS_C } from './train-facts-c.js';
import { TRAIN_FACTS_D } from './train-facts-d.js';

const FACTS = { ...TRAIN_FACTS_A, ...TRAIN_FACTS_B, ...TRAIN_FACTS_C, ...TRAIN_FACTS_D };

export function trainFacts(card) {
  if (!TRAINS.some(t => t.id === card.id) || !FACTS[card.id]?.length) throw new Error(`Unknown train facts: ${card.id}`);
  return FACTS[card.id];
}

export function trainFactText(card, index = 0) {
  const facts = trainFacts(card);
  return (facts[index] || facts[0]).text;
}

export function trainFactSources(card) {
  return [...new Set(trainFacts(card).map(fact => fact.source))];
}

// Draw once per correct answer. Renders, audio replays and browser history never
// consume another fact. The saved index prevents repeats after reopening the app.
export function pickTrainFact(card, recent = {}, random = Math.random) {
  const facts = trainFacts(card);
  const candidates = facts.map((_, i) => i).filter(i => i !== recent[card.id]);
  const pool = candidates.length ? candidates : facts.map((_, i) => i);
  const index = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  recent[card.id] = index;
  return { ...facts[index], index };
}
