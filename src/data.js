export const TRAINS = [
  { id: 'hayabusa', name: 'はやぶさ', image: 'hayabusa.jpg', color: '#16836d', detail: 'みどりの ながい おはな' },
  { id: 'komachi', name: 'こまち', image: 'komachi.jpg', color: '#cf5961', detail: 'あかくて ぴかぴか' },
  { id: 'kagayaki', name: 'かがやき', image: 'kagayaki.jpg', color: '#5477af', detail: 'あおと きんいろ' },
  { id: 'nozomi', name: 'のぞみ', image: 'n700s_nozomi.png', color: '#467ea6', detail: 'しろい しんかんせん' },
  { id: 'tsubasa', name: 'つばさ', image: 'e8_tsubasa.png', color: '#9466a0', detail: 'むらさきいろの おはな' },
  { id: 'yamanote', name: 'やまのてせん', image: 'yamanote.jpg', color: '#76a247', detail: 'まちを ぐるぐる はしるよ' },
  { id: 'enoden', name: 'えのでん', image: 'enoden.png', color: '#477f61', detail: 'うみの そばを はしるよ' },
  { id: 'tsubame', name: 'つばめ', image: 'kyushu_800_tsubame.png', color: '#b74742', detail: 'しろと あかの しんかんせん' },
];
export const KANA_ROWS = ['あいうえお','かきくけこ','さしすせそ','たちつてと','なにぬねの','はひふへほ','まみむめも','や ゆ よ','らりるれろ','わ を ん','がぎぐげご','ざじずぜぞ','だぢづでど','ばびぶべぼ','ぱぴぷぺぽ','ぁぃぅぇぉ','ゃゅょっー'];
export const BASIC_KANA = [...KANA_ROWS.slice(0,10).join('').replaceAll(' ', '')];
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function makeChoices(letter, count = 2) {
  return shuffle([letter, ...shuffle(BASIC_KANA.filter(x => x !== letter)).slice(0, count - 1)]);
}
export function makeJourney(preferredId) {
  const first = TRAINS.find(t => t.id === preferredId);
  return first ? [first, ...shuffle(TRAINS.filter(t => t !== first)).slice(0, 4)] : shuffle(TRAINS).slice(0, 5);
}
export function readProgress(storage) {
  try {
    const value = JSON.parse(storage.getItem('train-hiragana-v1')) || {};
    return {
      stamps: [...new Set(Array.isArray(value.stamps) ? value.stamps.filter(id => TRAINS.some(t => t.id === id)) : [])],
      trips: Number.isSafeInteger(value.trips) && value.trips >= 0 ? value.trips : 0,
      sound: value.sound !== false,
      level: ['match', 'listen'].includes(value.level) ? value.level : 'match',
    };
  } catch { return { stamps: [], trips: 0, sound: true, level: 'match' }; }
}
