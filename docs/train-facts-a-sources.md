# 電車紹介文 A の地理情報・出典記録

確認日：2026年10月26日。対象は `TRAINS.slice(0, 52)` の52件。各車両に独立して読める紹介文を2件ずつ用意し、各文に実際に含まれる地名を `places` に記録した。運行区間・停車地・地域の役割は運行会社等の公式資料で確認した。

## 時制と範囲

- 留萌線・沼尻軽便鉄道は「むかし」と過去形で記載。留萌線の深川〜石狩沼田間は2026年3月31日が最終運行日。
- 長距離列車は一部列車の行先を「れっしゃも あるよ」等で示す。貨物・路線車両は固定の始終点を断定せず、運行線区や地域を説明する。
- 各 `places` は本文に文字列として含まれる地域名・駅名・都市名のみ。
- 各車両の2件は、出発・到着地と、別の沿線・区間・役割を組み合わせた異なる紹介文。

## 52車両の紹介文と一次資料

### 1. `hayabusa`

- 1. 「とうきょうから しんはこだてほくとまで、ほっかいどうへ むかう れっしゃも あるよ。」
  - places: `とうきょう`, `しんはこだてほくと`, `ほっかいどう`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/train/shinkansen.html)
- 2. 「とうほくを はしり、せんだいなどから ほっかいどうへ むかう はやぶさも あるよ。」
  - places: `とうほく`, `せんだい`, `ほっかいどう`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/train/shinkansen.html)

### 2. `komachi`

- 1. 「とうきょうから あきたまで、しんかんせんと まちの せんろを はしるよ。」
  - places: `とうきょう`, `あきた`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/shinkan/e6.html)
- 2. 「もりおかから あきたへ、ざいらいせんの せんろにも はいっていくよ。」
  - places: `もりおか`, `あきた`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/shinkan/e6.html)

### 3. `kagayaki`

- 1. 「とうきょうから ふくいの つるがまで、ほくりくを はしるよ。」
  - places: `とうきょう`, `ふくい`, `つるが`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/press/2023/20230830_ho02.pdf)
- 2. 「ながのや とやまを とおって、ほくりくの まちを むすぶよ。」
  - places: `ながの`, `とやま`, `ほくりく`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/press/2023/20230830_ho02.pdf)

### 4. `nozomi`

- 1. 「とうきょうから おおさかを とおり、はかたまで いく れっしゃも あるよ。」
  - places: `とうきょう`, `おおさか`, `はかた`
  - 公式資料: [railway.jr-central.co.jp](https://railway.jr-central.co.jp/nozomi/)
- 2. 「しずおかや なごやを とおって、とうかいと さんようを むすぶよ。」
  - places: `しずおか`, `なごや`, `とうかい`, `さんよう`
  - 公式資料: [railway.jr-central.co.jp](https://railway.jr-central.co.jp/nozomi/)

### 5. `tsubasa`

- 1. 「とうきょうから やまがたや しんじょうへ むかう れっしゃだよ。」
  - places: `とうきょう`, `やまがた`, `しんじょう`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/shinkan/e8.html)
- 2. 「ふくしまから やまがたへ、まちの せんろにも はいっていくよ。」
  - places: `ふくしま`, `やまがた`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/shinkan/e8.html)

### 6. `yamanote`

- 1. 「とうきょうの やまのてせんを、しんじゅくや うえのまで はしるよ。」
  - places: `とうきょう`, `しんじゅく`, `うえの`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/map/pdf/map_tokyo.pdf)
- 2. 「しぶやや いけぶくろを とおり、とうきょうの まちを むすぶよ。」
  - places: `しぶや`, `いけぶくろ`, `とうきょう`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/map/pdf/map_tokyo.pdf)

### 7. `shonan-shinjuku`

- 1. 「うつのみやや たかさきから、しんじゅくを とおって よこはまへ いくよ。」
  - places: `うつのみや`, `たかさき`, `しんじゅく`, `よこはま`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/hitachi_tokiwa/uenotokyoline/pdf/utl_ssl.pdf)
