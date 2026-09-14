# Expansion variants B

作成日: 2026-09-14

担当Bの10種類を、built-in `image_gen` のみで1 asset / 1 call、順番どおりに生成した。既存の車両画像は `src/data.js` の `image` 指定を確認し、車体・窓・前面形状・帯色・屋根機器を固定する参照画像として使用した。生成後は各PNGを `view_image` で原寸目視確認し、PNGを原本として保存、同じ原本をPillowでWebP quality=88へ変換した。コード変更は行っていない。

共通仕様: 横長16:9、アニメ水彩絵本、風景と季節を元画像から明確に変更、外部の小動物を1匹、安全な位置に配置、追加の列車・読める文字・ロゴ・透かしは入れない。

## 生成記録

### 1. inaho

- `src/data.js`: `id: 'inaho'`, `image: 'inaho.webp'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\inaho.webp`（生成時は同じ既存絵のPNG版 `inaho.png` を参照）
- プロンプト記録: 秋の海岸高架を走る同じいなほ。長い白い流線形電車、濃紺の下部、琥珀色/金色と青色の波形帯、暗い大きな前面窓、パンタグラフ、窓・扉・台車を参照画像どおりに固定。夕方の海、漁村、紅葉を新規構図にし、線路から離れたキツネを1匹。車体の帯色・位置、鼻形状、電装品を変えない。
- 目視QA: 白/濃紺/琥珀・青の帯、流線形前面、パンタグラフを確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-inaho.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-inaho.webp`

### 2. ueno-tokyo

- `src/data.js`: `id: 'ueno-tokyo'`, `image: 'ueno-tokyo-story.webp'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\ueno-tokyo-story.webp`（生成時は同じ既存絵のPNG版 `ueno-tokyo-story.png` を参照）
- プロンプト記録: 雪の都市河川高架を走る同じ上野東京ライン。銀/クリーム色の箱型通勤電車、平たい暗色前面窓、反復する扉と窓、屋根機器とパンタグラフ、側面と前面のオレンジ帯の下に緑帯、という livery を固定。雪の川、橋、低い都市景観を新規構図にし、河岸にリスを1匹。帯の順番・色、車体形状、窓・扉を変えない。
- 目視QA: 銀色箱型車体、オレンジ→緑帯、パンタグラフ、雪景色を確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-ueno-tokyo.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-ueno-tokyo.webp`

### 3. enoden

- `src/data.js`: `id: 'enoden'`, `image: 'enoden.png'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\enoden.png`
- プロンプト記録: 秋の寺町を石橋で渡る同じ江ノ電。短い2両編成、丸みのある箱型前面、緑の車体とクリームの窓帯/前面、同じ窓・扉・台車、屋根機器とパンタグラフを固定。海辺の市場から離れ、渓流・苔むした石・紅葉の構図にし、川岸に三毛猫を1匹。現代的な流線形車両へ変更しない。
- 目視QA: 2両編成、緑/クリーム塗装、前面形状、パンタグラフを確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-enoden.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-enoden.webp`

### 4. kuroshio

- `src/data.js`: `id: 'kuroshio'`, `image: 'kuroshio.webp'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\kuroshio.webp`
- プロンプト記録: 秋の和歌山の茶畑と渓流橋を走る同じパンダくろしお。白い流線形車体、黒いパンダ顔の目 patch と耳、白い頬、淡い水色の側帯と多色の細帯、窓・扉・台車・パンタグラフを固定。海辺の遊園地から離れ、茶畑の谷と柿の木の構図にし、川岸にタヌキを1匹。パンダ顔を普通の白い列車にしない。
- 目視QA: 白い流線形、黒いパンダ顔、淡い水色/多色帯、パンタグラフを確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-kuroshio.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-kuroshio.webp`

### 5. tanigawa

- `src/data.js`: `id: 'tanigawa'`, `image: 'tanigawa-original.webp'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\tanigawa-original.webp`（生成時は同じ既存絵のPNG版 `tanigawa-original.png` を参照）
- プロンプト記録: 初夏の緑の山峡でトンネルへ入る同じ谷川新幹線。長い白い車体、鋭く長い鼻、鮮やかなロイヤルブルーの屋根と鼻先、細い銅/オレンジ線と青線、窓・扉・連結車・台車・屋根機器を固定。雪の橋から離れ、滝・渓流・苔の構図にし、川辺に山ウサギを1匹。鼻形状と帯位置を変えない。
- 目視QA: 白い長編成、青い鼻/屋根、銅色と青の細帯、鋭い鼻を確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-tanigawa.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-tanigawa.webp`

### 6. tenhama

- `src/data.js`: `id: 'tenhama'`, `image: 'tenhama.webp'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\tenhama.webp`
- プロンプト記録: 秋の浜名湖畔を走る同じ天浜線。1両の非電化ディーゼル車、短い箱型車体、平たい運転台、中央の端部扉、同じ窓・扉・台車、パンタグラフと架線なし。クリーム車体、オレンジ帯の下に緑帯、下部端の小さな青ブロックを厳密維持。春の山里から離れ、ススキ・湖・木造無人ホームの構図にし、遠い草地にシカを1匹。
- 目視QA: 単車、オレンジ→緑帯、青ブロック、非電化設備を確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-tenhama.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-tenhama.webp`

### 7. nichirin

