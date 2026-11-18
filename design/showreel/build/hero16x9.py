"""A service tile's main image, whole and large, on the tile's own colour: no empty corners left for page
text. The main image is the largest sharp-edged rectangle in the tile. Usage: python3 hero16x9.py SRC OUT"""
import sys, cv2, numpy as np
src, out = sys.argv[1:3]
i = cv2.imread(src); H, W = i.shape[:2]
e = cv2.dilate(cv2.Canny(cv2.cvtColor(i, cv2.COLOR_BGR2GRAY), 30, 90), np.ones((3, 3), np.uint8))
cs, _ = cv2.findContours(e, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
best = None
for c in cs:
    x, y, w, h = cv2.boundingRect(c)
    if w * h < 0.12 * W * H or w > W - 4 or h > H - 4: continue
    if cv2.contourArea(cv2.convexHull(c)) < 0.9 * w * h: continue
    if best is None or w * h > best[2] * best[3]: best = (x, y, w, h)
if best is None: sys.exit(print(src, "no main image"))
x, y, w, h = best; x, y, w, h = x + 3, y + 3, w - 6, h - 6
piece = i[y:y + h, x:x + w]
col = np.median(np.concatenate([i[:12].reshape(-1, 3), i[:, :12].reshape(-1, 3)]), 0)
F = np.zeros((1080, 1920, 3), np.uint8); F[:] = col
s = min(1700 / w, 960 / h)
p = cv2.resize(piece, (int(w * s), int(h * s)), interpolation=cv2.INTER_CUBIC if s > 1 else cv2.INTER_AREA)
px, py = (1920 - p.shape[1]) // 2, (1080 - p.shape[0]) // 2
F[py:py + p.shape[0], px:px + p.shape[1]] = p
cv2.imwrite(out, F, [cv2.IMWRITE_JPEG_QUALITY, 93]); print(src.split('/')[-1], best, round(s, 2))
