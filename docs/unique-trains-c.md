# 専用列車画像生成記録 C

生成日: 2026-09-07

## 方針

`fuji`（E353系・富士回遊）と `mizuho`（N700系・みずほ）を、流用画像から専用画像へ置き換えるために新規生成した。既存の `assets/trains/azusa.webp` と `assets/trains/sakura.webp` は変更していない。生成には組み込み `image_gen` を使用し、出力を `view_image` で確認してからプロジェクトのPNGとWebPへ保存した。

全4ファイルは RGB、1672×941 px の横長16:9。絵本アニメ水彩の画面に動物を2匹だけ配置し、列車の形式・前面形状・主要配色を公式写真に合わせた。

## `fuji` / E353系 富士回遊

### 公式照合

JR東日本公式ページは愛称を「あずさ／かいじ／富士回遊」、形式をE353系、運行区間に富士急行線（河口湖）と記載している。公式写真では、白銀色の車体、上部の大きな濃黒色前面窓、前面左右の青紫パネル、細い縦型ライトを目視確認した。

- [JR東日本公式「あずさ／かいじ／富士回遊（E353系）」](https://www.jreast.co.jp/train/express/azusa_kaiji.html)
- [公式外観写真 azusa_kaiji_img01.jpg](https://www.jreast.co.jp/train/express/img/azusa_kaiji_img01.jpg)

### 生成プロンプト

```text
Use case: illustration-story
Asset type: a wide horizontal children's train learning card for a Japanese hiragana train app.
Primary request: create one new original watercolor picture-book illustration of the real JR East E353 series used for the limited express Fuji Excursion (富士回遊). The train must be immediately recognizable as an E353, with accurate real-world exterior design and colors.
Scene/backdrop: the Fuji Five Lakes / Yamanashi countryside, a clear snow-capped Mount Fuji in the distance, a curving railway through green fields and a little blue lake, with a distinct original composition.
Subject: a 3-car E353 train shown in a front three-quarter view, bright white and silver body, large dark charcoal-black sloped front windshield, smooth rounded pointed nose, narrow vertical headlights at both sides of the nose, blue-violet and purple accent panels sweeping upward along both sides of the front, dark roof equipment and underframe, and realistic modern limited-express proportions. Keep the E353 front geometry and side window arrangement faithful to the official reference.
Style/medium: the existing project style, friendly children's animation with a soft Japanese watercolor picture-book finish, clean outlines, warm hand-painted paper texture, readable train silhouette.
Composition/framing: wide horizontal 16:9 composition; the train is the dominant subject on the right half, moving toward the viewer on a gentle curve; Mount Fuji remains clearly visible behind it; leave breathing room around the train.
Lighting/mood: bright clear morning, gentle spring sunlight, cheerful and calm.
Color palette: white and silver train, charcoal window, blue and violet accents, natural greens and sky blue; keep the train colors saturated enough to read for a child.
Constraints: exactly two small animals, a Japanese fox and a rabbit, standing safely beside the distant track or in the field; animals must be secondary and must not be painted on the train. Preserve the real E353 livery and front shape. No need for readable lettering.
Avoid: red, orange, green, or yellow train stripes; Shinkansen nose; E257 train; old Azusa train; flat commuter front; invented colored mask; extra locomotives; duplicated train fronts; station signs with text; watermark; collage; photorealism.
```

### 保存先と確認結果

- `assets/trains/fuji-original.png`
- `assets/trains/fuji-original.webp`
- 富士山、湖、田園を使った独自構図。列車は白銀車体、濃黒前面窓、青紫の前面パネルを保持しており、赤・黄・緑の帯やE257系の形状は入っていない。
- 動物は狐とウサギの2匹。列車に動物柄を描かず、背景側に置いた。

## `mizuho` / N700系 みずほ

### 公式照合

JR西日本公式ページは「みずほ・さくら」をN700系8両編成として掲載している。公式外観画像では、白から淡銀色の長いN700ノーズ、上部の濃黒色運転室窓、側面の濃青帯と細い金色帯を目視確認した。

- [JR西日本公式「山陽・九州新幹線 みずほ・さくら」](https://www.jr-odekake.net/shinkansen/mizuho/)
- [公式車両イメージ train_image.png](https://www.jr-odekake.net/railroad/shinkansen/assets/img/mizuho/train_image.png)
- [公式外観写真 design_photo1.jpg](https://www.jr-odekake.net/railroad/shinkansen/assets/img/mizuho/design_photo1.jpg)

### 生成プロンプト

```text
Use case: illustration-story
Asset type: a wide horizontal children's train learning card for a Japanese hiragana train app.
Primary request: create one new original watercolor picture-book illustration of the real N700-7000 series Shinkansen used for the limited express Mizuho (みずほ). The train must be immediately recognizable as the Sanyo-Kyushu Shinkansen N700, with accurate real-world exterior design and colors.
Scene/backdrop: a distinctive Kyushu landscape on the Mizuho route, with lush green countryside, rice fields, a distant volcanic mountain and warm southern light, a small river or bridge, and an original composition that feels like Kyushu rather than a generic city.
Subject: an N700-7000 8-car Mizuho train in a front three-quarter view, long smooth aerodynamic white and very pale silver nose tapering forward, a dark charcoal cockpit windshield high on the nose, small slim headlights, white body, a narrow dark blue belt along the side window line with a thin gold-yellow accent line below it, dark roof equipment and underframe, realistic N700 proportions. Keep the long rounded N700 nose and the subtle white-blue-gold Mizuho livery faithful to the official reference.
Style/medium: the existing project style, friendly children's animation with a soft Japanese watercolor picture-book finish, clean outlines, warm hand-painted paper texture, readable train silhouette.
Composition/framing: wide horizontal 16:9 composition; the train is dominant and runs diagonally across the scene on a gentle curve, with the nose on the right and the Kyushu mountain landscape clearly visible behind it; leave breathing room around the train.
Lighting/mood: clear sunny morning, gentle warm light, cheerful and calm.
Color palette: white and pale silver train, dark charcoal windshield, dark blue and thin gold accent line, Kyushu greens, blue sky and soft volcanic mountain tones.
Constraints: exactly two small animals, a tanuki and a small white heron, standing safely beside the distant track or riverbank; animals are secondary and must not be painted on the train. Preserve the real N700-7000 exterior and livery. No need for readable lettering.
Avoid: red or green train body; colored nose mask; Hayabusa or Komachi design; E353 purple-blue front; 700-series flat nose; generic bullet train with a short nose; extra locomotives; duplicated train fronts; station signs with text; watermark; collage; photorealism.
```

### 保存先と確認結果

- `assets/trains/mizuho-original.png`
- `assets/trains/mizuho-original.webp`
- 九州の田園、川、火山を使った独自構図。列車は白淡銀色の長いN700ノーズ、濃黒の運転室窓、濃青と細い金帯を保持している。
- 動物はタヌキと白鷺の2匹。赤い車体やE353系の紫前面は入っていない。

## 親統合用メモ

画像ファイルのみを追加した。`src/data.js`、`src/reward.js`、既存の `azusa` / `sakura` 画像、共通ドキュメント、gitには変更を加えていない。`meitetsu-v2` と `red-arrow-v2` の生成記録は [design-fix-c.md](design-fix-c.md) に記載する。
