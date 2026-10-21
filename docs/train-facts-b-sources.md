# 電車紹介文 B：一次資料と確認記録

確認日：2026年10月21日。

対象は Node で `src/data.js` の `TRAINS.slice(52,104)` を取得した52件（0始まりの52〜103、`toyoko`〜`thunderbird`）。`src/train-facts-b.js` に各2文、計104文を収録する。対象に既存の `t.sources` はなかった。既存の `docs/quiz-trains-2026.md`、`docs/prefix-train-sources.md`、`docs/go-home-train-coverage.md`、`docs/book-local-work-sources.md` も読み、車両の同定と既存調査の公式URLを確認した。

以下のURLは運行会社・会社グループ自身が公開した資料。Webで本文・検索結果の抜粋・PDFを確認し、幼児向けに言い換えた。公式路線図は路線の区間・直通表示、公式車両紹介は設備と役割を根拠とする。画像だけで分かる車体の色・形・窓・番号・大きさ・描かれた動物の説明、および既存 `detail` の文章の転用は使わない。各文は1文、15〜55文字の範囲とした。

## 時制と適用範囲

- カシオペアとE4系は「むかし」と明記。過去の公式車両紹介が残っていても現在運行と解釈しない。
- ALFA-Xは技術を「ためす」試験車両。旅客営業列車として紹介しない。
- E10系は2025年3月4日の設計着手発表に基づく開発中の車両。営業開始予定年・最高速度は載せず、開発対象と具体的な地震対策設計を紹介する。
- ドクターSは2026年4月16日の名称発表に基づく「営業車で検測するための車両」と、T4のアルミ部材の再利用。検測機器は2027年1月運用開始予定という発表なので、現在すでに検測業務中とは書かない。
- ドクターイエローは検測の役割を紹介し、引退したJR東海T4とJR西日本T5の状況を混同して全編成が運行中／引退済みとはしない。
- やまびこの設備はイラストに対応するE5系のもの。総武線は画像に対応する中央・総武線各駅停車。スペーシアは100系で、スペーシアXの設備を流用しない。
- アンパンマン列車は既存IDが列車群の総称なので、プレイルームは「なかまには」と限定し、すべての車両の設備としない。
- 直通列車・個室等は「も」「ある」等で限定し、全列車への一律適用、無予約利用、常時利用可能を保証しない。あそぼーい！の遊び場は追加運転日等に利用できない場合がある。
- 運賃・最高速度・発車時刻・運行回数・曖昧な開業計画は本文に採用しない。

## 104文の根拠

### 52. `toyoko`

