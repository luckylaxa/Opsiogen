"""Generate the neutral placeholder artwork used by the sample projects.

Dev-only helper. Writes JPEGs (and one looping MP4) into public/placeholders/.
The seed script uploads these to Sanity; replace them in the studio with real work.

Usage: python3 scripts/generate-placeholders.py
Requires Pillow and ffmpeg.
"""

import os
import random
import shutil
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "placeholders")
os.makedirs(OUT, exist_ok=True)

# Neutral palette: warm and cool greys only.
TONES = {
    "stone": ((214, 210, 204), (186, 181, 174)),
    "fog": ((222, 224, 226), (196, 200, 204)),
    "graphite": ((44, 46, 49), (24, 26, 28)),
    "ash": ((160, 160, 158), (128, 128, 126)),
    "chalk": ((238, 236, 232), (220, 217, 211)),
    "slate": ((88, 92, 98), (58, 61, 66)),
}


def gradient(size, top, bottom):
    w, h = size
    base = Image.new("RGB", size, top)
    draw = ImageDraw.Draw(base)
    for y in range(h):
        t = y / max(h - 1, 1)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        draw.line([(0, y), (w, y)], fill=c)
    return base


def grain(img, amount=6, seed=1):
    rnd = random.Random(seed)
    noise = Image.effect_noise(img.size, 18).convert("RGB")
    noise = noise.point(lambda v: 128 + (v - 128) * amount // 18)
    out = Image.blend(img, Image.composite(noise, img, Image.new("L", img.size, 40)), 0.25)
    rnd.random()
    return out


def shadow(base, box, radius, blur=40, opacity=90, offset=(0, 24)):
    x0, y0, x1, y1 = box
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle((x0 + offset[0], y0 + offset[1], x1 + offset[0], y1 + offset[1]), radius, fill=(0, 0, 0, opacity))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.paste(layer, (0, 0), layer)


def bars(d, x, y, widths, h, gap, fill):
    for w in widths:
        d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill)
        y += h + gap
    return y


def browser(base, box, dark=False, scroll=0, seed=0):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    shadow(base, box, 14)
    win = Image.new("RGB", (w, h), (24, 25, 27) if dark else (250, 250, 249))
    d = ImageDraw.Draw(win)
    ink = (236, 236, 236) if dark else (34, 34, 34)
    soft = (70, 72, 76) if dark else (222, 222, 220)
    mid = (110, 112, 116) if dark else (190, 190, 188)
    bar_h = int(h * 0.06)
    d.rectangle((0, 0, w, bar_h), fill=(34, 35, 38) if dark else (238, 238, 236))
    for i in range(3):
        cx = int(bar_h * 0.6 + i * bar_h * 0.45)
        d.ellipse((cx - 6, bar_h // 2 - 6, cx + 6, bar_h // 2 + 6), fill=mid)
    d.rounded_rectangle((int(w * 0.3), int(bar_h * 0.25), int(w * 0.7), int(bar_h * 0.75)), 8, fill=soft)
    # page content (scrolls)
    oy = bar_h - scroll
    pad = int(w * 0.06)
    nav_y = oy + int(h * 0.05)
    d.rounded_rectangle((pad, nav_y, pad + int(w * 0.09), nav_y + 14), 7, fill=ink)
    for i in range(4):
        nx = int(w * 0.55) + i * int(w * 0.08)
        d.rounded_rectangle((nx, nav_y + 3, nx + int(w * 0.05), nav_y + 11), 4, fill=mid)
    hy = oy + int(h * 0.2)
    lh = int(h * 0.07)
    for i, frac in enumerate([0.62, 0.48]):
        d.rounded_rectangle((pad, hy + i * (lh + 14), pad + int(w * frac), hy + i * (lh + 14) + lh), 10, fill=ink)
    by = hy + 2 * (lh + 14) + 18
    bars(d, pad, by, [int(w * 0.36), int(w * 0.3)], 10, 12, mid)
    d.rounded_rectangle((pad, by + 60, pad + int(w * 0.14), by + 60 + int(h * 0.06)), 8, fill=ink)
    gy = oy + int(h * 0.62)
    cols = 3
    gw = (w - pad * 2 - 2 * 20) // cols
    for r in range(4):
        for c in range(cols):
            gx = pad + c * (gw + 20)
            yy = gy + r * (int(gw * 0.75) + 70)
            shade = rnd.choice([soft, mid, (200, 199, 196) if not dark else (52, 54, 58)])
            d.rounded_rectangle((gx, yy, gx + gw, yy + int(gw * 0.75)), 10, fill=shade)
            bars(d, gx, yy + int(gw * 0.75) + 16, [int(gw * 0.7), int(gw * 0.45)], 9, 10, mid)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), 14, fill=255)
    base.paste(win, (x0, y0), mask)


