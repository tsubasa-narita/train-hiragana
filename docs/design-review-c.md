# 列車画像デザインレビュー C

レビュー日: 2026-09-07

## 対象と方法

`src/data.js` の指定13列車、`QUIZ_CARDS` で `keikyu` から画像を差し替えている `dog-train.webp`、`src/reward.js` の指定3報酬を対象にした。対応ファイルをソースで確認し、対象画像は `view_image` で実際に確認した。照合先は鉄道会社・自治体・博物館の公式ページまたは公式掲載写真・資料とし、公式写真もブラウザで実際に目視した。

判定は、列車名から子どもが実車を認識するために必要な形式、主な配色、特徴的な前面形状を基準にした。動物、風景、窓や車両数の省略は判定から除外した。`OK` は主要な識別要素が合っているもの、`要修正` は大きな配色・前面形状・混成デザインの相違、`不確実` は公式写真で外観を十分に確認できないものとする。

## 途中共有する要修正候補

- `meitetsu.webp` / `めいてつ`: ミュースカイ2000系の前面は合っているが、側面の長い赤帯が公式の白・青塗装にない。赤帯を含む架空の混成デザインに見える。公式写真: [名鉄2000系・ミュースカイ](https://www.meitetsu.co.jp/library/rolling_stock/detail_exp/__icsFiles/afieldfile/2021/06/24/library_rolling_stock_2000.jpg)
- `red-arrow.webp` / `れっどあろー`: 実車の西武10000系レッドアローの平たく立った前面に対し、画像は大きく傾斜した流線型のくさび形前面。公式写真: [西武10000系](https://www.seiburailway.jp/railway/encyclopedia/10000/images/series-10000.jpg)
- `reward_rapit.webp` / `らぴーと`: 青い車体と楕円窓は合っているが、前面中央の太い白い縦帯と淡色の下部帯が公式写真にない。公式写真: [南海50000系ラピート](https://www.nankai.co.jp/sites/default/files/2022-07/50000_3_0.jpg)

## 全対象の判定

| id / 用途 | ソース上の画像 | 判定 | 画像で確認した特徴と実車との差 | 裏取り用の公式URL・該当写真 |
|---|---|---|---|---|
| `skyliner` | `assets/trains/skyliner.webp` | **OK** | 先頭の白い車体に青い大きな風の帯、尖った流線型前面が京成スカイライナーの識別要素と一致。動物・風景はデフォルメ。 | [京成スカイライナー公式ページ](https://www.keisei.co.jp/keisei/tetudou/skyliner/us/skyliner/index.php) / [公式外観写真 photo_skyliner.jpg](https://www.keisei.co.jp/keisei/tetudou/skyliner/us/assets/images/skyliner/index/photo_skyliner.jpg) |
| `seibu` | `assets/trains/seibu.webp` | **OK** | 白い車体、前面の濃い窓と青緑の帯が西武40000系の前面・側面配色と一致。 | [西武40000系公式図鑑](https://www.seiburailway.jp/railway/encyclopedia/40000/index.html) / [40000系写真 zukan-40000_2.jpg](https://www.seiburailway.jp/railway/encyclopedia/40000/images/zukan-40000_2.jpg) |
| `chuo` | `assets/trains/chuo.webp` | **OK** | 銀色の車体、側面のオレンジ帯、広い黒い運転室窓がJR東日本E233系中央線と一致。 | [JR東日本E233系公式ページ](https://www.jreast.co.jp/train/local/e233.html) / [E233系写真 e233_img01.jpg](https://www.jreast.co.jp/train/local/img/e233_img01.jpg) |
| `tenhama` | `assets/trains/tenhama.webp` | **OK** | 白い単行気動車、平たい前面の中央扉、オレンジ・緑・青の横帯が天竜浜名湖鉄道TH2100形の特徴と一致。 | [天竜浜名湖鉄道公式「乗り方」](https://www.tenhama.co.jp/about/geton/) / [TH2100形写真 pho01.jpg](https://www.tenhama.co.jp/wp-content/uploads/pho01.jpg) |
| `nichirin` | `assets/trains/nichirin.webp` | **OK** | 暗いグレーの787系らしい角のある流線型前面と細い帯。JR九州公式が787系を「にちりん・きりしま」と掲載しており、車両形式と列車名の対応も合う。 | [JR九州公式車両紹介](https://www.jrkyushu.co.jp/train/kids/guardian/train_equipment/) / [787系写真 img_787.png](https://www.jrkyushu.co.jp/train/kids/guardian/train_equipment/img/train_pht/img_787.png) |
| `numajiri` | `assets/trains/numajiri.webp` | **OK** | 縦格子の前面を持つ小型ディーゼル機関車と木造客車。画像の説明どおり歴史上の沼尻軽便鉄道の編成で、現代車両との取り違えはない。 | [猪苗代町公式資料（PDF）](https://www.town.inawashiro.fukushima.jp/uploaded/attachment/3249.pdf) / **PDF p.2 の沼尻軽便鉄道の機関車・客車写真**、[猪苗代町の展示案内](https://www.inawashiro.or.jp/information/5204/) |
| `hokuto` | `assets/trains/hokuto.webp` | **OK** | 白いキハ261系の前面、中央の黄色い扉・前面部、紫と青の側面帯が特急北斗の公式写真と一致。 | [JR北海道キハ261系・北斗](https://www.jrhokkaido.co.jp/train/tr003_01.html) / [公式写真 tr003.jpg](https://www.jrhokkaido.co.jp/train/img/main/tr003.jpg) |
| `meitetsu` | `assets/trains/meitetsu.webp` | **要修正** | 前面の `μSKY`、青い前面下部、白い車体は2000系に合う。一方、側面中央を長く走る赤帯と赤・青の混在帯は公式2000系の白・青塗装にない。列車名の中心車両に架空の混成デザインが入っている。 | [名鉄2000系公式ページ](https://www.meitetsu.co.jp/library/rolling_stock/detail_exp/2000.html) / [2000系 μSky公式写真](https://www.meitetsu.co.jp/library/rolling_stock/detail_exp/__icsFiles/afieldfile/2021/06/24/library_rolling_stock_2000.jpg) |
| `momotaro` | `assets/trains/momotaro.webp` | **OK** | 青いEF210形の電気機関車、白い前面部と黄色い細帯、貨物コンテナ、`ECO-POWER 桃太郎` の表示が実車の識別要素と一致。 | [JR貨物「車両の開発について」](https://www.jrfreight.co.jp/service/improvement/development.html) / **ページ内「EF210形式 ECO-POWER桃太郎」の写真 img_02.jpg**: [公式写真](https://www.jrfreight.co.jp/images/%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E6%A1%88%E5%86%85/%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E5%90%91%E4%B8%8A%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E5%8F%96%E7%B5%84%E3%81%BF/%E8%BB%8A%E4%B8%A1%E3%81%AE%E9%96%8B%E7%99%BA%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6/img_02.jpg) |
| `rinkai` | `assets/trains/rinkai-story.webp` | **OK** | 銀色の長い通勤車、広い黒い前面窓、青・水色の側面帯が東京臨海高速鉄道70-000形の識別要素と一致。 | [りんかい線公式車両紹介](https://www.twr.co.jp/route/tabid/144/Default.aspx) / [車両写真 vehicle_img.jpg](https://www.twr.co.jp/Portals/0/resources/safety/img/vehicle_img.jpg) |
| `rumoi` | `assets/trains/rumoi.webp` | **OK** | 銀色の単行気動車に赤い横帯、前面中央扉と上部の灯具配置。留萌線で使われたキハ54の公式写真と一致。`historical: true` の過去路線説明とも整合。 | [JR北海道地域情報・留萌線](https://www.jrhokkaido.co.jp/corporate/region/current.html) / [キハ54写真 ph.jpg](https://www.jrhokkaido.co.jp/corporate/region/img/current/ph.jpg) |
| `red-arrow` | `assets/trains/red-arrow.webp` | **要修正** | 赤い帯と銀・白の車体だけはレッドアローを連想できるが、画像の先頭は赤い屋根から急に傾斜する大きな流線型くさび形で、実車10000系の平たく立った丸みのある前面・広い正面窓と異なる。主要前面形状の相違。 | [西武10000系公式図鑑](https://www.seiburailway.jp/railway/encyclopedia/10000/) / [10000系レッドアロー写真 series-10000.jpg](https://www.seiburailway.jp/railway/encyclopedia/10000/images/series-10000.jpg) / [西武キッズ図鑑](https://www.seiburailway.jp/railways/kids/museum/zukan/10000/) |
| `romancecar` | `assets/trains/romancecar.webp` | **OK** | 赤・クリーム色、先頭上部に持ち上がった展望席、前面窓の配置が小田急3100形NSEの歴代ロマンスカーと一致。`むかしの しゃりょう` の説明があり、現行車両との混同を避けている。 | [ロマンスカーミュージアム・ロマンスカーギャラリー](https://www.odakyu.jp/romancecarmuseum/floor/romancecar-gallery/) / [3100形NSE写真 img_02.jpg](https://www.odakyu.jp/romancecarmuseum/floor/romancecar-gallery/img/img_02.jpg) |
| `dog-train`（京急線 scene） | `assets/trains/dog-train.webp` | **OK** | 赤い車体、窓まわりの白帯、広い黒い前面窓、赤い通勤車の前面が京急1000形ステンレス車の公式写真と合う。犬、風景、車両数の省略は対象外。 | [京急の電車紹介](https://www.keikyu.co.jp/ride/train/) / **1000形（ステンレス車）写真 index_im03.jpg**: [公式写真](https://www.keikyu.co.jp/ride/train/img/index_im03.jpg) |
| `rapit`（ごほうび） | `assets/rewards/reward_rapit.webp` | **要修正** | 青い車体、丸い楕円窓、前面の丸みは南海50000系ラピートに合う。一方、前面中央を屋根から下まで走る太い白い縦帯と、車体下部を広く覆う淡色帯は、公式写真のほぼ青一色で暗い前面窓を囲む実車と異なる。識別要素に関わるため要修正。 | [南海特急ラピート公式ページ](https://www.nankai.co.jp/traffic/express/rapit.html) / [50000系正面写真 50000_3_0.jpg](https://www.nankai.co.jp/sites/default/files/2022-07/50000_3_0.jpg) / [側面・前面写真 mv_rapit_pc.jpg](https://www.nankai.co.jp/sites/default/files/2022-06/mv_rapit_pc.jpg) |
| `yamanote`（ごほうび） | `assets/rewards/reward_train_yamanote.png` | **OK** | 銀色のE235系に黄緑色の前面枠・扉・帯、黒い前面窓。山手線の公式写真と主要配色・前面が一致。 | [JR東日本E235系公式ページ](https://www.jreast.co.jp/train/local/e235.html) / [E235系写真 e235_img01.jpg](https://www.jreast.co.jp/train/local/img/e235_img01.jpg) |
| `doctor-yellow`（ごほうび） | `assets/rewards/reward_train_doctor_yellow.png` | **OK** | 黄色い923系に青い横帯、丸みのある長い検測車先頭部とパンタグラフ。JR東海公式PDF p.1のドクターイエロー写真と主要外観が一致。 | [JR東海公式「ドクターイエロー（T4編成）引退に伴うイベント等」](https://jr-central.co.jp/news/release/_pdf/000043982.pdf) / **PDF p.1 写真「ドクターイエロー」** |

## 結論

要修正候補は `meitetsu.webp`、`red-arrow.webp`、`assets/rewards/reward_rapit.webp` の3点。その他14点は、細かなデフォルメを除けば、確認した公式写真と形式・主配色・前面形状の主要部分が合っている。今回の対象では、公式写真を目視できず判定を保留した `不確実` はない。画像生成・既存画像・コード・共通ドキュメント・gitの変更は行っていない。
