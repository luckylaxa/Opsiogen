"""The Afthab Tours "In motion" film: a tilted wall of our real Afthab creatives, columns drifting up and
down, like the other brand case studies. Writes the desktop (1600 x 1000) and phone (1080 x 1080) films,
in MP4 and WebM, and a poster for each, into public/work/afthab-tours/.  Run from this folder: python3 flow.py
"""
import os, subprocess, random
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../../public/work/afthab-tours")
BG = (13, 42, 68)          # Afthab's deep blue
FPS, SECONDS = 30, 24
TILT = -12                 # degrees
GAP, RADIUS = 26, 26

def card(name, w):
    im = Image.open(os.path.join(HERE, "wall", name + ".jpg")).convert("RGB")
    h = round(w * im.height / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), RADIUS, fill=255)
    out = Image.new("RGB", (w, h), BG); out.paste(im, (0, 0), m)
    return out

def column(names, w):
    cards = [card(n, w) for n in names]
    h = sum(c.height + GAP for c in cards)
    strip = Image.new("RGB", (w, h), BG); y = 0
    for c in cards: strip.paste(c, (0, y)); y += c.height + GAP
    return np.asarray(strip)

def render(size, name, cols, colw, travel):
    W, H = size
    random.seed(7)
    names = sorted(f[:-4] for f in os.listdir(os.path.join(HERE, "wall")) if f.endswith(".jpg"))
    random.shuffle(names)
    per = max(6, len(names) * 2 // cols)
    strips = [column([names[(i * 5 + k * 3) % len(names)] for k in range(per)], colw) for i in range(cols)]
    # A canvas big enough that, turned by TILT, it still covers the frame.
    CW = round((W + H * 0.5) * 1.15); CH = round((H + W * 0.4) * 1.15)
    x0 = (CW - (cols * colw + (cols - 1) * GAP)) // 2
    frames = FPS * SECONDS
    tmp = os.path.join(HERE, "wall-frames"); os.makedirs(tmp, exist_ok=True)
    for f in range(frames):
        t = f / frames
        can = np.empty((CH, CW, 3), np.uint8); can[:] = BG
        for i, s in enumerate(strips):
            sh = s.shape[0]; d = (1 if i % 2 else -1) * travel * t + (i * 211) % sh
            off = int(d) % sh
            rows = np.concatenate([s, s], axis=0)[off: off + CH] if CH <= sh * 2 - off else np.resize(s, (CH, colw, 3))
            x = x0 + i * (colw + GAP)
            if 0 <= x and x + colw <= CW: can[:, x:x + colw] = rows[:CH]
        im = Image.fromarray(can).rotate(TILT, resample=Image.BICUBIC, fillcolor=BG)
        l = (CW - W) // 2; tp = (CH - H) // 2
        im.crop((l, tp, l + W, tp + H)).save(os.path.join(tmp, f"{f:04d}.jpg"), quality=92)
    base = os.path.join(OUT, name)
    src = os.path.join(tmp, "%04d.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", src, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "29", "-preset", "slow", "-movflags", "+faststart", "-an", base + ".mp4"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", src, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-row-mt", "1", "-an", base + ".webm"], check=True)
    Image.open(os.path.join(tmp, f"{frames // 3:04d}.jpg")).save(base + ".jpg", quality=86)
    for fn in os.listdir(tmp): os.remove(os.path.join(tmp, fn))
    os.rmdir(tmp)
    print(name, "done")

if __name__ == "__main__":
    render((1600, 1000), "afthab-tours-flow", cols=7, colw=300, travel=900)
    render((1080, 1080), "afthab-tours-flow-phone", cols=5, colw=300, travel=900)
