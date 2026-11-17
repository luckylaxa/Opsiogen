"""Cut the owner's character renders out of their white background, unchanged, so they can sit on any scene."""
import numpy as np, cv2
from PIL import Image

def cut(img, name, pad=10):
    a = np.array(img.convert('RGB')).astype(int); H, W = a.shape[:2]
    m = (a.min(axis=2) < 249).astype('uint8')
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), 'uint8'))
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); c = max(cs, key=cv2.contourArea)[:, 0, :]
    y0 = c[:, 1].min(); h = c[:, 1].max() - y0
    top = c[c[:, 1] < y0 + 0.42 * h].astype(float)              # the outline above the shadow: an arc of the sphere
    A = np.c_[2 * top[:, 0], 2 * top[:, 1], np.ones(len(top))]; b = (top ** 2).sum(axis=1)
    cx, cy, k = np.linalg.lstsq(A, b, rcond=None)[0]; R = np.sqrt(k + cx * cx + cy * cy)
    yy, xx = np.mgrid[0:H, 0:W]; dist = np.hypot(xx - cx, yy - cy)
    alpha = np.clip((R - 1.2 - dist) / 1.6 + 0.5, 0, 1)        # the sphere, with a soft edge
    dark = (a.max(axis=2) < 150) & (dist < R * 1.12) & (yy < cy + R * 0.7)   # the eye's dome where it stands proud of the outline, never the shadow underneath
    dark = cv2.GaussianBlur(cv2.dilate(dark.astype('uint8'), np.ones((3, 3), 'uint8')).astype('float32'), (0, 0), 0.8)
    alpha = np.maximum(alpha, dark)
    out = np.dstack([a, (alpha * 255)]).astype('uint8')
    x0, x1, y0b, y1 = int(cx - R * 1.13 - pad), int(cx + R * 1.13 + pad), int(cy - R * 1.13 - pad), int(cy + R * 1.13 + pad)
    im = Image.fromarray(out, 'RGBA').crop((max(0, x0), max(0, y0b), min(W, x1), min(H, y1)))
    side = max(im.size); sq = Image.new('RGBA', (side, side), (255, 255, 255, 0)); sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    sq.save(name + '.webp', quality=92, method=6); print(name, 'centre', round(cx), round(cy), 'radius', round(R), sq.size)
    return sq

hero = Image.open('source-hero.webp'); cut(hero, 'three-quarter')
sheet = Image.open('source-views.webp')
cells = {'front': (60, 60, 520, 520), 'back-left': (1020, 60, 1480, 520),
         'side': (60, 520, 520, 1010), 'back': (540, 520, 1000, 1010), 'above': (1020, 520, 1480, 1010)}
for name, box in cells.items(): cut(sheet.crop(box), name)
