"""Finds the separate pieces (screens, cards, pages) in the film's flat-background images, so each piece can move
on its own in the film while the still stays exactly as approved. Writes a/pieces.js: window.PIECES = {src: {bg, boxes}}.
Usage: python3 pieces.py"""
import cv2, numpy as np, glob, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
out = {}
files = sorted(sum((glob.glob(os.path.join(HERE, "a", p)) for p in ("svc-*.jpg", "col-*.jpg", "s-*.jpg", "h-t-*.jpg")), []))
for f in files:
    i = cv2.imread(f); H, W = i.shape[:2]
    if (W, H) != (1920, 1080): continue
    border = np.concatenate([i[:6].reshape(-1, 3), i[-6:].reshape(-1, 3), i[:, :6].reshape(-1, 3), i[:, -6:].reshape(-1, 3)]).astype(int)
    bg = np.median(border, 0)
    if np.abs(border - bg).sum(1).mean() > 10: continue  # only images on one flat colour
    m = (np.abs(i.astype(int) - bg).sum(2) > 36).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    boxes = [list(map(int, st[k, :4])) for k in range(1, n) if st[k, 2] * st[k, 3] > 0.01 * W * H]
    merged = True
    while merged:  # boxes that touch or overlap are one piece
        merged = False
        for a in range(len(boxes)):
            for b in range(a + 1, len(boxes)):
                x1, y1, w1, h1 = boxes[a]; x2, y2, w2, h2 = boxes[b]
                if x1 < x2 + w2 + 8 and x2 < x1 + w1 + 8 and y1 < y2 + h2 + 8 and y2 < y1 + h1 + 8:
                    x, y = min(x1, x2), min(y1, y2)
                    boxes[a] = [x, y, max(x1 + w1, x2 + w2) - x, max(y1 + h1, y2 + h2) - y]; boxes.pop(b); merged = True; break
            if merged: break
    pad = 3
    boxes = [[max(x - pad, 0), max(y - pad, 0), min(x + w + pad, W) - max(x - pad, 0), min(y + h + pad, H) - max(y - pad, 0)] for x, y, w, h in sorted(boxes)]
    # Faint panels (a dark slide on a dark ground) would be lost outside the boxes: such images move as one frame.
    faint = np.abs(i.astype(int) - bg).sum(2) > 12
    inside = np.zeros_like(faint)
    for x, y, w, h in boxes: inside[y:y + h, x:x + w] = True
    if (faint & ~inside).mean() > 0.004: print("whole frame:", os.path.basename(f)); continue
    out["a/" + os.path.basename(f)] = {"bg": "#%02x%02x%02x" % tuple(int(v) for v in bg[::-1]), "boxes": boxes}
open(os.path.join(HERE, "a", "pieces.js"), "w").write("window.PIECES=" + json.dumps(out) + ";\n")
for k, v in out.items(): print(k, len(v["boxes"]), v["boxes"])
