"""Composites the cursor concept: the Home hero backdrop, the 3D layer (door-frames.cjs), and the 2D layer from
concept_timeline.py (the visitor's arrow until the mini takes over, the ring over a link, the click ripple).
Usage: python3 concept_film.py BACKDROP.png FRAMES_DIR OUT_DIR"""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw
BG, FR, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)
ov = json.load(open(os.path.join(FR, 'overlay.json')))
bg = Image.open(BG).convert('RGBA')
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
def ring_mask(size, c, r, w):
    m = Image.new('L', (size[0] * S // 4, size[1] * S // 4))  # placeholder (unused)
def difference_ring(img, c, r, w, a):
    """A ring that inverts what is under it, as the site's cursor does."""
    if a <= 0 or r <= 0: return img
    pad = int(r + w + 4); x0, y0 = int(c[0]) - pad, int(c[1]) - pad; size = 2 * pad
    m = Image.new('L', (size * S, size * S)); d = ImageDraw.Draw(m)
    cx, cy = (c[0] - x0) * S, (c[1] - y0) * S
    d.ellipse((cx - r * S, cy - r * S, cx + r * S, cy + r * S), outline=255, width=max(1, int(w * S)))
    m = m.resize((size, size), Image.LANCZOS)
    arr = np.asarray(img).astype(np.float32); box = arr[max(0, y0):y0 + size, max(0, x0):x0 + size]
    mm = (np.asarray(m).astype(np.float32) / 255.0 * a)[:box.shape[0], :box.shape[1], None]
    box[..., :3] = box[..., :3] * (1 - mm) + (255 - box[..., :3]) * mm
    arr[max(0, y0):y0 + size, max(0, x0):x0 + size] = box
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')
for o in ov['overlays']:
    img = bg.copy()
    three = os.path.join(FR, o['name'])
    if os.path.exists(three): img.alpha_composite(Image.open(three).convert('RGBA'))
    r = o.get('ring')
    if r and r['k'] > 0: img = difference_ring(img, r['c'], 6 + 22 * r['k'], 1.6, 0.95)      # grows into the link ring (56 px)
    rp = o.get('ripple')
    if rp: k = rp['k']; img = difference_ring(img, rp['c'], 30 + 26 * k, 1.4, 0.8 * (1 - k))
    if o.get('arrow'): arrow(img, o['arrow'][0], o['arrow'][1], o.get('arrowFade', 1))
    img.convert('RGB').save(os.path.join(OUT, o['name'].replace('.png', '.jpg')), quality=93)
print('composited', len(ov['overlays']))
