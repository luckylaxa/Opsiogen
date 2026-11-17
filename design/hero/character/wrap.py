"""Wrap the owner's front, side and back views into one map of the whole sphere, so the character turns as one solid body.

Each view is split in two: its soft shading (kept as a small "light map" that stays still on screen while the body turns)
and what is drawn on the body (colour strip, fine panel lines), which goes on the map and turns with it. Shading times
drawing gives back the artwork, so at rest the character looks as drawn, and while turning it keeps the same light."""
import numpy as np, cv2
from PIL import Image
W, H, K = 2048, 1024, 0.42          # map size; K: the sphere's radius as a share of each view's width

def view(name):
    im = np.array(Image.open(name + '.webp').convert('RGB')).astype(np.float32); s = im.shape[0]
    yy, xx = np.mgrid[0:s, 0:s]; u = (xx / s - 0.5) / K; v = -(yy / s - 0.5) / K; r = np.hypot(u, v); Rpx = K * s
    lum = im.mean(axis=2); mx = im.max(axis=2); mn = im.min(axis=2); sat = (mx - mn) / np.maximum(mx, 1)
    alpha = cv2.GaussianBlur(np.maximum(np.clip((sat - 0.20) / 0.25, 0, 1), np.clip((125 - lum) / 50, 0, 1)), (0, 0), 0.8)
    # the colour strip: in each column, the topmost vivid or dark mark below the middle (not the eye)
    cand = ((sat > 0.4) | (lum < 125)) & (r < 0.985) & (v < 0.1)
    if name == 'front': cand &= r > 0.70
    if name == 'side': cand &= u > -0.75
    cand = cv2.morphologyEx(cand.astype('uint8'), cv2.MORPH_OPEN, np.ones((3, 3), 'uint8')).astype(bool)
    top = np.where(cand.any(axis=0), cand.argmax(axis=0), 10 ** 6)
    band = cand & (yy >= top[None, :]) & (yy <= top[None, :] + 0.085 * Rpx)
    k = int(0.035 * Rpx) | 1; band = cv2.GaussianBlur(cv2.dilate(band.astype('uint8'), np.ones((k, k), 'uint8')).astype(np.float32), (0, 0), 2)
    feat = alpha * band
    drop = ((lum < 150) & (band < 0.05)) | (r > 0.99)                   # dark things that are not the strip: the eye, and outside the body
    if name == 'front': drop |= r < 0.82
    kw = int(0.09 * Rpx) | 1; near = cv2.dilate((band > 0.3).astype('uint8'), np.ones((kw, kw), 'uint8')) > 0      # the strip and its glow
    keep = (~drop & ~near).astype(np.float32)
    def soften(sig): return cv2.GaussianBlur(im * keep[..., None], (0, 0), sig) / np.maximum(cv2.GaussianBlur(keep, (0, 0), sig), 1e-4)[..., None]
    t = np.clip(cv2.GaussianBlur(keep, (0, 0), 0.02 * s) / 0.3, 0, 1)[..., None]
    soft = t * soften(0.02 * s) + (1 - t) * soften(0.09 * s)             # the view's own soft light, filled in under the strip and the eye
    detail = np.clip(im / np.maximum(soft, 1), np.where(near, 0.5, 0.8)[..., None], 1.06)
    detail = 1 + (detail - 1) * (np.clip((0.95 - r) / 0.05, 0, 1) * ~drop)[..., None]      # nothing from the dropped parts or the very rim
    rgb = im / 255 * feat[..., None] + detail * (1 - feat[..., None])
    plain = np.where(near[..., None], 1.0, detail)                      # the body alone: fine lines, no strip
    return np.dstack([rgb, feat]).astype(np.float32), soft, plain.astype(np.float32)

lon = (np.arange(W) + 0.5) / W * 2 * np.pi - np.pi / 2          # -90 deg .. 270 deg; 0 is the front, 90 the side, 180 the back
lat = np.pi / 2 - (np.arange(H) + 0.5) / H * np.pi
LON, LAT = np.meshgrid(lon, lat)
ox, oy, oz = np.cos(LAT) * np.sin(LON), np.sin(LAT), np.cos(LAT) * np.cos(LON)

