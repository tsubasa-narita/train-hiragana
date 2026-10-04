# クイズ追加列車画像 独立レビュー

- 確認日: 2026-10-04
- 対象: `BOOK_TRAINS` の85件。生成済み画像は各 `.webp` を `view_image` で確認し、メタデータの公式ソースを参照して車体色・帯・先頭形状・車種の明白な食い違いを確認。
- 判定範囲: アニメ調の細部省略、編成両数の小さな省略、代表車両の形式差は許容。背景の黒表示は透明 alpha の確認対象外。
- この記録は読み取り専用レビュー。画像・コードは変更していない。

## 結果

現時点の `assets/trains` を確認し、85件すべての画像を目視レビュー済み。現行画像に明白なNGはありません。

### 要対応・既知指摘

現在の確認スナップショットでは、解消が必要なNGはありません。

親側で既知だった `book-hikari-railstar.webp` の黄色帯欠落は、今回再確認した画像では白い車体の窓下に黄色帯が見えるため解消済みとして判定しました。JR西日本の[700系・ひかりレールスター公式ページ](https://www.jr-odekake.net/railroad/train/700_8/)に掲載された車両外観とも主要な配色が一致します。公開前に画像が再差し替えされた場合は、その最終ファイルを再確認してください。

### 追加生成分

- `book-rotary-snowplow.webp`（ロータリー車）— レビュー中に生成を確認し、追加で目視しました。DD14形の赤橙色の車体、白帯、黒い下回りと前部ロータリーヘッドが見え、現行画像で明白な不一致はありません。
- はまかぜ・ひだは最終ファイルの更新時刻（2026-10-04 23:48:21）以降に再度目視しました。はまかぜの銀色車体と赤帯、ひだの白銀色車体と橙帯・黒い前面に明白な不一致はありません。

## 85件の確認状況

| ID | 車両 | 画像 | 状態 |
|---|---|---|---|
| `book-kodama` | こだま | `book-kodama.webp` | 確認済み・OK |
| `book-hikari` | ひかり | `book-hikari.webp` | 確認済み・OK |
| `book-hikari-railstar` | ひかりレールスター | `book-hikari-railstar.webp` | 確認済み・OK（黄色帯を確認） |
| `book-linear-chuo` | リニア中央新幹線 | `book-linear-chuo.webp` | 確認済み・OK |
| `book-east-i` | イーストアイ | `book-east-i.webp` | 確認済み・OK |
| `book-urbanliner` | アーバンライナー | `book-urbanliner.webp` | 確認済み・OK |
| `book-alps-express` | アルプスエキスプレス | `book-alps-express.webp` | 確認済み・OK |
| `book-elegant-saloon` | エレガント・サルーン | `book-elegant-saloon.webp` | 確認済み・OK |
| `book-ozora` | おおぞら | `book-ozora.webp` | 確認済み・OK |
| `book-kamui` | カムイ | `book-kamui.webp` | 確認済み・OK |
| `book-kounotori` | こうのとり | `book-kounotori.webp` | 確認済み・OK |
| `book-sarobetsu` | サロベツ | `book-sarobetsu.webp` | 確認済み・OK |
| `book-shinano` | しなの | `book-shinano.webp` | 確認済み・OK |
| `book-shirayuki` | しらゆき | `book-shirayuki.webp` | 確認済み・OK |
| `book-suzuran` | すずらん | `book-suzuran.webp` | 確認済み・OK |
| `book-tsugaru` | つがる | `book-tsugaru.webp` | 確認済み・OK |
| `book-tokachi` | とかち | `book-tokachi.webp` | 確認済み・OK |
| `book-hamakaze` | はまかぜ | `book-hamakaze.webp` | 確認済み・OK |
| `book-hida` | ひだ | `book-hida.webp` | 確認済み・OK |
| `book-fujisan-tokkyu` | フジサン特急 | `book-fujisan-tokkyu.webp` | 確認済み・OK |
| `book-yukemuri` | ゆけむり | `book-yukemuri.webp` | 確認済み・OK |
| `book-lilac` | ライラック | `book-lilac.webp` | 確認済み・OK |
| `book-soya` | 宗谷 | `book-soya.webp` | 確認済み・OK |
| `book-noto-kagaribi` | 能登かがり火 | `book-noto-kagaribi.webp` | 確認済み・OK |
| `book-36plus3` | 36ぷらす3 | `book-36plus3.webp` | 確認済み・OK |
| `book-52seki` | 52席の至福 | `book-52seki.webp` | 確認済み・OK |
| `book-bbbase` | B.B.BASE | `book-bbbase.webp` | 確認済み・OK |
| `book-etsetora` | etSETOra | `book-etsetora.webp` | 確認済み・OK |
| `book-highrail1375` | HIGH RAIL 1375 | `book-highrail1375.webp` | 確認済み・OK |
| `book-pokemon-with-you` | POKÉMON with YOU トレイン | `book-pokemon-with-you.webp` | 確認済み・OK |
| `book-royal-express` | THE ROYAL EXPRESS | `book-royal-express.webp` | 確認済み・OK |
| `book-tohoku-emotion` | TOHOKU EMOTION | `book-tohoku-emotion.webp` | 確認済み・OK |
| `book-shikishima` | TRAIN SUITE 四季島 | `book-shikishima.webp` | 確認済み・OK |
| `book-west-express-ginga` | WEST EXPRESS 銀河 | `book-west-express-ginga.webp` | 確認済み・OK |
| `book-aoniyoshi` | あをによし | `book-aoniyoshi.webp` | 確認済み・OK |
| `book-isaburo-shinpei` | いさぶろう・しんぺい | `book-isaburo-shinpei.webp` | 確認済み・OK |
| `book-orange-restaurant` | おれんじ食堂 | `book-orange-restaurant.webp` | 確認済み・OK |
| `book-ozatoro` | お座トロ展望列車 | `book-ozatoro.webp` | 確認済み・OK |
| `book-kinme` | キンメ電車 | `book-kinme.webp` | 確認済み・OK |
| `book-kotatsu` | こたつ列車 | `book-kotatsu.webp` | 確認済み・OK |
| `book-kotokoto` | ことこと列車 | `book-kotokoto.webp` | 確認済み・OK |
| `book-nanatsuboshi` | ななつ星 in 九州 | `book-nanatsuboshi.webp` | 確認済み・OK |
| `book-hiei` | ひえい | `book-hiei.webp` | 確認済み・OK |
| `book-furano-lavender-express` | フラノラベンダーエクスプレス | `book-furano-lavender-express.webp` | 確認済み・OK |
| `book-medetai-densha` | めでたいでんしゃ | `book-medetai-densha.webp` | 確認済み・OK |
| `book-yumezora` | ゆめぞら | `book-yumezora.webp` | 確認済み・OK |
| `book-resort-shirakami` | リゾートしらかみ | `book-resort-shirakami.webp` | 確認済み・OK |
| `book-resort-view-furusato` | リゾートビューふるさと | `book-resort-view-furusato.webp` | 確認済み・OK |
| `book-resort-yamadori` | リゾートやまどり | `book-resort-yamadori.webp` | 確認済み・OK |
| `book-rokumon` | ろくもん | `book-rokumon.webp` | 確認済み・OK |
| `book-aru-ressha` | 或る列車 | `book-aru-ressha.webp` | 確認済み・OK |
| `book-iyo-nada-monogatari` | 伊予灘ものがたり | `book-iyo-nada-monogatari.webp` | 確認済み・OK |
| `book-kaiyodo-hobby-train` | 海洋堂ホビートレイン | `book-kaiyodo-hobby-train.webp` | 確認済み・OK |
| `book-kairi` | 海里 | `book-kairi.webp` | 確認済み・OK |
| `book-suito` | 水都 | `book-suito.webp` | 確認済み・OK |
| `book-tango-kuromatsu` | 丹後くろまつ | `book-tango-kuromatsu.webp` | 確認済み・OK |
| `book-tetsudo-hobby-train` | 鉄道ホビートレイン | `book-tetsudo-hobby-train.webp` | 確認済み・OK |
| `book-tenku` | 天空 | `book-tenku.webp` | 確認済み・OK |
| `book-tabito` | 旅人 | `book-tabito.webp` | 確認済み・OK |
| `book-open-deck` | オープンデッキ車両 | `book-open-deck.webp` | 確認済み・OK |
| `book-dmv` | DMV | `book-dmv.webp` | 確認済み・OK |
| `book-jr-takasaki` | JR高崎線 | `book-jr-takasaki.webp` | 確認済み・OK |
| `book-jr-omura` | JR大村線（YC1系） | `book-jr-omura.webp` | 確認済み・OK（別worker確認対象。独立確認でも明白なNGなし） |
| `book-jr-hakodate` | JR函館本線 | `book-jr-hakodate.webp` | 確認済み・OK |
| `book-jr-yosan` | JR予讃線 | `book-jr-yosan.webp` | 確認済み・OK |
| `book-hanshin` | 阪神線 | `book-hanshin.webp` | 確認済み・OK |
| `book-nishitetsu` | 西鉄天神大牟田線 | `book-nishitetsu.webp` | 確認済み・OK |
| `book-nankai` | 南海線 | `book-nankai.webp` | 確認済み・OK |
| `book-meitetsu-inuyama` | 名鉄犬山線 | `book-meitetsu-inuyama.webp` | 確認済み・OK |
| `book-astram` | アストラムライン | `book-astram.webp` | 確認済み・OK |
| `book-newtram` | ニュートラム | `book-newtram.webp` | 確認済み・OK |
| `book-kitakyushu-monorail` | 北九州モノレール | `book-kitakyushu-monorail.webp` | 確認済み・OK |
| `book-chiba-monorail` | 千葉都市モノレール | `book-chiba-monorail.webp` | 確認済み・OK |
| `book-tokyo-monorail` | 東京モノレール | `book-tokyo-monorail.webp` | 確認済み・OK |
| `book-yui-rail` | ゆいレール | `book-yui-rail.webp` | 確認済み・OK |
| `book-osaka-monorail` | 大阪モノレール | `book-osaka-monorail.webp` | 確認済み・OK |
| `book-shinhotaka-ropeway` | 新穂高ロープウェイ | `book-shinhotaka-ropeway.webp` | 確認済み・OK |
| `book-hakone-cable` | 箱根登山ケーブルカー | `book-hakone-cable.webp` | 確認済み・OK |
| `book-kasha` | 貨車 | `book-kasha.webp` | 確認済み・OK |
| `book-diesel-locomotive` | ディーゼル機関車 | `book-diesel-locomotive.webp` | 確認済み・OK |
| `book-doctor-tokai` | ドクター東海 | `book-doctor-tokai.webp` | 確認済み・OK |
| `book-super-rail-cargo` | スーパーレールカーゴ | `book-super-rail-cargo.webp` | 確認済み・OK |
| `book-multiple-tamper` | マルチプルタイタンパー | `book-multiple-tamper.webp` | 確認済み・OK |
| `book-sasara-train` | ササラ電車 | `book-sasara-train.webp` | 確認済み・OK |
| `book-rotary-snowplow` | ロータリー車 | `book-rotary-snowplow.webp` | 確認済み・OK |

## 追加で参照した公式資料

- [JR貨物・車両の開発について（M250系スーパーレールカーゴ）](https://www.jrfreight.co.jp/service/improvement/development.html)
- [日本プラッサー・マルチプルタイタンパー08シリーズ](https://www.nipponplasser.co.jp/ja/machines-systems/tamping/track-tamping-machines/%E3%83%9E%E3%83%AB%E3%83%81%E3%83%97%E3%83%AB%E3%82%BF%E3%82%A4%E3%82%BF%E3%83%B3%E3%83%91%E3%83%BC-08%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA.html)
- [札幌市・ササラ電車の紹介資料](https://www.city.sapporo.jp/shimin/bunkazai/documents/r5rekibuntankentai.pdf)
- [新津鉄道資料館・DD14形ロータリー除雪機関車](https://www.ncnrm.com/exhibition/outdoor/)
- [JR西日本・はまかぜ](https://www.jr-odekake.net/railroad/train/hamakaze/)
- [JR東海・ひだ](https://railway.jr-central.co.jp/train/express/detail_02_08/index.html)

