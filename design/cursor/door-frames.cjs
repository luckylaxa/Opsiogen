// Renders the cursor concept's frames (door.html). Usage: node door-frames.cjs OUT_DIR JOB.json
// JOB.json: { "w": 640, "h": 640, "frames": [ { "name": "x.png", "state": {...DOOR.draw state...} }, ... ] }
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [out, jobFile] = process.argv.slice(2); const job = JSON.parse(fs.readFileSync(jobFile, 'utf8'));
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 800, height: 800 } });
  p.on('console', (m) => console.log('console:', m.text()));
  await p.goto('file://' + path.join(__dirname, 'door.html')); await p.evaluate(() => window.ready);
  if (job.info) console.log(JSON.stringify(await p.evaluate(() => window.DOOR.info())));
  await p.evaluate(([w, h]) => window.size(w, h), [job.w, job.h]);
  for (const f of job.frames) {
    const url = await p.evaluate((st) => window.frame(st), f.state);
    fs.writeFileSync(path.join(out, f.name), Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close();
})();
