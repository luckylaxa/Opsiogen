const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 917 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'mock-notext.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const ids = await p.$$eval('.m', (els) => els.map((e) => e.id));
  for (const id of ids) await (await p.$('#' + id)).screenshot({ path: process.argv[2] + `/afthab-tours_${id}.png` });
  console.log(ids.length); await b.close();
})();
