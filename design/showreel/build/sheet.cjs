// Stills from the reel at chosen times, for checking the shots. Usage: node sheet.cjs OUT_DIR t1 t2 ...
const { chromium } = require('playwright');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.5 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + require('path').join(__dirname, 'reel.html'));
  console.log('scenes', await p.evaluate(() => window.ready));
  for (const t of ts) {
    await p.evaluate((v) => window.setT(v), Number(t));
    await p.screenshot({ path: `${out}/t${String(Math.round(t * 100)).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 80 });
  }
  await b.close();
})();
