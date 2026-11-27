"""The counter on the blue BigTapp booth mockup, turned straight (27 Nov 2026).

The owner: "Logo placement is not Center not proper update wherever applied" and "Also can you keep this table straight
like other image". On the blue mockup the counter stands at about 45 degrees to the backdrop, with the BigTapp logo
63% of the way across its front. On the white mockup the same counter stands straight, parallel to the backdrop, its
left side showing and its logo at the centre of its front (50.7%). So on the blue mockup:
- the old counter is painted out: the backdrop rebuilt along its own horizontal lines (towards its vanishing point),
  the carpet from the clean carpet to its right (same rows, so the same depth), its brightness from round about;
- the white mockup's counter (front, left side, top edge) takes its place, its front set parallel to the blue backdrop
  in the blue photo's own perspective, same proportions, so its logo stays centred and undistorted; its top is
  redrawn clean (the white mockup's own laptop and brochures are not carried over) and its warmer light matched;
- the blue mockup's own laptop stays exactly where it was (clear of the "Support - 24/7" text behind it) and its
  brochures sit on the new top; soft contact shadows under them and under the counter.
Also, unbrand_laptop paints out the maker's logo on the white mockup's laptop lid (no third-party logos).
Used by bigtapp_booth.py."""
import numpy as np
import cv2
from PIL import Image

def _pmask(pts, shape, ss=4):
    """Anti-aliased coverage of a polygon, rendered at ss x and averaged."""
    m = np.zeros((shape[0] * ss, shape[1] * ss), np.uint8)
    cv2.fillPoly(m, [np.round(np.array(pts, np.float64) * ss).astype(np.int32)], 255)
    return cv2.resize(m, (shape[1], shape[0]), interpolation=cv2.INTER_AREA).astype(np.float32) / 255

