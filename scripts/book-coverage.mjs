import { readFile, writeFile } from 'node:fs/promises';
import { TRAINS } from '../src/data.js';
import { BOOK_TRAINS } from '../src/book-trains.js';

const existing = {
  'かがやき':'kagayaki', 'かもめ':'kamome', 'こまち':'komachi', 'たにがわ':'tanigawa',
  'つばさ':'tsubasa', 'つばめ':'tsubame', 'とき':'toki', 'ドクターイエロー':'doctor-yellow',
  'のぞみ':'nozomi', 'はやぶさ':'hayabusa', 'みずほ':'mizuho', 'やまびこ':'yamabiko',
  'あずさ':'azusa', 'いなほ':'inaho', 'くろしお':'kuroshio', 'サフィール踊り子':'saphir-odoriko',
  'サンダーバード':'thunderbird', 'しまかぜ':'shimakaze', 'スカイライナー':'skyliner',
  'スペーシア':'spacia', 'はるか':'haruka', 'ひのとり':'hinotori', 'ミュースカイ':'mu-sky',
  'ラピート':'rapit', 'ラビュー':'laview', 'リバティけごん':'revaty', 'ロマンスカー':'romancecar-gse',
  'わかしお':'wakashio', '成田エクスプレス':'narita-express', '北斗':'hokuto',
  'TWILIGHT EXPRESS 瑞風':'twilight-mizukaze', 'カシオペア紀行':'cassiopeia',
  'サンライズ瀬戸・出雲':'sunrise', '富士山ビュー特急':'fujisan-view',
  'JR山手線':'yamanote', 'JR大阪環状線':'osaka-loop', '京王線':'keio-5000',
  '京急線':'keikyu', '銀座線':'ginza', '江ノ電':'enoden', '阪急京都線':'hankyu',
  '相鉄線':'sotetsu', '東急田園都市線':'dennentoshi', 'ニューシャトル':'newshuttle',
  'ゆりかもめ':'yurikamome', '湘南モノレール':'shonan-monorail',
  '貨物列車':'momotaro', '電気機関車':'momotaro', 'ラッセル車':'russell-snowplow',
};
const content = await readFile('docs/book-trains-441533217X.md', 'utf8');
const names = [...content.matchAll(/^- (.+)$/gm)].map(match => match[1].trim());
const rows = names.map(name => {
  const added = BOOK_TRAINS.find(train => train.bookName === name);
  const train = added || TRAINS.find(train => train.id === existing[name]);
  if (!train) throw new Error(`Unmapped book entry: ${name}`);
  return `|${name}|${added ? '新規' : '既存対応'}|${train.name}|${train.image}|`;
});
if (names.length !== 134) throw new Error(`Expected 134 public names, got ${names.length}`);
const text = `# 公開収録名とアプリの対応表\n\n[出版社の公開目次](https://www.seibidoshuppan.co.jp/product/9784415332178)で確認できた134名称を照合。追加${BOOK_TRAINS.length}項目、既存対応${names.length - BOOK_TRAINS.length}項目。ごほうびは別途10種類追加。\n\n書籍の全199種類の写真・形式一覧は未公開のため、ここで網羅した範囲は公開目次の名称。路線は実在する代表形式で表現し、同じ列車名の全形式を追加したという意味ではない。「貨車」「オープンデッキ車両」などは担当記録の代表例。「貨物列車」「電気機関車」は既存のEF210桃太郎の絵に対応。阪急京都線は既存の阪急の代表絵に対応。\n\n生成・実車照合記録：[新幹線と特急](book-express-sources.md)、[観光列車A](book-tourist-a-sources.md)、[観光列車B](book-tourist-b-sources.md)、[路線・働く車両](book-local-work-sources.md)、[ごほうび10種類](book-reward-sources.md)。\n\n|公開収録名|対応|アプリの名前|画像|\n|---|---|---|---|\n${rows.join('\n')}\n`;
await writeFile('docs/book-expansion-coverage.md', text);
console.log(`Mapped all ${names.length} public book entries.`);
