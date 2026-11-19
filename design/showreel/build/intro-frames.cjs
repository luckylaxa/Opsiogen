// Saves the intro's character frames (intro-frames.html): one full turn as a strip, and the front alone, larger.
// Usage: node intro-frames.cjs OUT_DIR   (then intro_sprite.py makes the site's WebP files from them)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = process.argv[2], TURN = 12;
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 640 } });
  p.on('console', (m) => console.log('console:', m.text()));
  await p.goto('file://' + path.join(__dirname, 'intro-frames.html')); await p.evaluate(() => window.ready);
  const save = (name, url) => fs.writeFileSync(path.join(out, name), Buffer.from(url.split(',')[1], 'base64'));
  for (let k = 0; k < TURN; k++) save(`turn-${String(k).padStart(2, '0')}.png`, await p.evaluate((y) => window.frame(y), (2 * Math.PI * k) / TURN));
  save('front.png', await p.evaluate(() => window.frame(0)));
  await b.close();
})();
