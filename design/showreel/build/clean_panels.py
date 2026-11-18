"""Cleans the panels of the service artwork frames (a/svc-*.jpg). Each panel was cut from a service tile, so the
tile's own background showed in the panel: slivers round a phone's or a card's rounded corners and, on one phone, a
thin strip down a side (Lucky, 18 Nov: "some screen cutting is not perfect"). Those pixels become the frame's own
background colour, so every phone and card stands cleanly on the frame. A phone's black frame and anything inside a
panel are left as they are. Safe to run again. Run pieces.py after it.
Usage: python3 clean_panels.py"""
import cv2, numpy as np, glob, os
HERE = os.path.dirname(os.path.abspath(__file__))
for f in sorted(glob.glob(os.path.join(HERE, "a", "svc-*.jpg"))):
    i = cv2.imread(f); H, W = i.shape[:2]; I = i.astype(int)
    border = np.concatenate([I[:6].reshape(-1, 3), I[-6:].reshape(-1, 3), I[:, :6].reshape(-1, 3), I[:, -6:].reshape(-1, 3)])
    bg = np.median(border, 0).astype(int)
    m = (np.abs(I - bg).sum(2) > 36).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    boxes = [list(map(int, st[k, :4])) for k in range(1, n) if st[k, 2] * st[k, 3] > 0.01 * W * H]
    lum = I.mean(2); paint = np.zeros((H, W), bool)
    for x, y, w, h in boxes:
        mid = range(y + h // 4, y + 3 * h // 4)
        # A phone: tall, with its black frame within a few pixels of both sides all the way down.
        phone = w >= 200 and h > 1.3 * w and np.mean([(lum[r, x:x + 8] < 45).any() for r in mid]) > .7 and np.mean([(lum[r, x + w - 8:x + w] < 45).any() for r in mid]) > .7
        if phone:   # outside its frame: row by row from each side (corners, a strip down a side), and above its top
            for r in range(y, y + h):
                for xs in (range(x, min(x + 80, x + w)), range(x + w - 1, max(x + w - 81, x - 1), -1)):
                    k = next((j for j, c in enumerate(xs) if lum[r, c] < 45), None)
                    if k: paint[r, [xs[j] for j in range(k)]] = True
            for c in range(x, x + w):
                k = next((j for j in range(12) if lum[y + j, c] < 45), None)
                if k: paint[y:y + k, c] = True
            for cx, sx in ((x, 1), (x + w - 1, -1)):   # each top corner: everything up to the frame's curve
                xs = sorted((cx, cx + sx * 89)); win = (lum[y:y + 90, xs[0]:xs[1] + 1] >= 45).astype(np.uint8)
                k = next((k for k in range(8) if win[k, cx + sx * k - xs[0]]), None)   # past the blended edge pixels
                if k is None: continue
                _, lab2 = cv2.connectedComponents(win, connectivity=4)
                reg = lab2 == lab2[k, cx + sx * k - xs[0]]
                if reg.sum() < .3 * 90 * 90: paint[y:y + 90, xs[0]:xs[1] + 1] |= reg
            continue
        Q = 70      # a card: the tile's colour round its rounded corners
        for cx, cy, sx, sy in ((x, y, 1, 1), (x + w - 1, y, -1, 1), (x, y + h - 1, 1, -1), (x + w - 1, y + h - 1, -1, -1)):
            sxp, syp = cx + 2 * sx, cy + 2 * sy; p = I[syp, sxp]
            if np.abs(p - bg).sum() < 30 or lum[syp, sxp] < 45: continue
            xs, ys = sorted((cx, cx + sx * (Q - 1))), sorted((cy, cy + sy * (Q - 1)))
            win = I[ys[0]:ys[1] + 1, xs[0]:xs[1] + 1]
            near = ((np.abs(win - p).sum(2) < 70) & (win.mean(2) >= 45)).astype(np.uint8)
            _, lab2 = cv2.connectedComponents(near, connectivity=4)
            reg = lab2 == lab2[syp - ys[0], sxp - xs[0]]
            if reg.sum() > 0.3 * Q * Q: continue                                 # the panel's own content, cut by its edge
            paint[ys[0]:ys[1] + 1, xs[0]:xs[1] + 1] |= cv2.dilate(reg.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    ring = np.zeros((H, W), bool)          # the panels' blended outer edge, where the film shows the panels on their own
    inside = np.zeros((H, W), bool)
    for x, y, w, h in boxes: inside[y:y + h, x:x + w] = True
    if ((np.abs(I - bg).sum(2) > 12) & ~inside).mean() <= 0.004:              # as pieces.py: not a frame that moves whole
        for x, y, w, h in boxes: ring[max(y - 4, 0):y + h + 4, max(x - 4, 0):x + w + 4] = True
        for x, y, w, h in boxes: ring[y + 1:y + h - 1, x + 1:x + w - 1] = False
        paint |= ring & (np.abs(I - bg).sum(2) < 60)
    if not paint.any(): print(os.path.basename(f), "clean"); continue
    soft = paint & ((lum >= 30) | ring)
    i[soft] = bg.astype(np.uint8)
    cv2.imwrite(f, i, [cv2.IMWRITE_JPEG_QUALITY, 95])
    print(os.path.basename(f), "painted", int(soft.sum()), "px with", bg.tolist())
