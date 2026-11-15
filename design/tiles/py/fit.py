"""Exact screen fitting: the screen's own white area (rounded corners and camera cut-outs
included) and a quad from straight lines fitted to its four edges."""
import cv2, numpy as np
from PIL import Image
def screen_mask(rgb, thr=225):
    g = rgb.min(axis=2); m = (g > thr).astype('uint8') * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    i = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); return (lab == i).astype('uint8') * 255
def fit_quad(mask):
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); c = max(cs, key=cv2.contourArea).reshape(-1, 2).astype(float)
    hull = cv2.convexHull(c.astype(np.int32))
    for eps in np.linspace(0.005, 0.1, 80):
        ap = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        if len(ap) == 4: break
    P = ap.reshape(-1, 2).astype(float)
    c0 = P.mean(0); P = P[np.argsort(np.arctan2(P[:, 1] - c0[1], P[:, 0] - c0[0]))]; P = np.roll(P, -np.argmin(P.sum(1)), 0)
    lines = []
    for i in range(4):
        a, b = P[i], P[(i + 1) % 4]; d = b - a; L = np.linalg.norm(d); u = d / L; nrm = np.array([-u[1], u[0]])
        t = (c - a) @ u; s = (c - a) @ nrm
        sel = (t > 0.2 * L) & (t < 0.8 * L) & (np.abs(s) < 0.04 * L + 4)
        vx, vy, x0, y0 = cv2.fitLine(c[sel].astype(np.float32), cv2.DIST_HUBER, 0, 0.01, 0.01).ravel()
        lines.append((np.array([x0, y0]), np.array([vx, vy])))
    Q = []
    for i in range(4):
        (p1, d1), (p2, d2) = lines[i - 1], lines[i]
        A = np.array([d1, -d2]).T; t = np.linalg.solve(A, p2 - p1); Q.append(p1 + t[0] * d1)
    return [tuple(q) for q in Q]
def soft_mask(rgb, thr=225):
    """The screen as a smooth 0-255 alpha: full on the white screen, fading with the photo's own
    edge pixels into the bezel, so the design meets the frame as softly as the photo did."""
    import cv2
    hard = screen_mask(rgb, thr)
    lum = rgb.min(axis=2).astype(float)
    near = cv2.dilate(hard, np.ones((5, 5), np.uint8)) > 0
    a = np.clip((lum - 60) / (215 - 60), 0, 1) * near
    a[hard > 0] = 1.0
    return (a * 255).astype('uint8'), hard
