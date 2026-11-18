"""Builds our logo for the end of the film so it can be shown much larger than its usual size and stay sharp
(Lucky, 18 Nov: our character flies fast through the middle of the O, the logo larger while it does, then back to its
usual size in the centre). The master SVG (brand/logo) has the letters and the O's outline as vectors but has lost the
O's colours, so the O's colour comes from the large PNG (brand/logo/opsiogen-logo-on-dark.png, 2000 px) and is cut
by the vector outline: every edge stays crisp at any size. The colour is spread a few pixels past the O's edge first,
so the outline cuts through colour, not through the PNG's soft edge.
Writes a/logo-ring.png and a/logo.js: window.LOGO = {vb, letters, ring: {d, x, y, w, h}, hole: {x, y, r}} in the
SVG's units (hole: the largest circle that fits in the O's opening, which our character flies through).
Usage: python3 logo.py"""
import re, json, os
import numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__)); BRAND = os.path.join(HERE, "../../../brand/logo")
svg = open(os.path.join(BRAND, "opsiogen-logo-master-white.svg")).read()
VB = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()][2:]
letters = re.findall(r'<path class="st142" d="([^"]+)"', svg)
ring = re.search(r'<clipPath id="clippath">\s*<path class="st\d+" d="([^"]+)"', svg).group(1)
assert len(letters) == 7, len(letters)
png = cv2.imread(os.path.join(BRAND, "opsiogen-logo-on-dark.png"), cv2.IMREAD_UNCHANGED)
H, W = png.shape[:2]; k = W / VB[0]                       # PNG pixels per SVG unit
assert abs(H / k - VB[1]) < 0.05, (H / k, VB[1])
a = png[:, :, 3].astype(np.float32) / 255
sat = (png[:, :, :3].max(2).astype(int) - png[:, :, :3].min(2)) > 60
ys, xs = np.where(sat & (a > .5)); cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
R = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2
x0, y0, x1, y1 = int(cx - R - 12), max(0, int(cy - R - 12)), int(cx + R + 13), min(H, int(cy + R + 13))
crop = png[y0:y1, x0:x1].astype(np.float32); ca = crop[:, :, 3] / 255
yy, xx = np.mgrid[y0:y1, x0:x1]; inside = np.hypot(xx - cx, yy - cy) <= R + 3      # the O only, not the letters beside it
# Only colour well inside the O is kept: its own edge pixels (soft, uneven, with a thin light rim) showed as a white
# dotted line at the O's edge once the logo was shown large (Lucky, 18 Nov). The vector outline makes the edge.
w = cv2.erode(np.where(inside & (ca > .97), 1, 0).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(np.float32)
col = crop[:, :, :3] * w[..., None]
for _ in range(24):                                       # spread the O's colour outwards, a pixel at a time
    s, n = cv2.blur(col, (3, 3)), cv2.blur(w, (3, 3))
    grow = (w == 0) & (n > 0); col[grow] = s[grow] / n[grow, None]; w[grow] = 1
out = np.dstack([np.clip(col, 0, 255), np.full(ca.shape, 255, np.float32)]).astype(np.uint8)
cv2.imwrite(os.path.join(HERE, "a", "logo-ring.png"), out)
# The opening: transparent pixels inside the O's outer circle, joined to its middle. Its largest inner circle.
hole = ((a < .5) & (np.hypot(*np.mgrid[0:H, 0:W][::-1] - np.array([cx, cy])[:, None, None]) < R * .8)).astype(np.uint8)
n, lab = cv2.connectedComponents(hole); hole = (lab == lab[int(cy), int(cx)]).astype(np.uint8)
dt = cv2.distanceTransform(hole, cv2.DIST_L2, 5); hy, hx = np.unravel_index(dt.argmax(), dt.shape)
LOGO = {"vb": VB, "letters": letters, "ring": {"d": ring, "x": x0 / k, "y": y0 / k, "w": (x1 - x0) / k, "h": (y1 - y0) / k},
        "o": {"x": cx / k, "y": cy / k, "r": R / k}, "hole": {"x": float(hx) / k, "y": float(hy) / k, "r": float(dt.max()) / k}}
open(os.path.join(HERE, "a", "logo.js"), "w").write("window.LOGO=" + json.dumps(LOGO) + ";\n")
print("O centre", round(cx), round(cy), "radius", round(R), "| opening centre", hx, hy, "radius", round(float(dt.max()), 1), "px of", W)
