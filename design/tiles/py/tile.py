"""Compose a service tile at full resolution: crop the scene first, then put our screen on it.
fill=(top, right): the screen's top edge lands at `top` of the tile height, its right edge at
`right` of the width; the crop runs to the bottom of the scene. No blur anywhere."""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comp import place, coeffs
from quad import find_quad
from fit import screen_mask, fit_quad, soft_mask
import cv2
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
    im = Image.open(scene).convert('RGB'); W, H = im.size
    src = np.array(im); smask, hard = soft_mask(src); q = fit_quad(hard)
    if aspect: q = full_quad(q, H, aspect)
    if extend:
        # Continue the background upward by mirroring its top band (sharp, no blur), so the
        # device sits lower in the tile. Only for plain, even backgrounds (planks, linen, walls).
        a = np.array(im); top = a[:extend][::-1]
        im = Image.fromarray(np.concatenate([top, a], 0)); q = [(x, y + extend) for x, y in q]; H += extend
        smask = np.concatenate([np.zeros((extend, W), 'uint8'), smask], 0)
    top, right = fill; sy = min(v[1] for v in q); sx = max(v[0] for v in q)
    h = min(H, (H - sy) / (1 - top)); w = h * 4 / 3
    if w > W: w = W; h = w * 3 / 4
    y0 = H - h; x0 = min(max(0, sx - right * w), W - w)
    k = OUT[0] / w
    crop = im.crop((round(x0), round(y0), round(x0 + w), round(y0 + h))).resize(OUT, Image.LANCZOS)
    crop = crop.filter(ImageFilter.UnsharpMask(1.4, 60, 2))
    qq = [((x - x0) * k, (y - y0) * k) for x, y in q]
    box_ = (round(x0), round(y0), round(x0 + w), round(y0 + h))
    alpha = np.array(Image.fromarray(smask).crop(box_).resize(OUT, Image.LANCZOS)).astype(float) / 255
    a = Image.open(art).convert('RGBA'); aw, ah = a.size; ss = 2
    wp = a.transform((OUT[0] * ss, OUT[1] * ss), Image.PERSPECTIVE, coeffs([(x * ss, y * ss) for x, y in expand(qq, 2 * k)], [(0, 0), (aw, 0), (aw, ah), (0, ah)]), Image.BICUBIC).resize(OUT, Image.LANCZOS)
    wa = np.array(wp).astype(float); al = (alpha * wa[..., 3] / 255)[..., None]
    pa = np.array(crop).astype(float) * (1 - al) + wa[..., :3] * al
    Image.fromarray(np.clip(pa, 0, 255).astype('uint8')).save(out, quality=92)
    print(out, 'scale', round(k, 2))
