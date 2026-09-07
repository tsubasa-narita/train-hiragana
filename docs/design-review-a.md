# デザインレビューA：列車画像の実車照合

実施日：2026-09-07

## 対象と方法

`src/data.js` の担当13 ID、同ファイルで共用される `tanigawa`・`toki`・`fuji`・`mizuho`、および `src/reward.js` の指定4 ID（`hayabusa`・`komachi`・`nozomi`・`kagayaki`）を確認した。

ローカル画像は `view_image` で実際に目視し、鉄道会社の公式ページまたは公式写真もCUAブラウザで実際に表示して比較した。判定は、列車形式、主要配色、前面形状、特徴的な窓や帯の組合せが子どもの認識を損なうかを基準にした。文字、動物、車両数、省略窓、絵本調のデフォルメは単独では要修正にしていない。

結果は **OK 20件、要修正 1件、不確実 0件**。つばめについては、JR九州公式の800系写真で確認できる白車体・赤一本帯・黒い窓と照合し、OKとした。以前の濃青＋赤／金帯やN700形式という疑いは採用しない。

## 判定表

| 区分 | ID | 実使用ファイル | 判定 | 実物との差の確認 |
|---|---|---|---|---|
| 担当 | `hayabusa` | `assets/trains/hayabusa.jpg` | OK | 緑の上半分、白い下半分、ピンク帯、長いE5系の鼻を確認。E5公式写真と一致。 |
| 担当 | `komachi` | `assets/trains/komachi.jpg` | OK | 赤い上半分と白／銀色の下半分、長いE6系の鼻を確認。E6公式写真と一致。 |
| 担当 | `kagayaki` | `assets/trains/kagayaki.jpg` | OK | 青い前面・上部、白い車体、銅色と青色の帯を確認。E7系公式写真と一致。 |
| 担当 | `nozomi` | `assets/trains/n700s_nozomi.png` | OK | 白いN700S系の長い丸鼻、黒い前面窓、青い帯を確認。JR東海公式N700Sの外観と一致。 |
| 担当 | `tsubasa` | `assets/trains/e8_tsubasa.png` | OK | 紫色の車体、白い下部、前面の紅花イエロー系アクセントを確認。E8系公式写真と一致。 |
| 担当 | `yamanote` | `assets/trains/yamanote.jpg` | OK | E235系らしい緑色の前面・帯と通勤形の前面を確認。山手線E235系公式写真と一致。 |
| 担当 | `enoden` | `assets/trains/enoden.png` | OK | 緑とクリーム色の箱形の300形風前面を確認。江ノ電公式の305-355編成写真と一致。実在する旧形式の表現として可。 |
| 担当 | `tsubame` | `assets/trains/kyushu_800_tsubame.png` | OK | 白い車体、赤い一本帯、黒い前面窓を確認。JR九州公式800系写真と主要配色・窓の組合せが一致。鼻の長さとライト差は角度・絵本調の範囲。 |
| 担当 | `azusa` | `assets/trains/azusa.webp` | OK | 白／銀色の車体、紫色の帯、背の高い角形の暗色前面窓を確認。E353系公式写真と一致。 |
| 担当 | `sakura` | `assets/trains/sakura.webp` | OK | 白いN700系の長い鼻、暗青色と金色の帯を確認。JR九州公式N700系の形式・外観と一致。 |
| 担当 | `narita-express` | `assets/trains/narita-express.webp` | OK | 白いE259系、赤い側面・屋根まわり、黒い前面窓を確認。N'EX公式写真と一致。 |
| 担当 | `marunouchi` | `assets/trains/marunouchi.webp` | OK | 赤い丸形の地下鉄前面と白い帯を確認。東京メトロ2000系公式写真と一致。 |
| 担当 | `rapit` | `assets/trains/rapit.webp` | OK | 濃青色、丸みの強い前面、特徴的な楕円窓を確認。南海ラピート公式写真と一致。 |
| 共用 | `tanigawa` | `assets/trains/kagayaki.jpg` | OK | `kagayaki` と同じE7系画像。JR東日本公式E7系ページが「とき・たにがわ」をE7系として掲載しており、形式・配色は用途に合う。 |
| 共用 | `toki` | `assets/trains/kagayaki.jpg` | OK | `kagayaki` と同じE7系画像。JR東日本公式E7系ページが「とき」をE7系として掲載しており、形式・配色は用途に合う。 |
| 共用 | `fuji` | `assets/trains/azusa.webp` | OK | `azusa` と同じE353系画像。JR東日本公式ページが富士回遊をE353系として掲載しており、形式・配色は用途に合う。 |
| 共用 | `mizuho` | `assets/trains/sakura.webp` | OK | `sakura` と同じN700系画像。JR九州公式案内がN700系の対象列車に「みずほ・さくら・つばめ」を掲載しており、N700系の形式・配色は用途に合う。 |
| ごほうび | `hayabusa` | `assets/rewards/reward_train_hayabusa.png` | 要修正 | E5系の緑・白・長い丸鼻は合うが、緑と白の境界に車体全長へ続く黒い帯がある。実車E5系の同位置は明るいピンク帯「つつじピンク」で、主要な識別配色の相違。 |
| ごほうび | `komachi` | `assets/rewards/reward_train_komachi.png` | OK | 赤い上部、白／銀色の下部、長いE6系の鼻を確認。主要配色と形式がE6系公式写真に合う。 |
| ごほうび | `nozomi` | `assets/rewards/reward_train_nozomi.png` | OK | 白いN700S系の長い鼻、黒い前面窓、青い帯を確認。JR東海公式N700Sの外観に合う。 |
| ごほうび | `kagayaki` | `assets/rewards/reward_train_kagayaki.png` | OK | 青い前面・上部、白い車体、銅色と青色の帯を確認。E7系公式写真に合う。 |

