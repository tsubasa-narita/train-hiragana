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
};

export function carriageRow(index, length) {
  return index === 0 ? 0 : index === length - 1 ? 2 : 1;
}

// Crop the original atlas in CSS; preserve its source pixels and alpha.
export function spriteStyle(model, row) {
  const [top, bottom] = model.bounds[row], height = bottom - top;
  return `background-image:url('./assets/connect/${model.file}');background-size:100% ${1024 / height * 100}%;background-position:0 ${top / (1024 - height) * 100}%`;
}
