"""MVPs page-top image: the tablet held in two hands, our dashboard fitted exactly to its screen."""
import sys, os, numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw, ImageFilter
from comp import coeffs
from fit import screen_mask, fit_quad
T = os.path.dirname(os.path.abspath(__file__)) + '/..'
src = Image.open(T + '/scenes/ai-mvps-business-apps/page-tablet.jpg').convert('RGB')
a = np.array(src).astype(float); H, W = a.shape[:2]
# Recolour the pale backdrop to the page's coral (a smooth top-to-bottom tone), keeping the screen white.
m0 = screen_mask(np.array(src)); scr = cv2.dilate(m0, np.ones((9, 9), np.uint8)) > 0
lum = a.mean(2); alpha = np.clip((lum - 45) / 140, 0, 1); alpha[scr] = 0
t = np.linspace(0, 1, H)[:, None, None]; top = np.array((0xB2, 0x3A, 0x2C), float); bot = np.array((0xF2, 0x8A, 0x6C), float)
bg = np.broadcast_to(top * (1 - t) + bot * t, (H, W, 3))
shade = (lum / np.percentile(lum[alpha > 0.9], 60))[..., None]; bg = bg * np.clip(0.85 + 0.15 * shade, 0.7, 1.15)
a = a * (1 - alpha[..., None]) + bg * alpha[..., None]
# The design, padded at the bottom to the screen's shape so nothing is cut off.
q = fit_quad(m0); sw = np.hypot(*np.subtract(q[1], q[0])); sh = np.hypot(*np.subtract(q[3], q[0]))
art = Image.open(T + '/art/o-dash.png').convert('RGB'); aw, ah = art.size; nh = round(aw * sh / sw)
art = Image.fromarray(np.pad(np.array(art), ((0, max(0, nh - ah)), (0, 0), (0, 0)), mode='edge')).convert('RGBA')  # continue the last row (sidebar and page)
aw, ah = art.size
def grow(q, px):
    c = np.mean(q, 0); return [tuple(c + (np.array(p) - c) * (1 + px / np.linalg.norm(np.array(p) - c))) for p in q]
ss = 2
w = art.transform((W * ss, H * ss), Image.PERSPECTIVE, coeffs([(x * ss, y * ss) for x, y in grow(q, 3)], [(0, 0), (aw, 0), (aw, ah), (0, ah)]), Image.BICUBIC).resize((W, H), Image.LANCZOS)
lm = np.array(src).min(2)
mk = ((cv2.dilate(m0, np.ones((5, 5), np.uint8)) > 0) & (lm > 70)).astype(float)
wa = np.array(w).astype(float); al = (mk * wa[..., 3] / 255)[..., None]
out = Image.fromarray(np.clip(a * (1 - al) + wa[..., :3] * al, 0, 255).astype('uint8'))
xs = [p[0] for p in q]; ys = [p[1] for p in q]; cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
for size, name, dev in [((2400, 1200), 'page.jpg', 0.84), ((1600, 1200), 'page-phone.jpg', 0.74)]:
    ar = size[0] / size[1]; bw, bh = max(xs) - min(xs), max(ys) - min(ys)
    ch = max(bh / dev, bw / dev / ar); cw = ch * ar
    if cw > W: cw = W; ch = cw / ar
    if ch > H: ch = H; cw = ch * ar
    x0 = min(max(0, cx - cw / 2), W - cw); y0 = min(max(0, cy - ch / 2), H - ch)
    out.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize(size, Image.LANCZOS).save(T + '/out/mvps/' + name, quality=90)
    print(name, 'crop', int(cw), int(ch))
