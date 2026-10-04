# 絵本の特急・新幹線クイズ画像

この一覧は `src/book-express.js` の `BOOK_EXPRESS_TRAINS` 24件に対応します。既存 `TRAINS` の別名を照合し、同じ列車として登録済みの項目がないことを確認しました。そのため24件すべてを専用の `book-*` 画像にしています。既存の汎用ドクターカー画像はE926形「East-i」と確認できる外観ではないため、重複扱いにはしていません。既存IDで代替した項目・生成を省いた項目はありません。

画像は列車ごとに新規作成した1536×1024の水彩アニメ調イラストです。実車の形式・先頭形状・帯色を参照元と照合し、列車を画面の主役にして、車窓に小さなクマとウサギを描く共通方針で作成しました。文字・ロゴは入れていません。生成画像をPillowでRGB WebP（quality 86）に変換しました。画像は実車写真や本の掲載写真そのものではなく、参照資料をもとにした独自のイラストです。

「代表」は、列車名が複数の形式で運転される場合などに、絵として特定した実車形式を表します。絵本に載った特定の編成・写真を示すものではありません。

## 収録した列車

| 絵本名 / ID | 画像 | 車両・絵の識別ポイント | 参照元 |
|---|---|---|---|
| こだま / `book-kodama` | `assets/trains/book-kodama.webp` | 500系8両。白い車体、青帯、長い円すい形の先頭。 | [JRおでかけネット 500系](https://www.jr-odekake.net/train/500/)、[500系ラストラン企画](https://www.jr-odekake.net/navi/the_last_run/project-500k/) |
| ひかり / `book-hikari` | `assets/trains/book-hikari.webp` | N700Sを代表例にした白い新幹線。青い車体帯と滑らかな長い先頭。 | [JR東海 N700S](https://railway.jr-central.co.jp/train/shinkansen/n700s/index.html)、[N700S資料](https://railway.jr-central.co.jp/pwd/_pdf/N700S.pdf) |
| ひかりレールスター / `book-hikari-railstar` | `assets/trains/book-hikari-railstar.webp` | 700系7000番台。銀灰色、黒い窓帯、その直下の鮮明な黄色帯、幅広く低い700系の先頭。黄色帯欠落の初稿を差し替え済み。 | [JR西日本 700系7000番台](https://www.jr-odekake.net/railroad/train/700_8/)、[日本車輌 700系](https://www.n-sharyo.co.jp/business/tetsudo/pages/jrw700e.htm) |
| リニア中央新幹線 / `book-linear-chuo` | `assets/trains/book-linear-chuo.webp` | L0系改良型の試験車両。長い低い先頭と白・銀・青の配色。営業列車ではなく試験車として描写。 | [JR東海 リニア車両デザイン](https://linear-chuo-shinkansen.jr-central.co.jp/sp/about/design/) |
| イーストアイ / `book-east-i` | `assets/trains/book-east-i.webp` | E926形6両の新幹線検測車。白い車体と赤い前面・側面帯。既存の汎用点検車画像とは別の専用絵。 | [JR東日本 E926形の資料](https://www.jreast.co.jp/press/2021/sendai/20210721_s03.pdf)、[JR東日本 車両案内](https://www.jreast.co.jp/ko/multi/omiya/tetsumachi_omiya/train/) |
| アーバンライナー / `book-urbanliner` | `assets/trains/book-urbanliner.webp` | 近鉄21000系「アーバンライナーPlus」。NEXT 21020系とは別の形式として描写。 | [近鉄 アーバンライナー](https://www.kintetsu.co.jp/gyoumu/Express/train/urban.html)、[近鉄ペーパークラフト](https://www.kintetsu.co.jp/senden/ShockWAVE/papercraft/) |
| アルプスエキスプレス / `book-alps-express` | `assets/trains/book-alps-express.webp` | 富山地方鉄道16010形を改装した観光列車。赤系の車体と山あいの風景。観光列車としての運転は休止中である点を `detail` に記載。 | [富山地方鉄道 車両案内](https://www.chitetsu.co.jp/?page_id=3838)、[富山地方鉄道](https://www.chitetsu.co.jp/?page_id=660)、[車両資料](https://railway-catalog.com/03/01215000.html) |
| エレガント・サルーン / `book-elegant-saloon` | `assets/trains/book-elegant-saloon.webp` | 京阪8000系。赤い車体と、編成中の2階建て車両を見せる構図。 | [京阪8000系](https://www.keihan.co.jp/traffic/railfan/vehicle/8000.html)、[京阪ライナー](https://www.keihan.co.jp/traffic/liner/)、[京阪ブランド記事](https://www.keihan.co.jp/brand/report/report-32/index.html) |
| おおぞら / `book-ozora` | `assets/trains/book-ozora.webp` | キハ261系1000番台。白い車体、紫帯、黄色い前面警戒色。 | [JR北海道 おおぞら](https://www.jrhokkaido.co.jp/train/tr007_01.html)、[JR北海道 新塗色資料](https://www.jrhokkaido.co.jp/press/2015/150909-1.pdf)、[TOMIX資料](https://www.tomytec.co.jp/tomix/products/img/20230608-2.pdf) |
| カムイ / `book-kamui` | `assets/trains/book-kamui.webp` | 789系1000番台。銀色の車体と青紫系の帯。 | [JR北海道 カムイ](https://www.jrhokkaido.co.jp/train/tr013_01.html)、[JR北海道 車両資料](https://www.jrhokkaido.co.jp/press/2016/161216-3.pdf) |
| こうのとり / `book-kounotori` | `assets/trains/book-kounotori.webp` | 287系を代表形式として選択。白い車体に赤い帯。 | [JRおでかけネット こうのとり](https://www.jr-odekake.net/railroad/train/kounotori/)、[JR西日本 車両資料](https://www.westjr.co.jp/company/info/issue/data/pdf/data2025_15.pdf)、[287系資料](https://railway-catalog.com/02/0105287.html) |
| サロベツ / `book-sarobetsu` | `assets/trains/book-sarobetsu.webp` | キハ261系0番台。青い先頭と黄緑のドア脇の差し色。雪原・湿原を走る構図。 | [JR北海道 サロベツ](https://www.jrhokkaido.co.jp/train/tr011_01.html)、[JR北海道 車両資料](https://www.jrhokkaido.co.jp/press/2015/150909-1.pdf)、[キハ261系写真資料](https://commons.wikimedia.org/wiki/File:Kiha261_SE-201_Soya.jpg) |
| しなの / `book-shinano` | `assets/trains/book-shinano.webp` | 383系。銀色の車体、オレンジ帯、前面まで続くパノラマ窓。 | [JR東海 383系資料](https://jr-central.co.jp/news/release/_pdf/000042834.pdf)、[KATO 383系](https://www.katomodels.com/product/n/383kei) |
| しらゆき / `book-shirayuki` | `assets/trains/book-shirayuki.webp` | E653系1100番台。白を基調に赤・紺の帯を配した標準的な「しらゆき」外観。 | [JR東日本 いなほ・しらゆき](https://www.jreast.co.jp/train/express/inaho_shirayuki.html)、[JR東日本 新潟支社資料](https://www.jreast.co.jp/press/2023/niigata/20240314_ni01.pdf) |
| すずらん / `book-suzuran` | `assets/trains/book-suzuran.webp` | 785系を代表形式として選択。銀色の車体と緑色の帯。 | [JR北海道 すずらん](https://www.jrhokkaido.co.jp/train/tr012_01.html) |
| つがる / `book-tsugaru` | `assets/trains/book-tsugaru.webp` | E751系。白い車体、窓帯の青、上部の黄色、下部の赤を描き分け。 | [JR東日本 つがる](https://www.jreast.co.jp/train/express/tsugaru.html)、[JR東日本 盛岡支社資料](https://www.jreast.co.jp/press/2021/morioka/20210719_mr02.pdf) |
| とかち / `book-tokachi` | `assets/trains/book-tokachi.webp` | キハ261系1000番台。白い車体と紫帯、黄色い前面警戒色。 | [JR北海道 とかち](https://www.jrhokkaido.co.jp/train/tr005_01.html)、[JR北海道 新塗色資料](https://www.jrhokkaido.co.jp/press/2015/150909-1.pdf) |
| はまかぜ / `book-hamakaze` | `assets/trains/book-hamakaze.webp` | キハ189系3両。銀色の車体、赤系の窓帯と細い白線、傾斜した運転台前面。 | [JRおでかけネット はまかぜ](https://www.jr-odekake.net/railroad/train/hamakaze/)、[JR西日本 キハ189系資料](https://www.westjr.co.jp/press/article/items/230802_press_hamakaze.pdf)、[JR西日本 車両一覧](https://www.westjr.co.jp/company/info/issue/data/pdf/data2025_15.pdf) |
| ひだ / `book-hida` | `assets/trains/book-hida.webp` | HC85系。オレンジ帯は側窓より上、白い屋根縁と灰色の窓帯。前面は黒い中央扉、小さな黒い楕円灯ハウジング、下側の細い二重オレンジ線。窓下に太いオレンジ帯は置かない。 | [JR東海 HC85系](https://railway.jr-central.co.jp/train/express/detail_02_08/index.html) |
| フジサン特急 / `book-fujisan-tokkyu` | `assets/trains/book-fujisan-tokkyu.webp` | 富士急行8000系。白い車体に富士山のキャラクター絵が並ぶ観光列車。 | [富士急行 フジサン特急](https://www.fujikyu-railway.jp/train/fujisan_express.php)、[8000系デビュー資料](https://www.fujikyu-railway.jp/upload/file/pdf/20140620_8000_debutpress.pdf) |
| ゆけむり / `book-yukemuri` | `assets/trains/book-yukemuri.webp` | 長野電鉄1000系、旧小田急10000形HiSE。4両編成の高床式展望席と赤・クリーム色。2階建て車ではない。 | [TOMIX 長野電鉄1000系](https://www.tomytec.co.jp/tomix/products/n/98599.html) |
| ライラック / `book-lilac` | `assets/trains/book-lilac.webp` | 789系0番台、6両編成。銀色の車体と、編成端・ドアの明るい緑色。 | [JR北海道 ライラック](https://www.jrhokkaido.co.jp/train/tr033_01.html)、[JR北海道 車両資料](https://www.jrhokkaido.co.jp/press/2016/161216-3.pdf) |
| 宗谷 / `book-soya` | `assets/trains/book-soya.webp` | キハ261系0番台。サロベツと同系列の青い先頭・黄緑の差し色を、雪の北方風景と組み合わせた。 | [JR北海道 宗谷](https://www.jrhokkaido.co.jp/train/tr000_01.html)、[JR北海道 車両資料](https://www.jrhokkaido.co.jp/press/2015/150909-1.pdf)、[キハ261系写真資料](https://commons.wikimedia.org/wiki/File:Kiha261_SE-201_Soya.jpg) |
| 能登かがり火 / `book-noto-kagaribi` | `assets/trains/book-noto-kagaribi.webp` | 運用形式のうち683系を代表例に選択。白い車体、濃い窓帯、窓下の青帯。海沿いを走る構図。 | [JRおでかけネット 能登かがり火](https://www.jr-odekake.net/railroad/train/notokagaribi/)、[列車・形式解説](https://www.uraken.net/railstation/ressha/ltdexp_notokagaribi.html)、[683系資料](https://ss1.xrea.com/transportnet.s239.xrea.com/train_gallery/jr_ec/jw683/jw683-2.html) |

## 収録しなかった項目・状態メモ

- 既存 `TRAINS` の別名で同一列車が確認できた項目: なし（0件）。既存IDへのマッピングはありません。
- 生成を省略した項目: なし（0件）。割当24項目すべてを専用画像にしました。
- `historical: true` を付けた項目: なし。参照した現行車両案内に掲載される車両を中心に選定しています。L0系は試験車、East-iは検測車として現役の用途を明記し、アルプスエキスプレスは観光運転休止中であることを `detail` に記しました。
- アーバンライナー画像は近鉄21000系Plusです。親タスクの報酬用21020系NEXTとは別形式・別画像です。しなの383系、ひだHC85系、ライラック789系0番台の報酬用画像も、ここにあるクイズ用 `book-*` 画像とは別に管理します。
- 外観上の修正: Rail Starは初稿で黄色帯が欠落したため、窓帯直下に鮮明な黄色帯を加え、700系らしい幅広く低い先頭形状にした画像へ差し替えました。HC85は実車案内に合わせて側面オレンジ帯を窓上に置き、前面の二重細線・黒い中央扉・小型灯を確認した画像に差し替えました。

