# expansion-new-trains-d 生成記録

作成日: 2026-09-13
生成方式: 組み込み `image_gen`（新規生成、1資産につき1回、計6回）
画風参照: 既存 `assets/trains/azusa.png`、`assets/trains/sakura.png`、`assets/trains/keikyu.png`、`assets/trains/e8_tsubasa.png` を `view_image` で確認。手描きアニメ水彩絵本調、横長構図、細いインク輪郭、紙の質感、列車を主役、動物は1～2匹という基準を使用した。既存画像は編集していない。

## 公式参照と照合メモ

公式ページ、公式写真または公式資料を確認し、車両形式・主要な前面形状・塗装・給電方式をプロンプトへ反映した。公式画像そのものは生成入力やコラージュには使用していない。

1. **相鉄20000系**
   - [相鉄 電車車両図鑑](https://www.sotetsu.co.jp/life/gallery/train/)
   - [相鉄20000系 公式写真](https://cdn.sotetsu.co.jp/assets/2/img/fan/gallery/train/series_20000%401100w.jpg)
   - 20000系、10両編成、東急東横線直通用。濃い「YOKOHAMA NAVYBLUE」の車体、中央貫通扉を持つ広い前面、黒い前面ガラスを基準にした。

2. **JR東日本 南武線E233系8000番台**
   - [JR東日本 南武線E233系車両導入完了 公式資料（PDF）](https://www.jreast.co.jp/press/2016/yokohama/20170126_y02.pdf)
   - [JR東日本 E233系公式ページ](https://www.jreast.co.jp/train/local/e233.html)
   - 公式資料の写真と説明から、南武線用のE233系6両編成、銀色の通勤形前面、黄色・オレンジ・茶系の側面帯を基準にした。

3. **近鉄80000系ひのとり**
   - [近畿日本鉄道 新型名阪特急「ひのとり」の概要（PDF）](https://www.kintetsu.co.jp/all_news/news_info/sinmeihan.pdf)
   - [近鉄 きんてつ旅育ポータル（80000系ひのとり）](https://www.kintetsu.co.jp/gyoumu/tabiiku/)
   - 80000系、6両または8両編成。深い艶感のあるメタリックレッド、黒い前面マスク、大型の前面ガラス、流線形の特急車体を基準にした。

4. **Osaka Metro 御堂筋線30000系**
   - [Osaka Metro 御堂筋線30000系 車両撮影会公式案内](https://subway.osakametro.co.jp/news/news_release/20240408_satsueikai_nakamozukensha.php)
   - [Osaka Metro 御堂筋線・中央線の電力方式に関する公式案内](https://subway-tr.osakametro.co.jp/news/news_release/20250625_midosuji_chuo_co2.php)
   - [Osaka Metro 御堂筋線30000系 公式ぬりえコーナー](https://subway.osakametro.co.jp/news/news/other/20200410nurie_corner.php)
   - 銀色主体の30000系、赤い御堂筋線帯、黒い広い前面窓を基準にした。第三軌条給電のため、画像にはパンタグラフ・架線・架線柱を入れず、低い側方集電レールだけを許可した。

5. **JR東日本 E5系やまびこ**
   - [JR東日本 E5系 はやぶさ／はやて／やまびこ／なすの公式ページ](https://www.jreast.co.jp/train/shinkan/e5.html)
   - [JR東日本 E5系公式写真](https://www.jreast.co.jp/train/shinkan/img/e5_img01.jpg)
   - E5系10両編成、ロングノーズ、濃いときわグリーンの上部、飛雲ホワイトの下部、その境界の細いつつじピンク帯を基準にした。

6. **ゆりかもめ7300系**
   - [ゆりかもめ7300系（7次）公式ページ](https://www.yurikamome.co.jp/feature/vehicle/seventh.html)
   - [ゆりかもめ7300系 公式外観写真](https://www.yurikamome.co.jp/assets/img/feature_vehicle_detail/img-feature_vehicle_detail07-02%402x.jpg)
   - [ゆりかもめ公式FAQ（ゴムタイヤ式新交通システム）](https://form.yurikamome.co.jp/help/qa.html)
   - 白銀の無塗装アルミ車体、大きな曲面前面ガラス、青～紫の外装アクセント、6両編成、ゴムタイヤ、高架の専用ガイドウェイを基準にした。通常の鉄道レール・架線・パンタグラフは入れていない。

## 生成プロンプト

### extra-sotetsu

```text
Use case: illustration-story
Asset type: wide horizontal Japanese train hiragana quiz card
Primary request: Create one brand-new landscape illustration of the real Sotetsu 20000 series commuter train. Make the train immediately recognizable and faithful to the actual vehicle.
Scene/backdrop: A bright, calm Yokohama suburban railway scene with a gentle elevated or ground-level railway, soft blue sky, distant low green hills, a few quiet homes and trees. The train is the clear main subject.
Subject: One complete connected Sotetsu 20000 series 10-car commuter train, shown in a readable front three-quarter view moving through the scene. Preserve the modern commuter proportions, flat broad cab with a central gangway door, dark windshield, clean rectangular side windows and doors, rooftop electrical equipment and a realistic pantograph consistent with an overhead electric Japanese commuter train.
Style/medium: Match the existing assets/trains styleview: friendly Japanese animation with a soft hand-painted watercolor picture-book finish, fine ink contours, warm paper grain, translucent washes, gentle highlights, accurate readable train silhouette, child-friendly but not toy-like.
Composition/framing: Wide horizontal 3:2 composition. Keep the entire visible train inside the frame with comfortable margins; train large and dominant, background secondary. Natural perspective and a little motion implied by the scene.
Lighting/mood: Clear late-morning light, peaceful and welcoming.
Color palette: The train exterior must be overwhelmingly deep navy blue, specifically the Sotetsu YOKOHAMA NAVYBLUE look, with dark charcoal front glazing, subtle silver-gray roof and lower equipment details, and restrained black window/underframe details. Do not introduce bright red, orange, green, yellow, purple, or white body stripes.
Materials/textures: Slight metallic sheen on the navy body, watercolor paper texture, softly detailed windows and underframe.
Text (verbatim): none.
Constraints: Exactly one train formation; about two tiny cute animals total, such as a rabbit and a small cat, secondary to the train and safely beside the track or visible as tiny passengers through windows. No logos, no route names, no station signs, no lettering, no watermark.
Avoid: extra trains, duplicated fronts, fantasy locomotive, bullet-train nose, wrong bright livery, large animals, excessive animals, cropped cars or nose, collage, photorealism, readable text, invented lettering.
```

保存先:

- PNG原本: `assets/trains/extra-sotetsu.png`
- WebP quality=88: `assets/trains/extra-sotetsu.webp`

### extra-nanbu

```text
Use case: illustration-story
Asset type: wide horizontal Japanese train hiragana quiz card
Primary request: Create one brand-new landscape illustration of the real JR East Nambu Line E233-8000 series commuter train. Make the train immediately recognizable and faithful to the actual vehicle.
Scene/backdrop: A bright suburban Tama River / Kawasaki to Tachikawa railway landscape with green riverbank, low city neighborhoods, a few trees and distant hills, overhead railway catenary. The train is the clear main subject.
Subject: One complete connected 6-car Nambu Line E233-8000 commuter train in a front three-quarter view, moving through the scene. Preserve the boxy modern E233 commuter silhouette, broad dark front windshield, flat cab face, rectangular side windows, four-door commuter layout, rooftop HVAC and realistic pantograph/electrical equipment for an overhead electric train.
Style/medium: Match the existing assets/trains styleview: friendly Japanese animation with a soft hand-painted watercolor picture-book finish, fine ink contours, warm paper grain, translucent washes, gentle highlights, accurate readable train silhouette, child-friendly but not toy-like.
Composition/framing: Wide horizontal 3:2 composition. Keep the entire 6-car train inside the frame with comfortable margins; train large and dominant, background secondary. Natural perspective.
Lighting/mood: Clear gentle daytime light, cheerful and calm.
Color palette: Stainless silver and cool gray body. The Nambu Line livery must be clearly readable as three clean horizontal side bands in yellow, warm orange, and dark brown, with the same yellow-orange-brown family carried onto the lower front accents. Keep the dark front windshield black charcoal; do not add blue, red, green, purple, or pink train paint.
Materials/textures: Soft brushed stainless-steel sheen, watercolor paper texture, delicate reflections in windows, lightly detailed underframe.
Text (verbatim): none.
Constraints: Exactly one train formation; only 1-2 tiny cute animals total, such as a rabbit and a small sparrow, secondary to the train and safely beside the track or as tiny passengers through windows. No logos, no route names, no station signs, no lettering, no watermark.
Avoid: extra trains, duplicated fronts, Shinkansen nose, wrong livery, blue or red bands, large animals, excessive animals, cropped nose or cars, collage, photorealism, readable text, invented lettering.
```

保存先:

- PNG原本: `assets/trains/extra-nanbu.png`
- WebP quality=88: `assets/trains/extra-nanbu.webp`

### extra-hinotori

```text
Use case: illustration-story
Asset type: wide horizontal Japanese train hiragana quiz card
Primary request: Create one brand-new landscape illustration of the real Kintetsu 80000 series premium limited express Hinotori. Make the train immediately recognizable and faithful to the actual vehicle.
Scene/backdrop: A scenic Kintetsu railway journey through the wooded mountains between Osaka and Nara, with layered green hills, a small river valley, a few quiet trees and a clear sky. The train is the clear main subject. Overhead railway catenary is present.
Subject: One complete connected 6-car Kintetsu 80000 series Hinotori formation, shown in a readable front three-quarter view moving toward the right. Preserve the actual sleek high-speed limited-express silhouette: a long gently pointed aerodynamic nose, large dark black charcoal cockpit windshield forming a strong front mask, smooth rounded sides, tall passenger windows, modern premium express proportions, rooftop HVAC and a realistic pantograph/electrical equipment on the appropriate intermediate car.
Style/medium: Match the existing assets/trains styleview: friendly Japanese animation with a soft hand-painted watercolor picture-book finish, fine ink contours, warm paper grain, translucent washes, gentle highlights, accurate readable train silhouette, child-friendly but not toy-like.
Composition/framing: Wide horizontal 3:2 composition. Keep the whole 6-car train inside the frame with comfortable margins; train large and dominant, background secondary. Natural perspective with the nose on the right and the consist receding left.
Lighting/mood: Warm clear afternoon light, elegant but welcoming.
Color palette: The train body must be dominated by the distinctive deep glossy metallic red of Hinotori. Use a bold black/dark charcoal front windshield and front mask, with black window glass and dark underframe/roof equipment. Keep any lower trim restrained dark red or black. Do not introduce blue, green, yellow, orange, purple, or a broad white body stripe.
Materials/textures: Rich metallic red sheen rendered as watercolor, dark glass reflections, fine ink linework, softly painted paper texture, lightly detailed bogies.
Text (verbatim): none.
Constraints: Exactly one train formation; only 1-2 tiny cute animals total, such as a fox and a small bird, secondary to the train and safely beside the track or tiny passengers through windows. No logo, no Hinotori mark, no route name, no station sign, no lettering, no watermark.
Avoid: extra trains, duplicated fronts, generic red commuter train, Shinkansen nose, wrong livery, bright multicolor stripes, large animals, excessive animals, cropped nose or cars, collage, photorealism, readable text, invented lettering.
```

保存先:

- PNG原本: `assets/trains/extra-hinotori.png`
- WebP quality=88: `assets/trains/extra-hinotori.webp`

### extra-midosuji

```text
Use case: illustration-story
Asset type: wide horizontal Japanese train hiragana quiz card
Primary request: Create one brand-new landscape illustration of the real Osaka Metro Midosuji Line 30000 series subway train. Make the train immediately recognizable and faithful to the actual vehicle.
Scene/backdrop: A bright Osaka urban railway scene on an open elevated section beside a river and city park, with low and medium city buildings, trees, blue sky, and a clean elevated concrete railway structure. The train is the clear main subject.
Subject: One complete connected 10-car Osaka Metro Midosuji Line 30000 series formation, shown in a readable front three-quarter view moving toward the right. Preserve the actual modern subway commuter profile: broad rounded cab, large dark charcoal front windshield, silver stainless-steel body, rectangular side windows and doors, rounded lower front, compact subway proportions, roof equipment appropriate for a third-rail subway.
Style/medium: Match the existing assets/trains styleview: friendly Japanese animation with a soft hand-painted watercolor picture-book finish, fine ink contours, warm paper grain, translucent washes, gentle highlights, accurate readable train silhouette, child-friendly but not toy-like.
Composition/framing: Wide horizontal 3:2 composition. Keep the entire 10-car train inside the frame with comfortable margins; train large and dominant, background secondary. Natural perspective, nose on the right, consist receding left.
Lighting/mood: Clear warm daytime light, lively but calm city atmosphere.
Color palette: Silver and light gray stainless-steel body, with the characteristic strong vermilion-red / red-orange Midosuji Line belt and red front-side accents. Keep the windshield and window glass dark charcoal, with restrained dark underframe and silver roof. Do not add blue, green, yellow, purple, or pink body paint.
Power and infrastructure constraints: This is a third-rail powered subway train. Absolutely no pantograph anywhere, no catenary, no overhead wires, no poles carrying electrical wires. Show only a low side conductor rail / third rail beside the running rail if electrical details are visible. The train must have no roof-mounted pantograph.
Materials/textures: Gentle metallic silver reflections, clean red band, watercolor paper texture, softly detailed bogies and concrete guideway.
Text (verbatim): none.
Constraints: Exactly one train formation; only 1-2 tiny cute animals total, such as a cat and a sparrow, secondary to the train and safely on a park path or as tiny passengers through windows. No logos, no route names, no station signs, no lettering, no watermark.
Avoid: any pantograph, overhead catenary, overhead wires, extra trains, duplicated fronts, Shinkansen nose, wrong livery, blue or green bands, large animals, excessive animals, cropped cars or nose, collage, photorealism, readable text, invented lettering.
```

保存先:

- PNG原本: `assets/trains/extra-midosuji.png`
- WebP quality=88: `assets/trains/extra-midosuji.webp`

### extra-yamabiko

```text
Use case: illustration-story
Asset type: wide horizontal Japanese train hiragana quiz card
Primary request: Create one brand-new landscape illustration of the real JR East E5 series Shinkansen operating as Yamabiko. Make the train immediately recognizable and faithful to the actual vehicle.
Scene/backdrop: A bright Tohoku countryside scene with wide green rice fields, distant forested hills, a few small rural homes, and overhead Shinkansen catenary. The train is the clear main subject.
Subject: One complete connected E5 series 10-car Shinkansen Yamabiko formation, shown in a readable front three-quarter view moving toward the right. Preserve the unmistakable very long smooth aerodynamic nose, low rounded cab, dark charcoal windshield, long sleek Shinkansen body, repeated small side windows, covered bogies, roof equipment and a realistic low-noise pantograph on an intermediate car.
Style/medium: Match the existing assets/trains styleview: friendly Japanese animation with a soft hand-painted watercolor picture-book finish, fine ink contours, warm paper grain, translucent washes, gentle highlights, accurate readable train silhouette, child-friendly but not toy-like.
Composition/framing: Wide horizontal 3:2 composition. Keep the entire 10-car train inside the frame with comfortable margins; train large and dominant, background secondary. Natural perspective, nose on the right and consist receding left.
Lighting/mood: Fresh clear spring or early-summer daylight, gentle and inviting.
Color palette: Faithful E5 exterior: vivid deep TokiwA green upper body, clean pale Fly Cloud white lower body, and one thin continuous bright Tsutsuji pink stripe exactly at the green-white boundary. Keep windows and windshield dark charcoal and equipment dark gray. The pink stripe must remain thin and crisp; do not add blue, purple, red, orange, yellow, or gold exterior stripes.
Materials/textures: Smooth aerodynamic painted surfaces with subtle watercolor highlights, dark glass reflections, watercolor paper grain, lightly detailed covered underbody.
Text (verbatim): none.
Constraints: Exactly one train formation; only 1-2 tiny cute animals total, such as a rabbit and a small bear, secondary to the train and safely beside the distant field or as tiny passengers through windows. No logos, no route names, no station signs, no lettering, no watermark.
Avoid: short nose, flat commuter front, extra trains, duplicated fronts, blue-dominant or mixed livery, broad or wavy pink band, large animals, excessive animals, cropped nose or cars, collage, photorealism, readable text, invented lettering.
```

保存先:

- PNG原本: `assets/trains/extra-yamabiko.png`
- WebP quality=88: `assets/trains/extra-yamabiko.webp`

### extra-yurikamome

```text
Use case: illustration-story
Asset type: wide horizontal Japanese train hiragana quiz card
Primary request: Create one brand-new landscape illustration of the real Yurikamome 7300 series automated guideway transit train. Make the vehicle immediately recognizable and faithful to the actual 7300 series.
Scene/backdrop: A bright Tokyo Bay waterfront scene with a clean elevated concrete guideway, blue water, green waterfront trees, modern skyline and a distant suspension bridge. The train is the clear main subject.
Subject: One complete connected 6-car Yurikamome 7300 series formation, shown in a readable front three-quarter view moving toward the right. Preserve the distinctive compact automated transit profile: very large curved panoramic front glass extending low toward the foot level, rounded modern nose, small white LED marker lights, broad white/silver aluminum body, repeated side windows, double-opening doors and compact six-car proportions. Show believable underbody guide wheels and rubber tires riding on the guideway.
Style/medium: Match the existing assets/trains styleview: friendly Japanese animation with a soft hand-painted watercolor picture-book finish, fine ink contours, warm paper grain, translucent washes, gentle highlights, accurate readable vehicle silhouette, child-friendly but not toy-like.
Composition/framing: Wide horizontal 3:2 composition. Keep the entire 6-car train inside the frame with comfortable margins; train large and dominant, background secondary. Natural perspective, nose on the right and consist receding left.
Lighting/mood: Clear fresh seaside daytime light, airy and optimistic.
Color palette: The exterior must be predominantly bright white and brushed silver aluminum. Add restrained cool blue and violet-purple exterior side accents/stripe panels, clearly visible but secondary to the white-silver body. Keep the large front glass dark blue-charcoal. Avoid a red, orange, yellow, or green train body and avoid rainbow multicolor wrapping.
Power and infrastructure constraints: This is an automated rubber-tired guideway train. Absolutely no pantograph, no overhead catenary, no overhead wires, no railway poles with wires, and no conventional steel rails. Show only the elevated concrete guideway with rubber-tire running surfaces and side guide rails.
Materials/textures: Hairline-finished aluminum shimmer, dark glass reflections, watercolor paper grain, softly detailed rubber tires, guide wheels and concrete guideway.
Text (verbatim): none.
Constraints: Exactly one train formation; only 1-2 tiny cute animals total, such as a small seagull and a cat, secondary to the train and safely on a waterfront path or tiny passengers through windows. No logo, no route name, no station sign, no lettering, no watermark.
Avoid: pantograph, catenary, overhead wires, conventional steel rails, extra trains, duplicated fronts, generic subway with railway bogies, wrong livery, rainbow-colored train, large animals, excessive animals, cropped cars or nose, collage, photorealism, readable text, invented lettering.
```

保存先:

- PNG原本: `assets/trains/extra-yurikamome.png`
- WebP quality=88: `assets/trains/extra-yurikamome.webp`

## 目視確認

保存後に6枚のPNGと6枚のWebPを `view_image` で確認した。

- `extra-sotetsu`: 深い濃紺、中央貫通扉の前面、架線・パンタグラフ、全編成、うさぎと猫を確認。
- `extra-nanbu`: 銀色のE233系前面、黄色・オレンジ・茶の3本帯、架線・パンタグラフ、全6両、スズメ1羽を確認。
- `extra-hinotori`: 艶のある赤い80000系、黒い大型前面窓、架線・パンタグラフ、全6両、青い鳥1羽を確認。
- `extra-midosuji`: 銀色＋赤帯、黒い前面窓、10両、第三軌条の高架構造、パンタグラフ・架線なし、猫と鳥を確認。
- `extra-yamabiko`: E5系の長い鼻、緑上部・白下部・細いピンク帯、架線・パンタグラフ、全編成、うさぎ1匹を確認。
- `extra-yurikamome`: 白銀アルミ、青紫アクセント、大きな前面ガラス、ゴムタイヤと高架ガイドウェイ、架線・パンタグラフ・通常レールなし、カモメ1羽を確認。

全画像に文字・ロゴ・透かしは見当たらず、横長の水彩絵本調として保存した。
