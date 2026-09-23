# 首都圏の特急：追加画像と実車照合（2026年9月）

既存の図鑑・クイズにない現役の特急8種類を追加した。車両の前面形状と車体色は鉄道会社の資料を優先し、各列車に専用の絵を生成した。同一形式を使う別列車は、実車の塗装を変えずに走行地域の景色で区別している。たとえば「ひたち／ときわ」「わかしお／さざなみ」「草津・四万／あかぎ」は同じ形式が使われる。

共通画像指示：組み込みImageGen、横長1536×1024のアニメ・水彩の絵本調、車両を主役にした斜め前からの構図、車窓の小さなクマとうさぎ、実車の前面・帯色を優先、架空のロゴや文字を描かない。

| 図鑑・クイズの名前 | 専用画像 | 車両と照合資料 | 絵に反映した特徴 |
| --- | --- | --- | --- |
| ときわ | `assets/trains/quiz-tokiwa.webp` | [JR東日本・ひたち／ときわ](https://www.jreast.co.jp/multi/traininformation/hitachi/) | E657系。桃色がかった白、窓下の濃い桃色線。梅の景色。 |
| さざなみ | `assets/trains/quiz-sazanami.webp` | [JR東日本・さざなみ／わかしお](https://www.jreast.co.jp/multi/traininformation/sazanami_wakashio/) | E257系。房総の青い海・白い砂・黄色い菜の花を表す塗装。 |
| 湘南 | `assets/trains/quiz-shonan.webp` | [JR東日本・踊り子／湘南](https://www.jreast.co.jp/train/express/odoriko.html) | E257系改造車。ペニンシュラブルーと白の車体。湘南の海辺。 |
| 草津・四万 | `assets/trains/quiz-kusatsu-shima.webp` | [JR東日本・草津・四万／あかぎ](https://www.jreast.co.jp/train/express/akagi.html) | E257系5500番台。白と緑の車体。温泉地の景色。 |
| あかぎ | `assets/trains/quiz-akagi.webp` | [JR東日本・草津・四万／あかぎ](https://www.jreast.co.jp/train/express/akagi.html) | 同じE257系5500番台。赤城山を望む別の絵。 |
| 東武リバティ | `assets/trains/quiz-revaty.webp` | [東武鉄道・リバティ](https://www.tobu.co.jp/railway/special_express/vehicle/revaty/) | 500系。銀色の角ばった車体、青いアクセント。 |
| ロマンスカーGSE | `assets/trains/quiz-romancecar-gse.webp` | [小田急電鉄・GSE 70000形](https://www.odakyu.jp/romancecar/features/line_up/70000/) | ローズバーミリオンの車体、オレンジの帯、前面の大きな一枚窓。 |
| 富士山ビュー特急 | `assets/trains/quiz-fujisan-view.webp` | [富士山麓電気鉄道・富士山ビュー特急](https://www.fujikyu-railway.jp/train/fujisan_view_express.php) | 8500系。朱色の車体と富士山麓の景色。 |

すでに収録されている「あずさ」「かいじ」「ひたち」「成田エクスプレス」「サフィール踊り子」「踊り子」「わかしお」「しおさい」「スカイライナー」「スペーシア」「スペーシアX」「りょうもう」「ラビュー」等は重複追加しない。JR特急「日光」は2026年に253系の新塗装への切替が進行中のため、この回では見送った。S-TRAINや京急ウィング号など座席指定列車は、特急としての扱いを混同しないため今回の対象外とした。
