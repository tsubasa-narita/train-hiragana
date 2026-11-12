// Reserve one possible movie without consuming its shuffle entry. Only its CPU
// data is prepared during the quiz; no hidden WebGL context or animation runs.
function scheduleIdle(callback){
  // Let the question picture and spoken prompt start before requesting 3D.
  const token={timer:null,idle:null};
  token.timer=setTimeout(()=>{
    token.timer=null;
    if(globalThis.requestIdleCallback)token.idle=requestIdleCallback(callback,{timeout:1500});
    else callback();
  },750);
  return token;
}
function cancelIdle(token){
  if(!token)return;
  if(token.timer!=null)clearTimeout(token.timer);
  if(token.idle!=null)globalThis.cancelIdleCallback?.(token.idle);
}

export function createRewardPreloader({preview,claim,load=()=>import('./reward3d.js'),schedule=scheduleIdle,cancel=cancelIdle}){
  let reservation,job;
  return {
    warm(){
      reservation??=preview();
      if(job)return reservation;
      const current={plan:reservation,token:null};job=current;
      current.token=schedule(()=>{
        current.token=null;
        current.promise=Promise.resolve().then(load).then(module=>module.prepareReward3D?.(current.plan)).then(success=>{
          if(success===false&&job===current)job=undefined;
        }).catch(()=>{if(job===current)job=undefined;});
      });
      return reservation;
    },
    take(){
      const plan=reservation;reservation=undefined;
      // Pending network/CPU work may safely finish into the shared immutable
      // cache. A callback which has not started need not run after the reveal.
      if(job?.token!=null)cancel(job.token);
      job=undefined;
      return claim(plan);
    },
  };
}
