# 列車画像デザイン修正 C

生成日: 2026-09-07

## `meitetsu-v2` / 名鉄2000系ミュースカイ

前回の `assets/trains/meitetsu.webp` は、ミュースカイ2000系の前面に長い赤帯を混ぜていたため、公式写真に合わせて新規生成した。名鉄公式写真で、白い車体、濃紺の前面窓、青い前面側パネルと下部スカートを目視確認した。赤帯、赤い前面、動物柄は採用していない。

- [名鉄2000系公式ページ](https://www.meitetsu.co.jp/library/rolling_stock/detail_exp/2000.html)
- [2000系ミュースカイ公式写真](https://www.meitetsu.co.jp/library/rolling_stock/detail_exp/__icsFiles/afieldfile/2021/06/24/library_rolling_stock_2000.jpg)

### 生成プロンプト

```text
Use case: illustration-story
Asset type: a wide horizontal children's train learning card for a Japanese hiragana train app.
Primary request: create one new original watercolor picture-book illustration of the real Meitetsu 2000 series μSky airport limited express. This is a corrective replacement image, so the real train form and white-blue-black color identity must be precise and immediately recognizable.
Scene/backdrop: an original Nagoya / Chubu Centrair travel landscape, with a distant Nagoya skyline and a low airport access viaduct, green riverside trees and soft morning sky.
Subject: a 4-car Meitetsu 2000 series μSky train shown front three-quarter view. Accurate exterior: mostly white and silver body, broad dark navy-black front windshield, white central front face, cobalt-blue vertical panels around the front doors and at the side door pillars, blue lower front skirt and blue lower side details, narrow blue side accents, realistic commuter limited-express proportions, roof pantograph and equipment. Keep the actual broad μSky front with the dark window high above the white nose and the blue side framing seen in official photos.
Style/medium: the existing project style, friendly children's animation with a soft Japanese watercolor picture-book finish, clean outlines, warm hand-painted paper texture, readable train silhouette.
Composition/framing: wide horizontal 16:9; the train is dominant on the left-to-center, moving along a gentle curve toward the viewer; show enough side to see the white body and blue door accents; leave open sky and landscape around it.
Lighting/mood: clear cheerful morning, soft sunlight and watercolor paper texture.
Color palette: white, silver, cobalt blue, deep navy-black window, natural greens and sky blue.
Constraints: exactly two small animals, a cat and a squirrel, safely beside the distant track; animals secondary and never painted on the train. Preserve the real Meitetsu 2000 μSky appearance. No need for readable lettering.
Avoid: any red paint or red side stripe; red roof; red front band; colorful animal mural on the train; green or yellow train livery; Shinkansen nose; E353 purple front; generic metro train; extra locomotives; duplicated train fronts; station signs with text; watermark; collage; photorealism.
```

### 保存先と確認結果

- `assets/trains/meitetsu-v2.png`
- `assets/trains/meitetsu-v2.webp`
- 白・銀・濃紺・青の2000系前面、青い前面側パネルと下部スカートを確認。
- 赤帯、赤い屋根、赤い前面太帯はなく、動物は猫とリスの2匹。

## `red-arrow-v2` / 西武10000系レッドアロー

親側で公式 [西武10000系写真 series-10000.jpg](https://www.seiburailway.jp/railway/encyclopedia/10000/images/series-10000.jpg) と比較し、旧 `red-arrow.webp` の修正を確定した。公式写真で、白灰色車体、窓周囲の濃灰、細い赤い側帯、平たく立った広い前面窓、下部左右の丸ライト対、中央の小表示を目視確認した。

### 生成プロンプト

```text
Use case: illustration-story
Asset type: a wide horizontal children's train learning card for a Japanese hiragana train app.
Primary request: create one new original watercolor picture-book illustration of the real Seibu Railway 10000 series New Red Arrow limited express. This is a corrective replacement image, so the front geometry and restrained livery must be faithful to the official Seibu 10000 series reference.
Scene/backdrop: an original Chichibu mountain landscape in Saitama, with layered green mountains, a clear river valley, trees and a gentle railway curve through the countryside.
Subject: a Seibu 10000 series New Red Arrow train in a front three-quarter view, white and light gray body, a thin narrow red horizontal side band at window level, dark charcoal-gray window surround, a broad wide dark front windshield on a flat upright front face with softly rounded corners, paired round headlights low on the left and right, a small central destination display between the front windows/lights, modest white-gray lower front and visible coupler, realistic 10000 series limited-express proportions. The train may extend behind the lead car, with a long passenger consist, but the lead front is the visual focus.
Style/medium: the existing project style, friendly children's animation with a soft Japanese watercolor picture-book finish, clean outlines, warm hand-painted paper texture, readable train silhouette.
Composition/framing: wide horizontal 16:9; the train is dominant on the right half and approaches on a gentle curve; leave the Chichibu mountains and river clearly visible on the left and behind it.
Lighting/mood: bright clear morning, calm and cheerful.
Color palette: white and light gray body, dark charcoal window area, one thin muted red side stripe, natural greens and blue sky. Keep red limited to the thin side belt.
Constraints: exactly two small animals, a Japanese serow and a small rabbit, safely beside the distant track or riverbank; animals secondary and never painted on the train. Preserve the official Seibu 10000-series front cues: flat upright face, broad wide window, low paired round lights, small central display, dark window surround, thin red side belt.
Avoid: red roof; thick red front band; red front mask; large red nose; sharply sloped wedge-shaped nose; futuristic aerodynamic nose; E353, N700, Shinkansen, or generic commuter front; colored animal mural; extra locomotives; duplicated train fronts; station signs with text; watermark; collage; photorealism.
```

### 保存先と確認結果

- `assets/trains/red-arrow-v2.png`
- `assets/trains/red-arrow-v2.webp`
- 平たい立った前面、幅広い濃灰窓、下部左右の丸ライト対、中央小表示、白灰車体、細赤側帯を確認。
- 旧画像の赤い屋根、赤い前面太帯、傾斜したくさび形ノーズは継承していない。背景は秩父山地と川、動物は指定どおりニホンカモシカとウサギの2匹。

## 親統合用メモ

4形式の画像ファイルと本記録のみを追加した。`src/data.js`、`src/reward.js`、既存画像、共通ドキュメント、gitには変更を加えていない。`red-arrow` と `meitetsu` の参照先切り替えは親側で行う。
