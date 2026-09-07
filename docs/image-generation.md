# 追加画像の生成記録

生成方法：組み込み ImageGen。依頼どおり、gpt-5.6-luna / reasoning effort xhigh のサブエージェント3つで分担しました。

共通方針：既存のはやぶさ・こまちの絵をスタイル参照に、やわらかなアニメ・水彩絵本風で、電車の形と配色が認識でき、窓や沿線に小さな動物が少し登場する絵。クイズ画像は風景付き、ごほうび画像は右向きの車両を透過背景に配置。画像内の文字は入れません。

生成したPNG原本を保存したうえで、同じフォルダに同名の`.webp`版も用意しています。アプリは軽量なWebP版を読み込みます。`scripts/optimize-images.py`（Pillow）で再作成でき、内容・解像度・透過背景は保持します。

個別の最終プロンプトと確認結果：

- [あずさ・さくら・京急・ソニック・根室本線](images-azusa-sakura.md)
- [成田エクスプレス・丸ノ内線・ひたち・平成筑豊鉄道・ゆふいんの森](images-narita-marunouchi.md)
- [ラピート・わかしお・横須賀線・犬と電車](images-rapit-wakashio.md)
- 追加の個別記録：[横須賀線](yokosuka.md)、[犬と電車](dog-train.md)
- [清音46文字の出題対応表](kana-coverage.md)

## クイズ用の保存先（14枚）

すべてプロジェクト内 `assets/trains/` に保存しています。

| ファイル | 絵の題材 |
| --- | --- |
| azusa.png | あずさ |
| sakura.png | さくら |
| narita-express.png | 成田エクスプレス |
| marunouchi.png | 丸ノ内線 |
| rapit.png | ラピート |
| wakashio.png | わかしお |
| keikyu.png | 京急線 |
| sonic.png | ソニック |
| nemuro.png | 根室本線 |
| hitachi.png | ひたち |
| heisei-chikuho.png | 平成筑豊鉄道 |
| yufuin.png | ゆふいんの森 |
| yokosuka.png | 横須賀線 |
| dog-train.png | 犬が京急線を見る場面。「を」を学ぶ言葉に使用 |

## ごほうび用の保存先（5枚）

すべてプロジェクト内 `assets/rewards/` に保存しています。

- reward_azusa.png
- reward_sakura.png
- reward_narita-express.png
- reward_marunouchi.png
- reward_rapit.png

## 先頭一致のための追加10枚

組み込みImageGenで生成し、PNG原本とWebP配信用画像を `assets/trains/` に保存しました。Luna・超高の3エージェントが8枚を分担し、親エージェントが2枚を生成しました。各記録には最終プロンプトと実在確認の出典を記載しています。

- [いなほ・きぬがわ・にちりん](prefix-trains-a.md)
- [天竜浜名湖鉄道・北斗](prefix-trains-b.md)
- [沼尻軽便鉄道・留萌本線・レッドアロー](prefix-trains-c.md)
- [上野東京ライン・りんかい線](prefix-trains-d.md)

そのほか、既存 `go-home-puzzle/public/images/` の踊り子・パンダくろしお・スカイライナー・西武40000系・中央線・名鉄ミュースカイ・桃太郎・ロマンスカーの8枚をWebPとして再利用しました。
