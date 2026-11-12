const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const { REWARD_3D_TRAINS } = await import('../src/reward3d-catalog.js');
  const browser = await chromium.launch({headless:true, channel:'msedge',args:['--enable-unsafe-swiftshader']});
  try {
    const context = await browser.newContext({...devices['Pixel 7']});
    const page = await context.newPage();
    const base = new URL(process.env.TEST_URL || 'http://127.0.0.1:4180/').href;
    await page.addInitScript(() => {
      if (!localStorage.getItem('train-hiragana-v1')) localStorage.setItem('train-hiragana-v1',JSON.stringify({sound:false,rows:['あ']}));
    });
    await page.goto(base);
    await page.evaluate(() => caches.open('go-home-puzzle-test').then(c=>c.put('./other-test',new Response('keep'))));
    await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.active);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    assert.ok(await page.evaluate(() => caches.has('go-home-puzzle-test')), 'other apps caches are preserved');
    const manifest = await page.evaluate(async () => (await fetch(document.querySelector('[rel="manifest"]').href)).json());
    assert.equal(manifest.display,'standalone');
    assert.equal(new URL(manifest.start_url, new URL('manifest.webmanifest',base)).href,base);
    assert.deepEqual(manifest.icons.filter(i=>i.purpose==='any').map(i=>i.sizes),['192x192','512x512']);
    for (const icon of manifest.icons) {
      const dims=await page.evaluate(async src=>{const image=new Image();image.src=src;await image.decode();return [image.naturalWidth,image.naturalHeight].join('x')},icon.src);
      assert.equal(dims,icon.sizes);
    }
    await page.locator('[data-action="collection"]').first().click();
    await page.locator('[data-id="inaho"]').click();
    await page.goBack(); await page.locator('.library').waitFor();
    await page.goBack(); await page.locator('.home').waitFor();
    await page.goForward(); await page.locator('.library').waitFor();
    await page.locator('[data-action="home"]').first().click(); await page.locator('.home').waitFor();
    await page.locator('[data-action="start-find"]').click();
    await page.locator('.choice[data-letter="あ"]').click();
    await page.locator('[data-action="next"]').click();
    await page.locator('[data-action="settings"]').click();
    await page.locator('input[name="level"][value="listen"]').check();
    await page.locator('input[name="find-choices"][value="3"]').check();
    await page.goBack(); await page.locator('.game').waitFor();
    assert.equal(await page.locator('.choice').count(),3);
    await page.locator('[data-action="settings"]').click();
    await page.locator('input[name="level"][value="match"]').check();
    await page.goBack(); await page.locator('.game').waitFor();
    assert.equal(await page.locator('.target-letter').textContent(),'い');
    await page.reload(); await page.locator('.game').waitFor();
    assert.equal(await page.locator('.target-letter').textContent(),'い');
    // A pending correct-answer timer must be cancelled on system Back.
    await page.locator('.choice[data-letter="い"]').click();
    await page.goBack(); await page.locator('.home').waitFor();
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.game').count(),0);
    await page.locator('[data-action="start-find"]').click();
    for (const c of 'あいうえお') {
      await page.locator(`.choice[data-letter="${c}"]`).click();
      await page.locator('[data-action="next"]').click();
    }
    await page.locator('.reward-dialog[open]').waitFor();
    await page.waitForFunction(()=>!!document.querySelector('.reward-canvas')?.rewardScene);
    const firstReward=await page.evaluate(()=>{const r=history.state.lastReward;return `${r.sceneId}:${r.id}`;});
    await page.locator('.reward-canvas').evaluate(c=>{c.rewardScene.seek(9800);c.rewardScene.resume();});
    await page.locator('.reward-dialog.arrived').waitFor();
    async function assertCompletedReward() {
      assert.equal(await page.evaluate(()=>history.state.lastReward.played),true);
      assert.equal(await page.evaluate(()=>{const r=history.state.lastReward;return `${r.sceneId}:${r.id}`;}),firstReward);
      assert.equal(await page.locator('.reward-canvas').evaluate(c=>c.rewardScene.elapsed),10000);
      assert.deepEqual(await page.locator('.reward-controls button:visible').evaluateAll(buttons=>buttons.map(b=>b.dataset.reward)),['book','continue']);
      assert.equal(await page.locator('[data-reward="start"],[data-reward="replay"],[data-reward="another"],[data-action="replay-reward"]').count(),0);
    }
    await assertCompletedReward();
    await page.goBack();
    await page.locator('.reward-dialog').waitFor({state:'detached'});
    assert.equal(await page.locator('.finish').count(),1);
    assert.equal(await page.locator('[data-action="replay-reward"]').count(),0,'finish has no replay action');
    assert.equal(await page.evaluate(()=>history.state.lastReward.played),true);
    await page.goForward();
    await page.waitForFunction(()=>!!document.querySelector('.reward-canvas')?.rewardScene);
    await page.locator('.reward-dialog.arrived').waitFor();
    assert.equal(await page.locator('.reward-canvas').evaluate(c=>`${c.dataset.scenario}:${c.dataset.train}`),firstReward);
    await assertCompletedReward();
    await page.waitForTimeout(300);
    await assertCompletedReward();
    await page.locator('[data-reward="continue"]').click();await page.locator('.reward-dialog').waitFor({state:'detached'});
    await page.locator('.finish').waitFor();
    await page.goBack(); await page.locator('.home').waitFor();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('train-hiragana-v1')).trips),1);
    await page.locator('[data-action="settings"]').click();
    // Exercise deferred install UI without installing anything on the host.
    await page.evaluate(()=>{
      window.installCalls=0;
      const event=new Event('beforeinstallprompt',{cancelable:true});
      event.prompt=async()=>{window.installCalls++};
      event.userChoice=Promise.resolve({outcome:'dismissed'});
      window.dispatchEvent(event);
    });
    await page.locator('[data-action="install"]').click();
    assert.equal(await page.evaluate(()=>window.installCalls),1);
    assert.equal(await page.locator('[data-action="install"]').isVisible(),false);
    await page.locator('[data-action="home"]').first().click(); await page.locator('.home').waitFor();
    await page.locator('[data-action="start-find"]').click();
    await page.locator('.train-picture img').evaluate(img=>img.decode());
    const seenImage = await page.locator('.train-picture img').getAttribute('src');
    await context.setOffline(true);
    for(const path of ['src/reward-timeline.js','src/reward-audio.js','src/reward3d-film.js','src/reward3d-celebration.js','src/reward3d-shinkansen.js','src/reward3d-depot.js','src/reward3d-skybridge.js','src/reward3d-scenarios.js','src/reward3d-assets.js','src/reward3d-terrain.js',...REWARD_3D_TRAINS.map(train=>`assets/reward3d/${train.id}.glb`),'assets/reward3d/environment/small_hangar_01.hdr','vendor/three/addons/libs/meshopt_decoder.module.js']){
      assert.equal(await page.evaluate(async path=>(await fetch(path)).status,path),200,'all new reward modules are precached for installed Android use');
    }
    await page.reload(); await page.locator('.game').waitFor();
    await page.locator('.train-picture img').evaluate(img=>img.decode());
    assert.equal(await page.locator('.train-picture img').getAttribute('src'), seenImage);
    assert.equal(await page.locator('.target-letter').textContent(),'あ');
    // A fresh offline document must really decode the compressed Blender model
    // and HDRI, including vendor imports that were not part of the quiz shell.
    await page.evaluate(async()=>{const r=await import('./src/reward.js');r.showTrainReward({train:{id:'toyoko',sceneId:'night'},sound:false});});
    await page.waitForFunction(()=>!!document.querySelector('.reward-canvas')?.rewardScene);
    assert.equal(await page.locator('.reward-canvas').getAttribute('data-asset'),'blender-glb');
    assert.equal(await page.locator('.reward-canvas').getAttribute('data-lighting'),'hdr-ibl');
    await page.keyboard.press('Escape');
    await page.locator('[data-action="home"]').first().click(); await page.locator('.home').waitFor();
    await page.reload(); await page.locator('.home').waitFor();
    console.log('Android browser checks passed: PWA manifest/icons/service worker, isolated cache, seven offline train assets, offline shell and seen images, completed reward back/forward without autoplay, two choices, reload/resume, timer cancellation, no duplicate completion, install prompt.');
    await context.close();
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
