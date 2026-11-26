// The pictures for the dash loader (Lucky's sketch, 26 Nov): on a black screen the character dashes in from the left
// edge to the middle with two small hops, jumps high from the middle, turns to face the visitor at the top and dives at
// the screen. These are its moving pictures; the picture facing the visitor (front, visor) comes from intro.cjs, and
// intro_pictures.py turns both into public/intro/*.webp. From the website character (viewer.html, served from the
// repository root on port 8765: python3 -m http.server 8765).
// Usage: node intro-dash.cjs OUT_DIR
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = process.argv[2], F = 800;
// The ring keeps turning the whole time and is where the front picture has it (intro.cjs: ring(11)) as it faces us.
const RING_FRONT = -0.35 * 11, T_FRONT = 1.08, SPIN = 3;
const ring = (t) => RING_FRONT + SPIN * (T_FRONT - t);
// Each picture: the moment it stands for (for the ring), its pose, and how far its turn is blurred (yaw +- spread).
// Hands: a pose name for both, or [from, to, k] for both on their way from one pose to another.
const both = (n) => n;
const PICS = {
  d0: { t: 0.08, pose: { yaw: 1.35, roll: 0.18, hands: both('trail'), to: 'neutral' } },
  d1: { t: 0.14, pose: { yaw: 1.35, roll: 0.18, hands: both('trail'), to: 'neutral' } },
  h0: { t: 0.22, pose: { yaw: 1.3, roll: -0.06, hands: both(['trail', 'cheer', 0.6]), to: 'neutral' } },
  h1: { t: 0.27, pose: { yaw: 1.3, roll: 0.02, hands: both('cheer'), to: 'neutral' } },
  h2: { t: 0.32, pose: { yaw: 1.3, roll: 0.24, hands: both(['cheer', 'trail', 0.6]), to: 'neutral' } },
  b0: { t: 0.66, pose: { yaw: 1.15, roll: -0.22, hands: both('balance'), to: 'neutral' } },
  j0: { t: 0.80, pose: { yaw: 1.05, roll: -0.04, hands: both(['rest', 'cheer', 0.5]) } },
  j1: { t: 0.88, pose: { yaw: 0.92, hands: both('cheer') } },
  t0: { t: 0.96, pose: { yaw: 0.74, hands: both('cheer') }, spread: 0.12 },
  t1: { t: 1.00, pose: { yaw: 0.5, hands: both('cheer') }, spread: 0.12 },
  t2: { t: 1.04, pose: { yaw: 0.28, hands: both('balance') }, spread: 0.1 },
  t3: { t: 1.08, pose: { yaw: 0.1, hands: both('balance') }, spread: 0.06 },
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  fs.mkdirSync(out, { recursive: true });
  const p = await b.newPage({ viewport: { width: F, height: F } });
  p.on('pageerror', (e) => console.log('error:', e.message));
  await p.goto(`http://127.0.0.1:8765/design/hero/character/v3/web/viewer.html?size=${F}`); await p.evaluate(() => window.ready);
  const pics = await p.evaluate(async ({ PICS, ring, SUB }) => {
    const { hand } = await import('/src/lib/character3d.js');
    const ringAt = new Function('t', `return ${ring};`);
    const H = (spec, side) => (typeof spec === 'string' ? spec : [hand(spec[0], side, 0), hand(spec[1], side, 0), spec[2]]);
    const c = document.getElementById('c'), W = c.width;
    const c2 = document.createElement('canvas'); c2.width = c2.height = W; const x = c2.getContext('2d', { willReadFrequently: true });
    // one picture averaged over several moments (the ring's spin, and a turn where there is one), in premultiplied colour
    const blur = (states) => {
      const acc = new Float32Array(W * W * 4);
      for (const s of states) {
        window.shot(s); x.clearRect(0, 0, W, W); x.drawImage(c, 0, 0);
        const d = x.getImageData(0, 0, W, W).data;
        for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; acc[i] += d[i] * a; acc[i + 1] += d[i + 1] * a; acc[i + 2] += d[i + 2] * a; acc[i + 3] += a; }
      }
      const o = x.createImageData(W, W);
      for (let i = 0; i < acc.length; i += 4) { const a = acc[i + 3]; if (a > 0) { o.data[i] = acc[i] / a; o.data[i + 1] = acc[i + 1] / a; o.data[i + 2] = acc[i + 2] / a; o.data[i + 3] = Math.round((255 * a) / states.length); } }
      x.putImageData(o, 0, 0); return c2.toDataURL('image/png');
    };
    const r = {};
    for (const [name, { t, pose, spread = 0 }] of Object.entries(PICS)) {
      const st = [];
      for (let j = 0; j < SUB; j++) {
        const u = j / (SUB - 1) - 0.5;
        st.push({ ...pose, hands: { R: H(pose.hands, 'R'), L: H(pose.hands, 'L') }, yaw: pose.yaw + spread * u, ring: ringAt(t + 0.03 * u) });
      }
      r[name] = blur(st);
    }
    return r;
  }, { PICS, ring: `${RING_FRONT} + ${SPIN} * (${T_FRONT} - t)`, SUB: 7 });
  for (const [k, v] of Object.entries(pics)) fs.writeFileSync(path.join(out, k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
  await b.close();
})();
