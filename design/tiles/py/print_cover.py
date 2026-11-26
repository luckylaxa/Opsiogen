"""The print page's cover (26 Nov, the owner: "fill it. no need blue background"): the exhibition stand photo filling
the cover (2:1 desktop, 4:3 phone) with no blue panel. Since 26 Nov it is BigTapp's stand (booth_bigtapp.py).
Usage: python3 print_cover.py design/tiles/out/figma-print/ai/bigtapp-booth-model.png OUT_DIR
(The old Vantara photo had a gap in "Industr ial" on the back wall, closed in step 1; BigTapp's wall has new lines.)"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(SRC).convert('RGB')).copy()
H, W = im.shape[:2]
# 1. the Vantara headline's first line: "Industr ial automation," -> close the extra 4 px between r and i
if 'vantara' in os.path.basename(SRC):
    y0, y1, xg, end, d = 232, 272, 770, 1030, 4
    im[y0:y1, xg:end - d] = im[y0:y1, xg + d:end]
fixed = Image.fromarray(im)
# 2. desktop, 2:1: keep the sign's top (y 11) to below the shoes (~680); the photo is a little too narrow for that, so
#    the hall at the far left and right is stretched outward (the stand itself is untouched)
top, bottom = 9, 681
h = bottom - top; need = 2 * h; extra = need - W; e = extra // 2
L, R = 110, 110                                   # the outer strips that get stretched
left = fixed.crop((0, 0, L, H)).resize((L + e, H), Image.LANCZOS)
mid = fixed.crop((L, 0, W - R, H))
right = fixed.crop((W - R, 0, W, H)).resize((R + extra - e, H), Image.LANCZOS)
wide = Image.new('RGB', (need, H)); wide.paste(left, (0, 0)); wide.paste(mid, (L + e, 0)); wide.paste(right, (L + e + mid.width, 0))
desk = wide.crop((0, top, need, bottom)).resize((2400, 1200), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2))
desk.save(f'{OUT}/page.jpg', 'JPEG', quality=86, optimize=True, progressive=True)
# 3. phone, 4:3: from just left of the roll-up banner to just right of the team member, full height
x0 = 85
phone = fixed.crop((x0, 0, x0 + 960, 720)).resize((1600, 1200), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2))
phone.save(f'{OUT}/page-phone.jpg', 'JPEG', quality=86, optimize=True, progressive=True)
print('desktop from', need, 'x', h, '| stretched each side by', e, extra - e)