1. ちかてつの ふくとしんせんへ、そのまま はいる でんしゃも あるんだよ。
   - 確認した内容：副都心線と東急東横線の相互直通。全列車とはしない。
   - [一次資料](https://www.tokyometro.jp/corporate/ir/library/factbook/pdf/factbook_2025.pdf)
2. しんよこはまへ むかう でんしゃは、ひよしで みちが わかれるんだよ。
   - 確認した内容：日吉から東急新横浜線へ分岐する直通列車の案内。
   - [一次資料](https://www.tokyu.co.jp/railway/ty/)

### 53. `hanzomon`

1. しぶやと おしあげを むすぶ、とうきょうの ちかてつだよ。
   - 確認した内容：路線の両端は渋谷・押上。
   - [一次資料](https://www.tokyometro.jp/station/line_hanzomon/index.html)
2. とうきゅうや とうぶの せんろまで、そのまま はしる でんしゃも あるんだよ。
   - 確認した内容：半蔵門線は東急田園都市線、東武伊勢崎線・日光線と相互直通。
   - [一次資料](https://www.tokyometro.jp/corporate/ir/library/factbook/pdf/factbook_2025.pdf)

### 54. `fukutoshin`

1. いけぶくろや しんじゅくさんちょうめを とおる ちかてつだよ。
   - 確認した内容：路線の駅一覧で池袋・新宿三丁目を確認。
   - [一次資料](https://www.tokyometro.jp/station/line_fukutoshin/index.html)
2. ちかてつだけど、えきを とばして はしる きゅうこうも あるんだよ。
   - 確認した内容：急行・通勤急行の停車駅表。地下鉄でも速達運転を行うという別の情報。
   - [一次資料](https://www.tokyometro.jp/station/line_fukutoshin/index.html)

### 55. `laview`

1. いけぶくろから ちちぶへの たびを たすける、とっきゅうだよ。
   - 確認した内容：池袋線・西武秩父線の特急ラビュー。
   - [一次資料](https://www.seiburailway.jp/railway/reservedtrain/laview/)
2. あかちゃんの おむつを かえられる、べっども あるんだよ。
   - 確認した内容：多目的トイレにベビーベッドとベビーチェアを設置。
   - [一次資料](https://www.seiburailway.jp/railways/laview/design.html)

### 56. `sotetsu`

1. よこはまから えびなへ、おきゃくさんを はこぶ でんしゃだよ。
   - 確認した内容：相鉄本線の横浜・海老名間。相鉄の路線紹介として記述。
   - [一次資料](https://www.sotetsu.co.jp/train/stations/)
2. ほかの かいしゃの せんろを とおって、とうきょうへも いけるんだよ。
   - 確認した内容：JR線・東急線への直通で都心と直結。
   - [一次資料](https://www.sotetsu.co.jp/about/companies/transportation/)

### 57. `nanbu`

1. かわさきと たちかわを むすぶ、おでかけの でんしゃだよ。
   - 確認した内容：南武線本線の川崎～立川を確認。
   - [一次資料](https://www.jreast.co.jp/press/2016/yokohama/20170126_y02.pdf)
2. ぜんぶの えきに とまる でんしゃの ほかに、かいそくも あるんだよ。
   - 確認した内容：各駅停車と快速の運転・待ち合わせの説明。時刻値は採用しない。
   - [一次資料](https://www.jreast.co.jp/hachioji/20161216/20161216_info04.pdf)

### 58. `hinotori`

1. おおさかと なごやの あいだを、たびする とっきゅうだよ。
   - 確認した内容：大阪難波・近鉄名古屋間を運行。
   - [一次資料](https://www.kintetsu.co.jp/senden/hinotori/about/)
2. おおきな にもつを あずけられる、ろっかーが あるんだよ。
   - 確認した内容：大型荷物を収納できる車内ロッカー。料金や空きは記載しない。
   - [一次資料](https://www.kintetsu.co.jp/senden/hinotori/about/)

### 59. `midosuji`

1. えさかから なかもずまで、おおさかを むすぶ ちかてつだよ。
   - 確認した内容：御堂筋線の江坂～なかもず。
   - [一次資料](https://subway.osakametro.co.jp/station_guide/index.php)
2. えさかから さきは、きたおおさかきゅうこうの せんろも はしるんだよ。
   - 確認した内容：北大阪急行線との相互直通。
   - [一次資料](https://subway.osakametro.co.jp/station_guide/M/m11/joukouichi.php)

### 60. `yamabiko`

1. とうほくしんかんせんで、まちと まちを むすぶ れっしゃだよ。
   - 確認した内容：やまびこに使うE5系と東北新幹線の運行を確認。
   - [一次資料](https://www.jreast.co.jp/train/shinkan/e5.html)
2. ゆれを おさえて、のりごこちを よくする しくみが あるんだよ。
   - 確認した内容：画像に対応するE5系のフルアクティブサスペンション・車体傾斜装置。全形式一般には拡張しない。
   - [一次資料](https://www.jreast.co.jp/train/shinkan/e5.html)

### 61. `yurikamome`

1. うんてんしさんが いなくても、じどうで はしれるんだよ。
   - 確認した内容：自動運転のしくみ。通常の無人自動運転を指し、全状況で乗務しないとはしない。
   - [一次資料](https://www.yurikamome.co.jp/station/)
2. とうきょうで したしまれている、とりの なまえを もらったんだよ。
   - 確認した内容：愛称は都民の鳥ユリカモメに由来。車体に描かれた動物の説明ではない。
   - [一次資料](https://form.yurikamome.co.jp/help/qa.html)

### 62. `saphir-odoriko`

1. かぞくで ゆっくり すごせる、せんようの おへやも あるんだよ。
   - 確認した内容：グリーン個室を設置。別途予約等が必要なことを否定する表現はしない。
   - [一次資料](https://www.jreast.co.jp/saphir/cars/)
2. れっしゃの なかに、おりょうりを たのしむ ばしょも あるんだよ。
   - 確認した内容：カフェテリアで料理を提供。期間限定メニューや時刻は採用しない。
   - [一次資料](https://www.jreast.co.jp/saphir/food/)

### 63. `joban`

1. うえのから まつどや かしわへ、でんしゃの みちが つづくんだよ。
   - 確認した内容：常磐線の上野・松戸・柏の位置関係。
   - [一次資料](https://www.jreast.co.jp/map/pdf/map_tokyo.pdf)
2. かくえきていしゃは、ちよだせんの ちかてつにも はいるんだよ。
   - 確認した内容：常磐線各駅停車は千代田線と相互直通。快速・特急と混同しない。
   - [一次資料](https://www.tokyometro.jp/corporate/ir/library/factbook/pdf/factbook_2025.pdf)

### 64. `sl-taiju`

1. しもいまいちと きぬがわおんせんを むすぶ、れっしゃだよ。
   - 確認した内容：SL大樹の鬼怒川温泉～下今市運行。
   - [一次資料](https://www.tobu.co.jp/sl/fun/)
2. たいじゅは、むかしの しょうぐんを よぶ とくべつな なまえでも あるんだよ。
   - 確認した内容：大樹は将軍の別称・尊称に由来。
   - [一次資料](https://www.tobu.co.jp/sl/fun/)

### 65. `saikyo`

1. しんじゅくや いけぶくろと、さいたまを むすぶ でんしゃだよ。
   - 確認した内容：埼京線の新宿・池袋～埼玉方面の路線図。
   - [一次資料](https://www.jreast.co.jp/map/pdf/map_tokyo.pdf)
2. りんかいせんへ はいって、おだいばの ほうへ いく でんしゃも あるんだよ。
   - 確認した内容：埼京線とりんかい線の直通表示。全列車の行先にはしない。
   - [一次資料](https://www.jreast.co.jp/map/pdf/map_tokyo.pdf)

### 66. `spacia`

1. きぬがわおんせんの まちへの、たびを たすける とっきゅうだよ。
   - 確認した内容：100系スペーシアの「きぬ」は鬼怒川温泉発着。既存detailの日光方面から別の行先へ。
   - [一次資料](https://www.tobu.co.jp/railway/special_express/vehicle/spacia/)
2. かぞくや おともだちと すごせる、こしつも あるんだよ。
   - 確認した内容：100系のコンパートメントルーム。スペーシアXとは混同しない。
   - [一次資料](https://www.tobu.co.jp/railway/special_express/vehicle/spacia/)

### 67. `dennentoshi`

1. しぶやと ちゅうおうりんかんを むすぶ、でんしゃだよ。
   - 確認した内容：田園都市線の両端。
   - [一次資料](https://www.tokyu.co.jp/railway/dt/)
2. しぶやから はんぞうもんせんへ、そのまま すすむ でんしゃも あるんだよ。
   - 確認した内容：田園都市線と半蔵門線の相互直通。
   - [一次資料](https://www.tokyometro.jp/corporate/ir/library/factbook/pdf/factbook_2025.pdf)

### 68. `ginza`

1. あさくさと しぶやを むすぶ、とうきょうの ちかてつだよ。
   - 確認した内容：銀座線の浅草～渋谷。
   - [一次資料](https://www.tokyometro.jp/station/line_ginza/index.html)
2. にほんで はじめての ちかてつは、この ろせんの いちぶだったんだよ。
   - 確認した内容：1927年に浅草～上野間が日本初の地下鉄として開業。今の全区間が最初から開業したとはしない。
   - [一次資料](https://www.tokyometro.jp/news/2009/2009-08.html)

### 69. `odakyu`

1. しんじゅくから おだわらへ、おきゃくさんを はこぶ でんしゃだよ。
   - 確認した内容：小田原線の新宿～小田原。
   - [一次資料](https://www.odakyu.jp/company/handbook/2021/book/pageindices/index27.html)
2. ちかてつの ちよだせんへ、そのまま はいる でんしゃも あるんだよ。
   - 確認した内容：小田急小田原線・多摩線と千代田線の相互直通。
   - [一次資料](https://www.tokyometro.jp/corporate/ir/library/factbook/pdf/factbook_2025.pdf)

### 70. `doctor-yellow`

1. しんかんせんの せんろの ゆがみを、しらべる おしごとを するんだよ。
   - 確認した内容：ドクターイエローの線路の歪み検査。T4引退済み・T5継続のため編成別の現在運行は断言しない。
   - [一次資料](https://market.jr-central.co.jp/shop/e/eomamori/?ismodesmartphone=on)
2. でんしゃに でんきを おくる、でんせんの ぐあいも しらべるんだよ。
   - 確認した内容：軌道検測とは別の、架線等の電気設備検査。単なる言い換えではなく検査対象を分ける。
   - [一次資料](https://company.jr-central.co.jp/ir/annualreport/_pdf/annualreport2021.pdf)

### 71. `keihin-tohoku`

1. おおみやから とうきょうを とおり、よこはまへも いけるんだよ。
   - 確認した内容：京浜東北線の大宮・東京・横浜。
   - [一次資料](https://www.jreast.co.jp/map/pdf/map_tokyo.pdf)
2. ねぎしせんへ つづけて はしるから、おおふなまで いけるんだよ。
   - 確認した内容：京浜東北線・根岸線は大宮～大船。前項の都市間輸送とは別に、別名路線への直通を説明。
   - [一次資料](https://www.jreast.co.jp/estation/facility_search.aspx?searchCategoryCd=1)

### 72. `shonan-monorail`

1. おおふなと しょうなんえのしまを むすぶ、のりものだよ。
   - 確認した内容：大船～湘南江の島。
   - [一次資料](https://www.shonan-monorail.co.jp/company/index.html)
2. そらの うえだけでなく、とんねるを くぐる ところも あるんだよ。
   - 確認した内容：起伏のある土地を走りトンネルを通る説明。懸垂式という既存detailは流用しない。
   - [一次資料](https://www.shonan-monorail.co.jp/company/index.html)

### 73. `sobu`

1. ちばから みたかへ、まちを つなぐ でんしゃだよ。
   - 確認した内容：画像の黄色帯車両に対応する中央・総武線各駅停車。快速とは区別。
   - [一次資料](https://www.jreast.co.jp/chiba/news/pdf/pre1912_daikai.pdf)
2. かくえきていしゃだから、ひとつずつ えきに とまって すすむんだよ。
   - 確認した内容：中央線総武線各駅停車の駅一覧。区間の説明と停車種別の説明を分ける。
   - [一次資料](https://www.jreast.co.jp/estation/facility_result.aspx?SearchCategoryCd=4&mode=2&rosen=81%3D1%3D%E4%B8%AD%E5%A4%AE%E7%B7%9A%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%90%84%E9%A7%85%E5%81%9C%E8%BB%8A)

### 74. `keio-5000`

1. すわる いすの むきを、つかいかたに あわせて かえられるんだよ。
   - 確認した内容：5000系は座席指定時クロスシート、通常時ロングシートへ転換。乗客が自由に動かせるとはしない。
   - [一次資料](https://www.keio.co.jp/news/update/news_release/news_release2017/nr170426_zasekishitei.pdf)
2. いすの そばの こんせんとで、すまーとふぉんを じゅうでんできるんだよ。
   - 確認した内容：電源コンセントを設置。
   - [一次資料](https://www.keio.co.jp/news/update/news_release/news_release2017/nr170426_zasekishitei.pdf)

### 75. `arakawa`

1. みのわばしから わせだまで、まちを むすぶ でんしゃだよ。
   - 確認した内容：早稲田～三ノ輪橋の運行。
   - [一次資料](https://www.kotsu.metro.tokyo.jp/toden/timetable/1BD.html)
2. はるには、せんろの そばの さくらを みられる ところも あるんだよ。
   - 確認した内容：荒川自然公園付近では都電から桜を眺められる。車体に描かれた花や動物ではない。
   - [一次資料](https://www.kotsu.metro.tokyo.jp/toden/kanren/spot_sakura/arakawa_sizen_park.html)

### 76. `newshuttle`

1. さいたまの おおみやから、うちじゅくへ いく でんしゃだよ。
   - 確認した内容：大宮・内宿を結ぶ駅一覧。
   - [一次資料](https://www.new-shuttle.jp/)
2. てつどうはくぶつかんへ あそびに いくときにも、つかえるんだよ。
   - 確認した内容：鉄道博物館駅を通る。前項の両端駅とは別に博物館へのアクセスという役割。
   - [一次資料](https://www.new-shuttle.jp/)

### 77. `yurakucho`

1. わこうしと しんきばを むすぶ、ちかてつだよ。
   - 確認した内容：有楽町線の両端。
   - [一次資料](https://www.tokyometro.jp/station/line_yurakucho/index.html)
2. せいぶや とうぶの せんろへも、そのまま はしる でんしゃが あるんだよ。
   - 確認した内容：有楽町線は西武池袋線・有楽町線、東武東上線と相互直通。
   - [一次資料](https://www.tokyometro.jp/corporate/ir/library/factbook/pdf/factbook_2025.pdf)

### 78. `hibiya`

1. きたせんじゅと なかめぐろを むすぶ、ちかてつだよ。
   - 確認した内容：日比谷線の北千住～中目黒。
   - [一次資料](https://www.tokyometro.jp/station/line_hibiya/index.html)
2. とうぶの せんろへも、そのまま はしる でんしゃが あるんだよ。
   - 確認した内容：日比谷線は東武伊勢崎線・日光線と相互直通。
   - [一次資料](https://www.tokyometro.jp/corporate/ir/library/factbook/pdf/factbook_2025.pdf)

### 79. `tozai`

1. なかのと にしふなばしを むすぶ、ちかてつだよ。
   - 確認した内容：東西線の中野～西船橋。
   - [一次資料](https://www.tokyometro.jp/station/line_tozai/index.html)
2. ちかてつだけど、いくつかの えきに とまらない かいそくも あるんだよ。
   - 確認した内容：快速停車駅一覧。
   - [一次資料](https://www.tokyometro.jp/station/line_tozai/index.html)

### 80. `namboku`

1. めぐろと あかばねいわぶちを むすぶ、ちかてつだよ。
   - 確認した内容：南北線の両端。
   - [一次資料](https://www.tokyometro.jp/station/line_namboku/index.html)
2. ほーむの とびらが、せんろへ おちないように まもってくれるんだよ。
   - 確認した内容：南北線各駅のホームドアによる安全性向上。車体の外観ではなく駅の安全設備の役割。
   - [一次資料](https://www.tokyometro.jp/corporate/csr/report/pdf/report2017.pdf)

### 81. `oedo`

1. ひかりがおかや しんじゅくを とおる、ちかてつだよ。
   - 確認した内容：大江戸線の駅一覧。
   - [一次資料](https://www.kotsu.metro.tokyo.jp/subway/oedo/index.html)
2. じしゃくの ちからを つかって、しゃりんを ころがしながら すすむんだよ。
   - 確認した内容：車輪式リニアモータを採用。浮いて走る超電導リニアとは区別。
   - [一次資料](https://www.kotsu.metro.tokyo.jp/about/service/pdf/kotsu_aramashi_2023.pdf)

### 82. `hello-kitty-haruka`

1. きょうとから ひこうきに のる ひとの、たびも たすける とっきゅうだよ。
   - 確認した内容：関西空港と京都を結び旅行者をもてなす役割。既存detailの行先紹介の流用を避ける。
   - [一次資料](https://www.westjr.co.jp/press/article/2019/01/page_13666.html)
2. たびの おおきな にもつを、おいておける ばしょが あるんだよ。
   - 確認した内容：はるかの荷物置き場・荷物スペース。
   - [一次資料](https://www.jr-odekake.net/railroad/train/haruka/)

### 83. `hankyu`

1. おおさかから こうべや きょうとへ、みんなを はこぶ でんしゃだよ。
   - 確認した内容：阪急の神戸線・京都線。
   - [一次資料](https://www.hankyu.co.jp/station/index.html)
2. むかしは、たからづかや みのおへ いく せんろから はじまったんだよ。
   - 確認した内容：1910年に前身の箕面有馬電気軌道が宝塚本線・箕面支線の営業開始。
   - [一次資料](https://www.hankyu.co.jp/topics/50th/hankyu_ensen.pdf)

### 84. `russell-snowplow`

1. せんろの ゆきを、よこへ おしのけて みちを あけるんだよ。
   - 確認した内容：ラッセル装置の除雪方法。単に「雪をどける」という既存detailより仕組みを具体化。
   - [一次資料](https://www.jrhokkaido.co.jp/corporate/safe/03.html)
2. ゆきの おおい ほっかいどうでも、でんしゃの みちを まもるんだよ。
   - 確認した内容：全道へのラッセル車配備と冬期の安全・安定輸送確保。前項の除雪方法に対して使用地域・目的。
   - [一次資料](https://www.jrhokkaido.co.jp/CM/Info/press/pdf/20241120_KO_winter.pdf)

### 85. `cassiopeia`

1. むかし、うえのと さっぽろの あいだを はしった れっしゃだよ。
   - 確認した内容：かつての上野～札幌の寝台特急。現行運行とはしない。
   - [一次資料](https://event.jreast.co.jp/pages/cassiopeia)
2. むかしは、れっしゃの おへやの べっどで ねむって たびが できたんだよ。
   - 確認した内容：個室寝台カシオペアツイン等。引退後の展示と走行を混同しない。
   - [一次資料](https://event.jreast.co.jp/pages/cassiopeia)

### 86. `twilight-mizukaze`

1. れっしゃの おへやに とまって、ねむりながら たびが できるんだよ。
   - 確認した内容：ロイヤルツイン等の寝室・ベッド。
   - [一次資料](https://www.twilightexpress-mizukaze.jp/about/train/cars.html)
2. れっしゃの なかで おりょうりを つくる、だいどころも あるんだよ。
   - 確認した内容：食堂車のオープンキッチンと車内調理。
   - [一次資料](https://www.twilightexpress-mizukaze.jp/about/train/cars.html)

### 87. `osaka-loop`

1. おおさかの まちを、ぐるっと わに なって むすぶ でんしゃだよ。
   - 確認した内容：環状運転開始記念日と環状線の説明。すべての列車が周回し続けるとはしない。
   - [一次資料](https://www.westjr.co.jp/press/article/2015/03/page_6940.html)
2. えきごとに ちがう おんがくで、しゅっぱつを しらせるんだよ。
   - 確認した内容：全19駅に駅ごとの発車メロディを導入。
   - [一次資料](https://www.westjr.co.jp/press/article/2015/03/page_6940.html)

### 88. `alfa-x`

1. あたらしい しんかんせんの しくみを、ためすための れっしゃだよ。
   - 確認した内容：次世代技術開発のための試験車両。旅客営業列車とはしない。
   - [一次資料](https://recruit.jreast.co.jp/business/pj_alfax/)
2. じしんの ときに、はやく とまるための しくみも ためすんだよ。
   - 確認した内容：地震発生時のブレーキ力補助・停止距離短縮の技術開発。
   - [一次資料](https://recruit.jreast.co.jp/business/pj_alfax/)

### 89. `e4-max`

1. むかし、にいがたの ほうへ はしった しんかんせんだよ。
   - 確認した内容：上越新幹線での運行と2021年の定期運行終了。
   - [一次資料](https://www.jreast.co.jp/en/niigata/maxlastrun/history.html)
2. むかしは、つばさと つながって はしることも あったんだよ。
   - 確認した内容：1999年に「つばさ」と併結開始、2012年に終了。2階建てという外観は使用しない。
   - [一次資料](https://www.jreast.co.jp/en/niigata/maxlastrun/history.html)

### 90. `anpanman`

1. しこくの あちこちで、おでかけする ひとを はこんでいるんだよ。
   - 確認した内容：アンパンマン列車群は四国各県の路線で運転。特定形式へ限定しない既存IDとして説明。
   - [一次資料](https://www.jr-shikoku.co.jp/03_news/jr_news/assets/2025/10/28/457_jR459neWs.pdf)
2. なかには、くつを ぬいで あそべる おへやの ある れっしゃも あるんだよ。
   - 確認した内容：列車群のうち、ゆうゆうアンパンマンカーにはプレイルーム。全車共通の設備と誤解させない限定表現。
   - [一次資料](https://www.jr-shikoku.co.jp/03_news/jr_news/assets/2025/10/28/457_jR459neWs.pdf)

### 91. `asoboy`

1. あそ と あそぼうの ふたつの ことばを、なまえに こめたんだよ。
   - 確認した内容：名称に「阿蘇」と「遊ぼう」の二つの意味。
   - [一次資料](https://www.jrkyushu.co.jp/trains/asoboy/index.html)
2. こどもが えほんを よんだり あそんだりできる、おへやが あるんだよ。
   - 確認した内容：くろクラブと絵本コーナー。追加運転日など利用不可の例があるので常時利用可能とはしない。
   - [一次資料](https://www.jrkyushu.co.jp/trains/asoboy/index.html)

### 92. `mu-sky`

1. なごやから ちゅうぶこくさいくうこうへ、むかう とっきゅうだよ。
   - 確認した内容：名鉄名古屋～中部国際空港を中心に運行。
   - [一次資料](https://www.meitetsu.co.jp/train/guidance/first_class_car/)
2. すわる ばしょを さきに きめる、していせきの れっしゃだよ。
   - 確認した内容：ミュースカイは全車特別車、特別車は座席指定車両。
   - [一次資料](https://faq.meitetsu.co.jp/s/article/%E5%85%A8%E8%BB%8A%E7%89%B9%E5%88%A5%E8%BB%8A-%E4%B8%80%E9%83%A8%E7%89%B9%E5%88%A5%E8%BB%8A%E3%81%A8%E3%81%AF%E4%BD%95%E3%81%A7%E3%81%99%E3%81%8B)

### 93. `keiyo`

1. とうきょうと ちばの そがを むすぶ、でんしゃだよ。
   - 確認した内容：京葉線の東京～蘇我。
   - [一次資料](https://www.jreast.co.jp/estation/facility_search.aspx?searchCategoryCd=1)
2. うみべの かさいりんかいこうえんへも、でんしゃで いけるんだよ。
   - 確認した内容：沿線の葛西臨海公園駅とベイサイド地域。都市間区間とは別の公園アクセスの役割。
   - [一次資料](https://www.jreast.co.jp/chiba/bsl/conceptbook.pdf)

### 94. `tobu-tojo`

1. いけぶくろから かわごえの まちへ、いける でんしゃだよ。
   - 確認した内容：東上線の池袋・川越を確認。
   - [一次資料](https://www.tobu.co.jp/railway/guide/line/tojo_line.html)
2. ちかてつの せんろへも、そのまま はいる でんしゃが あるんだよ。
   - 確認した内容：東武東上線は有楽町線・副都心線と相互直通。
   - [一次資料](https://www.tokyometro.jp/corporate/ir/library/factbook/pdf/factbook_2025.pdf)

### 95. `keihan`

1. おおさかの よどやばしから、きょうとの でまちやなぎへ いけるんだよ。
   - 確認した内容：京阪本線・鴨東線の淀屋橋～出町柳。既存detailの都市間一般紹介より区間を具体化。
   - [一次資料](https://www.keihan.co.jp/traffic/station/)
2. むかしは、てれびを みながら のれる とっきゅうも あったんだよ。
   - 確認した内容：1954年にテレビ付特急（テレビカー）運行開始。歴史として表現。
   - [一次資料](https://www.keihan.co.jp/hdrecruit/about/index.html)

### 96. `kintetsu`

1. おおさかや なら、いせの まちなどを むすぶ でんしゃだよ。
   - 確認した内容：近鉄路線網の大阪・奈良・伊勢。
   - [一次資料](https://www.kintetsu.co.jp/station/)
2. はんしんの せんろへ はいって、こうべへ いく でんしゃも あるんだよ。
   - 確認した内容：阪神三宮～近鉄奈良の相互直通。全車両共通とはしない。
   - [一次資料](https://www.kintetsu-g-hd.co.jp/ir/investor/data/20091117setumeikai.pdf)

### 97. `shinkansen-500`

1. しんおおさかと はかたの あいだを、こだまとして はしるんだよ。
   - 確認した内容：500系の現行運行区間・こだま使用。引退計画や最高速度には触れない。
   - [一次資料](https://www.jr-odekake.net/railroad/train/500/)
2. こどもが うんてんしさんの まねを たのしめる、ばしょも あるんだよ。
   - 確認した内容：500系こだま8号車に子ども向け運転台。実車操作と誤解させない。
   - [一次資料](https://www.jr-odekake.net/railroad/service/children.html)

### 98. `kamome`

1. たけおおんせんと ながさきを むすぶ、しんかんせんだよ。
   - 確認した内容：西九州新幹線かもめ。既存detailの「長崎へ」のみの紹介に発着区間を追加。
   - [一次資料](https://www.jrkyushu.co.jp/railway/netyoyaku/route/nagasaki/)
2. くるまいすのまま つかえる、といれが あるんだよ。
   - 確認した内容：N700S西九州新幹線の多機能（車椅子対応）トイレ。
   - [一次資料](https://www.jrkyushu.co.jp/railway/dia2022/pdf/press_kyushu22_cps.pdf)

### 99. `doctor-s`

1. おきゃくさんを はこびながら、せんろも しらべるための れっしゃだよ。
   - 確認した内容：営業車検測装置を搭載したN700Sの名称。検測機器の運用開始は発表時点で2027年1月予定なので、現在検測中と断言しない目的表現。
   - [一次資料](https://jr-central.co.jp/news/release/_pdf/000045513.pdf)
2. どくたーいえろーの ざいりょうを、もういちど つかっているんだよ。
   - 確認した内容：T4編成のアルミ部材を水平リサイクルして車体の一部に使用。色や形の説明ではない再利用の情報。
   - [一次資料](https://jr-central.co.jp/news/release/_pdf/000045513.pdf)

### 100. `e10`

1. とうほくの しんかんせんの、あたらしい なかまとして せっけいちゅうだよ。
   - 確認した内容：次期東北新幹線E10系の設計着手。現在営業運転中とはせず、登場予定年も採用しない。
   - [一次資料](https://www.jreast.co.jp/press/2024/20250304_ho03.pdf)
2. じしんの ゆれを おさえる しくみも、とりいれる せっけいなんだよ。
   - 確認した内容：ALFA-Xで検証した左右動ダンパ等を採用する具体的設計。将来の完成・運行の保証ではない。
   - [一次資料](https://www.jreast.co.jp/press/2024/20250304_ho03.pdf)

### 101. `tokyo-metro-17000`

1. ゆうらくちょうせんと ふくとしんせんで、かつやくする でんしゃだよ。
   - 確認した内容：17000系は有楽町線・副都心線用。
   - [一次資料](https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/yur-fuk_17000/index.html)
2. どの しゃりょうにも、べびーかーを おける ばしょが あるんだよ。
   - 確認した内容：全車両に車椅子・ベビーカー用フリースペースを設置。
   - [一次資料](https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/yur-fuk_17000/index.html)

### 102. `keikyu-le-ciel`

1. るしえるは、ふらんすの ことばで そらという いみなんだよ。
   - 確認した内容：Le Cielはフランス語で「空」。
   - [一次資料](https://www.keikyu.co.jp/report/2021/le_ciel_1.html)
2. いすの むきを かえて、いろいろな のりかたに あわせられるんだよ。
   - 確認した内容：ロング・クロス転換の自動回転式座席。乗客の任意操作とはしない。
   - [一次資料](https://www.keikyu.co.jp/company/news/2022/20220526HP_22034TE.html)

### 103. `thunderbird`

1. つるがで しんかんせんに のりかえて、ほくりくの たびへ いけるんだよ。
   - 確認した内容：敦賀でサンダーバードと北陸新幹線を乗り継ぐ公式きっぷの説明。運賃は使わない。
   - [一次資料](https://tickets.jr-odekake.net/shohindb/view/consumer/tokutoku/download.html?fileId=20250130110610685&newwindow=true)
2. すわる ばしょを さきに きめてのる、していせきの とっきゅうだよ。
   - 確認した内容：全車指定席の編成案内。現行ダイヤの駅時刻表でも全車指定席を確認。
   - [一次資料](https://www.jr-odekake.net/railroad/train/thunderbird/)

## 検証

Nodeによる担当IDとの完全一致、52キー・104件、各2件、`text` と `source` のみの構造、HTTPS URL、1文、15〜55文字、ひらがな中心の文字種、同一文の重複なし、既存 `detail` の文面転用なしを確認。文の意味と出典の対応・時制・外観説明の除外は上記の確認記録をもとに目視で確認した。
