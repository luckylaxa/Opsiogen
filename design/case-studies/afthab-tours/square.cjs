// Renders each square (phone) frame of square.html at 2x into out/. Run from this folder: node square.cjs
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'square.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const ids = await p.$$eval('.sq', (els) => els.map((e) => e.id));
  for (const id of ids) await (await p.$('#' + id)).screenshot({ path: `out/${id}.png` });
  console.log(ids.join(' '));
  await b.close();
})();
