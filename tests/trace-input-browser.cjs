const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  try {
    const context = await browser.newContext({...devices['Pixel 7']});
    const page = await context.newPage(), errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.addInitScript(()=>localStorage.setItem('train-hiragana-v1',JSON.stringify({sound:false,rows:['や']})));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4180/');
    await page.click('[data-action="start-trace"]'); await page.click('[data-trace-letter="よ"]');
    const cdp = await context.newCDPSession(page);
    const send=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
    async function points(i) {
      await page.locator('.trace-board').scrollIntoViewIfNeeded();
      return page.locator(`[data-stroke="${i}"]`).evaluate(p=>{
        const n=Math.ceil(p.getTotalLength()/2),m=p.getScreenCTM();
        return Array.from({length:n+1},(_,j)=>{const q=p.getPointAtLength(p.getTotalLength()*j/n).matrixTransform(m);return{x:q.x,y:q.y,id:1};});
      });
    }
    let line=await points(0);
    await send('touchStart',[line[0]]);
    await send('touchStart',[line[0],{...line[1],id:2}]);
    await send('touchMove',[line[0],{...line.at(-1),id:2}]);
    await send('touchEnd',[]);
    assert.equal(await page.evaluate(()=>history.state.traceState.index),0,'secondary finger cannot draw');
    // Move off the track. Re-entry at the far end must not award a stroke.
    await send('touchStart',[line[0]]);
    await send('touchMove',[{...line[0],y:line[0].y+95}]);
    await send('touchMove',[line.at(-1)]);
    await send('touchEnd',[]);
    assert.equal(await page.evaluate(()=>history.state.traceState.stroke),0);
    // Mouse input works too, and switching views during a demo cancels its animation.
    await page.click('[data-trace="demo"]');
    await page.click('[data-action="settings"]');
    await page.goBack(); await page.locator('.trace-board').waitFor();
    assert.equal(await page.locator('[data-trace="demo"]').textContent(),'▷ おてほん');
    for(let i=0;i<2;i++) {
      line=await points(i);
      await page.mouse.move(line[0].x,line[0].y); await page.mouse.down();
      for(const p of line.slice(1)) await page.mouse.move(p.x,p.y);
      await page.mouse.up();
    }
    assert.equal(await page.evaluate(()=>history.state.traceState.complete),true);
    await page.locator('.trace-arrival img').evaluate(img=>img.decode());
    await page.screenshot({path:'test-results/trace-arrival-mobile.png',fullPage:true,animations:'disabled'});
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('train-hiragana-v1')).stamps.length);
    await page.click('[data-action="settings"]'); await page.goBack();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('train-hiragana-v1')).stamps.length),saved);
    assert.deepEqual(errors,[]);
    // No storage is required to play or finish a letter.
    const blocked=await browser.newPage();
    await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('unavailable')}}));
    await blocked.goto(process.env.TEST_URL || 'http://127.0.0.1:4180/');
    await blocked.click('[data-action="sound"]');
    await blocked.click('[data-action="start-trace"]');
    await blocked.selectOption('#trace-row','か'); await blocked.click('[data-trace-letter="く"]');
    await blocked.locator('.trace-board').scrollIntoViewIfNeeded();
    const curve=await blocked.locator('[data-stroke="0"]').evaluate(p=>{
      const n=Math.ceil(p.getTotalLength()/2),m=p.getScreenCTM();
      return Array.from({length:n+1},(_,j)=>{const q=p.getPointAtLength(p.getTotalLength()*j/n).matrixTransform(m);return{x:q.x,y:q.y};});
    });
    await blocked.mouse.move(curve[0].x,curve[0].y);await blocked.mouse.down();
    for(const p of curve.slice(1)) await blocked.mouse.move(p.x,p.y);
    await blocked.mouse.up();
    assert.equal(await blocked.evaluate(()=>history.state.traceState.complete),true);
    console.log('Trace input passed: secondary fingers, off-track/re-entry, mouse, demo navigation cleanup, no duplicate stamps, unavailable storage.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