def phone(base, box, dark=False, seed=0):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    r = int(w * 0.16)
    shadow(base, box, r, blur=36)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle(box, r, fill=(20, 20, 22))
    inset = int(w * 0.045)
    sx0, sy0, sx1, sy1 = x0 + inset, y0 + inset, x1 - inset, y1 - inset
    scr = (246, 246, 245) if not dark else (30, 31, 34)
    d.rounded_rectangle((sx0, sy0, sx1, sy1), r - inset, fill=scr)
    ink = (34, 34, 34) if not dark else (232, 232, 232)
    mid = (196, 196, 194) if not dark else (90, 92, 96)
    sw = sx1 - sx0
    p = int(sw * 0.08)
    yy = sy0 + int(h * 0.08)
    d.rounded_rectangle((sx0 + p, yy, sx0 + p + int(sw * 0.5), yy + 22), 11, fill=ink)
    yy += 46
    for _ in range(3):
        d.rounded_rectangle((sx0 + p, yy, sx1 - p, yy + int(sw * 0.42)), 14, fill=rnd.choice([mid, (214, 212, 208) if not dark else (60, 62, 66)]))
        yy += int(sw * 0.42) + 14
        bars(d, sx0 + p, yy, [int(sw * 0.6), int(sw * 0.4)], 9, 9, mid)
        yy += 48
    d.rounded_rectangle((sx0 + p, sy1 - int(h * 0.09), sx1 - p, sy1 - int(h * 0.04)), 14, fill=ink)


def dashboard(base, box, seed=0):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    shadow(base, box, 16)
    win = Image.new("RGB", (w, h), (250, 250, 249))
    d = ImageDraw.Draw(win)
    side = int(w * 0.17)
    d.rectangle((0, 0, side, h), fill=(32, 33, 36))
    for i in range(7):
        d.rounded_rectangle((28, 90 + i * 54, side - 28, 104 + i * 54), 7, fill=(90, 92, 96) if i else (230, 230, 230))
    pad = 36
    cx = side + pad
    d.rounded_rectangle((cx, 36, cx + int(w * 0.25), 60), 12, fill=(34, 34, 34))
    cw = (w - cx - pad - 3 * 20) // 4
    for i in range(4):
        bx = cx + i * (cw + 20)
        d.rounded_rectangle((bx, 96, bx + cw, 96 + int(h * 0.18)), 14, fill=(240, 240, 238))
        d.rounded_rectangle((bx + 22, 122, bx + 22 + int(cw * 0.4), 134), 6, fill=(170, 170, 168))
        d.rounded_rectangle((bx + 22, 150, bx + 22 + int(cw * 0.6), 180), 8, fill=(34, 34, 34))
    chart_top = 96 + int(h * 0.18) + 24
    chart = (cx, chart_top, cx + int((w - cx - pad) * 0.64), h - pad)
    d.rounded_rectangle(chart, 14, fill=(240, 240, 238))
    pts = []
    n = 14
    for i in range(n):
        px = chart[0] + 30 + i * (chart[2] - chart[0] - 60) / (n - 1)
        py = chart[3] - 40 - (0.25 + 0.6 * (0.5 + 0.5 * rnd.random()) * (i / n + 0.3)) * (chart[3] - chart[1] - 80) * 0.8
        pts.append((px, py))
    d.line(pts, fill=(34, 34, 34), width=5, joint="curve")
    side_box = (chart[2] + 20, chart_top, w - pad, h - pad)
    d.rounded_rectangle(side_box, 14, fill=(240, 240, 238))
    yy = side_box[1] + 30
    while yy < side_box[3] - 50:
        d.ellipse((side_box[0] + 24, yy, side_box[0] + 54, yy + 30), fill=(200, 200, 198))
        bars(d, side_box[0] + 70, yy + 2, [int((side_box[2] - side_box[0]) * 0.5), int((side_box[2] - side_box[0]) * 0.3)], 9, 8, (190, 190, 188))
        yy += 64
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), 16, fill=255)
    base.paste(win, (x0, y0), mask)


