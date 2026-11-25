// The site's intro pictures and the Home character's still, from the website character (viewer.html, served from the
// repository root on port 8765): one full turn in 12 frames with the ring spinning (turn-00..11), the front larger
// (front), and a mask of its visor (visor). Then intro_pictures.py makes public/intro/*.webp and public/home/character-front.webp.
// Usage: node intro.cjs OUT_DIR
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = process.argv[2], TURN = 12, F = 600, BIG = 1280;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  fs.mkdirSync(out, { recursive: true });
  const save = (name, url) => fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  for (const size of [F, BIG]) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    p.on('pageerror', (e) => console.log('error:', e.message));
    await p.goto(`http://127.0.0.1:8765/design/hero/character/v3/web/viewer.html?size=${size}`); await p.evaluate(() => window.ready);
    if (size === F) {
      for (let k = 0; k < TURN; k++) save(`turn-${String(k).padStart(2, '0')}`, await p.evaluate((k) => window.shot({ yaw: (2 * Math.PI * k) / 12, ring: (-2 * Math.PI * k) / 12 }), k));
    } else {
      save('front', await p.evaluate(() => window.shot({})));
      save('visor', await p.evaluate(() => {                     // the visor alone, white on black, for the hole in the shell
        const ch = window.ch, black = new ch.visorMat.constructor({ color: 0 }), keep = new Map();
        ch.group.traverse((m) => { if (m.isMesh || m.isSprite) { keep.set(m, m.material); } });
        const { MeshBasicMaterial } = Object.getPrototypeOf(ch.visorMat).constructor === undefined ? {} : {};
        ch.group.traverse((m) => { if (m.isMesh) m.material = m.material === ch.visorMat ? new m.material.constructor({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1, roughness: 1, envMapIntensity: 0 }) : black; if (m.isSprite) m.visible = false; });
        for (const h of Object.values(ch.hands)) h.visible = false;
        const url = window.shot({});
        for (const [m, mat] of keep) m.material = mat;
        for (const h of Object.values(ch.hands)) h.visible = true;
        return url;
      }));
    }
    await p.close();
  }
  await b.close();
})();
