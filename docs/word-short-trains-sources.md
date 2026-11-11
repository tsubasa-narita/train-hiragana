# 「ことばを よもう」用の短い名前の列車追加

2026-11-11。既存の「とき」「ひだ」に2文字4種を追加。各画像は1列車の独立イラスト、1536×1024、WebP。built-in imagegenで生成。画像は `assets/trains/word-{aso,yufu,noto,hana}.webp`。

## 裏取り

- あそ：JR九州キハ185系。赤いAROUND THE KYUSHU塗装、中央貫通扉、窓上の前照灯、銀色屋根。2020〜2025年の熊本〜宮地の特急を描写。
  - https://www.jrkyushu.co.jp/news/__icsFiles/afieldfile/2022/01/25/220125_185kei_hitahiko_miryokuhakken.pdf （車両写真・塗色・区間）
  - https://www.jrkyushu.co.jp/byarea/kumamoto/info/__icsFiles/afieldfile/2024/12/16/20241213kumamoto_1.pdf （2025年運転取り止め）
- ゆふ：同じキハ185系だが阿蘇とは別の新規画像。由布岳・久大本線の風景。博多〜由布院〜大分・別府。
  - 上記JR九州車両説明PDF
  - https://www.jrkyushu-timetable.jp/sp/2610/0013/00132801.html?d=20261019&t=2874200e （博多・別府、検索時点の時刻表）
- のと：JR西日本489系のボンネット形、クリーム＋赤の国鉄特急色。上野〜金沢の夜行急行。引退車両であることを説明。
  - https://www.katomodels.com/product/n/489kei_noto （車両構成と形状、国鉄色）
  - https://www.toretabi.jp/railway_info/entry-8243.html （交通新聞社、運行区間・夜行列車）
  - https://www.westjr.co.jp/press/article/items/250731_00_press_hokurikupins.pdf （JR西日本489系ボンネット急行能登）
- はな：485系お座敷列車「華」、濃い紫の車体、大きな前面窓、前面まで連続する細いピンク帯。2022年引退。定期区間がある列車とは説明せず、団体・臨時列車とする。
  - https://media.jreast.co.jp/articles/155 （JR東日本公式解説と実車写真）
  - https://www.jreast.co.jp/hachioji/info/20140124/20140124_info_01.pdf （川崎〜甲府の臨時列車使用）

## 視覚確認と修正

華の初回画像は、車体上半分が明るいピンク色、前面帯が途切れ、スカートが銀色になっていた。公式記事の前面写真 `retina_DSC_5639_2.webp` と照合し、濃い紫の車体・スカート、連続するピンク帯、窓上の小灯に修正生成した画像を採用。写真そのものはアプリに配布しない。人物の代わりに小さな動物が窓から見える絵本調の表現で、厳密な製図ではない。

## 生成プロンプト

### Aso

Use case: illustration-story. Asset: landscape 1536x1024 Japanese train hiragana quiz card. Draw ONE JR Kyushu KiHa185 diesel limited express ASO あそ, historically on Kumamoto to Miyaji, at Aso caldera grassy mountains and wildflowers, three-quarter view heading front-right with 3 connected cars trailing left. Accurate actual late-period all-vivid-red AROUND THE KYUSHU livery, boxy/slightly angled flat cab front with prominent CENTRAL narrow gangway door, two rectangular cab windows flanking it, two paired white rectangular headlights positioned at top corners above cab windows, black rubber framing, silver-gray roof and dark undercarriage. Flat blunt diesel express front, NOT aerodynamic shinkansen, NO pantograph, NO green or cream body bands. Small dark centered headmark can be blank; no readable text needed. Gentle polished anime watercolor and fine linework, rich sunlight and blue sky, two tiny friendly bunny and bear passengers seen behind SIDE passenger windows. Realistic train geometry, no face on train, no extra train. Train fills 70 percent frame while entire cab and wheels remain visible. Opaque scenic background. No captions, collage, border or watermark.

### Yufu

