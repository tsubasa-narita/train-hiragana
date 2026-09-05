// Run with Playwright available on NODE_PATH: node tests/browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
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
    assert.equal(await page.locator('.choice:disabled').count(), 2);
    await page.locator('[data-action="next"]').click();
  }
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
    }
    await page.locator('[data-action="next"]').click();
  }
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
  await browser.close();
  console.log('Browser checks passed: both 5-station modes, retry, stamps, reload, train selection, listen level, alphabet, mobile/tablet overflow, unavailable storage.');
})().catch(e => { console.error(e); process.exit(1); });
