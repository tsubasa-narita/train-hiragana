// Each transparent atlas has cab / middle / reverse cab in three equal rows.
export const CONNECT_MODELS = {
  komachi: { file: 'komachi-carriages.png', series: 'E6', bounds: [[56, 342], [380, 672], [703, 989]] },
  yokosuka: { file: 'yokosuka-carriages.png', series: 'E235', bounds: [[22, 337], [347, 666], [681, 1000]] },
  yamanote: { file: 'yamanote-carriages.png', series: 'E235', bounds: [[16, 343], [347, 671], [677, 1004]] },
  odoriko: { file: 'odoriko-carriages.png', series: 'E257', bounds: [[53, 361], [388, 681], [710, 1002]] },
  hayabusa: { file: 'hayabusa-carriages.png', series: 'E5', bounds: [[62, 350], [387, 664], [696, 983]] },
  kagayaki: { file: 'kagayaki-carriages.png', series: 'E7', bounds: [[40, 331], [370, 660], [696, 989]] },
  saikyo: { file: 'saikyo-carriages.png', series: 'E233', bounds: [[33, 357], [360, 682], [682, 1001]] },
  'shonan-shinjuku': { file: 'shonan-shinjuku-carriages.png', series: 'E233', bounds: [[13, 343], [349, 671], [682, 1005]] },
  nanbu: { file: 'nanbu-carriages.png', series: 'E233', bounds: [[16, 332], [348, 673], [681, 998]] },
  chuo: { file: 'chuo-carriages.png', series: 'E233', bounds: [[31, 338], [362, 671], [689, 999]] },
  'keihin-tohoku': { file: 'keihin-tohoku-carriages.png', series: 'E233', bounds: [[18, 339], [348, 668], [682, 1005]] },
  sobu: { file: 'sobu-carriages.png', series: 'E231', bounds: [[18, 340], [352, 674], [692, 1007]] },
  joban: { file: 'joban-carriages.png', series: 'E531', bounds: [[25, 334], [359, 672], [690, 1002]] },
  keikyu: { file: 'keikyu-carriages.png', series: '1000', bounds: [[17, 368], [377, 695], [716, 1011]] },
  azusa: { file: 'azusa-carriages.png', series: 'E353', bounds: [[93, 372], [390, 662], [684, 959]] },
  hitachi: { file: 'hitachi-carriages.png', series: 'E657', bounds: [[54, 336], [393, 680], [715, 995]] },
  'narita-express': { file: 'narita-express-carriages.png', series: 'E259', bounds: [[70, 359], [386, 668], [695, 981]] },
  skyliner: { file: 'skyliner-carriages.png', series: 'AE', bounds: [[33, 369], [406, 675], [680, 1000]] },
  laview: { file: 'laview-carriages.png', series: '001', bounds: [[54, 369], [401, 693], [720, 1003]] },
};

export function carriageRow(index, length) {
  return index === 0 ? 0 : index === length - 1 ? 2 : 1;
}

// Crop the original atlas in CSS; preserve its source pixels and alpha.
export function spriteStyle(model, row, assembly = false) {
  const [top, bottom] = model.bounds[row], height = bottom - top;
  const reference = Math.max(...model.bounds.map(([start, end]) => end - start));
  return `background-image:url('./assets/connect/${model.file}');background-size:100% ${1024 / height * 100}%;background-position:0 ${top / (1024 - height) * 100}%${assembly ? `;height:${84 * height / reference}px` : ''}`;
}
