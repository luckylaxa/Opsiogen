"""Find the blank white screens and frames in the room stills and place our designs on them."""
import numpy as np, cv2
from PIL import Image, ImageFilter
P = '../../public/'; T = '../tiles/out/'
S = 2  # work at twice the still's size, so the designs stay sharp

def load(name):
    im = Image.open(name).convert('RGB'); return np.array(im.resize((im.width * S, im.height * S), Image.LANCZOS))

def screens(img, thr=232, min_area=6000, min_side=40, fill=0.6, meas='min'):
    """White areas big and solid enough to be a screen or a sheet, left to right."""
    mn = img.min(axis=2) if meas == 'min' else img.mean(axis=2); m = (mn > thr).astype('uint8')
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), 'uint8'))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a >= min_area and min(w, h) >= min_side and a / (w * h) >= fill: out.append(dict(x=x, y=y, w=w, h=h, a=a, mask=lab == i))
    return sorted(out, key=lambda c: c['x'])

def fit(xs, ys, deg=2):
    k = np.ones(len(xs), bool)
    for _ in range(4):
        p = np.polyfit(xs[k], ys[k], deg); r = np.abs(np.polyval(p, xs) - ys); k = r <= max(2.0, 2.5 * np.median(r[k]))
    return p

def crop(path, box=None, inset=None):
    im = Image.open(path).convert('RGB'); w, h = im.size
    if inset: im = im.crop((int(w * inset[0]), int(h * inset[1]), int(w * (1 - inset[0])), int(h * (1 - inset[1]))))
    if box: im = im.crop(box)
    return im

def cover(im, ratio, anchor=0.5):
    w, h = im.size
    if w / h > ratio: nw = int(h * ratio); x = int((w - nw) * 0.5); return im.crop((x, 0, x + nw, h))
    nh = int(w / ratio); y = int((h - nh) * anchor); return im.crop((0, y, w, y + nh))

