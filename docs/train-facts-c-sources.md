# 電車の紹介文 C：一次資料と事実確認

確認日：2026-10-21。対象は `src/data.js` をNodeでimportして取得した `TRAINS.slice(104, 156)`（index 104〜155、52件）。出力は `src/train-facts-c.js` の `TRAIN_FACTS_C`、各IDに異なる話題を2件ずつ収録。

既存の `t.sources` と `docs/book-express-sources.md`、`docs/book-tourist-a-sources.md`、`docs/prefix-train-sources.md` を入口に、運行会社・メーカー・施設運営者のWeb一次資料を再確認した。既存detailのコピーや加工、画像の外観説明は採用していない。地名と設備用途は幼児向けに言い換えた。以下の1・2は配列の順番に対応する。

車両固有の設備は、dataの代表車両（500系こだま、N700Sひかり、近鉄21000系Plusなど）について述べる。列車名を使う全形式の共通設備とはしない。運行区間は通常の列車の役割を説明するもので、当日の運転保証ではない。時刻・最高速度・開業予定は本文に入れない。多目的室の授乳利用など、実際の利用条件は各公式案内に従う。

- アルプスエキスプレス：既存調査の観光運転休止を踏まえ、製作目的と設備を説明し、現在走っているとは断言しない。
- L0系：磁石のしくみと山梨での試験を説明し、営業列車とはしない。
- いさぶろう・しんぺい：過去の山越え運転を「むかし」と表現。2023年の[JR九州の改造開始案内](https://www.jrkyushu.co.jp/news/__icsFiles/afieldfile/2023/08/31/230831_isaburoushinpei_920.pdf)とも照合。
- 500系：のぞみとしての来歴を過去形にし、こども運転台は設備として説明。将来の引退予定は採用しない。

## 104. `marine-liner`

1. おかやまと、しこくの たかまつを つなぐ れっしゃだよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/marineliner/)
   - 確認事項：JR西日本の車両案内で岡山〜高松を確認。detailの瀬戸大橋・2階建ては採用しない。
2. すわる ばしょを、さきに きめておける せきも あるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/marineliner/)
   - 確認事項：グリーン車指定席・普通車指定席を確認。自由席もあるので「せきも」と限定。

## 105. `musashino`

1. ふちゅうほんまちから、にしふなばしへ つながる せんろだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/press/2023/hachioji/20230914_hc02.pdf)
   - 確認事項：府中本町〜新松戸の開業と西船橋への延伸を確認。
2. けいようせんに はいって、とうきょうえきへ いく でんしゃも あるよ。
   - 根拠：[一次資料](https://timetables.jreast.co.jp/timetable/list1039.html)
   - 確認事項：東京駅の京葉線・武蔵野線、府中本町方面の案内で直通を確認。

## 106. `yokohama`

1. はちおうじと、ひがしかながわを つなぐ でんしゃだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/map/pdf/map_tokyo.pdf)
   - 確認事項：横浜線の区間を公式東京近郊路線図で確認。
