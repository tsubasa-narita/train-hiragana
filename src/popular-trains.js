// Vehicle references and selection rationale: docs/popular-trains-20261109.md.
export const POPULAR_TRAINS = [
  { id: 'popular-blue-symphony', name: 'あおのしんふぉにー', model: '近鉄16200系 青の交響曲', image: 'popular-blue-symphony.webp', color: '#263c68', detail: 'おおさかと よしのを むすぶ とっきゅうだよ' },
  { id: 'popular-kawasemi-yamasemi', name: 'かわせみやませみ', model: 'JR九州 キハ47形 かわせみ やませみ', image: 'popular-kawasemi-yamasemi.webp', color: '#418b93', detail: 'くまもとを はしる かんこうれっしゃだよ' },
  { id: 'popular-ibusuki', name: 'いぶすきのたまてばこ', model: 'JR九州 キハ47形 指宿のたまて箱', image: 'popular-ibusuki.webp', color: '#55545b', detail: 'かごしまと いぶすきを むすぶよ' },
  { id: 'popular-futatsuboshi', name: 'ふたつぼしよんまるよんなな', model: 'JR九州 ふたつ星4047', image: 'popular-futatsuboshi.webp', color: '#c8aa6a', detail: 'さがと ながさきを むすぶよ' },
  { id: 'popular-umisachi', name: 'うみさちやまさち', model: 'JR九州 キハ125形 海幸山幸', image: 'popular-umisachi.webp', color: '#bd976f', detail: 'みやざきの うみと やまを はしるよ' },
  { id: 'popular-a-train', name: 'えーれっしゃでいこう', model: 'JR九州 キハ185系 A列車で行こう', image: 'popular-a-train.webp', color: '#aa8a4f', detail: 'くまもとと みすみを むすぶよ' },
  { id: 'popular-sennen', name: 'しこくまんなかせんねんものがたり', model: 'JR四国 四国まんなか千年ものがたり', image: 'popular-sennen.webp', color: '#568975', detail: 'しこくの やまを はしるよ' },
  { id: 'popular-yoake', name: 'しこくとさときのよあけのものがたり', model: 'JR四国 志国土佐 時代の夜明けのものがたり', image: 'popular-yoake.webp', color: '#3f647d', detail: 'こうちを はしる かんこうれっしゃだよ' },
  { id: 'popular-ametsuchi', name: 'あめつち', model: 'JR西日本 あめつち', image: 'popular-ametsuchi.webp', color: '#527c9a', detail: 'さんいんを はしる かんこうれっしゃだよ' },
  { id: 'popular-setsugekka', name: 'せつげっか', model: 'えちごトキめきリゾート雪月花', image: 'popular-setsugekka.webp', color: '#c4534d', detail: 'にいがたを はしる かんこうれっしゃだよ' },
];

