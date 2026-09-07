const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({viewport:{width:375,height:850}});
    await page.addInitScript(() => {
      if (!localStorage.getItem('train-hiragana-v1')) localStorage.setItem('train-hiragana-v1', JSON.stringify({sound:false}));
    });
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    const rows = await page.evaluate(async () => (await import('./src/data.js')).ROWS);
    async function solve(expected) {
      for (let i = 0; i < expected.length; i++) {
        const c = await page.locator('.target-letter').textContent();
        assert.equal(c, expected[i]);
        const name = await page.locator('.picture-tag').textContent();
        if (!'をん'.includes(c)) assert.ok(name.startsWith(c), name + ':' + c);
        assert.equal(await page.locator('.reward-dialog').count(), 0);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name);
        if (i === 0) {
          await page.locator(`.choice:not([data-letter="${c}"])`).first().click();
          await page.clock.runFor(1500);
          assert.equal(await page.locator('.target-letter').textContent(), c);
        }
        await page.locator(`.choice[data-letter="${c}"]`).click();
        await page.clock.runFor(1000);
      }
      assert.equal(await page.locator('.reward-dialog[open]').count(), 1);
      await page.locator('[data-reward="continue"]').click();
      await page.locator('[data-action="home"]').first().click();
    }
    for (const row of rows) {
      await page.locator('[data-action="all-rows"]').click();
      await page.locator(`[data-row="${row.id}"]`).click();
      await page.locator('[data-action="start-find"]').click();
      await solve(Array.from({length:5}, (_, i) => row.letters[i % row.letters.length]));
      await page.locator('[data-action="start-find"]').click();
      assert.equal(await page.locator('.target-letter').textContent(), row.id, 'one row restarts at the first kana');
      await page.locator('[data-action="home"]').first().click();
    }
    await page.locator('[data-action="all-rows"]').click();
    await page.locator('[data-row="か"]').click();
    await page.locator('[data-row="あ"]').click();
    await page.locator('[data-action="start-find"]').click();
    await solve('あいうえお');
    await page.reload();
    await page.locator('[data-action="start-find"]').click();
    await solve('かきくけこ');
    await page.locator('[data-action="start-find"]').click();
    assert.equal(await page.locator('.target-letter').textContent(), 'あ', 'multiple rows wrap');
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="collection"]').first().click();
    await page.locator('[data-action="train"][data-id="inaho"]').click();
    await page.locator('[data-action="train-play"]').click();
    assert.equal(await page.locator('.target-letter').textContent(), 'あ');
    await page.locator('.choice[data-letter="あ"]').click();
    await page.clock.runFor(1000);
    assert.equal(await page.locator('.picture-tag').textContent(), 'いなほ');
    console.log('All 10 rows ordered, 44 initials matched, wrong answers stay, five-answer rewards, row restart, multi-row persisted continuation, preferred train order, and mobile overflow passed.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
