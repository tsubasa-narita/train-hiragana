const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const outputDir = process.env.REWARD_TEST_OUTPUT || 'test-results/rewards';
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  try {
    fs.mkdirSync(outputDir,{recursive:true});
    const page = await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/');
    const ids=await page.evaluate(async()=> (await import('./src/reward.js')).REWARD_TRAINS.map(t=>t.id));
    assert.equal(ids.length,36);
    for (const id of ids) {
      await page.evaluate(async id=>{const r=await import('./src/reward.js');r.showTrainReward({train:r.REWARD_TRAINS.find(t=>t.id===id),sound:false});},id);
      await page.locator('[data-reward="start"]').click();
      await page.locator('.reward-dialog.running').waitFor();
      assert.equal(await page.locator('.reward-model').count(),1,id);
      await page.locator('.reward-runner').evaluate(el=>{const a=el.getAnimations()[0];a.pause();a.currentTime=2500;});
      await page.locator('.reward-dialog').evaluate(el=>{el.dataset.route='rainbow';});
      await page.locator('.reward-scene').screenshot({path:path.join(outputDir, `${id}.png`)});
      await page.locator('[data-reward="continue"]').click();
    }
    for (const width of [1440,375,320]) {
      await page.setViewportSize({width,height:850});
      for (const route of ['rainbow','station','night']) {
        await page.evaluate(async()=>{const r=await import('./src/reward.js');r.showTrainReward({train:r.REWARD_TRAINS.find(t=>t.id==='komachi'),sound:false});});
        await page.locator('[data-reward="start"]').click();
        await page.locator('.reward-dialog.running').waitFor();
        await page.locator('.reward-dialog').evaluate((el,route)=>{el.dataset.route=route;el.querySelector('.reward-route').textContent={rainbow:'にじの はしを わたろう',station:'えきで ひとやすみ',night:'ほしぞら きゅうこう'}[route];el.querySelector('.reward-status').textContent={rainbow:'にじに むかって、しゅっぱつ！',station:'がたん ごとん、えきへ いこう！',night:'きらきら おほしさまへ、しゅっぱつ！'}[route];},route);
        await page.locator('.reward-runner').evaluate(el=>{const a=el.getAnimations()[0];a.pause();a.currentTime=2500;});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        await page.locator('.reward-dialog').screenshot({path:path.join(outputDir, `${route}-${width}.png`)});
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.reward-dialog').count(),0);
      }
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(async()=>{const r=await import('./src/reward.js');r.showTrainReward({train:r.REWARD_TRAINS.find(t=>t.id==='reward-book-seven-stars'),sound:false});});
    await page.locator('[data-reward="start"]:visible').click();
    await page.locator('[data-reward="replay"]:visible').waitFor();
    assert.equal(await page.locator('.reward-runner').evaluate(e=>getComputedStyle(e).animationName),'none');
    const scene=await page.locator('.reward-scene').boundingBox(), train=await page.locator('.reward-runner').boundingBox();
    assert.ok(train.x>=scene.x && train.x+train.width<=scene.x+scene.width+.5,'whole consist visible');
    assert.ok(Math.abs(train.y+train.height-(scene.y+scene.height-45))<1,'reduced-motion arrival wheels stay on mobile rail');
    await page.locator('.reward-dialog').screenshot({path:path.join(outputDir, 'long-name-arrived-mobile.png')});
    await page.locator('[data-reward="replay"]').click();
    await page.locator('[data-reward="replay"]:visible').waitFor();
    await page.locator('[data-reward="continue"]').click();
    for (const width of [667,375]) {
      await page.setViewportSize({width,height:375});
      await page.evaluate(async()=>{const r=await import('./src/reward.js');r.showTrainReward({train:r.REWARD_TRAINS.find(t=>t.id==='reward-book-seven-stars'),sound:false});});
      await page.locator('[data-reward="start"]:visible').click();
      await page.locator('[data-reward="replay"]:visible').waitFor();
      assert.ok(await page.locator('.reward-dialog').evaluate(el=>el.scrollHeight<=el.clientHeight+1),'compact landscape fits without scrolling');
      const controls = await page.locator('[data-reward="replay"], [data-reward="book"], [data-reward="continue"]').evaluateAll(buttons => buttons.map(button => {
        const rect = button.getBoundingClientRect(), dialog = button.closest('dialog').getBoundingClientRect();
        return {visible:rect.top >= dialog.top && rect.bottom <= dialog.bottom && rect.left >= dialog.left && rect.right <= dialog.right, height:rect.height};
      }));
      assert.equal(controls.length, 3);
      assert.ok(controls.every(button => button.visible && button.height >= 48), 'all three controls fit and remain large');
      const heading=await page.locator('#reward-title').boundingBox(), dialog=await page.locator('.reward-dialog').boundingBox();
      assert.ok(heading.y>=dialog.y,'landscape heading remains visible');
      const contact=await page.locator('.reward-dialog').evaluate(el=>{
        const svg=[...el.querySelectorAll('.reward-landscape-svg')].find(s=>getComputedStyle(s).display!=='none');
        const rail=new DOMPoint(0,300).matrixTransform(svg.getScreenCTM());
        const train=el.querySelector('.reward-model').getBoundingClientRect();
        return Math.abs(train.bottom-rail.y);
      });
      assert.ok(contact<1.2,'compact rail contact');
      await page.locator('.reward-dialog').screenshot({path:path.join(outputDir, `compact-${width}x375.png`)});
      await page.locator('[data-reward="continue"]').click();
    }
    // Enter a completed journey with the book already in its ancestry, then use
    // actual browser history just as Android Back does.
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/');
    const stampsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1') || '{}').stamps || []);
    await page.evaluate(async () => {
      const reward = await import('./src/reward.js');
      const state = { ...history.state, screen:'finish', trail:['home','collection','train'],
        rewardOpen:true, mode:'find', journey:[], lastReward:reward.REWARD_TRAINS.find(t=>t.id==='hayabusa') };
      history.pushState(state, '', '#reward');
      window.dispatchEvent(new PopStateEvent('popstate', {state}));
    });
    await page.locator('[data-reward="start"]').click();
    await page.locator('[data-reward="book"]:visible').click();
    assert.equal(await page.locator('.train-detail h1').textContent(), 'はやぶさ');
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1') || '{}').stamps || []), stampsBefore);
    await page.goBack();
    await page.locator('.library').waitFor();
    await page.goBack();
    await page.locator('.finish').waitFor();
    assert.equal(await page.locator('.reward-dialog').count(),0);
    await page.route('**/assets/rewards/**',r=>r.abort());
    await page.evaluate(async()=>{const r=await import('./src/reward.js');r.showTrainReward({train:{id:'missing',name:'でんしゃ',image:'missing.png'},sound:false});});
    await page.locator('.reward-fallback:not([hidden])').waitFor();
    assert.equal(await page.locator('.reward-fallback-train').count(),1);
    await page.locator('[data-reward="continue"]').click();
    assert.deepEqual(errors,[]);
    console.log('Reward visuals passed: all 36 model sprites, 3 scenes at 3 widths, whole consist, rail contact, long title, reduced motion, replay, Escape, book history, stamps and missing-image fallback.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
