// 車両と運行区間の出典は docs/new15-einstein.md を参照。
export const NEW15_EINSTEIN_TRAINS = [
  { id: 'n15-einstein-shigaraki', name: 'しがらきこうげんてつどう', model: '信楽高原鐵道 SKR500形 SKR501', image: 'n15-einstein-shigaraki.webp', color: '#24624d', detail: 'みどりの しゃりょうが しがらきへ はしるよ' },
  { id: 'n15-einstein-nishikigawa', name: 'にしきがわせいりゅうせん', model: '錦川鉄道 NT3000形 せせらぎ号', image: 'n15-einstein-nishikigawa.webp', color: '#398fc2', detail: 'あおい しゃりょうが かわぞいを はしるよ' },
  { id: 'n15-einstein-ichibata', name: 'いちばたでんしゃ', model: '一畑電車 7000系', image: 'n15-einstein-ichibata.webp', color: '#d77a46', detail: 'しろい からだに オレンジいろが みえるよ' },
  { id: 'n15-einstein-kotoden-shido', name: 'ことでんしどせん', model: '高松琴平電気鉄道 600形 志度線車両', image: 'n15-einstein-kotoden-shido.webp', color: '#be5363', detail: 'あかと クリームいろの でんしゃだよ' },
  { id: 'n15-einstein-amagi', name: 'あまぎてつどう', model: '甘木鉄道 AR300形 AR303', image: 'n15-einstein-amagi.webp', color: '#ce624c', detail: 'しゅいろと クリームいろの れっしゃだよ' },
];

export const NEW15_EINSTEIN_FACTS = {
  'n15-einstein-shigaraki': [
    { text: 'しがの きぶかわから しがらきまで はしるよ。', places: ['きぶかわ', 'しがらき'], source: 'https://koka-skr.co.jp/station.html' },
    { text: 'しがらきは やきものの まち。くもいも とおるよ。', places: ['しがらき', 'くもい'], source: 'https://koka-skr.co.jp/station.html' },
  ],
  'n15-einstein-nishikigawa': [
    { text: 'やまぐちの いわくにから にしきちょうへ はしるよ。', places: ['いわくに', 'にしきちょう'], source: 'https://seiryusen.nishikigawa.com/timetable/' },
    { text: 'にしきがわに そって、やまぐちの まちを むすぶよ。', places: ['にしきがわ', 'やまぐち'], source: 'https://nishikigawa.com/plan/autumn-sake/' },
  ],
  'n15-einstein-ichibata': [
    { text: 'しまねの まつえと いずもの まちを むすぶよ。', places: ['まつえ', 'いずも'], source: 'https://railway.ichibata.co.jp/wp-content/media/map-1.pdf' },
    { text: 'しんじこや いずもたいしゃの ちかくを はしるよ。', places: ['しんじこ', 'いずもたいしゃ'], source: 'https://railway.ichibata.co.jp/wp-content/media/map-1.pdf' },
  ],
  'n15-einstein-kotoden-shido': [
    { text: 'かがわの かわらまちから ことでんしどへ はしるよ。', places: ['かわらまち', 'ことでんしど'], source: 'https://www.kotoden.co.jp/publichtm/sp/main/s00.html' },
    { text: 'しどせんは ことでんやしまを とおるよ。', places: ['しどせん', 'ことでんやしま'], source: 'https://www.kotoden.co.jp/publichtm/sp/main/s06.html' },
  ],
  'n15-einstein-amagi': [
    { text: 'さがの きやまと ふくおかの あまぎを むすぶよ。', places: ['きやま', 'あまぎ'], source: 'https://www.amatetsu.jp/new/tanabata.pdf' },
    { text: 'あまぎせんは たちあらいを とおるよ。', places: ['あまぎせん', 'たちあらい'], source: 'https://www.amatetsu.jp/new/tanabata.pdf' },
  ],
};