def project(tex, u, v, shift=None):
    s = tex.shape[0]
    if shift is not None: v = v - shift[None, :]                 # a small up or down slide per column, to line the strips up
    return cv2.remap(tex, ((0.5 + K * u) * s).astype(np.float32), ((0.5 - K * v) * s).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

views = [('front', ox, oy, oz), ('side', -oz, oy, ox), ('back', -ox, oy, -oz)]
texs, softs, plains = {}, {}, {}
for n, *_ in views: texs[n], softs[n], plains[n] = view(n)
wts = {n: np.clip(d, 0, 1) ** 6 for n, _, _, d in views}          # each view is used where it looks straight at the body

def fill(a):
    idx = np.arange(len(a)); ok = ~np.isnan(a); return np.interp(idx, idx[ok], a[ok])
def strip_height(p, w):
    a = p[..., 3] * (w > 0.003) * (oy < 0.1); tot = a.sum(axis=0)
    h = (a * oy).sum(axis=0) / np.maximum(tot, 1e-6); h[tot < 2] = np.nan
    ok = ~np.isnan(h)
    if ok.sum() > 50:                                                # a steady line, not a jittery one
        f = cv2.GaussianBlur(fill(h).astype(np.float32)[None, :], (0, 0), 12)[0]; h = np.where(ok, f, np.nan)
    return h

# The views do not agree exactly on where the strip runs. One path is taken (each view's own, where that view is the one
# in use), and near the joins each view is slid a little so its strip lies on that path.
proj = {n: project(texs[n], u, v) for n, u, v, _ in views}
hs = {n: strip_height(proj[n], wts[n]) for n in proj}
row = int(H * 0.7)
cw = {n: np.where(np.isnan(hs[n]), 0, wts[n][row] ** 0.5) for n in proj}          # the path changes hands gently
tot = sum(cw.values()); path = np.where(tot > 1e-5, sum(np.nan_to_num(hs[n]) * cw[n] for n in proj) / np.maximum(tot, 1e-6), np.nan)
path = cv2.GaussianBlur(fill(path).astype(np.float32)[None, :], (0, 0), 64)[0]
# The views disagree in small ways about the strip (how thick, where it ends), so joining their pixels leaves kinks.
# It is drawn once instead: along that one path, in the colours the views show at each point round the body.
cols = np.zeros((W, 3), np.float32); cwt = np.zeros(W, np.float32)
for n in proj:
    p = proj[n]; m = (p[..., 3] > 0.6) & (wts[n] > 0.003) & (oy < 0.1) & (np.abs(oy - np.nan_to_num(hs[n], nan=9)[None, :]) < 0.05)
    cnt = m.sum(axis=0); c = (p[..., :3] * m[..., None]).sum(axis=0) / np.maximum(cnt, 1)[:, None]
    k = cw[n] * (cnt > 1); cols += c * k[:, None]; cwt += k
cols = cols / np.maximum(cwt, 1e-6)[:, None]
for ch in range(3): cols[:, ch] = cv2.GaussianBlur(fill(np.where(cwt > 1e-5, cols[:, ch], np.nan)).astype(np.float32)[None, :], (0, 0), 12)[0]
grey = cols.mean(axis=1, keepdims=True); cols = np.clip(grey + (cols - grey) * 1.25, 0, 1)          # as vivid as in the artwork
there = cv2.GaussianBlur((tot > 1e-5).astype(np.float32)[None, :], (0, 0), 24)[0]                  # it fades out where no view shows it
slope = np.gradient(path) / (2 * np.pi / W) / np.maximum(np.sqrt(1 - np.clip(path, -0.98, 0.98) ** 2), 0.2)
dist = np.abs(oy - path[None, :]) / np.sqrt(1 + slope[None, :] ** 2)
core = np.exp(-(dist / 0.034) ** 2.6) * there[None, :]
hot = np.exp(-(dist / 0.010) ** 2) * there[None, :] * np.clip(grey[:, 0] * 2.2 - 0.3, 0, 1)[None, :] * 0.6     # a bright centre line, where the strip is lit
glow = np.exp(-(dist / 0.075) ** 2) * there[None, :] * 0.32

wb = {n: np.clip(d, 0, 1) ** 6 for n, _, _, d in views}
wsum = sum(wb.values()) + 1e-6
body = (sum(project(plains[n], u, v) * wb[n][..., None] for n, u, v, _ in views) + 1e-6) / wsum[..., None]
tint = 1 - (1 - (0.4 + 0.6 * cols)[None, :, :]) * glow[..., None]
ink = cols[None, :, :] * (1 - hot[..., None]) + hot[..., None]
rgb = body * tint * (1 - core[..., None]) + ink * core[..., None]
out = np.dstack([rgb, np.maximum(core, glow * 0.5)]).astype(np.float32)
Image.fromarray((np.clip(out, 0, 1) * 255).astype('uint8'), 'RGBA').save('wrap.png', optimize=True)
for n in ('front', 'back'):
    lm = cv2.GaussianBlur(softs[n], (0, 0), 0.03 * softs[n].shape[0])
    Image.fromarray(np.clip(lm, 0, 255).astype('uint8')).resize((256, 256), Image.LANCZOS).save('light-' + n + '.png', optimize=True)
prev = np.clip(out[..., :3] * 0.93, 0, 1); Image.fromarray((prev * 255).astype('uint8')).resize((1280, 640)).save('/tmp/claude-0/-home-user-Opsiogen/b0b3e356-e22d-529e-b60c-0b778d0659f0/scratchpad/wrap-pv.jpg', quality=88)
a = Image.open('light-front.png'); b = Image.open('light-back.png'); s2 = Image.new('RGB', (522, 256), (40, 90, 60)); s2.paste(a, (0, 0)); s2.paste(b, (266, 0)); s2.save('/tmp/claude-0/-home-user-Opsiogen/b0b3e356-e22d-529e-b60c-0b778d0659f0/scratchpad/light-pv.jpg', quality=90)
