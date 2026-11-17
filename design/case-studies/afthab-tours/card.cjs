// Renders the work card (800x600 and 600x771 at 2x) from card.html into out/. Run from this folder: node card.cjs
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'card.html'));
  await p.waitForTimeout(600);
  for (const id of ['card', 'card-phone']) await (await p.$('#' + id)).screenshot({ path: `out/${id}.png` });
  await b.close();
})();
