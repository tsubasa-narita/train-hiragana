const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({headless:true,channel:'msedge'});
 try {
  const page = await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
  await page.addInitScript(() => {
   localStorage.setItem('train-hiragana-v1',JSON.stringify({sound:true}));
   window.played=[];
   const original=HTMLMediaElement.prototype.play;
   HTMLMediaElement.prototype.play=function(){
    window.played.push({src:this.src,time:Date.now()});
    const clip=window.played.at(-1);
    this.addEventListener('ended',()=>clip.ended=Date.now(),{once:true});
    return original.call(this);
   };
  });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/');
  const files=await page.evaluate(async()=>{
   const {VOICE_FILES}=await import('/src/voice-manifest.js');
   const {ANNOUNCEMENT_FILES}=await import('/src/announcement-manifest.js');
   return {...VOICE_FILES,...ANNOUNCEMENT_FILES};
  });
  const decode=await page.evaluate(async files=>{
   const ctx=new AudioContext(), results=[];
   for(const letter of ['こ','ま','ち','ゃ','っ','のばす おと']) {
    const buffer=await ctx.decodeAudioData(await (await fetch('/assets/voice/'+files[letter])).arrayBuffer());
    const pcm=buffer.getChannelData(0); let peak=0;
    for(const value of pcm) peak=Math.max(peak,Math.abs(value));
    results.push({letter,peak,duration:buffer.duration});
   }
   await ctx.close();return results;
  },files);
  for(const result of decode) assert.ok(result.peak>.01,JSON.stringify(result));
  await page.locator('[data-action="start-connect"]').click();
  await page.locator('[data-connect="choose"][data-id="komachi"]').click();
  await page.waitForFunction(file=>window.played.some(p=>p.src.endsWith(file)&&p.ended),files['こ']);
  assert.ok((await page.evaluate(()=>window.played.map(p=>p.src))).at(-1).endsWith(files['こ']),'first target is announced after the name');
  for(const letter of ['こ','ま','ち']) {
   await page.locator('[data-connect="letter"][data-letter="'+letter+'"]').click();
   assert.equal(await page.locator('[data-connect="name"]').isDisabled(),true);
   await page.locator('[data-connect="name"]').dispatchEvent('click');
   if(letter==='ち') {
    assert.equal(await page.locator('.connect-assembly.assembled').count(),0,'tour must not hide the entering last car');
    assert.equal(await page.locator('.assembly-car.incoming').count(),1);
    await page.screenshot({path:'test-results/connect-last-car-audio.png'});
   }
   await page.waitForFunction(file=>window.played.at(-1)?.src.endsWith(file)&&window.played.at(-1)?.ended,files[letter]);
   await page.waitForFunction(()=>Date.now()>=(history.state.connectState.lockedUntil||0));
  }
  await page.locator('.connect-assembly.assembled').waitFor();
  const played=await page.evaluate(()=>window.played.map(p=>p.src));
  assert.deepEqual(played.slice(-3).map(src=>src.split('/').at(-1)),['こ','ま','ち'].map(c=>files[c].split('/').at(-1)));
  assert.equal(await page.locator('.reward-dialog').count(),0);
  assert.equal(await page.locator('.connect-next').isEnabled(),true);
  // Long marks always use the prerecorded narration rather than silent fallback.
  await page.evaluate(async()=>{const {playVoice}=await import('/src/voice.js');await playVoice('ー');});
  assert.ok((await page.evaluate(()=>window.played.at(-1).src)).endsWith(files['のばす おと']));
  await page.locator('[data-action="home"]').first().click();
  await page.locator('[data-action="start-find"]').click();
  let praiseRequest;
  await page.route('**/assets/voice/'+files['できたね！'],route=>{praiseRequest=route;});
  const target=await page.locator('.target-letter').textContent();
  await page.locator('.choice[data-letter="'+target+'"]').click();
  await page.waitForTimeout(1400);
  assert.ok(praiseRequest,'praise audio was requested');
  assert.equal(await page.evaluate(()=>history.state.station),0,'next question waits for delayed praise playback');
  await praiseRequest.fulfill({path:require('node:path').resolve('assets/voice/'+files['できたね！'])});
  await page.waitForFunction(()=>history.state.station===1);
  console.log('Audio checks passed: audible kana, initial cue, all three completed syllables, guarded auxiliary taps, final coupling hold, long mark.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
