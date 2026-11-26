// Renders an SVG file to a PNG at a given width (transparent background), optionally recoloured.
// Usage: node svg2png.cjs IN.svg OUT.png WIDTH [fillColour]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [inp, out, width, fill] = process.argv.slice(2);
  let svg = fs.readFileSync(inp, 'utf8');
  if (fill) svg = svg.replace('<svg ', `<svg style="fill:${fill}" `).replace(/fill="[^"]*"/g, `fill="${fill}"`);
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
  await p.setContent(`<html><body style="margin:0;background:transparent"><div id="w" style="width:${width}px;display:inline-block">${svg.replace('<svg ', '<svg width="100%" ')}</div></body></html>`);
  const el = await p.$('#w svg');
  await el.screenshot({ path: out, omitBackground: true });
  await b.close();
})();