def flow(base, size, seed=0):
    rnd = random.Random(seed)
    w, h = size
    d = ImageDraw.Draw(base)
    cols = 4
    nodes = []
    for c in range(cols):
        rows = [1, 2, 3, 1][c]
        for r in range(rows):
            nx = int(w * (0.14 + c * 0.24))
            ny = int(h * ((r + 1) / (rows + 1)))
            nodes.append((c, nx, ny))
    for c, nx, ny in nodes:
        for c2, nx2, ny2 in nodes:
            if c2 == c + 1:
                mx = (nx + nx2) // 2
                d.line([(nx + 120, ny), (mx, ny), (mx, ny2), (nx2 - 120, ny2)], fill=(120, 122, 126), width=4)
    for c, nx, ny in nodes:
        box = (nx - 120, ny - 52, nx + 120, ny + 52)
        shadow(base, box, 18, blur=24, opacity=60, offset=(0, 12))
        d = ImageDraw.Draw(base)
        d.rounded_rectangle(box, 18, fill=(250, 250, 249) if c != 3 else (34, 34, 34))
        ink = (34, 34, 34) if c != 3 else (240, 240, 240)
        d.ellipse((nx - 96, ny - 20, nx - 56, ny + 20), fill=(200, 200, 198) if c != 3 else (90, 92, 96))
        bars(d, nx - 40, ny - 14, [130, 90], 10, 10, ink if rnd.random() > 0.5 else (170, 170, 168))


