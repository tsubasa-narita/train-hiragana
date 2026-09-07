# 清音46文字の出題対応

出題する文字は五十音順。44文字は実在する列車・路線・鉄道会社の名前や愛称の先頭を使用します。候補が複数ある文字は、その中の電車だけをランダムに選びます。

| 文字 | 名前・ことばの例 | 位置 | 画像 |
| --- | --- | --- | --- |
| あ | あずさ | 1 | azusa.webp |
| い | いなほ | 1 | inaho.webp |
| う | うえのとうきょうらいん | 1 | ueno-tokyo-story.webp |
| え | えのでん | 1 | enoden.png |
| お | おどりこ | 1 | odoriko.webp |
| か | かがやき | 1 | kagayaki.jpg |
| き | きぬがわ | 1 | kinugawa.webp |
| く | くろしお | 1 | kuroshio.webp |
| け | けいきゅうせん | 1 | keikyu.webp |
| こ | こまち | 1 | komachi.jpg |
| さ | さくら | 1 | sakura.webp |
| し | しおさい | 1 | shiosai-original.webp |
| す | すかいらいなー | 1 | skyliner.webp |
| せ | せいぶせん | 1 | seibu.webp |
| そ | そにっく | 1 | sonic.webp |
| た | たにがわ | 1 | tanigawa-original.webp |
| ち | ちゅうおうせん | 1 | chuo.webp |
| つ | つばさ | 1 | e8_tsubasa.png |
| て | てんりゅうはまなこてつどう | 1 | tenhama.webp |
| と | とき | 1 | toki-original.webp |
| な | なりたえくすぷれす | 1 | narita-express.webp |
| に | にちりん | 1 | nichirin.webp |
| ぬ | ぬまじりけいべんてつどう（昔の鉄道） | 1 | numajiri.webp |
| ね | ねむろほんせん | 1 | nemuro.webp |
| の | のぞみ | 1 | n700s_nozomi.png |
| は | はやぶさ | 1 | hayabusa.jpg |
| ひ | ひたち | 1 | hitachi.webp |
| ふ | ふじかいゆう | 1 | fuji-original.webp |
| へ | へいせいちくほうてつどう | 1 | heisei-chikuho-v2.webp |
| ほ | ほくと | 1 | hokuto.webp |
| ま | まるのうちせん | 1 | marunouchi.webp |
| み | みずほ | 1 | mizuho-original.webp |
| む | むろらんほんせん | 1 | muroran-original.webp |
| め | めいてつ | 1 | meitetsu-v2.webp |
| も | ももたろう | 1 | momotaro.webp |
| や | やまのてせん | 1 | yamanote.jpg |
| ゆ | ゆふいんのもり | 1 | yufuin.webp |
| よ | よこすかせん | 1 | yokosuka.webp |
| ら | らぴーと | 1 | rapit.webp |
| り | りんかいせん | 1 | rinkai-story.webp |
| る | るもいほんせん（昔の鉄道） | 1 | rumoi.webp |
| れ | れっどあろー | 1 | red-arrow-v2.webp |
| ろ | ろまんすかー | 1 | romancecar.webp |
| わ | わかしお | 1 | wakashio-v2.webp |
| を | でんしゃをみる | 5 | dog-train.webp |
| ん | やまのてせん | 6 | yamanote.jpg |

「を」「ん」は先頭が一致する実在名を確認できなかったため例外です。「を」は犬が電車を見る場面の「でんしゃをみる」、「ん」は電車名の途中から出題します。

「ぬ」は1969年廃止の沼尻軽便鉄道、「る」は昔の留萌本線。ゲームの画像に「むかしの てつどう」を表示し、図鑑の説明にも明記します。

45種類の電車それぞれに専用の画像を用意し、「を」の場面と合わせてクイズ用は46枚です。同じ形式が走る列車でも、車両の実際の形や色を保ち、風景・構図を変えて個別に生成しています。運行や外観を確認した出典は [追加車両の出典](prefix-train-sources.md)、新規画像のプロンプトは [画像生成記録](image-generation.md) に記録しています。

## 出題順

- あ行のみ：あ→い→う→え→お。次の旅も「あ」から。
- や行のみ：や→ゆ→よ→や→ゆ。わ行のみ：わ→を→ん→わ→を。
- 複数行・ぜんぶ：選んだ文字を五十音順に並べ、5文字ずつ。完走後の位置を保存し、次回は続きから。最後まで行くと最初に戻ります。
- 途中でホームへ戻ると、その旅は最初からやり直し。行の選択変更で出題位置も最初に戻ります。
- 図鑑からは、その電車名の先頭が属する行の最初から開始。該当文字の番に選んだ電車を出題します。
- 名前の連結は、電車を上記の順で出し、1つの名前の中では文字を左からつなぎます。