- 2. 「さいたまや おおふなを とおり、かんとうの まちを むすぶよ。」
  - places: `さいたま`, `おおふな`, `かんとう`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/hitachi_tokiwa/uenotokyoline/pdf/utl_ssl.pdf)

### 8. `enoden`

- 1. 「ふじさわから かまくらまで、しょうなんの まちを はしるよ。」
  - places: `ふじさわ`, `かまくら`, `しょうなん`
  - 公式資料: [www.enoden.co.jp](https://www.enoden.co.jp/train/map/)
- 2. 「えのしまの ちかくを とおって、ふじさわと かまくらを むすぶよ。」
  - places: `えのしま`, `ふじさわ`, `かまくら`
  - 公式資料: [www.enoden.co.jp](https://www.enoden.co.jp/train/map/)

### 9. `tsubame`

- 1. 「はかたから くまもとを とおり、かごしまちゅうおうへ むかうよ。」
  - places: `はかた`, `くまもと`, `かごしまちゅうおう`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/trains/800/)
- 2. 「きゅうしゅうしんかんせんで、くまもとや かごしまの まちを むすぶよ。」
  - places: `きゅうしゅう`, `くまもと`, `かごしま`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/trains/800/)

### 10. `azusa`

- 1. 「しんじゅくから ながのの まつもとへ むかう とっきゅうだよ。」
  - places: `しんじゅく`, `ながの`, `まつもと`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/azusa_kaiji/)
- 2. 「やまなしの おおつきや しおじりを とおり、まつもとへ はしるよ。」
  - places: `やまなし`, `おおつき`, `しおじり`, `まつもと`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/azusa_kaiji/)

### 11. `sakura`

- 1. 「しんおおさかから かごしまちゅうおうまで、きゅうしゅうへ はしるよ。」
  - places: `しんおおさか`, `かごしまちゅうおう`, `きゅうしゅう`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/news/__icsFiles/afieldfile/2024/12/13/241213_2025daiya_kaisei_1.pdf)
- 2. 「おかやまや はかたを とおって、ほんしゅうと きゅうしゅうを むすぶよ。」
  - places: `おかやま`, `はかた`, `ほんしゅう`, `きゅうしゅう`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/news/__icsFiles/afieldfile/2024/12/13/241213_2025daiya_kaisei_1.pdf)

### 12. `narita-express`

- 1. 「とうきょうから なりたくうこうまで、ちばを とおって はしるよ。」
  - places: `とうきょう`, `なりたくうこう`, `ちば`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/nex.html)
- 2. 「しんじゅくや よこはまから、なりたくうこうへ むかう れっしゃも あるよ。」
  - places: `しんじゅく`, `よこはま`, `なりたくうこう`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/nex.html)

### 13. `marunouchi`

