# 実車デザインのレビューと専用画像化

2026-09-07。Luna / effort超高の3サブエージェントが、当時のクイズ画像40枚とごほうび11枚、合計51枚を分担して目視レビューしました。同一画像を使う列車名も含めて照合しています。担当別記録は [A](design-review-a.md)、[B](design-review-b.md)、[C](design-review-c.md)。

判定は形式、主要な配色、識別に関わる前面形状を対象とし、絵本風のデフォルメや小さな動物、車両数の省略は許容しています。親エージェントも指摘されたローカル画像と鉄道会社の公式写真を別途目視して、次の6件を修正対象にしました。

| 対象 | 確認した相違 | 親が目視した公式写真 | 採用画像 |
| --- | --- | --- | --- |
| ごほうび・はやぶさ | 緑と白の境界が黒い帯。E5はピンクの帯 | [JR東日本 E5](https://www.jreast.co.jp/train/shinkan/img/e5_img01.jpg) | `assets/rewards/reward-hayabusa-v2.webp` |
| 名鉄ミュースカイ | 実車にない長い赤い側面帯 | [名鉄2000系](https://www.meitetsu.co.jp/library/rolling_stock/detail_exp/__icsFiles/afieldfile/2021/06/24/library_rolling_stock_2000.jpg) | `assets/trains/meitetsu-v2.webp` |
| レッドアロー | 大きく傾いたくさび形前面、赤い前面・屋根帯。10000系は立った前面と大きな窓 | [西武10000系](https://www.seiburailway.jp/railway/encyclopedia/10000/images/series-10000.jpg) | `assets/trains/red-arrow-v2.webp` |
| ごほうび・ラピート | 実車にない白い前面縦帯と淡色の下部帯 | [南海50000系](https://www.nankai.co.jp/sites/default/files/2022-07/50000_3_0.jpg) | `assets/rewards/reward-rapit-v2.webp` |
| 平成筑豊鉄道 | 上部赤帯と下部青赤V字の混成。412開業時カラーの水平帯へ統一 | [平成筑豊鉄道412](https://www.heichiku.net/wp-content/uploads/2020/default/412_01.jpg) | `assets/trains/heisei-chikuho-v2.webp` |
| わかしお | 前面外周・上端とスカートの黄色が不足 | [JR東日本 E257系500番台](https://www.jreast.co.jp/train/express/img/wakashio_sazanami_img02.jpg) | `assets/trains/wakashio-v2.webp` |

親の追加照合で、当初OKだったわかしおの前面色も修正対象にしました。専用しおさいの初回生成も同じ配色の問題を発見し、採用前に再修正しています。

当初挙がった「800系つばめの青・金帯が不足」という指摘は、親が [JR九州800系の公式写真](https://www.jrkyushu.co.jp/trains/trains_img/800/pgttl.jpg) で白・赤・黒の実際の塗装を確認して棄却しました。担当者も再照合してOKに訂正しています。

ごほうび成田エクスプレスは実在したE259系の旧塗装です。架空の配色ではないため残しています。現在の車両と旧塗装は異なります。[JR東日本のデザイン変更資料](https://www.jreast.co.jp/press/2022/20230324_ho05.pdf)。ロマンスカー・沼尻軽便鉄道・留萌本線も歴史上の車両として扱います。

## 画像の共有を解消

「たにがわ」「とき」「しおさい」「富士回遊」「みずほ」「室蘭本線」の6枚を個別に生成。既存の「かがやき」「わかしお」「あずさ」「さくら」「根室本線」はそれぞれの専用画像として残します。同じ形式の実車でも、景色や構図を変えています。45種類すべての電車が異なる画像パスを持ち、「を」の場面と合わせて46枚、ごほうび11枚で計57枚です。

生成プロンプト・保存先：[専用画像A](unique-trains-a.md)、[専用画像B](unique-trains-b.md)、[専用画像C](unique-trains-c.md)、[わかしお修正](design-fix-wakashio.md)、[はやぶさ修正](design-fix-hayabusa.md)、[ラピート修正](design-fix-rapit.md)、[平成筑豊鉄道修正](design-fix-b.md)、[名鉄・レッドアロー修正](design-fix-c.md)。PNG原本と配信用WebPを保存し、旧画像は比較用に保持しています。

## 採用前の確認

親エージェントが追加・修正した全12枚を目視しました。クイズ46枚とごほうび11枚の読み込み・デコードをブラウザで確認し、45種類の列車間でパスも画像のSHA-256も重複しないことをテストしています。問題生成・保存・音声の11テスト、全10行の出題順、5問後のごほうび・再生・閉じる、画面サイズのチェックが通っています。

同時に追加したPWAと履歴対応はPixel 7相当のブラウザエミュレーションで検証。GitHub Pagesと同じサブパスでChromiumのインストール可能性エラーが0件であること、専用Service Workerのスコープ、オフライン再読込、戻る操作も確認しました。Android実機でのインストール操作はこの環境では未実施です。
