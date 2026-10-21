import { TRAINS } from './data.js';

// Most facts reuse the researched descriptions already shown in the train library.
// Route facts below have their own primary sources; avoid schedules or top speeds.
const ROUTE_FACTS = {
  hayabusa: { text: 'みどりの からだに、ながい おはなが ある しんかんせんだよ。', source: 'https://www.jreast.co.jp/train/shinkan/e5.html' },
  yamanote: { text: 'とうきょうの まちを、ぐるっと いっしゅうする でんしゃだよ。', source: 'https://www.jreast.co.jp/press/2025/tokyo/20250916_to02.pdf' },
  midosuji: { text: 'おおさかを はしっている ちかてつだよ。', source: 'https://subway.osakametro.co.jp/station_guide/index.php' },
  rapit: { text: 'おおさかの なんばと、かんさいくうこうを むすぶ とっきゅうだよ。', source: 'https://www.nankai.co.jp/traffic/express/rapit.html' },
};

export function trainFactText(card) {
  // Scene cards have a learning phrase as their name but still depict this train.
  const train = TRAINS.find(t => t.id === card.id);
  if (!train) throw new Error(`Unknown train fact: ${card.id}`);
  return ROUTE_FACTS[train.id]?.text || train.detail.replace(/[。！!]+$/, '') + '。';
}

export function trainFactSources(card) {
  const train = TRAINS.find(t => t.id === card.id);
  return ROUTE_FACTS[card.id] ? [ROUTE_FACTS[card.id].source] : train?.sources || [];
}
