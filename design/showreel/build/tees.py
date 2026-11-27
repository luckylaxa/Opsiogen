"""Shot 24 (owner, 27 Nov, of Cabot's stationery: "This looks very plain. Replace with Cabot T-shirt boy and girl or
something else"): the Cabot logo printed on the white T-shirts of a real photo, so the people are real and only the print
is ours (raw/stock/cabot-tees: Unsplash, Vitaly Gariev, "Smiling couple in white shirts against blue background"; the
logo is public/logos/cabot-solutions.svg in Cabot Blue #3380F5). Each print sits on the wearer's left chest; it takes the
fabric's own light and texture (multiplied, as ink on cotton), bends a little along the folds and is softened at its edge.
Usage: python3 tees.py [x y w ...] (centre and width of each print; defaults below) -> a/s-cabot-tees.jpg"""
import os
import sys
import numpy as np
import cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', 'raw', 'stock', 'cabot-tees')
photo = np.asarray(Image.open(os.path.join(RAW, 'couple-white-tees.jpg')).convert('RGB').resize((1920, 1080), Image.LANCZOS)).astype(np.float32)
logo = Image.open(os.path.join(RAW, 'cabot-blue.png')).convert('RGBA')
PRINTS = [(838, 936, 172, 0.0), (1440, 868, 200, -2.0)]   # her left chest, his left chest (right of the henley's buttons)
if len(sys.argv) > 1:
    v = list(map(float, sys.argv[1:])); PRINTS = [(v[i], v[i + 1], v[i + 2], 0.0) for i in range(0, len(v), 3)]

lum = cv2.cvtColor(photo.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
soft = cv2.GaussianBlur(lum, (0, 0), 6)
gx, gy = cv2.Sobel(soft, cv2.CV_32F, 1, 0, ksize=5), cv2.Sobel(soft, cv2.CV_32F, 0, 1, ksize=5)
out = photo.copy()
for cx, cy, w, rot in PRINTS:
    lg = logo.resize((int(w), round(logo.height * w / logo.width)), Image.LANCZOS).rotate(rot, expand=True, resample=Image.BICUBIC)
    a = np.asarray(lg).astype(np.float32)
    h_, w_ = a.shape[:2]; x0, y0 = int(round(cx - w_ / 2)), int(round(cy - h_ / 2))
    # bend along the folds: sample the print a little against the light's slope (at most about 2 px)
    sl = (slice(y0, y0 + h_), slice(x0, x0 + w_))
    k = 2.0 / max(1.0, np.percentile(np.hypot(gx[sl], gy[sl]), 99))
    mx, my = np.meshgrid(np.arange(w_, dtype=np.float32), np.arange(h_, dtype=np.float32))
    a = cv2.remap(a, mx - k * gx[sl], my - k * gy[sl], cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    al = cv2.GaussianBlur(a[..., 3] / 255.0, (0, 0), 0.6)[..., None] * 0.94
    ink = out[sl] * (a[..., :3] / 255.0)   # multiply: the cotton's light and weave show through the ink
    out[sl] = out[sl] * (1 - al) + ink * al
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(HERE, 'a', 's-cabot-tees.jpg'), quality=92)
print('a/s-cabot-tees.jpg', PRINTS)
