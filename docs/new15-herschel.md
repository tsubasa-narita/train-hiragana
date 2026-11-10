# 北・中部の独立候補（Herschel）

2026-11-10 調査。`src/new15-herschel.js` は独立データで、アプリには未接続。実際の運転日は変更され得る。画像は内蔵 image_gen で車両ごとに個別生成し、PNG と同内容の WebP を保存した。背景、動物、細部は創作で実車写真ではない。

共通の生成指示：子ども向けの水彩アニメ風。車両を大きく斜め前から描き、実車の塗色・形を識別できるようにする。小動物を少し、文字・架線なし。

| ID | 名称・車両 | 公式出典（写真・経路） | 指示と照合結果・残る差異 |
|---|---|---|---|
| n15-herschel-melos | 走れメロス号・津軽21形 | [会社トップの実車写真](https://tsutetsu.com/)・[塗色](https://tsutetsu.com/archives/date/2020/08)・[運行区間](https://tsutetsu.com/lp)・[路線図](https://tsutetsu.com/ensenguide) | オレンジ車体と緑帯、中央扉、雪景色、ウサギを指示。初回の色指示不足を公式写真で認め、再生成。緑帯と橙色は一致、細い帯の形・窓や前面の配置・円形マークは簡略化。雪景色は創作。 |
| n15-herschel-hisui | 日本海ひすいライン・ET122形 | [公式実車写真と直江津〜市振](https://www.echigo-tokimeki.co.jp/information/detail?id=14)・[沿線案内](https://www.echigo-tokimeki.co.jp/guide/hisui-line/) | 銀白色の車体、青い波、中央扉、日本海と小鳥を指示。銀白と青波は一致するが、前面の黒い窓周りや波・客扉の形と配置は実車と異なる。 |
| n15-herschel-neogawa | ねおがわ・ハイモ330-701 | [公式実車写真・車両紹介](https://tarumi-railway.com/about)・[経路](https://tarumi-railway.com/station/) | 水色の車体、赤系の二本帯、中央扉、丸いバッジ、川とリスを指示。初回の塗色指定不足を確認し再生成。水色と帯は一致するが、帯幅、バッジ、窓・灯具・台車は簡略化。 |
| n15-herschel-akechi | 明知鉄道・アケチ101号 | [公式の路線と101号導入](https://www.aketetsu.co.jp/company/)・[公式沿線パンフレット](https://www.aketetsu.co.jp/wp-content/uploads/2026/04/pamphlet2026.pdf)・[101号の塗色を示す模型メーカー](https://www.tomytec.co.jp/tomix/products/n/2618.html) | クリーム色に朱色の横帯、中央扉、里山とウサギを指示。初回は帯が一本だったため、実車の複数帯を指示し再生成。車体色と帯は近いが窓・灯具・帯幅の細部は異なる。**鉄道会社公式のアケチ101号と特定できる実車写真は今回確認できず**、模型メーカーの色説明と別資料を補助にしたため、公式実車写真との直接照合は未完了。 |
| n15-herschel-nagara | 観光列車ながら・ナガラ300形 | [公式実車写真・形式](https://www.nagatetsu.co.jp/vehicle_train/)・[外観色](https://www.nagatetsu.co.jp/nagara/railway_vehicle/)・[運行紹介](https://www.nagatetsu.co.jp/nagara/) | ロイヤルレッド、金の細線、大窓、長良川、小鳥を指示。赤い車体と大きな窓は一致するが、金線・正面・窓の細部は創作。紹介文は依頼に従い美濃太田〜郡上八幡を記載。 |

## 確認範囲とファイル

`src/data.js` とその追加データ、および `src` の名前・形式・路線を検索し、対象5件の明示的な重複を確認できなかった。類似する他社車両、他塗色や一般的な沿線描写は別物として扱う。各IDの地域紹介は2件ずつで、`text`、`places`、`source` を含む。

画像は `assets/trains/n15-herschel-{melos,hisui,neogawa,akechi,nagara}.{png,webp}`。既存の同接頭辞画像との衝突を避けるため、当初生成した `n15-north-new-` からコピーした。データは `src/new15-herschel.js`。`src/new15-north.js` は固有名への変更指示前に書き込んだため、同時作業による衝突の可能性がある。共有名に元から別内容があったかは確認できていない。
