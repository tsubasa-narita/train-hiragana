// Individual illustrations; variants keep their train's collection identity.
export const EXTRA_TRAINS = [
  { id: 'oimachi', name: 'おおいまちせん', image: 'extra-oimachi.webp', color: '#d58b36', detail: 'オレンジいろの おおいまちせん' },
  { id: 'kaiji', name: 'かいじ', image: 'extra-kaiji.webp', color: '#8966a6', detail: 'こうふへ むかう むらさきの とっきゅう' },
  { id: 'sunrise', name: 'さんらいずいずも', image: 'extra-sunrise.webp', color: '#ac645a', detail: 'ねむりながら たびをする とっきゅう' },
  { id: 'shimakaze', name: 'しまかぜ', image: 'extra-shimakaze.webp', color: '#5999b1', detail: 'いせしまへ あおい とっきゅう' },
  { id: 'spacia-x', name: 'すぺーしあえっくす', image: 'extra-spacia-x.webp', color: '#849a9e', detail: 'しろい からだに ろっかくけいの まど' },
  { id: 'chiyoda', name: 'ちよだせん', image: 'extra-chiyoda.webp', color: '#459a67', detail: 'みどりの おびの ちかてつ' },
  { id: 'toyoko', name: 'とうよこせん', image: 'extra-toyoko.webp', color: '#c65b69', detail: 'しぶやと よこはまを むすぶよ' },
  { id: 'hanzomon', name: 'はんぞうもんせん', image: 'extra-hanzomon.webp', color: '#9566b3', detail: 'むらさきいろの おびの ちかてつ' },
  { id: 'fukutoshin', name: 'ふくとしんせん', image: 'extra-fukutoshin.webp', color: '#a47d59', detail: 'ちゃいろの おびの ちかてつ' },
  { id: 'laview', name: 'らびゅー', image: 'extra-laview.webp', color: '#9b9d8c', detail: 'ぎんいろの まあるい おかお' },
  { id: 'sotetsu', name: 'そうてつせん', image: 'extra-sotetsu.webp', color: '#335a88', detail: 'こい あおいろの でんしゃ' },
  { id: 'nanbu', name: 'なんぶせん', image: 'extra-nanbu.webp', color: '#c99534', detail: 'きいろと オレンジと ちゃいろの おび' },
  { id: 'hinotori', name: 'ひのとり', image: 'extra-hinotori.webp', color: '#ac424b', detail: 'あかく かがやく とっきゅう' },
  { id: 'midosuji', name: 'みどうすじせん', image: 'extra-midosuji.webp', color: '#c55355', detail: 'おおさかを はしる あかい おびの ちかてつ' },
  { id: 'yamabiko', name: 'やまびこ', image: 'extra-yamabiko.webp', color: '#16836d', detail: 'この えは E5けい。とうほくへ はしるよ' },
  { id: 'yurikamome', name: 'ゆりかもめ', image: 'extra-yurikamome.webp', color: '#5b85ae', detail: 'ゴムの タイヤで うみの そばへ' },
];

export const IMAGE_VARIANTS = [
  'azusa', 'kinugawa', 'keikyu', 'komachi', 'romancecar',
  'inaho', 'ueno-tokyo', 'enoden', 'kuroshio', 'tanigawa', 'tenhama', 'nichirin', 'numajiri', 'nemuro', 'nozomi',
  'heisei-chikuho', 'hokuto', 'marunouchi', 'muroran', 'meitetsu', 'momotaro', 'rinkai', 'rumoi', 'red-arrow', 'wakashio',
  'seibu', 'yokosuka',
].map(id => ({ id, image: `variant-${id}.webp` }));
