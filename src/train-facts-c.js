// TRAINS.slice(104, 156): two researched, non-appearance facts per train.
// Evidence and scope notes: docs/train-facts-c-sources.md
export const TRAIN_FACTS_C = {
  'marine-liner': [
    { text: 'おかやまから たかまつまで、せとおおはしを わたる れっしゃだよ。', places: ["おかやま", "たかまつ"], source: 'https://www.jr-odekake.net/railroad/train/marineliner/' },
    { text: 'しこくの たかまつへ むかう、せとないかいを わたる でんしゃだよ。', places: ["しこく", "たかまつ"], source: 'https://www.jr-odekake.net/railroad/train/marineliner/' },
  ],
  'musashino': [
    { text: 'ふちゅうほんまちから にしふなばしまで、とうきょうの ちかくを はしるよ。', places: ["ふちゅうほんまち", "にしふなばし", "とうきょう"], source: 'https://www.jreast.co.jp/press/2023/hachioji/20230914_hc02.pdf' },
    { text: 'さいたまや ちばの まちを むすぶ、むさしのせんの れっしゃだよ。', places: ["さいたま", "ちば"], source: 'https://www.jreast.co.jp/press/2023/hachioji/20230914_hc02.pdf' },
  ],
  'yokohama': [
    { text: 'はちおうじから ひがしかながわまで、よこはませんを はしるよ。', places: ["はちおうじ", "ひがしかながわ"], source: 'https://www.jreast.co.jp/map/pdf/map_tokyo.pdf' },
    { text: 'まちだや しんよこはまを とおって、はちおうじと ひがしかながわを むすぶよ。', places: ["まちだ", "しんよこはま", "はちおうじ", "ひがしかながわ"], source: 'https://www.jreast.co.jp/map/pdf/map_tokyo.pdf' },
  ],
  'ryomo': [
    { text: 'あさくさから ぐんまの あかぎへ むかう、とっきゅうだよ。', places: ["あさくさ", "ぐんま", "あかぎ"], source: 'https://www.tobu.co.jp/railway/special_express/vehicle/ryomo/' },
    { text: 'とうぶせんから きりゅうせんへ、ぐんまの まちを むすぶよ。', places: ["とうぶせん", "きりゅうせん", "ぐんま"], source: 'https://www.tobu.co.jp/railway/special_express/vehicle/ryomo/' },
  ],
  'haruka': [
    { text: 'きょうとや おおさかから、かんさいくうこうへ むかう とっきゅうだよ。', places: ["きょうと", "おおさか", "かんさいくうこう"], source: 'https://www.jr-odekake.net/railroad/train/haruka/' },
    { text: 'てんのうじを とおって、おおさかから かんさいくうこうへ むかうよ。', places: ["てんのうじ", "おおさか", "かんさいくうこう"], source: 'https://www.jr-odekake.net/railroad/train/haruka/' },
  ],
  'minatomirai': [
    { text: 'よこはまから もとまちちゅうかがいまで、みなとみらいせんを はしるよ。', places: ["よこはま", "もとまちちゅうかがい"], source: 'https://www.mm21railway.co.jp/global/english/info/pdf/map.pdf?202403=' },
    { text: 'しぶやから よこはまへ、とうきゅうせんと つながる でんしゃだよ。', places: ["しぶや", "よこはま", "とうきゅうせん"], source: 'https://www.mm21railway.co.jp/global/english/info/pdf/map.pdf?202403=' },
  ],
  'kyoto-jr': [
    { text: 'おおさかから きょうとへ、しんかいそくも はしる せんろだよ。', places: ["おおさか", "きょうと"], source: 'https://www.jr-odekake.net/eki/time_04/Shin-Osaka270301.htm' },
    { text: 'しんおおさかから きょうとへ、ふつうも はしる でんしゃだよ。', places: ["しんおおさか", "きょうと"], source: 'https://www.jr-odekake.net/eki/time_04/Shin-Osaka270301.htm' },
  ],
  'sagano': [
    { text: 'きょうとから かめおかや そのべへ、さがのせんを はしるよ。', places: ["きょうと", "かめおか", "そのべ"], source: 'https://timetable.jr-odekake.net/train-timetable/21741?date=20261012' },
    { text: 'うめこうじきょうとにしから きょうとへ、まちを むすぶよ。', places: ["うめこうじきょうとにし", "きょうと"], source: 'https://timetable.jr-odekake.net/train-timetable/21741?date=20261012' },
  ],
  'tokiwa-express': [
    { text: 'とうきょうから みとへ、じょうばんせんの とっきゅうも あるよ。', places: ["とうきょう", "みと"], source: 'https://www.jreast.co.jp/train/express/hitachi_tokiwa.html' },
    { text: 'いばらきの みとや かつたへ、じょうばんせんを はしるよ。', places: ["いばらき", "みと", "かつた", "じょうばんせん"], source: 'https://www.jreast.co.jp/train/express/hitachi_tokiwa.html' },
  ],
  'sazanami': [
    { text: 'とうきょうから ちばの きみつへ、うちぼうせんを はしるよ。', places: ["とうきょう", "ちば", "きみつ"], source: 'https://www.jreast.co.jp/chiba/railinfo/train/' },
    { text: 'ちばの きみつや きさらづの ほうへ むかう、とっきゅうだよ。', places: ["ちば", "きみつ", "きさらづ"], source: 'https://www.jreast.co.jp/chiba/railinfo/train/' },
  ],
  'shonan-express': [
    { text: 'とうきょうから おだわらへ、しょうなんの まちを むすぶよ。', places: ["とうきょう", "おだわら", "しょうなん"], source: 'https://timetables.jreast.co.jp/2610/train/065/068101.html' },
    { text: 'かながわの ひらつかや おだわらへ むかう、とっきゅうだよ。', places: ["かながわ", "ひらつか", "おだわら"], source: 'https://timetables.jreast.co.jp/2610/train/065/068101.html' },
  ],
  'kusatsu-shima': [
    { text: 'うえのから ながのはらくさつぐちへ、ぐんまを はしる とっきゅうだよ。', places: ["うえの", "ながのはらくさつぐち", "ぐんま"], source: 'https://www.jreast.co.jp/en/train/express/akagi.html' },
    { text: 'しぶかわから あがつませんへ、ぐんまの やまのほうへ むかうよ。', places: ["しぶかわ", "あがつません", "ぐんま"], source: 'https://www.jreast.co.jp/en/train/express/akagi.html' },
  ],
  'akagi': [
    { text: 'うえのから たかさきや まえばしへ、ぐんまを むすぶよ。', places: ["うえの", "たかさき", "まえばし", "ぐんま"], source: 'https://www.jreast.co.jp/en/train/express/akagi.html' },
    { text: 'ぐんまの たかさきや まえばしへ むかう、とっきゅうだよ。', places: ["ぐんま", "たかさき", "まえばし"], source: 'https://www.jreast.co.jp/en/train/express/akagi.html' },
  ],
  'revaty': [
    { text: 'あさくさから にっこうや きぬがわへ、とうぶの とっきゅうだよ。', places: ["あさくさ", "にっこう", "きぬがわ"], source: 'https://www.tobu.co.jp/railway/special_express/timetable/' },
    { text: 'とちぎの にっこうや きぬがわへ、あさくさから むかうよ。', places: ["とちぎ", "にっこう", "きぬがわ", "あさくさ"], source: 'https://www.tobu.co.jp/railway/special_express/timetable/' },
  ],
  'romancecar-gse': [
    { text: 'しんじゅくから はこねゆもとへ、はこねの とっきゅうだよ。', places: ["しんじゅく", "はこねゆもと", "はこね"], source: 'https://www.odakyu.jp/romancecar/' },
    { text: 'かながわの はこねへ むかう、おだきゅうの れっしゃだよ。', places: ["かながわ", "はこね", "おだきゅう"], source: 'https://www.odakyu.jp/romancecar/' },
  ],
  'fujisan-view': [
    { text: 'おおつきから かわぐちこまで、ふじさんの ふもとを はしるよ。', places: ["おおつき", "かわぐちこ", "ふじさん"], source: 'https://www.fujikyu-railway.jp/fujisan-view-express/' },
    { text: 'やまなしの かわぐちこへ むかう、ふじきゅうの れっしゃだよ。', places: ["やまなし", "かわぐちこ", "ふじきゅう"], source: 'https://www.fujikyu-railway.jp/fujisan-view-express/' },
  ],
  'book-kodama': [
    { text: 'しんおおさかから はかたまで、さんようしんかんせんを はしるよ。', places: ["しんおおさか", "はかた", "さんようしんかんせん"], source: 'https://www.jr-odekake.net/train/500/' },
    { text: 'おかやまや ひろしまを とおって、しんおおさかと はかたを むすぶよ。', places: ["おかやま", "ひろしま", "しんおおさか", "はかた"], source: 'https://www.jr-odekake.net/train/500/' },
  ],
  'book-hikari': [
    { text: 'とうきょうから しんおおさかへ、ひかりの しんかんせんで つなぐよ。', places: ["とうきょう", "しんおおさか"], source: 'https://railway.jr-central.co.jp/pwd/_pdf/N700S-every.pdf' },
    { text: 'さんようしんかんせんには、おかやままで むかう ひかりも あるよ。', places: ["さんようしんかんせん", "おかやま"], source: 'https://railway.jr-central.co.jp/pwd/_pdf/N700S-every.pdf' },
  ],
  'book-hikari-railstar': [
    { text: 'しんおおさかから はかたまで、さんようしんかんせんを はしるよ。', places: ["しんおおさか", "はかた", "さんようしんかんせん"], source: 'https://www.jr-odekake.net/railroad/train/700_8/' },
    { text: 'おおさかと ふくおかを むすぶ、さんようの れっしゃだよ。', places: ["おおさか", "ふくおか", "さんよう"], source: 'https://www.jr-odekake.net/railroad/train/700_8/' },
  ],
  'book-linear-chuo': [
    { text: 'やまなしの じっけんせんで、りにあの はしりかたを しらべているよ。', places: ["やまなし", "じっけんせん"], source: 'https://linear-chuo-shinkansen.jr-central.co.jp/yamanashi/about/' },
    { text: 'やまなしで ちゅうおうしんかんせんの じっけんを つづけているよ。', places: ["やまなし", "ちゅうおうしんかんせん"], source: 'https://linear-chuo-shinkansen.jr-central.co.jp/yamanashi/about/' },
  ],
  'book-east-i': [
    { text: 'とうほくや ほくりくの しんかんせんを、はしって てんけんするよ。', places: ["とうほく", "ほくりく"], source: 'https://www.jreast.co.jp/press/2025/20251007_ho02.pdf' },
    { text: 'じょうえつや あきたの しんかんせんも、せんろを しらべるよ。', places: ["じょうえつ", "あきた"], source: 'https://www.jreast.co.jp/press/2025/20251007_ho02.pdf' },
  ],
  'book-urbanliner': [
    { text: 'おおさかなんばから なごやへ、きんてつの とっきゅうだよ。', places: ["おおさかなんば", "なごや", "きんてつ"], source: 'https://www.kintetsu.co.jp/gyoumu/Express/train/urban.html' },
    { text: 'おおさかから なごやまで、まちを つなぐ れっしゃだよ。', places: ["おおさか", "なごや"], source: 'https://www.kintetsu.co.jp/gyoumu/Express/train/urban.html' },
  ],
  'book-alps-express': [
    { text: 'でんてつとやまから うなづきおんせんへ、むかし かんこうれっしゃで はしったよ。', places: ["でんてつとやま", "うなづきおんせん"], source: 'https://www.chitetsu.co.jp/?code=2&daycriterion=1&mode=3&page_id=1264' },
    { text: 'とやまの ちてつで、むかし しぜんを たのしむ たびを したよ。', places: ["とやま"], source: 'https://www.chitetsu.co.jp/?page_id=3838' },
  ],
  'book-elegant-saloon': [
    { text: 'おおさかから きょうとへ、けいはんせんで まちを むすぶよ。', places: ["おおさか", "きょうと", "けいはんせん"], source: 'https://www.keihan.co.jp/traffic/premiumcar/train/' },
    { text: 'きょうとと おおさかの まちを むすぶ、けいはんの れっしゃだよ。', places: ["きょうと", "おおさか", "けいはん"], source: 'https://www.keihan.co.jp/traffic/premiumcar/train/' },
  ],
  'book-ozora': [
    { text: 'さっぽろから くしろへ、ほっかいどうを よこぎる とっきゅうだよ。', places: ["さっぽろ", "くしろ", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr007_01.html' },
    { text: 'ほっかいどうの ひがし、くしろへ むかう れっしゃだよ。', places: ["ほっかいどう", "くしろ"], source: 'https://www.jrhokkaido.co.jp/train/tr007_01.html' },
  ],
  'book-kamui': [
    { text: 'さっぽろから あさひかわへ、ほっかいどうの まちを むすぶよ。', places: ["さっぽろ", "あさひかわ", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr013_01.html' },
    { text: 'あさひかわへ むかう、さっぽろはつの とっきゅうだよ。', places: ["あさひかわ", "さっぽろ"], source: 'https://www.jrhokkaido.co.jp/train/tr013_01.html' },
  ],
  'book-kounotori': [
    { text: 'しんおおさかから きのさきおんせんへ むかう とっきゅうも あるよ。', places: ["しんおおさか", "きのさきおんせん"], source: 'https://www.jr-odekake.net/railroad/train/kounotori/' },
    { text: 'ひょうごの とよおかや きのさきへ、さんいんせんを はしるよ。', places: ["ひょうご", "とよおか", "きのさき", "さんいんせん"], source: 'https://www.jr-odekake.net/railroad/train/kounotori/' },
  ],
  'book-sarobetsu': [
    { text: 'あさひかわから わっかないへ、ほっかいどうを はしる とっきゅうだよ。', places: ["あさひかわ", "わっかない", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr011_01.html' },
    { text: 'てしおがわぞいを とおって、ほっかいどうの わっかないへ むかうよ。', places: ["てしおがわ", "ほっかいどう", "わっかない"], source: 'https://www.jrhokkaido.co.jp/train/tr011_01.html' },
  ],
  'book-shinano': [
    { text: 'なごやから ながのへ、ちゅうおうせんの とっきゅうだよ。', places: ["なごや", "ながの", "ちゅうおうせん"], source: 'https://railway.jr-central.co.jp/train/express/detail_02_01/' },
    { text: 'きその やまなみを とおって、ながのへ むかう しなのだよ。', places: ["きそ", "ながの", "しなの"], source: 'https://railway.jr-central.co.jp/train/express/detail_02_01/' },
  ],
  'book-shirayuki': [
    { text: 'にいがたから じょうえつみょうこうへ むかう、とっきゅうも あるよ。', places: ["にいがた", "じょうえつみょうこう"], source: 'https://www.jreast.co.jp/train/express/inaho_shirayuki.html' },
    { text: 'じょうえつみょうこうや あらいから、にいがたへ むかうよ。', places: ["じょうえつみょうこう", "あらい", "にいがた"], source: 'https://www.jreast.co.jp/train/express/inaho_shirayuki.html' },
  ],
  'book-suzuran': [
    { text: 'さっぽろから むろらんへ、ほっかいどうを むすぶ とっきゅうだよ。', places: ["さっぽろ", "むろらん", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr012_01.html' },
    { text: 'ひがしむろらんを とおって、さっぽろと むろらんを むすぶよ。', places: ["ひがしむろらん", "さっぽろ", "むろらん"], source: 'https://www.jrhokkaido.co.jp/train/tr012_01.html' },
  ],
  'book-tsugaru': [
    { text: 'あきたから あおもりまで、おううほんせんを はしるよ。', places: ["あきた", "あおもり", "おううほんせん"], source: 'https://www.jreast.co.jp/train/express/tsugaru.html' },
    { text: 'あおもりと あきたの あいだを むすぶ、とっきゅうだよ。', places: ["あおもり", "あきた"], source: 'https://www.jreast.co.jp/train/express/tsugaru.html' },
  ],
  'book-tokachi': [
    { text: 'さっぽろから おびひろへ、ほっかいどうを はしる とっきゅうだよ。', places: ["さっぽろ", "おびひろ", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr005_01.html' },
    { text: 'とかちの おびひろへ むかう、ほっかいどうの れっしゃだよ。', places: ["とかち", "おびひろ", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr005_01.html' },
  ],
  'book-hamakaze': [
    { text: 'おおさかから とっとりや きのさきおんせんへ むかう とっきゅうだよ。', places: ["おおさか", "とっとり", "きのさきおんせん"], source: 'https://www.jr-odekake.net/railroad/train/hamakaze/' },
    { text: 'ひょうごの とよおかや かすみを とおって、とっとりへ はしるよ。', places: ["ひょうご", "とよおか", "かすみ", "とっとり"], source: 'https://www.jr-odekake.net/railroad/train/hamakaze/' },
  ],
  'book-hida': [
    { text: 'なごやから たかやまへ、ひだの まちを むすぶ とっきゅうだよ。', places: ["なごや", "たかやま", "ひだ"], source: 'https://railway.jr-central.co.jp/train/express/detail_02_08/index.html' },
    { text: 'ぎふの ひだちほうから たかやまへ、まちを むすんで はしるよ。', places: ["ぎふ", "ひだちほう", "たかやま"], source: 'https://railway.jr-central.co.jp/train/express/detail_02_08/index.html' },
  ],
  'book-fujisan-tokkyu': [
    { text: 'おおつきから かわぐちこへ、ふじさんの ふもとを はしるよ。', places: ["おおつき", "かわぐちこ", "ふじさん"], source: 'https://www.fujikyu-railway.jp/train/fujisan_express.php' },
    { text: 'やまなしの かわぐちこへ むかう、ふじさんとっきゅうだよ。', places: ["やまなし", "かわぐちこ"], source: 'https://www.fujikyu-railway.jp/train/fujisan_express.php' },
  ],
  'book-yukemuri': [
    { text: 'ながのけんの ながのから ゆだなかへ、ながのでんてつを はしるよ。', places: ["ながの", "ゆだなか", "ながのでんてつ"], source: 'https://www.nagaden-net.co.jp/news/docs/nagaden-reserve1.pdf?hsLang=ja' },
    { text: 'ながのけんの やまを こえて、ゆだなかへ むかう とっきゅうだよ。', places: ["ながのけん", "ゆだなか"], source: 'https://www.nagaden-net.co.jp/news/docs/nagaden-reserve1.pdf?hsLang=ja' },
  ],
  'book-lilac': [
    { text: 'さっぽろから あさひかわへ、ほっかいどうの とっきゅうだよ。', places: ["さっぽろ", "あさひかわ", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr033_01.html' },
    { text: 'ほっかいどうの まんなかを とおって、あさひかわへ むかうよ。', places: ["ほっかいどう", "あさひかわ"], source: 'https://www.jrhokkaido.co.jp/train/tr033_01.html' },
  ],
  'book-soya': [
    { text: 'さっぽろから わっかないへ、ほっかいどうを きたへ むかう とっきゅうだよ。', places: ["さっぽろ", "わっかない", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr000_01.html' },
    { text: 'そうやの わっかないへ むかう、ほっかいどうの れっしゃだよ。', places: ["そうや", "わっかない", "ほっかいどう"], source: 'https://www.jrhokkaido.co.jp/train/tr000_01.html' },
  ],
  'book-noto-kagaribi': [
    { text: 'かなざわから わくらおんせんへ、いしかわを はしるよ。', places: ["かなざわ", "わくらおんせん", "いしかわ"], source: 'https://www.jr-odekake.net/railroad/train/notokagaribi/' },
    { text: 'のとの ななおや わくらおんせんへ、かなざわから むかうよ。', places: ["のと", "ななお", "わくらおんせん", "かなざわ"], source: 'https://www.jr-odekake.net/railroad/train/notokagaribi/' },
  ],
  'book-36plus3': [
    { text: 'はかたから かごしまへ むかう たびなど、きゅうしゅうを めぐるよ。', places: ["はかた", "かごしま", "きゅうしゅう"], source: 'https://www.jrkyushu-36plus3.jp/' },
    { text: 'ようびで かわる きゅうしゅうの みちを、れっしゃで めぐるよ。', places: ["きゅうしゅう"], source: 'https://www.jrkyushu-36plus3.jp/' },
  ],
  'book-52seki': [
    { text: 'いけぶくろや しんじゅくから ちちぶへ、せいぶせんを はしるよ。', places: ["いけぶくろ", "しんじゅく", "ちちぶ", "せいぶせん"], source: 'https://www.seiburailway.jp/railways/seibu52-shifuku/overview/' },
    { text: 'さいたまの ちちぶへ でかける、せいぶの かんこうれっしゃだよ。', places: ["さいたま", "ちちぶ", "せいぶ"], source: 'https://www.seiburailway.jp/railways/seibu52-shifuku/overview/' },
  ],
  'book-bbbase': [
    { text: 'りょうごくから ちょうしへ、ちばを めぐる たびも あるよ。', places: ["りょうごく", "ちょうし", "ちば"], source: 'https://www.jreast.co.jp/railway/joyful/bbbase.html' },
    { text: 'ちばの うみぞいへ、じてんしゃを のせて りょうごくから むかうよ。', places: ["ちば", "りょうごく"], source: 'https://www.jreast.co.jp/railway/joyful/bbbase.html' },
  ],
  'book-etsetora': [
    { text: 'ひろしまから みはらへ、せとうちの うみぞいを はしるよ。', places: ["ひろしま", "みはら", "せとうち"], source: 'https://www.jr-odekake.net/railroad/kankoutrain/etsetora/' },
    { text: 'くれせんを とおって、ひろしまから みはらの うみべを めぐるよ。', places: ["くれせん", "ひろしま"], source: 'https://www.jr-odekake.net/railroad/kankoutrain/etsetora/' },
  ],
  'book-highrail1375': [
    { text: 'こぶちざわから こもろへ、やまなしと ながのを むすぶよ。', places: ["こぶちざわ", "こもろ", "やまなし", "ながの"], source: 'https://www.jreast.co.jp/railway/joyful/highrail1375.html' },
    { text: 'やつがたけの ふもとから さくだいらへ、こうみせんを はしるよ。', places: ["やつがたけ", "さくだいら", "こうみせん"], source: 'https://www.jreast.co.jp/railway/joyful/highrail1375.html' },
  ],
  'book-pokemon-with-you': [
    { text: 'いちのせきから けせんぬまへ、おおふなとせんを はしるよ。', places: ["いちのせき", "けせんぬま", "おおふなとせん"], source: 'https://www.jreast.co.jp/railway/joyful/pokemon.html' },
    { text: 'とうほくの けせんぬまへ むかう、こどもの たびの れっしゃだよ。', places: ["とうほく", "けせんぬま"], source: 'https://www.jreast.co.jp/railway/joyful/pokemon.html' },
  ],
  'book-royal-express': [
    { text: 'よこはまから いずきゅうしもだへ、いずの うみぞいを はしるよ。', places: ["よこはま", "いずきゅうしもだ", "いず"], source: 'https://www.the-royalexpress.jp/plan/4697/' },
    { text: 'いずきゅうしもだへ むかう いずの たびでは、れっしゃで ごはんを たべるよ。', places: ["いずきゅうしもだ", "いず"], source: 'https://www.the-royalexpress.jp/plan/4697/' },
  ],
  'book-tohoku-emotion': [
    { text: 'はちのへから くじへ、あおもりと いわての うみぞいを はしるよ。', places: ["はちのへ", "くじ", "あおもり", "いわて"], source: 'https://www.jreast.co.jp/tohokuemotion/' },
    { text: 'さんりくの うみを ながめて、はちのへと くじを むすぶよ。', places: ["さんりく", "はちのへ", "くじ"], source: 'https://www.jreast.co.jp/tohokuemotion/' },
  ],
  'book-shikishima': [
    { text: 'うえのから いわてや あおもりを めぐる、ふゆの たびも あるよ。', places: ["うえの", "いわて", "あおもり"], source: 'https://www.jreast.co.jp/shiki-shima/2026course23winter.html' },
    { text: 'うえのから やまなしの こぶちざわや はくしゅうへ むかう、ふゆの たびも あるよ。', places: ["うえの", "やまなし", "こぶちざわ", "はくしゅう"], source: 'https://www.jreast.co.jp/shiki-shima/2026course12winter.html' },
  ],
  'book-west-express-ginga': [
    { text: 'おおさかから いずもへ、さんいんを めぐる たびも あるよ。', places: ["おおさか", "いずも", "さんいん"], source: 'https://www.jr-odekake.net/railroad/westexginga/train/' },
    { text: 'さんいんや さんようの まちを むすぶ、にしにほんの れっしゃだよ。', places: ["さんいん", "さんよう", "にしにほん"], source: 'https://www.jr-odekake.net/railroad/westexginga/train/' },
  ],
  'book-aoniyoshi': [
    { text: 'おおさかから ならや きょうとへ、きんてつで むかうよ。', places: ["おおさか", "なら", "きょうと", "きんてつ"], source: 'https://www.kintetsu.co.jp/senden/aoniyoshi/about/' },
    { text: 'ならと きょうとの まちを むすぶ、かんこうとっきゅうだよ。', places: ["なら", "きょうと"], source: 'https://www.kintetsu.co.jp/senden/aoniyoshi/about/' },
  ],
  'book-isaburo-shinpei': [
    { text: 'むかし ひとよしから よしまつまで、ひさつせんを はしったよ。', places: ["ひとよし", "よしまつ", "ひさつせん"], source: 'https://www.jrkyushu.co.jp/company/ir/library/individual_investors/pdf/jrkyushureport2018.pdf' },
    { text: 'くまもとの ひとよしから かごしまの よしまつへ、むかし むすんだよ。', places: ["くまもと", "ひとよし", "かごしま", "よしまつ"], source: 'https://www.jrkyushu.co.jp/company/ir/library/individual_investors/pdf/jrkyushureport2018.pdf' },
  ],
};
