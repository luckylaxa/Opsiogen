"""Puts one of our screens onto a real photo's blank screen, in perspective.

The blank screen is the photo's largest near-white region; its four corners come from the region's outline,
the design is warped onto them, and the white region itself is the mask, so a phone's notch and rounded
corners stay real. A little of the photo's light is laid back over the design so it sits in the scene.
Usage: python3 screen_fit.py SCENE.jpg DESIGN.jpg OUT.jpg [--crop x,y,w,h on the result for 16:9]
"""
import sys
import cv2
import numpy as np

def screen_mask(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    m = ((hsv[..., 2] > 190) & (hsv[..., 1] < 45)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    H, W = m.shape
    # A bright area touching the photo's edge is a wall or the sky, never the screen.
    inner = [k for k in range(1, n) if stats[k, 0] > 2 and stats[k, 1] > 2 and stats[k, 0] + stats[k, 2] < W - 2 and stats[k, 1] + stats[k, 3] < H - 2]
    i = max(inner or range(1, n), key=lambda k: stats[k, cv2.CC_STAT_AREA])
    return (lab == i).astype(np.uint8) * 255

def corners(mask):
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea).reshape(-1, 2).astype(np.float32)
    s, d = c.sum(1), c[:, 0] - c[:, 1]
    # top-left, top-right, bottom-right, bottom-left: the outline points furthest along each diagonal
    return np.float32([c[np.argmin(s)], c[np.argmax(d)], c[np.argmax(s)], c[np.argmin(d)]])

def fit(scene_p, design_p, out_p, crop=None):
    scene = cv2.imread(scene_p); design = cv2.imread(design_p)
    mask = screen_mask(scene); q = corners(mask)
    h, w = design.shape[:2]
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    # Fill the screen: crop the design to the screen's own proportions first, from the top.
    sw = (np.linalg.norm(q[1] - q[0]) + np.linalg.norm(q[2] - q[3])) / 2
    sh = (np.linalg.norm(q[3] - q[0]) + np.linalg.norm(q[2] - q[1])) / 2
    r = sw / sh
    if w / h > r:  # a wide design on a narrower screen: keep its left edge (logo and menu)
        cw = int(h * r); src = np.float32([[0, 0], [cw, 0], [cw, h], [0, h]])
    else:
        ch = int(w / r); src = np.float32([[0, 0], [w, 0], [w, ch], [0, ch]])
    M = cv2.getPerspectiveTransform(src, q)
    warped = cv2.warpPerspective(design, M, (scene.shape[1], scene.shape[0]), flags=cv2.INTER_CUBIC)
    a = cv2.GaussianBlur(cv2.erode(mask, np.ones((3, 3), np.uint8)), (3, 3), 0).astype(np.float32)[..., None] / 255
    # The photo's own light over the screen: its brightness changes across the glass, kept at 12%.
    light = scene.astype(np.float32) / 255
    out = scene.astype(np.float32) * (1 - a) + (warped.astype(np.float32) * (0.9 + 0.1 * light)) * a
    out = np.clip(out, 0, 255).astype(np.uint8)
    if crop: x, y, cw, ch = crop; out = out[y:y + ch, x:x + cw]
    out = cv2.resize(out, (1920, int(1920 * out.shape[0] / out.shape[1])), interpolation=cv2.INTER_AREA) if out.shape[1] != 1920 else out
    cv2.imwrite(out_p, out, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return q

if __name__ == "__main__":
    crop = None
    if "--crop" in sys.argv: crop = [int(v) for v in sys.argv[sys.argv.index("--crop") + 1].split(",")]
    print(fit(sys.argv[1], sys.argv[2], sys.argv[3], crop).round().tolist())
