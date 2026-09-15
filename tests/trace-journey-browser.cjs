const {chromium,devices}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try {
    const page=await browser.newPage({...devices['Pixel 7'],reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      if(!localStorage.getItem('train-hiragana-v1'))localStorage.setItem('train-hiragana-v1',JSON.stringify({sound:true,rows:['や']}));
      window.voiceCalls=[];
      window.Audio=class {pause(){} play(){window.voiceCalls.push(this.src);return Promise.resolve();}};
    });
    await page.goto(process.env.TEST_URL||'http://127.0.0.1:4180/');
    await page.click('[data-action="start-trace"]');
    await page.click('[data-trace-letter="よ"]');
    async function checkVoice(){
      assert.ok(await page.evaluate(async()=>{
        const {tracePromptText}=await import('./src/voice-lines.js');
        const {VOICE_FILES}=await import('./src/voice-manifest.js');
        const s=history.state.traceState;
        return voiceCalls.at(-1)?.endsWith(VOICE_FILES[tracePromptText(s.card,s.letter)]);
      }),'the train name and target letter are narrated together');
    }
    async function draw(){
      for(let i=0;i<await page.locator('.trace-guide').count();i++){
        await page.locator('.trace-board').scrollIntoViewIfNeeded();
        const points=await page.locator(`[data-stroke="${i}"]`).evaluate(p=>{
          const n=Math.ceil(p.getTotalLength()/2),m=p.getScreenCTM();
          return Array.from({length:n+1},(_,j)=>{const q=p.getPointAtLength(p.getTotalLength()*j/n).matrixTransform(m);return{x:q.x,y:q.y};});
        });
        await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();
        for(const p of points.slice(1))await page.mouse.move(p.x,p.y);
        await page.mouse.up();
      }
    }
    await checkVoice();
    await page.click('[data-trace="prompt"]');await checkVoice();
    for(let n=1;n<=5;n++){
      await draw();
      assert.equal(await page.evaluate(()=>history.state.traceState.completedCards.length),n);
      if(n===1){
        await page.click('[data-trace="reset"]');await draw();
        assert.equal(await page.evaluate(()=>history.state.traceState.completedCards.length),1,'retry is not a second completion');
        await page.click('[data-action="settings"]');await page.goBack();
        await page.locator('.trace-page').waitFor();
        assert.equal(await page.evaluate(()=>history.state.traceState.completedCards.length),1);
      }
      if(n<5){
        assert.equal(await page.locator('dialog[open]').count(),0);
        await page.click('[data-trace="next"]');
        assert.equal(await page.evaluate(()=>window.scrollY),0,'next letter starts at the top');
        await checkVoice();
      }
    }
    await page.click('[data-action="settings"]');
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('dialog[open]').count(),0,'leaving cancels the pending reward');
    await page.goBack();await page.locator('.trace-page').waitFor();
    await page.locator('.finish').waitFor();
    await page.locator('dialog[open]').waitFor();
    assert.equal(await page.locator('.earned-trains > div').count(),5);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('train-hiragana-v1')).trips),1);
    // Back closes the reward; reloading doesn't repeat it or count the journey twice.
    await page.goBack();await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
    await page.reload();await page.locator('.finish').waitFor();
    assert.equal(await page.locator('dialog[open]').count(),0);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('train-hiragana-v1')).trips),1);
    await page.click('[data-action="replay-reward"]');await page.locator('dialog[open]').waitFor();
    await page.goBack();
    await page.locator('.finish [data-action="home"]').click();await page.locator('.home').waitFor();
    await page.click('[data-action="start-trace"]');
    assert.equal(await page.evaluate(()=>history.state.traceState.completedCards.length),0);
    // Decode every newly generated narration, not just the manifest entries.
    const decoded=await page.evaluate(async()=>{
      const {VOICE_FILES}=await import('./src/voice-manifest.js');
      const files=Object.entries(VOICE_FILES).filter(([line])=>line.includes('でんしゃと いっしょに、なぞってみよう')).map(([,file])=>file);
      const audio=new AudioContext();
      try{for(const file of files){const data=await(await fetch('./assets/voice/'+file)).arrayBuffer();const clip=await audio.decodeAudioData(data);if(clip.duration<1)throw Error(file);}return files.length;}finally{await audio.close();}
    });
    assert.equal(decoded,89);
    assert.deepEqual(errors,[]);
    console.log('Trace journey passed: top scroll, 89 recorded prompts decoded, five completions/reward, retry deduplication, settings/Back/reload/replay/new trip.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