- 1. 「いけぶくろから とうきょうを とおり、しんじゅくへ はしる ちかてつだよ。」
  - places: `いけぶくろ`, `とうきょう`, `しんじゅく`
  - 公式資料: [www.tokyometro.jp](https://www.tokyometro.jp/station/line_marunouchi/index.html)
- 2. 「おおてまちや あかさかを とおって、とうきょうの まんなかを むすぶよ。」
  - places: `おおてまち`, `あかさか`, `とうきょう`
  - 公式資料: [www.tokyometro.jp](https://www.tokyometro.jp/station/line_marunouchi/index.html)

### 14. `rapit`

- 1. 「なんばから かんさいくうこうまで、おおさかの まちを はしるよ。」
  - places: `なんば`, `かんさいくうこう`, `おおさか`
  - 公式資料: [www.nankai.co.jp](https://www.nankai.co.jp/traffic/express/rapit.html)
- 2. 「なんかいなんばを でて、わかやまの てまえから かんさいくうこうへ むかうよ。」
  - places: `なんば`, `わかやま`, `かんさいくうこう`
  - 公式資料: [www.nankai.co.jp](https://www.nankai.co.jp/traffic/express/rapit.html)

### 15. `wakashio`

- 1. 「とうきょうから ちばの あわかもがわへ むかう とっきゅうだよ。」
  - places: `とうきょう`, `ちば`, `あわかもがわ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/sazanami_wakashio/index.html)
- 2. 「そとぼうせんを はしり、かつうらや あわかもがわへ いくよ。」
  - places: `そとぼうせん`, `かつうら`, `あわかもがわ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/sazanami_wakashio/index.html)

### 16. `keikyu`

- 1. 「しながわから はねだくうこうまで、とうきょうを はしるよ。」
  - places: `しながわ`, `はねだくうこう`, `とうきょう`
  - 公式資料: [www.keikyu.co.jp](https://www.keikyu.co.jp/ride/kakueki/)
- 2. 「よこはまから はねだくうこうへ、かながわの まちも むすぶよ。」
  - places: `よこはま`, `はねだくうこう`, `かながわ`
  - 公式資料: [www.keikyu.co.jp](https://www.keikyu.co.jp/ride/kakueki/)

### 17. `sonic`

- 1. 「はかたから おおいたへ、ふくおかと おおいたの まちを むすぶよ。」
  - places: `はかた`, `おおいた`, `ふくおか`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/trains/sonic/)
- 2. 「こくらを とおって べっぷへ、きゅうしゅうの ほうへ はしるよ。」
  - places: `こくら`, `べっぷ`, `きゅうしゅう`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/trains/sonic/)

### 18. `nemuro`

- 1. 「くしろから ねむろまで、はなさきせんを はしるよ。」
  - places: `くしろ`, `ねむろ`, `はなさきせん`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/corporate/region/pdf/8senku/8_02_leaflet.pdf)
- 2. 「はなさきせんで、あつけしや ねむろの まちを むすぶよ。」
  - places: `はなさきせん`, `あつけし`, `ねむろ`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/corporate/region/pdf/8senku/8_02_leaflet.pdf)

### 19. `hitachi`

- 1. 「とうきょうから みとや いわきへ むかう とっきゅうだよ。」
  - places: `とうきょう`, `みと`, `いわき`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/hitachi_tokiwa.html)
- 2. 「じょうばんせんを はしり、ふくしまや いばらきの まちへ いくよ。」
  - places: `ふくしま`, `いばらき`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/hitachi_tokiwa.html)

### 20. `heisei-chikuho`

- 1. 「のおがたから ゆくはしの ほうへ、ふくおかを はしるよ。」
  - places: `のおがた`, `ゆくはし`, `ふくおか`
  - 公式資料: [www.heichiku.net](https://www.heichiku.net/heichiku/corp/)
- 2. 「ちくほや けいちくの まちを とおり、のおがたと ゆくはしを むすぶよ。」
  - places: `ちくほ`, `けいちく`, `のおがた`, `ゆくはし`
  - 公式資料: [www.heichiku.net](https://www.heichiku.net/heichiku/corp/)

### 21. `yufuin`

- 1. 「はかたから ゆふいんへ、ふくおかと おおいたを むすぶよ。」
  - places: `はかた`, `ゆふいん`, `ふくおか`, `おおいた`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/trains/yufuinnomori/)
- 2. 「ゆふいんの もりを とおって、べっぷや おおいたへ むかう れっしゃも あるよ。」
  - places: `ゆふいん`, `べっぷ`, `おおいた`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/trains/yufuinnomori/)

### 22. `yokosuka`

- 1. 「とうきょうから よこはまを とおり、かまくらへ いけるよ。」
  - places: `とうきょう`, `よこはま`, `かまくら`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/hitachi_tokiwa/uenotokyoline/pdf/utl_ssl.pdf)
- 2. 「よこすかせんで、よこすかや ずしの まちへ はしるよ。」
  - places: `よこすか`, `ずし`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/hitachi_tokiwa/uenotokyoline/pdf/utl_ssl.pdf)

### 23. `inaho`

- 1. 「にいがたから さかたを とおり、あきたへ むかう れっしゃも あるよ。」
  - places: `にいがた`, `さかた`, `あきた`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/inaho_shirayuki.html)
- 2. 「うえつほんせんを はしり、やまがたの しょうないから あきたへ いくよ。」
  - places: `うえつほんせん`, `やまがた`, `しょうない`, `あきた`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/inaho_shirayuki.html)

