// Writes the cut list (times and kinds) for the music. Usage: node cuts.cjs > cuts.json
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + require('path').join(__dirname, 'reel.html') + (process.env.REEL_QUERY || ''));
  await p.evaluate(() => window.ready);
  console.log(JSON.stringify(await p.evaluate(() => ({ dur: window.DUR, q: window.Q, cuts: window.CUTS, kinds: window.KINDS }))));
  await b.close();
})();
