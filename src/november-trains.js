export const NOVEMBER_TRAINS = [
  { id: 'super-hakuto', name: 'すーぱーはくと', spokenName: 'スーパーはくと', model: '智頭急行 HOT7000系', image: 'quiz-super-hakuto.webp', color: '#244e89', detail: 'おおさかや きょうとから、とっとりへ むかうよ' },
  { id: 'shiokaze-8600', name: 'しおかぜ', model: 'JR四国 8600系', image: 'quiz-shiokaze-8600.webp', color: '#db8b3c', detail: 'おかやまから せとおおはしを わたって まつやまへ' },
  { id: 'entetsu-akaden', name: 'あかでん', model: '遠州鉄道 2000形', image: 'quiz-entetsu-akaden.webp', color: '#c83d3b', detail: 'はままつの まちを みなみから きたへ はしるよ' },
  { id: 'iga-ninja', name: 'にんじゃれっしゃ', model: '伊賀鉄道 200系 青色の忍者列車', image: 'quiz-iga-ninja.webp', color: '#468bc0', detail: 'みえけんの いがを はしるよ' },
  { id: 'alpico-kamikochi', name: 'かみこうちせん', model: 'アルピコ交通 20100形', image: 'quiz-alpico-kamikochi.webp', color: '#36599c', detail: 'まつもとから しんしましままで はしるよ' },
  { id: 'fukui-fukuram', name: 'ふくらむ', spokenName: 'フクラム', model: '福井鉄道 F1000形 FUKURAM', image: 'quiz-fukui-fukuram.webp', color: '#dc702f', detail: 'ふくいの まちでは どうろの まんなかを はしるよ' },
  { id: 'toyama-centram', name: 'せんとらむ', spokenName: 'セントラム', model: '富山地方鉄道 デ9000形 CENTRAM', image: 'quiz-toyama-centram.webp', color: '#424b5a', detail: 'とやまの まちなかを ぐるっと めぐるよ' },
  { id: 'tama-monorail', name: 'たまものれーる', spokenName: 'タマモノレール', model: '多摩都市モノレール 1000系', image: 'quiz-tama-monorail.webp', color: '#d6823c', detail: 'とうきょうの たまを たかいところから ながめられるよ' },
  { id: 'yokkaichi-asunarou', name: 'よっかいちあすなろうてつどう', model: '四日市あすなろう鉄道 新260系 なろうブルー', image: 'quiz-yokkaichi-asunarou.webp', color: '#4680a2', detail: 'みえけん よっかいちの ほそい せんろを はしるよ' },
  { id: 'hokuhoku-hk100', name: 'ほくほくせん', model: '北越急行 HK100形', image: 'quiz-hokuhoku-hk100.webp', color: '#405d96', detail: 'にいがたの ゆきの おおい ちいきを はしるよ' },
];

const fact = (text, places, source) => ({ text, places, source });

export const NOVEMBER_FACTS = {
  'super-hakuto': [
    fact('おおさかから とっとりへ むかう とっきゅうだよ。', ['おおさか', 'とっとり'], 'https://www.jr-odekake.net/railroad/train/s-hakuto/'),
    fact('ひょうごの かみごおりを とおって、ちずの やまを こえていくよ。', ['ひょうご', 'かみごおり', 'ちず'], 'https://www.chizukyu.co.jp/chizukyu/syaryou_eki/superhakuto/'),
  ],
  'shiokaze-8600': [
    fact('おかやまから えひめの まつやままで はしる とっきゅうだよ。', ['おかやま', 'えひめ', 'まつやま'], 'https://www.jr-shikoku.co.jp/01_trainbus/vehicle-info/shiokaze.html'),
    fact('せとおおはしを わたって、せとうちの うみを こえていくよ。', ['せとおおはし', 'せとうち'], 'https://www.jr-shikoku.co.jp/01_trainbus/vehicle-info/shiokaze.html'),
  ],
  'entetsu-akaden': [
    fact('しんはままつから にしかじままで、はままつの まちを はしるよ。', ['しんはままつ', 'にしかじま', 'はままつ'], 'https://train.entetsu.co.jp/about'),
    fact('しずおかけんの はままつで、まちの みなみと きたを むすんでいるよ。', ['しずおかけん', 'はままつ'], 'https://train.entetsu.co.jp/about'),
  ],
  'iga-ninja': [
    fact('みえけんの いがうえのから いがかんべまで はしるよ。', ['みえけん', 'いがうえの', 'いがかんべ'], 'https://www.igatetsu.co.jp/cat11/'),
    fact('うえのしえきで おりると、いがうえのじょうにも いけるよ。', ['うえのし', 'いがうえのじょう'], 'https://www.igatetsu.co.jp/?page_id=61'),
  ],
  'alpico-kamikochi': [
    fact('ながのけんの まつもとから しんしましままで はしるよ。', ['ながのけん', 'まつもと', 'しんしましま'], 'https://www.alpico.co.jp/traffic/lp/kamikouchi-line/'),
    fact('しんしましまで バスに のりかえると、やまの かみこうちへ いけるよ。', ['しんしましま', 'かみこうち'], 'https://www.alpico.co.jp/traffic/lp/kamikouchi-line/'),
  ],
  'fukui-fukuram': [
    fact('たけふしんから たわらまちまで、ふくいの まちを はしるよ。', ['たけふしん', 'たわらまち', 'ふくい'], 'https://fukutetsu.jp/traininfo.php'),
    fact('ふくいえきにも やってくる、まちの ろめんでんしゃだよ。', ['ふくいえき'], 'https://fukutetsu.jp/traininfo.php'),
  ],
  'toyama-centram': [
    fact('とやまえきから まちの なかを ぐるっと まわるよ。', ['とやまえき'], 'https://www.chitetsu.co.jp/?page_id=660'),
    fact('とやまの こくさいかいぎじょうや、とやまえきの まえを とおるよ。', ['とやま', 'こくさいかいぎじょう', 'とやまえき'], 'https://www.chitetsu.co.jp/?p=70984'),
  ],
  'tama-monorail': [
    fact('かみきただいから たませんたーまで、とうきょうの たまを はしるよ。', ['かみきただい', 'たませんたー', 'とうきょう'], 'https://www.tama-monorail.co.jp/monorail/station/'),
    fact('たかはたふどうや たまどうぶつこうえんにも とまるよ。', ['たかはたふどう', 'たまどうぶつこうえん'], 'https://www.tama-monorail.co.jp/monorail/station/'),
  ],
  'yokkaichi-asunarou': [
    fact('みえけんの よっかいちから うつべへ、ほそい せんろを はしるよ。', ['みえけん', 'よっかいち', 'うつべ'], 'https://www.city.yokkaichi.lg.jp/www/contents/1001000001910/index.html'),
    fact('よっかいちの ひながで、うつべへ いく せんろと にしひのへ いく せんろが わかれるよ。', ['よっかいち', 'ひなが', 'うつべ', 'にしひの'], 'https://www.city.yokkaichi.lg.jp/www/contents/1001000001910/index.html'),
  ],
  'hokuhoku-hk100': [
    fact('にいがたけんの むいかまちから さいがたまで、やまの あいだを はしるよ。', ['にいがたけん', 'むいかまち', 'さいがた'], 'https://hokuhoku.co.jp/answer.html'),
    fact('とおかまちや まつだいを とおるよ。やまの トンネルも くぐるよ。', ['とおかまち', 'まつだい'], 'https://www.hokuhoku.co.jp/danmen.html'),
  ],
};
