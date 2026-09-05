// Run with Playwright available on NODE_PATH: node tests/browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  const dismissReward = async () => {
    assert.equal(await page.locator('.reward-dialog[open]').count(), 1);
    await page.locator('[data-reward="continue"]').click();
    assert.equal(await page.locator('.reward-dialog').count(), 0);
  };
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.locator('[data-action="sound"]').click();
  await page.locator('[data-action="start-find"]').click();
  let target = (await page.locator('.target-letter').textContent()).trim();
  const wrong = page.locator('.choice').filter({ hasNotText: target }).first();
  await wrong.click();
  assert.ok((await page.locator('.feedback').textContent()).includes('さがして'));
  assert.equal(await page.locator('.choice:disabled').count(), 0);
  await page.screenshot({ path: 'test-results/game-desktop.png', fullPage: true });
  for (let i = 0; i < 5; i++) {
    target = (await page.locator('.target-letter').textContent()).trim();
    await page.locator(`.choice[data-letter="${target}"]`).click();
    if (i < 4) {
      assert.equal(await page.locator('.reward-dialog').count(), 0);
      assert.equal(await page.locator('[data-action="replay-reward"]').count(), 0);
      assert.equal(await page.locator('.choice:disabled').count(), 2);
      await page.locator('[data-action="next"]').click();
    } else {
      await page.locator('.reward-dialog.running').waitFor();
      await page.locator('.reward-runner').evaluate(el => { const animation = el.getAnimations()[0]; animation.pause(); animation.currentTime = 2500; });
      await page.screenshot({ path: 'test-results/reward-desktop.png', fullPage: true });
      await page.setViewportSize({ width: 375, height: 850 });
      await page.screenshot({ path: 'test-results/reward-mobile.png', fullPage: true });
      await page.setViewportSize({ width: 1440, height: 1100 });
      const name = await page.locator('#reward-title').textContent();
      await page.locator('[data-reward="replay"]:enabled').waitFor({ timeout: 10000 });
      await page.locator('[data-reward="replay"]').click();
      assert.equal(await page.locator('#reward-title').textContent(), name);
      assert.equal(await page.locator('.reward-dialog.running').count(), 1);
    }
  }
  await dismissReward();
  assert.equal(await page.locator('.earned-trains>div').count(), 5);
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1')));
  assert.equal(saved.stamps.length, 5); assert.equal(saved.trips, 1);
  await page.reload();
  assert.equal((await page.locator('.ticket-count b').textContent()).trim(), '5');
  await page.locator('[data-action="start-connect"]').click();
  for (let i = 0; i < 5; i++) {
    while (await page.locator('.carriage.waiting').count()) {
      const c = (await page.locator('.carriage.waiting').textContent()).trim();
      await page.locator(`.choice[data-letter="${c}"]`).click();
      if (await page.locator('.game').count()) assert.equal(await page.locator('.reward-dialog').count(), 0);
    }
    if (i < 4) await page.locator('[data-action="next"]').click();
  }
  await dismissReward();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1')));
  assert.equal(saved.trips, 2);
  await page.locator('[data-action="collection"]').first().click();
  assert.equal(await page.locator('.train-card').count(), 8);
  await page.locator('[data-action="train"][data-id="hayabusa"]').click();
  assert.equal(await page.locator('.name-letters button').count(), 4);
  await page.locator('[data-action="train-play"]').click();
  assert.equal(await page.locator('.target-letter').textContent(), 'は');
  await page.locator('[data-action="settings"]').click();
  await page.locator('input[value="listen"]').check();
  await page.locator('[data-action="home"]').first().click();
  await page.locator('[data-action="start-find"]').click();
  assert.equal(await page.locator('.choice').count(), 3);
  assert.equal(await page.locator('.target-letter').textContent(), '♪');
  await page.locator('[data-action="hint"]').click();
  assert.notEqual(await page.locator('.target-letter').textContent(), '♪');
  await page.locator('[data-action="home"]').first().click();
  await page.locator('[data-action="alphabet"]').click();
  await page.locator('[data-action="kana"][data-letter="ぶ"]').click();
  assert.equal(await page.locator('#preview-character').textContent(), 'ぶ');
  assert.ok((await page.locator('#preview-caption').textContent()).includes('はやぶさ'));
  for (const width of [375, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const view of ['home', 'collection', 'alphabet', 'settings']) {
      await page.locator('[data-action="home"]').first().click();
      if (view !== 'home') await page.locator(`[data-action="${view}"]`).first().click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${view} overflows at ${width}`);
      if (width === 375) await page.screenshot({ path: `test-results/${view}-mobile.png`, fullPage: true });
    }
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="start-connect"]').click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `game overflows at ${width}`);
    if (width === 375) await page.screenshot({ path: 'test-results/game-mobile.png', fullPage: true });
  }
  const unavailable = await browser.newPage();
  await unavailable.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('unavailable'); } }); });
  await unavailable.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
  await unavailable.locator('[data-action="start-find"]').click();
  assert.equal(await unavailable.locator('.choice').count(), 2);
  assert.deepEqual(errors, []);
  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  await reduced.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
  await reduced.locator('[data-action="start-find"]').click();
  for (let i = 0; i < 5; i++) {
    const c = await reduced.locator('.target-letter').textContent();
    await reduced.locator(`.choice[data-letter="${c}"]`).click();
    if (i < 4) await reduced.locator('[data-action="next"]').click();
  }
  await reduced.locator('[data-reward="replay"]:enabled').waitFor();
  assert.equal(await reduced.locator('.reward-runner').evaluate(el => getComputedStyle(el).animationName), 'none');
  await reduced.keyboard.press('Escape');
  assert.equal(await reduced.locator('.reward-dialog').count(), 0);
  await reduced.setViewportSize({ width: 667, height: 375 });
  await reduced.locator('[data-action="replay-reward"]').click();
  await reduced.locator('[data-reward="continue"]').click();
  assert.equal(await reduced.locator('.reward-dialog').count(), 0);
  await reduced.route('**/assets/rewards/**', route => route.abort());
  await reduced.locator('[data-action="replay-reward"]').click();
  await reduced.locator('.reward-fallback:not([hidden])').waitFor();
  await reduced.locator('[data-reward="continue"]').click();
  assert.equal(await reduced.locator('.reward-dialog').count(), 0);
  await browser.close();
  console.log('Browser checks passed: rewards only after all five questions in both modes, animation/replay/skip, reduced motion/Escape, retry, stamps, reload, train selection, listen level, alphabet, mobile/tablet overflow, unavailable storage.');
})().catch(e => { console.error(e); process.exit(1); });