2. しんよこはまで、しんかんせんに のりかえられるよ。
   - 根拠：[一次資料](https://media.jreast.co.jp/articles/5625)
   - 確認事項：JR東日本公式記事の新横浜駅での東海道新幹線接続改善を確認。

## 107. `ryomo`

1. あさくさから、あかぎの えきへ いく とっきゅうだよ。
   - 根拠：[一次資料](https://www.tobu.co.jp/railway/special_express/vehicle/ryomo/)
   - 確認事項：主に浅草〜赤城を伊勢崎線・桐生線経由で運転。全列車の行き先とはしない。
2. いすを くるっと まわして、むかいあわせに すわれるよ。
   - 根拠：[一次資料](https://www.tobu.co.jp/railway/special_express/vehicle/ryomo/)
   - 確認事項：回転式リクライニングシートを向かい合わせにできることを確認。

## 108. `haruka`

1. きょうとや おおさかから、ひこうきの くうこうへ いけるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/haruka/)
   - 確認事項：京都・大阪・関西空港の停車駅を確認。
2. たびの おおきな かばんを、おいておく ばしょが あるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/haruka/)
   - 確認事項：内装の荷物スペースを確認。記号の凡例だけで設備ありと判定していない。

## 109. `minatomirai`

1. よこはまと、もとまちちゅうかがいを つなぐ でんしゃだよ。
   - 根拠：[一次資料](https://www.mm21railway.co.jp/global/english/info/pdf/map.pdf?202403=)
   - 確認事項：運営会社の路線図で横浜〜元町・中華街を確認。
2. しぶやまで、のりかえなしで いける でんしゃも あるよ。
   - 根拠：[一次資料](https://ftp.mm21railway.co.jp/info/route_map.html)
   - 確認事項：相互直通の渋谷方面の案内を確認。時間帯により直通がないため「も」と限定。

## 110. `kyoto-jr`

1. しんかいそくも、えきごとに とまる でんしゃも はしるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/eki/time_04/Shin-Osaka270301.htm)
   - 確認事項：JR京都線の新大阪駅時刻表に普通・快速・新快速の種別あり。時刻は本文に採らない。
2. しんおおさかで、しんかんせんに のりかえられるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/eki/pdf/index_all.pdf)
   - 確認事項：JR西日本公式路線図でJR京都線と山陽・東海道新幹線の新大阪接続を確認。

## 111. `sagano`

1. きょうとから、かめおかや そのべへ いく でんしゃだよ。
   - 根拠：[一次資料](https://timetable.jr-odekake.net/train-timetable/21741?date=20261012)
   - 確認事項：京都〜亀岡〜園部の普通列車の停車駅一覧を確認。時刻値は不使用。
2. てつどうはくぶつかんの ちかくにも、とまる えきが あるよ。
   - 根拠：[一次資料](https://www.kyotorailwaymuseum.jp/sp/access/)
   - 確認事項：京都鉄道博物館公式アクセスで嵯峨野線・梅小路京都西駅が最寄りと確認。

## 112. `tokiwa-express`

1. とうきょうから、みとの まちへ おでかけできるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/train/express/hitachi_tokiwa.html)
   - 確認事項：ひたち・ときわの共通車両案内に東京・上野〜水戸の運行案内あり。仙台はときわの行き先としない。
2. すわる ばしょを、さきに きめられる とっきゅうだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/ltd_exp/guide/)
   - 確認事項：ときわが全車指定席サービス対象であることを確認。座席未指定券の存在は否定しない。

## 113. `sazanami`

1. とうきょうと、ちばの きみつを つなぐ とっきゅうだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/chiba/railinfo/train/)
   - 確認事項：千葉を走る列車で「さざなみ」は東京〜君津を主に運転と確認。
2. あかちゃんの おむつを、かえられる ばしょが あるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/multi/traininformation/sazanami_wakashio/index.html)
   - 確認事項：E257系の車両編成図のベビーベッドを確認。寝台としてのベッドとは説明しない。

## 114. `shonan-express`

1. おしごとや がっこうへ いく ひとの、おてつだいを するよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/press/2020/20201112_ho02.pdf)
   - 確認事項：導入資料で通勤・通学に便利な特急「湘南」と説明。
2. たびの おおきな にもつを、おいておく ばしょが あるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/press/2020/20201112_ho02.pdf)
   - 確認事項：湘南・踊り子用E257系の荷物置き場を確認。

## 115. `kusatsu-shima`

1. うえのから、ながのはらくさつぐちへ いく とっきゅうだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/en/train/express/akagi.html)
   - 確認事項：高崎線特急の公式車両案内の上野〜長野原草津口を確認。
2. むかしは、ちばの とっきゅうとして はたらいた でんしゃだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/en/train/express/akagi.html)
   - 確認事項：房総特急わかしお・さざなみ・しおさい等で活躍した車両を改造したことを確認。

## 116. `akagi`

1. あかぎに なる まえは、ちばの とっきゅうで はたらいていたよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/en/train/express/akagi.html)
   - 確認事項：E257系は房総特急の車両を改造・転用したもの。列車名が変わった来歴であり、初めて特急になったとはしない。
2. おおきな かばんを、おいておく ばしょが あるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/en/train/express/akagi.html)
   - 確認事項：1・5号車の荷物置き場を確認。

