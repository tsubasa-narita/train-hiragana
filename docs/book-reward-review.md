# 書籍候補ごほうび車両画像レビュー

- レビュー日：2026年10月4日
- 判定：**外観識別の範囲で承認**

## レビュー範囲

[`src/book-rewards.js`](../src/book-rewards.js) に登録された全10件について、対応する `assets/rewards/reward-book-*.webp` を `view_image` で1枚ずつ確認し、`docs/book-reward-sources.md` の指定と各鉄道会社の公式車両ページ・公式資料の外観写真を照合した。

確認対象は車体の主色・識別帯・先頭形状・機関車牽引列車と電車の区別。アニメ調の細部省略とわずかな編成車数の省略は、依頼に従い不具合として扱わない。`view_image` 上で黒く見える透明部分は背景色として評価していない。アルファ値の定量検査、コードやアプリへの統合、読み上げ名、書籍収録内容との一致はこのレビューの対象外。

## 確認結果

| 列車 | 画像 | 外観上の確認 |
|---|---|---|
| アーバンライナー | `reward-book-urbanliner.webp` | 白い車体と橙帯、濃色の曲面前面窓、電車の屋根機器を確認。別形式と取り違える明確な差異なし。 |
| 特急しなの | `reward-book-shinano.webp` | 銀色車体と橙帯、383系の暗色前面窓、電車の屋根機器を確認。 |
| 特急ひだ | `reward-book-hida.webp` | HC85系の銀白色車体、側窓上の橙帯、中央貫通扉を持つ暗色の前面を確認。 |
| 特急ライラック | `reward-book-lilac.webp` | 789系0代の緑色前面、中央貫通扉、銀白色側面と緑帯を確認。 |
| あをによし | `reward-book-aoniyoshi.webp` | 濃紫色と金色の装飾、旧来型特急車らしい前面、電車の屋根機器を確認。 |
| ななつ星イン九州 | `reward-book-seven-stars.webp` | ワインレッドと金色の客車列に、独立したDF200形機関車が連結された構成を確認。電車や単一の動力車編成に見える明確な誤りなし。 |
| トランスイート四季島 | `reward-book-shikishima.webp` | シャンパンゴールド系の車体、幾何学的な側窓と展望車の大きな前面窓を確認。 |
| ザ・ロイヤルエクスプレス | `reward-book-royal-express.webp` | ロイヤルブルーと金色の装飾、広い前面窓、電車の屋根機器を確認。 |
| ウエストエクスプレス銀河 | `reward-book-west-express-ginga.webp` | 瑠璃紺色と淡色の側面ライン、117系由来の平面に近い前面を確認。低い左右のメイン灯具4灯と上部の小灯具の配置に明白な誤りなし。 |
| リゾートしらかみ（橅） | `reward-book-resort-shirakami.webp` | 銀白色地に緑・黄緑の葉を思わせる模様、緑色の展望型前面を確認。架線用パンタグラフを備えない車両として描かれている。 |

## 公式照合資料

- [近鉄 21020系 アーバンライナー・ネクスト](https://www.kintetsu.jp/kouhou/Train/B05.html)
- [JR東海 383系](https://railway.jr-central.co.jp/train/express/detail_02_01/index.html)
- [JR東海 HC85系](https://railway.jr-central.co.jp/train/express/detail_02_08/index.html)
- [JR北海道 特急ライラック（789系0代）](https://www.jrhokkaido.co.jp/train/tr033_01.html)
- [近鉄 観光特急あをによし](https://www.kintetsu.co.jp/senden/aoniyoshi/about/)
- [JR九州 ななつ星 車両紹介](https://www.cruisetrain-sevenstars.jp/train/)、[DF200形機関車の公式紹介](https://www.cruisetrain-sevenstars.jp/column/2890/)
- [JR東日本 TRAIN SUITE 四季島 公式パンフレット](https://www.jreast.co.jp/shiki-shima/pdf/pamphlet202604202606.pdf)
- [東急・伊豆急行 THE ROYAL EXPRESS 公式資料](https://www.tokyu.co.jp/company/news/pdf/161117-a442_1.pdf)
- [JR西日本 WEST EXPRESS 銀河 車両紹介](https://www.jr-odekake.net/railroad/westexginga/train/)
- [JR東日本 リゾートしらかみ「橅」車両新造資料](https://www.jreast.co.jp/press/2015/20150506.pdf)

## 結論

上記10画像について、今回の確認対象である車体色・帯・先頭形状・動力方式の区別に、公開前の修正を要する明確な誤りは見つからなかった。この判定はごほうび画像の外観識別に限る。
