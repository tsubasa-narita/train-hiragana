# 「ことばをよもう」追加4列車：出典・画像生成記録

確認日：2026-11-11。担当範囲はこの文書、`src/word-extra-trains.js` と `assets/trains/word-{nasuno,tsurugi,ishizuchi,ashizuri}.webp` の6ファイルのみ。

## 重複確認・統合用データ

- 既存 `src/*.js` の列車名・IDと `assets/trains/` のファイル名を照合し、なすの／つるぎ／いしづち／あしずりは未登録で、予定ID・画像名の衝突もなかった。
- 同形式を使う既存の「はやぶさ」「かがやき」等とは列車名が異なる。画像の使い回しは行わず、4件を別々に新規生成。
- `WORD_EXTRA_TRAINS` は `{ id, name, image, color, detail }`。画像参照は既存同様のファイル名のみで、実ファイルは `assets/trains/` に保存。
- `WORD_EXTRA_FACTS` は各IDに2件、既存互換の `{ text, places, source }`。説明はひらがなで、運行区間・停車駅・車体傾斜という画像の見た目に依存しない内容。
- 親担当が `data.js`／`train-facts.js`／サービスワーカー／音声を統合するため、それらは変更しない。

## 実車・運行区間の裏取り

### なすの — E5系

- [JR東日本 E5系公式](https://www.jreast.co.jp/train/shinkan/e5.html)：愛称欄に「なすの」。ときわグリーンの上部、飛雲ホワイトの下部、間のつつじピンク帯、長い流線形の先頭形状を本文で確認。
- [公式外観写真](https://www.jreast.co.jp/train/shinkan/img/e5_img01.jpg)：出典画像URL。ローカル取得は403のため、最終照合には次の公式配信写真を使用した。
- [びゅうトラベル E5系記事](https://www.jre-travel.com/article/00151/)に掲載の[JR東日本提供のE5系写真](https://www.jre-travel.com/content/dam/jretravel/site/page/article/images/00151/a00151_02_p.jpg)をローカル取得して目視。前照灯は運転台窓の上の横並び4灯であることを確認。初回生成の鼻左右の斜め灯具は誤りだったため、組み込みImageGenで削除し、実車の位置に修正した。
- [JR東日本 なすの255号停車駅一覧・2026年11月](https://timetables.jreast.co.jp/2611/train/020/022101.html)：東京→上野→大宮→小山→宇都宮→那須塩原→新白河→郡山を確認。全便が郡山まで走るとは説明していない。
- 最終生成確認：E5系の長い先頭、緑／白／ピンク、暗い運転台窓、運転台窓上の横並び4灯、側面窓列。鼻左右の誤った灯具は除去済み。2匹は客室の窓内。

### つるぎ — W7系

- [JR東日本 びゅうトラベル：E7系・W7系の違い](https://www.jre-travel.com/article/00144/)：共同開発、W7系の所有者がJR西日本、つるぎが富山・金沢～敦賀間という運行区間を確認。
- [同記事の外観写真](https://www.jre-travel.com/content/dam/jretravel/site/page/article/images/00144/a00144_mv_pc_p.jpg)：ローカル取得して目視。白い車体、青い屋根と先頭中央、銅色の縁・側面帯、湾曲した黒い運転台窓、小さな規則的な側面窓。
- [JR東日本 E7系公式](https://www.jreast.co.jp/train/shinkan/e7.html)：W7系と外観を共通にするE7系の公式説明で、空色・アイボリーホワイト・銅色の配色を補強。
- [JR西日本・JR東日本：北陸新幹線 金沢～敦賀間開業に伴う運行計画](https://www.westjr.co.jp/press/article/items/230830_00_press_hokurikushinkansen.pdf)：検索結果にも富山～敦賀間の「つるぎ」を明記。
- 生成確認：青／白／銅色のW7系形状で、E5系の長い鼻とは区別。2匹は客室の窓内。

### いしづち — 8600系

- [JR四国 8600系公式](https://www.jr-shikoku.co.jp/01_trainbus/syaryou/8600.shtm)：高松～松山間の「いしづち」でデビュー、空気バネ式車体傾斜機構を確認。
- [公式外観写真](https://www.jr-shikoku.co.jp/01_trainbus/syaryou/8600/img01.jpg)：ローカル取得して目視。黒い丸形の前面、中央の貫通扉と左右の運転台窓、黄橙色の縁取り、左右2灯ずつの丸い前照灯、金属色の側面、大きな四角い側面窓と細い黄緑帯を確認。
- [JR四国 しおかぜ・いしづち号案内](https://www.jr-shikoku.co.jp/02_information/care/tokkyu_shiokaze/)：高松～松山の運行区間を確認。8000系で走る便もあるため、全便8600系とは説明しない。
- 生成確認：丸い黒色前面／黄橙色の縁／中央扉／4つの丸形灯／黄緑帯／パンタグラフ。2匹は客室の窓内。

### あしずり — 2700系

- [JR四国 2700系公式](https://www.jr-shikoku.co.jp/01_trainbus/syaryou/2700.shtm)：特急形気動車、制御付自然振子方式等の形式情報。
- [公式外観写真](https://www.jr-shikoku.co.jp/01_trainbus/syaryou/2700/img01.jpg)：ローカル取得して目視。角を丸めた黒い前面、中央貫通扉と左右に分かれた運転台窓、深い赤と黄緑の前面帯、横長の前照灯、銀色の側面と大きな四角い側面窓。
- [JR四国 南風・しまんと・あしずり号案内](https://www.jr-shikoku.co.jp/02_information/care/tokkyu_nanpu/)：2700系の「あしずり」5号が高知～中村、7号が高知～宿毛。宿毛へ走るのは一部の便と明記した。
- 生成確認：赤／黄緑／銀色、中央扉と2つの運転台窓、横長の前照灯。気動車としてパンタグラフ・架線を描かず、2匹は客室の窓内。

## 生成・保存方法

組み込み `image_gen__imagegen` を使用。4件を1アセットにつき1回ずつ個別に新規生成し、なすのだけ公式写真比較後に1回修正生成（合計5回）。各呼出しは必ず1アセットのみ。CLIやAPIへの切り替えなし。すべて1536×1024、3:2横長、やさしいアニメ水彩、1画像1編成、窓内の小さなウサギ・クマ2匹、擬人化なし、文字・ロゴ・余分な列車なし。

ツール返却の `output_hint` に、PNG原本のWindows絶対パスが含まれる。`image_url` は表示用のデータURLであり、ファイルパスとして扱わない。下記の実在する原本パスからPillowでWebPへ変換（quality=90, method=6）。リサイズ・切り抜き・絵の編集はせず、PNG原本はCodex生成フォルダに保持。WebP本体は必ずプロジェクト内に保存した。

| ID | データ内のimage | 実保存先 | PNG原本 |
| --- | --- | --- | --- |
| word-nasuno | word-nasuno.webp | assets/trains/word-nasuno.webp | C:/Users/narit/.codex/generated_images/01a1ca88-65c8-7411-85f3-b2680ea343bd/exec-60fbbb39-546e-49de-8730-04340498b763.png |
| word-tsurugi | word-tsurugi.webp | assets/trains/word-tsurugi.webp | C:/Users/narit/.codex/generated_images/01a1ca88-65c8-7411-85f3-b2680ea343bd/exec-3623b9ef-3f8c-47ec-a927-731075e51b7d.png |
| word-ishizuchi | word-ishizuchi.webp | assets/trains/word-ishizuchi.webp | C:/Users/narit/.codex/generated_images/01a1ca88-65c8-7411-85f3-b2680ea343bd/exec-943ad61a-ca1e-44a9-8719-a7e7f9180611.png |
| word-ashizuri | word-ashizuri.webp | assets/trains/word-ashizuri.webp | C:/Users/narit/.codex/generated_images/01a1ca88-65c8-7411-85f3-b2680ea343bd/exec-b37f5ea7-e52a-404f-bd62-838129d51a91.png |

## 個別の最終プロンプト

## 最終検証

- 保存済みWebP4枚を開き直し、取得した実車写真と先頭形状・配色・窓配置を照合。なすのは前照灯を公式写真どおりに修正。つるぎの青・銅色と先頭窓、いしづちの丸い前面・中央扉・4丸灯、あしずりの赤／黄緑・中央扉・横長灯を再確認。
- いずれも1536×1024のWebPで、4枚のSHA-256は別々。1画像1編成、客室窓の動物2匹、文字なしを目視確認。
- Nodeで追加モジュールの構文、4列車のID／名称の既存データ重複なし、各画像の実在と命名、ひらがなの説明、2件ずつ計8件の既存FACTSスキーマと公式source URL、placesが本文内にあることを検証し合格。
- 全体の音声生成・統合testは親担当が実行。新規ブランチ・commit・pushなし。

### なすの（E5系）初回プロンプト（前照灯を修正したため不採用）

```text
Use case: illustration-story. Asset type: a single children's railway hiragana quiz illustration. Create exactly ONE new image, 1536 x 1024 pixels, landscape 3:2. Soft gentle anime watercolor children's picture-book painting, light paper texture, warm daylight, clean graceful linework, pastel countryside, rich but gentle train colors. One identifiable real Japanese train formation only, in a large three-quarter view with its front and a useful length of its side clearly visible, fully framed nose, continuous real rails. Preserve realistic railway vehicle proportions, model-specific structure, exact livery and window placement; the train is never anthropomorphic: no face, eyes or mouth on the train. Exactly two tiny animal passengers, a little rabbit and a little bear, each visible through a different REAL passenger side window, small enough not to distort the windows. No other animals. No additional trains or separate train, no collage, no inset. No writing, lettering, numbers, destination text, logos, watermarks or signs anywhere; leave display panels dark without writing. The animals are the only whimsical element; the real train remains mechanically faithful. Subject: JR East E5 series serving Nasuno, Tohoku Shinkansen. Accurate very long flattened aerodynamic duckbill nose; Tokiwa green/teal upper body and nose surface, Hiun white lower body, a THIN continuous Tsutsuji pink separating stripe. Raised dark small curved cockpit windscreen well behind the long nose, slim slanted light clusters, small dark rounded-rectangle passenger side windows in an orderly row within the white/light side area, green roofline. Do not shorten the E5 nose or turn it into E7. Scene: fresh Nasu-area green fields, low rounded hills and a soft blue sky, gently curving electrified tracks with a few unobtrusive catenary structures. Train traveling toward the lower left, body receding to the right.
```

### なすの（E5系）最終修正プロンプト

入力1：初回生成PNG（編集対象）。入力2：上記びゅうトラベル掲載のJR東日本提供写真（灯具位置の参照）。初回原本 `exec-e3e5a204-f1dc-4197-92f4-6beb9e22fc39.png` は生成フォルダに保持。

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET: a 1536 x 1024 watercolor children's illustration of E5 Nasuno. Image 2 is the supporting OFFICIAL REAL E5 REFERENCE photograph, for headlight placement only. Correct Image 1's inaccurate headlights to match a real E5 Shinkansen. REMOVE COMPLETELY both slanted light housings from the green sides of the nose below and forward of the windshield; fill both areas smoothly with the same continuous unbroken green painted train surface. A real E5 has NO headlights on those lower nose cheeks. Add the E5's small horizontal bank of four bright white headlights ABOVE the upper edge of the cockpit windshield, near the center of the cab roof brow, as seen in Image 2. Retain the target's realistic long flattened E5 nose shape and all other details: green upper body, white lower body, thin pink stripe, real small passenger side windows, exactly the same two small rabbit and bear passengers in their existing side windows, the same train pose, framing, rails, catenary, watercolor landscape, style and light. No text, logo, numbering, additional train, additional animal or human, no anthropomorphic train face. Output exactly one image, 1536 x 1024 landscape. Change only the headlight placement and the green surface left by removing the incorrect housings; do not use the photographic style from Image 2.
```

### つるぎ（W7系）最終プロンプト

```text
Use case: illustration-story. Asset type: a single children's railway hiragana quiz illustration. Create exactly ONE new image, 1536 x 1024 pixels, landscape 3:2. Soft gentle anime watercolor children's picture-book painting, light paper texture, warm daylight, clean graceful linework, pastel countryside, rich but gentle train colors. One identifiable real Japanese train formation only, in a large three-quarter view with its front and a useful length of its side clearly visible, fully framed nose, continuous real rails. Preserve realistic railway vehicle proportions, model-specific structure, exact livery and window placement; the train is never anthropomorphic: no face, eyes or mouth on the train. Exactly two tiny animal passengers, a little rabbit and a little bear, each visible through a different REAL passenger side window, small enough not to distort the windows. No other animals. No additional trains or separate train, no collage, no inset. No writing, lettering, numbers, destination text, logos, watermarks or signs anywhere; leave display panels dark without writing. The animals are the only whimsical element; the real train remains mechanically faithful. Subject: JR West W7 series serving Tsurugi, Hokuriku Shinkansen. Accurate W7/E7 type aerodynamic moderately long sculpted nose (NOT E5's long duckbill), ivory-white body, sky-blue roof and large central blue nose panel, copper-colored curved stripes down the cheeks around the blue nose that become copper and blue horizontal side stripes. Dark curved wraparound cab windshield in the blue upper head, small angled recessed headlight clusters on white cheeks, small evenly spaced rounded rectangular dark passenger windows, white/light sidewalls, correct bogie covers. Scene: Hokuriku green fields with distant pale snowy Tateyama-like mountains and gentle blue sky. Three-quarter view nose toward the lower right, body receding left.
```

### いしづち（8600系）最終プロンプト

```text
Use case: illustration-story. Asset type: a single children's railway hiragana quiz illustration. Create exactly ONE new image, 1536 x 1024 pixels, landscape 3:2. Soft gentle anime watercolor children's picture-book painting, light paper texture, warm daylight, clean graceful linework, pastel countryside, rich but gentle train colors. One identifiable real Japanese train formation only, in a large three-quarter view with its front and a useful length of its side clearly visible, fully framed nose, continuous real rails. Preserve realistic railway vehicle proportions, model-specific structure, exact livery and window placement; the train is never anthropomorphic: no face, eyes or mouth on the train. Exactly two tiny animal passengers, a little rabbit and a little bear, each visible through a different REAL passenger side window, small enough not to distort the windows. No other animals. No additional trains or separate train, no collage, no inset. No writing, lettering, numbers, destination text, logos, watermarks or signs anywhere; leave display panels dark without writing. The animals are the only whimsical element; the real train remains mechanically faithful. Subject: JR Shikoku 8600 series electric limited express serving Ishizuchi, standard unwrapped livery. Faithfully follow the 8600's distinctive tall rounded almost circular glossy BLACK front mask with two cab window panes flanking a narrow CENTRAL full-height front gangway door; the mask is framed by GOLDEN YELLOW/ORANGE border over the top and around lower cheeks, four small ROUND headlights arranged two per lower cheek. Visible real central coupler and charcoal gray lower skirt. Metallic charcoal/stainless gray sidewalls with a thin lime-green horizontal stripe underneath large aligned rectangular passenger windows; golden yellow/orange roof shoulder line. NO blue livery, NO red 2700 face, no shinkansen nose. Roof-mounted electric pantograph, accurate non-shinkansen express proportions. One short connected formation, not two trains. Scene: Shikoku coastal landscape with calm Seto Inland Sea glimpsed behind leafy green slopes, clear sunny sky. Three-quarter front nose toward lower right, side receding left.
```

### あしずり（2700系）最終プロンプト

```text
Use case: illustration-story. Asset type: a single children's railway hiragana quiz illustration. Create exactly ONE new image, 1536 x 1024 pixels, landscape 3:2. Soft gentle anime watercolor children's picture-book painting, light paper texture, warm daylight, clean graceful linework, pastel countryside, rich but gentle train colors. One identifiable real Japanese train formation only, in a large three-quarter view with its front and a useful length of its side clearly visible, fully framed nose, continuous real rails. Preserve realistic railway vehicle proportions, model-specific structure, exact livery and window placement; the train is never anthropomorphic: no face, eyes or mouth on the train. Exactly two tiny animal passengers, a little rabbit and a little bear, each visible through a different REAL passenger side window, small enough not to distort the windows. No other animals. No additional trains or separate train, no collage, no inset. No writing, lettering, numbers, destination text, logos, watermarks or signs anywhere; leave display panels dark without writing. The animals are the only whimsical element; the real train remains mechanically faithful. Subject: JR Shikoku 2700 series diesel limited express serving Ashizuri, standard unwrapped livery. Faithful 2700 moderately rounded tall rectilinear cab front, not the circular 8600 mask: broad glossy BLACK front window area, two large separate cab windscreens flanking a narrow CENTRAL full-height front gangway door with dark glass and silver edging. DEEP RED cheek panels below the cab windows, thin vivid LIME GREEN angular trim beneath the red panels continuing along the sides below the passenger windows. Each lower cheek has a compact horizontal headlight unit with several small white lights. Silver stainless-steel body, gray roof, dark underframe, exposed central front coupler. Large rectangular dark passenger windows in a straight evenly spaced row on the silver sides. No overhead pantograph (diesel). NO blue body, NO golden orange circular 8600 front, no shinkansen nose, no character wrapping. One short connected formation on non-electrified track. Scene: Kochi countryside approaching Nakamura, a calm blue river, green low mountains and fields in soft afternoon daylight. Three-quarter view nose toward lower left, side receding right.
```
