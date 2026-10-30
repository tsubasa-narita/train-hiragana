// Vehicle and route sources: docs/metro-additions-20261030.md.
export const METRO_TRAINS = [
  { id: 'metro-ikegami-1000', name: 'いけがみせん', model: '東急1000系1500番台', image: 'metro-ikegami-1000.webp', color: '#cf7c93', detail: 'ごたんだと かまたを むすぶ でんしゃだよ' },
  { id: 'metro-seibu-tamagawa-101', name: 'せいぶたまがわせん', model: '西武101系', image: 'metro-seibu-tamagawa-101.webp', color: '#d6ad49', detail: 'むさしさかいと これまさを むすぶよ' },
  { id: 'metro-tobu-urban-80000', name: 'とうぶあーばんぱーくらいん', model: '東武80000系', image: 'metro-tobu-urban-80000.webp', color: '#6d9e76', detail: 'おおみやや かしわを とおる でんしゃだよ' },
  { id: 'metro-yokohama-blue-4000', name: 'よこはましえいちかてつぶるーらいん', model: '横浜市営地下鉄4000形', image: 'metro-yokohama-blue-4000.webp', color: '#378ac1', detail: 'よこはまを はしる ちかてつだよ' },
  { id: 'metro-keisei-matsudo-80000', name: 'けいせいまつどせん', model: '京成松戸線80000形', image: 'metro-keisei-matsudo-80000.webp', color: '#de7896', detail: 'まつどと けいせいつだぬまを むすぶよ' },
  { id: 'metro-yokohama-green-10000', name: 'よこはまぐりーんらいん', model: '横浜市営地下鉄10000形', image: 'metro-yokohama-green-10000.webp', color: '#73a849', detail: 'よこはまを はしる ちかてつだよ' },
  { id: 'metro-hokuso-9100', name: 'ほくそうせん', model: '北総鉄道9100形 C-Flyer', image: 'metro-hokuso-9100.webp', color: '#3c80ad', detail: 'とうきょうと ちばの まちを むすぶよ' },
  { id: 'metro-ryutetsu-5000', name: 'りゅうてつながれやません', model: '流鉄5000形 流星', image: 'metro-ryutetsu-5000.webp', color: '#4d96bd', detail: 'ちばの まばしと ながれやまを むすぶよ' },
  { id: 'metro-kominato-kiha200', name: 'こみなとてつどう', model: '小湊鐵道キハ200形', image: 'metro-kominato-kiha200.webp', color: '#c77a5b', detail: 'ちばの いちはらしを はしる れっしゃだよ' },
  { id: 'new-narita-209', name: 'なりたせん', model: 'JR東日本209系2100番台', image: 'new-narita-209.webp', color: '#d2aa43', detail: 'ちばの なりたを とおる でんしゃだよ' },
  { id: 'new-kashima-rinkai-8000', name: 'かしまりんかいてつどう', model: '鹿島臨海鉄道8000形', image: 'new-kashima-rinkai-8000.webp', color: '#5f91a4', detail: 'いばらきの うみの ちかくを はしるよ' },
  { id: 'new-choshi-22000', name: 'ちょうしでんてつ', model: '銚子電鉄22000形', image: 'new-choshi-22000.webp', color: '#4a9679', detail: 'ちばの ちょうしを はしる でんしゃだよ' },
  { id: 'new-yakumo-273', name: 'やくも', model: 'JR西日本273系', image: 'new-yakumo-273.webp', color: '#a17354', detail: 'おかやまと いずもを むすぶ とっきゅうだよ' },
  { id: 'new-kyotram', name: 'きょうとらむ', model: '嵐電モボ1形 KYOTRAM', image: 'new-kyotram.webp', color: '#875884', detail: 'きょうとを はしる らんでんだよ' },
  { id: 'new-sagano-torokko', name: 'さがのとろっこれっしゃ', model: '嵯峨野観光鉄道 トロッコ列車', image: 'new-sagano-torokko.webp', color: '#b75047', detail: 'きょうとの やまや かわの そばを はしるよ' },
  { id: 'new-kurobe-torokko', name: 'くろべきょうこくてつどう', model: '黒部峡谷鉄道 トロッコ電車', image: 'new-kurobe-torokko.webp', color: '#4381a5', detail: 'とやまの くろべきょうこくを はしるよ' },
];
export const METRO_FACTS = {
  'metro-ikegami-1000': [
    { text: 'ごたんだから かまたまで、とうきょうの いけがみせんを はしるよ。', places: ['ごたんだ','かまた','とうきょう'], source: 'https://www.tokyu.co.jp/railway/ik/' },
    { text: 'とうきょうの はたのだいや いけがみを とおって、かまたへ むかうよ。', places: ['とうきょう','はたのだい','いけがみ','かまた'], source: 'https://www.tokyu.co.jp/global/railway/line/ik/' },
  ],
  'metro-seibu-tamagawa-101': [
    { text: 'むさしさかいから これまさまで、とうきょうの たまがわせんを はしるよ。', places: ['むさしさかい','これまさ','とうきょう'], source: 'https://www.seiburailway.jp/railway/cycletrain/tamagawaline/' },
    { text: 'とうきょうの しらいとだいを とおって、これまさへ むかうよ。', places: ['とうきょう','しらいとだい','これまさ'], source: 'https://www.seiburailway.jp/railway/station/' },
  ],
  'metro-tobu-urban-80000': [
    { text: 'おおみやから かしわを とおって、ふなばしへ つながる せんろだよ。', places: ['おおみや','かしわ','ふなばし'], source: 'https://www.tobu.co.jp/railway/guide/line/noda_line.html' },
    { text: 'さいたまの かすかべや、ちばの のだしを とおる でんしゃだよ。', places: ['さいたま','かすかべ','ちば','のだし'], source: 'https://www.tobu.co.jp/railway/guide/line/noda_line.html' },
  ],
  'metro-yokohama-blue-4000': [
    { text: 'あざみのから しょうなんだいまで、よこはまを はしる ちかてつだよ。', places: ['あざみの','しょうなんだい','よこはま'], source: 'https://www.city.yokohama.lg.jp/kotsu/kigyo/gaiyou/subway.html' },
    { text: 'しんよこはまや よこはまを とおって、かながわの まちを むすぶよ。', places: ['しんよこはま','よこはま','かながわ'], source: 'https://www.city.yokohama.lg.jp/kotsu/kigyo/gaiyou/subway.html' },
  ],
  'metro-keisei-matsudo-80000': [
    { text: 'ちばの まつどから けいせいつだぬままで、まつどせんを はしるよ。', places: ['ちば','まつど','けいせいつだぬま'], source: 'https://www.keisei.co.jp/keisei/tetudou/goriyo/pdf/keisei_251213.pdf' },
    { text: 'ちばの しんかまがやや ごこうを とおって、まつどへ むかうよ。', places: ['ちば','しんかまがや','ごこう','まつど'], source: 'https://www.keisei.co.jp/keisei/tetudou/goriyo/pdf/keisei_251213.pdf' },
  ],
  'metro-yokohama-green-10000': [
    { text: 'なかやまから ひよしまで、よこはまを はしる ちかてつだよ。', places: ['なかやま','ひよし','よこはま'], source: 'https://www.city.yokohama.lg.jp/kotsu/kigyo/gaiyou/subway.html' },
    { text: 'よこはまの せんたーきたや せんたーみなみを とおるよ。', places: ['よこはま','せんたーきた','せんたーみなみ'], source: 'https://www.city.yokohama.lg.jp/kotsu/kigyo/gaiyou/subway.html' },
  ],
  'metro-hokuso-9100': [
    { text: 'けいせいたかさごから いんばにほんいだいまで、ほくそうせんを はしるよ。', places: ['けいせいたかさご','いんばにほんいだい'], source: 'https://www.hokuso-railway.co.jp/docs/railway/route_map.pdf' },
    { text: 'ちばの ひがしまつどや しんかまがやを とおる でんしゃだよ。', places: ['ちば','ひがしまつど','しんかまがや'], source: 'https://www.hokuso-railway.co.jp/docs/railway/route_map.pdf' },
  ],
  'metro-ryutetsu-5000': [
    { text: 'ちばの まばしから ながれやままで、りゅうてつを はしるよ。', places: ['ちば','まばし','ながれやま'], source: 'https://ryutetsu.jp/about.html' },
    { text: 'ちばの まつどと ながれやまの まちを むすぶ でんしゃだよ。', places: ['ちば','まつど','ながれやま'], source: 'https://ryutetsu.jp/about.html' },
  ],
  'metro-kominato-kiha200': [
    { text: 'ちばの ごいから かずさうしくへ、こみなとてつどうを はしるよ。', places: ['ちば','ごい','かずさうしく'], source: 'https://www.kominato.co.jp/timetable/' },
    { text: 'ちばの いちはらしを、ばたてや ごいを とおって はしるよ。', places: ['ちば','いちはらし','ばたて','ごい'], source: 'https://www.kominato.co.jp/wp-content/uploads/2026/02/a999f67756d561831839a1f3e0d0c91e.pdf' },
  ],
  'new-narita-209': [
    { text: 'ちばの さくらから なりたを とおり、ちょうしの ほうへ むかうよ。', places: ['ちば','さくら','なりた','ちょうし'], source: 'https://timetables.jreast.co.jp/timetable/list1129.html' },
    { text: 'なりたから さわらを とおって、ちばの ちょうしへ むかうよ。', places: ['なりた','さわら','ちば','ちょうし'], source: 'https://timetables.jreast.co.jp/timetable/list1129.html' },
  ],
  'new-kashima-rinkai-8000': [
    { text: 'いばらきの みとから おおあらいを とおって、かしまじんぐうへ むかうよ。', places: ['いばらき','みと','おおあらい','かしまじんぐう'], source: 'https://www.rintetsu.co.jp/timetable' },
    { text: 'おおあらいや しんほこたを とおる、いばらきの れっしゃだよ。', places: ['おおあらい','しんほこた','いばらき'], source: 'https://www.rintetsu.co.jp/timetable' },
  ],
  'new-choshi-22000': [
    { text: 'ちばの ちょうしから とかわまで、ちょうしでんてつを はしるよ。', places: ['ちば','ちょうし','とかわ'], source: 'https://www.choshi-dentetsu.jp/railway/' },
    { text: 'ちょうしの いぬぼうを とおって、とかわへ むかう でんしゃだよ。', places: ['ちょうし','いぬぼう','とかわ'], source: 'https://www.choshi-dentetsu.jp/railway/' },
  ],
  'new-yakumo-273': [
    { text: 'おかやまから いずもしまで、さんいんへ むかう とっきゅうだよ。', places: ['おかやま','いずもし','さんいん'], source: 'https://www.jr-odekake.net/railroad/yakumo/' },
    { text: 'とっとりの よなごや しまねの まつえを とおる とっきゅうだよ。', places: ['とっとり','よなご','しまね','まつえ'], source: 'https://www.jr-odekake.net/railroad/yakumo/' },
  ],
  'new-kyotram': [
    { text: 'きょうとの しじょうおおみやから あらしやまへ、らんでんを はしるよ。', places: ['きょうと','しじょうおおみや','あらしやま'], source: 'https://www.keifuku.co.jp/cms/wp-content/uploads/4016d15593001825fd5a5bcaf5c67cd2.pdf' },
    { text: 'きょうとの うずまさや あらしやまを とおる でんしゃだよ。', places: ['きょうと','うずまさ','あらしやま'], source: 'https://www.keifuku.co.jp/cms/wp-content/uploads/4016d15593001825fd5a5bcaf5c67cd2.pdf' },
  ],
  'new-sagano-torokko': [
    { text: 'きょうとの さがから かめおかまで、とろっこで やまを はしるよ。', places: ['きょうと','さが','かめおか'], source: 'https://www.sagano-kanko.co.jp/train-info/' },
    { text: 'きょうとの ほづきょうを とおって、かめおかへ むかう れっしゃだよ。', places: ['きょうと','ほづきょう','かめおか'], source: 'https://www.sagano-kanko.co.jp/train-info/' },
  ],
  'new-kurobe-torokko': [
    { text: 'とやまの うなづきから けやきだいらまで、くろべの やまを はしるよ。', places: ['とやま','うなづき','けやきだいら','くろべ'], source: 'https://www.kurotetu.co.jp/news-detail/?post=616' },
    { text: 'とやまの くろべきょうこくで、かわや やまを みながら はしるよ。', places: ['とやま','くろべきょうこく'], source: 'https://www.kurotetu.co.jp/timetable/' },
  ],
};
