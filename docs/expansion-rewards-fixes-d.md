# ごほうび画像の偽透明修正記録

修正日: 2026-09-14

対象: `reward-extra-yufuin`、`reward-extra-momotaro`

## 対応内容

既存のPNG/WebPは、透明背景に見えるチェッカー柄がRGB画素として焼き込まれた偽透明だった。対象画像を built-in `image_gen` で編集し、車両を固定して背景を除去する指示を与えた。その後、ImageGenの出力にもチェッカー柄がRGBとして残ったため、元の車両画素を保持したまま、外周から連結する背景領域だけをアルファ0に再構成した。最終PNGを原本としてWebP(q88)へ置換した。

共通仕様: アニメ水彩絵本風、横長の右向き全編成、車両をキャンバス内に収める、動物は2匹、文字・ロゴ・透かしなし。車両の形状と塗装は既存の実車参照に合わせて固定。

## 公式参照と保存先

| id | 公式参照 | 車両参照 | PNG | WebP |
| --- | --- | --- | --- | --- |
| yufuin | [JR九州 ゆふいんの森](https://www.jrkyushu.co.jp/trains/yufuinnomori/) / [公式写真](https://www.jrkyushu.co.jp/trains/trains_img/yufuinnomori/pgttl.jpg) | `assets/trains/yufuin.png` | `assets/rewards/reward-extra-yufuin.png` | `assets/rewards/reward-extra-yufuin.webp` |
| momotaro | [JR貨物「車両の開発について」](https://www.jrfreight.co.jp/service/improvement/development.html) / [EF210 ECO-POWER桃太郎公式写真](https://www.jrfreight.co.jp/images/%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E5%90%91%E4%B8%8A%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E5%8F%96%E7%B5%84%E3%81%BF/%E8%BB%8A%E4%B8%A1%E3%81%AE%E9%96%8B%E7%99%BA%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6/img_02.jpg) | `assets/trains/momotaro.webp` | `assets/rewards/reward-extra-momotaro.png` | `assets/rewards/reward-extra-momotaro.webp` |

画風と透明切り抜きの補助参照は、既存の `assets/rewards/reward-hayabusa-v2.png` と `assets/rewards/reward-rapit-v2.png` を使用した。元の生成経緯と偽透明判定は [`docs/expansion-rewards.md`](expansion-rewards.md) に記録されている。

## ImageGen編集プロンプト

### yufuin

```text
Edit this exact existing illustration. Keep the entire right-facing Yufuin no Mori train, its rounded observation cab, deep forest-green body, gold bands, windows, undercarriage, and exactly the same two small animals. Preserve the train's shape, scale, position, colors, watercolor picture-book anime style, and all vehicle details. Remove the checkerboard-looking background completely and output a real PNG with a genuine RGBA alpha channel: every area outside the train and animals must be transparent alpha 0, with no painted checkerboard, gray, white, or colored backdrop. Do not redraw, crop, simplify, recolor, add scenery, text, logo, watermark, or extra animals.
```

### momotaro

```text
Edit this exact existing illustration. Keep the entire right-facing JR Freight EF210 Momotaro freight consist, the blue and pale-silver locomotive, white front panel, yellow detail stripe, two roof pantographs, flatcars, plain green/blue/red/cream containers, and exactly the same two small animals in the cab windows. Preserve the vehicle shapes, scale, position, colors, watercolor picture-book anime style, and all details. Remove the checkerboard-looking background completely and output a real PNG with a genuine RGBA alpha channel: every area outside the train, containers, pantographs, and animals must be transparent alpha 0, with no painted checkerboard, gray, white, or colored backdrop. Do not redraw, crop, simplify, recolor, add scenery, text, logo, watermark, or extra animals.
```

## 目視・ファイル検証

- 2026-09-14にPNG/WebPをPillowで再読込し、全4ファイルが `RGBA`、`2172x724`、アルファ最小値0・最大値255であることを確認した。
- PNG/WebPとも透明画素と不透明画素を含み、背景の四隅は透明になっている。部分アルファを持たない硬い切り抜きで、チェッカー柄は最終画面に残っていない。
- マゼンタ背景へ合成して目視し、ゆふいんの森は深緑・金帯・丸い展望先頭・小動物2匹、桃太郎は青/淡銀EF210・2基パンタグラフ・コンテナ列・小動物2匹を確認した。
- 指定のPNG/WebPだけを置換し、この記録ファイルを追加した。コードや親担当のファイルは変更していない。
