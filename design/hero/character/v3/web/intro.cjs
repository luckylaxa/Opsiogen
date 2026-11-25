// The site's intro pictures and the Home character's still, from the website character (viewer.html, served from the
// repository root on port 8765: python3 -m http.server 8765). The intro (Lucky, 25 Nov): the crouch (flip-00), the
// jump (flip-01) and a backflip in nine pictures, each blurred over most of its 36 degrees (flip-02..10); then the
// character facing the visitor after it (front) and its visor alone (visor). And the Home character's still (still).
// Then intro_pictures.py makes public/intro/*.webp and public/home/character-front.webp.
// Usage: node intro.cjs OUT_DIR
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = process.argv[2], F = 800, BIG = 1280;
const FLIP = 9, SUB = 21, SHUTTER = 0.85;          // nine pictures 36 degrees apart, each the blend of 21 moments
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  fs.mkdirSync(out, { recursive: true });
  const save = (name, url) => fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  const open = async (size) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    p.on('pageerror', (e) => console.log('error:', e.message));
    await p.goto(`http://127.0.0.1:8765/design/hero/character/v3/web/viewer.html?size=${size}`); await p.evaluate(() => window.ready);
    return p;
  };
  let p = await open(F);
  const pics = await p.evaluate(async ({ FLIP, SUB, SHUTTER }) => {
    const T = await import('three');
    const ring = (k) => -0.35 * k, both = (n) => ({ R: n, L: n }), c = document.getElementById('c'), W = c.width;
    const c2 = document.createElement('canvas'); c2.width = c2.height = W; const x = c2.getContext('2d', { willReadFrequently: true });
    // one picture averaged over several moments (motion blur), in premultiplied colour
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
    r['flip-00'] = window.shot({ ring: ring(0), hands: both('rest') });          // the crouch, arms down
    r['flip-01'] = window.shot({ ring: ring(1), hands: both('cheer') });         // up it goes, arms up
    for (let k = 1; k <= FLIP; k++) {                                            // the backflip: face up and over backwards
      const st = [];
      for (let j = 0; j < SUB; j++) { const u = k + SHUTTER * (j / (SUB - 1) - 0.5); st.push({ ring: ring(1 + u), pitch: (-2 * Math.PI * u) / (FLIP + 1), hands: both('rest') }); }
      r['flip-' + String(1 + k).padStart(2, '0')] = blur(st);
    }
    const FRONT = { ring: ring(11), hands: both('balance') };                    // out of the flip, facing us, arms out
    r.front = window.shot(FRONT);
    // the visor alone, white on black, for the hole in the shell and the face picture
    const ch = window.ch, keep = new Map(), black = new T.MeshBasicMaterial({ color: 0 }), white = new T.MeshBasicMaterial({ color: 0xffffff });
    ch.group.traverse((m) => { if (m.isMesh || m.isSprite) keep.set(m, [m.material, m.visible]); });
    ch.group.traverse((m) => { if (m.isMesh) m.material = m.material === ch.visorMat ? white : black; if (m.isSprite) m.visible = false; });
    for (const h of Object.values(ch.hands)) h.visible = false;
    r.visor = window.shot(FRONT);
    for (const [m, [mat, vis]] of keep) { m.material = mat; m.visible = vis; }
    for (const h of Object.values(ch.hands)) h.visible = true;
    return r;
  }, { FLIP, SUB, SHUTTER });
  for (const [k, v] of Object.entries(pics)) save(k, v);
  await p.close();
  p = await open(BIG);
  save('still', await p.evaluate(() => window.shot({})));                     // the Home character's still, at rest
  await b.close();
})();