def place(img, c, art, mode='screen', anchor=0.0, lo=195, hi=240, meas='min'):
    """Fit the design to the screen's own edges, column by column, so curved and slanted screens work."""
    m = c['mask']; cols = np.where(m.any(axis=0))[0]; x0, x1 = cols[0], cols[-1]
    top = np.array([np.argmax(m[:, x]) for x in cols]); bot = np.array([m.shape[0] - 1 - np.argmax(m[::-1, x]) for x in cols])
    pt, pb = fit(cols.astype(float), top.astype(float)), fit(cols.astype(float), bot.astype(float))
    H, W = m.shape; xs = np.arange(x0, x1 + 1); t = np.polyval(pt, xs) - 1.5; b = np.polyval(pb, xs) + 1.5
    art = np.array(cover(art, (x1 - x0) / float(np.mean(b - t)), anchor)); ah, aw = art.shape[:2]
    y0, y1 = max(0, int(t.min()) - 2), min(H - 1, int(b.max()) + 2)
    yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1].astype('float32')
    u = (xx - x0) / (x1 - x0) * (aw - 1); v = (yy - t[None, :]) / (b - t)[None, :] * (ah - 1)
    warped = cv2.remap(art, u.astype('float32'), v.astype('float32'), cv2.INTER_AREA if aw > 2 * (x1 - x0) else cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    if aw > 2 * (x1 - x0):  # shrink first, so small screens are not aliased
        f = (x1 - x0) * 1.5 / aw; small = cv2.resize(art, None, fx=f, fy=f, interpolation=cv2.INTER_AREA); sh, sw = small.shape[:2]
        warped = cv2.remap(small, (u * (sw - 1) / (aw - 1)).astype('float32'), (v * (sh - 1) / (ah - 1)).astype('float32'), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    region = img[y0:y1 + 1, x0:x1 + 1].astype(float); mn = region.min(axis=2) if meas == 'min' else region.mean(axis=2)
    near = cv2.dilate(m.astype('uint8'), np.ones((7, 7), 'uint8'))[y0:y1 + 1, x0:x1 + 1] > 0
    al = (np.clip((mn - lo) / (hi - lo), 0, 1) * near)[..., None]
    if mode == 'paper':  # keep the light and shade that fall on the sheet
        lum = region.mean(axis=2); shade = np.clip(cv2.GaussianBlur(lum / np.percentile(lum[near], 90), (0, 0), 6), 0.6, 1.04)[..., None]
        tint = region[near].mean(axis=0) / region[near].mean()
        new = warped.astype(float) * shade * (0.5 + 0.5 * tint)
    else: new = warped.astype(float) * 0.97
    img[y0:y1 + 1, x0:x1 + 1] = np.clip(region * (1 - al) + new * al, 0, 255).astype('uint8')

def cards(path, min_w=120, min_h=200):
    """The separate cards of one of our flat designs: areas that differ from its flat background."""
    im = np.array(Image.open(path).convert('RGB')).astype(int); bg = im[5, 5]
    d = (np.abs(im - bg).sum(axis=2) > 40).astype('uint8'); d = cv2.morphologyEx(d, cv2.MORPH_CLOSE, np.ones((9, 9), 'uint8'))
    n, lab, st, _ = cv2.connectedComponentsWithStats(d, 8)
    return sorted([tuple(int(v) for v in (st[i][0], st[i][1], st[i][0] + st[i][2], st[i][1] + st[i][3])) for i in range(1, n) if st[i][2] >= min_w and st[i][3] >= min_h])

def flow(client):
    """A client's site or product as it shows in its walkthrough, without the frame around it."""
    return crop(P + 'work/%s/%s-flow.jpg' % (client, client), inset=(0.06, 0.04))

def panel(path, ratio, boxes=None, fill=0.8):
    """One of our flat designs, its cards centred on its own background colour at the given shape."""
    im = Image.open(path).convert('RGB'); bs = boxes or cards(path)
    x0, y0, x1, y1 = min(b[0] for b in bs) - 12, min(b[1] for b in bs) - 12, max(b[2] for b in bs) + 12, max(b[3] for b in bs) + 12
    part = im.crop((x0, y0, x1, y1)); w, h = part.size
    H = int(max(h / fill, w / fill / ratio)); W = int(H * ratio)
    out = Image.new('RGB', (W, H), im.getpixel((5, 5))); out.paste(part, ((W - w) // 2, (H - h) // 2)); return out

def beside(*ims):
    h = min(i.height for i in ims); ims = [i.resize((int(i.width * h / i.height), h), Image.LANCZOS) for i in ims]
    out = Image.new('RGB', (sum(i.width for i in ims), h)); x = 0
    for i in ims: out.paste(i, (x, 0)); x += i.width
    return out

def stack(pool, ratio, start, bg=(20, 18, 24), pad=18):
    """Posts one above the other, as a feed, for a tall narrow screen."""
    cw, ch = pool[0].size; W = cw + 2 * pad; H = int(W / ratio); n = max(1, (H - pad) // (ch + pad)); gap = (H - n * ch) / (n + 1)
    out = Image.new('RGB', (W, H), bg)
    for k in range(n): out.paste(pool[(start + k) % len(pool)], (pad, int(gap + k * (ch + gap))))
    return out

def save(img, name): Image.fromarray(img).save(name, quality=90); print(name)

if __name__ == '__main__':
    # 02 web and product lab: client websites and a product
    img = load('room-02-web-raw.png'); sc = screens(img)
    place(img, sc[0], flow('carlton-noble'), anchor=0.42)  # the wide wall: a site whose opening screen suits the shape
    for c, art in zip(sc[1:], [flow('bigtapp'), flow('cabot-solutions'), flow('engel-volkers'), flow('sifio-health')]): place(img, c, art)
    save(img, 'room-02-web.jpg')

    # 03 brand studio: client print pieces in the frames
    img = load('room-03-brand-raw.png'); sc = screens(img, thr=175, min_area=30000, fill=0.5, meas='mean')
    cb = P + 'work/cabot-solutions/cabotbrand-3.jpg'
    arts = [crop(cb, (40, 250, 780, 1350)), crop(P + 'work/sandlogic/sandlogic-2.jpg', (560, 416, 1040, 1184)), crop(P + 'work/norsecom/norsecom-6.jpg', (773, 304, 1216, 1173)),
            crop(P + 'work/rohde-schwarz/rs-24.jpg', (365, 0, 1190, 1250)), crop(cb, (820, 250, 1560, 1350))]
    for c, art in zip(sc, arts): place(img, c, art, mode='paper', lo=140, hi=178, meas='mean')
    save(img, 'room-03-brand.jpg')

    # 04 automation hub: our own automation screens on the wall, a client dashboard on the desk
    img = load('room-04-automation-raw.png'); sc = screens(img)
    wall = beside(panel(T + 'flat-auto/tile-dashboards.jpg', 1.205, boxes=[(540, 410, 1550, 1030)]), panel(T + 'flat-auto/tile-approvals.jpg', 1.205))
    care = flow('care-connect'); w, h = care.size
    for c, art in zip(sc, [wall, care.crop((0, 0, int(w * 0.6), int(h * 0.8))), care.crop((int(w * 0.4), 0, w, int(h * 0.8)))]): place(img, c, art)
    save(img, 'room-04-automation.jpg')

    # 05 social and marketing studio: posts and ads as feeds, a campaign on the large screen
    img = load('room-05-social-raw.png'); sc = screens(img)
    pool = [crop(T + 'flat-social/tile-posts.jpg', b).resize((300, 476), Image.LANCZOS) for b in cards(T + 'flat-social/tile-posts.jpg')]
    paid = [crop(T + 'flat-social/tile-paid.jpg', b).resize((300, 476), Image.LANCZOS) for b in cards(T + 'flat-social/tile-paid.jpg')]
    pool = [pool[0], paid[1], pool[2], paid[0], pool[1], paid[2]]
    for k, c in enumerate(sc[:6]): place(img, c, stack(pool, c['w'] / c['h'], k * 2 + k // 3), anchor=0.5)
    place(img, sc[6], crop(T + 'flat-social/tile-campaign.jpg', (570, 440, 1069, 1048)), anchor=0.5)
    save(img, 'room-05-social.jpg')

    # 06 video studio: a film on the large screen, the edit and the storyboard on the desk
    img = load('room-06-video-raw.png'); sc = screens(img)
    v = T + 'flat-video/'
    for c, art in zip(sc, [crop(v + 'tile-motion.jpg', cards(v + 'tile-motion.jpg')[0]), crop(v + 'tile-concepts.jpg', cards(v + 'tile-concepts.jpg')[0]), crop(v + 'tile-explainer.jpg', cards(v + 'tile-explainer.jpg')[0])]): place(img, c, art, anchor=0.08)
    save(img, 'room-06-video.jpg')

    # one sheet of all six rooms, for review
    from PIL import ImageDraw, ImageFont
    rooms = [('lobby-01-entrance.jpg', '01  Entrance'), ('room-02-web.jpg', '02  Web & Product Lab'), ('room-03-brand.jpg', '03  Brand Studio'),
             ('room-04-automation.jpg', '04  Automation Hub'), ('room-05-social.jpg', '05  Social & Marketing Studio'), ('room-06-video.jpg', '06  Video Studio')]
    tw, th, g = 960, 540, 12; sheet = Image.new('RGB', (3 * tw + 4 * g, 2 * th + 3 * g), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    font = ImageFont.truetype('../../src/fonts/' + [f for f in __import__('os').listdir('../../src/fonts') if f.endswith(('.ttf', '.otf'))][0], 26) if any(f.endswith(('.ttf', '.otf')) for f in __import__('os').listdir('../../src/fonts')) else ImageFont.load_default(26)
    for k, (f, label) in enumerate(rooms):
        x, y = g + (k % 3) * (tw + g), g + (k // 3) * (th + g); t = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
        shade = Image.new('L', (tw, th), 0); ImageDraw.Draw(shade).rectangle((0, th - 70, tw, th), fill=110); t = Image.composite(Image.new('RGB', (tw, th), (0, 0, 0)), t, shade.filter(ImageFilter.GaussianBlur(18)))
        sheet.paste(t, (x, y)); d.text((x + 24, y + th - 48), label, fill=(255, 255, 255), font=font)
    sheet.save('rooms-all.jpg', quality=88); print('rooms-all.jpg', sheet.size)
