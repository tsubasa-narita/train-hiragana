# 画像デザインレビュー B

レビュー日: 2026-09-07

対象は `src/data.js` の担当列車、共用の `shiosai` / `muroran`、および `src/reward.js` の `REWARD_TRAINS` にある `azusa` / `sakura` / `narita-express` / `marunouchi`。対応するローカル `.webp` を `view_image` で確認し、鉄道会社または車両メーカーの公式ページ・公式写真も実際に確認した。判定は、子どもが列車を認識できなくなるような形式、主要配色、前面形状、混成デザインを重視した。動物、背景、細かなデフォルメ、窓や車両数の省略は判定対象から外した。

## 対応確認

- `src/data.js`: `wakashio`→`wakashio.webp`、`keikyu`→`keikyu.webp`、`sonic`→`sonic.webp`、`nemuro`→`nemuro.webp`、`hitachi`→`hitachi.webp`、`heisei-chikuho`→`heisei-chikuho.webp`、`yufuin`→`yufuin.webp`、`yokosuka`→`yokosuka.webp`、`inaho`→`inaho.webp`、`ueno-tokyo`→`ueno-tokyo-story.webp`、`odoriko`→`odoriko.webp`、`kinugawa`→`kinugawa.webp`、`kuroshio`→`kuroshio.webp`。
- 共用: `shiosai` は `wakashio.webp`、`muroran` は `nemuro.webp`。
- `src/reward.js`: `azusa`→`assets/rewards/reward_azusa.webp`、`sakura`→`assets/rewards/reward_sakura.webp`、`narita-express`→`assets/rewards/reward_narita-express.webp`、`marunouchi`→`assets/rewards/reward_marunouchi.webp`。

## 判定表

