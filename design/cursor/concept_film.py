"""Composites the cursor concept: the Home hero backdrop, the 3D layer (door-frames.cjs), and the 2D layer from
concept_timeline.py (the visitor's arrow until the mini takes over, ripples of our colours over a link, and a spray of colour on the click).
Usage: python3 concept_film.py BACKDROP.png FRAMES_DIR OUT_DIR"""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
S = 4                                                   # drawn 4x and scaled down, for smooth edges
ARROW = [(0, 0), (0, 17.5), (4.2, 13.6), (7.1, 20.2), (10.0, 19.0), (7.2, 12.6), (12.6, 12.6)]   # tip at (0,0)
def arrow(img, x, y, a):
    if a <= 0: return
    lay = Image.new('RGBA', (40 * S, 40 * S)); d = ImageDraw.Draw(lay); k = 1.2 * S
    pts = [(4 * S + px * k, 4 * S + py * k) for px, py in ARROW]
    d.polygon(pts, fill=(255, 255, 255, 255), outline=(0, 0, 0, 255), width=int(1.4 * S))
    lay = lay.resize((40, 40), Image.LANCZOS)
    if a < 1: lay.putalpha(lay.getchannel('A').point(lambda v: int(v * a)))
    img.alpha_composite(lay, (int(round(x - 4)), int(round(y - 4))))
STOPS = [(0.0, (0x35, 0xd4, 0xff)), (0.2, (0x5a, 0x7d, 0xff)), (0.4, (0xb6, 0x67, 0xff)), (0.6, (0xff, 0x5f, 0xb4)), (0.8, (0xff, 0x9a, 0x3c)), (1.0, (0x35, 0xd4, 0xff))]
def conic(size, turn):
    """Our colours round a circle (as the main character's light), turned by `turn` (0..1)."""
    yy, xx = np.mgrid[0:size, 0:size] - (size - 1) / 2
    a = (np.arctan2(yy, xx) / (2 * np.pi) + 0.5 + turn) % 1.0
    return np.stack([np.interp(a, [p for p, _ in STOPS], [c[i] for _, c in STOPS]) for i in range(3)], axis=-1)
def gradient_ring(img, c, r, w, a, turn):
    """One ripple: a thin ring of our colours with a soft glow round it."""
    if a <= 0.01 or r <= 0: return
    pad = int(r + w + 14); size = 2 * pad; x0, y0 = int(round(c[0])) - pad, int(round(c[1])) - pad
    m = Image.new('L', (size * S, size * S)); d = ImageDraw.Draw(m); cx = cy = (c[0] - x0) * S
    cy = (c[1] - y0) * S; d.ellipse((cx - r * S, cy - r * S, cx + r * S, cy + r * S), outline=255, width=max(1, int(w * S)))
    m = m.resize((size, size), Image.LANCZOS)
    rgb = conic(size, turn).astype(np.uint8)
    for blur, k in ((5, 0.55), (0, 1.0)):                      # the glow, then the line itself
        mm = m.filter(ImageFilter.GaussianBlur(blur)) if blur else m
        alpha = (np.asarray(mm).astype(np.float32) * a * k * (1.6 if blur else 1)).clip(0, 255).astype(np.uint8)
        lay = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA')
        img.alpha_composite(lay, (x0, y0)) if x0 >= 0 and y0 >= 0 else img.paste(lay, (x0, y0), lay)
SPRAY = [(0.0, (255, 105, 180)), (0.18, (120, 130, 255)), (0.36, (70, 215, 255)), (0.54, (120, 235, 140)), (0.72, (255, 232, 100)), (0.86, (255, 150, 90)), (1.0, (255, 105, 180))]
def spray(img, o):
    """The click: a soft fog of the main character's rainbow light sprayed onto the page round the click, in streaks,
    spreading and fading (as the hero's spray: blurred, see-through, no hard edge anywhere)."""
    sp = o.get('spray')
    if not sp: return
    k = sp['k']; e = 1 - (1 - k) ** 3; R = 16 + 78 * e
    env = min(1.0, k / 0.12) * (1 - k) ** 1.3
    if env <= 0.01: return
    pad = int(R + 24); size = 2 * pad; x0, y0 = int(round(sp['c'][0])) - pad, int(round(sp['c'][1])) - pad
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32); dx, dy = xx - (sp['c'][0] - x0), (yy - (sp['c'][1] - y0)) * 1.12
    d = np.hypot(dx, dy); th = np.arctan2(dy, dx)
    a = (th / (2 * np.pi) + 0.5 + 0.1 * k) % 1.0
    rgb = np.stack([np.interp(a, [p for p, _ in SPRAY], [c[i] for _, c in SPRAY]) for i in range(3)], axis=-1)
    q = np.clip(d / R, 0, 1.5)
    body = np.clip(1 - (q - 0.62) / 0.38, 0, 1) * np.clip(q / 0.55, 0, 1) ** 0.8          # brightest toward its spreading edge
    streak = 0.6 + 0.4 * (0.5 * np.cos(7 * th + 1.3) + 0.3 * np.cos(11 * th + 0.4) + 0.2 * np.cos(17 * th + 2.2))   # uneven streaks: sprayed, not a clean ring
    alpha = np.clip(body * streak * env * 235, 0, 255).astype(np.uint8)
    lay = Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]), 'RGBA').filter(ImageFilter.GaussianBlur(5))
    img.alpha_composite(lay, (x0, y0))
