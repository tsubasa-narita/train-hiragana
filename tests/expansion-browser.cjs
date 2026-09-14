const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    fs.mkdirSync('test-results', { recursive: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
    await page.locator('[data-action="sound"]').click();
    await page.locator('[data-action="start-find"]').click();
    const first = await page.locator('.train-picture img').getAttribute('src');
    await page.locator('[data-action="home"]').first().click();
    await page.reload();
    await page.locator('[data-action="start-find"]').click();
    assert.notEqual(await page.locator('.train-picture img').getAttribute('src'), first);
    const seen = new Set();
    for (let i = 0; i < 3; i++) {
      await page.reload(); // Reset route history for deterministic coverage.
      await page.evaluate(async index => {
        const reward = await import('./src/reward.js');
        const random = Math.random; Math.random = () => (index + .1) / 3;
        reward.showTrainReward({ train: reward.REWARD_TRAINS[11], sound: false });
        await document.querySelector('.reward-runner').decode(); await new Promise(resolve => requestAnimationFrame(resolve));
        Math.random = random;
      }, i);
      await page.locator('.reward-dialog.running').waitFor();
      const route = await page.locator('.reward-dialog').getAttribute('data-route'); seen.add(route);
      const expected = { rainbow: 'reward-bridge', station: 'reward-station', night: 'reward-express' }[route];
      assert.equal(await page.locator('.reward-runner').evaluate(el => getComputedStyle(el).animationName), expected);
      await page.locator('.reward-runner').evaluate(el => { const a = el.getAnimations()[0]; a.pause(); a.currentTime = 2500; });
      await page.screenshot({ path: `test-results/route-${route}-mobile.png` });
      await page.locator('[data-reward="replay"]:enabled').waitFor({ timeout: 8000 });
      const name = await page.locator('#reward-title').textContent();
      await page.locator('[data-reward="replay"]').click();
      assert.notEqual(await page.locator('.reward-dialog').getAttribute('data-route'), route);
      assert.equal(await page.locator('#reward-title').textContent(), name);
      await page.evaluate(async () => (await import('./src/reward.js')).stopTrainReward());
    }
    assert.equal(seen.size, 3);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(async () => (await import('./src/reward.js')).showTrainReward({ sound: false }));
    await page.locator('.reward-dialog.running').waitFor();
    assert.equal(await page.locator('.reward-runner').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.locator('[data-reward="continue"]').click();
    assert.equal(await page.locator('.reward-dialog').count(), 0);
    assert.deepEqual(errors, []);
    console.log('Persistent image rotation, all three reward routes, replay, close and reduced motion passed.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
