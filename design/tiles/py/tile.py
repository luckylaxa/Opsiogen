"""Compose a service tile at full resolution: crop the scene first, then put our screen on it.
fill=(top, right): the screen's top edge lands at `top` of the tile height, its right edge at
`right` of the width; the crop runs to the bottom of the scene. No blur anywhere."""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comp import place
from quad import find_quad
from PIL import Image, ImageDraw, ImageFilter
OUT = (1600, 1200)
def expand(q, px):
    c = np.mean(q, 0); return [tuple(c + (np.array(p) - c) * (1 + px / np.linalg.norm(np.array(p) - c))) for p in q]
def full_quad(q, H, aspect):
    # A screen cut by the bottom edge: keep the true (uncut) edge and rebuild the cut corners at
    # the screen's real length (width / aspect) along its own sides.
    q = [np.array(p, float) for p in q]
    cut = [i for i, p in enumerate(q) if p[1] >= H - 3]
    if len(cut) != 2: return [tuple(p) for p in q]
    keep = [i for i in range(4) if i not in cut]
    a, b = q[keep[0]], q[keep[1]]
    length = np.linalg.norm(b - a) / aspect
    out = list(q)
    for k in keep:
        nb = [c for c in cut if abs(c - k) in (1, 3)][0]
        d = q[nb] - q[k]; out[nb] = q[k] + d / np.linalg.norm(d) * length
    return [tuple(p) for p in out]
def tile(scene, art, out, fill=(0.40, 0.90), radius=0, restore=95, aspect=None, extend=0):
    im = Image.open(scene).convert('RGB'); W, H = im.size; q, _ = find_quad(scene)
    if aspect: q = full_quad(q, H, aspect)
    if extend:
        # Continue the background upward by mirroring its top band (sharp, no blur), so the
        # device sits lower in the tile. Only for plain, even backgrounds (planks, linen, walls).
        a = np.array(im); top = a[:extend][::-1]
        im = Image.fromarray(np.concatenate([top, a], 0)); q = [(x, y + extend) for x, y in q]; H += extend
    top, right = fill; sy = min(v[1] for v in q); sx = max(v[0] for v in q)
    h = min(H, (H - sy) / (1 - top)); w = h * 4 / 3
    if w > W: w = W; h = w * 3 / 4
    y0 = H - h; x0 = min(max(0, sx - right * w), W - w)
    k = OUT[0] / w
    crop = im.crop((round(x0), round(y0), round(x0 + w), round(y0 + h))).resize(OUT, Image.LANCZOS)
    crop = crop.filter(ImageFilter.UnsharpMask(1.4, 60, 2))
    qq = [((x - x0) * k, (y - y0) * k) for x, y in q]
    orig = np.array(crop).astype(float)
    p = place(crop, Image.open(art).convert('RGBA'), expand(qq, 1.5 * k), radius=radius, glass=0.03, ss=2)
    pa = np.array(p).astype(float)
    m = Image.new('L', OUT, 0); ImageDraw.Draw(m).polygon([tuple(v) for v in expand(qq, 3 * k)], fill=255); m = np.array(m) > 0
    sel = m & (orig.mean(2) < restore); pa[sel] = orig[sel]
    Image.fromarray(np.clip(pa, 0, 255).astype('uint8')).save(out, quality=92)
    print(out, 'scale', round(k, 2))
