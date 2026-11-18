// Saves every shot in frames.html as a 1920 x 1080 still. Usage: node frames.cjs OUT_DIR
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', (m) => console.log(m.text()));
  const url = 'file://' + path.join(__dirname, 'frames.html');
  await p.goto(url + '#0'); await p.evaluate(() => window.ready);
  const shots = await p.evaluate(() => window.SHOTS);
  for (let i = 0; i < shots.length; i++) {
    await p.goto('about:blank'); await p.goto(url + '#' + i); await p.evaluate(() => window.ready);
    await p.screenshot({ path: `${out}/${String(i + 1).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 90 });
  }
  require('fs').writeFileSync(`${out}/shots.json`, JSON.stringify(shots, null, 1));
  await b.close();
})();