Use case: illustration-story. Create a landscape 1536x1024 polished anime-watercolor children's train quiz illustration, ONE actual JR Kyushu KiHa185 limited express YUFU, red AROUND THE KYUSHU livery. Three-quarter front-left view (nose lower-left, three connected cars trail toward right) traveling by the green Kyudai Main Line with Mount Yufu's twin summit, a small river and early-summer hydrangeas. Accurate real KiHa185: blunt angular cab, narrow central gangway door, TWO large cab windows one either side of door, twin rectangular lamp pairs high above windows, full vivid-red side/body, gray metal roof and roof equipment, dark underframe. NOT shinkansen, no pantograph, no green/cream stripe. Black cab-door rubber surround and black lamp surrounds. Two tiny cute bear and bunny passengers inside side windows, no faces painted on train. Refined watercolor scenery, warm light, train large 70 percent frame, cab not cropped, wheels visible, no other trains, no captions/border/watermark, no legible text required.

### Noto

Use case: illustration-story. Landscape 1536x1024 watercolor anime train quiz art, actual retired Japanese overnight express NOTO using JNR 489 series BONNET cab, as operated by JR West 1993-2010 Ueno-Kanazawa. Paint correct JNR limited express cream with broad dark red window band and red horizontal lower nose band, medium-long rounded projecting BONNET nose BELOW a raised tall separate cab windshield, centered raised round headlight above windshield, split front windows, low pair of lamps on protruding bonnet, central rectangular headmark on front bonnet, dark gray skirt and detailed wheels; roof pantographs on following cars under overhead wires. This is old 489 bonnet electric train, NOT bullet train, NOT streamlined duck nose, NOT flat front. Three-quarter front-right view curving through Japanese Hokuriku rice fields with distant sea and pastel early dawn, three connected cars receding left. Small friendly fox and bunny behind side passenger windows. Soft beautifully painted anime watercolor detail, real train proportions, no humanlike train face, no extra train, no captions, no collage, no watermark. Train fills 70 percent composition, entire front visible.

### Hana

Use case: illustration-story. Landscape 1536x1024 beautiful refined anime watercolor train quiz image of ONE real JR East 485 series joyful excursion train HANA 華, retired 2022. Accurate 1997 redesigned Hana cab: rounded almost flat upper cab black windshield band, large single broad curved front observation glass on upper half, narrow short sloping nose with two pairs of small lights embedded in lower corners, smooth deep violet-purple body, muted mauve lavender pink upper side accents, narrow pink/magenta horizontal stripe along side just below passenger windows, gray roof, silver gray skirt and dark bogies. NOT JNR cream/red 485 original, no tall bullet nose, no gold train, no green stripe. Use historic actual appearance as seen in JR East JRE Media article 155 official Hana photo: purple body with thin bright pink stripe and dark rectangular passenger windows. Three-quarter front-right view on catenary railway in Yamanashi spring peach blossoms, snowy distant Yatsugatake mountains, serene clear sky, several connected purple cars recede left. Two tiny bunny/bear seen behind SIDE windows only. Train occupies 70 percent frame, cab and wheels entirely visible. No text, extra trains, border, collage or watermark.

### HanaCorrection

Edit target Image 1 (anime watercolor Hana train). Image 2 is an official JR East real front-view reference for design accuracy ONLY. Preserve Image1's watercolor anime style, peach blossom scenery, animal passengers, train position, perspective and landscape format. Correct the train to exactly match real 485 Hana identity from Image2: almost entire body DEEP DARK PLUM PURPLE, not large pale pink/lavender upper side panels. A thin bright PINK stripe runs below side passenger windows and wraps CONTINUOUSLY straight across FRONT just under black windshield. Front windshield is huge almost rectangular rounded corner, dark black frame, front is broad quite flat; add the tiny paired rectangular marker lights centered ABOVE windshield near roofline. Main lamps are two horizontal oval black housings below the pink band each containing a round lamp pair, lamps not four glowing eyes. Lower skirt is DARK PURPLE too, NOT light silver. Exposed centered coupler in a dark square recess on purple front. Gray roof. Copy these livery/cab features from reference without copying photographic medium. No captions or text, no other changes. Accurate real Hana train, no invented painted graphics.
