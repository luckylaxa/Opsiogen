"""Cut 23 (27 Nov 2026): the owner's approved changes from the Figma file N0FMCGKpSEZ0PVBoQDCVdc, page
"05 · Change requests (for approval)", made in another chat. Their exports (1920 x 1080, the film's own size) are in
design/showreel/raw/cut23; this puts them into build/a under new names, so nothing earlier is overwritten:
- 13 Brand tiles: the right tile, the Norsecom ID card, becomes a Norsecom laptop sleeve (cut from the frame where
  the film's tiles sit: 400 px squares from x 100, 40 apart, y 340), its corners filled under the tile's rounding;
- 21 SandLogic social grid: option B, on SandLogic black #0B0A12 (the owner's pick);
- 24 Print stationery: the same mockup in Cabot's colours, with the Cabot logo and Cabot's own copy;
- 48 Build: the Care Connect home page in the same mockup as the other sites (was Vaelo's site and app);
- 50 Website: Surgo Health's index page (was the second Engel & Völkers site);
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
save(rgb('50-site-surgo.png'), 's-surgo.jpg')
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
for key, src in (('rs-07', 'rohde-schwarz_rs-7-wide.jpg'), ('rs-09', 'rohde-schwarz_rs-9-wide.jpg'),
                 ('nc-14', 'norsecom_norsecom-14-wide.jpg'), ('sl-08', 'sandlogic_sandlogic-8-wide.jpg')):
    im = Image.open(os.path.join(CLEAN, src)).convert('RGB')
    if im.width > 1600: im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    im.save(os.path.join(A, key + '.jpg'), quality=88); print('a/' + key + '.jpg', im.size, '(earlier tile)')