| ID | ローカル画像 | 判定 | 画像で確認したこと・実物との差 | 公式の裏取り（写真・図） |
|---|---|---|---|---|
| `wakashio` | `assets/trains/wakashio.webp` | **要修正（親裏取り済み）** | 既存画像は側面の青・白・黄色は読めるが、公式E257-500の前面と比べて、黒が前面の大部分を覆い、下部スカートが青になっている。実車は前面外周・屋根上端・下部スカートが黄色、中央は白〜灰、黒は窓と左右ライト部分。前面配色の差が大きいため、親が `wakashio-v2` を対応中。 | [JR東日本 わかしお・さざなみ](https://www.jreast.co.jp/train/express/wakashio_sazanami.html)、[公式写真（wakashio_sazanami_img02.jpg）](https://www.jreast.co.jp/train/express/img/wakashio_sazanami_img02.jpg) |
| `shiosai` | `assets/trains/shiosai-original.webp`（専用画像） | **OK（専用修正版採用）** | 親が公式写真と専用画像を再確認し、黄色い前面外周・屋根上端・下部スカート、白〜灰の中央、窓と左右ライト部分の黒を確認して採用。側面の青・白・黄色、海辺の風景と動物も維持されている。 | [JR東日本 さざなみ・わかしお・しおさい](https://www.jreast.co.jp/multi/traininformation/sazanami_wakashio/)、[公式写真（wakashio_sazanami_img02.jpg）](https://www.jreast.co.jp/train/express/img/wakashio_sazanami_img02.jpg) |
| `keikyu` | `assets/trains/keikyu.webp` | **OK** | 赤い京急通勤車、銀色の側面、黒い前面窓。京急1000形系の認識に必要な赤基調と前面形状が一致。 | [京急 車両紹介](https://www.keikyu.co.jp/ride/train/)、[公式写真](https://www.keikyu.co.jp/ride/train/img/index_im03.jpg) |
| `sonic` | `assets/trains/sonic.webp` | **OK** | 青いメタリック車体、流線形で尖った前面、大きな黒い前面窓。883系ソニックの特徴と一致。 | [JR九州 883系ソニック](https://www.jrkyushu.co.jp/trains/sonic/)、[公式写真](https://www.jrkyushu.co.jp/trains/trains_img/sonic/pgttl.jpg) |
| `nemuro` | `assets/trains/nemuro.webp` | **OK** | 非電化線を走る1両の銀・白色H100形、緑の帯、黒い前面窓。北海道のH100形として一致。 | [JR北海道 H100形導入資料](https://www.jrhokkaido.co.jp/press/2018/180215-4.pdf)、[H100形の公式写真を含む資料](https://www.jrhokkaido.co.jp/corporate/safe/pdf_07/201806.pdf) |
| `muroran` | `assets/trains/muroran-original.webp`（専用画像） | **OK（専用画像採用）** | H100形は室蘭線で使用される形式。専用画像は銀白色車体・濃い前面窓・緑帯・非電化線路の港湾風景を備え、親が実画像を確認して採用。 | [JR北海道 H100形導入・運用資料](https://www.jrhokkaido.co.jp/CM/Info/press/pdf/20240117_KO_H100.pdf)、[H100形公式写真](https://www.jrhokkaido.co.jp/corporate/safe/pdf_07/201806.pdf) |
| `hitachi` | `assets/trains/hitachi.webp` | **OK** | 白いE657系、マゼンタ〜ピンクの窓帯、丸みのある大きな黒い前面窓。ひたちの主要配色・前面形状と一致。 | [JR東日本 JREメディア E657系](https://media.jreast.co.jp/articles/1775)、[公式写真](https://media-jrenet-jp-image.s3.ap-northeast-1.amazonaws.com/uploads/article_item/webp_image/57320/retina_CE202210-008_%E8%B5%A4%E5%A1%9A_%E5%86%85%E5%8E%9F.webp) |
| `heisei-chikuho` | `assets/trains/heisei-chikuho-v2.webp`（修正版） | **OK（v2採用）** | 旧画像の青赤V字は採用せず、親が実画像を確認。412_01.jpgに合わせたクリーム地、屋根寄りの細い水色線、窓下の細いオレンジ＋赤の水平帯、V字なし、左右角灯・中央表示器・中央貫通扉を確認して採用。 | [平成筑豊鉄道 412形公式ページ](https://www.heichiku.net/tanoshimu/cars/412-2/)、[400形412 開業時カラーの公式写真](https://www.heichiku.net/wp-content/uploads/2020/default/412_01.jpg) |
| `yufuin` | `assets/trains/yufuin.webp` | **OK** | メタリックグリーンの高床・大窓の観光特急、金色の帯。ゆふいんの森の外観特徴と一致。 | [JR九州 ゆふいんの森](https://www.jrkyushu.co.jp/trains/yufuinnomori/index.html/yufuinnomori/index.html)、[公式写真](https://www.jrkyushu.co.jp/trains/trains_img/yufuinnomori/pgttl.jpg) |
| `yokosuka` | `assets/trains/yokosuka.webp` | **OK** | 銀色のE235系1000番台、青・クリームの横帯、青い前面マスクと点状の下部パネル。横須賀線の車両として一致。 | [JREメディア E235系1000番台](https://media.jreast.co.jp/articles/4202)、[公式写真](https://media-jrenet-jp-image.s3.ap-northeast-1.amazonaws.com/uploads/article_item/webp_image/126056/retina_DSC_4871_-_%E3%82%B3%E3%83%94%E3%83%BC_1.webp) |
| `inaho` | `assets/trains/inaho.webp` | **OK** | E653系の白・クリーム車体、オレンジと青系の波形帯、オレンジの前面下部。いなほのデザインコンセプトと一致。 | [JR東日本 いなほ・しらゆき](https://www.jreast.co.jp/train/express/inaho_shirayuki.html)、[公式写真](https://www.jreast.co.jp/train/express/img/inaho_img01.jpg) |
| `ueno-tokyo` | `assets/trains/ueno-tokyo-story.webp` | **OK** | 銀色の近郊型車両にオレンジと緑の帯。E231系1000番台として確認でき、上野東京ラインはE231系・E233系の複数形式が走るため、形式の選択も許容範囲。 | [JREメディア 上野東京ラインの車両](https://media.jreast.co.jp/articles/1704)、[JR東日本 E231系](https://www.jreast.co.jp/train/local/e231.html)、[JR東日本 E233系](https://www.jreast.co.jp/train/local/e233.html) |
| `odoriko` | `assets/trains/odoriko.webp` | **OK** | 白地にペニンシュラブルーの帯、中央貫通扉のある前面はE257系2500番台（5両編成）の特徴として説明可能。2000番台の連続前面窓と異なるため、2000番台写真だけで不一致とは判定しない。 | [JR東日本 踊り子（2000/2500番台）](https://www.jreast.co.jp/multi/traininformation/odoriko/)、[JR東日本公式写真（2000番台）](https://www.jreast.co.jp/train/express/img/odoriko_img01.jpg)、[KATO公式 E257系2000/2500番台（2500番台の車両図）](https://www.katomodels.com/product/n/e257_2000) |
| `kinugawa` | `assets/trains/kinugawa.webp` | **OK** | 白地に赤〜オレンジ系の帯と大きな黒い前面窓を持つ東武100系スペーシアのデビューカラー系として成立。きぬがわはJR253系だけでなく東武100系スペーシアも使用するため、JR253系の赤一色の写真と違うことは不一致ではない。 | [JR東日本 日光・きぬがわ（253系・東武100系）](https://www.jreast.co.jp/multi/traininformation/nikko_kinugawa/)、[東武 スペーシア実車](https://www.tobu.co.jp/railway/special_express/vehicle/spacia/)、[東武公式カラー説明](https://www.tobu.co.jp/railway/wrapping_train/)、[JR253系公式写真](https://www.jreast.co.jp/train/express/img/kinugawa_img01.jpg) |
| `kuroshio` | `assets/trains/kuroshio.webp` | **OK** | パンダの顔を前面に施した白い287系、側面の動物ラッピング、青緑の帯。パンダくろしおの実在ラッピングと一致。 | [JRおでかけネット パンダくろしお](https://www.jr-odekake.net/railroad/kuroshio/pandakuroshio/)、[JR西日本公式説明](https://www.westjr.co.jp/press/article/2017/07/page_10798.html) |

### ごほうび `REWARD_TRAINS`

| ID | ローカル画像 | 判定 | 画像で確認したこと・実物との差 | 公式の裏取り（写真・図） |
|---|---|---|---|---|
| `azusa` | `assets/rewards/reward_azusa.webp` | **OK** | 白・銀色のE353系に紫色の側面帯、黒い大きな前面窓。E353系あずさの主要形状・配色と一致。 | [JR東日本 E353系公式写真](https://www.jreast.co.jp/train/express/img/azusa_kaiji_img01.jpg)、[JR東日本 あずさ・かいじ](https://www.jreast.co.jp/ko/train/express/azusa_kaiji.html) |
| `sakura` | `assets/rewards/reward_sakura.webp` | **OK** | 白〜青白いN700系新幹線、濃青と金色の細い側面帯、長い流線形の鼻。みずほ・さくら用N700系として成立。 | [JR九州 N700系](https://www.jrkyushu.co.jp/trains/700/)、[公式写真](https://www.jrkyushu.co.jp/trains/trains_img/700/pgttl.jpg)、[JR西日本 N700系みずほ・さくら](https://www.westjr.co.jp/fan/paper/shinkansen/) |
| `narita-express` | `assets/rewards/reward_narita-express.webp` | **不確実** | 白・黒・赤のE259系旧塗装としては実在し、形式・前面形状は一致する。ただしJR東日本は2023年以降、銀色を取り入れた新デザインへ順次変更している。画像に旧塗装である説明がないため、現行車両を必須にする場合だけ確認が必要。 | [JR東日本 成田エクスプレス／しおさい](https://www.jreast.co.jp/train/express/nex.html)、[E259系現行デザイン変更資料](https://www.jreast.co.jp/press/2022/20230324_ho05.pdf)、[公式写真](https://www.jreast.co.jp/train/express/img/nex_img01.jpg) |
| `marunouchi` | `assets/rewards/reward_marunouchi.webp` | **OK** | 鮮やかな赤、丸い前面、黒い前面窓、白い波形帯。東京メトロ丸ノ内線2000系として主要配色・前面形状が一致。 | [東京メトロ 丸ノ内線2000系](https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/marunouchi_2000/index.html) |

## 再生成候補

親の追加目視確認により、旧 `wakashio.webp` はE257-500公式写真と比べて前面大部分が黒く、下部スカートが青いことを確認した。実車は前面外周・屋根上端・下部スカートが黄色、中央が白〜灰、黒は窓と左右ライト部分であるため、`wakashio` は親の `wakashio-v2` 確認待ち。

`shiosai` は前面色を修正した専用画像を親が実見して採用OK、`muroran` と `heisei-chikuho` も専用画像・v2を実見して採用OKとした。

`odoriko` と `kinugawa` は、別形式の公式写真だけを見ると不一致に見えるが、それぞれE257系2500番台、東武100系スペーシアとして実在する組み合わせを確認できたため、再生成対象から外した。
