"""Prepares the film's images in build/a and the size list (manifest.json, manifest.js).
Run from design/showreel, after clean.py has filled raw/clean: python3 build/assets.py"""
from PIL import Image
import glob, os, json
out = 'build/a/'; man = {}; os.makedirs(out, exist_ok=True)
def put(key, path, maxw=1600, inset=0):
    im = Image.open(path).convert('RGB')
    if inset: im = im.crop((inset, inset, im.width - inset, im.height - inset))
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(out + key + '.jpg', quality=88); man[key] = [im.width, im.height]
def num(p): return int(p.rsplit('-', 2)[-2])
for f in sorted(glob.glob('raw/product/*.png')): put(os.path.basename(f)[:-4], f, 2400)
for client, pre, key, inset in [] and [('bigtapp', 'bigtapp', 'bt', 16), ('cabot-solutions', 'cabot', 'cb', 16), ('carlton-noble', 'carlton', 'cn', 16), ('engel-volkers', 'ev', 'ev', 16),
                                ('sandlogic', 'sandlogic', 'sl', 0), ('norsecom', 'norsecom', 'nc', 0), ('rohde-schwarz', 'rs', 'rs', 0), ('cabot-solutions', 'cabotbrand', 'cbb', 0)]:
    for f in sorted(glob.glob(f'raw/clean/{client}_{pre}-*-wide*'), key=num): put(f'{key}-{num(f):02d}', f, 1600, inset)
for f in sorted(glob.glob('../tiles/out/figma-brand/tile-*.jpg')):
    if 'phone' not in f: put('tv-' + os.path.basename(f)[5:-4], f)
for f in sorted(glob.glob('../case-studies/afthab-tours/wall/*.jpg')): put('af-' + os.path.basename(f)[:-4], f, 1080)
for f in sorted(glob.glob('raw/vaelo/*.png')): put('va-' + os.path.basename(f)[:-4], f, 2400)   # the car brand
for f in sorted(glob.glob('raw/sl/*.png')): put('sl' + os.path.basename(f)[:-4], f, 1920)   # SandLogic guideline and rebrand pages
for d in ['print', 'social', 'video', 'digital', 'subscription', 'automation', 'mvp', 'pd']:   # our own service artwork
    for f in sorted(glob.glob(f'../tiles/out/figma-{d}/tile-*.jpg')):
        if 'phone' not in f: put(f't-{d}-' + os.path.basename(f)[5:-4], f, 1600)
for f in sorted(glob.glob('../tiles/out/websites/site-*.png')): put('w-' + os.path.basename(f)[5:-4], f, 1600)
for d in sorted(glob.glob('build/a/clips/*')):   # website films: frames of a short clip
    fs = sorted(glob.glob(d + '/*.jpg')); w, h = Image.open(fs[0]).size; man['clip-' + os.path.basename(d)] = [w, h, len(fs)]
import shutil
for f in sorted(glob.glob('raw/character/keep/*.png')):  # our character, with no background
    shutil.copy(f, out + os.path.basename(f)); man[os.path.basename(f)[:-4]] = [720, 720]
json.dump(man, open('build/manifest.json', 'w'))
open('build/manifest.js', 'w').write('window.MANIFEST=' + json.dumps(man) + ';\n')
print(len(man), 'images')
