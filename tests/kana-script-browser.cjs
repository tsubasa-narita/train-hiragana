const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const { kanaInScript } = await import('../src/kana-script.js');
  const katakana = text => kanaInScript(text, 'katakana');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({
      ...devices['Pixel 7'], viewport: { width: 320, height: 735 }, deviceScaleFactor: 1, reducedMotion: 'reduce',
    });
    await context.addInitScript(() => {
      if (!localStorage.getItem('train-hiragana-v1')) {
        localStorage.setItem('train-hiragana-v1', JSON.stringify({
          sound: false, rows: ['さ'], findChoices: 3, findCompounds: 'more',
        }));
      }
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const cdp = await context.newCDPSession(page);
    const action = id => page.locator(`[data-action="${id}"]`).first();
    const scriptButton = script => page.locator(`[data-action="kana-script"][data-script="${script}"]`);
    async function setScript(script) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await scriptButton(script).tap();
      assert.equal(await scriptButton(script).getAttribute('aria-pressed'), 'true');
    }
    const state = () => page.evaluate(() => history.state);
    const text = selector => page.locator(selector).first().textContent();
    const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const home = async () => { await action('home').click(); await page.locator('.home').waitFor(); };
    const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', {
      type, touchPoints: points.map(({x, y}) => ({x, y, id: 1})),
    });
    async function strokePoints(index) {
      await page.locator('.trace-board').scrollIntoViewIfNeeded();
      return page.locator(`[data-stroke="${index}"]`).evaluate(path => {
        const length = path.getTotalLength(), count = Math.ceil(length / 1.8), matrix = path.getScreenCTM();
        return Array.from({ length: count + 1 }, (_, i) => {
          const { x, y } = path.getPointAtLength(length * i / count).matrixTransform(matrix);
          return { x, y };
        });
      });
    }
    async function draw(points) {
      await touch('touchStart', [points[0]]);
      for (const p of points.slice(1)) await touch('touchMove', [p]);
      await touch('touchEnd', []);
    }

    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4180/');
    assert.equal(await scriptButton('hiragana').getAttribute('aria-pressed'), 'true');
    assert.ok((await scriptButton('katakana').boundingBox()).height >= 44);
    await setScript('katakana');
    assert.equal(await text('.row-buttons [data-row="あ"] b'), 'ア');
    assert.match(await text('.row-selection p'), /サ → シ → ス → セ → ソ/);
    await noOverflow();
    fs.mkdirSync('test-results/kana-switch', { recursive: true });
    await page.screenshot({ path: 'test-results/kana-switch/home.png', animations: 'disabled' });

    await action('start-find').click();
    const first = await state();
    assert.equal(await text('.target-letter'), 'サ');
    await setScript('hiragana');
    assert.equal(await text('.target-letter'), 'さ');
    await setScript('katakana');
    assert.deepEqual((await state()).choices, first.choices);
    assert.deepEqual((await state()).journey, first.journey);
    await page.reload();
    assert.equal(await text('.target-letter'), 'サ');
    assert.equal(await scriptButton('katakana').getAttribute('aria-pressed'), 'true');
    while (!(await page.locator('.compound-question').count())) {
      const game = await state(), card = game.journey[game.station];
      await page.locator(`.choice[data-letter="${card.name[game.letterIndex]}"]`).click();
      await action('next').click();
    }
    const compoundGame = await state(), card = compoundGame.journey[compoundGame.station];
    assert.equal(await text('.target-letter'), katakana(card.compound));
    const options = page.locator('.choice');
    assert.deepEqual(await options.allTextContents(), compoundGame.choices.map(katakana));
    const clip = await page.evaluate(async sound => (await import('./src/announcement-manifest.js')).ANNOUNCEMENT_FILES[sound], card.compound);
    const response = page.waitForResponse(reply => reply.ok() && reply.url().endsWith(clip));
    await action('listen').click();
    await response;
    await action('sound').click();
    await action('settings').click();
    await page.locator('input[name="level"][value="listen"]').check();
    await page.goBack();
    assert.equal(await text('.target-letter'), '♪');
    assert.equal(await text('.picture-tag'), katakana(card.name.slice(0, compoundGame.letterIndex) + '？' +
      card.name.slice(compoundGame.letterIndex + card.compound.length)));
    await action('hint').click();
    assert.equal(await text('.target-letter'), katakana(card.compound));
    await page.screenshot({ path: 'test-results/kana-switch/question.png', animations: 'disabled' });
    await page.locator(`.choice[data-letter="${card.compound}"]`).click();
    assert.equal(await text('.choice.correct'), katakana(card.compound));
    await noOverflow();
    await action('next').click();
    while (await page.locator('.game').count()) {
      const game = await state(), current = game.journey[game.station];
      const answer = current.compound || current.name[game.letterIndex];
      await page.locator(`.choice[data-letter="${answer}"]`).click();
      await action('next').click();
    }
    const rewardTitle = page.locator('#reward-title');
    await rewardTitle.waitFor();
    assert.equal(await rewardTitle.textContent(), katakana((await state()).lastReward.name));
    await page.locator('[data-reward="continue"]').click();
    await page.locator('.finish').waitFor();

    await home();
    await action('collection').click();
    await page.locator('[data-action="train"][data-id="yokosuka"]').click();
    assert.equal(await text('.train-detail h1'), 'ヨコスカセン');
    await home();
    await action('alphabet').click();
    await page.locator('.kana-board [data-letter="っ"]').click();
    assert.equal(await text('#preview-character'), 'ッ');
    await setScript('hiragana');
    assert.equal(await text('#preview-character'), 'っ');
    await setScript('katakana');
    await home();
    await action('start-connect').click();
    await page.locator('[data-connect="choose"][data-id="komachi"]').click();
    assert.equal(await text('.connect-letter'), 'コ');
    await page.locator('.connect-letter').first().click();
    await setScript('hiragana');
    assert.equal((await state()).connectState.index, 1);
    assert.equal(await text('.connect-car.waiting .connect-ghost'), 'ま');
    await setScript('katakana');

    await home();
    await action('start-fill').click();
    await page.locator('[data-fill="random"]').click();
    await page.locator('[data-fill="answer"]:enabled').first().waitFor();
    const fill = (await state()).fillState;
    const fillCard = fill.cards[fill.station];
    assert.deepEqual(await page.locator('[data-fill="answer"]').allTextContents(), fillCard.options.map(katakana));
    await page.locator(`[data-fill="answer"][data-letter="${fillCard.name[fillCard.hole]}"]`).click();
    assert.equal(await text('.fill-name-hole.filled'), katakana(fillCard.name[fillCard.hole]));

    await home();
    await action('start-word').click();
    assert.equal(await text('.word-examples span'), 'トキ');
    await page.locator('[data-word="start"]').click();
    await page.locator('[data-word="sound"]').click();
    await page.locator('[data-word="answer"]:enabled').first().waitFor();
    const word = (await state()).wordState;
    const wordCard = word.cards[word.station];
    assert.deepEqual(await page.locator('[data-word="answer"]').allTextContents(),
      wordCard.options.map(katakana));
    await page.locator(`[data-word="answer"][data-name="${wordCard.name}"]`).click();
    assert.ok((await text('.word-ticket.correct')).startsWith(katakana(wordCard.name)));
    await action('sound').click();

    await home();
    await action('start-trace').click();
    await page.selectOption('#trace-row', 'や');
    await page.locator('[data-trace-letter="よ"]').click();
    assert.equal((await text('.trace-clue')).replace(/\s+/g, ' '), katakana((await state()).traceState.card.name) + ' の 「ヨ」');
    assert.equal(await page.locator('.trace-guide').count(), 3);
    const firstPoints = await strokePoints(0), midpoint = Math.floor(firstPoints.length / 2);
    await draw(firstPoints.slice(0, midpoint));
    const partial = (await state()).traceState.index;
    assert.ok(partial > 0);
    await setScript('hiragana');
    assert.equal(await page.locator('.trace-guide').count(), 2);
    assert.equal((await state()).traceState.index, 0);
    await setScript('katakana');
    assert.equal((await state()).traceState.index, partial);
    await page.reload();
    await page.locator('.trace-board').waitFor();
    assert.equal((await state()).traceState.index, partial);
    await draw((await strokePoints(0)).slice(midpoint - 1));
    for (const index of [1, 2]) await draw(await strokePoints(index));
    assert.equal((await state()).traceState.complete, true);

    if (process.env.TRACE_ALL_KATAKANA) {
      const { BASIC_KANA } = await import('../src/data.js');
      for (const letter of process.env.TRACE_KANA_SUBSET || BASIC_KANA) {
        await home();
        await action('start-trace').click();
        await page.selectOption('#trace-row', '');
        await page.locator(`[data-trace-letter="${letter}"]`).click();
        const count = await page.locator('.trace-guide').count();
        for (let i = 0; i < count; i++) {
          await draw(await strokePoints(i));
          const trace = (await state()).traceState;
          assert.equal(trace.stroke, i + 1, `${letter}, stroke ${i + 1}, sample ${trace.index}`);
        }
        assert.equal((await state()).traceState.complete, true, letter);
      }
    }
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.reload();
    await page.locator('.trace-board').waitFor();
    assert.equal(await scriptButton('katakana').getAttribute('aria-pressed'), 'true');
    assert.equal((await state()).traceState.complete, true);
    await noOverflow();
    assert.deepEqual(errors, []);
    console.log('Script switch passed: quiz state, compounds, Puck playback, all game modes, tracing drafts, reload and offline.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
