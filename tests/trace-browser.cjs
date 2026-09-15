const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.TEST_URL || 'http://127.0.0.1:4180/';
(async () => {
  const browser = await chromium.launch({ headless:true, channel:'msedge' });
  try {
    const context = await browser.newContext({ ...devices['Pixel 7'] });
    await context.addInitScript(() => { if (!localStorage.getItem('train-hiragana-v1')) localStorage.setItem('train-hiragana-v1', JSON.stringify({sound:false})); });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const cdp = await context.newCDPSession(page);
    const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints:points.map(p=>({x:p.x,y:p.y,id:1})), modifiers:0 });
    async function strokePoints(i) {
      await page.locator('.trace-board').scrollIntoViewIfNeeded();
      return page.locator(`[data-stroke="${i}"]`).evaluate(p => {
        const n = Math.ceil(p.getTotalLength()/1.8), m = p.getScreenCTM();
        return Array.from({length:n+1},(_,j)=>{const q=p.getPointAtLength(p.getTotalLength()*j/n).matrixTransform(m);return {x:q.x,y:q.y};});
      });
    }
    async function draw(points) {
      await touch('touchStart',[points[0]]);
      for (const p of points.slice(1)) await touch('touchMove',[p]);
      await touch('touchEnd',[]);
    }
    const state = () => page.evaluate(()=>history.state.traceState);
    await page.goto(base);
    await page.click('[data-action="start-trace"]');
    await page.selectOption('#trace-row','や');
    await page.click('[data-trace-letter="よ"]');
    assert.match(await page.locator('.trace-clue').innerText(),/よこすかせん/);
    assert.equal(await page.locator('.trace-arrival').isVisible(),false);
    await draw(await strokePoints(1)); // second stroke before the first
    assert.equal((await state()).stroke,0);
    await draw((await strokePoints(0)).reverse());
    assert.equal((await state()).stroke,0);
    // The demonstration must never earn a stroke or a stamp.
    await page.click('[data-trace="demo"]');
    await page.waitForTimeout(2300);
    assert.equal((await state()).stroke,0);
    assert.equal((await state()).index,0);
    // Partial input survives settings / Android Back / reload.
    const first = await strokePoints(0), half = Math.floor(first.length/2);
    await draw(first.slice(0,half));
    const partial = (await state()).index;
    assert.ok(partial>0);
    await page.click('[data-action="settings"]');
    await page.goBack(); await page.locator('.trace-board').waitFor();
    assert.equal((await state()).index,partial);
    await page.reload(); await page.locator('.trace-board').waitFor();
    assert.equal((await state()).index,partial);
    const resumed = await strokePoints(0);
    await draw(resumed.slice(half-1));
    assert.equal((await state()).stroke,1);
    await draw(await strokePoints(1));
    assert.equal((await state()).complete,true);
    await page.locator('.trace-arrival img').evaluate(img=>img.decode());
    await page.screenshot({path:'test-results/trace-arrival-mobile.png',fullPage:true,animations:'disabled'});
    assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('train-hiragana-v1')).stamps.includes(history.state.traceState.card.id)));
    await page.click('[data-trace="next"]');
    assert.equal((await state()).letter,'や');
    // Each of the 46 letters can actually be completed using Android touch input.
    await page.selectOption('#trace-row','');
    const letters = await page.locator('[data-trace-letter]').evaluateAll(buttons=>buttons.map(b=>b.dataset.traceLetter));
    assert.equal(letters.length,46);
    for (const letter of letters) {
      await page.locator(`[data-trace-letter="${letter}"]`).click();
      const count = await page.locator('.trace-guide').count();
      for (let i=0;i<count;i++) {
        assert.equal(await page.locator('.trace-arrival').isVisible(),false,letter);
        await draw(await strokePoints(i));
        assert.equal((await state()).stroke,i+1,`${letter} stroke ${i+1}`);
      }
      assert.equal((await state()).complete,true,letter);
      assert.equal(await page.locator('.trace-arrival').isVisible(),true,letter);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),letter+' overflow');
    }
    // Reset must hide the train; cancellation must leave a resumable active stroke.
    await page.click('[data-trace="reset"]');
    assert.equal((await state()).complete,false);
    let points = await strokePoints(0);
    await touch('touchStart',[points[0]]);
    await touch('touchMove',[points[3]]);
    await touch('touchCancel',[]);
    assert.ok((await state()).index>0);
    await draw(points.slice(3));
    assert.equal((await state()).complete,true);
    await page.click('[data-action="home"]');
    await page.locator('.home').waitFor();
    await page.goForward(); await page.locator('.trace-page').waitFor();
    assert.equal((await state()).complete,true);
    // Previously loaded content and all stroke data work with the network disabled.
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await context.setOffline(true); await page.reload();
    await page.locator('.trace-board').waitFor();
    await page.click('[data-trace="reset"]');
    await draw(await strokePoints(0));
    assert.equal((await state()).complete,true);
    await context.setOffline(false);
    // Reduced-motion demonstrations remain static and don't complete a letter.
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.click('[data-trace="reset"]');
    await page.click('[data-trace="demo"]');
    const before = await page.locator('.trace-engine').getAttribute('transform');
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.trace-engine').getAttribute('transform'),before);
    assert.equal((await state()).complete,false);
    assert.deepEqual(errors,[]);
    // Desktop / compact Android layouts.
    await context.setOffline(false);
    const desktop = await browser.newPage({viewport:{width:1280,height:900}});
    await desktop.goto(base); await desktop.click('[data-action="start-trace"]');
    await desktop.selectOption('#trace-row','や'); await desktop.click('[data-trace-letter="よ"]');
    await desktop.screenshot({path:'test-results/trace-desktop.png',fullPage:true});
    await desktop.setViewportSize({width:320,height:740});
    assert.ok(await desktop.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320px overflow');
    console.log('Tracing passed: all 46 kana / 104 strokes, Android touch, direction/order, demo, resume, Back, reload, offline, reduced motion and layouts.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
