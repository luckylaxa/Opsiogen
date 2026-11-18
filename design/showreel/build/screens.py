"""Lifts the screen out of each latest case study design (public/work/<slug>/<n>-wide.jpg), so the film can fly single
designs in and build collages of them (Lucky, 18 Nov: "design collage animation, snappy individual design works entrance
to the screen", "Use only latest figma files"). Product designs are a screen on the brand colour; website designs also
have a caption panel on the right, which is left out. Writes a/scr-<slug>-<n>.jpg and a/screens.js:
window.SCREENS = {key: {bg, w, h}} (bg: the design's own background colour).
Usage: python3 screens.py"""
import cv2, numpy as np, glob, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); WORK = os.path.join(HERE, "../../../public/work")
PROJECTS = {"meetingful": 1.0, "rxlive": 1.0, "care-connect": 1.0, "surgo-health": 1.0,
            "carlton-noble": 0.76, "engel-volkers": 0.76, "bigtapp": 0.76, "sifio-health": 0.76}
out = {}
for slug, part in PROJECTS.items():
    for f in sorted(glob.glob(os.path.join(WORK, slug, "*-wide.jpg")), key=lambda p: int(re.findall(r"-(\d+)-wide", p)[0])):
        n = int(re.findall(r"-(\d+)-wide", f)[0])
        i = cv2.imread(f); H, W = i.shape[:2]
        L = i[:, :int(W * part)]
        e = cv2.dilate(cv2.Canny(cv2.cvtColor(L, cv2.COLOR_BGR2GRAY), 30, 90), np.ones((5, 5), np.uint8))
        cs, _ = cv2.findContours(e, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        x, y, w, h = max((cv2.boundingRect(c) for c in cs), key=lambda r: r[2] * r[3])
        x, y, w, h = x + 4, y + 4, w - 8, h - 8
        if w * h < 0.25 * W * H or w < 2 * h * 0.6: print("skip (no clear screen):", slug, n, (x, y, w, h)); continue
        ring = np.concatenate([i[max(y - 30, 0):max(y - 6, 1), x:x + w].reshape(-1, 3), i[y:y + h, max(x - 30, 0):max(x - 6, 1)].reshape(-1, 3)])
        col = np.median(ring, 0).astype(int)
        key = f"scr-{slug}-{n}"
        cv2.imwrite(os.path.join(HERE, "a", key + ".jpg"), i[y:y + h, x:x + w], [cv2.IMWRITE_JPEG_QUALITY, 92])
        out[key] = {"bg": "#%02x%02x%02x" % (col[2], col[1], col[0]), "w": int(w), "h": int(h)}
open(os.path.join(HERE, "a", "screens.js"), "w").write("window.SCREENS=" + json.dumps(out) + ";\n")
print(len(out), "screens")
