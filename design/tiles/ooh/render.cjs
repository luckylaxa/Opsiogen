// Renders the three artworks in art/ooh.html to art/rs.png, art/nc.png, art/sl.png. Usage: node render.cjs
const { chromium } = require('playwright');
const path = require('path');
const ART = path.join(__dirname, 'art');
const jobs = [['rs', 2460, 1000, 1], ['nc', 1404, 2000, 1], ['sl', 2030, 1150, 2]];
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [a, w, h, s] of jobs) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s });
    await page.goto('file://' + path.join(ART, 'ooh.html') + '?a=' + a);
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.locator('#' + a).screenshot({ path: path.join(ART, a + '.png') });
    console.log('wrote', a + '.png', w * s, 'x', h * s);
    await page.close();
  }
  await browser.close();
})();
