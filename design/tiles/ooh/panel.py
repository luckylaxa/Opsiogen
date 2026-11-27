"""Finds a bright panel's exact corners in a photo: from a rough quad (TL, TR, BR, BL), each side is located by the
strongest bright-to-dark step across it at many points, fitted as a line, and the lines are intersected."""
import numpy as np, cv2
from PIL import Image

def refine(path, quad, search=18, n=60, inset=.08):
    g = cv2.GaussianBlur(np.asarray(Image.open(path).convert('L')).astype(np.float32), (0, 0), 1.2)
    q = np.float32(quad); c = q.mean(0); lines = []
    for i in range(4):
        a, b = q[i], q[(i + 1) % 4]
        d = (b - a) / np.linalg.norm(b - a); nrm = np.array([d[1], -d[0]])
        if np.dot(c - a, nrm) > 0: nrm = -nrm                     # normal points out of the panel
        pts = []
        for t in np.linspace(inset, 1 - inset, n):
            p = a + (b - a) * t
            prof = [g[int(round(y)), int(round(x))] for x, y in (p + nrm * s for s in np.arange(-search, search + 1))]
            prof = np.array(prof); step = prof[:-1] - prof[1:]          # inside minus outside
            k = int(np.argmax(step)); pts.append(p + nrm * (k - search + .5))
        pts = np.array(pts)
        vx, vy, x0, y0 = cv2.fitLine(pts.astype(np.float32), cv2.DIST_HUBER, 0, .01, .01).ravel()
        lines.append((np.array([x0, y0]), np.array([vx, vy])))
    out = []
    for i in range(4):
        (p1, d1), (p2, d2) = lines[(i - 1) % 4], lines[i]
        A = np.array([d1, -d2]).T; s = np.linalg.solve(A, p2 - p1); out.append(p1 + d1 * s[0])
    return np.round(np.array(out), 1)
