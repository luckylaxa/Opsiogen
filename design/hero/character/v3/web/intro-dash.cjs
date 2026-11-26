// The pictures for the dash loader (Lucky's sketch, 26 Nov): on a black screen the character dashes in from the left
// edge to the middle with two small hops, takes off from the middle like Superman (one fist up), turns to face the
// visitor at the top and flies at the screen with one fist forward and the other hand back (Lucky: "like superman pose
// with one hand front and one hand back"). It draws the moving pictures (d0..t3), the picture facing the visitor
// (front) and its visor alone (visor); intro_pictures.py turns them into public/intro/*.webp. From the website character
// with the showreel's fuller model (it has the fist), through viewer.html served from the repository root on port 8765
// (python3 -m http.server 8765).
// Usage: node intro-dash.cjs OUT_DIR
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = process.argv[2], F = 800, BIG = 1280;
// The ring keeps turning the whole time and ends where the front picture has it.
const RING_FRONT = -3.85, T_FRONT = 1.08, SPIN = 3;
// Hands: a pose name for both hands, or { R, L } for each; each one a name, '@fist' (forward like Superman), '@back'
// (swept back) or [from, to, k] for one on its way from one to the other.
const SUPER = { R: '@fist', L: '@back' };
const PICS = {
  d0: { t: 0.08, pose: { yaw: 1.35, roll: 0.18, hands: 'trail', to: 'neutral' } },
  d1: { t: 0.14, pose: { yaw: 1.35, roll: 0.18, hands: 'trail', to: 'neutral' } },
  h0: { t: 0.22, pose: { yaw: 1.3, roll: -0.06, hands: ['trail', 'cheer', 0.6], to: 'neutral' } },
  h1: { t: 0.27, pose: { yaw: 1.3, roll: 0.02, hands: 'cheer', to: 'neutral' } },
  h2: { t: 0.32, pose: { yaw: 1.3, roll: 0.24, hands: ['cheer', 'trail', 0.6], to: 'neutral' } },
  b0: { t: 0.66, pose: { yaw: 1.15, roll: -0.22, hands: 'balance', to: 'neutral' } },
  j0: { t: 0.80, pose: { yaw: 1.05, roll: -0.04, hands: { R: ['rest', 'pump', 0.5], L: ['rest', '@back', 0.5] } } },
  j1: { t: 0.88, pose: { yaw: 0.92, hands: { R: 'pump', L: '@back' } } },
  t0: { t: 0.96, pose: { yaw: 0.74, hands: { R: ['pump', '@fist', 0.35], L: '@back' } }, spread: 0.12 },
  t1: { t: 1.00, pose: { yaw: 0.5, hands: { R: ['pump', '@fist', 0.7], L: '@back' } }, spread: 0.12 },
  t2: { t: 1.04, pose: { yaw: 0.28, hands: SUPER }, spread: 0.1 },
  t3: { t: 1.08, pose: { yaw: 0.1, hands: SUPER }, spread: 0.06 },
};
const FRONT = { yaw: 0, hands: SUPER, ring: RING_FRONT };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  fs.mkdirSync(out, { recursive: true });
  const save = (name, url) => fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  const open = async (size) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    p.on('pageerror', (e) => console.log('error:', e.message));
    await p.goto(`http://127.0.0.1:8765/design/hero/character/v3/web/viewer.html?size=${size}&model=full`); await p.evaluate(() => window.ready);
    // the hand specs above, made into poses for each side
    await p.evaluate(async () => {
      const { hand, mirror } = await import('/src/lib/character3d.js');
      const OWN = {
        '@fist': { at: [-1.0, 0.85, 1.75], fingers: [0.15, 0.25, 0.95], palm: [0.95, 0, -0.2], size: 1.4, shape: { fist: 1 } },
        '@back': { at: [-1.15, -0.7, -0.6], fingers: [-0.3, -0.5, -0.81], palm: [0, -1, 0], size: 1.1, shape: { wave: 1 } },
      };
      const one = (s, side) => (OWN[s] ? (side === 'L' ? mirror(OWN[s]) : OWN[s]) : hand(s, side, 0));
      const spec = (s, side) => (Array.isArray(s) ? [one(s[0], side), one(s[1], side), s[2]] : one(s, side));
      window.hands = (h) => (typeof h === 'string' || Array.isArray(h) ? { R: spec(h, 'R'), L: spec(h, 'L') } : { R: spec(h.R, 'R'), L: spec(h.L, 'L') });
    });
    return p;
  };
  let p = await open(F);
  const pics = await p.evaluate(({ PICS, RING_FRONT, T_FRONT, SPIN, SUB }) => {
    const ringAt = (t) => RING_FRONT + SPIN * (T_FRONT - t);
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
      const st = [], hands = window.hands(pose.hands);
      for (let j = 0; j < SUB; j++) {
        const u = j / (SUB - 1) - 0.5;
        st.push({ ...pose, hands, yaw: pose.yaw + spread * u, ring: ringAt(t + 0.03 * u) });
      }
      r[name] = blur(st);
    }
    return r;
  }, { PICS, RING_FRONT, T_FRONT, SPIN, SUB: 7 });
  for (const [k, v] of Object.entries(pics)) save(k, v);
  await p.close();
  // facing the visitor, big, and its visor alone (white on black) for the hole in the shell and the face picture
  p = await open(BIG);
  const big = await p.evaluate(async (FRONT) => {
    const T = await import('three');
    const pose = { ...FRONT, hands: window.hands(FRONT.hands) };
    const r = { front: window.shot(pose) };
    const ch = window.ch, keep = new Map(), black = new T.MeshBasicMaterial({ color: 0 }), white = new T.MeshBasicMaterial({ color: 0xffffff });
    ch.group.traverse((m) => { if (m.isMesh || m.isSprite) keep.set(m, [m.material, m.visible]); });
    ch.group.traverse((m) => { if (m.isMesh) m.material = m.material === ch.visorMat ? white : black; if (m.isSprite) m.visible = false; });
    for (const h of Object.values(ch.hands)) h.visible = false;
    r.visor = window.shot(pose);
    for (const [m, [mat, vis]] of keep) { m.material = mat; m.visible = vis; }
    for (const h of Object.values(ch.hands)) h.visible = true;
    return r;
  }, FRONT);
  save('front', big.front); save('visor', big.visor);
  await b.close();
})();
