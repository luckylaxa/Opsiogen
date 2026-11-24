"""The neon glow and the floor glow, laid over a render: the lit-parts pass is blurred into a halo and screened on,
so the colours stay deep where they are bright and glow softly round them."""
import numpy as np
from PIL import Image, ImageFilter
def hexrgb(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
def composite(beauty, glow, out, floor=None, bloom=1.0, shadow=1.0):
    b = np.asarray(Image.open(beauty).convert('RGBA')).astype(np.float32) / 255; g = np.asarray(Image.open(glow).convert('RGBA')).astype(np.float32) / 255
    if shadow != 1.0:                                            # the floor shadow is what the render holds beyond the character's own outline
        ca = g[..., 3:]; sa = np.clip(b[..., 3:] - ca, 0, 1); b = np.concatenate([b[..., :3], np.clip(ca + sa * shadow, 0, 1)], axis=2)
    res = b.shape[0]; k = res / 640
    bp = b[..., :3] * b[..., 3:]; gp = np.clip(g[..., :3] * g[..., 3:], 0, 1)
    gi = Image.fromarray((gp * 255).astype(np.uint8))
    amt = bloom; bloom = sum(np.asarray(gi.filter(ImageFilter.GaussianBlur(r * k))).astype(np.float32) / 255 * wt * amt for r, wt in ((6, 0.08), (16, 0.24), (38, 0.36), (80, 0.25)))   # little blur close in, so edges stay crisp
    if floor:                                                    # a soft coloured glow on the floor under the character
        cx, cy, hw, hh = floor; yy, xx = np.mgrid[0:res, 0:res].astype(np.float32)
        fall = np.exp(-(((xx - cx) / hw) ** 2 + ((yy - cy) / hh) ** 2) * 1.6)[..., None]
        tt = np.clip((xx - cx) / (2 * hw) + 0.5, 0, 1)[..., None]
        c1, c2, c3 = np.array(hexrgb('#2f7bff')), np.array(hexrgb('#9b1cf0')), np.array(hexrgb('#ff3fc8'))
        cc = np.where(tt < 0.5, c1 + (c2 - c1) * (tt / 0.5), c2 + (c3 - c2) * ((tt - 0.5) / 0.5))
        bloom = bloom + cc * fall * 0.85
    bloom = np.clip(bloom, 0, 1)
    ga = bloom.max(axis=2, keepdims=True)
    a = b[..., 3:] + ga * (1 - b[..., 3:])
    lit = bp + bloom * (1 - bp) * (1 - 0.55 * b[..., 3:])          # screen the halo on, gentler over the character itself
    rgb = np.clip(lit / np.maximum(a, 1e-4), 0, 1)
    Image.fromarray((np.concatenate([rgb, a], axis=2) * 255).astype(np.uint8)).save(out)
