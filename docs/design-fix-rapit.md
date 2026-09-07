# ごほうびラピート再生成記録

実施日：2026-09-07

南海公式の50000系ラピート写真をCUAで目視し、青一色の車体、丸みのある大きな前面、暗い前面窓、楕円側窓を確認した。親の指摘どおり、前面の白い縦帯と下部の白帯は入れない条件にした。

公式参照：[南海ラピート50000系公式ページ](https://www.nankai.co.jp/traffic/express/rapit.html?rapid=2) ／ [公式写真](https://www.nankai.co.jp/sites/default/files/2022-06/02_rapid%EF%BC%92.jpg)（CUAで目視。親比較画像は `50000_3_0.jpg`）

最終prompt：

```text
Create a brand-new transparent-background PNG cutout asset in the same old reward-train style: friendly Japanese children's picture-book watercolor, soft watercolor texture, clean ink contours and gentle highlights. Depict the real Nankai Electric Railway 50000 series Rapi:t as one complete connected full formation of about 5 to 6 cars in a wide horizontal composition, traveling toward the right with its large rounded aerodynamic nose at the right. Preserve a single uninterrupted deep cobalt/royal blue exterior body, rounded bulbous nose, dark charcoal front windshield, and repeated large oval side passenger windows. Do not add a white vertical stripe on the front, a white lower body band, or any exterior white, silver, red, gold, green, purple, or orange stripe; only dark windows, windshield, wheels and small mechanisms may be non-blue. Add about two tiny cute animals in separate side windows. Keep the entire train inside transparent margins; no scenery, rails, ground, shadow, text, logo, watermark, border, extra train or detached parts. Genuine per-pixel transparency is required.
```

保存先：

- `assets/rewards/reward-rapit-v2.png`
- `assets/rewards/reward-rapit-v2.webp`（quality=88、alpha保持）
- 元asset `assets/rewards/reward_rapit.webp` は未変更

PNGとWebPを `view_image` で目視し、青一色の車体、丸い長い前面、楕円側窓、暗い前面窓、動物2匹、右向き全編成を確認した。両方とも `RGBA`・`2172×724`、alpha範囲 `(0,255)`、左上 `(0,0,0,0)`。
