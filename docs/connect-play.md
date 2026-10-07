# なまえをつなごう：3問クイズと車両連結

好きな電車から名前を3つ作り、3問正解後に既存のごほうび電車を走らせる。海・山を選ぶ運転遊びは削除。

- こまちは新しく生成したE6の先頭・中間・後尾3車両を一文字ずつ連結。初回も「こ」「ま」「ち」の3文字を作り、正解文字だけを表示して支える。
- 他の初回電車は最後の一文字から。その後はお手本と最大3択で名前全体をつなぐ。次問は2〜5文字の短い名前を優先。
- 連結時に車両が入ってきて接続し、連結部が短く光る。完成後は大きな車両をゆっくり見渡す。動きを減らす設定では静止した全編成を表示。
- タップとドラッグに対応。連結先の周辺も許容し、連打は750ms抑制。文字列だけを横スクロールし、ページ全体を音声で動かさない。
- 間違いで途中の車両は失われない。ヒントは正解の強調から選択肢1個へ段階的に支援。
- 名前の完成だけを1問と数え、3つの切符で進捗を表示。戻る・再読み込み・連打でも同じ完成を再加算しない。
- 完成した電車を車庫と図鑑へ保存。途中でホームや車庫へ移っても再開できる。保存できない環境でも遊べる。
- 3問目の完成から約1.3秒後、従来のごほうび演出へ。ごほうびは閉じる・再走行でき、次の3問も開始できる。

## サブエージェントレビューの反映

操作レビュー：主要操作を小画面内へ集め、3問の進捗、途中再開、音声の競合回避を改善。850ms固定の連続読み上げを名前1回の読み上げへ変更。
ビジュアルレビュー：車両を大きく表示し、車輪と線路の位置を合わせる。背景付き写真を走行素材として動かす方式を廃止。こまちの車両を新しい透明画像に統一。

## 画像生成

組み込みの image_gen ツールを使用。保存先：`assets/connect/komachi-carriages.png`。
1536×1024 RGBA。3行の車両画像をCSSの背景位置で表示し、元の透明度を維持する。

最終プロンプト：
> Use case: stylized-concept. Asset type: production transparent sprite atlas for a Japanese children's train coupling game. Create a single 1536x1024 landscape PNG with genuine alpha transparency, containing exactly THREE isolated E6 Komachi Shinkansen railway carriages, one carriage per horizontal row. Each row is exactly one third of canvas height. All three rows use identical strict SIDE ELEVATION orthographic camera, same scale, same roof height and wheel baseline relative to the row. TOP ROW: front driving cab car with long beautiful aerodynamic crimson-red nose pointing LEFT, flat coupling end on RIGHT. MIDDLE ROW: one passenger middle car with flat coupling ends LEFT and RIGHT, no cab nose. BOTTOM ROW: rear driving cab car with flat coupling end on LEFT and pointed aerodynamic crimson-red nose pointing RIGHT. The three carriages must NOT be connected to each other in the atlas. Each carriage fills nearly the full width of its row with small equal margins, and is vertically centered in its row. Premium polished photorealistic 3D model rendering, ruby crimson upper body and roof, thin pink accent line, pearl white lower sides, silver-gray underbody, dark bogies with crisp visible wheels, realistic small black tinted windows, sculpted aerodynamic nose and subtle beautiful specular highlights. This is an impressive detailed train model, not a flat cartoon. Soft studio lighting from upper left consistent across rows. Constraints: no backgrounds, no rails, no landscape, no ground plane, no text, no letters, no labels, no people, no logo, no watermark, no perspective foreshortening, no grid lines. Clean alpha edges and separate cars, all fully within their own equal-height row. Couplers visible at flat ends, matching exact height so the cars will fit together when rows are sliced and aligned horizontally in the game.

## 検証

`node --test tests/*.test.mjs` と `tests/connect-browser.cjs`（通常アニメーション、タッチ連結、3問ごほうび、途中再開、小画面、保存不可、動きを減らす設定）。
既存の `tests/browser.cjs` と `tests/rows-browser.cjs` も新しい3問の流れに対応。
