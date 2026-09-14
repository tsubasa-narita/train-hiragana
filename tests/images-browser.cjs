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
        if (path.includes('/reward-extra-')) {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
          const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let clear = 0, solid = 0;
          for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) clear++;
            if (pixels[i] >= 240) solid++;
          }
          const area = canvas.width * canvas.height;
          if (clear / area < .15 || solid / area < .1) throw new Error(`Missing transparent cutout: ${path}`);
        }
      }
      return paths.length;
    });
    assert.equal(count, 105);
    console.log('All 89 quiz illustrations and 16 reward images loaded and decoded.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
