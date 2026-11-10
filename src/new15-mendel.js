export const NEW15_MENDEL_TRAINS = [
  { id: 'n15-mendel-joso', name: 'かんとうてつどうじょうそうせん', model: '関東鉄道 キハ5000形', image: 'n15-mendel-joso.webp', color: '#3979a0', detail: 'あおと あかの せんが めじるしだよ' },
  { id: 'n15-mendel-ryugasaki', name: 'りゅうがさきせん', model: '関東鉄道 キハ2000形', image: 'n15-mendel-ryugasaki.webp', color: '#cc6551', detail: 'いばらきの みじかい ろせんを はしるよ' },
  { id: 'n15-mendel-moka', name: 'もおかてつどう', model: '真岡鐵道 モオカ14形', image: 'n15-mendel-moka.webp', color: '#599357', detail: 'みどりいろの きどうしゃだよ' },
  { id: 'n15-mendel-jomo', name: 'じょうもうでんきてつどう', model: '上毛電気鉄道 800形', image: 'n15-mendel-jomo.webp', color: '#78b2c4', detail: 'みずいろの おかおの でんしゃだよ' },
  { id: 'n15-mendel-minato', name: 'ひたちなかかいひんてつどう', model: 'ひたちなか海浜鉄道 キハ11形', image: 'n15-mendel-minato.webp', color: '#d78245', detail: 'うみの ちかくへ はしる きどうしゃだよ' },
];

export const NEW15_MENDEL_FACTS = {
  'n15-mendel-joso': [
    { text: 'いばらきの とりでから しもだてまで はしるよ。', places: ['いばらき', 'とりで', 'しもだて'], source: 'https://www.kantetsu.co.jp/train/routemap/' },
    { text: 'もりやや みつかいどうを とおるよ。', places: ['もりや', 'みつかいどう'], source: 'https://www.kantetsu.co.jp/train/routemap/' },
  ],
  'n15-mendel-ryugasaki': [
    { text: 'いばらきの さぬきと りゅうがさきを むすぶよ。', places: ['いばらき', 'さぬき', 'りゅうがさき'], source: 'https://www.kantetsu.co.jp/train/routemap/' },
    { text: 'いばらきの さぬきから いれじを とおって、りゅうがさきへ むかうよ。', places: ['いばらき', 'さぬき', 'いれじ', 'りゅうがさき'], source: 'https://www.kantetsu.co.jp/train/routemap/' },
  ],
  'n15-mendel-moka': [
    { text: 'しもだてから もてぎまで はしるよ。', places: ['しもだて', 'もてぎ'], source: 'https://www.moka-railway.co.jp/route-map/' },
    { text: 'とちぎの もおかや ましこを とおるよ。', places: ['とちぎ', 'もおか', 'ましこ'], source: 'https://www.moka-railway.co.jp/route-map/' },
  ],
  'n15-mendel-jomo': [
    { text: 'ぐんまの ちゅうおうまえばしと にしきりゅうを むすぶよ。', places: ['ぐんま', 'ちゅうおうまえばし', 'にしきりゅう'], source: 'https://jomorailway.com/line.html' },
    { text: 'まえばしの おおごを とおるよ。', places: ['まえばし', 'おおご'], source: 'https://jomorailway.com/chuomaebashi.html' },
  ],
  'n15-mendel-minato': [
    { text: 'いばらきの かつたから あじがうらへ はしるよ。', places: ['いばらき', 'かつた', 'あじがうら'], source: 'https://www.hitachinaka-rail.co.jp/timetable/' },
    { text: 'なかみなとや ひらいその えきに とまるよ。', places: ['なかみなと', 'ひらいそ'], source: 'https://www.hitachinaka-rail.co.jp/timetable/' },
  ],
};
