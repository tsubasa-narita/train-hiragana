const { chromium } = require('playwright');
const http = require('node:http');
const { readFile, mkdtemp } = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
(async () => {
  const root = process.cwd();
  const server = http.createServer(async (req,res) => {
    const url = new URL(req.url,'http://localhost');
    if (!url.pathname.startsWith('/train-hiragana/')) { res.writeHead(404).end(); return; }
    const name = url.pathname.slice('/train-hiragana/'.length) || 'index.html';
    const file = path.resolve(root,name);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const types = {'.js':'application/javascript','.html':'text/html','.css':'text/css','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
      res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream'}).end(await readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let context;
  try {
    const profile=await mkdtemp(path.join(os.tmpdir(),'train-hiragana-pwa-test-'));
    context=await chromium.launchPersistentContext(profile,{headless:true,channel:'msedge'});
    const page=await context.newPage();
    const base=`http://127.0.0.1:${server.address().port}/train-hiragana/`;
    await page.goto(base);
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistration()).scope),base);
    const cdp=await context.newCDPSession(page);
    await cdp.send('Page.enable');
    assert.deepEqual((await cdp.send('Page.getInstallabilityErrors')).installabilityErrors,[]);
    await page.locator('[data-action="settings"]').click();
    await context.setOffline(true);
    await page.reload(); await page.locator('.settings').waitFor();
    await page.goBack(); await page.locator('.home').waitFor();
    assert.equal(await page.url(),base);
    console.log('GitHub Pages prefix passed: Chromium reports zero installability errors, correct service worker scope, offline reload and Back. No app was installed on the host.');
  } finally {
    await context?.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(e=>{console.error(e);process.exit(1)});
