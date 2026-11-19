// Backdrops for the cursor-and-dock concept, from the live Home page (desktop, 1440x900): the first screen with the
// live character hidden (its pool of light kept), the real colour change after a press on empty hero space (stepped
// frame by frame), and a smooth scroll down to the work, frame by frame. Usage: node dock_bg.cjs OUT_DIR [theme]
const { chromium } = require('playwright'); const fs = require('fs');
const [out, theme = 'dark'] = process.argv.slice(2), FPS = 60;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: theme });
  await p.addInitScript((t) => { try { sessionStorage.setItem('op-preloaded', '1'); localStorage.setItem('theme', t); } catch {} }, theme);
  await p.goto('https://opsiogen.vercel.app/', { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(4000);
  const m = await p.evaluate(() => {
    const ch = document.querySelector('[data-intro-land]'); ch.querySelectorAll(':scope > img, :scope > canvas').forEach((e) => (e.style.visibility = 'hidden'));
    const r = (e) => { const q = e.getBoundingClientRect(); return [q.left, q.top, q.width, q.height]; };
    const link = [...document.querySelectorAll('a')].find((a) => /see our work/i.test(a.textContent) && a.getBoundingClientRect().top < 900);
    return { box: r(ch), link: r(link) };
  });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/hero-a.png` });
  // the press on empty hero space: the real colour change, frozen and stepped
  const click = [1080, 560]; m.click = click;
  await p.evaluate(([x, y]) => {
    window.dispatchEvent(new CustomEvent('hero:pulse', { detail: { x, y } }));
    document.body.offsetWidth; getComputedStyle(document.body).color;
    window.__an = new Map(); for (const a of document.getAnimations()) { window.__an.set(a, a.currentTime || 0); a.pause(); }
  }, click);
  const N = Math.round(1.4 * FPS);
  for (let k = 0; k <= N; k++) {
    await p.evaluate((T) => { for (const [a, c0] of window.__an) { a.currentTime = c0 + T; } for (const a of document.getAnimations()) if (!window.__an.has(a)) { window.__an.set(a, (a.currentTime || 0) - T); a.pause(); a.currentTime = window.__an.get(a) + T; } }, (k * 1000) / FPS);
    await p.screenshot({ path: `${out}/pulse-${String(k).padStart(3, '0')}.png` });
  }
  await p.evaluate(() => { for (const a of window.__an.keys()) a.play(); });
  await p.waitForTimeout(600);
  // a smooth scroll down to the work cards
  const target = await p.evaluate(() => {
    const card = [...document.querySelectorAll('a[href^="/work/"]')].find((a) => a.getBoundingClientRect().height > 150);
    return Math.round(card.getBoundingClientRect().top + window.scrollY - 170);
  });
  m.scrollTarget = target;
  const S = Math.round(1.25 * FPS), ease = (q) => 0.5 - 0.5 * Math.cos(Math.PI * q);
  for (let k = 0; k <= S; k++) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(target * ease(k / S)));
    await p.waitForTimeout(30);
    await p.screenshot({ path: `${out}/scroll-${String(k).padStart(3, '0')}.png` });
  }
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/scrolled.png` });
  m.card = await p.evaluate(() => { const c = [...document.querySelectorAll('a[href^="/work/"]')].find((a) => { const q = a.getBoundingClientRect(); return q.height > 150 && q.top > 60 && q.top < 700; }); const q = c.getBoundingClientRect(); return [q.left, q.top, q.width, q.height]; });
  fs.writeFileSync(`${out}/dock-bg.json`, JSON.stringify({ ...m, fps: FPS, pulseFrames: N + 1, scrollFrames: S + 1 }));
  console.log(JSON.stringify(m));
  await b.close();
})();
