"""Wrap the owner's front, side and back views into one map of the whole sphere, so the character can turn as one solid body.
The map keeps the drawn features (colour strip, dark edges, fine panel lines) and leaves the soft white shading to be lit live."""
import numpy as np, cv2
from PIL import Image
W, H, K = 1536, 768, 0.42          # map size; K: the sphere's radius as a share of each view's width

def view(name):
    im = np.array(Image.open(name + '.webp').convert('RGB')).astype(np.float32)
    lum = im.mean(axis=2); mx = im.max(axis=2); mn = im.min(axis=2); sat = (mx - mn) / np.maximum(mx, 1)
    alpha = np.maximum(np.clip((sat - 0.20) / 0.25, 0, 1), np.clip((125 - lum) / 50, 0, 1))      # strongly coloured or truly dark: a drawn feature
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
    body = lum.copy(); body[(alpha > 0.05) | (sat > 0.1) | (lum < 190)] = np.nan
    fill = np.where(np.isnan(body), 240, body); wgt = (~np.isnan(body)).astype(np.float32)
    soft = cv2.GaussianBlur(fill * wgt, (0, 0), 9) / np.maximum(cv2.GaussianBlur(wgt, (0, 0), 9), 1e-3)
    detail = np.clip(lum / np.maximum(soft, 1), 0.88, 1.0)                                        # fine lines only, shading removed
    rgb = im / 255 * alpha[..., None] + detail[..., None] * (1 - alpha[..., None])
    return np.dstack([rgb, alpha]).astype(np.float32)

lon = (np.arange(W) + 0.5) / W * 2 * np.pi - np.pi / 2          # -90 deg .. 270 deg; 0 is the front, 90 the side, 180 the back
lat = np.pi / 2 - (np.arange(H) + 0.5) / H * np.pi
LON, LAT = np.meshgrid(lon, lat)
ox, oy, oz = np.cos(LAT) * np.sin(LON), np.sin(LAT), np.cos(LAT) * np.cos(LON)

def project(tex, u, v, shift=None):
    s = tex.shape[0]
    if shift is not None: v = v - shift[None, :]                 # a small up or down slide per column, to line the strips up
    return cv2.remap(tex, ((0.5 + K * u) * s).astype(np.float32), ((0.5 - K * v) * s).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

views = [('front', ox, oy, oz), ('side', -oz, oy, ox), ('back', -ox, oy, -oz)]
texs = {n: view(n) for n, *_ in views}
wts = {n: np.clip(d, 0, 1) ** 3 for n, _, _, d in views}

def strip_mask(p, w):
    """The strip in one view's projection: in each column, the topmost drawn feature below the middle (not the eye, and not
    the coloured light under the body, which lies beneath it)."""
    m = ((p[..., 3] > 0.5) & (w > 0.02) & (oy < 0.1) & ((np.hypot(ox, oy) > 0.70) | (oz < 0))).astype('uint8')
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), 'uint8')).astype(bool)
    top = np.where(m.any(axis=0), oy[m.argmax(axis=0), np.arange(W)], np.nan)
    return m & (oy <= top[None, :] + 1e-6) & (oy >= top[None, :] - 0.07)

def strip_height(p, w):
    a = strip_mask(p, w).astype(np.float32) * p[..., 3]
    tot = a.sum(axis=0); h = (a * oy).sum(axis=0) / np.maximum(tot, 1e-6); h[tot < 2] = np.nan; return h

proj = {n: project(texs[n], u, v) for n, u, v, _ in views}
hs = {n: strip_height(proj[n], wts[n]) for n in proj}
cw = {n: np.where(np.isnan(hs[n]), 0, wts[n][H // 2 + H // 5]) for n in proj}   # each view's say in a column
tot = sum(cw.values()); target = sum(np.nan_to_num(hs[n]) * cw[n] for n in proj) / np.maximum(tot, 1e-6)
shifts = {}
for n in proj:
    d = np.where(np.isnan(hs[n]) | (tot < 1e-6), 0, target - hs[n]); d = np.clip(d, -0.2, 0.2)
    shifts[n] = cv2.GaussianBlur(d.astype(np.float32)[None, :], (0, 0), 26)[0]
    print(n, 'largest slide', round(float(np.abs(shifts[n]).max()), 3))
proj = {n: project(texs[n], u, v, shifts[n]) for n, u, v, _ in views}

# The three views do not agree exactly on where the colour strip runs, so it is traced: one smooth path round the body,
# carrying the colours the views show along it, and drawn once. Everything else on the body stays the artwork's own.
def fill(a):
    idx = np.arange(len(a)); ok = ~np.isnan(a); return np.interp(idx, idx[ok], a[ok])
seen = tot > 1e-4
path = np.where(seen, target, np.nan); path = cv2.GaussianBlur(fill(path).astype(np.float32)[None, :], (0, 0), 26)[0]
cols = np.zeros((W, 3), np.float32); cwt = np.zeros(W, np.float32)
for n in proj:
    p = proj[n]; m = strip_mask(p, wts[n]) & (p[..., 3] > 0.6)
    cnt = m.sum(axis=0); c = (p[..., :3] * m[..., None]).sum(axis=0) / np.maximum(cnt, 1)[:, None]
    k = cw[n] * (cnt > 1); cols += c * k[:, None]; cwt += k
cols = cols / np.maximum(cwt, 1e-6)[:, None]
for ch in range(3): cols[:, ch] = cv2.GaussianBlur(fill(np.where(cwt > 1e-5, cols[:, ch], np.nan)).astype(np.float32)[None, :], (0, 0), 10)[0]
there = cv2.GaussianBlur(seen.astype(np.float32)[None, :], (0, 0), 20)[0]            # the strip fades out where no view shows it
slope = np.gradient(path) / (2 * np.pi / W) / np.maximum(np.sqrt(1 - np.clip(path, -0.98, 0.98) ** 2), 0.2)
dist = np.abs(oy - path[None, :]) / np.sqrt(1 + slope[None, :] ** 2)
core = np.exp(-(dist / 0.016) ** 2) * there[None, :]; glow = np.exp(-(dist / 0.05) ** 2) * there[None, :] * 0.4

wsum = sum(wts.values()); wsum = np.maximum(wsum, 1e-6)
art = sum(proj[n] * wts[n][..., None] for n in proj) / wsum[..., None]
eye = (np.clip((0.74 - np.hypot(ox, oy)) / 0.06, 0, 1) * (oz > 0))[..., None]            # the eye and its rim, from the front view
lines = np.clip((oy - path[None, :] - 0.16) / 0.1, 0, 1)[..., None]                    # fine panel lines, kept above the strip
body = 1 - (1 - art[..., :3]) * np.clip(1 - art[..., 3:4] * 8, 0, 1) * lines                # white, with those lines only
tint = 1 - (1 - (0.45 + 0.55 * cols)[None, :, :]) * glow[..., None]
rgb = body * tint; rgb = rgb * (1 - core[..., None]) + cols[None, :, :] * 1.08 * core[..., None]
out = np.dstack([rgb, np.maximum(core, glow * 0.5)]).astype(np.float32)
out = art * eye + out * (1 - eye)
Image.fromarray((np.clip(out, 0, 1) * 255).astype('uint8'), 'RGBA').save('wrap.png', optimize=True)
prev = np.clip(out[..., :3] * 0.93, 0, 1); Image.fromarray((prev * 255).astype('uint8')).resize((1280, 640)).save('/tmp/claude-0/-home-user-Opsiogen/b0b3e356-e22d-529e-b60c-0b778d0659f0/scratchpad/wrap-pv.jpg', quality=88)