### 24. `ueno-tokyo`

- 1. 「うえのから とうきょうを とおり、しながわまで いけるよ。」
  - places: `うえの`, `とうきょう`, `しながわ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/eco/report/pdf_2015/p68-71.pdf)
- 2. 「うつのみやや たかさきから、とうきょうや しながわへ はしるよ。」
  - places: `うつのみや`, `たかさき`, `とうきょう`, `しながわ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/eco/report/pdf_2015/p68-71.pdf)

### 25. `odoriko`

- 1. 「とうきょうから いずの しもだや しゅぜんじへ むかうよ。」
  - places: `とうきょう`, `いず`, `しもだ`, `しゅぜんじ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/odoriko.html)
- 2. 「よこはまや あたみを とおって、いずの まちへ はしるよ。」
  - places: `よこはま`, `あたみ`, `いず`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/odoriko.html)

### 26. `kinugawa`

- 1. 「しんじゅくから きぬがわおんせんまで、とうきょうから いけるよ。」
  - places: `しんじゅく`, `きぬがわおんせん`, `とうきょう`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/kinugawa.html)
- 2. 「しもいまいちを とおって、にっこうや きぬがわの ほうへ はしるよ。」
  - places: `しもいまいち`, `にっこう`, `きぬがわ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/express/kinugawa.html)

### 27. `kuroshio`

- 1. 「しんおおさかから わかやまや しらはまへ むかうよ。」
  - places: `しんおおさか`, `わかやま`, `しらはま`
  - 公式資料: [www.jr-odekake.net](https://www.jr-odekake.net/railroad/train/kuroshio/)
- 2. 「きのくにせんを はしり、わかやまから しんぐうへ いく れっしゃも あるよ。」
  - places: `きのくにせん`, `わかやま`, `しんぐう`
  - 公式資料: [www.jr-odekake.net](https://www.jr-odekake.net/railroad/train/kuroshio/)

### 28. `shiosai`

- 1. 「とうきょうから ちばを とおって、ちょうしへ むかうよ。」
  - places: `とうきょう`, `ちば`, `ちょうし`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/sazanami_wakashio/index.html)
- 2. 「そうぶほんせんで、ちばや なりたの まちを とおり ちょうしへ はしるよ。」
  - places: `そうぶほんせん`, `ちば`, `なりた`, `ちょうし`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/sazanami_wakashio/index.html)

### 29. `skyliner`

