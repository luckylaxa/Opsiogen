// A still from the middle of every shot, for checking the cut. Usage: node sheet.cjs OUT_DIR
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.5 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + require('path').join(__dirname, 'reel.html'));
  const info = await p.evaluate(() => window.ready); console.log(JSON.stringify(info));
  const cuts = await p.evaluate(() => window.CUTS.concat(window.DUR));
  for (let i = 0; i < cuts.length - 1; i++) {
    await p.evaluate((v) => window.setT(v), cuts[i] + (cuts[i + 1] - cuts[i]) * 0.7);
    await p.screenshot({ path: `${out}/s${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 80 });
  }
  await b.close();
})();
