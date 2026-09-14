# 電車とごほうびのバリエーション拡張

2026-09-14。画像生成は組み込みImageGenを使用。Luna（xhigh）の複数エージェントが分担し、親エージェントが保存画像・実車の特徴・画面表示を確認。

## 遊びの変更

- 図鑑は45種類から61種類へ。クイズは90候補・89画像。
- 清音46文字すべてに2枚以上の画像を用意。44文字は列車・路線・鉄道会社の名前の先頭と一致。「を」「ん」の例外は従来どおり。
- 別の列車名がある文字には新しい名前を追加し、それ以外も同じ列車の季節・景色を変えた専用画像を追加。同じ文字で直前に表示した画像を避け、履歴はブラウザ内に保存する。別景色でも図鑑のスタンプは同じ列車に付く。
- 五十音順・行の選択・正解から約1秒の自動進行・5駅完走時だけごほうび、という流れは維持。
- ごほうびは11種類から16種類へ。追加はつばさ・江ノ電・ソニック・ゆふいんの森・桃太郎。
- 虹の橋を渡る、動物のいる駅で一時停車、星空を走る、の3演出。再生するたびに直前とは違う演出を選ぶ。「もういっかい」は同じ電車で演出を変更。「つづける」とAndroidの戻るで途中終了できる。
- 新しい電車名・問題・ごほうびの音声125件を追加し、同じ声の録音609件を同梱。

## 生成画像とプロンプト

今回の新規生成はクイズ31枚、ごほうび5枚の計36枚。採用したPNGとWebPをリポジトリ内に保存。WebPはPillowで形式変換（quality=88）。ごほうびは背景をRGBAで透過し、画像に描かれた市松模様を透明と誤認しないようブラウザ上でも確認。背景処理と生成元の詳細は各記録を参照。

- [新しい列車6種類](expansion-new-trains-d.md)
- [別景色A：5枚](expansion-variants-a.md)
- [別景色B：10枚](expansion-variants-b.md)
- [別景色C：10枚](expansion-variants-c.md)
- [ごほうび5種類](expansion-rewards.md)
- [ゆふいんの森・桃太郎の背景修正](expansion-rewards-fixes-d.md)

ごほうびの初稿ではソニックがラピートに似た形、つばさが旧E3に似た形になっている点と、4枚の背景がRGBの市松模様である点を親レビューで検出。修正版の形状・色・背景透過を確認して採用した。親も[JR九州883系ソニック](https://www.jrkyushu.co.jp/trains/sonic/)と[JR東日本E8系つばさ](https://www.jreast.co.jp/train/shinkan/e8.html)の公式外観写真を確認。公式車両写真は形状・塗装の確認に使用し、アプリの画像として転載していない。

## 既存プロジェクトから追加した12枚

依頼者の `C:/develop/go-home-puzzle/public/images/` から読み取り、次の画像をWebP変換してコピーした。元プロジェクトは変更していない。

| 元ファイル | このアプリの保存先（assets/trains/） | 確認した車両の特徴 |
| --- | --- | --- |
| oimachi.png | extra-oimachi.webp | 大井町線のオレンジ帯 |
| kaiji.png | extra-kaiji.webp | E353系の白・紫・黒い前面 |
| sunrise.png | extra-sunrise.webp | 285系の赤とクリーム、寝台車 |
| shimakaze_50000.png | extra-shimakaze.webp | 近鉄50000系の青白・多面体の前面窓 |
| spacia.jpg | extra-spacia-x.webp | N100系スペーシアX、白・六角形の側窓 |
| tokyo_metro_chiyoda_16000.png | extra-chiyoda.webp | 千代田線16000系、緑帯 |
| tokyu-toyoko.jpg | extra-toyoko.webp | 東横線5050系、銀と赤系の帯 |
| tokyo_metro_hanzomon_18000.png | extra-hanzomon.webp | 半蔵門線18000系、紫帯 |
| fukutoshin.png | extra-fukutoshin.webp | 副都心線10000系、丸い前面と茶色の帯 |
| laview.png | extra-laview.webp | 西武001系、丸い銀の前面と大きな側窓 |
| seibu30000.png | variant-seibu.webp | 西武30000系、丸い前面と緑青の帯 |
| yokosuka.jpg | variant-yokosuka.webp | 横須賀線E235系、青とクリーム帯 |

参照した公式資料：[東急の車両紹介](https://www.tokyu.co.jp/railway/trains/)、[西武30000系](https://www.seiburailway.jp/railway/encyclopedia/30000/)、[Laviewのデザイン](https://www.seiburailway.jp/railways/laview/design.html)、[東武スペーシアX](https://www.tobu.co.jp/spaciaX/)、[東京メトロの車両](https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/index.html)、[近鉄50000系](https://www.kintetsu.jp/kouhou/Train/B56.html)、[JR西日本サンライズ](https://www.jr-odekake.net/train/sunriseseto_izumo/)。既存車両の実車確認は[前回のレビュー記録](design-review.md)も参照。

## 検証の範囲

`npm test` は13件成功。全46文字の複数候補・先頭一致・五十音順・画像重複・前回画像の回避を検証。`npm run build` 成功。

ブラウザテスト8本（browser、order、rows、voice、images、android、pwa-prefix、expansion）も成功。全105画像と音声609件のデコード、追加ごほうび5枚の透明画素、5駅完走、3演出、再生・途中終了、動きを減らす設定、モバイル幅、Android相当の履歴操作とPWAを確認した。ChromiumはPagesと同じサブパスでインストール要件エラー0件。Android実機ではなく、Chromiumのモバイル設定での検証。

透過画像は輪郭や車体に半透明を含むため、検査では完全透明画素に加え、アルファ240以上の十分に不透明な画素が存在することを確認。ゆふいんの森・桃太郎はマゼンタ背景で実表示を確認し、市松模様が描き込まれた偽透明を除外した。
