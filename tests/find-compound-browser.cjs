const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel:'msedge', headless:true, args:['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport:{width:320,height:667}, serviceWorkers:'block' });
    const errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    await page.addInitScript(()=>{
      if (!localStorage.getItem('train-hiragana-v1')) {
        localStorage.setItem('train-hiragana-v1', JSON.stringify({rows:['さ'],sound:false}));
      }
    });
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4180/');
    const changeSetting = async (name,value)=>{
      await page.locator('[data-action="settings"]').click();
      await page.locator(`input[name="${name}"][value="${value}"]`).check();
    };
    const count = ()=>page.evaluate(()=>history.state.journey.filter(card=>card.compound).length);
    await page.locator('[data-action="start-find"]').click();
    assert.equal(await count(),1,'the default journey introduces one compound');
    await changeSetting('find-compounds','more');
    await page.goBack();
    assert.equal(await count(),1,'Back restores the original journey');
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="start-find"]').click();
    assert.equal(await count(),3);
    while (!(await page.locator('.compound-question').count())) {
      const target = await page.locator('.target-letter').textContent();
      await page.locator(`.choice[data-letter="${target}"]`).click();
      await page.locator('[data-action="next"]').click();
    }
    const {target,name,index} = await page.evaluate(()=>{
      const {journey,station,letterIndex}=history.state,card=journey[station];
      return {target:card.compound,name:card.name,index:letterIndex};
    });
    assert.equal(await page.locator('.question .name-target').textContent(),target);
    await changeSetting('find-choices','3');
    await page.goBack();
    assert.equal(await page.locator('.choice').count(),3);
    const options=await page.locator('.choice').evaluateAll(buttons=>buttons.map(button=>({
      text:button.textContent,fits:button.scrollWidth<=button.clientWidth && button.getBoundingClientRect().height>=48
    })));
    assert.ok(options.every(option=>option.text.length===2 && option.fits),JSON.stringify(options));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:'test-results/find-compound-320.png',fullPage:true});
    await changeSetting('level','listen');
    await page.goBack();
    assert.equal(await page.locator('.target-letter').textContent(),'♪');
    assert.equal(await page.locator('.picture-tag').textContent(),name.slice(0,index)+'？'+name.slice(index+2));
    await page.locator(`.choice:not([data-letter="${target}"])`).first().click();
    assert.equal(await page.locator('.target-letter').textContent(),'♪');
    const clip = await page.evaluate(async target=>(await import('./src/announcement-manifest.js')).ANNOUNCEMENT_FILES[target],target);
    const recording = page.waitForResponse(response=>response.ok() && response.url().endsWith(clip));
    await page.locator('[data-action="listen"]').click();
    await recording;
    await page.locator('[data-action="hint"]').click();
    assert.equal(await page.locator('.target-letter').textContent(),target);
    await page.locator(`.choice[data-letter="${target}"]`).click();
    assert.equal(await page.locator('.choice.correct').textContent(), target);
    assert.equal(await page.locator('.picture-tag').textContent(), name);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('train-hiragana-v1')).findCompounds),'more');
    assert.deepEqual(errors,[]);
    console.log('Small kana passed: frequency, Back, 320px three choices, listen, wrong answer, Puck audio, hint, and correct answer.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
