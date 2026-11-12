# Blenderで仕上げるごほうび車両

Blender 4.5.5 LTSで実際に加工した7編成のGLBをWebGLへ読み込む。JavaScript版の形状生成器は再制作の元データと、取得失敗時の代替として残す。

## 車体の見直し

- 大きな窓を不透明な板へ貼る構造をやめ、前面に開口を設け、奥に運転台・ダッシュボード・座席を置く。
- 横須賀線は青い外周、クリームから青へ変わるドット模様、広いガラスと上部灯具。帯の青を実車写真に合わせて修正。
- 山手線E235系0番台は、緑色のドアと上部幕板、緑から黒へ変わる前面のドット柄。横帯の横須賀線と区別する。
- E6系こまちは赤い上部と白い側面・銀色のライン、E5系はやぶさは緑の上部と白い下部・ピンクのライン。専用の滑らかなロングノーズを別形状で制作する。
- E233系は白い前面枠、広い黒い窓周囲、湘南色／埼京線色の違い。
- 東急5050系は白い外周、偏心した非常扉、上部前照灯、下部標識灯、細い前面赤帯と側面のピンク帯。従来標準色として制作。
- 連結器の丸い金属ヘッド、取付軸・ソケット・ホース、台車のコイルばね、屋根のビードを追加。
- ステンレスの微細な粗さ、透明ガラス、塗装、ゴム、灯具を別のPBR材質にする。

### 実車参考

- [JR東日本 E6系](https://www.jreast.co.jp/train/shinkan/e6.html)
- [JR東日本 E5系](https://www.jreast.co.jp/train/shinkan/e5.html)

- [JR東日本 E235系](https://www.jreast.co.jp/train/local/e235.html)
- [E235系1000番代の報道公開写真](https://modelernahibi.blog.jp/archives/36733593.html)
- [JR東日本 E233系](https://www.jreast.co.jp/train/local/e233.html)
- [E233系3000代・公式撮影会資料](https://www.jreast.co.jp/press/2025/omiya/20260129_o01.pdf)
- [E233系7000代・公式資料](https://www.jreast.co.jp/press/2025/tokyo/20250924_to01.pdf)
- [東急5050系・公式写真／壁紙](https://www.tokyu.co.jp/railway/trains/02/)

写真自体をモデルのテクスチャとして転用してはいない。実車の完全なCAD複製ではなく、公開写真を参考にした独自モデル。

## 再制作

1. Node・Playwrightが利用できる環境で、リポジトリを `PORT=4180` の開発サーバーで公開する。
2. `node scripts/export-reward-source.cjs`。先頭車 `CAB`、普通車 `STANDARD`、グリーン車 `GREEN`、パンタグラフ `PANTOGRAPH`、車軸 `AXLE` のプロトタイプを `.tools/reward-source/` に書き出す。末尾にIDを付けると、その編成だけ更新する。
3. `blender --background --python scripts/refine-reward-blender.py -- --root .`。6〜12mmの面取り、角度に応じたスムージング、面積加重法線、窓を保護した先頭部の曲面補正を行う。編集可能なモディファイアと画像を含む `.blend` は `design/reward3d/`、評価済みGLBは `assets/reward3d/`。
4. 非圧縮GLBを別名で保存して、各編成へ以下を実行する。Blenderへ再読込する元データと配信用の圧縮データは分ける。

```
npm exec --yes --package=@gltf-transform/cli@4.5.1 -- gltf-transform meshopt input.glb output.glb --level high --quantize-position 16 --quantize-normal 12
```

配信データは編成ごとに圧縮し、1ファイル2.5MB以下を確認する。16bit位置・12bit法線で面取りと窓枠の精度を保ち、UVが0〜1を超える繰返し材質は無理に量子化しない。圧縮後もプロトタイプ名、座標系、材質、埋込画像を保持する。

## ブラウザでの描画

Three.js r180と同じ版のGLTFLoader・MeshoptDecoder・HDRLoaderを同梱し、外部CDNへ依存しない。glTFの量子化属性はFloat32へ展開してからノード変換を焼き込む。プロトタイプを再利用して7〜11両をInstancedMeshで構成し、車軸だけ個別に回す。パンタグラフと二階建て車両の位置も編成ごとに維持する。

CPU上の原型だけを最大7編成キャッシュする。再生するシーンはジオメトリ・材質・テクスチャを所有し、終了時にGPUリソースを解放する。HDRIもCPU原型を保持し、PMREM生成に使う一時テクスチャはその場で解放する。

車庫・夜景・天空の橋は、[Poly HavenのCC0 HDRI](../assets/reward3d/environment/LICENSE.md)を舞台ごとに使い分ける。実写の光を反射に使い、背景の地形・橋・雲・市街地は立体で描く。空撮の山は閉じた立体で、平らな四角い断面や浮いた面をなくした。

確認：`npm test`、`npm run build`、`tests/reward-visual-browser.cjs`、`tests/android-browser.cjs`。映像テストは21通りすべてでBlenderモデルとHDRIが実際に読み込まれたことを確認する。

技術資料：[Blender glTF](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)、[Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)、[glTF Transform](https://gltf-transform.dev/cli)。

### 追加車両と構図の調整

山手線は11両、こまちは7両、はやぶさは10両。新幹線では車体長・車両間隔・先頭部の張り出し・1,435mm軌間を個別に扱い、夜景ですれ違う列車も同じ軌間から選ぶ。E5/E6は別々の滑らかな断面から造形し、丸い鼻先、閉じた先端、曲面に沿う運転台窓とゴム枠、前照灯、台車カバー、遮音板を備える。新幹線専用のカメラ経路で先頭形状を見せる。

樹冠は共有位置の法線を揃え、頂点ごとの陰影で多面体の面張りを抑える。車庫外は継ぎ目の出ない草地、複数スケールの雲と青空。天空の山は閉じた体積を維持しながら岩壁の凹凸を増やし、空の太陽と主光源の向きを揃える。

## 10秒版の仕上げ

車体形状はBlenderからの配信GLBを維持する。E5/E6の台車カバーは、下部車体の丸みと先頭部の絞り込みに沿う曲面にし、横へ張り出す平板を解消した。

画面は線形HDRへ描き、小さなハイライトのにじみ・彩度・周辺の落ち着きを1回の仕上げパスで適用してから表示色へ変換する。HDR描画の拡張がない端末では通常の描画バッファを使う。描画ターゲットもシーンとともに破棄する。

`src/reward-timeline.js`が上映時間・加速・章の切替を共有する。10秒版の物語と音の同期は[演出仕様](reward-cinema-scenarios.md)を参照。