## 117. `revaty`

1. えきで なかまと わかれて、べつの ばしょへ いけるよ。
   - 根拠：[一次資料](https://www.tobu.co.jp/corporation/rail/vehicles/)
   - 確認事項：500系の途中駅での併分割機能を確認。編成の外形・両数の説明は不使用。
2. くるまいすでも つかいやすい、おてあらいが あるよ。
   - 根拠：[一次資料](https://www.tobu.co.jp/railway/special_express/vehicle/revaty/)
   - 確認事項：車いす対応・オストメイト付多機能トイレを確認。

## 118. `romancecar-gse`

1. いちばん まえで、すすむ ほうを ながめられる せきが あるよ。
   - 根拠：[一次資料](https://www.odakyu.jp/romancecar/features/line_up/70000/)
   - 確認事項：展望席という設備・体験を説明。窓の形や大きさは不使用。
2. あかちゃんが、おちちを のむための おへやも あるよ。
   - 根拠：[一次資料](https://www.odakyu.jp/news/o5oaa10000005sa7-att/8724_3273227_.pdf)
   - 確認事項：GSE新製資料で授乳時・体調不良時に使える多目的室を確認。

## 119. `fujisan-view`

1. おおつきから、かわぐちこへ おでかけできるよ。
   - 根拠：[一次資料](https://www.fujikyu-railway.jp/fujisan-view-express/)
   - 確認事項：大月〜河口湖の運行区間を確認。
2. よやくして、れっしゃで あまい おかしを たのしめるよ。
   - 根拠：[一次資料](https://www.fujikyu-railway.jp/fujisan-view-express/)
   - 確認事項：特別車両の予約制スイーツプランを確認。全列車・全席のサービスとはしない。

## 120. `book-kodama`

1. むかしは、のぞみとしても はたらいた しんかんせんだよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/navi/the_last_run/project-500k/)
   - 確認事項：画像の500系を対象に、のぞみ運用終了→こだま転用の履歴を確認。
2. うんてんしさん ごっこが できる、こどもの せきが あるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/service/children.html)
   - 確認事項：500系こだま8号車のお子様向け運転台を確認。実際に列車を運転できるとはしない。

## 121. `book-hikari`

1. でんきが とまっても、でんちで うごける しくみが あるよ。
   - 根拠：[一次資料](https://railway.jr-central.co.jp/train/shinkansen/n700s/index.html)
   - 確認事項：画像のN700Sのバッテリ自走システムを説明。ひかり全形式に一般化しない。
2. すべての せきに、でんきを つかえる さしこみぐちが あるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/shinkansen/seat/standard/)
   - 確認事項：N700Sは全座席にモバイルコンセント設置と明記。

## 122. `book-hikari-railstar`

1. さんようしんかんせんで、おきゃくさんを はこぶよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/700_8/)
   - 確認事項：JR西日本の現行700系車両案内で新大阪〜博多の山陽新幹線運行を確認。
2. なかまや かぞくで すごせる、こしつの せきも あるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/700_8/)
   - 確認事項：同ページで8号車の普通車指定席に4人用個室があると明記。メーカー資料でもコンパートメントを照合。

## 123. `book-linear-chuo`

1. じしゃくの ちからで、ふわっと うかんで はしるよ。
   - 根拠：[一次資料](https://linear-chuo-shinkansen.jr-central.co.jp/about/)
   - 確認事項：超電導磁石・浮上走行の原理を確認。低速時の車輪走行を否定しない。
2. やまなしで、あんぜんに はしれるか ためす れっしゃだよ。
   - 根拠：[一次資料](https://linear-chuo-shinkansen.jr-central.co.jp/yamanashi/about/)
   - 確認事項：山梨リニア実験線での走行試験を確認。営業中としない。

## 124. `book-east-i`

1. しんかんせんの せんろを、はしりながら しらべるよ。
   - 根拠：[一次資料](https://media.jreast.co.jp/articles/1653)
   - 確認事項：新幹線用East iの線路・架線等の検測役割を確認。
2. おきゃくさんが、ふだんの たびで のる れっしゃでは ないよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/press/2021/sendai/20210721_s03.pdf)
   - 確認事項：公式見学会資料の「普段は乗車することができない」を根拠に、検測役割と利用上の特徴を分ける。

## 125. `book-urbanliner`

1. おおさかの なんばと、なごやを つなぐ とっきゅうだよ。
   - 根拠：[一次資料](https://www.kintetsu.co.jp/gyoumu/Express/train/urban.html)
   - 確認事項：大阪難波〜近鉄名古屋を中心に運行と明記。
2. あかちゃんの おむつを、かえられる だいが あるよ。
   - 根拠：[一次資料](https://www.kintetsu.co.jp/gyoumu/Express/train/urban.html)
   - 確認事項：公式のバリアフリー対応設備・多目的トイレに乳幼児のおしめ替え用ベビーベッドと記載。NEXT・PLUS共通案内。

## 126. `book-alps-express`

1. とやまの しぜんを たのしむために、つくられた れっしゃだよ。
   - 根拠：[一次資料](https://www.chitetsu.co.jp/?page_id=3838)
   - 確認事項：富山の大自然との調和をモチーフに製作した観光列車。現在運転中とは記さない。
2. こどもが けしきを たのしめる、とくべつな せきが あるよ。
   - 根拠：[一次資料](https://www.chitetsu.co.jp/?page_id=3838)
   - 確認事項：1・3号車の子供用ハイデッキシートを確認。座席の用途を説明し、車体サイズや窓は不使用。観光運転休止中の既存調査に配慮し乗車を勧めない。

## 127. `book-elegant-saloon`

1. おおさかと きょうとを つなぐ、けいはんの でんしゃだよ。
   - 根拠：[一次資料](https://www.keihan.co.jp/traffic/premiumcar/train/)
   - 確認事項：8000系プレミアムカー案内の大阪〜京都の役割を確認。
2. よやくして、ゆったり すわれる とくべつな せきも あるよ。
   - 根拠：[一次資料](https://www.keihan.co.jp/traffic/premiumcar/train/)
   - 確認事項：8000系の座席指定特別車両プレミアムカー。全席が有料とはしない。

## 128. `book-ozora`

1. さっぽろと、くしろを つなぐ とっきゅうだよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr007_01.html)
   - 確認事項：札幌〜釧路を確認。
2. あかちゃんが、おちちを のむための おへやが あるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr007_01.html)
   - 確認事項：車内紹介の多目的室は授乳時にも利用可。利用には車掌への申告が必要。

## 129. `book-kamui`

1. おしごとで まちへ いく ひとの、おてつだいも するよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr013_01.html)
   - 確認事項：都市間を結びビジネスの足としても活躍との公式説明。既存detailの札幌〜旭川は流用しない。
2. おおきな たびの かばんを、おける ばしょが あるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr013_01.html)
   - 確認事項：車内紹介の旅行用バッグ向け荷物置き場。

## 130. `book-kounotori`

1. しんおおさかから、きのさきおんせんへ いく とっきゅうだよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/kounotori/)
   - 確認事項：新大阪〜福知山・豊岡・城崎温泉の運行区間を確認。
2. あかちゃんに おちちを あげる、おへやも あるよ。
   - 根拠：[一次資料](https://www.westjr.co.jp/press/article/2011/08/page_476.html)
   - 確認事項：287系こうのとりと同様の客室設備という公式説明に多目的室・授乳の記載。本文の代表車両は287系。

## 131. `book-sarobetsu`

1. あさひかわから、わっかないへ おでかけできるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr011_01.html)
   - 確認事項：サロベツは旭川〜稚内。札幌発の宗谷と区別する。
2. てしおがわという かわに そって、たびを するよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr011_01.html)
   - 確認事項：天塩川右岸をたどるという公式車窓案内。終点とは別の経路・自然の話題。

## 132. `book-shinano`

1. なごやから、ながのへ おでかけできる とっきゅうだよ。
   - 根拠：[一次資料](https://railway.jr-central.co.jp/train/express/detail_02_01/)
   - 確認事項：383系公式車両説明で名古屋〜長野を確認。
2. からだを かたむけて、カーブを まがる しくみが あるよ。
   - 根拠：[一次資料](https://railway.jr-central.co.jp/train/express/detail_02_01/)
   - 確認事項：制御付振子による曲線通過時の乗り心地改善を幼児向けに説明。

## 133. `book-shirayuki`

1. にいがたから、あらいへ いく とっきゅうも あるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/train/express/inaho_shirayuki.html)
   - 確認事項：しらゆきの新潟〜上越妙高・新井。全便新井発着ではないので限定。
2. ほくりくしんかんせんへ、のりつぐ たびを てつだうよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/press/2014/20141222.pdf)
   - 確認事項：しらゆき新設の役割を北陸新幹線アクセスと公式に説明。古い料金・本数は採らない。

## 134. `book-suzuran`

1. さっぽろから、むろらんの ほうへ むかう とっきゅうだよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr012_01.html)
   - 確認事項：札幌〜東室蘭・室蘭を確認。
2. たびの とちゅうで、たいへいようの うみを ながめられるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr012_01.html)
   - 確認事項：樽前山・太平洋を眺められる公式車窓案内。外観でなく沿線の話題。

## 135. `book-tsugaru`

1. あきたと あおもりの あいだを、おううほんせんで はしるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/train/express/tsugaru.html)
   - 確認事項：運行区間を奥羽本線と確認。既存detailの形式・配色は不使用。
2. むかしは、はつかりという とっきゅうで はたらいたよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/train/express/tsugaru.html)
   - 確認事項：画像のE751系は当初はつかり用に投入という車両来歴。現在のはつかり運転とはしない。

