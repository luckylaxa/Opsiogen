"""Splits each pose of our character (a/ch-*.png, cut from the Home hero by character.cjs) into the ball and its glow
shadow, so the film can make it hop, squash and look around while the shadow stays on the ground.
Writes a/ball-<pose>.png (square, the sphere centred, same scale in every pose) and a/ball-shadow.png.
front-hd is the front pose five times as large (character.cjs at size 1560), for the shot where the camera dives
into its eye: same framing as ball-front.png, so it takes its place at any size.
Usage: python3 ball.py"""
from PIL import Image
import numpy as np, os
HERE = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(HERE, "a")
POSES = ["front", "front2", "blink", "down", "upleft", "upright"]
R = 262  # half the square: the sphere is about 498 px across in every pose
for p, K in [(p, 1) for p in POSES] + [("front-hd", 5)]:
    im = Image.open(os.path.join(A, f"ch-{p}.png")).convert("RGBA"); a = np.array(im)
    al = a[:, :, 3].astype(int)
    rows = [r for r in range(a.shape[0]) if (al[r] > 200).sum() > 0]
    gap = next(r for r in range(rows[0], a.shape[0]) if al[r].max() < 40)  # the clear rows between the ball and its shadow
    sphere = al[:gap] > 120
    ys, xs = np.where(sphere)
    k = 497 * K / (xs.max() - xs.min())  # one size in every pose (one capture came out a little closer)
    cy, cx = (ys.min() + ys.max()) / 2 * k, (xs.min() + xs.max()) / 2 * k
    ball = a.copy(); ball[gap:, :, 3] = 0
    big = Image.fromarray(ball).resize((round(a.shape[1] * k), round(a.shape[0] * k)), Image.LANCZOS)
    out = Image.new("RGBA", (2 * R * K, 2 * R * K)); out.paste(big, (round(R * K - cx), round(R * K - cy)))
    out.save(os.path.join(A, f"ball-{p}.png"))
    print(p, "sphere", xs.min(), xs.max(), ys.min(), ys.max(), "centre", cx, cy, "gap", gap)
    if p == "front":  # one glow for every pose. The capture cut its lower half off, so the upper half is mirrored.
        top = next(r for r in range(gap, a.shape[0]) if al[r].max() > 8)
        peak = gap + int(np.argmax([al[r].sum() for r in range(gap, a.shape[0])]))
        half = a[top:peak + 1]
        sh = np.concatenate([half, half[::-1][1:]])
        xs2 = np.where(sh[:, :, 3].max(0) > 8)[0]
        Image.fromarray(sh[:, xs2.min():xs2.max() + 1]).save(os.path.join(A, "ball-shadow.png"))
        print("glow rows", top, peak, "centre below the sphere", peak - ys.max(), "size", xs2.max() - xs2.min() + 1, sh.shape[0])
