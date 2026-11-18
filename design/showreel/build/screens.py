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
        # The design's frame round the screen (5 to 9 px of white or grey) showed as dotted lines at every card's edge
        # in the film (Lucky, 18 Nov). Each side: the even band at the edge ends where the screen starts; cut past it.
        g = i[y:y + h, x:x + w].mean(2)
        def cut(p):
            e = next((k for k in range(1, len(p)) if abs(p[k] - p[0]) > 5), len(p))
            return e + 2 if e <= 12 else 2
        t = cut([g[k, w // 4:3 * w // 4].mean() for k in range(20)]); b = cut([g[h - 1 - k, w // 4:3 * w // 4].mean() for k in range(20)])
        l = cut([g[h // 4:3 * h // 4, k].mean() for k in range(20)]); r = cut([g[h // 4:3 * h // 4, w - 1 - k].mean() for k in range(20)])
        x, y, w, h = x + l, y + t, w - l - r, h - t - b
        for _ in range(3):   # then a last hairline (a shadow or 1 px line) left at any edge goes too
            g = i[y:y + h, x:x + w].mean(2)
            line = lambda rows: abs(rows[0] - np.median(rows[1:6])) > 12
            if line([g[k, w // 4:3 * w // 4].mean() for k in range(6)]): y, h = y + 1, h - 1
            if line([g[h - 1 - k, w // 4:3 * w // 4].mean() for k in range(6)]): h -= 1
            if line([g[h // 4:3 * h // 4, k].mean() for k in range(6)]): x, w = x + 1, w - 1
            if line([g[h // 4:3 * h // 4, w - 1 - k].mean() for k in range(6)]): w -= 1
        ring = np.concatenate([i[max(y - 30, 0):max(y - 6, 1), x:x + w].reshape(-1, 3), i[y:y + h, max(x - 30, 0):max(x - 6, 1)].reshape(-1, 3)])
        col = np.median(ring, 0).astype(int)
        key = f"scr-{slug}-{n}"
        c = i[y:y + h, x:x + w].copy()
        # Screens with rounded corners keep a few pixels of the design's background in each corner: fill them from the
        # screen around them, so every screen is a clean rectangle (the film rounds the corners itself).
        Q = 28
        def window(fy, fx): return (c[h - Q:, w - Q:] if fy and fx else c[h - Q:, :Q] if fy else c[:Q, w - Q:] if fx else c[:Q, :Q])[::-1 if fy else 1, ::-1 if fx else 1].copy()
        def put(fy, fx, win):
            win = win[::-1 if fy else 1, ::-1 if fx else 1]
            if fy and fx: c[h - Q:, w - Q:] = win
            elif fy: c[h - Q:, :Q] = win
            elif fx: c[:Q, w - Q:] = win
            else: c[:Q, :Q] = win
        masks, radii = {}, []
        for fy, fx in ((0, 0), (0, 1), (1, 0), (1, 1)):   # each corner turned to the window's top left
            win = window(fy, fx)
            if np.abs(win[0, 0].astype(int) - win[12, 12].astype(int)).sum() < 40: continue
            far = (np.abs(win.astype(int) - win[12, 12].astype(int)).sum(2) > 60).astype(np.uint8)   # not the screen's own colour
            _, lab = cv2.connectedComponents(far, connectivity=4); m = (lab == lab[0, 0]).astype(np.uint8) * 255
            masks[(fy, fx)] = (win, far, m)
            if m.sum() / 255 <= .35 * Q * Q: radii.append(max(int((m[0] > 0).sum()), int((m[:, 0] > 0).sum())))
        R = int(np.median(radii)) if radii else 0
        yy, xx = np.mgrid[0:Q, 0:Q]; outside = ((xx < R) & (yy < R) & (np.hypot(xx - R, yy - R) > R - 1.5)).astype(np.uint8) * 255
        for (fy, fx), (win, far, m) in masks.items():
            if m.sum() / 255 > .35 * Q * Q:            # it runs into the screen's own colour: cut by the corners' radius
                if not R: continue
                m = cv2.bitwise_and(outside, far * 255)
            m = cv2.dilate(m, np.ones((5, 5), np.uint8))
            put(fy, fx, cv2.inpaint(win, m, 3, cv2.INPAINT_TELEA))
        cv2.imwrite(os.path.join(HERE, "a", key + ".jpg"), c, [cv2.IMWRITE_JPEG_QUALITY, 92])
        out[key] = {"bg": "#%02x%02x%02x" % (col[2], col[1], col[0]), "w": int(w), "h": int(h)}
open(os.path.join(HERE, "a", "screens.js"), "w").write("window.SCREENS=" + json.dumps(out) + ";\n")
print(len(out), "screens")
