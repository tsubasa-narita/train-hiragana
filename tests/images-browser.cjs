const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage();
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
    const count = await page.evaluate(async () => {
      const { QUIZ_CARDS } = await import('./src/data.js');
      const { REWARD_TRAINS } = await import('./src/reward.js');
      const paths = [...new Set([...QUIZ_CARDS.map(t => './assets/trains/' + t.image), ...REWARD_TRAINS.map(t => './assets/rewards/' + t.image)])];
      for (const path of paths) {
        const image = new Image(); image.src = path;
        await image.decode();
        if (!image.naturalWidth || !image.naturalHeight) throw new Error(path);
      }
      return paths.length;
    });
    assert.equal(count, 33);
    console.log('All 22 quiz illustrations and 11 reward images loaded and decoded.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
