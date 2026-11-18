"""Cuts each case study frame down to the design alone, for the showreel.

The gallery frames follow one layout per client:
- website clients: the screen sits at a fixed place, with the client name above and the label to the right;
  keep only the screen.
- brand clients: a photo fills 64% of the frame and a label panel the other 36%, on the left or the right;
  keep only the photo (the panel is the flatter side).
- product clients: the design fills the frame with no label; keep as it is.
Usage: python3 clean.py OUT_DIR
"""
import sys, os, glob
import numpy as np
from PIL import Image

WEBSITE = {"bigtapp": "bigtapp", "cabot-solutions": "cabot", "carlton-noble": "carlton", "engel-volkers": "ev"}
BRAND = {"rohde-schwarz": "rs", "sandlogic": "sandlogic", "norsecom": "norsecom", "cabot-solutions": "cabotbrand"}
PRODUCT = {"oh-my-glam": "omg", "meetingful": "meetingful", "rxlive": "rx", "care-connect": "care", "surgo-health": "surgo", "sifio-health": "sifio"}
SCREEN = (0.035, 0.115, 0.755, 0.895)

def frames(client, prefix):
    fs = glob.glob(f"public/work/{client}/{prefix}-*-wide.jpg")
    return sorted(fs, key=lambda p: int(p.rsplit("-", 2)[-2]))

def brand_crop(im):
    # The label panel is one flat dark colour across its whole 36.4% band; the photo side is not.
    a = np.asarray(im.convert("RGB").resize((480, 306))).astype(int)
    band = round(480 * 0.364)
    def flat_dark(region, edge):
        ref = np.median(edge.reshape(-1, 3), axis=0)
        if ref.mean() > 90: return 0.0
        return (np.abs(region - ref).sum(axis=2) < 40).mean()
    left = flat_dark(a[:, :band], a[:, :6]); right = flat_dark(a[:, -band:], a[:, -6:])
    cut = round(im.width * 0.364)
    return im.crop((cut, 0, im.width, im.height)) if left > right else im.crop((0, 0, im.width - cut, im.height))

def main(out):
    n = 0
    for client, prefix in WEBSITE.items():
        for f in frames(client, prefix):
            im = Image.open(f).convert("RGB"); w, h = im.size
            im.crop((round(SCREEN[0] * w), round(SCREEN[1] * h), round(SCREEN[2] * w), round(SCREEN[3] * h))).save(f"{out}/{client}_{os.path.basename(f)}", quality=90); n += 1
    for client, prefix in BRAND.items():
        for f in frames(client, prefix):
            brand_crop(Image.open(f).convert("RGB")).save(f"{out}/{client}_{os.path.basename(f)}", quality=90); n += 1
    for client, prefix in PRODUCT.items():
        for f in frames(client, prefix):
            im = Image.open(f).convert("RGB")
            # The last Meetingful frame has its own title and label under the phones: keep the phones only.
            if os.path.basename(f) == "meetingful-10-wide.jpg":
                w, h = im.size; im = im.crop((round(0.25 * w), round(0.09 * h), round(0.73 * w), round(0.73 * h)))
            im.save(f"{out}/{client}_{os.path.basename(f)}", quality=90); n += 1
    print(n, "frames")

if __name__ == "__main__":
    main(sys.argv[1])
