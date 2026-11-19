"""Composites the cursor-and-dock concept (dock_timeline.py): the live Home backdrops (dock_bg.cjs), the dock's pool of
light once the hero's own has scrolled away, filled ripples of our colours and the click's spray under the character,
the 3D character (door-frames.cjs), the "View" tag over work, the small dot that points while the character is home,
and the visitor's arrow before the character takes over. Optionally starts with the intro's own frames.
Usage: python3 dock_film.py FRAMES_DIR OUT_DIR [INTRO_FRAMES_DIR INTRO_COUNT]"""
import json, sys, os, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from concept_film import arrow, spray, conic, S
FR, OUT = sys.argv[1:3]; INTRO = sys.argv[3] if len(sys.argv) > 3 else None; NI = int(sys.argv[4]) if len(sys.argv) > 4 else 0
os.makedirs(OUT, exist_ok=True)
ov = json.load(open(os.path.join(FR, 'overlay.json'))); BG = ov['bg']
bgj = json.load(open(os.path.join(BG, 'dock-bg.json'))); bx, by, bw, _ = bgj['box']; CX, CY = bx + bw / 2, by + bw / 2
FONT = os.environ.get('FONT')
cache = {}
def backdrop(name):
    if name not in cache:
        if len(cache) > 6: cache.clear()
        cache[name] = Image.open(os.path.join(BG, name)).convert('RGBA')
    return cache[name].copy()
GRAD = [(0.04, (0x35, 0xd4, 0xff)), (0.26, (0x5a, 0x7d, 0xff)), (0.48, (0xb6, 0x67, 0xff)), (0.70, (0xff, 0x5f, 0xb4)), (0.96, (0xff, 0x9a, 0x3c))]
def pool(img, a):
    """The dock: a pool of our colours where the character lives (as the hero's own pool under it)."""
    if a <= 0.01: return
    w, h = int(bw * 1.1), int(bw * 0.34); cx, cy = CX, by + bw * 1.05
    xs = np.linspace(0, 1, w); g = np.stack([np.interp(xs, [p for p, _ in GRAD], [c[i] for _, c in GRAD]) for i in range(3)], -1)
    rgb = np.repeat(g[None], h, 0)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); d = np.hypot((xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2))
    al = np.clip(1 - (d - 0.2) / 0.55, 0, 1) * 0.85 * a
    lay = Image.fromarray(np.dstack([rgb.astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA').filter(ImageFilter.GaussianBlur(7))
    img.alpha_composite(lay, (int(cx - w / 2), int(cy - h / 2)))
def filled_ripples(img, o):
    """Over a link or work: a soft filled ripple of our colours every 0.9 s, growing from the character and fading."""
    rp = o.get('ripple')
    if not rp: return
    t, r0 = o['t'], o['r'] + 2
    n = int((t - rp['t0']) / 0.9) + 1
    for i in range(max(0, n - 2), n):
        q = (t - (rp['t0'] + i * 0.9)) / 1.3
        if not 0 <= q <= 1: continue
        R = r0 + 30 * (1 - (1 - q) ** 3); a = 0.42 * (1 - q) ** 1.5
        pad = int(R + 8); size = 2 * pad; x0, y0 = int(rp['c'][0]) - pad, int(rp['c'][1]) - pad
        yy, xx = np.mgrid[0:size, 0:size].astype(np.float32); d = np.hypot(xx - (rp['c'][0] - x0), yy - (rp['c'][1] - y0))
        fill = np.clip((R - d) / 2.5, 0, 1) * (0.55 + 0.45 * np.clip(d / R, 0, 1))      # filled, a little brighter at its edge
        rgb = conic(size, (t * 0.18) % 1).astype(np.uint8)
        img.alpha_composite(Image.fromarray(np.dstack([rgb, (fill * a * 255).astype(np.uint8)]), 'RGBA').filter(ImageFilter.GaussianBlur(1.2)), (x0, y0))
def view_tag(img, o):
    v = o.get('view')
    if not v or v['k'] <= 0.01: return
    f = ImageFont.truetype(FONT, 15) if FONT else ImageFont.load_default()
    w, h = 60, 28; x, y = int(v['c'][0] + o['r'] + 10), int(v['c'][1] - h / 2)
    lay = Image.new('RGBA', (w * S, h * S)); d = ImageDraw.Draw(lay)
    d.rounded_rectangle((0, 0, w * S - 1, h * S - 1), radius=h * S // 2, fill=(255, 255, 255, int(245 * v['k'])))
    lay = lay.resize((w, h), Image.LANCZOS); d = ImageDraw.Draw(lay)
    d.text((w / 2, h / 2 + 0.5), 'View', font=f, fill=(12, 11, 16, int(255 * v['k'])), anchor='mm')
    img.alpha_composite(lay, (x, y))
def dot(img, o):
    p = o.get('dot')
    if not p: return
    R = 11; yy, xx = np.mgrid[0:2 * R + 1, 0:2 * R + 1].astype(np.float32); dx, dy = xx - R - (p[0] % 1), yy - R - (p[1] % 1)
    d = np.hypot(dx, dy); halo = conic(2 * R + 1, (o['t'] * 0.3) % 1)
    cd = np.exp(-(d / 2.4) ** 2); hd = np.exp(-((d - 4.4) / 2.6) ** 2) * 0.9
    rgb = halo * (1 - cd[..., None]) + 255 * cd[..., None]; a = np.clip(np.maximum(cd, hd) * 255, 0, 255).astype(np.uint8)
    img.alpha_composite(Image.fromarray(np.dstack([rgb.astype(np.uint8), a]), 'RGBA'), (int(p[0]) - R, int(p[1]) - R))
k = 0; last = None
if INTRO:                                             # the intro, as recorded on the page, leads in
    for f in sorted(glob.glob(os.path.join(INTRO, 'f*.jpg')))[:NI]:
        last = Image.open(f).convert('RGB').resize((1440, 900), Image.LANCZOS); last.save(os.path.join(OUT, f'g{k:04d}.jpg'), quality=93); k += 1
FADE = 9                                              # a short crossfade from the intro's last frame (another moment's backdrop)
for o in ov['overlays']:
    img = backdrop(o['bg'])
    pool(img, o.get('dockPad', 0) * (0.6 + 0.4 * o.get('dockLit', 0)))
    spray(img, o); filled_ripples(img, o)
    three = os.path.join(FR, o['name'])
    if os.path.exists(three): img.alpha_composite(Image.open(three).convert('RGBA'))
    view_tag(img, o); dot(img, o)
    if o.get('arrow'): arrow(img, o['arrow'][0], o['arrow'][1], o.get('arrowFade', 1))
    img = img.convert('RGB'); i = k - (NI if INTRO else 0)
    if last is not None and i < FADE: img = Image.blend(last, img, (i + 1) / (FADE + 1))
    img.save(os.path.join(OUT, f'g{k:04d}.jpg'), quality=93); k += 1
print('composited', k)
