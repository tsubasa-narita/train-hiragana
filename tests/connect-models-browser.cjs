const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ids = ['komachi', 'yokosuka', 'yamanote', 'odoriko', 'hayabusa', 'kagayaki', 'saikyo', 'shonan-shinjuku', 'nanbu'];
(async () => {
  const browser = await chromium.launch({ headless:true, channel:'msedge' });
  try {
    fs.mkdirSync('test-results', { recursive:true });
    const errors = [];
    for (const id of ids) {
      const page = await browser.newPage({ viewport:{width:375,height:850}, reducedMotion:'reduce', serviceWorkers:'block' });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/');
      await page.evaluate(() => { localStorage.clear(); localStorage.setItem('train-hiragana-v1',JSON.stringify({sound:false})); history.replaceState(null,'','/'); });
      await page.reload();
      await page.clock.install();
      await page.locator('[data-action="start-connect"]').click();
      assert.equal(await page.locator('.connect-trains').first().locator('.connect-train').count(),9);
      await page.locator(`[data-connect="choose"][data-id="${id}"]`).click();
      const length = await page.locator('.assembly-car').count();
      assert.ok(length >= 3);
      const asset = await page.locator('.train-sprite').first().evaluate(el => getComputedStyle(el).backgroundImage.match(/url\(['"]?(.*?)['"]?\)/)[1]);
      assert.ok(asset.endsWith(`${id}-carriages.png`));
      assert.ok(await page.evaluate(async url => { const image = new Image(); image.src=url; await image.decode(); return image.naturalWidth === 1536 && image.naturalHeight === 1024; },asset));
      for (let i=0;i<length;i++) {
        await page.clock.runFor(800);
        if (i === 0) await page.emulateMedia({ reducedMotion:'no-preference' });
        const letter = await page.locator('.connect-ghost').textContent();
        await page.locator(`[data-connect="letter"][data-letter="${letter}"]`).click();
        assert.equal(await page.locator('.assembly-car.coupled').count(),i+1);
        if (i === 0) {
          await page.clock.runFor(800);
          // The fake timer controls input locks, while CSS animations use the rendering clock.
          await page.locator('.assembly-car.incoming').evaluate(el => el.getAnimations().forEach(animation => animation.finish()));
          assert.equal(await page.locator('.assembly-car.coupled').first().evaluate(el => getComputedStyle(el).opacity),'1');
          await page.screenshot({path:`test-results/connect-${id}-coupling-mobile.png`,fullPage:true});
          await page.emulateMedia({ reducedMotion:'reduce' });
        }
      }
      assert.equal(await page.locator('.assembly-car').first().locator('.sprite-0').count(),1);
      assert.equal(await page.locator('.assembly-car').last().locator('.sprite-2').count(),1);
      assert.equal(await page.locator('.sprite-1').count(),length-2);
      assert.equal(await page.evaluate(() => history.state.connectState.completedCards.length),1);
      assert.equal(await page.locator('.reward-dialog').count(),0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`${id} overflow`);
      await page.screenshot({path:`test-results/connect-${id}-mobile.png`,fullPage:true});
      await page.close();
    }
    assert.deepEqual(errors,[]);
    console.log('Nine model checks passed: dedicated sprites load, every letter couples one car, correct cabs/middle cars, long names, mobile layout, first success without premature reward.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
