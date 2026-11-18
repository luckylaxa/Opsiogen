// Cuts our character out of the live Home hero in a few poses (transparent PNGs), for the film.
// Usage: node character.cjs OUT_DIR
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2, colorScheme: 'dark' });
  await p.goto('https://opsiogen.vercel.app/', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(9000);
  const sel = 'button[aria-label^="Our character"]';
  // Only the character stays visible, large, on a transparent page.
  await p.addStyleTag({ content: `html,body{background:transparent!important} body *{visibility:hidden!important} ${sel},${sel} *{visibility:visible!important} ${sel}{--w:520px!important;right:540px!important;bottom:240px!important} [data-flash],[data-flash] *{visibility:hidden!important}` });
  await p.waitForTimeout(1500);
  const el = await p.$(sel); const r = await el.boundingBox();
  const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  console.log('box', Math.round(r.width), Math.round(r.height));
  const clip = { x: r.x - 60, y: r.y - 60, width: r.width + 120, height: r.height + 120 };
  // It never holds still, so take a run of moments at each pointer place and keep the best by eye.
  const places = { idle: null, left: [150, 520], right: [1450, 520], up: [800, 60], mid: [800, 760] };
  for (const [n, at] of Object.entries(places)) {
    if (at) await p.mouse.move(at[0], at[1], { steps: 8 });
    for (let i = 0; i < 4; i++) { await p.waitForTimeout(900); await p.screenshot({ path: `${out}/ch-${n}${i}.png`, clip, omitBackground: true }); }
  }
  await b.close();
})();
