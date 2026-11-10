# 西日本の追加候補（独立データ）

2026-11-10 確認。`src/new15-einstein.js` は既存アプリには未接続。画像名・IDは `n15-einstein-` で統一。5車種は各々異なる路線を選定。既存 `src/data.js` の展開先、book・popular・reward などの車両データ、および列車名・路線名を検索し、同名・同車種の収録が見つからないことを確認した。既存の観光列車がごめん・なはり線へ臨時乗り入れするため、同線の候補は取り下げ、ことでん志度線に変更した。運用は変更されうる。

画像は内蔵 image_gen で車種ごとに生成。PNGを原画像として保存し、WebPは同じ画像から変換。水彩アニメ風の創作画であり、写真そのものではない。沿線風景、動物、微細な模様は創作。実車の正確な車番や背景地点を保証しない。

## 信楽高原鐵道 SKR501

- ID `n15-einstein-shigaraki`、画像 `n15-einstein-shigaraki.png` / `.webp`。信楽線の貴生川〜信楽。
- 公式の[車両写真・各駅](https://koka-skr.co.jp/station.html)、[車両の色](https://koka-skr.co.jp/news/)。写真と緑の単行車、前面中央扉、前面上部の灯火を照合。
- 最終生成指示: 「濃緑色のSKR501、細い金色帯、中央貫通扉と2枚の前面窓、前面上部の四角い前照灯、角張った灰色の裾、パンタグラフなし。滋賀の山里、たぬき1匹、水彩アニメ絵本、横長、文字なし」。初回は灯火位置が違ったため再生成。
- 差異: 実車の正面の意匠やヘッドマークは簡略化され、金色の帯・側面窓や床下機器の形は創作されている。

## 錦川清流線 NT3001 せせらぎ号

- ID `n15-einstein-nishikigawa`、画像 `n15-einstein-nishikigawa.png` / `.webp`。列車は岩国〜錦町を運行し、岩国〜川西はJR岩徳線に乗り入れる。
- 公式の[実車写真](https://nishikigawa.com/wp-content/uploads/cf79c6f827f664a4009513606b0aa766.pdf)、[車両名](https://nishikigawa.com/topix/ekitag/)、[運行区間](https://seiryusen.nishikigawa.com/timetable/)、[乗り入れ](https://nishikigawa.com/information/how-to-use-seiryusenfare/)。青い単行車、中央扉と川の図柄を照合。
- 生成指示: 「青いNT3000せせらぎ号、川の小さな自然模様、平らな正面と大きな窓、山口の川沿い、斜め前から側面を見せる、水彩アニメ絵本、小鳥、文字なし、横長」。
- 差異: 車体の魚や水流などの絵柄、窓配置、灯火や側面扉は実車の正確な再現ではない。

## 一畑電車 7000系

- ID `n15-einstein-ichibata`、画像 `n15-einstein-ichibata.png` / `.webp`。北松江線・大社線。
- 公式の[7000系実車写真](https://railway.ichibata.co.jp/operate/trains/)、[路線と沿線](https://railway.ichibata.co.jp/wp-content/media/map-1.pdf)。白地、橙色の上下ライン、中央扉とパンタグラフを照合。
- 最終生成指示: 「白地に上下の細いオレンジ線、色のついた円弧模様、中央貫通扉と大きな前面窓、パンタグラフ付きの単行7000系。島根の湖と田園、うさぎ1匹、水彩アニメ絵本、横長、文字なし」。初回の橙色中心の車体を白地へ再生成。
- 差異: 円弧の色・大きさ・配置は実車各号車の意匠と異なり、前照灯・前面の黒い縞や窓も簡略化されている。

## ことでん志度線 600形

- ID `n15-einstein-kotoden-shido`、画像 `n15-einstein-kotoden-shido.png` / `.webp`。瓦町〜琴電志度。
- 公式の[志度線600形実車写真・車両データ](https://www.kotoden.co.jp/publichtm/kotoden/gallery/date/date.html)、[時刻表](https://www.kotoden.co.jp/publichtm/sp/main/s00.html)。クリーム色上部、赤系の下部、短い車体とパンタグラフを照合。
- 最終生成指示: 「アイボリーの上部と赤系の下半分、中央貫通扉のない平らな前面、3枚の前面窓、側面3扉、パンタグラフ、短い2両編成。瀬戸内の風景、小鳥、水彩アニメ絵本、文字なし」。初回に不適切な中央扉が出たため再生成。
- 差異: 前照灯の個数と配置、前面窓の比率、側面扉・窓の配置は公式写真と一致しない。実車の塗装は編成によって異なる。

## 甘木鉄道 AR303

- ID `n15-einstein-amagi`、画像 `n15-einstein-amagi.png` / `.webp`。甘木線の基山〜甘木。
- 公式の[AR303実車写真と路線図](https://www.amatetsu.jp/new/tanabata.pdf)、[路線概要](https://www.amatetsu.jp/company/index.html)。クリームと朱色の2色、単行車、中央扉を照合。写真は過去の姿であり、個別車両の最新の運用は未確認。
- 最終生成指示: 「上部クリーム、下部朱色のAR303、平らな正面、中央貫通扉と2枚の窓、短い単行車、福岡・佐賀の田園、水彩アニメ絵本、小鳥、文字なし」。当初の緑帯・全体赤色は実車の塗り分けと異なるため再生成。
- 差異: 実車写真では灯火は正面下部にあり、生成画では上部に付いている。側面の窓割り・車番・小さな文字も異なり、遠景の建物は架空。
