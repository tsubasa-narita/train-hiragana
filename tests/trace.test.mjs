import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BASIC_KANA } from '../src/data.js';
import { KANA_STROKES } from '../src/kana-strokes.js';
import { newTrace } from '../src/trace.js';
import { createTracker } from '../src/trace-engine.js';

test('46 kana preserve the source paths in exact stroke order', () => {
  assert.deepEqual(Object.keys(KANA_STROKES), BASIC_KANA);
  for (const c of BASIC_KANA) {
    const svg = readFileSync(new URL(`../vendor/kanjivg/${c.codePointAt(0).toString(16).padStart(5, '0')}.svg`, import.meta.url), 'utf8');
    const source = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(KANA_STROKES[c], source, c);
  }
  assert.equal(KANA_STROKES['よ'].length, 2);
  assert.equal(KANA_STROKES['き'].length, 4);
  assert.equal(KANA_STROKES['さ'].length, 3);
});

test('tracing uses matching initials, varied cards, and canonical selected rows', () => {
  for (const c of BASIC_KANA) {
    const first = newTrace([], c);
    const next = newTrace([], c, { [c]: first.card.image });
    assert.notEqual(first.card.image, next.card.image, c);
    assert.ok(first.card.name.includes(c));
    if (!'をん'.includes(c)) assert.ok(first.card.name.startsWith(c), c);
    assert.equal(first.complete, false);
  }
  assert.deepEqual(newTrace(['や']).letters, ['や', 'ゆ', 'よ']);
  assert.equal(newTrace(['あ'], 'よ').letter, 'あ');
});

const line = Array.from({ length:101 }, (_, i) => ({ x:i, y:0, s:i }));
test('only the current start accepts input; forward drawing advances, reversal does not', () => {
  const t = createTracker(line);
  assert.equal(t.begin({ x:100, y:0 }), false);
  assert.equal(t.move({ x:90, y:0 }), false);
  assert.equal(t.index, 0);
  assert.ok(t.begin({ x:0, y:0 }));
  assert.ok(t.move({ x:40, y:0 }));
  assert.equal(t.index, 40);
  t.move({ x:20, y:0 });
  assert.equal(t.index, 40);
  assert.ok(!t.done);
  assert.ok(t.begin({ x:40, y:0 }));
  t.move({ x:100, y:0 });
  assert.ok(t.done);
});

test('leaving the track requires rejoining the train; lifting preserves progress', () => {
  const t = createTracker(line);
  t.begin(line[0]); t.move({ x:30, y:2 }); t.end();
  assert.equal(t.index, 30);
  assert.equal(t.move(line[60]), false);
  assert.equal(t.begin(line[60]), false);
  t.begin(line[30]); assert.equal(t.move({ x:40, y:25 }), false);
  const saved = t.index;
  assert.equal(t.move(line[100]), false);
  assert.equal(t.index, saved);
  const restored = createTracker(line, saved);
  restored.begin(line[saved]); restored.move(line[100]); assert.ok(restored.done);
});

test('a shortcut across a loop does not complete it, nor does stationary tapping', () => {
  const loop = Array.from({ length:201 }, (_, i) => ({ x:30*Math.cos(i*Math.PI/100), y:30*Math.sin(i*Math.PI/100), s:i*30*Math.PI/100 }));
  const t = createTracker(loop);
  t.begin(loop[0]);
  for (let i=0;i<100;i++) t.move(loop[200]);
  assert.equal(t.index, 0);
  t.move(loop[100]); assert.ok(t.index < 20);
  t.begin(loop[t.index]);
  for (let i=t.index;i<loop.length;i++) t.move(loop[i]);
  assert.ok(t.done);
});
