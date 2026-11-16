from render import render, art
P = 'position:absolute;'
def frame(src, x, y, w, h, r=18, pos='center', extra=''):
    return f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;height:{h}px;border-radius:{r}px;overflow:hidden;background:#000">' \
           f'<img src="{art(src)}" style="width:100%;height:100%;object-fit:cover;object-position:{pos}">{extra}</div>'
def play(cx, cy, d):
    return f'<div style="{P}left:{cx-d/2}px;top:{cy-d/2}px;width:{d}px;height:{d}px;border-radius:50%;background:rgba(255,255,255,.94);display:grid;place-items:center"><div style="width:0;height:0;border-left:{d*.32}px solid #2a0a1c;border-top:{d*.2}px solid transparent;border-bottom:{d*.2}px solid transparent;margin-left:{d*.08}px"></div></div>'
def label(x, y, t, s=1):
    return f'<div style="{P}left:{x}px;top:{y}px;color:rgba(255,255,255,.75);font-size:{18*s}px;font-weight:500;letter-spacing:.04em">{t}</div>'
def views(t, s=1):
    return f'<div style="{P}left:{12*s}px;top:{12*s}px;background:rgba(0,0,0,.55);color:#fff;font-size:{15*s}px;font-weight:600;border-radius:99px;padding:{5*s}px {11*s}px">▶ {t}</div>'
def card(x, y, w, inner, pad=24, bg='#fff', r=18):
    return f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;background:{bg};border-radius:{r}px;padding:{pad}px">{inner}</div>'
def window(src, x, y, w, title, s=1):
    h = round(w / 1.6); bar = round(40 * s)
    return (f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;height:{h+bar}px;border-radius:{14*s}px;overflow:hidden;background:#1d1c21;box-shadow:0 0 0 1px rgba(255,255,255,.08)">'
            f'<div style="height:{bar}px;display:flex;align-items:center;gap:{8*s}px;padding:0 {14*s}px;color:#bdb8c4;font-size:{14*s}px">'
            f'<i style="width:{11*s}px;height:{11*s}px;border-radius:50%;background:#ff5f57"></i><i style="width:{11*s}px;height:{11*s}px;border-radius:50%;background:#febc2e"></i><i style="width:{11*s}px;height:{11*s}px;border-radius:50%;background:#28c840"></i>'
            f'<span style="margin-left:auto;margin-right:auto">{title}</span></div><img src="{art(src)}" style="display:block;width:100%;height:{h}px;object-fit:cover"></div>')
D, Ph = (1600, 1200), (1074, 1380)
J = []
# 1 Explainer: a video player
J.append(('tile-explainer.jpg', *D, '#2b0a1d', frame('v-explainer.png', 580, 450, 960, 540) + play(580 + 960 * .655, 450 + 540 * .47, 116) + label(580, 1010, 'CHAPTER 2 · THE CHURN · 1:30')))
J.append(('tile-explainer-phone.jpg', *Ph, '#2b0a1d', frame('v-explainer.png', 32, 500, 1010, 568) + play(32 + 1010 * .655, 500 + 568 * .47, 130) + label(32, 1095, 'CHAPTER 2 · THE CHURN · 1:30', 1.3)))
# 2 Social video and reels: three vertical videos
def reels(xl, xc, xr, y, wc, ws, s=1):
    hc, hs = round(wc * 16 / 9), round(ws * 16 / 9); dy = round((hc - hs) / 2)
    return (frame('cine.png', xl, y + dy, ws, hs, 20 * s, '61% center', views('8.4k', s)) +
            frame('v-explainer.png', xr, y + dy, ws, hs, 20 * s, '92% center', views('12.9k', s)) +
            frame('v-reel.png', xc, y, wc, hc, 22 * s, 'center', views('24.1k', s)))
J.append(('tile-social.jpg', *D, '#141014', reels(740, 990, 1290, 400, 330, 260)))
J.append(('tile-social-phone.jpg', *Ph, '#141014', reels(40, 332, 724, 470, 410, 310, 1.3)))
# 3 Video ads: one ad in every size
def ads(spec, s=1):
    out = ''
    for src, x, y, w, h, pos, t in spec: out += frame(src, x, y, w, h, 10 * s, pos) + label(x, y + h + 14 * s, t, s)
    return out
