// A brand name in white script for a drawing filler (owner, 27 Nov, on the bag drawing: "1 with some brand name"),
// like the hand-lettered name on a bag: Yellowtail, a deep-pink edge so it reads on light stripes, tilted a little.
// Rendered three times the size the film needs, on a clear ground. Usage: node mark.cjs "NAME" OUT.png [SIZE] [ANGLE]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [name, out, size = '78', angle = '-7'] = process.argv.slice(2), s = 3, fs = +size * s;
  const font = 'data:font/woff2;base64,' + require('fs').readFileSync(path.join(__dirname, '../../tiles/ooh/art/fonts/yellowtail-latin-400-normal.woff2')).toString('base64');
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1400, height: 700 } });
  await p.setContent(`<style>@font-face{font-family:Y;src:url(${font})}html,body{margin:0;background:transparent}
    #m{display:inline-block;padding:${fs * .3}px ${fs * .4}px;font:400 ${fs}px/1.1 Y;color:#fff;white-space:nowrap;
    text-shadow:${s * 2.4}px ${s * 3}px 0 #b3124a;transform:rotate(${angle}deg)}</style><span id="m">${name}</span>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
  const ok = await p.evaluate(() => document.fonts.check('40px Y')); if (!ok) throw new Error('script font not loaded');
  await p.locator('#m').screenshot({ path: out, omitBackground: true }); await b.close(); console.log('wrote', out);
})();
