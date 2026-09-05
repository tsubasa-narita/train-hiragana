const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      const NativeAudio = window.Audio;
      window.Audio = class extends NativeAudio { constructor(...args) { super(...args); window.testAudio = this; } };
      window.fallbackSpeech = [];
      speechSynthesis.speak = u => window.fallbackSpeech.push(u.text);
    });
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
    await page.locator('[data-action="settings"]').click();
    await page.locator('[data-action="voice-sample"]').click();
    await page.waitForFunction(() => window.testAudio?.currentTime > .05);
    assert.ok(await page.evaluate(() => testAudio.src.includes('/assets/voice/')));
    assert.deepEqual(await page.evaluate(() => fallbackSpeech), []);
    await page.locator('[data-action="sound"]').click();
    assert.ok(await page.evaluate(() => testAudio.paused));
    await page.locator('[data-action="voice-sample"]').click();
    await page.waitForFunction(() => !testAudio.paused);
    await page.locator('[data-action="home"]').first().click();
    assert.ok(await page.evaluate(() => testAudio.paused));
    await page.locator('[data-action="start-find"]').click();
    await page.waitForFunction(() => testAudio.currentTime > .05);
    assert.deepEqual(await page.evaluate(() => fallbackSpeech), []);
    const decoded = await page.evaluate(async () => {
      const { VOICE_FILES } = await import('./src/voice-manifest.js');
      const context = new AudioContext();
      let count = 0;
      for (const file of Object.values(VOICE_FILES)) {
        const response = await fetch(`./assets/voice/${file}`);
        if (!response.ok) throw new Error(file);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        if (!(buffer.duration > .1)) throw new Error(`Empty voice: ${file}`);
        count++;
      }
      await context.close();
      return count;
    });
    assert.equal(decoded, 156);
    await page.route('**/assets/voice/*.mp3', route => route.abort());
    await page.locator('[data-action="settings"]').click();
    await page.locator('[data-action="voice-sample"]').click();
    await page.waitForFunction(() => fallbackSpeech.length === 1);
    console.log(`Voice checks passed: sample and game MP3 playback, mute/navigation cancellation, ${decoded} audio files decoded, network-failure fallback.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
