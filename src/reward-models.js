import { REWARD_MODEL_ASSETS } from './reward-model-assets.js';
export { REWARD_MODEL_ASSETS };
export function rewardModelMarkup(train) {
  const model = REWARD_MODEL_ASSETS[train.id];
  if (!model) return '';
  const { width, height, bounds: [left, top, right, bottom] } = model;
  const w = right - left, h = bottom - top;
  const x = width === w ? 0 : left / (width - w) * 100;
  const y = height === h ? 0 : top / (height - h) * 100;
  return `<div class="reward-runner reward-model" role="img" aria-label="${train.name}" data-train-design="${train.id}" style="--model-ratio:${w}/${h};background-image:url('./assets/rewards/sideview/${model.file}');background-size:${width / w * 100}% ${height / h * 100}%;background-position:${x}% ${y}%"></div>`;
}
