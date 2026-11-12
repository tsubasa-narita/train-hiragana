const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    await context.addInitScript(()=>{
      localStorage.setItem('train-hiragana-v1',JSON.stringify({sound:false,rows:['あ']}));
      localStorage.setItem('train-reward-cinema-bag-v2',JSON.stringify({bag:['skybridge:hayabusa'],last:null}));
      window.rewardContexts=0;
      const getContext=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(kind,...args){if(kind==='webgl'||kind==='webgl2')window.rewardContexts++;return getContext.call(this,kind,...args);};
    });
    const page=await context.newPage(),requests=[],errors=[];
    page.on('request',request=>{if(/\/reward3d\/.*\.(glb|hdr)$/.test(request.url()))requests.push(request.url());});
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(process.env.TEST_URL||'http://127.0.0.1:4180/');
    assert.equal(requests.length,0,'the home page does not fetch the entire 3D library');
    const saved=await page.evaluate(()=>localStorage.getItem('train-reward-cinema-bag-v2'));
    await page.locator('[data-action="start-find"]').click();
    await page.waitForResponse(response=>response.url().endsWith('hayabusa.glb'));
    // Join the real idle-started job; this also waits for its CPU preparation.
    await page.evaluate(async()=>{
      const r=await import('./src/reward.js'),plan=r.preloadTrainReward(),m=await import('./src/reward3d.js');
      await m.prepareReward3D(plan);
    });
    assert.deepEqual(requests.map(url=>url.split('/').pop()).sort(),['hayabusa.glb','railway_bridge_02.hdr']);
    assert.equal(await page.evaluate(()=>window.rewardContexts),0,'a quiz owns no hidden WebGL renderer');
    assert.equal(await page.evaluate(()=>localStorage.getItem('train-reward-cinema-bag-v2')),saved,'preloading does not stamp or consume a movie');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('train-hiragana-v1')).stamps.length),0);
    const before=requests.length;
    for(const letter of 'あいうえお'){
      await page.locator(`.choice[data-letter="${letter}"]`).click();
      await page.locator('[data-action="next"]').click();
    }
    await page.waitForFunction(()=>!!document.querySelector('.reward-canvas')?.rewardScene);
    assert.equal(await page.locator('canvas').getAttribute('data-train'),'hayabusa');
    assert.equal(await page.locator('canvas').getAttribute('data-scenario'),'skybridge');
    assert.equal(await page.locator('canvas').getAttribute('data-asset'),'blender-glb');
    assert.equal(requests.length,before,'the reveal makes no duplicate model/HDR requests');
    assert.equal(await page.evaluate(()=>window.rewardContexts),1);
    await page.locator('[data-reward="continue"]').click();
    await page.locator('.finish').waitFor();
    assert.deepEqual(errors,[]);
    console.log('Loading checks passed: one planned movie during quiz, unchanged progress, no hidden renderer, no duplicate reveal downloads.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
