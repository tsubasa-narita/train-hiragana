const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.TEST_URL || 'http://127.0.0.1:4180/';
(async () => {
  fs.mkdirSync('test-results/word', { recursive: true });
  const browser = await chromium.launch({ channel:'msedge', headless:true });
  const errors = [];
  for (const width of [320,390,1440]) {
    const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.addInitScript(() => {
      localStorage.setItem('train-word-v1', JSON.stringify({length:4,auto:false}));
      window.wordAudio = [];
      window.Audio = class {
        play() { window.wordAudio.push(this.src); this.timer = setTimeout(() => this.onended?.(), 20); return Promise.resolve(); }
        pause() { clearTimeout(this.timer); }
      };
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.locator('[data-action="start-word"]').click();
    await page.screenshot({path:`test-results/word/picker-${width}.png`,fullPage:true});
    await page.locator('[data-word="start"]').click();
    assert.equal(await page.evaluate(() => window.wordAudio.length),0,'no answer is narrated on entry');
    const first = await page.evaluate(() => history.state.wordState.cards[0]);
    const wrong = first.options.find(name => name !== first.name);
    await page.locator(`[data-word="answer"][data-name="${wrong}"]`).click();
    assert.equal(await page.evaluate(() => history.state.wordState.station),0);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1') || '{}').stamps?.length || 0),0);
    await page.locator('[data-word="help"]').click();
    await page.waitForTimeout(100);
    await page.locator('[data-action="settings"]').click();
    const audioOnExit = await page.evaluate(() => window.wordAudio.length);
    await page.waitForTimeout(650);
    assert.equal(await page.evaluate(() => window.wordAudio.length),audioOnExit,'hint cancels on navigation');
    await page.goBack();
    await page.locator('[data-word="skip"]').click();
    const reviewed = [];
    for (let i = 0; i < 5; i++) {
      const card = await page.evaluate(() => history.state.wordState.cards[history.state.wordState.station]);
      reviewed.push(card.name);
      const before = await page.evaluate(() => window.wordAudio.length);
      await page.locator(`[data-word="answer"][data-name="${card.name}"]`).click();
      if (i===0) {
        await page.waitForFunction(count => window.wordAudio.length >= count, before+2);
        await page.locator('[data-word="pause"]').click();
        await page.locator('[data-word="pause"]').click();
      }
      await page.locator('[data-word="next"]:not([disabled])').waitFor();
      const after = await page.evaluate(() => window.wordAudio.length);
      assert.equal(after-before, [...card.name].length+1,'each syllable and whole name are read');
      if (i===0) {
        await page.screenshot({path:`test-results/word/correct-${width}.png`,fullPage:true});
        await page.evaluate(() => window.scrollTo(0,900));
      }
      await page.locator('[data-word="next"]').click();
      if (i<4) assert.equal(await page.evaluate(() => window.scrollY),0,'next question starts at top');
    }
    await page.locator('dialog.reward-dialog').waitFor();
    assert.deepEqual(await page.locator('.reward-ticket').allTextContents(),reviewed);
    const trips = await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1')).trips);
    assert.equal(trips,1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth));
    for (const ticket of await page.locator('.reward-ticket').all()) {
      const box = await ticket.boundingBox(); assert.ok(box.height>=44 && box.width>=44);
    }
    await page.screenshot({path:`test-results/word/reward-${width}.png`,fullPage:true});
    await page.goBack();
    assert.equal(await page.locator('dialog.reward-dialog').count(),0);
    await page.locator('[data-action="start-word"]').click();
    await page.locator('[data-word="length"][data-length="2"]').click();
    await page.locator('[data-word="start"]').click();
    assert.equal(await page.evaluate(() => history.state.wordState.length),2);
    assert.equal(await page.evaluate(() => new Set(history.state.wordState.cards.map(c=>c.id)).size),5);
    await page.screenshot({path:`test-results/word/question-${width}.png`,fullPage:true});
    await page.locator('[data-action="sound"]').click();
    await page.locator('[data-word="sound"]').waitFor();
    await page.locator('[data-word="sound"]').click();
    await page.locator('.word-hint').waitFor();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1')).sound),true);
    await context.close();
  }
  await browser.close();
  assert.deepEqual(errors,[]);
  console.log('Word mode: 320/390/1440px, 5 answers, syllable audio, silent intro, hint cancellation, history, stamps, rewards and length selection passed.');
})().catch(error=>{console.error(error);process.exit(1);});
