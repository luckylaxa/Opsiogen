"""Zooms a service tile or page image into its content: the smallest 16:9 window around the work, so the
frame has no empty top left for text that the film does not carry. Usage: python3 zoom16x9.py SRC OUT"""
import sys, cv2, numpy as np
def content_box(i):
    bg = cv2.GaussianBlur(i, (0, 0), 60).astype(int)
    d = (np.abs(i.astype(int) - bg).sum(2) > 60).astype(np.uint8)
    d = cv2.morphologyEx(d, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    ys, xs = np.where(d)
    return xs.min(), ys.min(), xs.max(), ys.max()
def zoom(src, out):
    i = cv2.imread(src); H, W = i.shape[:2]
    x0, y0, x1, y1 = content_box(i)
    m = int(0.05 * max(x1 - x0, y1 - y0)); x0, y0, x1, y1 = x0 - m, y0 - m, x1 + m, y1 + m
    w, h = x1 - x0, y1 - y0
    if w / h > 16 / 9: h = w * 9 / 16
    else: w = h * 16 / 9
    w, h = min(w, W, H * 16 / 9), min(h, H, W * 9 / 16)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    x = int(min(max(cx - w / 2, 0), W - w)); y = int(min(max(cy - h / 2, 0), H - h))
    c = i[y:y + int(h), x:x + int(w)]
    cv2.imwrite(out, cv2.resize(c, (1920, 1080), interpolation=cv2.INTER_CUBIC if c.shape[1] < 1920 else cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 93])
    print(src, 'window', x, y, int(w), int(h))
if __name__ == '__main__': zoom(sys.argv[1], sys.argv[2])