- 1. 「うえのや にっぽりから、なりたくうこうへ はしるよ。」
  - places: `うえの`, `にっぽり`, `なりたくうこう`
  - 公式資料: [www.keisei.co.jp](https://www.keisei.co.jp/keisei/tetudou/skyliner/jp/skyliner/)
- 2. 「けいせいせんを はしって、とうきょうから ちばの くうこうへ むかうよ。」
  - places: `とうきょう`, `ちば`
  - 公式資料: [www.keisei.co.jp](https://www.keisei.co.jp/keisei/tetudou/skyliner/jp/skyliner/)

### 30. `seibu`

- 1. 「せいぶしんじゅくから ほんかわごえへ、さいたまの ほうへ はしるよ。」
  - places: `せいぶしんじゅく`, `ほんかわごえ`, `さいたま`
  - 公式資料: [www.seiburailway.jp](https://www.seiburailway.jp/railway/reservedtrain/timetable/)
- 2. 「いけぶくろから ちちぶへ、ところざわを とおる とっきゅうも あるよ。」
  - places: `いけぶくろ`, `ちちぶ`, `ところざわ`
  - 公式資料: [www.seiburailway.jp](https://www.seiburailway.jp/railway/reservedtrain/timetable/)

### 31. `tanigawa`

- 1. 「とうきょうから えちごゆざわへ、じょうえつしんかんせんで いくよ。」
  - places: `とうきょう`, `えちごゆざわ`
  - 公式資料: [www.jreast-timetable.jp](https://www.jreast-timetable.jp/2506/train/020/022121.html)
- 2. 「たかさきから みなかみを とおり、ゆきの おおい ぐんまへ はしるよ。」
  - places: `たかさき`, `みなかみ`, `ぐんま`
  - 公式資料: [www.jreast-timetable.jp](https://www.jreast-timetable.jp/2506/train/020/022121.html)

### 32. `chuo`

- 1. 「とうきょうから しんじゅくや たかおを とおり、おおつきへ むかうよ。」
  - places: `とうきょう`, `しんじゅく`, `たかお`, `おおつき`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/press/2024/hachioji/20241213_hc01.pdf)
- 2. 「ちゅうおうせんで、はちおうじや やまなしの ほうへ はしるよ。」
  - places: `はちおうじ`, `やまなし`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/press/2024/hachioji/20241213_hc01.pdf)

### 33. `tenhama`

- 1. 「かけがわから しんじょはらまで、しずおかを はしるよ。」
  - places: `かけがわ`, `しんじょはら`, `しずおか`
  - 公式資料: [www.tenhama.co.jp](https://www.tenhama.co.jp/about/history/)
- 2. 「てんりゅうや はまなこを とおり、しずおかの まちを むすぶよ。」
  - places: `てんりゅう`, `はまなこ`, `しずおか`
  - 公式資料: [www.tenhama.co.jp](https://www.tenhama.co.jp/about/history/)

### 34. `toki`

- 1. 「とうきょうから にいがたまで、じょうえつしんかんせんで いくよ。」
  - places: `とうきょう`, `にいがた`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/shinkan/e7.html)
- 2. 「たかさきや えちごゆざわを とおって、にいがたへ はしるよ。」
  - places: `たかさき`, `えちごゆざわ`, `にいがた`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/train/shinkan/e7.html)

### 35. `nichirin`

- 1. 「おおいたから みやざきへ、きゅうしゅうの ひがしを はしるよ。」
  - places: `おおいた`, `みやざき`, `きゅうしゅう`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/trains/sp/otherexpress/)
- 2. 「べっぷや のべおかを とおり、みやざきの まちへ むかうよ。」
  - places: `べっぷ`, `のべおか`, `みやざき`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/trains/sp/otherexpress/)

### 36. `numajiri`

- 1. 「むかし、ふくしまの かわげたと ぬまじりを むすび、いおうや ひとを はこんだよ。」
  - places: `ふくしま`, `ぬまじり`
  - 公式資料: [www.gimu.fks.ed.jp](https://www.gimu.fks.ed.jp/plugin/databases/detail/2/18/234)
- 2. 「むかし、いなわしろから ぬまじりへ、おんせんへ いく ひとも はこんだよ。」
  - places: `いなわしろ`, `ぬまじり`
  - 公式資料: [www.gimu.fks.ed.jp](https://www.gimu.fks.ed.jp/plugin/databases/detail/2/18/234)

### 37. `fuji`

- 1. 「しんじゅくから かわぐちこまで、やまなしへ むかうよ。」
  - places: `しんじゅく`, `かわぐちこ`, `やまなし`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/azusa_kaiji/)
- 2. 「おおつきを とおり、ふじさんの ちかくの かわぐちこへ はしるよ。」
  - places: `おおつき`, `ふじさん`, `かわぐちこ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/azusa_kaiji/)

### 38. `hokuto`

- 1. 「さっぽろから はこだてまで、ほっかいどうを はしる とっきゅうだよ。」
  - places: `さっぽろ`, `はこだて`, `ほっかいどう`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/train/tr003_01.html)
- 2. 「なんぼくせんを とおり、ちとせや とまこまいから はこだてへ むかうよ。」
  - places: `ちとせ`, `とまこまい`, `はこだて`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/train/tr003_01.html)

### 39. `mizuho`

- 1. 「しんおおさかから かごしまちゅうおうまで、しんかんせんで いけるよ。」
  - places: `しんおおさか`, `かごしまちゅうおう`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/railway/netyoyaku/route/kagoshima_osaka/)
- 2. 「おかやまや はかたを とおり、ほんしゅうから きゅうしゅうへ はしるよ。」
  - places: `おかやま`, `はかた`, `ほんしゅう`, `きゅうしゅう`
  - 公式資料: [www.jrkyushu.co.jp](https://www.jrkyushu.co.jp/railway/netyoyaku/route/kagoshima_osaka/)

### 40. `muroran`

- 1. 「むろらんせんで、おしゃまんべから とまこまいの ほうへ はしるよ。」
  - places: `むろらんせん`, `おしゃまんべ`, `とまこまい`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/CM/Info/press/pdf/20240117_KO_H100.pdf)
- 2. 「とうやや むろらんを とおって、ほっかいどうの まちを むすぶよ。」
  - places: `とうや`, `むろらん`, `ほっかいどう`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/CM/Info/press/pdf/20240117_KO_H100.pdf)

### 41. `meitetsu`

- 1. 「なごやから ちゅうぶこくさいくうこうまで、あいちを はしるよ。」
  - places: `なごや`, `ちゅうぶこくさいくうこう`, `あいち`
  - 公式資料: [www.meitetsu.co.jp](https://www.meitetsu.co.jp/train/centrair/guidance/index.html)
- 2. 「かなやまや じんぐうまえを とおって、なごやと くうこうを むすぶよ。」
  - places: `かなやま`, `じんぐうまえ`, `なごや`
  - 公式資料: [www.meitetsu.co.jp](https://www.meitetsu.co.jp/train/centrair/guidance/index.html)

### 42. `momotaro`

- 1. 「とうかいどうせんや さんようせんで、とうきょうから こうべの ほうへ はしるよ。」
  - places: `とうかいどうせん`, `さんようせん`, `とうきょう`, `こうべ`
  - 公式資料: [www.jrfreight.co.jp](https://www.jrfreight.co.jp/service/improvement/development.html)
- 2. 「おかやまや ひろしまの せんろで、にもつの れっしゃを ひくよ。」
  - places: `おかやま`, `ひろしま`
  - 公式資料: [www.jrfreight.co.jp](https://www.jrfreight.co.jp/service/improvement/development.html)

### 43. `rinkai`

- 1. 「しんきばから おおさきまで、とうきょうの りんかいぶを はしるよ。」
  - places: `しんきば`, `おおさき`, `とうきょう`
  - 公式資料: [www.twr.co.jp](https://www.twr.co.jp/enterprise/tabid/202/Default.aspx)
- 2. 「おだいばや てんのうずを とおって、とうきょうの うみべを むすぶよ。」
  - places: `おだいば`, `てんのうず`, `とうきょう`
  - 公式資料: [www.twr.co.jp](https://www.twr.co.jp/enterprise/tabid/202/Default.aspx)

### 44. `rumoi`

- 1. 「むかし、ふかがわから いしかりぬまたまで、ほっかいどうを はしったよ。」
  - places: `ふかがわ`, `いしかりぬまた`, `ほっかいどう`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/CM/Info/press/pdf/20260318_KO_rumoi.pdf)
- 2. 「むかし、ちっぷべつや ぬまたを とおり、ふかがわへ ひとを はこんだよ。」
  - places: `ちっぷべつ`, `ぬまた`, `ふかがわ`
  - 公式資料: [www.jrhokkaido.co.jp](https://www.jrhokkaido.co.jp/CM/Info/press/pdf/20260318_KO_rumoi.pdf)

### 45. `red-arrow`

- 1. 「せいぶしんじゅくから ほんかわごえまで、とっきゅうが はしるよ。」
  - places: `せいぶしんじゅく`, `ほんかわごえ`
  - 公式資料: [www.seiburailway.jp](https://www.seiburailway.jp/cs/faq/reservedtrain/)
- 2. 「たかだのばばや ところざわを とおって、さいたまの かわごえへ むかうよ。」
  - places: `たかだのばば`, `ところざわ`, `さいたま`
  - 公式資料: [www.seiburailway.jp](https://www.seiburailway.jp/cs/faq/reservedtrain/)

### 46. `romancecar`

- 1. 「むかし、しんじゅくから かながわの はこねゆもとまで はしる ろまんすかーが あったよ。」
  - places: `しんじゅく`, `はこねゆもと`, `かながわ`
  - 公式資料: [www.odakyu.jp](https://www.odakyu.jp/romancecar/charges/)
- 2. 「むかし、かながわの おだわらを とおって、はこねへ ひとを はこんだよ。」
  - places: `おだわら`, `えのしま`, `ごてんば`
  - 公式資料: [www.odakyu.jp](https://www.odakyu.jp/romancecar/charges/)

### 47. `oimachi`

- 1. 「おおいまちから みぞのくちまで、とうきゅうせんが はしるよ。」
  - places: `おおいまち`, `みぞのくち`
  - 公式資料: [www.tokyu.co.jp](https://www.tokyu.co.jp/railway/om/)
- 2. 「じゆうがおかや ふたこたまがわを とおって、とうきょうと かわさきを むすぶよ。」
  - places: `じゆうがおか`, `ふたこたまがわ`, `とうきょう`, `かわさき`
  - 公式資料: [www.tokyu.co.jp](https://www.tokyu.co.jp/railway/om/)

### 48. `kaiji`

- 1. 「しんじゅくから やまなしの こうふまで、とっきゅうが はしるよ。」
  - places: `しんじゅく`, `やまなし`, `こうふ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/azusa_kaiji/)
- 2. 「はちおうじや おおつきを とおって、こうふの まちへ むかうよ。」
  - places: `はちおうじ`, `おおつき`, `こうふ`
  - 公式資料: [www.jreast.co.jp](https://www.jreast.co.jp/multi/traininformation/azusa_kaiji/)

### 49. `sunrise`

- 1. 「とうきょうから おかやまを とおり、いずもしまで よるに はしるよ。」
  - places: `とうきょう`, `おかやま`, `いずもし`
  - 公式資料: [www.jr-odekake.net](https://www.jr-odekake.net/train/sunriseseto_izumo/index.html)
- 2. 「しずおかや ひめじを とおって、とうきょうと いずもしを むすぶよ。」
  - places: `しずおか`, `ひめじ`, `とうきょう`, `いずもし`
  - 公式資料: [www.jr-odekake.net](https://www.jr-odekake.net/train/sunriseseto_izumo/index.html)

### 50. `shimakaze`

- 1. 「おおさかなんばや なごやから、いせや しまへ むかうよ。」
  - places: `おおさかなんば`, `なごや`, `いせ`, `しま`
  - 公式資料: [www.kintetsu.co.jp](https://www.kintetsu.co.jp/senden/shimakaze/about/)
- 2. 「きょうとから いせしや かしこじまへ、かんさいを はしるよ。」
  - places: `きょうと`, `いせし`, `かしこじま`
  - 公式資料: [www.kintetsu.co.jp](https://www.kintetsu.co.jp/senden/shimakaze/about/)

### 51. `spacia-x`

- 1. 「あさくさから にっこうや きぬがわへ、とうきょうから むかうよ。」
  - places: `あさくさ`, `にっこう`, `きぬがわ`
  - 公式資料: [www.tobu.co.jp](https://www.tobu.co.jp/spaciax/fun/)
- 2. 「とうぶにっこうや きぬがわおんせんへ、とうきょうと とちぎを むすぶよ。」
  - places: `とうぶにっこう`, `きぬがわおんせん`, `とうきょう`, `とちぎ`
  - 公式資料: [www.tobu.co.jp](https://www.tobu.co.jp/spaciax/fun/)

### 52. `chiyoda`

- 1. 「よよぎうえはらから きたあやせまで、とうきょうの ちかてつだよ。」
  - places: `よよぎうえはら`, `きたあやせ`, `とうきょう`
  - 公式資料: [www.tokyometro.jp](https://www.tokyometro.jp/station/line_chiyoda/index.html)
- 2. 「おだきゅうせんに つながり、せたがやや かながわの ほうへ はしるよ。」
  - places: `せたがや`, `かながわ`
  - 公式資料: [www.tokyometro.jp](https://www.tokyometro.jp/station/line_chiyoda/index.html)
