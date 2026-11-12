// One clock drives the train, camera, effects, dialog and fallback playback.
export const REWARD_DURATION = 10000;
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
export function ramp(a,b,n){const t=clamp((n-a)/(b-a));return t*t*(3-2*t);}
export function rewardMoment(milliseconds,shinkansen=false){
  const seconds=clamp(milliseconds,0,REWARD_DURATION)/1000;
  const moving=Math.max(0,seconds-1.1),accelerationTime=3.5,topSpeed=shinkansen?30:24;
  const accelerating=Math.min(moving,accelerationTime);
  const distance=.5*topSpeed/accelerationTime*accelerating**2+topSpeed*Math.max(0,moving-accelerationTime);
  return {seconds,progress:seconds/10,distance,speed:topSpeed*Math.min(1,moving/accelerationTime),
    chapter:seconds<1.1?'anticipation':seconds<3.2?'launch':seconds<7.8?'spectacle':'finale',
    headlights:ramp(.12,.65,seconds),reveal:ramp(2.6,5,seconds),finale:ramp(7.8,9.1,seconds)};
}

export function chapterText(chapter,sceneId){
  if(chapter==='anticipation')return 'ライトが ついた！';
  if(chapter==='launch')return 'しゅっぱーつ！';
  if(chapter==='finale')return 'かっこいいね！';
  return sceneId==='skybridge'?'にじの はしへ！':sceneId==='night'?'でんしゃと すれちがうよ！':'おひさまの なかへ！';
}
