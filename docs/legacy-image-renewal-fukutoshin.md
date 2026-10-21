# 副都心線10000系の最終修正

初回生成が千代田線16000系に近い金色の車体となったため、親エージェントが製造元の実車写真を直接参照し、組み込みImageGenで修正した。

## 一次資料

- [日立レール：Tokyo Metro 10000](https://www.hitachirail.com/products-and-solutions/rolling-stock/metro-trains/tokyo-metro-10000/)
- [同ページの実車写真](https://www.hitachirail.com/media/t2yd52mh/tokyometro.jpg)
- [東京メトロ：10000系](https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/yur-fuk_10000/index.html)

写真は生成時の車両デザインの参照だけに使い、アプリへ同梱しない。

## 最終プロンプト

```text
Use case: precise-object-edit. Asset:1536x1024 landscape3:2 children's railway quiz illustration. Image1 EDIT TARGET is a watercolor scene containing an incorrectly shaped gold metro train. Image2 is an official manufacturer Hitachi photograph of the REAL Tokyo Metro10000 series for VEHICLE DESIGN REFERENCE ONLY. Correct the train in Image1 to match the unmistakable exact10000series design in Image2; keep Image1's watercolor-anime picture book style, textured washes, spring countryside, railway, river, blossoms, overall cabatright/carsrecedingleft composition and tiny side-window animal passenger. The10000 is NOT a gold version of16000. Replace the front with Image2's relatively upright wide and subtly rounded face: charcoal curved cap, tall central emergency door extending from roofline all the way down to the low orange stripe, two large broad rectangular windshield panes either side with separate shallow display boxes ABOVE them; thin copper-brown framing down the OUTER frontedges. The LOWER front below windshield is a white horizontal apron with a small circular headlight in a short VERTICAL BLACK KEYHOLE pod at each outer side, then a muted orange-brown horizontal strip near bottom, then darkgray lip and silver lower skirt with exposed central coupler. No drooping diagonal triangular headlightpods, no giant gold U-shaped face. Silver sides with a thin brown stripe immediately above a thin mutedgold stripe at normal lower-window height. See Image2 carefully, preserve realistic train door/window rhythm. One train only, no other trains, no labels, no writing or numbers or lettering or logos, no borders, no collage. Do not copy photograph medium, text, station or background from Image2. Keep1536x1024 landscape fullbleed, gentle watercolor style and cheerful tone. Actual10000 form is essential.
```

## 採用ファイルと確認

- 原本：`assets/trains/renewed-extra-fukutoshin.png`
- 配信：`assets/trains/renewed-extra-fukutoshin.webp`（quality 88 / method 6）
- どちらも1536×1024。
- 大きな正面窓と中央の非常扉、低い位置の丸いライトと黒い縦長ハウジング、茶・金色の側面帯、下部の連結器を目視確認。16000系風の斜めライト・金色のU字形前面は不採用とした。
