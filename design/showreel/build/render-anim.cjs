// Renders the moving shots of frames.html frame by frame (window.anim). Usage: node render-anim.cjs JOBS.json
// JOBS.json: {"frames": dir of the approved stills (the walls use them), "out": dir, "fps": 30,
//             "jobs": [[shotIndex, frameCount, underPath, layer], ...]}  underPath: the last frame of the shot before, or "".
// layer "alpha": only our character, on a transparent ground (PNG, in NNNa/), to lay over that shot's stock clip.
// Jobs run in the order given, so a shot's "under" can be the last frame this run just wrote for the shot before.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const J = JSON.parse(fs.readFileSync(process.argv[2]));
  // WebGL in software, for our 3D character (character3d.js).
  const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', (m) => { if (m.text().startsWith('MISSING')) console.log(m.text()); });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  const url = 'file://' + path.join(__dirname, 'frames.html');
  for (const [i, n, under, layer] of J.jobs) {
    const alpha = layer === 'alpha', dir = path.join(J.out, String(i).padStart(3, '0') + (alpha ? 'a' : ''));
    fs.mkdirSync(dir, { recursive: true });
    await p.goto('about:blank');
    await p.goto(url + '#' + i + '|' + encodeURIComponent(path.resolve(J.frames)) + '|' + encodeURIComponent(under || '') + '|anim' + (alpha ? '|alpha' : ''));
    await p.evaluate(() => window.ready); await p.waitForTimeout(80);
    for (let k = 0; k < n; k++) {
      await p.evaluate(([t, d]) => window.anim(t, d), [k / J.fps, n / J.fps]);
      const file = path.join(dir, String(k).padStart(3, '0') + (alpha ? '.png' : '.jpg'));
      await p.screenshot(alpha ? { path: file, type: 'png', omitBackground: true } : { path: file, type: 'jpeg', quality: 93 });
    }
    process.stdout.write(i + (alpha ? 'a ' : ' '));
  }
  await b.close(); console.log('done');
})();