- `src/data.js`: `id: 'nichirin'`, `image: 'nichirin.webp'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\nichirin.webp`
- プロンプト記録: 秋の九州の稲田と火山を走る同じにちりん。濃いチャコール灰色の流線形車体、暗い窓、長い連結編成、細い赤帯と細い金/銅アクセント、扉・台車・屋根機器・パンタグラフ・架線を固定。南国の海辺から離れ、稲田・ススキ・火山の構図にし、遠い田にキツネを1匹。明るい青や白の車体へ変更しない。
- 目視QA: 濃灰色車体、細い赤/金帯、流線形前面、パンタグラフを確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-nichirin.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-nichirin.webp`

### 8. numajiri

- `src/data.js`: `id: 'numajiri'`, `image: 'numajiri.webp'`, `historical: true`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\numajiri.webp`
- プロンプト記録: 雪解けの山間鉱山谷を木橋で渡る同じ沼尻軽便鉄道。昔のDC12系を思わせる小型の濃緑黒色ディーゼル機関車、縦グリル、中央の円形ヘッドライト、リベット、背の低い運転台、短いボンネット、機械式ロッドとバッファを固定し、茶色の木造客車1両（クリーム色の窓帯、アーチ屋根）だけを牽引。現代ディーゼル車・電車・高速車へ変更しない。渓流、霧、木造鉱山小屋、残雪の構図にし、川岸に茶色のウサギを1匹。
- 目視QA: 古いDC12系風の小型機関車、円形灯、縦グリル、ロッド、木造客車1両、非電化を確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-numajiri.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-numajiri.webp`

### 9. nemuro

- `src/data.js`: `id: 'nemuro'`, `image: 'nemuro.webp'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\nemuro.webp`
- プロンプト記録: 厳冬の北海道湿原を日の出に走る同じ根室本線。1両の銀/白色箱型ディーゼル車、濃紺の前面窓、平たい前面と中央端部扉、同じ窓・扉・台車・屋根機器、広い淡緑色の横帯、パンタグラフと架線なしを固定。夏の草原から離れ、凍った池、雪原、低い丘、朝焼けの構図にし、湿原の端に赤ギツネを1匹。
- 目視QA: 単車、濃紺前面窓、淡緑帯、非電化設備、冬の湿原を確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-nemuro.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-nemuro.webp`

### 10. nozomi

- `src/data.js`: `id: 'nozomi'`, `image: 'n700s_nozomi.png'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\n700s_nozomi.png`
- プロンプト記録: 秋の夕暮れ、瀬戸内海の長い高架橋を走る同じN700Sのぞみ。長く滑らかな白い車体、鋭い流線形の鼻、濃紺の前面窓、連続する濃青の窓帯、同じ位置の細い青い下部帯、扉・窓・連結車・台車・屋根機器を固定。富士山・東京名所・屋台から離れ、島々、海、夕焼け、海辺の町の構図にし、遠い土手にタヌキを1匹。
- 目視QA: 白いN700S形状、鋭い鼻、濃青窓帯と青い下部帯、長編成を確認。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-nozomi.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-nozomi.webp`

## 形式検証

- 10 idすべてについて `.png` と `.webp` の2形式を保存した。
- PNGは各built-in `image_gen`生成原本をコピーしたもの。WebPはPillowの `quality=88` 変換のみ。
- `src/data.js` やその他のコードは編集していない。

## 追加引継ぎ: keikyu

- 担当: Aから引継ぎ。既存のB10枚は再生成していない。
- `src/data.js`: `id: 'keikyu'`, `image: 'keikyu.webp'`, `color: '#c34e4f'`
- 参照画像: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\keikyu.webp`
- プロンプト記録: Image 1を京急車体の正確な参照として使用。アニメ水彩絵本調の横長16:9で、同じ長い箱型の鮮やかな朱赤の京急電車が冬の河口を低い鉄橋で左から右へ走る新規構図。平たい矩形前面、濃紺/黒の大きな前面窓、前面から側面へ続く幅広いクリーム白帯、反復する扉と窓、複数車両、暗い台車、銀灰色の床下機器、屋根機器、パンタグラフと架線を固定。前景に霜のついた葦と浅瀬、遠景に雪をまとった低い山と小さな漁村、船を置き、元画像の都市高架・運河・高層建物とは異なる景色にする。線路から離れた葦原に小さなタヌキを1匹。青/緑/黄色への塗り替え、流線形の高速車両、別の列車、文字、看板、透かしは入れない。
- 生成元: `C:\Users\narit\.codex\generated_images\01a09ab9-fb1b-7730-9db7-8008fcf8d1a6\exec-7a8249b2-df14-4eb4-8651-eea27e313926.png`
- 目視QA: 赤い箱型の京急通勤電車、クリーム白帯、濃紺の前面窓、平たい前面、複数車両、屋根機器とパンタグラフを確認。冬の河口・低い鉄橋・葦・漁船・タヌキの新規構図を確認。PNGとWebPの両方を目視確認し、採用可能と判断。
- 最終PNG: `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-keikyu.png`
- 最終WebP(q88): `C:\Users\narit\OneDrive\ドキュメント\ChatGPT\電車ひらがな\assets\trains\variant-keikyu.webp`
- 実行: built-in `image_gen` 1 call。WebPはPillowの `quality=88` 変換のみ。`src/data.js` は編集していない。
