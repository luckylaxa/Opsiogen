"""A service page image with all its pieces whole and centred, equal margins: the image itself is scaled so
the work fits 1780 x 1000, centred on the work, and its own edges are extended where it runs short, so the
background stays one seamless gradient. Usage: python3 fit16x9.py SRC OUT"""
import sys, cv2, numpy as np
src, out = sys.argv[1:3]
i = cv2.imread(src); H, W = i.shape[:2]
bg = cv2.GaussianBlur(i, (0, 0), 60).astype(int)
d = (np.abs(i.astype(int) - bg).sum(2) > 60).astype(np.uint8)
d = cv2.morphologyEx(d, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
ys, xs = np.where(d)
x0, y0, x1, y1 = xs.min(), ys.min(), xs.max(), ys.max()
s = min(1780 / (x1 - x0), 1000 / (y1 - y0))
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
P = 3000
big = cv2.copyMakeBorder(i, P, P, P, P, cv2.BORDER_REPLICATE)
w, h = 1920 / s, 1080 / s
X, Y = int(round(cx - w / 2 + P)), int(round(cy - h / 2 + P))
c = big[Y:Y + int(round(h)), X:X + int(round(w))]
cv2.imwrite(out, cv2.resize(c, (1920, 1080), interpolation=cv2.INTER_CUBIC if s > 1 else cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 93])
