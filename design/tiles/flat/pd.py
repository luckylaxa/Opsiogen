from render import render, art
from PIL import Image
import os
A = os.path.abspath('../art')
def ratio(n): im = Image.open(f'{A}/{n}'); return im.width / im.height
def fit(n, bx, by, bw, bh, align='right', top=False):
    r = ratio(n); w = min(bw, bh * r); h = w / r
    x = bx + bw - w if align == 'right' else bx + (bw - w) / 2
    return round(x), round(by if top else by + (bh - h)), round(w), round(h)
def board(n, x, y, w, h, label, s=1, sel=False):
    hs = ''
    if sel:
        for cx, cy in [(0, 0), (1, 0), (0, 1), (1, 1)]:
            hs += f'<i class=h style="left:{cx*w-7}px;top:{cy*h-7}px"></i>'
    return (f'<div class="board{" sel" if sel else ""}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;font-size:{17*s}px">'
            f'<div class=lbl>{label}</div><div class=sc><img class=scr src="{art(n)}" style="object-fit:contain"></div>{hs}</div>')
def cursor(x, y, s=1):
    return (f'<svg class=cursor style="left:{x}px;top:{y}px;width:{34*s}px;height:{34*s}px" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.6 14.8 L11.6 21.4 L14.4 20.2 L11.4 13.7 L17.6 13.4 Z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>')
def one(n, label, bg, sel=True, cur=None):
    out = []
    for name, W, H, box, s in [('', 1600, 1200, (560, 450, 990, 700), 1), ('-phone', 1074, 1380, (40, 530, 994, 800), 1.35)]:
        x, y, w, h = fit(n, *box, top=True)
        body = board(n, x, y, w, h, label, s, sel)
        if cur: body += cursor(x + w * cur[0], y + h * cur[1], s)
        out.append((name, W, H, bg, body))
    return out
def audit(bg):
    out = []
    for name, W, H, s, (x, y, w) in [('', 1600, 1200, 1, (1150, 420, 330)), ('-phone', 1074, 1380, 1.3, (560, 520, 380))]:
        h = round(w / 0.462)
        pins = [(.86, .27, 1), (.7, .52, 2), (.5, .86, 3)]
        body = board('home.png', x, y, w, h, 'Home · Audit', s)
        for px, py, n in pins: body += f'<div class=pin style="left:{x + w * px - 20}px;top:{y + h * py - 20}px;transform:scale({s})">{n}</div>'
        notes = [('1 · High', 'Balance sits below two cards. 7 of 8 people looked twice.'), ('2 · Medium', 'The week chart has no labels, so the bars read as decoration.'), ('3 · Low', 'Tab icons under 44 px are easy to miss.')]
        nx = x - round(300 * s) - 30; ny = y + round(40 * s)
        for i, (t, d) in enumerate(notes):
            body += f'<div class=note style="left:{nx}px;top:{ny + i * round(150 * s)}px;width:{round(280 * s)}px;font-size:{round(17 * s)}px"><b>{t}</b>{d}</div>'
        out.append((name, W, H, bg, body))
    return out
def two(a, la, b, lb, bg):
    out = []
    # desktop: wide board and phone board side by side; phone card: stacked, phone board in front
    xa, ya, wa, ha = fit(a, 590, 470, 700, 520, top=True); xb, yb, wb, hb = fit(b, 1330, 430, 240, 620, top=True)
    out.append(('', 1600, 1200, bg, board(a, xa, ya, wa, ha, la) + board(b, xb, yb, wb, hb, lb, sel=True) + cursor(xb + wb * .6, yb + hb * .32)))
    xa, ya, wa, ha = fit(a, 40, 530, 760, 560, 'center', top=True); xb, yb, wb, hb = fit(b, 690, 560, 340, 740, top=True)
    out.append(('-phone', 1074, 1380, bg, board(a, 40, ya, wa, ha, la, 1.35) + board(b, xb, yb, wb, hb, lb, 1.35, sel=True)))
    return out
tiles = {
 'tile-product': two('tdesk.png', 'Home · Desktop', 'proto-step.png', 'New pot · Mobile', '#0f3b2b'),
 'tile-audit': audit('#13264a'),
 'tile-redesign': one('redesign-after.png', 'Home · Release 3', '#5b3a1c', cur=(.3, .4)),
 'tile-prototype': one('proto.png', 'Prototype · New pot flow', '#2c4733', cur=(.62, .82)),
 'tile-system': one('system.png', 'Tidewise · Design system', '#1d5a41', cur=(.36, .55)),
 'tile-handoff': one('handoff.png', 'Balance card · Ready for build', '#3b2a1c', cur=(.2, .42)),
}
jobs = []
for t, variants in tiles.items():
    for suf, W, H, bg, body in variants: jobs.append((f'{t}{suf}.jpg', W, H, bg, body))
render(jobs, '../out/flat-pd')
