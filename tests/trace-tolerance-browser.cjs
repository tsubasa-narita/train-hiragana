const {chromium,devices}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try{
    const page=await browser.newPage({...devices['Pixel 7'],reducedMotion:'reduce'});
    await page.addInitScript(()=>localStorage.setItem('train-hiragana-v1',JSON.stringify({sound:false,rows:['や']})));
    await page.goto(process.env.TEST_URL||'http://127.0.0.1:4180/');
    const result=await page.evaluate(async()=>{
      const {KANA_STROKES}=await import('./src/kana-strokes.js');
      const {sampleStroke,createTracker}=await import('./src/trace-engine.js');
      const failures=[];let count=0;
      for(const [letter,strokes] of Object.entries(KANA_STROKES))for(const [i,d] of strokes.entries()){
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);
        const samples=sampleStroke(path),tracker=createTracker(samples);
        tracker.begin(samples[0]);
        for(const point of samples.slice(1)){if(tracker.done)break;tracker.move(point);}
        if(!tracker.done)failures.push(`${letter}-${i+1}`);count++;
      }
      return {count,failures};
    });
    assert.equal(result.count,104);assert.deepEqual(result.failures,[]);
    await page.click('[data-action="start-trace"]');await page.click('[data-trace-letter="よ"]');
    const cdp=await page.context().newCDPSession(page);
    async function draw(i,offset){
      await page.locator('.trace-board').scrollIntoViewIfNeeded();
      const points=await page.locator(`[data-stroke="${i}"]`).evaluate((path,offset)=>{
        const length=path.getTotalLength(),last=length-(offset?1.5:0),m=path.getScreenCTM(),n=Math.ceil(last/1.5);
        return Array.from({length:n+1},(_,j)=>{
          const p=path.getPointAtLength(last*j/n);p.y+=offset;
          const q=p.matrixTransform(m);return{x:q.x,y:q.y,id:1};
        });
      },offset);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});
      for(const p of points.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
    // About 25 px off the line on a phone; end slightly before the endpoint.
    await draw(0,8.5);
    assert.equal(await page.evaluate(()=>history.state.traceState.stroke),1);
    await draw(1,0);
    assert.equal(await page.evaluate(()=>history.state.traceState.complete),true);
    assert.equal(await page.locator('.trace-arrival').isVisible(),true);
    console.log('Tolerance passed: all 104 source strokes, Android touch offset from the track, forgiving endpoint, completed train reveal.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
