const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.TEST_URL || 'http://127.0.0.1:4180/';
(async () => {
  fs.mkdirSync('test-results/word', { recursive: true });
  const browser = await chromium.launch({ channel:'msedge', headless:true });
  const errors = [];
  for (const width of [320,390,1440]) for (const choiceCount of [3,4]) {
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
    await page.locator(`[data-word="choices"][data-count="${choiceCount}"]`).click();
    await page.screenshot({path:`test-results/word/picker-${choiceCount}-${width}.png`,fullPage:true});
    await page.locator('[data-word="start"]').click();
    await page.waitForFunction(() => history.state.wordState.phase === 'answer');
    assert.equal(await page.evaluate(() => window.wordAudio.length),1,'the question speaks its name on entry');
    assert.equal(await page.locator('.word-picture img').count(),0,'the picture cannot identify the answer');
    assert.equal(await page.locator('[data-word="answer"]').count(), choiceCount);
    const overflow = await page.locator('[data-word="answer"]').evaluateAll(buttons => buttons.some(button => {
      const box = button.getBoundingClientRect();
      return [...button.querySelectorAll('[data-word-index]')].some(letter => {
        const bounds = letter.getBoundingClientRect();
        return bounds.left < box.left || bounds.right > box.right;
      });
    }));
    assert.equal(overflow,false,'whole names fit inside every ticket');
    const first = await page.evaluate(() => history.state.wordState.cards[0]);
    const expectedNameFile = await page.evaluate(async name => (await import('./src/announcement-manifest.js')).ANNOUNCEMENT_FILES[name], first.name);
    assert.ok((await page.evaluate(() => window.wordAudio[0])).endsWith(expectedNameFile));
    await page.locator('[data-word="repeat"]').click();
    await page.waitForFunction(() => history.state.wordState.phase === 'answer');
    assert.equal(await page.evaluate(() => window.wordAudio.length),2,'repeat speaks only the whole name');
    const wrong = first.options.find(name => name !== first.name);
    await page.locator(`[data-word="answer"][data-name="${wrong}"]`).click();
    assert.equal(await page.evaluate(() => history.state.wordState.station),0);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1') || '{}').stamps?.length || 0),0);
    await page.locator('[data-word="help"]').click();
    await page.waitForTimeout(100);
    await page.locator('[data-action="settings"]').click();
    await page.locator(`[name="word-choices"][value="${choiceCount === 3 ? 4 : 3}"]`).check();
    const audioOnExit = await page.evaluate(() => window.wordAudio.length);
    await page.waitForTimeout(650);
    assert.equal(await page.evaluate(() => window.wordAudio.length),audioOnExit,'hint cancels on navigation');
    await page.goBack();
    await page.locator('[data-word="skip"]').click();
    assert.equal(await page.locator('[data-word="answer"]').count(),choiceCount,'in-progress choice count stays fixed');
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
        await page.screenshot({path:`test-results/word/correct-${choiceCount}-${width}.png`,fullPage:true});
        await page.evaluate(() => window.scrollTo(0,900));
      }
      await page.locator('[data-word="next"]').click();
      if (i<4) {
        await page.waitForFunction(() => history.state.wordState.phase === 'answer');
        assert.equal(await page.evaluate(() => window.scrollY),0,'next question starts at top');
        assert.equal(await page.locator('.word-picture img').count(),0);
        const expected = await page.evaluate(async()=>{const state=history.state.wordState;return (await import('./src/announcement-manifest.js')).ANNOUNCEMENT_FILES[state.cards[state.station].name];});
        assert.ok((await page.evaluate(()=>window.wordAudio.at(-1))).endsWith(expected),'each next question speaks its own name');
      }
    }
    await page.locator('dialog.reward-dialog').waitFor();
    assert.equal(await page.locator('.reward-review, .reward-ticket').count(),0,'reward is a separate train cinema');
    const trips = await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1')).trips);
    assert.equal(trips,1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:`test-results/word/reward-${choiceCount}-${width}.png`,fullPage:true});
    await page.goBack();
    assert.equal(await page.locator('dialog.reward-dialog').count(),0);
    await page.locator('[data-action="start-word"]').click();
    assert.equal(await page.locator(`[data-word="choices"][data-count="${choiceCount === 3 ? 4 : 3}"]`).getAttribute('aria-pressed'),'true','settings apply to the next journey');
    await page.locator('[data-word="length"][data-length="2"]').click();
    await page.locator('[data-word="start"]').click();
    assert.equal(await page.evaluate(() => history.state.wordState.length),2);
    assert.equal(await page.evaluate(() => new Set(history.state.wordState.cards.map(c=>c.id)).size),5);
    await page.screenshot({path:`test-results/word/question-${choiceCount}-${width}.png`,fullPage:true});
    await page.locator('[data-action="sound"]').click();
    await page.locator('[data-word="sound"]').waitFor();
    await page.locator('[data-word="sound"]').click();
    await page.waitForFunction(() => history.state.wordState.phase === 'answer');
    assert.equal(await page.locator('.word-picture img').count(),0);
    assert.equal(await page.locator('.word-hint').count(),0,'turning sound on replays the name without revealing its letters');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('train-hiragana-v1')).sound),true);
    await context.close();
  }
  await browser.close();
  assert.deepEqual(errors,[]);
  console.log('Word mode: 320/390/1440px, 3/4 choices, spoken intro and repeat, hidden pictures, 5 answers, syllable audio, hint cancellation, history, stamps, rewards and saved settings passed.');
})().catch(error=>{console.error(error);process.exit(1);});