export const POPULAR_FACTS = {
  'popular-blue-symphony': [
    { text: 'おおさかあべのばしから ならの よしのへ むかう とっきゅうだよ。', places: ['おおさかあべのばし', 'なら', 'よしの'], source: 'https://www.kintetsu.co.jp/senden/blue_symphony/about/' },
    { text: 'おおさかと ならの あすかや よしのを むすぶ かんこうとっきゅうだよ。', places: ['おおさか', 'なら', 'あすか', 'よしの'], source: 'https://www.kintetsu.co.jp/senden/blue_symphony/about/' },
  ],
  'popular-kawasemi-yamasemi': [
    { text: 'くまもとから あそを とおって、みやじへ むかう とっきゅうだよ。', places: ['くまもと', 'あそ', 'みやじ'], source: 'https://www.jrkyushu.co.jp/trains/kawasemiyamasemi/' },
    { text: 'くまもとけんの ひごおおづや あそを とおる れっしゃだよ。', places: ['くまもとけん', 'ひごおおづ', 'あそ'], source: 'https://www.jrkyushu.co.jp/trains/kawasemiyamasemi/' },
  ],
  'popular-ibusuki': [
    { text: 'かごしまちゅうおうから いぶすきまで、かごしまを はしるよ。', places: ['かごしまちゅうおう', 'いぶすき', 'かごしま'], source: 'https://www.jrkyushu.co.jp/trains/ibusukinotamatebako/' },
    { text: 'かごしまの きんこうわんの そばを とおって、いぶすきへ むかうよ。', places: ['かごしま', 'きんこうわん', 'いぶすき'], source: 'https://www.jrkyushu.co.jp/trains/ibusukinotamatebako/' },
  ],
  'popular-futatsuboshi': [
    { text: 'さがの たけおおんせんと ながさきを むすぶ かんこうれっしゃだよ。', places: ['さが', 'たけおおんせん', 'ながさき'], source: 'https://www.jrkyushu.co.jp/train/futatsuboshi/' },
    { text: 'さがや ながさきの うみの そばを めぐる れっしゃだよ。', places: ['さが', 'ながさき'], source: 'https://www.jrkyushu.co.jp/train/futatsuboshi/' },
  ],
  'popular-umisachi': [
    { text: 'みやざきから なんごうへ、にちなんかいがんを はしるよ。', places: ['みやざき', 'なんごう', 'にちなんかいがん'], source: 'https://www.jrkyushu.co.jp/trains/umisachiyamasachi/' },
    { text: 'みやざきの あおしまや にちなんを とおる かんこうれっしゃだよ。', places: ['みやざき', 'あおしま', 'にちなん'], source: 'https://www.jrkyushu.co.jp/trains/umisachiyamasachi/' },
  ],
  'popular-a-train': [
    { text: 'くまもとから みすみまで、ありあけかいの そばを はしるよ。', places: ['くまもと', 'みすみ', 'ありあけかい'], source: 'https://www.jrkyushu.co.jp/trains/atrain/' },
    { text: 'くまもとの うとを とおって、みすみへ むかう とっきゅうだよ。', places: ['くまもと', 'うと', 'みすみ'], source: 'https://www.jrkyushu.co.jp/trains/atrain/' },
  ],
  'popular-sennen': [
    { text: 'かがわの たどつから とくしまの おおぼけへ むかうよ。', places: ['かがわ', 'たどつ', 'とくしま', 'おおぼけ'], source: 'https://www.jr-shikoku.co.jp/sennenmonogatari/' },
    { text: 'しこくの ことひらや おおぼけを とおる かんこうれっしゃだよ。', places: ['しこく', 'ことひら', 'おおぼけ'], source: 'https://www.jr-shikoku.co.jp/sennenmonogatari/' },
  ],
  'popular-yoake': [
    { text: 'こうちから くぼかわへ むかう、しこくの かんこうれっしゃだよ。', places: ['こうち', 'くぼかわ', 'しこく'], source: 'https://www.jr-shikoku.co.jp/yoakenomonogatari/' },
    { text: 'こうちの すさきや くぼかわを とおる とっきゅうだよ。', places: ['こうち', 'すさき', 'くぼかわ'], source: 'https://www.jr-shikoku.co.jp/yoakenomonogatari/' },
  ],
  'popular-ametsuchi': [
    { text: 'とっとりや しまねを めぐる、さんいんの かんこうれっしゃだよ。', places: ['とっとり', 'しまね', 'さんいん'], source: 'https://www.jr-odekake.net/railroad/kankoutrain/ametuchi/' },
    { text: 'とっとりや まつえを とおって、さんいんを はしるよ。', places: ['とっとり', 'まつえ', 'さんいん'], source: 'https://www.jr-odekake.net/railroad/kankoutrain/ametuchi/' },
  ],
  'popular-setsugekka': [
    { text: 'にいがたの じょうえつみょうこうや いといがわを とおるよ。', places: ['にいがた', 'じょうえつみょうこう', 'いといがわ'], source: 'https://www.echigo-tokimeki.co.jp/setsugekka/' },
    { text: 'にいがたの みょうこうや にほんかいの ちかくを めぐるよ。', places: ['にいがた', 'みょうこう', 'にほんかい'], source: 'https://www.echigo-tokimeki.co.jp/setsugekka/' },
  ],
};