J.append(('tile-ads.jpg', *D, '#12301c', ads([('v-endcard.png', 545, 540, 500, 281, 'center', '16:9'), ('v-reel.png', 1075, 540, 281, 281, 'top', '1:1'), ('v-reel.png', 1386, 448, 188, 373, 'top', '9:16')])))
J.append(('tile-ads-phone.jpg', *Ph, '#12301c', ads([('v-endcard.png', 32, 500, 600, 338, 'center', '16:9', ), ('v-reel.png', 32, 900, 338, 338, 'top', '1:1'), ('v-reel.png', 672, 500, 370, 658, 'top', '9:16')], 1.3)))
# 4 Motion graphics: the edit, in its window
J.append(('tile-motion.jpg', *D, '#3a0c22', window('vmotion.png', 580, 430, 960, 'Spring reel · 00:12 / 00:30')))
J.append(('tile-motion-phone.jpg', *Ph, '#3a0c22', window('vmotion.png', 32, 500, 1010, 'Spring reel · 00:12 / 00:30', 1.3)))
# 5 AI video: the take we chose, and the prompt behind it
def prompt(x, y, w, s=1):
    return card(x, y, w, f'<div style="display:flex;align-items:center;gap:{14*s}px"><span style="width:{34*s}px;height:{34*s}px;border-radius:50%;background:#c2185b;color:#fff;display:grid;place-items:center;font-size:{18*s}px">✦</span>'
                f'<span style="font-size:{19*s}px;color:#2a0a1c">A pistachio scoop lands on the cone, slow motion, warm pink light</span>'
                f'<span style="margin-left:auto;font-size:{14*s}px;font-weight:600;background:#e9f6d7;color:#2f6b12;border-radius:99px;padding:{6*s}px {12*s}px;white-space:nowrap">Take 3 · Chosen</span></div>', pad=round(18 * s), r=round(16 * s))
J.append(('tile-ai.jpg', *D, '#1c1b20', frame('cine.png', 580, 430, 960, 400, 16) + prompt(580, 860, 960)))
J.append(('tile-ai-phone.jpg', *Ph, '#1c1b20', frame('cine.png', 32, 500, 1010, 421, 16) + prompt(32, 960, 1010, 1.25)))
# 6 Concepts and scripts: a storyboard sheet
def board(x, y, w, cols, s=1, n=6):
    panels = [('v-explainer.png', '20% 30%', 'Open on the shop sign'), ('v-explainer.png', '80% 40%', 'The churn'), ('v-endcard.png', '80% 40%', 'Two scoops land'),
              ('cine.png', '50% 50%', 'First bite'), ('vmotion.png', '50% 20%', 'Colours pop in'), ('v-endcard.png', '20% 50%', 'End card')]
    gap = round(18 * s); pw = (w - 2 * round(28 * s) - gap * (cols - 1)) // cols; ph = round(pw * 9 / 16)
    cells = ''.join(f'<div><div style="width:{pw}px;height:{ph}px;border-radius:{6*s}px;overflow:hidden;border:1px solid #e3dcd9"><img src="{art(src)}" style="width:100%;height:100%;object-fit:cover;object-position:{pos}"></div>'
                    f'<div style="font-size:{14*s}px;color:#5b4b52;margin-top:{6*s}px"><b style="color:#c2185b">{i+1}</b>&nbsp; {cap}</div></div>' for i, (src, pos, cap) in enumerate(panels[:n]))
    head = f'<div style="display:flex;justify-content:space-between;font-size:{14*s}px;letter-spacing:.08em;color:#9b8c93;margin-bottom:{16*s}px"><span>SUNDAE CLUB · STORYBOARD</span><span>30 SEC · DRAFT 3</span></div>'
    return card(x, y, w, head + f'<div style="display:grid;grid-template-columns:repeat({cols},{pw}px);gap:{gap}px">{cells}</div>', pad=round(28 * s), bg='#fbf6f2')
J.append(('tile-concepts.jpg', *D, '#5b0d32', board(570, 430, 980, 3)))
J.append(('tile-concepts-phone.jpg', *Ph, '#5b0d32', board(32, 490, 1010, 2, 1.25, 4)))
render(J, '../out/flat-video')
