# スペーシアXの最終修正

初回生成の先頭部がE353系に近い形となり、窓が長方形だったため、親エージェントが公式写真を直接参照して組み込みImageGenで修正した。

## 一次資料

- [東武鉄道：車両デザイン](https://www.tobu.co.jp/spaciax/fun/exterior/)
- [東武鉄道：先頭車の写真](https://www.tobu.co.jp/spaciax/assets/img/index/mv_subpage.png)
- [東武鉄道：六角形の窓](https://www.tobu.co.jp/spaciax/assets/img/design/interior_concept.jpg)
- [東武鉄道：39ドットのLEDライト](https://www.tobu.co.jp/spaciax/assets/img/design/interior_ledlight.jpg)

公式写真は生成時の車両形状の参照だけに使用し、写真自体はアプリへ同梱しない。

## 最終プロンプト

```text
Use case: precise-object-edit. Asset: children's railway quiz illustration, 1536x1024 landscape3:2. Image1 is EDIT TARGET: watercolor scene with white train. Images2,3,4 are official real Tobu N100 SPACIA X design references; use them only to correct vehicle, not to copy photographic style or add text. Preserve Image1's full-bleed watercolor/anime picture book medium, spring mountain river, railway, pleasant daylight, one little bear and rabbit in passenger windows, overall three-quarter-front view cab at right and cars receding left. IMPORTANT replace inaccurate E353-like front and rectangular side windows with TRUE Tobu N100 Spacia X. Study Image2: short gently rounded upright front, high dark windshield inset in smooth porcelain-white shell, triangular side cab window, single broad shallow black rectangular LED headlamp matrix DIRECTLY BELOW the windshield in center of face (Image4 shows dot matrix). No diagonal side headlights, no pointy bullet train nose. White rounded lower skirt, exposed central coupler in horizontal opening. Study Image3: on leading car distinct large SIX-SIDED HEXAGONAL passenger window openings, not rectangular windows with Xs painted between them. Big individual hexagonal glass panels have angled white framing and small dark triangular infill between them. Intermediate cars may have ordinary rectangular windows, but the first passenger cabin behind the driver must display unmistakable multiple real hexagonal windows. Porcelain cool white body with subtle pale gray underside, black glazing. No purple/orange/blue stripes. One train only; no collage, no labels, no text, no logos, no watermark, no frames. Maintain exact1536x1024 landscape composition. This is an accuracy correction, not a generic white train.
```

## 採用ファイルと確認

- 原本：`assets/trains/renewed-extra-spacia-x.png`
- 配信：`assets/trains/renewed-extra-spacia-x.webp`（quality 88 / method 6）
- 両方1536×1024。新しく生成した結果を保存し、引き伸ばしや旧画像の切り抜きは行っていない。
- 前面下部のドット状LED、三角形の側面運転席窓、先頭車の六角形の客室窓、白い車体、中央の連結器を目視確認。斜めの側面ヘッドライトを除去した。
