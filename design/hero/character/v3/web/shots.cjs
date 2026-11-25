// Saves pictures of the website character from viewer.html (served from the repository root on port 8765).
// Usage: node shots.cjs OUT_DIR 'JSON list of [name, state]' [size] [distance]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [out, list, size = '640', dist = '9.6'] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +size, height: +size } });
  p.on('console', (m) => console.log('console:', m.text())); p.on('pageerror', (e) => console.log('error:', e.message));
  await p.goto(`http://127.0.0.1:8765/design/hero/character/v3/web/viewer.html?size=${size}&dist=${dist}`); await p.evaluate(() => window.ready);
  fs.mkdirSync(out, { recursive: true });
  for (const [name, state] of JSON.parse(list)) {
    const url = await p.evaluate((s) => window.shot(s), state);
    fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close();
})();
