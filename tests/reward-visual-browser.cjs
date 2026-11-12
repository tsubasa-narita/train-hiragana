const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = process.env.REWARD_TEST_OUTPUT || 'test-results/cinema';
(async () => {
  const {REWARD_3D_TRAINS}=await import('../src/reward3d-catalog.js');
  const {REWARD_SCENARIOS}=await import('../src/reward3d-scenarios.js');
  const catalogIds=REWARD_3D_TRAINS.map(train=>train.id);
  const ids=process.env.REWARD_TEST_IDS ? [...new Set(process.env.REWARD_TEST_IDS.split(',').map(id=>id.trim()).filter(Boolean))] : catalogIds;
  assert.ok(ids.length>0,'REWARD_TEST_IDS needs at least one catalog ID');
  for(const id of ids)assert.ok(catalogIds.includes(id),`unknown REWARD_TEST_IDS entry: ${id}`);
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4180/');
    async function open(id, extras={}) {
      await page.evaluate(async({id,extras})=>{
        const r=await import('./src/reward.js');
        window.booked=null;window.rewardPlayed=[];window.rewardDone=0;
        r.showTrainReward({train:{...r.REWARD_TRAINS.find(t=>t.id===id),sceneId:extras.sceneId||'depot',played:extras.played===true},sound:false,...extras,
          onBook:t=>window.booked={...t},onPlayed:t=>window.rewardPlayed.push({...t}),onDone:()=>window.rewardDone++});
      },{id,extras});
      await page.waitForFunction(()=>!!document.querySelector('.reward-canvas')?.rewardScene);
      assert.equal(await page.locator('.reward-dialog').getAttribute('data-renderer'),'webgl');
      assert.equal(await page.locator('canvas').getAttribute('data-asset'),'blender-glb','actual Blender assets must load, not a procedural fallback');
      assert.equal(await page.locator('canvas').getAttribute('data-lighting'),'hdr-ibl');
      assert.equal(await page.locator('.reward-review,.reward-ticket').count(),0);
      assert.equal(await page.locator('[data-reward="start"],[data-reward="replay"],[data-reward="another"]').count(),0);
      assert.deepEqual(await page.locator('.reward-controls button').evaluateAll(buttons=>buttons.map(b=>b.dataset.reward)),['book','continue']);
      assert.equal(await page.locator('[data-reward="continue"]').isVisible(),true,'continue can skip a running clip');
    }
    async function end() {
      await page.locator('canvas').evaluate(c=>{c.rewardScene.seek(9800);c.rewardScene.resume();});
      await page.locator('.reward-dialog.arrived').waitFor();
      assert.equal(await page.locator('canvas').evaluate(c=>c.rewardScene.elapsed),10000);
      assert.deepEqual(await page.locator('.reward-controls button:visible').evaluateAll(buttons=>buttons.map(b=>b.dataset.reward)),['book','continue']);
      assert.equal(await page.evaluate(()=>window.rewardPlayed.length),1);
    }
    // Measure one unmodified playback against the real browser clock.
    await open('yokosuka');
    const begun=Date.now();await page.locator('.reward-dialog.arrived').waitFor({timeout:15000});
    assert.ok(Date.now()-begun>=9000,'automatic movie really runs for approximately ten seconds');
    assert.equal(await page.locator('canvas').evaluate(c=>c.rewardScene.elapsed),10000);
    assert.equal(await page.evaluate(()=>window.rewardPlayed.length),1);
    assert.deepEqual(await page.locator('.reward-controls button:visible').evaluateAll(buttons=>buttons.map(b=>b.dataset.reward)),['book','continue']);
    await page.locator('[data-reward="continue"]').click();
    assert.equal(await page.evaluate(()=>window.rewardDone),1);
    // Restoring a completed history entry displays its last frame without another play.
    await open('yokosuka',{sceneId:'night',played:true});
    await page.locator('.reward-dialog.arrived').waitFor();
    assert.equal(await page.locator('canvas').evaluate(c=>c.rewardScene.elapsed),10000);
    await page.waitForTimeout(300);
    assert.equal(await page.locator('canvas').evaluate(c=>c.rewardScene.elapsed),10000);
    assert.equal(await page.evaluate(()=>window.rewardPlayed.length),0);
    await page.locator('[data-reward="book"]').click();
    assert.deepEqual(await page.evaluate(()=>{const t=window.booked;return [t.id,t.sceneId,t.played];}),['yokosuka','night',true]);
    for(const {id:sceneId} of REWARD_SCENARIOS) for(const id of ids) {
      await open(id,{sceneId,letters:['あ','い','う','え','お'],words:['こまち']});
      for(const milliseconds of [0,1500,3600,6500,9000,10000]) {
        await page.locator('canvas').evaluate((c,t)=>c.rewardScene.seek(t),milliseconds);
        const chapters={0:'anticipation',1500:'launch',3600:'spectacle',9000:'finale'};
        if(chapters[milliseconds]) assert.equal(await page.locator('canvas').getAttribute('data-chapter'),chapters[milliseconds],`frame ${milliseconds}ms belongs to the expected chapter`);
        await page.locator('.reward-scene').screenshot({path:path.join(output,`${sceneId}-${id}-${milliseconds}.png`)});
      }
      const stats=await page.locator('canvas').evaluate(c=>c.rewardScene.stats);
      assert.ok(stats.triangles>50000 && stats.triangles<1100000,JSON.stringify(stats));
      assert.ok(stats.calls<400,'instancing keeps the scene within its draw-call budget');
      await end();
      assert.deepEqual(await page.evaluate(()=>window.rewardPlayed.map(t=>[t.id,t.sceneId,t.played])),[[id,sceneId,true]]);
      await page.locator('[data-reward="book"]').click();
      assert.deepEqual(await page.evaluate(()=>{const t=window.booked;return [t.id,t.sceneId,t.played];}),[id,sceneId,true]);
      assert.equal(await page.evaluate(()=>window.rewardDone),0,'book does not continue the quiz');
      assert.equal(await page.locator('dialog').count(),0);
    }
    const mobileCases=[...[[390,844],[320,667],[667,375],[320,375]].map(([w,h])=>['shonan-shinjuku',w,h,w===320?'skybridge':w===667?'night':'depot']),
      ...['komachi','hayabusa'].flatMap(id=>REWARD_SCENARIOS.map(({id:sceneId})=>[id,390,844,sceneId]))];
    for(const [id,width,height,sceneId] of mobileCases) {
      await page.setViewportSize({width,height});
      await open(id,{sceneId});
      for(const time of [3600,6500,10000]){
        await page.locator('canvas').evaluate((c,time)=>c.rewardScene.seek(time),time);
        if(id==='komachi'||id==='hayabusa'){
          const framing=await page.locator('canvas').evaluate(c=>c.rewardScene.framing);
          for(const point of [framing,framing.cab])assert.ok(point.x>.03&&point.x<.97&&point.y>.03&&point.y<.97,`nose and windscreen remain visible on phones: ${id}/${sceneId}/${time}: ${JSON.stringify(framing)}`);
        }
        await page.locator('.reward-dialog').screenshot({path:path.join(output,`mobile-${id}-${sceneId}-${width}x${height}-${time}.png`)});
      }
      await end();
      const controls=await page.locator('.reward-controls button:visible').evaluateAll(buttons=>buttons.map(button=>{
        const b=button.getBoundingClientRect(),d=button.closest('dialog').getBoundingClientRect();
        return {height:b.height,visible:b.top>=d.top&&b.bottom<=d.bottom&&b.left>=d.left&&b.right<=d.right};
      }));
      assert.equal(controls.length,2);
      assert.ok(controls.every(b=>b.height>=48&&b.visible),'both controls fit and have large touch targets');
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
    console.log(`3D cinema passed: ${ids.length*REWARD_SCENARIOS.length} scene/train pairs, real ten-second single playback, completed history without autoplay, same-train book identity, two 320px/landscape controls, reduced motion, WebGL loss fallback and cleanup.`);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
