// Cuts the composite pieces of the wide frames (phones, posts, the film player) out of mock.html at 2x,
// for the square phone versions in square.html. Run from this folder: node parts.cjs
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 917 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'mock.html'));
  await p.evaluate(() => document.fonts.ready);
  // The headings stay on the square frames' own layout, never inside a cut-out part.
  await p.addStyleTag({ content: '.tl{visibility:hidden!important}' });
  await p.waitForTimeout(800);
  // One region per part: the union of the chosen children of a frame, in page coordinates.
  const regions = await p.evaluate(() => {
    const box = (els) => {
      const rs = els.map((e) => e.getBoundingClientRect());
      const x = Math.min(...rs.map((r) => r.left)), y = Math.min(...rs.map((r) => r.top));
      const sec = els[0].closest('.m').getBoundingClientRect();
      const x2 = Math.min(Math.max(...rs.map((r) => r.right)), sec.right), y2 = Math.min(Math.max(...rs.map((r) => r.bottom)), sec.bottom);
      const cx = Math.max(x, sec.left), cy = Math.max(y, sec.top);
      return { x: cx + scrollX, y: cy + scrollY, width: x2 - cx, height: y2 - cy };
    };
    const kids = (id, sel) => [...document.querySelectorAll(`#${id} > ${sel}`)];
    const notHead = (id) => [...document.querySelector('#' + id).children].filter((e) => !e.classList.contains('tl'));
    return {
      'p03': box(kids('m03', '.phone')),
      'p06': box(notHead('m06')),
      'p08': box(notHead('m08')),
      'p09a': box([document.querySelectorAll('#m09 .post')[0]]),
      'p09b': box([document.querySelectorAll('#m09 .post')[1]]),
      'p10': box(notHead('m10').filter((e) => !e.classList.contains('phone')).slice(0, 2)),
      'p10r': box(kids('m10', '.phone')),
      'p11': box(kids('m11', '.phone')),
      'p12': (() => { const r = document.querySelector('#m12').getBoundingClientRect(); return { x: r.left + scrollX + (r.width - r.height) / 2, y: r.top + scrollY, width: r.height, height: r.height }; })(),
    };
  });
  for (const [k, clip] of Object.entries(regions)) {
    await p.screenshot({ path: `parts/${k}.png`, clip, fullPage: true });
    console.log(k, Math.round(clip.width), Math.round(clip.height));
  }
  await b.close();
})();
