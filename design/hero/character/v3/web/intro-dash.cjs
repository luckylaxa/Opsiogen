// The pictures for the loader (Lucky, 26 Nov): on a black screen the character comes in from the left edge with two
// bouncy hops to the middle, crouches, takes off and flies side-on like Superman (Lucky's reference: one arm stretched
// forward, the other back with a fist), then swoops at the screen, turning to us, and the page opens through its visor.
// It draws the moving pictures (d0..b2), the picture facing the visitor (front) and its visor alone (visor);
// intro_pictures.py turns them into public/intro/*.webp. From the website character with the showreel's fuller model
// (it has the fist), through viewer.html served from the repository root on port 8765 (python3 -m http.server 8765).
// Usage: node intro-dash.cjs OUT_DIR
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = process.argv[2], F = 800, BIG = 1280;
// The moving pictures are drawn from a little further back (WIDE) so a stretched-out hand stays inside them; the
// loader shows them that much larger (DIST / WIDE), so the character is the same size as in the front picture.
const DIST = 9.6, WIDE = 10.6;
// The ring keeps turning the whole time and ends where the front picture has it.
const RING_FRONT = -3.85, T_FRONT = 1.14, SPIN = 3;
// Hands: a pose name for both hands, or { R, L } for each; each one a name, '@reach' (its left hand stretched forward
// and up, open), '@fist' (its right hand back with a fist) or [from, to, k] for one on its way from one to the other.
const SUPER = { R: '@fist', L: '@reach' };
const PICS = {
  d0: { t: 0.02, pose: { yaw: 1.35, roll: 0.15, hands: 'trail', to: 'neutral' } },
  d1: { t: 0.05, pose: { yaw: 1.35, roll: 0.15, hands: 'trail', to: 'neutral' } },
  hu: { t: 0.08, pose: { yaw: 1.3, roll: -0.12, hands: ['trail', 'cheer', 0.55], to: 'neutral' } },
  ha: { t: 0.15, pose: { yaw: 1.3, roll: 0, hands: 'cheer', to: 'neutral' } },
  hd: { t: 0.23, pose: { yaw: 1.3, roll: 0.2, hands: ['cheer', 'balance', 0.6], to: 'neutral' } },
  sq: { t: 0.57, pose: { yaw: 1.2, roll: -0.14, hands: 'trail', to: 'neutral' } },
  to: { t: 0.67, pose: { yaw: 1.22, roll: -0.45, hands: { R: ['trail', '@fist', 0.6], L: ['trail', '@reach', 0.6] } } },
  f0: { t: 0.80, pose: { yaw: 1.25, roll: -0.5, hands: SUPER } },
  f1: { t: 0.90, pose: { yaw: 1.25, roll: -0.38, hands: SUPER } },
  b0: { t: 1.02, pose: { yaw: 1.0, roll: -0.22, hands: SUPER }, spread: 0.1 },
  b1: { t: 1.07, pose: { yaw: 0.78, roll: -0.1, hands: SUPER }, spread: 0.1 },
  b2: { t: 1.11, pose: { yaw: 0.6, roll: 0, hands: SUPER }, spread: 0.06 },
};
const FRONT = { yaw: 0.48, hands: SUPER, ring: RING_FRONT };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  fs.mkdirSync(out, { recursive: true });
  const save = (name, url) => fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  const open = async (size, dist) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    p.on('pageerror', (e) => console.log('error:', e.message));
    await p.goto(`http://127.0.0.1:8765/design/hero/character/v3/web/viewer.html?size=${size}&model=full&dist=${dist}`); await p.evaluate(() => window.ready);
    // the hand specs above, made into poses for each side
    await p.evaluate(async () => {
      const { hand } = await import('/src/lib/character3d.js');
      // given for the side each is used on (its left hand is on the right of the screen as it faces us)
      const OWN = {
        '@reach': { at: [0.8, 0.9, 1.05], fingers: [0.15, 0.6, 0.79], palm: [0, -0.7, 0.7], size: 1.12, shape: { wave: 1 } },
        '@fist': { at: [-1.0, -0.55, -0.7], fingers: [-0.15, -0.35, -0.92], palm: [1, 0, 0], size: 1.12, shape: { fist: 1 } },
      };
      const one = (s, side) => (OWN[s] ? OWN[s] : hand(s, side, 0));
      const spec = (s, side) => (Array.isArray(s) ? [one(s[0], side), one(s[1], side), s[2]] : one(s, side));
      window.hands = (h) => (typeof h === 'string' || Array.isArray(h) ? { R: spec(h, 'R'), L: spec(h, 'L') } : { R: spec(h.R, 'R'), L: spec(h.L, 'L') });
    });
    return p;
  };
  let p = await open(F, WIDE);
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
  p = await open(BIG, DIST);
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
