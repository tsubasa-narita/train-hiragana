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
| dog-train.png | 犬が京急線を見る場面。「ぬ」「を」を学ぶ言葉に使用 |

## ごほうび用の保存先（5枚）

すべてプロジェクト内 `assets/rewards/` に保存しています。

- reward_azusa.png
- reward_sakura.png
- reward_narita-express.png
- reward_marunouchi.png
- reward_rapit.png
