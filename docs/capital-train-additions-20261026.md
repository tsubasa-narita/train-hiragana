# 首都圏の追加候補 2026-10-26

元の `TRAINS` 205件と照合し、首都圏で現在運行する、車両と路線の両方を具体的に紹介できる未収録候補を8件選定。既存の一時的な地方候補8件は照合対象から除外した。ID・かな名・車種・色・説明文・地理情報つきの幼児向け紹介文2件は、対応する `.tools/capital-train-candidates-20261026.json` を参照。

| ID | 子ども向け表示名 | 車両・路線 | 重複を避けた選定理由 | 現行車両・写真と路線の一次資料 |
|---|---|---|---|
| `toei-asakusa-5500` | とえいあさくさせん | 都営浅草線5500形 | 既存の京急線カードや京成スカイライナーとは別の、都営浅草線の現行形式。羽田・成田方面への相互直通も首都圏らしい特徴。 | [車両形式図](https://www.kotsu.metro.tokyo.jp/about/koukai/vehicle_outline/model_diagram/)／[路線・車両概要](https://www.kotsu.metro.tokyo.jp/about/service/subway.html)／[浅草線リニューアルと車両写真](https://www.kotsu.metro.tokyo.jp/special/asakusa_renewal/index.html) |
| `toei-mita-6500` | とえいみたせん | 都営三田線6500形 | 既存の南北線カード等とは異なる都営路線の現行主力車。東急目黒線との直通運転を子ども向けの場所情報にできる。 | [車両形式図](https://www.kotsu.metro.tokyo.jp/about/koukai/vehicle_outline/model_diagram/)／[路線・車両概要](https://www.kotsu.metro.tokyo.jp/about/service/subway.html)／[6500形運行開始と日吉への運行範囲](https://www.kotsu.metro.tokyo.jp/pickup_information/news/subway/2022/sub_i_2022051110460_h.html) |
| `toei-shinjuku-10-300` | とえいしんじゅくせん | 都営新宿線10-300形 | 既存の京王線カードとは異なる新宿線の都営車。新宿から千葉県の本八幡まで続く路線が特徴。 | [車両形式図](https://www.kotsu.metro.tokyo.jp/about/koukai/vehicle_outline/model_diagram/)／[路線・車両概要](https://www.kotsu.metro.tokyo.jp/about/service/subway.html)／[都営地下鉄の車両ギャラリー](https://www.kotsu.metro.tokyo.jp/pickup_information/gallery/subway.html) |
| `tx-3000` | つくばえくすぷれす | つくばエクスプレスTX-3000系 | 既存205件にTXの路線・車両カードなし。秋葉原から茨城県つくば市へ、東京・埼玉・千葉・茨城を結ぶ高速通勤線。 | [TX-3000系公式車両ページ（外観写真）](https://www.mir.co.jp/feature/tx-3000/)／[路線概要・経由地・車種](https://www.mir.co.jp/feature/about_tx/index.html) |
| `keio-inokashira-1000` | いのかしらせん | 京王井の頭線1000系 | 既存の京王5000系カードは京王線の別形式。渋谷・下北沢・吉祥寺を結ぶ井の頭線と、その編成ごとに異なる帯色が独自。 | [京王の現有車両図鑑（1000系写真）](https://www.keio.co.jp/keiofan/museum/)／[京王路線図](https://www.keio.co.jp/global/routes/)／[2026年の1000系写真・説明](https://www.keio.co.jp/news/update/news_release/news_release2025/pdf/nr20260210_inokasirasenibento.pdf) |
| `keisei-3000` | けいせいほんせん | 京成電鉄3000形 | 既存のスカイライナーは全席指定の空港特急AE形。3000形は別の通勤型車両で、京成の主力車として路線網を担う。東京モノレール・千葉都市モノレールの既存カードとも別。 | [京成現役車両図鑑・3000形写真](https://www.keisei.co.jp/keisei/keisei_museum/pictbook/)／[車両紹介](https://www.keisei.co.jp/keisei/tetudou/accessj/sharyou.htm)／[京成路線図PDF](https://www.keisei.co.jp/cms/files/keisei/MASTER/0110/Y6GBPH35.pdf) |
| `tokyu-meguro-3020` | とうきゅうめぐろせん | 東急目黒線3020系 | 既存の東横線・田園都市線などの路線カードとは別の目黒線車両。東急新横浜線や相鉄線との直通で首都圏南西部の広がりを伝えられる。 | [東急公式車両紹介・3020系写真](https://www.tokyu.co.jp/railway/trains/01/)／[目黒線の路線・車両](https://www.tokyu.co.jp/railway/train-history/mg/)／[3020系導入資料](https://www.tokyu.co.jp/company/news/pdf/20190326-3.pdf) |
| `jr-sagami-e131-500` | さがみせん | JR東日本相模線E131系500番台 | 既存のJR線カードに相模線なし。茅ケ崎から海老名・橋本を結ぶ郊外路線と、湘南の海を表す青系の現行車両で、東京中心の候補を補う。 | [相模線E131系車両概要・写真](https://www.jreast.co.jp/press/2021/yokohama/20210917_y1.pdf)／[相模線への投入と運行区間](https://www.jreast.co.jp/press/2021/yokohama/20210617_y1.pdf)／[JR東日本のE131系案内](https://www.jreast.co.jp/en/train/local/e131.html) |

候補を選ぶ際は、路線名だけが既存カードにある場合も、同じ会社の別形式というだけで重複扱いにせず、子どもが見分けられる現行車両と固有の運行範囲を確認した。特に京成3000形はスカイライナーと混同しないよう通勤形として記述し、東京モノレールと千葉都市モノレールは既存カードがあるため候補から外した。
