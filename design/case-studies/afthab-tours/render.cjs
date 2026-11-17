const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 917 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'mock.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const ids = await p.$$eval('.m', els => els.map(e => e.id));
  for (const id of ids) { const el = await p.$('#' + id); await el.screenshot({ path: `out/${id}.png` }); }
  console.log(ids.join(' '));
  await b.close();
})();
