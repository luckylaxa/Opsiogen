"""Copy a service's new tiles and page images into the site and update their alt text.
usage: publish.py <slug> <outdir> <json alts: {"tile-x.jpg": "...", "page": "..."}>"""
import json, re, shutil, sys, os
slug, outdir, alts = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
root = '/home/user/Opsiogen'
dst = f'{root}/public/services/{slug}'
for f in os.listdir(outdir):
    if f.endswith('.jpg') and not f.startswith('_') and (f in alts or f.startswith('page')):
        shutil.copy(f'{outdir}/{f}', f'{dst}/{f}')
p = f'{root}/src/content/seed-data.ts'; s = open(p).read()
for f, alt in alts.items():
    if not f.startswith('tile-'): continue
    pat = re.compile(r'("' + re.escape(f) + r'", )"(?:[^"\\]|\\.)*"')
    assert len(pat.findall(s[s.index(f'cards("{slug}"'):])) >= 1, f
    i = s.index(f'cards("{slug}"'); j = s.index(']),', i)
    block = pat.sub(lambda m: m.group(1) + json.dumps(alt, ensure_ascii=False), s[i:j], count=1)
    s = s[:i] + block + s[j:]
card = f'    card: img(`/services/{slug}/card.jpg`, 1600, 1200, CARD_ALT["{slug}"]),\n'
assert card in s
if 'page' in alts and f'/services/{slug}/page.jpg' in s:
    alt = json.dumps(alts['page'], ensure_ascii=False)
    for name in ('page.jpg', 'page-phone.jpg'):
        s = re.sub(r'(img\(`/services/' + re.escape(slug) + '/' + re.escape(name) + r'`, \d+, \d+, )"(?:[^"\\]|\\.)*"', lambda m: m.group(1) + alt, s)
if f'/services/{slug}/page.jpg' not in s:
    alt = json.dumps(alts['page'], ensure_ascii=False)
    s = s.replace(card, card + f'    pageImage: img(`/services/{slug}/page.jpg`, 2400, 1200, {alt}),\n    pageImagePhone: img(`/services/{slug}/page-phone.jpg`, 1600, 1200, {alt}),\n')
open(p, 'w').write(s)
print('ok', slug)
