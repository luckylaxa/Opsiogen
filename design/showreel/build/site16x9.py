"""A case study website mockup without its caption panel: only the screen, on the mockup's own background
colour, 1920 x 1080. The screen is found as the largest sharp-edged rectangle left of the panel.
Usage: python3 site16x9.py SRC OUT"""
import sys, cv2, numpy as np
src, out = sys.argv[1:3]
i = cv2.imread(src); H, W = i.shape[:2]
L = i[:, :int(W * 0.76)]
e = cv2.Canny(cv2.cvtColor(L, cv2.COLOR_BGR2GRAY), 30, 90)
e = cv2.dilate(e, np.ones((5, 5), np.uint8))
cs, _ = cv2.findContours(e, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
x, y, w, h = max((cv2.boundingRect(c) for c in cs), key=lambda r: r[2] * r[3])
x, y, w, h = x + 4, y + 4, w - 8, h - 8  # inside the dilated edge
piece = i[y:y + h, x:x + w]
ring = np.concatenate([i[max(y - 30, 0):y - 6, x:x + w].reshape(-1, 3), i[y:y + h, max(x - 30, 0):x - 6].reshape(-1, 3)])
col = np.median(ring, 0)
F = np.zeros((1080, 1920, 3), np.uint8); F[:] = col
s = min(1760 / w, 960 / h)
p = cv2.resize(piece, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
px, py = (1920 - p.shape[1]) // 2, (1080 - p.shape[0]) // 2
F[py:py + p.shape[0], px:px + p.shape[1]] = p
cv2.imwrite(out, F, [cv2.IMWRITE_JPEG_QUALITY, 93]); print(src.split('/')[-1], (x, y, w, h), col.astype(int))