def _largest(m, k=3):
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((k, k), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    if n > 1: m = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    return m.astype(bool)

def _ncmean(img, valid, sigmas=(4, 8, 16, 32, 64)):
    """Local mean of the valid pixels, carried into the rest, nearest first."""
    est = np.zeros_like(img); done = np.zeros(valid.shape, bool); v = valid.astype(np.float32)
    for s in sigmas:
        w = cv2.GaussianBlur(v, (0, 0), s)
        e = cv2.GaussianBlur(img * v[..., None], (0, 0), s) / np.maximum(w, 1e-6)[..., None]
        ok = ~done & ((w > .25) if s < sigmas[-1] else True); est[ok] = e[ok]; done |= ok
    return est

def straight_counter(blue_img, white_img, cam, vp=(4041.6, 533.6)):
    a = np.asarray(blue_img).astype(np.float32)
    w = np.asarray(white_img).astype(np.float32)
    H_, W_ = a.shape[:2]
    L = a.mean(2); BR = a[..., 2] - a[..., 0]
    yy, xx = np.mgrid[0:H_, 0:W_].astype(np.float32)
    foot = lambda u: 741.2 - 0.07492 * (u - 1300)                 # where the backdrop meets the carpet (its dark seam)

    # ---- the old counter (measured): top, right end, side, front; its shadow; the laptop and the brochures on it
    old = [(145.0, 640.5), (260.0, 630.5), (649.5, 646.0), (646.2, 663.0), (641.6, 931.0), (550.8, 969.3), (146.4, 902.3)]
    oldm = cv2.dilate((_pmask(old, (H_, W_)) > .01).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
    shadow = _pmask([(146.4, 902.3), (550.8, 969.3), (641.6, 931.0), (664, 925), (664, 968), (641.6, 966), (550.8, 1001), (146.4, 936)], (H_, W_)) > .01
    slab_front_old = 648.5 + .0583 * (xx - 300)                     # front edge of the old top
    lap = _largest((xx >= 304) & (xx <= 460) & (yy >= 583) & (yy <= 656) & (L < 222) & (BR < 60) & (yy < slab_front_old - 1.5))
    lap &= yy <= np.where(xx <= 416, 646 + 4.5 * (xx - 327) / 89, 650.5 - 1.5 * (xx - 416) / 38)     # down to its base
    bro = _largest((xx >= 466) & (xx <= 569) & (yy >= 628) & (yy <= 662) & (L < 234) & (BR < 60) & (yy < slab_front_old - 1))
    bro &= ~((yy > 652) & (L > 150))                                # not the old top under them
    grow = lambda m: cv2.dilate(m.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    R = oldm | shadow | grow(lap) | grow(bro)
    wall = yy < foot(xx)

    # ---- the backdrop, along its own horizontal lines between clean pixels either side
    out = a.copy()
    def fill_wall(target, valid):
        ty, tx = np.nonzero(target)
        if not len(tx): return
        slope = (vp[1] - ty) / (vp[0] - tx); res = []
        for sign in (-1, 1):
            col = np.zeros((len(tx), 3), np.float32); dist = np.full(len(tx), np.nan, np.float32)
            for k in range(1, 900):
                xi = np.round(tx + sign * k).astype(int); yi = np.round(ty + slope * sign * k).astype(int)
                ok = np.isnan(dist) & (xi >= 0) & (xi < W_) & (yi >= 0) & (yi < H_)
                hit = np.zeros(len(tx), bool); hit[ok] = valid[yi[ok], xi[ok]]
                col[hit] = a[yi[hit], xi[hit]]; dist[hit] = k
                if not np.isnan(dist).any(): break
            res.append((col, np.where(np.isnan(dist), 0, 1 / np.nan_to_num(dist, nan=1))))
        (cl, wl), (cr, wr) = res
        out[ty, tx] = (cl * wl[:, None] + cr * wr[:, None]) / np.maximum(wl + wr, 1e-9)[:, None]
    card = R & wall & (xx > 300) & (xx < 428) & (yy < 615.3 - .0218 * (xx - 300))   # behind the laptop: the card stays white
    fill_wall(card, wall & ~R & (L > 200))
    fill_wall(R & wall & ~card, wall & ~R & (L < 110))
    # ---- the carpet: its texture from the clean carpet 580 px to the right, its brightness from round about
    valid_c = ~wall & ~R
    low = _ncmean(a, valid_c); lows = _ncmean(a, valid_c, (4,))
    cy, cx = np.nonzero(R & ~wall); sx = np.clip(cx + 580, 0, W_ - 1)
    out[cy, cx] = low[cy, cx] + (a[cy, sx] - lows[cy, sx])
    bg = out

    # ---- the white mockup's counter: its outline, its top redrawn clean (no laptop, no brochures)
    back = [(44, 619.0), (122, 617.5), (300, 622.5), (368, 622.0), (500, 628.0), (548.5, 633.5)]       # top, far edge
    front_edge = [(548.5, 637.5), (500, 637.5), (400, 639.5), (300, 641.3), (200, 643.5), (132, 645.6)]  # top, near edge
    left_end = [(50, 622.0), (44, 620.2)]                                                               # top, left end
    body = back + [(549.5, 652.5), (546.6, 653.2), (546.6, 897.0), (132.0, 929.4), (48.1, 863.1), (48.1, 641.0), (44.5, 640.0)]
    wsh = w.shape[:2]
    bm = _pmask(body, wsh)
    fm = _pmask([(x, y - 4) for x, y in back] + front_edge + left_end + [(40, 616)], wsh)   # spills past the far edge
    tm = _pmask(back + front_edge + left_end, wsh) > .5
    wy, wx = np.mgrid[0:wsh[0], 0:wsh[1]].astype(np.float32)
    clean = tm & ~(((wx > 122) & (wx < 296)) | ((wx > 368) & (wx < 498)))
    clean &= cv2.erode(tm.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    X = lambda x, y: np.stack([np.ones_like(x), x / 500, y / 30 - 21, (x / 500) ** 2, (y / 30 - 21) ** 2, x / 500 * (y / 30 - 21)], -1)
    ky, kx = np.nonzero(clean)
    coef = np.linalg.lstsq(X(kx.astype(np.float32), ky.astype(np.float32)), w[ky, kx], rcond=None)[0]
    top = X(wx, wy) @ coef + np.random.default_rng(1).normal(0, 1.0, w.shape).astype(np.float32)
    wc = w * (1 - fm[..., None]) + top * fm[..., None]

    # ---- into the blue photo: its front onto a front parallel to the blue backdrop, standing on the floor
    hc, uBL, vBL = .62, 221.0, 962.0                                 # height (backdrop = 2.5), front's foot at the left
    width = 1.551 * hc                                               # the white counter's own proportions
    r = cam.ray(uBL, vBL); Pf = r * cam.h / -r[1]                    # that foot on the floor
    a0, zf = (Pf - cam.P0) @ cam.d, (Pf - cam.P0) @ cam.n
    corner = lambda da, y: cam.img(cam.world(a0 + da, y, zf))[0]
    F = np.float32([corner(0, hc), corner(width, hc), corner(width, 0), corner(0, 0)])
    Qw = np.float32([(132.0, 664.3), (546.6, 653.2), (546.6, 897.0), (132.0, 929.4)])          # the white front
    Hm = cv2.getPerspectiveTransform(Qw, F)
    SS = 4; S = np.diag([SS, SS, 1.]).astype(np.float64)
    big = cv2.warpPerspective(wc, S @ Hm, (W_ * SS, H_ * SS), flags=cv2.INTER_CUBIC)
    bigm = cv2.warpPerspective(bm, S @ Hm, (W_ * SS, H_ * SS), flags=cv2.INTER_LINEAR)
    cm = cv2.resize(bigm, (W_, H_), interpolation=cv2.INTER_AREA)
    cnt = cv2.resize(big * bigm[..., None], (W_, H_), interpolation=cv2.INTER_AREA) / np.maximum(cm, 1e-6)[..., None]
    cnt *= np.array([.956, .975, 1.004], np.float32)                 # the white photo's warmer light to the blue's
    res = bg * (1 - cm[..., None]) + cnt * cm[..., None]

    # ---- its shadow on the carpet, under the front and under the side
    side_bot = cv2.perspectiveTransform(np.float32([[(48.1, 863.1), (132.0, 929.4)]]), Hm)[0]
    def edge_shadow(p, q, amp, dmax):
        t = np.clip((xx - p[0]) / (q[0] - p[0]), 0, 1); d = yy - (p[1] + (q[1] - p[1]) * t)
        ends = np.clip(np.minimum(xx - p[0] + 10, q[0] + 10 - xx) / 10, 0, 1)
        return 1 - amp * np.clip(1 - d / dmax, 0, 1) ** 1.6 * (d > -1.5) * ends
    sh = np.minimum(edge_shadow(F[3], F[2], .47, 28), edge_shadow(side_bot[0], side_bot[1], .42, 22))
    res *= np.where(~wall & (cm < .999), sh, 1)[..., None]

    # ---- the laptop where it was, the brochures moved down onto the new top; soft shadows on the top under them
    topm = _pmask(cv2.perspectiveTransform(np.float32([back + front_edge + left_end]), Hm)[0], (H_, W_))
    keep = cv2.dilate(lap.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool) & (yy < 631) & (cm < .01)
    res[keep] = a[keep]                                              # the photo's own pixels round the laptop
    def put(m0, dy):
        nonlocal res
        T = np.float32([[1, 0, 0], [0, 1, dy]])
        m = cv2.warpAffine(cv2.GaussianBlur(m0.astype(np.float32), (0, 0), .6), T, (W_, H_))
        hard = cv2.warpAffine(m0.astype(np.float32), T, (W_, H_))
        cast = cv2.GaussianBlur(cv2.warpAffine(hard, np.float32([[1, 0, 0], [0, 1, 1.5]]), (W_, H_)), (0, 0), 1.6)
        res *= (1 - .22 * cast * (1 - m) * topm)[..., None]
        res = res * (1 - m[..., None]) + cv2.warpAffine(a, T, (W_, H_)) * m[..., None]
    put(lap, 0); put(bro, -6)
    return Image.fromarray(np.clip(res, 0, 255).astype(np.uint8))

def unbrand_laptop(white_img, box=(168, 593, 188, 612)):
    """Paints the maker's logo on the white mockup's laptop lid with the lid round it."""
    a = np.asarray(white_img).astype(np.float32)
    x0, y0, x1, y1 = box
    hole = np.zeros(a.shape[:2], np.uint8)
    cv2.ellipse(hole, ((x0 + x1) // 2, (y0 + y1) // 2), ((x1 - x0) // 2, (y1 - y0) // 2), 0, 0, 360, 1, -1)
    hole = hole.astype(bool)
    ring = cv2.dilate(hole.astype(np.uint8), np.ones((11, 11), np.uint8)).astype(bool) & ~hole
    est = _ncmean(a, ring, (2, 4, 8))
    soft = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 1.0)
    a = a * (1 - soft[..., None]) + est * soft[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
