import { readFile, writeFile } from 'node:fs/promises';
import { BASIC_KANA } from '../src/data.js';

// Offline, deterministic extraction; sources and their pinned revision are in vendor/kanjivg.
const data = {};
for (const letter of BASIC_KANA) {
  const file = letter.codePointAt(0).toString(16).padStart(5, '0');
  const svg = await readFile(new URL(`../vendor/kanjivg/${file}.svg`, import.meta.url), 'utf8');
  data[letter] = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(m => m[1]);
  if (!data[letter].length) throw new Error(`Missing strokes: ${letter}`);
}
await writeFile(new URL('../src/kana-strokes.js', import.meta.url),
  '// Derived from KanjiVG, © Ulrich Apel. CC BY-SA 3.0. See vendor/kanjivg/NOTICE.md.\nexport const KANA_STROKES = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Extracted 46 kana from the vendored KanjiVG SVGs.');
