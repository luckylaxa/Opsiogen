// Renders art/rouge.html's four layouts to art/rc-bb.png, rc-sh.png, rc-sc.png and rc-ad.png. Usage: node render-rouge.cjs
const { chromium } = require('playwright');
const path = require('path');
const ART = path.join(__dirname, 'art');
const jobs = [['bb', 2460, 1000, 1], ['sh', 1404, 2000, 1], ['sc', 2030, 1150, 2], ['ad', 1920, 1080, 1]];
(async () => {
  const browser = await browser0();
  for (const [a, w, h, s] of jobs) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s });
    page.on('pageerror', (e) => console.log('ERR', e.message));
    await page.goto('file://' + path.join(ART, 'rouge.html') + '?a=' + a);
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 15000 });
    await page.waitForTimeout(200);
    await page.locator('#' + a).screenshot({ path: path.join(ART, 'rc-' + a + '.png') });
    console.log('wrote', 'rc-' + a + '.png', w * s, 'x', h * s);
    await page.close();
  }
  await browser.close();
})();
function browser0() { return chromium.launch({ args: ['--allow-file-access-from-files'] }); }
