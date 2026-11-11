const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = process.env.REWARD_TEST_OUTPUT || 'test-results/cinema';
(async () => {
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4180/');
    async function open(id, extras={}) {
      await page.evaluate(async({id,extras})=>{
        const r=await import('./src/reward.js');
        window.booked=null;window.rewardChanged=null;window.rewardDone=0;
        r.showTrainReward({train:r.REWARD_TRAINS.find(t=>t.id===id),sound:false,...extras,
          onBook:t=>window.booked=t.id,onTrainChange:t=>window.rewardChanged=t.id,onDone:()=>window.rewardDone++});
      },{id,extras});
      await page.waitForFunction(()=>!!document.querySelector('.reward-canvas')?.rewardScene);
      assert.equal(await page.locator('.reward-dialog').getAttribute('data-renderer'),'webgl');
      assert.equal(await page.locator('.reward-review,.reward-ticket').count(),0);
    }
    async function end() {
      await page.locator('canvas').evaluate(c=>{c.rewardScene.seek(6800);c.rewardScene.resume();});
      await page.locator('.reward-dialog.arrived').waitFor();
    }
    // Measure one unmodified playback against the real browser clock.
    await open('yokosuka');
    const begun=Date.now();await page.locator('.reward-dialog.arrived').waitFor({timeout:12000});
    assert.ok(Date.now()-begun>=6000,'automatic movie really runs for approximately seven seconds');
    assert.equal(await page.locator('canvas').evaluate(c=>c.rewardScene.elapsed),7000);
    await page.locator('[data-reward="replay"]').click();
    await page.locator('.reward-dialog.running').waitFor();
    assert.ok(await page.locator('canvas').evaluate(c=>c.rewardScene.elapsed<2000));
    await page.locator('[data-reward="continue"]').click();
    assert.equal(await page.evaluate(()=>window.rewardDone),1);
    for(const id of ['yokosuka','shonan-shinjuku','saikyo','toyoko']) {
      await open(id,{letters:['あ','い','う','え','お'],words:['こまち']});
      for(const milliseconds of [0,2200,4500,6800]) {
        await page.locator('canvas').evaluate((c,t)=>c.rewardScene.seek(t),milliseconds);
        await page.locator('.reward-scene').screenshot({path:path.join(output,`${id}-${milliseconds}.png`)});
      }
      const stats=await page.locator('canvas').evaluate(c=>c.rewardScene.stats);
      assert.ok(stats.triangles>50000 && stats.triangles<900000);
      assert.ok(stats.calls<350,'instancing keeps the scene within its draw-call budget');
      await end();
      await page.locator('[data-reward="another"]').click();
      await page.waitForFunction(id=>document.querySelector('canvas')?.rewardScene && document.querySelector('canvas').dataset.train!==id,id);
      const changed=await page.evaluate(()=>window.rewardChanged);assert.notEqual(changed,id);
      await end();await page.locator('[data-reward="book"]').click();
      assert.equal(await page.evaluate(()=>window.booked),changed);
      assert.equal(await page.locator('dialog').count(),0);
    }
    for(const [width,height] of [[390,844],[320,667],[667,375],[320,375]]) {
      await page.setViewportSize({width,height});
      await open('shonan-shinjuku');
      await page.locator('canvas').evaluate(c=>c.rewardScene.seek(2200));
      await page.locator('.reward-dialog').screenshot({path:path.join(output,`mobile-${width}x${height}.png`)});
      await end();
      const controls=await page.locator('.reward-controls button:visible').evaluateAll(buttons=>buttons.map(button=>{
        const b=button.getBoundingClientRect(),d=button.closest('dialog').getBoundingClientRect();
        return {height:b.height,visible:b.top>=d.top&&b.bottom<=d.bottom&&b.left>=d.left&&b.right<=d.right};
      }));
      assert.equal(controls.length,4);
      assert.ok(controls.every(b=>b.height>=48&&b.visible),'all four controls fit and have large touch targets');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.keyboard.press('Escape');
    }
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4180/');
    await page.emulateMedia({reducedMotion:'reduce'});
    await open('saikyo');await end();await page.keyboard.press('Escape');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await open('toyoko');
    await page.locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(()=>document.querySelector('dialog')?.dataset.renderer==='illustration');
    assert.equal(await page.locator('.reward-fallback img').getAttribute('alt'),'とうよこせんのイラスト');
    await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').count(),0);
    assert.deepEqual(errors,[]);
    console.log('3D cinema passed: four train models, real seven-second playback, auto-start, replay, another/book identity, 320px/landscape controls, reduced motion, WebGL loss fallback and cleanup.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
