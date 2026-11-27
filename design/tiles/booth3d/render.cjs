// Renders the TV on its stand (tv.html) for one booth photo: node render.cjs PARAMS.json OUT.png
// The page and three.js are served from disk under http://local/ so its ES modules load.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const MAP = { '/three/': 'node_modules/three/', '/booth3d/': 'design/tiles/booth3d/', '/ai/': 'design/tiles/out/figma-print/ai/' };
const TYPES = { '.js': 'text/javascript', '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png' };
(async () => {
  const P = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('page:', m.text()); });
  page.on('pageerror', (e) => console.log('page error:', e.message));
  await page.route('http://local/**', (route) => {
    const p = new URL(route.request().url()).pathname;
    const key = Object.keys(MAP).find((k) => p.startsWith(k));
    if (!key) return route.fulfill({ status: 404, body: '' });
    const file = path.join(ROOT, MAP[key], p.slice(key.length));
    route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  await page.goto('http://local/booth3d/tv.html');
  await page.waitForFunction(() => window.ready === true && typeof window.renderBooth === 'function', null, { timeout: 30000 });
  const url = await page.evaluate((p) => window.renderBooth(p), P);
  fs.writeFileSync(process.argv[3], Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', process.argv[3]);
  await browser.close();
})();