## 要修正候補の詳細

### `assets/rewards/reward_train_hayabusa.png`

画像の側面で、緑色の上部と白色の下部を分ける帯が黒く見える。実車E5系の同じ位置には、緑・白に加えて明るいピンクの「つつじピンク」帯がある。緑・白・長い鼻だけでもE5系らしさは残るが、E5系を覚えるための代表的な色の一つが置き換わっているため、ごほうび画像は要修正候補とする。修正時はこの帯を実車同様のピンクとして確認する。

裏取り：

- [JR東日本 E5系公式ページ](https://www.jreast.co.jp/train/shinkan/e5.html) — 長い鼻、上部の「ときわグリーン」、下部の「飛雲ホワイト」、境界の「つつじピンク」の説明。
- [JR東日本 E5系公式写真](https://www.jreast.co.jp/train/shinkan/img/e5_img01.jpg) — 上記の帯色と前面形状を実際に目視。

## 公式参照先（写真・該当ページを目視）

- E6系こまち：[公式ページ](https://www.jreast.co.jp/train/shinkan/e6.html) ／ [公式写真](https://www.jreast.co.jp/train/shinkan/img/e6_img01.jpg)
- E7系かがやき・とき・たにがわ：[公式ページ](https://www.jreast.co.jp/train/shinkan/e7.html) ／ [公式写真](https://www.jreast.co.jp/train/shinkan/img/e7_img01.jpg)
- E8系つばさ：[公式ページ](https://www.jreast.co.jp/train/shinkan/e8.html) ／ [公式写真](https://www.jreast.co.jp/train/shinkan/img/e8_img01.jpg)
- E235系山手線：[公式ページ](https://www.jreast.co.jp/en/train/local/e235.html) ／ [公式写真](https://www.jreast.co.jp/train/local/img/e235_img01.jpg)
- E353系あずさ・富士回遊：[公式ページ](https://www.jreast.co.jp/e/routemaps/azusa_kaiji.html) ／ [公式写真](https://www.jreast.co.jp/train/express/img/azusa_kaiji_img01.jpg)
- E259系成田エクスプレス：[公式ページ](https://www.jreast.co.jp/train/express/nex.html) ／ [公式写真](https://www.jreast.co.jp/train/express/img/nex_img01.jpg)
- N700S系のぞみ：[JR東海公式ページ](https://railway.jr-central.co.jp/train/shinkansen/n700s/index.html) ／ [公式フォトギャラリー](https://railway.jr-central.co.jp/train/shinkansen/n700s/photogallery.html)
- JR九州N700系さくら・みずほ：[公式ページ](https://www.jrkyushu.co.jp/trains/700/index.html) ／ [公式写真](https://www.jrkyushu.co.jp/trains/trains_img/700/pgttl.jpg) ／ [公式の列車対応案内](https://www.jrkyushu.co.jp/railway/ticket/rule/tokudai_baggage/)
- JR九州800系つばめ：[公式ページ](https://www.jrkyushu.co.jp/trains/800/index.html) ／ [公式写真](https://www.jrkyushu.co.jp/trains/trains_img/800/pgttl.jpg)
- 江ノ電300形：[公式ページ](https://www.enoden.co.jp/fan/museum/vehicle/300/) ／ [公式写真](https://www.enoden.co.jp/common/images/train/vehicle-300.jpg)
- 東京メトロ丸ノ内線2000系：[公式ページ](https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/marunouchi_2000/index.html) ／ [公式写真](https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/marunouchi_2000/images/index_img_01.jpg)
- 南海ラピート：[公式ページ](https://www.nankai.co.jp/traffic/express/rapit.html?rapid=2) ／ [公式写真](https://www.nankai.co.jp/sites/default/files/2022-06/02_rapid%EF%BC%92.jpg)

以上。コード、既存画像、共通ドキュメント、gitは変更していない。