def posts(base, size, seed=0):
    rnd = random.Random(seed)
    w, h = size
    d = ImageDraw.Draw(base)
    n = 3
    gap = int(w * 0.02)
    tile = int((min(w, h) * 0.86 - gap * (n - 1)) / n)
    total = tile * n + gap * (n - 1)
    ox, oy = (w - total) // 2, (h - total) // 2
    tones = [(34, 34, 34), (232, 230, 226), (150, 150, 148), (206, 203, 198), (88, 92, 98), (244, 243, 240)]
    for r in range(n):
        for c in range(n):
            x, y = ox + c * (tile + gap), oy + r * (tile + gap)
            fill = rnd.choice(tones)
            shadow(base, (x, y, x + tile, y + tile), 10, blur=18, opacity=50, offset=(0, 10))
            d = ImageDraw.Draw(base)
            d.rounded_rectangle((x, y, x + tile, y + tile), 10, fill=fill)
            ink = (240, 240, 240) if sum(fill) < 400 else (34, 34, 34)
            kind = rnd.randint(0, 2)
            if kind == 0:
                bars(d, x + tile // 10, y + tile // 2, [int(tile * 0.7), int(tile * 0.5)], max(tile // 12, 8), tile // 22, ink)
            elif kind == 1:
                d.ellipse((x + tile * 0.25, y + tile * 0.2, x + tile * 0.75, y + tile * 0.7), fill=ink)
            else:
                d.rounded_rectangle((x + tile * 0.12, y + tile * 0.12, x + tile * 0.88, y + tile * 0.62), 8, fill=ink)
                bars(d, x + tile // 8, y + int(tile * 0.72), [int(tile * 0.55)], max(tile // 16, 6), 0, ink)


def brochure(base, size, seed=0):
    rnd = random.Random(seed)
    w, h = size
    pw, ph = int(w * 0.3), int(w * 0.3 * 1.414)
    if ph > h * 0.82:
        ph = int(h * 0.82)
        pw = int(ph / 1.414)
    cx, cy = w // 2, h // 2
    box = (cx - pw, cy - ph // 2, cx + pw, cy + ph // 2)
    shadow(base, box, 4, blur=40, opacity=110, offset=(0, 30))
    d = ImageDraw.Draw(base)
    d.rectangle((cx - pw, cy - ph // 2, cx, cy + ph // 2), fill=(246, 245, 242))
    d.rectangle((cx, cy - ph // 2, cx + pw, cy + ph // 2), fill=(240, 239, 236))
    d.line([(cx, cy - ph // 2), (cx, cy + ph // 2)], fill=(214, 212, 208), width=3)
    # left page: big image + text
    m = int(pw * 0.1)
    d.rectangle((cx - pw + m, cy - ph // 2 + m, cx - m, cy - ph // 2 + int(ph * 0.55)), fill=rnd.choice([(60, 62, 66), (150, 150, 148), (34, 34, 34)]))
    bars(d, cx - pw + m, cy - ph // 2 + int(ph * 0.62), [int(pw * 0.6), int(pw * 0.42)], int(ph * 0.03), int(ph * 0.02), (34, 34, 34))
    bars(d, cx - pw + m, cy - ph // 2 + int(ph * 0.78), [int(pw * 0.75)] * 4, 8, 10, (180, 180, 178))
    # right page: grid of products
    gw = (pw - 3 * m) // 2
    for r in range(2):
        for c in range(2):
            gx = cx + m + c * (gw + m)
            gy = cy - ph // 2 + m + r * (int(gw * 1.1) + 70)
            d.rectangle((gx, gy, gx + gw, gy + int(gw * 1.1)), fill=rnd.choice([(206, 203, 198), (170, 170, 168), (88, 92, 98)]))
            bars(d, gx, gy + int(gw * 1.1) + 14, [int(gw * 0.8), int(gw * 0.5)], 8, 8, (120, 120, 118))


def save(img, name, quality=82):
    path = os.path.join(OUT, name)
    img = grain(img, seed=hash(name) & 0xFFFF)
    img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    print("wrote", name, img.size)


def scene(kind, size, tone, seed, variant=0):
    img = gradient(size, *TONES[tone]).convert("RGB")
    w, h = size
    dark_bg = tone in ("graphite", "slate")
    if kind == "web":
        if variant == 0:
            browser(img, (int(w * 0.12), int(h * 0.14), int(w * 0.88), int(h * 0.14) + int(w * 0.76 * 0.62)), dark=False, seed=seed)
        elif variant == 1:
            browser(img, (int(w * 0.06), int(h * 0.1), int(w * 0.68), int(h * 0.9)), dark=False, seed=seed)
            phone(img, (int(w * 0.72), int(h * 0.18), int(w * 0.94), int(h * 0.18) + int(w * 0.22 * 2.05)), seed=seed + 1)
        else:
            browser(img, (int(w * 0.1), int(h * 0.12), int(w * 0.9), int(h * 0.88)), dark=True, seed=seed)
    elif kind == "product":
        if variant == 1:
            phone(img, (int(w * 0.2), int(h * 0.1), int(w * 0.2) + int(h * 0.8 / 2.05), int(h * 0.9)), seed=seed)
            phone(img, (int(w * 0.55), int(h * 0.16), int(w * 0.55) + int(h * 0.8 / 2.05), int(h * 0.96)), dark=True, seed=seed + 2)
        else:
            dashboard(img, (int(w * 0.08), int(h * 0.12), int(w * 0.92), int(h * 0.88)), seed=seed)
    elif kind == "app":
        if variant == 1:
            dashboard(img, (int(w * 0.08), int(h * 0.12), int(w * 0.92), int(h * 0.88)), seed=seed)
        else:
            ph = int(h * 0.78)
            pw = int(ph / 2.05)
            gap = int(w * 0.04)
            total = pw * 3 + gap * 2
            x = (w - total) // 2
            for i in range(3):
                off = int(h * 0.05) * (1 if i == 1 else 0)
                phone(img, (x, int(h * 0.11) - off, x + pw, int(h * 0.11) - off + ph), dark=(i == 1), seed=seed + i)
                x += pw + gap
    elif kind == "flow":
        flow(img, size, seed=seed)
    elif kind == "social":
        if variant == 1:
            ph = int(h * 0.8)
            pw = int(ph / 2.05)
            phone(img, ((w - pw) // 2, int(h * 0.1), (w + pw) // 2, int(h * 0.1) + ph), dark=dark_bg, seed=seed)
        else:
            posts(img, size, seed=seed)
    elif kind == "print":
        brochure(img, size, seed=seed)
    return img


PROJECTS = [
    ("website-revamp", "web", ["stone", "fog", "graphite", "chalk"]),
    ("product-redesign", "product", ["fog", "slate", "chalk", "stone"]),
    ("booking-portal", "app", ["chalk", "stone", "graphite", "fog"]),
    ("lead-automation", "flow", ["slate", "fog", "stone", "chalk"]),
    ("social-campaign", "social", ["graphite", "chalk", "stone", "fog"]),
    ("product-catalogue", "print", ["ash", "chalk", "fog", "stone"]),
]

GALLERY_KINDS = {
    "web": ["web", "web", "product", "web"],
    "product": ["product", "product", "app", "product"],
    "app": ["app", "app", "product", "app"],
    "flow": ["flow", "product", "flow", "app"],
    "social": ["social", "social", "social", "print"],
    "print": ["print", "print", "social", "print"],
}


def main():
    for idx, (slug, kind, tones) in enumerate(PROJECTS):
        seed = idx * 10
        save(scene(kind, (1600, 1200), tones[0], seed, 0), f"{slug}-cover.jpg")
        kinds = GALLERY_KINDS[kind]
        # two full-width (16:9) and two side-by-side (4:5)
        save(scene(kinds[0], (2400, 1350), tones[1], seed + 1, 1 if kind in ("web", "product", "app", "social") else 0), f"{slug}-1.jpg")
        save(scene(kinds[1], (1200, 1500), tones[2], seed + 2, 1 if kind == "social" else 0), f"{slug}-2.jpg")
        save(scene(kinds[2], (1200, 1500), tones[3], seed + 3, 0), f"{slug}-3.jpg")
        save(scene(kinds[3], (2400, 1350), tones[0], seed + 4, 2 if kind == "web" else 0), f"{slug}-4.jpg")

    # Default share image (1200x630)
    share = gradient((1200, 630), (34, 34, 34), (18, 22, 25))
    browser(share, (180, 90, 1020, 90 + 520), dark=False, seed=99)
    save(share, "share-default.jpg", quality=86)

    # Looping cover video for the first project: a slow scroll through a site mock.
    tmp = tempfile.mkdtemp()
    frames = 150  # 6 s at 25 fps
    size = (1280, 960)
    for f in range(frames):
        t = f / frames
        scroll = int(520 * (0.5 - 0.5 * __import__("math").cos(2 * __import__("math").pi * t)))
        img = gradient(size, *TONES["stone"])
        browser(img, (int(size[0] * 0.12), int(size[1] * 0.14), int(size[0] * 0.88), int(size[1] * 0.14) + int(size[0] * 0.76 * 0.62)), scroll=scroll, seed=0)
        img.save(os.path.join(tmp, f"f{f:04d}.png"))
    out = os.path.join(OUT, "website-revamp-cover.mp4")
    subprocess.run(
        [
            "ffmpeg", "-v", "error", "-y", "-framerate", "25", "-i", os.path.join(tmp, "f%04d.png"),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "30", "-preset", "slow",
            "-movflags", "+faststart", "-an", out,
        ],
        check=True,
    )
    shutil.rmtree(tmp)
    print("wrote website-revamp-cover.mp4", os.path.getsize(out) // 1024, "KB")


if __name__ == "__main__":
    main()
