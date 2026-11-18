// Renders the reel frame by frame. Usage: node render.cjs OUT_DIR [workers]
const { chromium } = require('playwright');
const path = require('path');
const FPS = 30, DUR = 60, N = FPS * DUR;
(async () => {
  const out = process.argv[2], workers = Number(process.argv[3] || 3);
  const b = await chromium.launch();
  await Promise.all([...Array(workers)].map(async (_, w) => {
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    await p.goto('file://' + path.join(__dirname, 'reel.html'));
    await p.evaluate(() => window.ready);
    for (let f = w; f < N; f += workers) {
      await p.evaluate((v) => window.setT(v), f / FPS);
      await p.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
    }
    await p.close();
  }));
  await b.close(); console.log('frames', N);
})();
