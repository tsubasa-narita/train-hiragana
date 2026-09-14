# 追加ごほうび画像の生成記録

生成日: 2026-09-14

生成方法: built-in `image_gen`。Pillowは生成PNGからWebP(q88)へ変換する用途だけに使用。

共通仕様: アニメ水彩絵本風、横長の右向き全編成、車両をキャンバス内に収める、実車参照で形状と帯色を固定、小動物は合計2匹、画像内の文字・ロゴ・透かしなし。ごほうび画像は真のRGBAアルファ透過背景。2026-09-14の最終監査で5種すべてPNG/WebPのアルファ最小値0・最大値255を確認した。

## 最終ファイル名

| id | PNG原本 | WebP(q88) | 参照 |
| --- | --- | --- | --- |
| tsubasa | `assets/rewards/reward-extra-tsubasa.png` | `assets/rewards/reward-extra-tsubasa.webp` | `assets/trains/e8_tsubasa.png`、[JR東日本E8公式写真](https://www.jreast.co.jp/train/shinkan/img/e8_img01.jpg)、`assets/rewards/reward-hayabusa-v2.png`、`assets/rewards/reward-rapit-v2.png` |
| enoden | `assets/rewards/reward-extra-enoden.png` | `assets/rewards/reward-extra-enoden.webp` | `assets/trains/enoden.png`、`assets/rewards/reward-hayabusa-v2.png`、`assets/rewards/reward-rapit-v2.png` |
| sonic | `assets/rewards/reward-extra-sonic.png` | `assets/rewards/reward-extra-sonic.webp` | `assets/trains/sonic.webp`、[JR九州公式883系ソニック](https://www.jrkyushu.co.jp/trains/sonic/)、[公式メイン写真](https://www.jrkyushu.co.jp/trains/trains_img/sonic/pgttl.jpg)。最終生成ではラピート画像を入力参照に不使用 |
| yufuin | `assets/rewards/reward-extra-yufuin.png` | `assets/rewards/reward-extra-yufuin.webp` | `assets/trains/yufuin.png`、`assets/rewards/reward-hayabusa-v2.png`、`assets/rewards/reward-rapit-v2.png` |
| momotaro | `assets/rewards/reward-extra-momotaro.png` | `assets/rewards/reward-extra-momotaro.webp` | `assets/trains/momotaro.webp`、`assets/rewards/reward-hayabusa-v2.png`、`assets/rewards/reward-rapit-v2.png` |

## 個別記録

### tsubasa

最終プロンプト要旨: E8つばさの長い先頭鼻、奥まった黒いコックピット、紫・白・オレンジ黄色帯、全編成を右向きで描く。透明背景、窓から小動物2匹、文字・ロゴなし。

参照役割: `assets/trains/e8_tsubasa.png` はE8の形状・塗装、v2ごほうび2枚は透明切り抜きの画風・構図。

元生成ファイル: 初回不採用 `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-3448bdc0-513b-4960-9a1a-0af2c491e451.png`、E8再生成採用 `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-c87b00e5-a325-402c-a4e2-8ad685f318ea.png`

最終プロンプト: E8つばさの長い鼻、奥まった黒いコックピット、紫・白・黄色/オレンジ帯、右向き全編成を、真のRGBA透過背景で描く。E3/E6の短い丸鼻を避け、窓から小動物2匹、文字・ロゴなし。参照はE8公式写真と既存E8画像を形状・塗装用、切り抜きv2画像を画風用に使用。

確認: 最新版は親が目視採用済み。右向き全編成、E8の長い鼻、紫/白/黄色帯、動物2匹、PNG/WebPともRGBA `(0,255)` を確認した。

### enoden

最終プロンプト要旨: 江ノ電の2両編成、丸みのある箱形運転台、深い緑とクリーム色の帯、屋根のパンタグラフを右向き全編成で描く。透明背景、窓から小動物2匹、文字・ロゴなし。

参照役割: `assets/trains/enoden.png` は車体形状・緑/クリーム塗装、v2ごほうび2枚は画風・透明切り抜き。

元生成ファイル: `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-82238538-662f-4ea6-8c33-5f7f7e56569c.png`

確認: 右向き2両編成、車両切れなし、緑/クリーム塗装、小動物2匹、RGBAアルファ `(0,255)` を実測済み。採用。

### sonic

最終プロンプト要旨: JR九州883系ソニックの7両編成、金属的な鮮青色の車体、銀色の下部、深い色の大きな前面窓、流線形だがラピートの丸窓ではない先頭形状を右向きで描く。透明背景、窓から小動物2匹、文字・ロゴなし。

公式参照: [JR九州 883系ソニック](https://www.jrkyushu.co.jp/trains/sonic/)、[公式メイン写真](https://www.jrkyushu.co.jp/trains/trains_img/sonic/pgttl.jpg)。公式資料では883系ソニックを金属的な青色の車体として紹介している。

元生成ファイル: 旧不採用候補 `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-a1906f2d-54a0-42dc-91b1-77bc83ca7b79.png`、883形状修正版 `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-b600be2f-e170-4d5c-821c-4f7d3fa5631a.png`、最終採用 `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-5c2b918e-5aa6-4450-8ffd-e5ec02c59ad8.png`

最終プロンプト: JR九州公式の883系ソニックを基準に、角張った青い前面、深い前面窓、四角い通常側窓、金属的な青/銀の7両編成を右向きで描く。ラピート画像は参照に使わず、ラピートの丸窓・ドーム鼻を明示的に排除。真のRGBA透過、窓から小動物2匹、文字・ロゴなし。

確認: 最終版は親が目視採用済み。ラピートの丸窓ではない883系の角張った青い前面、四角い側窓、青銀7両、動物2匹、PNG/WebPともRGBA `(0,255)` を確認した。

### yufuin

最終プロンプト要旨: ゆふいんの森の丸い展望先頭、深いフォレストグリーン、金色帯、全編成を右向きで描く。透明背景、通常客室窓から小動物2匹、展望窓には動物なし、文字・ロゴなし。

参照役割: `assets/trains/yufuin.png` は車体形状・緑/金塗装、v2ごほうび2枚は画風・透明切り抜き。

元生成ファイル: 初回 `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-d14cde51-babe-438a-bb02-8b6a0e05e572.png`、動物数修正版 `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-ac29550e-9974-487b-be2c-1e6756836891.png`

確認: 修正版は右向き、全編成、緑/金塗装、小動物2匹を確認済み。Poincareへ透過修正を引き継ぎ、最終PNG/WebPはRGBA `(0,255)`。この担当では以後変更していない。

### momotaro

最終プロンプト要旨: JR貨物EF210桃太郎の青/淡銀色の角形電気機関車、屋根の2基パンタグラフ、左へ続く複数の無地コンテナ貨車を右向きで描く。機関車キャブ窓に小動物2匹、透明背景、文字・ロゴなし。

参照役割: `assets/trains/momotaro.webp` はEF210の機関車形状・青/銀塗装、v2ごほうび2枚は画風・透明切り抜き。

元生成ファイル: `C:\Users\narit\.codex\generated_images\01a09ab9-fa0d-79f3-910d-c278473b2dd3\exec-8727cd38-a209-4e9e-a827-07ee84efb70d.png`

確認: 右向き、EF210機関車＋コンテナ編成、動物2匹、文字・ロゴなしを確認済み。Poincareへ透過修正を引き継ぎ、最終PNG/WebPはRGBA `(0,255)`。この担当では以後変更していない。

## RGBA監査

2026-09-14にPillowで最終名のPNG/WebPを実測した。`reward-extra-tsubasa`、`reward-extra-enoden`、`reward-extra-sonic`、`reward-extra-yufuin`、`reward-extra-momotaro` はすべてPNG/WebPともRGBA、アルファ最小値0・最大値255で、透明ピクセルを含む。チェッカーの焼き込みは最終5種では検出されなかった。

`reward-extra-tsubasa-e8.*`、`reward-extra-sonic883.*`、`reward-extra-momotaro-ef210.*` は親コードの指定に合わせて最終名へリネーム済み。旧名は最終納品名として使用しない。