BEAM = [(0.0, (70, 215, 255)), (0.5, (150, 120, 255)), (1.0, (255, 105, 180))]
def light(img, o):
    """The pointer: a beam of light from the mini's eye to the exact spot, ending in a small bright dot with a halo of
    our colours. Cyan at the eye (the colour of its lens light) to pink at the spot."""
    b = o.get('beam')
    if not b or b['k'] <= 0: return
    (x1, y1), (tx, ty) = b['from'], b['to']; k = b['k']; g = b.get('glow', 1.0)
    x2, y2 = x1 + (tx - x1) * k, y1 + (ty - y1) * k
    pad = 18; x0, y0 = int(min(x1, x2)) - pad, int(min(y1, y2)) - pad; w, h = int(abs(x2 - x1)) + 2 * pad, int(abs(y2 - y1)) + 2 * pad
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); px, py = xx + x0, yy + y0
    vx, vy = x2 - x1, y2 - y1; L2 = max(1e-6, vx * vx + vy * vy)
    t = np.clip(((px - x1) * vx + (py - y1) * vy) / L2, 0, 1); dist = np.hypot(px - (x1 + t * vx), py - (y1 + t * vy))
    col = np.stack([np.interp(t, [p for p, _ in BEAM], [c[i] for _, c in BEAM]) for i in range(3)], axis=-1)
    glow = np.exp(-(dist / (2.4 + 2.2 * (1 - t))) ** 2) * (0.5 + 0.25 * t) * min(1.0, 0.75 * g)
    core = np.exp(-(dist / 0.85) ** 2) * (0.55 + 0.4 * t) * min(1.0, 0.8 * g)
    rgb = col * (1 - core[..., None]) + np.array([235, 250, 255]) * core[..., None]
    a = np.clip(np.maximum(glow, core) * 255, 0, 255).astype(np.uint8)
    img.alpha_composite(Image.fromarray(np.dstack([rgb.astype(np.uint8), a]), 'RGBA'), (x0, y0))
    if k >= 0.98:                                                       # the dot at the spot: the true pointer
        R = 11; yy, xx = np.mgrid[0:2 * R + 1, 0:2 * R + 1].astype(np.float32); dx, dy = xx - R - (tx % 1), yy - R - (ty % 1)
        d = np.hypot(dx, dy); ang = (np.arctan2(dy, dx) / (2 * np.pi) + 0.5 + o['t'] * 0.3) % 1
        halo = np.stack([np.interp(ang, [p for p, _ in STOPS], [c[i] for _, c in STOPS]) for i in range(3)], axis=-1)
        cd = np.exp(-(d / 2.3) ** 2); hd = np.exp(-((d - 4.2) / 2.6) ** 2) * 0.9 * min(1.0, g)
        rgb = halo * (1 - cd[..., None]) + 255 * cd[..., None]
        a = np.clip(np.maximum(cd, hd) * 255, 0, 255).astype(np.uint8)
        img.alpha_composite(Image.fromarray(np.dstack([rgb.astype(np.uint8), a]), 'RGBA'), (int(tx) - R, int(ty) - R))
def ripples(img, o):
    """Over a link, a ripple every 0.9 s, each growing and fading over 1.3 s; a click sends out one stronger ripple."""
    r0 = o.get('r0', 20); t = o['t']; turn = (t * 0.18) % 1
    h = o.get('hover')
    if h:
        n = int((t - h['t0']) / 0.9) + 1
        for i in range(max(0, n - 2), n):
            q = (t - (h['t0'] + i * 0.9)) / 1.3
            if 0 <= q <= 1: e = 1 - (1 - q) ** 3; gradient_ring(img, h['c'], r0 + 26 * e, 2.6 - 1.2 * q, 0.95 * (1 - q) ** 1.4, turn)
    k = o.get('click')
    if k: q = k['k']; e = 1 - (1 - q) ** 3; gradient_ring(img, k['c'], r0 + 54 * e, 3.6 - 2.0 * q, (1 - q) ** 1.6, turn + 0.25)
def main():
  BG, FR, OUT = sys.argv[1:4]
  os.makedirs(OUT, exist_ok=True)
  ov = json.load(open(os.path.join(FR, 'overlay.json')))
  bg = Image.open(BG).convert('RGBA')
  for o in ov['overlays']:
      img = bg.copy()
      spray(img, o)                                       # on the page, so under the characters
      three = os.path.join(FR, o['name'])
      if os.path.exists(three): img.alpha_composite(Image.open(three).convert('RGBA'))
      light(img, o)
      ripples(img, o)
      if o.get('arrow'): arrow(img, o['arrow'][0], o['arrow'][1], o.get('arrowFade', 1))
      img.convert('RGB').save(os.path.join(OUT, o['name'].replace('.png', '.jpg')), quality=93)
  print('composited', len(ov['overlays']))

if __name__ == '__main__':
    main()
