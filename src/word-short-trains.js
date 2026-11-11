// Historical services are deliberately identified in the book and narration.
export const WORD_SHORT_TRAINS = [
  { id: 'word-aso', name: 'あそ', model: 'JR九州 キハ185系（2020〜2025年の特急あそ）', image: 'word-aso.webp', color: '#bf413d', detail: 'むかし、くまもとから みやじまで はしった とっきゅうだよ。' },
  { id: 'word-yufu', name: 'ゆふ', model: 'JR九州 キハ185系', image: 'word-yufu.webp', color: '#c3463e', detail: 'はかたから ゆふいんを とおって、おおいたや べっぷへ はしるよ。' },
  { id: 'word-noto', name: 'のと', model: 'JR西日本 489系ボンネット形（引退した急行能登）', image: 'word-noto.webp', color: '#a24d47', detail: 'むかし、うえのと かなざわを むすんだ、よるの きゅうこうだよ。' },
  { id: 'word-hana', name: 'はな', model: 'JR東日本 485系 お座敷列車「華」（2022年引退）', image: 'word-hana.webp', color: '#6c477e', detail: 'むかし、かんとうなどを はしった、おざしきの ある でんしゃだよ。' },
];
export const WORD_SHORT_FACTS = {
  'word-aso': [
    { text: 'むかし、くまもとから あそを とおって、みやじまで はしったよ。', places: ['くまもと', 'あそ', 'みやじ'], source: 'https://www.jrkyushu.co.jp/news/__icsFiles/afieldfile/2022/01/25/220125_185kei_hitahiko_miryokuhakken.pdf' },
    { text: 'くまもとの やまへ むかった とっきゅうだよ。いまは おやすみしているよ。', places: ['くまもと'], source: 'https://www.jrkyushu.co.jp/byarea/kumamoto/info/__icsFiles/afieldfile/2024/12/16/20241213kumamoto_1.pdf' },
  ],
  'word-yufu': [
    { text: 'はかたから ゆふいんを とおって、おおいたや べっぷへ はしるよ。', places: ['はかた', 'ゆふいん', 'おおいた', 'べっぷ'], source: 'https://www.jrkyushu.co.jp/news/__icsFiles/afieldfile/2022/01/25/220125_185kei_hitahiko_miryokuhakken.pdf' },
    { text: 'ふくおかと おおいたを むすぶ、とっきゅうだよ。', places: ['ふくおか', 'おおいた'], source: 'https://www.jrkyushu-timetable.jp/sp/2610/0013/00132801.html?d=20261019&t=2874200e' },
  ],
  'word-noto': [
    { text: 'むかし、とうきょうの うえのと、いしかわの かなざわを むすんだよ。', places: ['とうきょう', 'うえの', 'いしかわ', 'かなざわ'], source: 'https://www.toretabi.jp/railway_info/entry-8243.html' },
    { text: 'うえのと かなざわの あいだを、よるに はしった きゅうこうだよ。', places: ['うえの', 'かなざわ'], source: 'https://www.toretabi.jp/railway_info/entry-8243.html' },
  ],
  'word-hana': [
    { text: 'むかし、かわさきから やまなしの こうふへ はしる たびも あったよ。', places: ['かわさき', 'やまなし', 'こうふ'], source: 'https://www.jreast.co.jp/hachioji/info/20140124/20140124_info_01.pdf' },
    { text: 'かんとうなどを たびした、おざしきの ある でんしゃだよ。いまは いんたいしているよ。', places: ['かんとう'], source: 'https://media.jreast.co.jp/articles/155' },
  ],
};
