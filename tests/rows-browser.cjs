const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 850 } });
    await page.addInitScript(() => { if (!localStorage.getItem('train-hiragana-v1')) localStorage.setItem('train-hiragana-v1', JSON.stringify({ sound: false })); });
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
    await page.clock.install();
    assert.equal(await page.locator('[data-action="row"]').count(), 10);
    await page.locator('[data-row="ま"]').click();
    await page.locator('[data-row="ら"]').click();
    await page.reload();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    assert.equal(await page.locator('[data-action="row"][aria-pressed="true"]').count(), 2);
    await page.locator('[data-row="ら"]').click();
    await page.locator('[data-action="start-find"]').click();
    const valid = 'まみむめも';
    const target = await page.locator('.target-letter').textContent();
    assert.equal(target, 'ま');
    for (const choice of await page.locator('.choice').allTextContents()) assert.ok(valid.includes(choice));
    const correct = page.locator(`.choice[data-letter="${target}"]`);
    await correct.click();
    await correct.dispatchEvent('click'); // ignored repeated tap while the answer is locked
    await page.clock.runFor(999);
    assert.equal(await page.locator('.route .current').textContent(), '1');
    await page.clock.runFor(1);
    assert.equal(await page.locator('.route .current').textContent(), '2');
    assert.equal(await page.locator('.target-letter').textContent(), 'み');
    assert.equal(await page.locator('.reward-dialog').count(), 0);
    let c = await page.locator('.target-letter').textContent();
    await page.locator(`.choice[data-letter="${c}"]`).click();
    await page.locator('[data-action="next"]').click();
    await page.clock.runFor(1000);
    assert.equal(await page.locator('.route .current').textContent(), '3');
    c = await page.locator('.target-letter').textContent();
    await page.locator(`.choice[data-letter="${c}"]`).click();
    await page.locator('[data-action="settings"]').click();
    await page.clock.runFor(2000);
    assert.equal(await page.locator('.settings').count(), 1);
    assert.equal(await page.locator('.reward-dialog').count(), 0);
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="start-connect"]').click();
    // Connect now offers free train choice, independently of find-mode rows.
    await page.locator('[data-connect="choose"][data-id="komachi"]').click();
    assert.equal(await page.locator('.connect-car.filled').count(), 0);
    while (await page.locator('.connect-car.waiting').count()) {
      await page.clock.runFor(800);
      const letter = await page.locator('.connect-car.waiting .connect-ghost').textContent();
      await page.locator(`[data-connect="letter"][data-letter="${letter}"]`).click();
    }
    await page.clock.runFor(3000);
    assert.equal(await page.locator('[data-connect="next"]').count(), 1);
    assert.equal(await page.locator('.reward-dialog').count(), 0);
    for (let completed = 1; completed < 3; completed++) {
      await page.locator('[data-connect="next"]').click();
      while (await page.locator('.connect-car.waiting').count()) {
        await page.clock.runFor(800);
        const letter = await page.locator('.connect-car.waiting .connect-ghost').textContent();
        await page.locator(`[data-connect="letter"][data-letter="${letter}"]`).click();
      }
      await page.clock.runFor(2000);
    }
    await page.clock.runFor(1299);
    assert.equal(await page.locator('.reward-dialog').count(), 0);
    await page.locator('[data-connect="next"]').click();
    assert.equal(await page.locator('.reward-dialog[open]').count(), 1);
    const trips = await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1')).trips);
    assert.equal(trips, 1);
    await page.clock.runFor(3000);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1')).trips), trips);
    await page.locator('[data-reward="continue"]').click();
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="all-rows"]').click();
    assert.equal(await page.locator('[data-action="all-rows"]').getAttribute('aria-pressed'), 'true');
    for (const row of 'あかさたなはまやらわ') {
      await page.locator(`[data-row="${row}"]`).click();
      await page.locator('[data-action="start-find"]').click();
      const targetLetter = await page.locator('.target-letter').textContent();
      assert.equal(targetLetter.normalize('NFD')[0], row);
      await page.locator('[data-action="home"]').first().click();
      await page.locator('[data-action="all-rows"]').click();
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    console.log('Row and timer checks passed: all 10 rows, selection persistence, free train connection, 1000ms find advance, repeated taps, three-name reward, navigation cancellation.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
