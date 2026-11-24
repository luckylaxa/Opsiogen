"""The neon glow and the floor glow, laid over a render: the lit-parts pass is blurred into a halo and screened on,
so the colours stay deep where they are bright and glow softly round them."""
import numpy as np
from PIL import Image, ImageFilter
def hexrgb(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
def composite(beauty, glow, out, floor=None, bloom=1.0, shadow=1.0):
    b = np.asarray(Image.open(beauty).convert('RGBA')).astype(np.float32) / 255; g = np.asarray(Image.open(glow).convert('RGBA')).astype(np.float32) / 255
    if shadow != 1.0:                                            # the floor shadow is what the render holds beyond the character's own outline
        ca = g[..., 3:]; sa = np.clip(b[..., 3:] - ca, 0, 1); b = np.concatenate([b[..., :3], np.clip(ca + sa * shadow, 0, 1)], axis=2)
        sh = (sa > 0.002) & (ca < 0.02); rgb = b[..., :3].copy(); rgb[sh[..., 0]] = np.array(hexrgb('#2c2f6e'), np.float32); b = np.concatenate([rgb, b[..., 3:]], axis=2)   # the shadow is a deep blue-violet, not grey
    res = b.shape[0]; k = res / 640
    bp = b[..., :3] * b[..., 3:]; gp = np.clip(g[..., :3] * g[..., 3:], 0, 1)
    gi = Image.fromarray((gp * 255).astype(np.uint8))
    amt = bloom; bloom = sum(np.asarray(gi.filter(ImageFilter.GaussianBlur(r * k))).astype(np.float32) / 255 * wt * amt for r, wt in ((6, 0.08), (16, 0.24), (38, 0.36), (80, 0.25)))   # little blur close in, so edges stay crisp
    if floor:                                                    # a soft coloured glow on the floor under the character
        cx, cy, hw, hh = floor; yy, xx = np.mgrid[0:b.shape[0], 0:b.shape[1]].astype(np.float32)
        fall = np.exp(-(((xx - cx) / hw) ** 2 + ((yy - cy) / hh) ** 2) * 1.6)[..., None]
        tt = np.clip((xx - cx) / (2 * hw) + 0.5, 0, 1)[..., None]
        st = [(0.0, '#3fd4ff'), (0.3, '#3a66ff'), (0.55, '#8a2cf0'), (1.0, '#ff4fc8')]   # cyan, blue, purple, pink: as under the first website character
        cc = np.zeros(tt.shape[:2] + (3,), np.float32)
        for (t0, h0), (t1, h1) in zip(st, st[1:]):
            m = (tt[..., 0] >= t0) & (tt[..., 0] <= t1); k = ((tt[..., 0] - t0) / (t1 - t0))[..., None]; cc[m] = (np.array(hexrgb(h0)) * (1 - k) + np.array(hexrgb(h1)) * k)[m]
        bloom = bloom + cc * fall * 0.85
    bloom = np.clip(bloom, 0, 1)
    ga = bloom.max(axis=2, keepdims=True)
    a = b[..., 3:] + ga * (1 - b[..., 3:])
    lit = bp + bloom * (1 - bp) * (1 - 0.55 * b[..., 3:])          # screen the halo on, gentler over the character itself
    rgb = np.clip(lit / np.maximum(a, 1e-4), 0, 1)
    Image.fromarray((np.concatenate([rgb, a], axis=2) * 255).astype(np.uint8)).save(out)
