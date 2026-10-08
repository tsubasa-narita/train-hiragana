# 専用車両の連結演出

こまちに加え、横須賀線・山手線・踊り子・はやぶさ・かがやき・埼京線・湘南新宿ライン・南武線の8車種へ対応。

| 電車 | 表現した車両 | 素材 |
|---|---|---|
| こまち | E6 | assets/connect/komachi-carriages.png |
| 横須賀線 | E235 | assets/connect/yokosuka-carriages.png |
| 山手線 | E235 | assets/connect/yamanote-carriages.png |
| 踊り子 | E257 | assets/connect/odoriko-carriages.png |
| はやぶさ | E5 | assets/connect/hayabusa-carriages.png |
| かがやき | E7 | assets/connect/kagayaki-carriages.png |
| 埼京線 | E233 | assets/connect/saikyo-carriages.png |
| 湘南新宿ライン | E233 | assets/connect/shonan-shinjuku-carriages.png |
| 南武線 | E233 | assets/connect/nanbu-carriages.png |

組み込みの image_gen で透明な3車両の画像を生成。最終プロンプトは [generation-prompts.json](../assets/connect/generation-prompts.json) に保存。こまちのプロンプトは [基本仕様](connect-play.md) に記録。

一文字を選ぶたびに1車両が走ってきて連結する。名前の最初は左向き先頭車、途中は中間車を繰り返し、最後は右向き後尾車。ゲーム上の車両数は名前の文字数に対応し、実際の編成両数の再現ではない。

画像ごとの車体・車輪の範囲を src/connect-assets.js に記録し、CSSで表示。生成画像のピクセルと透明度は変更していない。スマートフォンでも新しくつながる車両を大きく表示し、完成時は編成をゆっくり見渡す。動きを減らす設定では静止した編成を表示する。

9車種を最初の電車選択へ配置。初回は全車種とも名前の先頭から作り、正解文字を一つだけ表示して支援。湘南新宿ラインは図鑑・クイズへ新規登録し、名前と問題の録音音声も追加した。

## 車両の確認に使った公式資料

- [JR東日本 E235系](https://www.jreast.co.jp/train/local/e235.html)：山手線・横須賀線
- [JR東日本 E233系](https://www.jreast.co.jp/zh-CHT/train/local/e233.html)：埼京線・南武線・湘南新宿ライン
- [JR東日本 踊り子 E257系](https://www.jreast.co.jp/train/express/odoriko.html)
- [JR東日本 はやぶさ E5系](https://www.jreast.co.jp/train/shinkan/e5.html)
- [JR東日本の列車たち](https://www.jreast.co.jp/railway/train/)：E7系かがやき

## 検証

tests/connect-models-browser.cjs で9車種すべてについて、専用素材の読み込み、一文字ごとの車両数、先頭・中間・後尾、長い名前、小画面の横はみ出し、ご褒美の早期出現がないことを検証。
tests/connect-browser.cjs で通常アニメーションとタッチ連結、3問ご褒美、連打、途中再開、保存不可を検証。データ・音声・既存画面の回帰テストも実施。
