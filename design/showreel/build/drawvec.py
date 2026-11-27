"""Turns a flat illustration into the shapes the film draws (frames.html, the 'Illustration:' fillers; owner, 27 Nov:
"This new illustration animation for fillers"): its flat colours (k-means in Lab on a copy with the print grain smoothed
out), each colour's regions as outlines with their holes, largest first. The film draws the outlines in ink, puts the
colours on and lets the picture itself (with its grain) come through at the end, so the shapes only need to be close.
Writes a/draw-<name>.js: DRAWS[name] = {w, h, bg, img, shapes: [[colour, path, area], ...]}.
Usage: python3 drawvec.py NAME IMAGE [COLOURS]"""
import sys, os, json
import numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
name, src = sys.argv[1], sys.argv[2]; K = int(sys.argv[3]) if len(sys.argv) > 3 else 12
img = cv2.imread(src); H, W = img.shape[:2]
flat = cv2.bilateralFilter(cv2.pyrMeanShiftFiltering(img, 10, 26), 9, 30, 7)   # the grain smoothed out, the edges kept
lab = cv2.cvtColor(flat, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
rng = np.random.default_rng(3); sample = lab[rng.choice(len(lab), 60000, replace=False)]
_, _, centres = cv2.kmeans(sample, K, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 60, .2), 6, cv2.KMEANS_PP_CENTERS)
# colours closer than a just-visible step are one colour (the print's shade variations)
keep = []
for c in centres[np.argsort(-np.bincount(np.argmin(((sample[:, None, :] - centres[None]) ** 2).sum(2), 1), minlength=K))]:
    if all(np.linalg.norm(c - k) > 9 for k in keep): keep.append(c)
centres = np.float32(keep); K = len(centres)
lbl = np.argmin(((lab[:, None, :] - centres[None]) ** 2).sum(2), 1).reshape(H, W)
# a smooth majority vote, then specks merged into the colour round them
votes = np.stack([cv2.GaussianBlur((lbl == k).astype(np.float32), (0, 0), 2.2) for k in range(K)])
lbl = votes.argmax(0)
for _ in range(3):
    for k in range(K):
        n, cc, st, _ = cv2.connectedComponentsWithStats((lbl == k).astype(np.uint8), connectivity=4)
        small = np.isin(cc, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] < 260])
        if small.any():
            v = votes.copy(); v[k] = -1; lbl[small] = v.argmax(0)[small]
corner = np.bincount(np.concatenate([lbl[:8, :8].ravel(), lbl[:8, -8:].ravel(), lbl[-8:, :8].ravel(), lbl[-8:, -8:].ravel()])).argmax()
mean_bgr = lambda m: np.median(img[m], 0)
hexc = lambda bgr: '#%02x%02x%02x' % (int(bgr[2]), int(bgr[1]), int(bgr[0]))
shapes = []
for k in range(K):
    if k == corner: continue
    m = (lbl == k).astype(np.uint8)
    if m.sum() < 60: continue
    col = hexc(mean_bgr(m.astype(bool)))
    cs, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    if hier is None: continue
    for i, c in enumerate(cs):
        if hier[0][i][3] != -1: continue                                # holes go with their outline
        area = cv2.contourArea(c)
        if area < 60: continue
        parts = [c] + [cs[j] for j in range(len(cs)) if hier[0][j][3] == i and cv2.contourArea(cs[j]) >= 30]
        d = ''
        for p in parts:
            q = cv2.approxPolyDP(p, .9, True).reshape(-1, 2)
            if len(q) < 3: continue
            d += 'M' + ' '.join(f'{x} {y}' for x, y in q) + 'Z'
        shapes.append([col, d, int(area)])
shapes.sort(key=lambda s: -s[2])
out = {'w': W, 'h': H, 'bg': hexc(mean_bgr(lbl == corner)), 'img': os.path.relpath(os.path.abspath(src), HERE), 'shapes': shapes}
path = os.path.join(HERE, 'a', f'draw-{name}.js')
open(path, 'w').write('window.DRAWS=window.DRAWS||{};DRAWS[' + json.dumps(name) + ']=' + json.dumps(out, separators=(',', ':')) + ';\n')
print('a/draw-%s.js' % name, len(shapes), 'shapes', os.path.getsize(path) // 1024, 'KB', 'bg', out['bg'],
      'colours', sorted({s[0] for s in shapes}))