## 136. `book-tokachi`

1. ゆきから せんろを まもる、おおいの なかも はしるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr005_01.html)
   - 確認事項：雪対策用スノーシェルターを通るという公式車窓説明。一般的なトンネルとは区別。
2. あかちゃんが、おちちを のむための おへやが あるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr005_01.html)
   - 確認事項：車内紹介の授乳に利用できる多目的室を確認。

## 137. `book-hamakaze`

1. おおさかから、とっとりへ いく とっきゅうも あるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/hamakaze/)
   - 確認事項：大阪〜豊岡・城崎温泉・香住・鳥取を確認。全便鳥取行きとはしない。
2. すわる ばしょを、さきに きめられる とっきゅうだよ。
   - 根拠：[一次資料](https://timetable.jr-odekake.net/train-timetable/239181?date=20260501)
   - 確認事項：公式列車時刻表の「普通車全車指定席」を確認。時刻値は本文に採用しない。

## 138. `book-hida`

1. れっしゃの なかで、ちいさな こうげいひんを みられるよ。
   - 根拠：[一次資料](https://railway.jr-central.co.jp/train/express/detail_02_08/index.html)
   - 確認事項：HC85系のデッキに伝統工芸品を鑑賞できるナノミュージアム。
2. くるまいすの ひとが、すごせる ばしょも あるよ。
   - 根拠：[一次資料](https://railway.jr-central.co.jp/train/express/detail_02_08/index.html)
   - 確認事項：HC85系の車いすスペースを確認。外観でなくバリアフリー用途。

## 139. `book-fujisan-tokkyu`

1. おおつきから、かわぐちこへ いく とっきゅうだよ。
   - 根拠：[一次資料](https://www.fujikyu-railway.jp/train/fujisan_express.php)
   - 確認事項：2026年版時刻表で大月〜河口湖。時刻・料金を文章に入れない。
2. いちばん まえで、けしきを たのしめる せきが あるよ。
   - 根拠：[一次資料](https://www.fujikyu-railway.jp/train/fujisan_express.php)
   - 確認事項：1号車は指定席の展望車両。窓や先頭の形の説明ではなく席の用途。

## 140. `book-yukemuri`

1. ながのから、ゆだなかの えきへ おでかけできるよ。
   - 根拠：[一次資料](https://www.nagaden-net.co.jp/news/docs/nagaden-reserve1.pdf?hsLang=ja)
   - 確認事項：長野電鉄の特急予約案内で長野〜湯田中を確認。
2. いちばん まえで、すすむ ほうを ながめられる せきが あるよ。
   - 根拠：[一次資料](https://www.nagaden-net.co.jp/info/goods/info/goods/ticket/1000-15th.php)
   - 確認事項：公式ゆけむり15周年案内に先頭展望席の記載。旧小田急車という既存detailは使わない。

## 141. `book-lilac`

1. さっぽろと、あさひかわを つなぐ とっきゅうだよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr033_01.html)
   - 確認事項：札幌〜旭川を確認。
2. あかちゃんが、おちちを のめる おへやも あるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr033_01.html)
   - 確認事項：車内紹介の多目的室の授乳用途を確認。

## 142. `book-soya`

1. かわの いすで、ゆったり すごせる せきも あるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr000_01.html)
   - 確認事項：宗谷キハ261系0代の革張りグリーン席。全席の素材とはしない。
2. くるまいすでも つかいやすい、おてあらいが あるよ。
   - 根拠：[一次資料](https://www.jrhokkaido.co.jp/train/tr000_01.html)
   - 確認事項：車いす対応トイレの設備紹介を確認。既存detailの北への行き先は流用しない。

## 143. `book-noto-kagaribi`

1. かなざわから、わくらおんせんへ おでかけできるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/train/notokagaribi/)
   - 確認事項：金沢〜七尾・和倉温泉を確認。
2. のとの おまつりの ひを おもって、つけられた なまえだよ。
   - 根拠：[一次資料](https://www.westjr.co.jp/press/article/2014/10/page_6267.html)
   - 確認事項：キリコ祭り等、火・灯りと結びついた能登の風景と篝火の勢いが命名由来。

## 144. `book-36plus3`

1. ようびに よって、ちがう みちを たびする れっしゃだよ。
   - 根拠：[一次資料](https://www.jrkyushu-36plus3.jp/)
   - 確認事項：曜日によって異なるルートを運行するとの案内。休止・再開予定や特定曜日の時刻は採らない。
2. れっしゃの なかに、のみものを かえる おみせが あるよ。
   - 根拠：[一次資料](https://www.jrkyushu-36plus3.jp/spend/)
   - 確認事項：公式の楽しみ方ページでビュッフェの商品販売を確認。ソフトドリンク等の個別商品や価格は限定しない。

## 145. `book-52seki`

1. はしる レストランで、ごはんを たのしむ れっしゃだよ。
   - 根拠：[一次資料](https://www.seiburailway.jp/railways/seibu52-shifuku/overview/)
   - 確認事項：オープンダイニング・オープンキッチンを備える旅するレストラン。
2. ちちぶへ おでかけできる、せいぶの れっしゃだよ。
   - 根拠：[一次資料](https://www.seiburailway.jp/railways/seibu52-shifuku/overview/)
   - 確認事項：池袋・西武新宿〜西武秩父の運行区間を確認。他の運行区間を否定しない。

## 146. `book-bbbase`

1. じてんしゃを、そのまま のせられる れっしゃだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/railway/joyful/bbbase.html)
   - 確認事項：自転車用ラックにセットして持ち込む役割を確認。
2. りょうごくから、ちょうしへ おでかけする たびも あるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/railway/joyful/bbbase.html)
   - 確認事項：佐倉・銚子コースの両国〜銚子を確認。自転車設備とは別の具体的な行き先。

## 147. `book-etsetora`

1. せとうちの うみを ながめて、たびを たのしむ れっしゃだよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/kankoutrain/etsetora/)
   - 確認事項：呉線経由で瀬戸内の景色を楽しむ観光列車。旧経路資料に依存しない。
2. よやくして、れっしゃで あまい おかしを たのしめるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/kankoutrain/etsetora/)
   - 確認事項：公式のスイーツ予約サービス。予約期限・内容・曜日は採らない。

## 148. `book-highrail1375`

1. こぶちざわと、こもろを つなぐ れっしゃだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/railway/joyful/highrail1375.html)
   - 確認事項：現行の公式列車案内で小淵沢〜小諸の運行区間を確認。旧URLから現行URLへ更新。
2. れっしゃの なかで、ほしぞらの えいぞうを みられるよ。
   - 根拠：[一次資料](https://recruit.jreast.co.jp/project/pj_highrail/)
   - 確認事項：2号車の半球型ドームに星空映像を投影するギャラリーHIGH RAIL。星柄や車体の絵ではない。

## 149. `book-pokemon-with-you`

1. とうほくの こどもたちを、えがおに したくて うまれたよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/railway/joyful/pokemon.html)
   - 確認事項：東日本大震災で被災した東北の子どもたちに笑顔を届けたいという誕生の目的。
2. うんてんしさん ごっこが できる、あそびばが あるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/railway/joyful/pokemon.html)
   - 確認事項：プレイルームの運転台・機関室による運転士気分の体験。描かれた動物・キャラクターの説明は不使用。

## 150. `book-royal-express`

1. れっしゃの なかで、がっきの なまえんそうを きけるよ。
   - 根拠：[一次資料](https://www.the-royalexpress.jp/concept/design/)
   - 確認事項：6号車ダイニングのヴァイオリンとピアノの生演奏。
2. れっしゃの なかで、ほんを よんで すごせる ばしょも あるよ。
   - 根拠：[一次資料](https://www.the-royalexpress.jp/concept/design/)
   - 確認事項：8号車に本棚・書斎デスクのあるライブラリー。

## 151. `book-tohoku-emotion`

1. はちのへと、くじを つなぐ ごはんの れっしゃだよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/railway/joyful/tohoku.html)
   - 確認事項：八戸〜久慈、列車全体がレストランであることを確認。
2. おりょうりを つくる ところを、めの まえで みられるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/railway/joyful/tohoku.html)
   - 確認事項：ライブキッチンで調理風景を見る体験を確認。行き先と設備の2話題。

## 152. `book-shikishima`

1. れっしゃの なかの おへやで、おとまりが できるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/shiki-shima/suite.html)
   - 確認事項：客室スイートのソファが夜はベッドになるという公式設備案内を確認。運休等の状況と切り離した設備の説明。
2. ごはんを たのしむための、とくべつな しょくどうが あるよ。
   - 根拠：[一次資料](https://www.jreast.co.jp/shiki-shima/index.html)
   - 確認事項：車内のダイニングの用途を確認。単なる宿泊と食事施設を分けた。

## 153. `book-west-express-ginga`

1. よこに なって、のんびり すごせる せきも あるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/westexginga/train/)
   - 確認事項：ノビノビ座席クシェット等を確認。車体サイズではなく休息設備の用途。
2. こまを もっていくと、しょうぎや チェスで あそべるよ。
   - 根拠：[一次資料](https://www.jr-odekake.net/railroad/westexginga/train/)
   - 確認事項：4号車遊星のテーブルに将棋・チェスの盤面。駒は持参との条件も文中に反映。

## 154. `book-aoniyoshi`

1. おおさかと ならと きょうとへ、のりかえなしで いけるよ。
   - 根拠：[一次資料](https://www.kintetsu.co.jp/senden/aoniyoshi/about/)
   - 確認事項：大阪・奈良・京都の三都を乗り換えなしで結ぶと明記。
2. れっしゃの なかで、ほんを よんで すごせる ばしょが あるよ。
   - 根拠：[一次資料](https://www.kintetsu.co.jp/senden/aoniyoshi/index.html)
   - 確認事項：4号車ライブラリーで沿線書籍を自由閲覧可。

## 155. `book-isaburo-shinpei`

1. むかし、やまの さかを いったり きたりして のぼったよ。
   - 根拠：[一次資料](https://www.jrkyushu.co.jp/company/ir/library/individual_investors/pdf/jrkyushureport2018.pdf)
   - 確認事項：いさぶろう・しんぺいの肥薩線スイッチバックを過去形で説明。2023年改造資料も確認済み。
2. てつどうを つくる おしごとの、ふたりの なまえを もらったよ。
   - 根拠：[一次資料](https://www.jrkyushu.co.jp/news/__icsFiles/afieldfile/2023/08/31/230831_isaburoushinpei_920.pdf)
   - 確認事項：山縣伊三郎（当時逓信大臣）・後藤新平（鉄道院総裁）に由来。現役運転とはしない。
