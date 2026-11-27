"""Cut 23 (27 Nov 2026): the owner's approved changes from the Figma file N0FMCGKpSEZ0PVBoQDCVdc, page
"05 · Change requests (for approval)", made in another chat. Their exports (1920 x 1080, the film's own size) are in
design/showreel/raw/cut23; this puts them into build/a under new names, so nothing earlier is overwritten:
- 13 Brand tiles: the right tile, the Norsecom ID card, becomes a Norsecom laptop sleeve (cut from the frame where
  the film's tiles sit: 400 px squares from x 100, 40 apart, y 340), its corners filled under the tile's rounding;
- 21 SandLogic social grid: option B, on SandLogic black #0B0A12 (the owner's pick);
- 24 Print stationery: the same mockup in Cabot's colours, with the Cabot logo and Cabot's own copy;
- 48 Build: the Care Connect home page in the same mockup as the other sites (was Vaelo's site and app);
- 50 Website: Cabot Solutions' home page in the same mockup (was the second Engel & Völkers site; Surgo Health's
  index page from the Figma page repeated shot 35's Surgo screen, owner, 27 Nov: "Repeated"; Cabot's is the one
  website of ours not yet in the film);
- 61 Creative subscription: an RxLive deck slide, a Care Connect story ad and a Surgo Health search ad.
Shot 22 (a brand being built, in motion) is drawn in frames.html from the Figma layers. Shots 15 and 20 keep
their earlier tiles: the R&S booth the owner approved (rs-07) and the out-of-home ads (rs-09, nc-14, sl-08; owner,
27 Nov: "Use previous version" over the real-photo tries of design/tiles/ooh, which had been written over them).
Then run pieces.py, so the new flat-background images move in pieces like the ones they replace.
Usage: python3 cut23.py"""
import os
import numpy as np
import cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', 'raw', 'cut23')
A = os.path.join(HERE, 'a')
save = lambda im, name: (im.save(os.path.join(A, name), quality=92), print('a/' + name, im.size))
rgb = lambda f: Image.open(os.path.join(RAW, f)).convert('RGB')

save(rgb('21-slp-social-black.png'), 'z-slp-social-black.jpg')
save(rgb('24-stationery-cabot.png'), 'h-t-print-stationery-cabot.jpg')
save(rgb('48-site-care-connect.png'), 's-care-connect.jpg')
save(rgb('61-subscription-deck-story-search.png'), 'svc-sub-c23.jpg')

# The sleeve tile: the frame's right tile, its rounded corners filled from the tile so no orange shows at their edge.
t = np.asarray(rgb('13-tiles-sleeve.png'))[340:740, 1420:1820].copy()
keep = np.zeros(t.shape[:2], np.uint8)
cv2.rectangle(keep, (0, 0), (399, 399), 255, -1)
corner = np.full(t.shape[:2], 255, np.uint8)
cv2.rectangle(corner, (0, 0), (399, 399), 0, -1)
r, inset = 20, 3
rr = np.zeros(t.shape[:2], np.uint8)
cv2.rectangle(rr, (r, inset), (399 - r, 399 - inset), 255, -1); cv2.rectangle(rr, (inset, r), (399 - inset, 399 - r), 255, -1)
for cx, cy in ((r, r), (399 - r, r), (r, 399 - r), (399 - r, 399 - r)):
    cv2.circle(rr, (cx, cy), r - inset, 255, -1)
t = cv2.inpaint(t, (rr == 0).astype(np.uint8), 4, cv2.INPAINT_TELEA)
save(Image.fromarray(t), 'nc-sleeve.jpg')

# Shots 15 and 20: the earlier tiles, made as build/assets.py makes them (from raw/clean, the case studies' designs).
CLEAN = os.path.join(HERE, '..', 'raw', 'clean')
# Shot 20's three are framed round their ads (owner, 27 Nov: "18 sec collage is not Center"): the billboard in a 4:3
# card, the bus shelter's poster and the subway wall's ad in 2:3 cards (the subway ad meets the photo's edge, so it
# fills its card instead).
FRAME = {'rs-09': (182, 105, 1342, 975), 'nc-14': (822, 307, 1462, 1267), 'sl-08': (1026, 315, 1526, 1065)}
# Shot 13's last two tiles (owner, 27 Nov: "Replace white T-shirt and laptop mockups. We don't need repeating"): Cabot's
# tote and Rohde & Schwarz's business cards, so the four tiles are four brands and four kinds of piece.
for key, src in (('rs-07', 'rohde-schwarz_rs-7-wide.jpg'), ('rs-09', 'rohde-schwarz_rs-9-wide.jpg'),
                 ('nc-14', 'norsecom_norsecom-14-wide.jpg'), ('sl-08', 'sandlogic_sandlogic-8-wide.jpg'),
                 ('cb-10', 'cabot-solutions_cabotbrand-10-wide.jpg'), ('rs-11', 'rohde-schwarz_rs-11-wide.jpg')):
    im = Image.open(os.path.join(CLEAN, src)).convert('RGB')
    if key in FRAME: im = im.crop(FRAME[key])
    if im.width > 1600: im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    im.save(os.path.join(A, key + '.jpg'), quality=88); print('a/' + key + '.jpg', im.size, '(earlier tile)')

# Shot 50: Cabot's home page on the site mockup (screen 1450 px wide from x 235, corners rounded 6 px, on #1c1b19, as
# the other site shots), from its clean export (raw/clean) without its grey frame (18 px at the top, 20 at the left,
# 27 at the right, measured; it showed as a light strip at the screen's edge), down to the white band under its hero:
# below it the page shows other companies' logos, which our images never do.
src = Image.open(os.path.join(CLEAN, 'cabot-solutions_cabot-1-wide.jpg')).convert('RGB')
src = src.crop((20, 18, src.width - 27, 1046))   # the hero; not the row of other companies' logos below it
w = 1450; h = round(src.height * w / src.width); x0, y0 = 235, (1080 - h) // 2
canvas = Image.new('RGB', (1920, 1080), (28, 27, 25))
from PIL import ImageDraw
mask = Image.new('L', (w * 4, h * 4), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, w * 4 - 1, h * 4 - 1), 24, fill=255)
canvas.paste(src.resize((w, h), Image.LANCZOS), (x0, y0), mask.resize((w, h), Image.LANCZOS))
save(canvas, 's-cabot.jpg')
