export const TRAINS = [
  { id: 'hayabusa', name: 'はやぶさ', image: 'hayabusa.jpg', color: '#16836d', detail: 'みどりの ながい おはな' },
  { id: 'komachi', name: 'こまち', image: 'komachi.jpg', color: '#cf5961', detail: 'あかくて ぴかぴか' },
  { id: 'kagayaki', name: 'かがやき', image: 'kagayaki.jpg', color: '#5477af', detail: 'あおと きんいろ' },
  { id: 'nozomi', name: 'のぞみ', image: 'n700s_nozomi.png', color: '#467ea6', detail: 'しろい しんかんせん' },
  { id: 'tsubasa', name: 'つばさ', image: 'e8_tsubasa.png', color: '#9466a0', detail: 'むらさきいろの おはな' },
  { id: 'yamanote', name: 'やまのてせん', image: 'yamanote.jpg', color: '#76a247', detail: 'まちを ぐるぐる はしるよ' },
  { id: 'enoden', name: 'えのでん', image: 'enoden.png', color: '#477f61', detail: 'うみの そばを はしるよ' },
  { id: 'tsubame', name: 'つばめ', image: 'kyushu_800_tsubame.png', color: '#b74742', detail: 'しろと あかの しんかんせん' },
  { id: 'azusa', name: 'あずさ', image: 'azusa.webp', color: '#8966a6', detail: 'むらさきの とっきゅう' },
  { id: 'sakura', name: 'さくら', image: 'sakura.webp', color: '#739baa', detail: 'やさしい あおしろの しんかんせん' },
  { id: 'narita-express', name: 'なりたえくすぷれす', image: 'narita-express.webp', color: '#c85253', detail: 'くうこうへ むかう とっきゅう' },
  { id: 'marunouchi', name: 'まるのうちせん', image: 'marunouchi.webp', color: '#c54c4d', detail: 'あかくて まあるい ちかてつ' },
  { id: 'rapit', name: 'らぴーと', image: 'rapit.webp', color: '#456ba4', detail: 'あおい からだに まるい まど' },
  { id: 'wakashio', name: 'わかしお', image: 'wakashio.webp', color: '#5991ac', detail: 'うみへ はしる とっきゅう' },
  { id: 'keikyu', name: 'けいきゅうせん', image: 'keikyu.webp', color: '#c34e4f', detail: 'あかい でんしゃが しゅっぱつ' },
  { id: 'sonic', name: 'そにっく', image: 'sonic.webp', color: '#3976a7', detail: 'あおくて きりっとした とっきゅう' },
  { id: 'nemuro', name: 'ねむろほんせん', image: 'nemuro.webp', color: '#709e57', detail: 'ほっかいどうの ひろい だいちへ' },
  { id: 'hitachi', name: 'ひたち', image: 'hitachi.webp', color: '#b66c86', detail: 'しろい からだに あかい アクセント' },
  { id: 'heisei-chikuho', name: 'へいせいちくほうてつどう', image: 'heisei-chikuho.webp', color: '#a35e4c', detail: 'のどかな まちを はしるよ' },
  { id: 'yufuin', name: 'ゆふいんのもり', image: 'yufuin.webp', color: '#437e57', detail: 'みどりと きんいろの とっきゅう' },
  { id: 'yokosuka', name: 'よこすかせん', image: 'yokosuka.webp', color: '#5984a3', detail: 'あおと クリームいろの でんしゃ' },
];
// A real train scene also supports letters that are awkward in train names.
// These cards credit the pictured Keikyu train in the collection.
export const QUIZ_CARDS = [...TRAINS, ...['いぬ', 'でんしゃをみる'].map((name, i) => ({
  ...TRAINS.find(t => t.id === 'keikyu'), name, image: 'dog-train.webp',
  quizId: `keikyu-scene-${i}`, kind: 'scene', focusLetter: i ? 'を' : 'ぬ',
}))];
export const KANA_ROWS = ['あいうえお','かきくけこ','さしすせそ','たちつてと','なにぬねの','はひふへほ','まみむめも','や ゆ よ','らりるれろ','わ を ん','がぎぐげご','ざじずぜぞ','だぢづでど','ばびぶべぼ','ぱぴぷぺぽ','ぁぃぅぇぉ','ゃゅょっー'];
export const BASIC_KANA = [...KANA_ROWS.slice(0,10).join('').replaceAll(' ', '')];
export const ROWS = KANA_ROWS.slice(0, 10).map(letters => ({ id: letters[0], letters: letters.replaceAll(' ', '') }));
export function normalizeRows(rows) {
  return Array.isArray(rows) ? ROWS.map(r => r.id).filter(id => rows.includes(id)) : [];
}
export function kanaRow(letter) {
  const small = { 'ぁ':'あ', 'ぃ':'い', 'ぅ':'う', 'ぇ':'え', 'ぉ':'お', 'ゃ':'や', 'ゅ':'ゆ', 'ょ':'よ', 'っ':'つ' };
  const base = (small[letter] || letter).normalize('NFD')[0];
  return ROWS.find(row => row.letters.includes(base))?.id;
}
export function targetIndices(train, rows = []) {
  const selected = normalizeRows(rows);
  return [...train.name].flatMap((letter, i) => (!train.focusLetter || letter === train.focusLetter) && (!selected.length || selected.includes(kanaRow(letter))) ? [i] : []);
}
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function makeChoices(letter, count = 2, rows = []) {
  const selected = normalizeRows(rows);
  const pool = BASIC_KANA.filter(c => !selected.length || selected.includes(kanaRow(c)));
  return shuffle([letter, ...shuffle(pool.filter(x => x !== letter)).slice(0, count - 1)]);
}
export function makeJourney(preferredId, rows = [], mode = 'find') {
  const selected = normalizeRows(rows);
  const eligible = QUIZ_CARDS.filter(t => targetIndices(t, rows).length);
  if (!eligible.length) return [];
  const first = eligible.find(t => t.id === preferredId && !t.kind);
  const journey = [], used = new Set();
  let letters = [];
  const add = (train, index) => {
    used.add(train.quizId || train.id);
    journey.push({ ...train, targets: mode === 'connect' ? targetIndices(train, rows) : [index] });
  };
  if (first) add(first, targetIndices(first, rows)[0]);
  while (journey.length < 5) {
    if (!letters.length) letters = shuffle(BASIC_KANA.filter(c => !selected.length || selected.includes(kanaRow(c))));
    const letter = letters.shift();
    const matches = eligible.filter(t => targetIndices(t, rows).some(i => t.name[i] === letter));
    const starting = matches.filter(t => t.name.startsWith(letter));
    const candidates = starting.length ? starting : matches;
    const fresh = candidates.filter(t => !used.has(t.quizId || t.id));
    const train = shuffle(fresh.length ? fresh : candidates)[0];
    add(train, train.name.indexOf(letter));
  }
  return journey;
}
export function readProgress(storage) {
  try {
    const value = JSON.parse(storage.getItem('train-hiragana-v1')) || {};
    return {
      stamps: [...new Set(Array.isArray(value.stamps) ? value.stamps.filter(id => TRAINS.some(t => t.id === id)) : [])],
      trips: Number.isSafeInteger(value.trips) && value.trips >= 0 ? value.trips : 0,
      sound: value.sound !== false,
      level: ['match', 'listen'].includes(value.level) ? value.level : 'match',
      rows: normalizeRows(value.rows),
    };
  } catch { return { stamps: [], trips: 0, sound: true, level: 'match', rows: [] }; }
}
