# 『じぶんでよめる でんしゃずかん』担当分：調査・画像記録

調査日：2026年10月4日  
対象：担当指定の普通列車・新交通・モノレール・ケーブル／ロープウェイ・貨物・働く列車 26項目。対象リストの出典は[書籍調査メモ](book-trains-441533217X.md)。

各車両は公開されている運行会社・製造元の資料を優先して外観を確認し、画像生成プロンプトには車体形状と識別できる塗色・装備を記録した。画像は1車両につき1枚、横長の水彩・絵本調、列車を画面の約70%に配置し、乗客または運転台の窓に小さなクマとウサギを描く。ロゴ・文字・透かしは描かない。個別の生成ファイルと最終確認状況は、生成後に追記する。

## 既存項目との照合

| 書籍の項目 | 判定 | 記録 |
|---|---|---|
| 阪急京都線 | 既存項目に対応 | `go-home-hankyu.webp`（ID `hankyu`）。画像を開いて確認。阪急の栗色の通勤電車で、京都線9300系も同系統の栗色塗装を使う。専用車両の図鑑写真とは断定せず、路線の既存代表絵として対応づけ、重複生成しない。参考：[阪急9300系車両図鑑](https://www.hankyu.co.jp/railfan/maroon/9300.html)。 |

名鉄の既存`meitetsu`画像は青白のミュースカイ（空港特急）と確認したため、名鉄犬山線の通勤車両を表す画像としては流用しない。西鉄・南海などの既存特急画像も、路線名の代表絵とは別の列車として扱う。

現行カタログとの照合では、`doctor-s`は新幹線の検測車でドクター東海（在来線用キヤ95系）とは別車両、`russell-snowplow`はササラ電車／DD14形ロータリー車とは異なる除雪方式の車両として、それぞれ別項目にした。阪急京都線のみ既存の一般的な阪急通勤車画像を再利用し、路線専用の新規絵は作らない。新JR4路線のクイズ用`name`には「JR」を含めず、`bookName`と`spokenName`で正式な路線名を保持する。

## 26項目の調査・生成記録

状態は「調査済み／生成待ち」から始め、画像を保存・目視確認した時点で更新する。

| 書籍名 | 選定した実車・状態 | 外観・プロンプトの主な識別点 | 確認資料 | 状態・生成ファイル |
|---|---|---|---|---|
| DMV | 阿佐海岸鉄道 DMV93形。運行中。 | マイクロバス大の車体、大きな正面窓、道路用タイヤとレール用車輪を切り替える機構。海沿いの景色、青白を基調に海を思わせる差し色。 | [阿佐海岸鉄道 DMV案内](https://asatetu.com/archives/156/)、[公式パンフレット](https://asatetu.com/dmv/wp-content/uploads/2021/11/DMVpamphlet.pdf)、[2026年運行案内](https://asatetu.com/dmv/wp-content/uploads/2026/02/14b4290c372008c00d0022c240cc5972.pdf) | 保存・目視確認済み／`assets/trains/book-dmv.webp` |
| JR高崎線 | JR東日本 E233系3000番台。運行中。 | 銀色の長い通勤電車、平らで角ばった前面、オレンジと緑の帯。 | [JR東日本 E233系](https://www.jreast.co.jp/train/local/e233.html) | 保存・目視確認済み／`assets/trains/book-jr-takasaki.webp` |
| JR大村線 | JR九州 YC1系。運行中。 | 銀色のハイブリッド気動車、黒い前面窓、オレンジ色の乗降扉と前面脇の縁取り。大村湾沿い。JR九州の2025年公式資料に掲載された外観図を画面で目視し、生成画と照合。公式図も扉・前面脇はオレンジ色のため、赤への色修正は行わない。 | [JR九州・YC1系投入資料](https://www.westjr.co.jp/press/article/items/191213_00_JRG.pdf)、[JR九州・2025年YC1系外観図](https://www.jrkyushu.co.jp/news/__icsFiles/afieldfile/2025/06/12/20250612_saga_nagasaki_new_car_model.pdf) | 保存・目視確認済み／`assets/trains/book-jr-omura.webp` |
| JR函館本線 | JR北海道 H100形「DECMO」。運行中。 | 銀灰色の短い気動車、角のある広い前面窓、濃緑・白・萌黄色の平行四辺形の帯。山線と雪景色。 | [JR北海道の車両外観発表](https://www.jrhokkaido.co.jp/press/2018/180215-4.pdf)、[函館本線H100形走行資料](https://www.youtube.com/watch?v=3pIWaRM3DCI) | 保存・目視確認済み／`assets/trains/book-jr-hakodate.webp` |
| JR予讃線 | JR四国 7000系。運行中。 | ステンレスの近郊型電車、前面運転台、明るい水色の帯。海と瀬戸内の沿線。 | [JR四国 7000系](https://www.jr-shikoku.co.jp/01_trainbus/syaryou/7000.shtm)、[車両外観資料](https://railway-catalog.com/02/01057000.html) | 保存・目視確認済み／`assets/trains/book-jr-yosan.webp` |
| 阪神線 | 阪神5700系。運行中。 | 銀色の通勤車、濃紺の前面と青系の側帯、前面の黄色いアクセント。 | [阪神 車両案内](https://www.hanshin.co.jp/fans/car/)、[阪神公式5700系紹介](https://www.youtube.com/watch?v=QdY_8eZ_V2w) | 保存・目視確認済み／`assets/trains/book-hanshin.webp` |
| 西鉄天神大牟田線 | 西鉄9000形。運行中。 | ステンレス車体、貫通扉を縦に見せる前面、側面のロイヤルレッド帯。 | [西鉄9000形](https://www.nishitetsu.jp/train/sharyou/9000/)、[西鉄車両紹介](https://www.nishitetsu.jp/train/sharyousenkyo/) | 保存・目視確認済み／`assets/trains/book-nishitetsu.webp` |
| 南海線 | 南海8300系。運行中。 | 銀色の角型通勤車、前面から側面へ続く青とオレンジの帯。 | [南海8300系の公式案内](https://www.nankai.co.jp/node/941) | 保存・目視確認済み／`assets/trains/book-nankai.webp` |
| 名鉄犬山線 | 名鉄9500系。運行中。 | 銀色の通勤車、前頭部に大きく使われる名鉄スカーレット、側面の赤帯。 | [名鉄9500系](https://www.meitetsu.co.jp/library/rolling_stock/detail_exp/9500.html) | 保存・目視確認済み／`assets/trains/book-meitetsu-inuyama.webp` |
| 阪急京都線 | 既存項目 `hankyu`。 | 既存絵の栗色通勤車を路線の代表として対応。9300系の固有形状だとは説明しない。 | [阪急9300系](https://www.hankyu.co.jp/railfan/maroon/9300.html)、既存画像 `assets/trains/go-home-hankyu.webp` | 対応済み／新規画像なし |
| アストラムライン | 広島高速交通7000系。運行中。 | 6両の新交通車両。角ばった前面と大きな黒い窓、会社のシンボル色クロムイエロー（山吹色）。ゴムタイヤと案内軌道を使う高架線。 | [広島高速交通FAQ・車体色説明](https://www.astramline.co.jp/qa/)、[広島高速交通公式7000系紹介](https://www.youtube.com/watch?v=_WP7lJ2juMQ)、[車両解説資料](https://www.jametro.or.jp/upload/subway/fLSVhhnvtoFf.pdf) | 保存・目視確認済み／`assets/trains/book-astram.webp` |
| ニュートラム | Osaka Metro 200系。運行中。 | 小型AGTの4両編成、黒い前面窓と丸い灯火。実在する複数色のうち、公式撮影会案内の緑色編成を選択。 | [Osaka Metro 200系撮影会案内](https://subway.osakametro.co.jp/news/news_release/20240613_satsueikai_nankoukensha.php)、[Osaka Metroグループ車両記事](https://iroirometro.jp/article/kobore260629.html) | 保存・目視確認済み／`assets/trains/book-newtram.webp` |
| 北九州モノレール | 北九州高速鉄道1000形。運行中の形式。 | 跨座式。白・クリーム色の車体に青帯を持つ実車の代表塗装。広告ラッピングや他形式は混ぜない。 | [北九州モノレール概要](https://www.kitakyushu-monorail.co.jp/summary/)、[公式中期経営計画・車両写真](https://www.kitakyushu-monorail.co.jp/pdf/company/chukikeiei_keikaku_2025.pdf)、[1000形外観資料](https://railway-catalog.com/07/018041000.html) | 保存・目視確認済み／`assets/trains/book-kitakyushu-monorail.webp` |
| 千葉都市モノレール | 千葉モノレール0形「アーバンフライヤー」。運行中。 | 懸垂式で車体が軌道桁から吊り下がる。空をイメージした白い流線型車体と大きな窓。 | [千葉モノレール車両紹介](https://chiba-monorail.co.jp/index.php/about-monorail/sharyou/) | 保存・目視確認済み／`assets/trains/book-chiba-monorail.webp` |
| 東京モノレール | 東京モノレール10000形。運行中。 | 跨座式。白銀色の6両編成、黒い窓帯とオレンジの側帯、空港連絡線らしい高架景色。 | [東京モノレール10000形公式紹介](https://www.youtube.com/watch?v=DBcNRnwm02s)、[東京モノレール公式情報](https://www.tokyo-monorail.co.jp/company/recruit/vision/) | 保存・目視確認済み／`assets/trains/book-tokyo-monorail.webp` |
| ゆいレール | 沖縄都市モノレール1000形。運行中。 | 跨座式。白い短編成、丸い運転台、青と赤の細い帯。沖縄の明るい街並み。 | [ゆいレール車両紹介](https://www.yui-rail.co.jp/yuirail/about/) | 保存・目視確認済み／`assets/trains/book-yui-rail.webp` |
| 大阪モノレール | 大阪モノレール3000系。運行中。 | 跨座式の4両、白い車体にウルトラマリンブルーとアザレアパープルの帯。 | [大阪モノレール車両紹介](https://www.osaka-monorail.co.jp/know/vehicle/) | 保存・目視確認済み／`assets/trains/book-osaka-monorail.webp` |
| 新穂高ロープウェイ | 第2ロープウェイの2階建てゴンドラ。運行中。 | ロープから吊るした白銀色の大きな2階建て客室。2020年にヨーロッパ風デザインへ更新し、上下階に広い窓。山の稜線。 | [新穂高ロープウェイ公式](https://shinhotaka-ropeway.jp/)、[施設・乗り場案内](https://shinhotaka-ropeway.jp/info01/)、[第2ゴンドラの沿革](https://shinhotaka-ropeway.jp/history/) | 保存・目視確認済み／`assets/trains/book-shinhotaka-ropeway.webp` |
| 箱根登山ケーブルカー | 2020年就役の5代目車両。運行中。 | 急勾配をケーブルで引き上げる2両編成。階段状の床と窓。1号車はバーミリオン、2号車は青色。ラック式の歯形レールではない。 | [2020年運行開始の公式発表](https://www.hakonenavi.jp/wp-content/uploads/2020/01/20200130.pdf)、[箱根ナビ・ケーブルカー](https://www.hakonenavi.jp/hakone-tozan/type_cablecar/)、[箱根登山公式資料](https://www.hakone-tozan.co.jp/assets/file/tozan_2008.pdf) | 保存・目視確認済み／`assets/trains/book-hakone-cable.webp` |
| 貨車 | JR貨物コキ107形コンテナ貨車。代表例。 | 機関車ではなく、台車2組の平らなコンテナ貨車を主役にする。固定具に載った実物サイズのコンテナ。貨物車に客室窓はないため、クマとウサギは安全柵のある公開見学場所から見ている。 | [JR貨物・コキ107展示資料](https://www.jrfreight.co.jp/info/2023/files/20230914_01.pdf)、[JR貨物コンテナ案内](https://www.jrfreight.co.jp/service/container/) | 保存・目視確認済み／`assets/trains/book-kasha.webp` |
| ディーゼル機関車 | JR貨物DF200形「レッドベア」。代表例。運行中。 | 大型の赤い電気式ディーゼル機関車、角ばった運転台、灰色の下回り。 | [JR貨物 車両開発](https://www.jrfreight.co.jp/service/improvement/development.html) | 保存・目視確認済み／`assets/trains/book-diesel-locomotive.webp` |
| ドクター東海 | JR東海キヤ95系。運行中。 | 3両の在来線検測気動車、銀色車体、黄色い前頭部、青系の側帯と屋根上の観測機器。 | [JR東海2025統合報告書](https://company.jr-central.co.jp/ir/annualreport/_pdf/annualreport2025.pdf)、[キヤ95系形式資料](https://www.itreni.net/jnrkeishikipage/dc/jrdc95.html) | 保存・目視確認済み／`assets/trains/book-doctor-tokai.webp` |
| スーパーレールカーゴ | JR貨物M250系。運行中。 | 動力車を編成の両端に分けた貨物電車。青い運転台付き先頭車とコンテナ車を連ねる。JR貨物公式写真を確認し、前後に動力車のある電車型貨物編成として描く。 | [JR貨物 M250系公式紹介・写真](https://www.jrfreight.co.jp/service/improvement/development.html) | 保存・目視確認済み／`assets/trains/book-super-rail-cargo.webp` |
| マルチプルタイタンパー | プラッサー08-16SH型。代表例。 | 黄色を基調とする大型保線機械。線路と枕木の上を走り、枕木間の砕石を突き固める複数の工具を描く。メーカー公式08シリーズの構成と南海資料の08-16SH導入を照合。 | [プラッサー08シリーズ](https://www.nipponplasser.co.jp/ja/machines-systems/tamping/track-tamping-machines/%E3%83%9E%E3%83%AB%E3%83%81%E3%83%97%E3%83%AB%E3%82%BF%E3%82%A4%E3%82%BF%E3%83%B3%E3%83%91%E3%83%BC-08%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA.html)、[南海の08-16SH導入資料](https://www.nankai.co.jp/library/company/company/handbook/pdf2021/06.pdf) | 保存・目視確認済み／`assets/trains/book-multiple-tamper.webp` |
| ササラ電車 | 札幌市交通局 雪20形・雪21号。運行中。 | 小型の橙色・クリーム色の除雪電車。車体前後に竹製の大きな回転ブラシ（ササラ）。札幌市交通事業振興公社の雪20形紹介と安全報告書の車両写真を確認し、橙色車体と前後のブルームを照合。 | [札幌市交通事業振興公社・雪20形公式紹介](https://www.stsp.or.jp/museum/%E9%9B%AA%E5%BD%A220%E5%BD%A2/)、[安全報告書・雪21号写真](https://www.stsp.or.jp/wp-content/themes/stsp/images/pdf/anzenhoukoku2019_full.pdf)、[札幌市資料・ササラ電車](https://www.city.sapporo.jp/shimin/bunkazai/documents/r5rekibuntankentai.pdf)、[製作・整備会社](https://www.sakkoki.co.jp/business) | 保存・目視確認済み／`assets/trains/book-sasara-train.webp` |
| ロータリー車 | 国鉄DD14形ロータリー除雪機関車332号機。退役車・歴史的代表例。 | 橙色の箱形ディーゼル機関車、白い側帯、濃灰色の台枠。先頭に大きなロータリーヘッドと側翼を装着。新津鉄道資料館の公式展示写真を実際に画面で開いて配色・前頭部を照合した。退役済みであることをdetailにも記載。 | [新津鉄道資料館・車両展示／公式写真](https://www.ncnrm.com/exhibition/outdoor/)、[新津鉄道資料館・DD14解説と退役記録](https://www.ncnrm.com/event/wp-content/uploads/sites/2/2015/06/20150718_20flyer.pdf)、[JR東日本のDD14車両公開資料](https://www.jreast.co.jp/press/2023/niigata/20230913_ni01.pdf)、[ロータリー式除雪の資料](https://www.toretabi.jp/train/vol41/02.html) | 保存・目視確認済み／`assets/trains/book-rotary-snowplow.webp` |

## 画像生成・確認の進捗

- ImageGen：組み込みの画像生成機能を使用。
- メタデータ：25 / 25新規配列項目を`src/book-local-work.js`へ記入済み。阪急京都線は既存対応表に記録し、新配列には重複登録しない。
- 生成済み：25 / 25新規画像。第1バッチ（DMV、高崎線、大村線）、第2バッチ（函館本線、予讃線、阪神線）、第3バッチ（西鉄、南海、名鉄犬山線）、第4バッチ（アストラムライン、ニュートラム、北九州モノレール）、第5バッチ（千葉都市モノレール、東京モノレール、ゆいレール）、第6バッチ（大阪モノレール、新穂高ロープウェイ、箱根登山ケーブルカー）、第7バッチ（貨車、ディーゼル機関車、ドクター東海）、第8バッチ（スーパーレールカーゴ、マルチプルタイタンパー、ササラ電車）、第9バッチ（ロータリー車）を保存・目視確認済み。阪急京都線は既存画像へ対応づけたため新規生成しない。
- 保存後は各画像をRGB WebP品質86に変換し、`assets/trains/book-<id>.webp`へ置く。変換後の画像をすべて目視し、明確な車両識別違いがある場合だけ再生成する。
- `src/book-local-work.js`には、親作業で音声生成を先行できるよう、25件の確定メタデータを記録。全25件の画像を保存・目視確認済み。阪急京都線は既存hankyu対応を使うため新規配列へ加えない。

## 生成プロンプト要約

| バッチ | 要約 |
|---|---|
| 1 | DMV93はバス車体と展開したレール車輪を明示。E233系3000番台は銀色車体・橙緑帯。YC1系は銀色の2両気動車・黒い前面窓・橙色のアクセント。各車両を主役にした海辺／郊外の水彩絵本画。 |
| 2 | H100形DECMOは銀色の短い気動車・濃緑と萌黄色の幾何学帯・雪山。7000系はステンレス車体・水色帯・瀬戸内海。阪神5700系は銀色車体・濃紺の前面・青帯と黄色の差し色。各車両を主役にした水彩絵本画。 |
| 3 | 西鉄9000形は銀色車体・ロイヤルレッド帯。南海8300系は銀色車体・青とオレンジの帯。名鉄9500系は銀色車体・名鉄スカーレットの前面と赤帯。各車両を主役にした水彩絵本画。 |
| 4 | アストラム7000系は6両の新交通車両・クロムイエロー帯・ゴムタイヤ。ニュートラム200系は緑色の短いAGT編成・丸みのある前面。北九州1000形は跨座式で白地に青帯。各車両を主役にした水彩絵本画。 |
| 5 | 千葉0形は桁から吊り下がる白い懸垂式車両・水色帯。東京10000形は跨座式・銀白色・黒い窓帯とオレンジ帯。ゆいレール1000形は跨座式・白地に青赤帯。方式と実車配色を区別して水彩絵本画に描く。 |
| 6 | 大阪3000系は白い跨座式モノレール・青紫帯。新穂高第2ゴンドラは白銀色の2階建て客室と上下の大窓、ケーブルから吊る。箱根ケーブルカーは階段状の2両編成で前後車を朱色と青に分け、急坂と牽引ケーブルを明示。 |
| 7 | コキ107形はコンテナ固定具のある平貨車単体、客室窓がないためクマとウサギは安全な公開見学場所に置く。DF200形は赤い車体と灰色屋根・下回り。キヤ95系は銀色3両、黄色い前頭部、青帯、屋根上の検測機器。 |
| 8 | M250系は前後に青い動力車があるコンテナ貨物電車。08-16SH型は黄色い保線車と枕木間の砕石を突き固める工具を大きく描く。雪20形は橙色の小型路面電車、前後に竹束の円筒ブラシを備え、札幌の雪道で除雪する。 |
| 9 | DD14形332号機の公式展示写真を確認し、橙色の箱形機関車・白帯・濃灰台枠と大きなロータリーヘッドを反映。退役済みの歴史的な除雪作業として描く。 |
