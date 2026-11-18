"""Laptop and phone from a case study cover (public/work/<slug>/*-0-phone.jpg), without the headline:
the band that holds the two devices, widened to 16:9 by repeating the cover's own background at its sides
(no seams, no text). Usage: python3 cover16x9.py SRC OUT [Y0 Y1]"""
import sys, cv2
src, out = sys.argv[1:3]
y0, y1 = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (842, 2336)
i = cv2.imread(src)
c = i[y0:y1, 56:2344].copy()
# small counters or labels below the laptop (BigTapp's "01 / 14") are painted out with the background
g = cv2.cvtColor(c, cv2.COLOR_BGR2GRAY); h = c.shape[0]
import numpy as np
m = np.zeros(g.shape, np.uint8); low = c[int(h * 0.86):, :700]
lg = cv2.cvtColor(low, cv2.COLOR_BGR2GRAY); bgv = np.median(lg)
m[int(h * 0.86):, :700] = (np.abs(lg.astype(int) - bgv) > 45).astype(np.uint8) * 255
if m.sum() and m.sum() < 255 * 20000: c = cv2.inpaint(c, cv2.dilate(m, np.ones((9, 9), np.uint8)), 7, cv2.INPAINT_TELEA)
pad = int(c.shape[0] * 0.035)
c = cv2.copyMakeBorder(c, pad, pad, 0, 0, cv2.BORDER_REPLICATE)
need = int(c.shape[0] * 16 / 9) - c.shape[1]
c = cv2.copyMakeBorder(c, 0, 0, need // 2, need - need // 2, cv2.BORDER_REPLICATE)
cv2.imwrite(out, cv2.resize(c, (1920, 1080), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 93])
