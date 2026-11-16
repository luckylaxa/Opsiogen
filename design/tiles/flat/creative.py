from render import render, art
from mvps import browser
P = 'position:absolute;'
INK = '#2b2622'; MUTE = '#8a7f74'; TERRA = '#c8603f'; SAGE = '#8aa58c'
def box(x, y, w, inner, s=1, pad=22, r=16, bg='#fbf7f1', fg=INK):
    return f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;background:{bg};color:{fg};border-radius:{r*s}px;padding:{pad*s}px">{inner}</div>'
def thumb(src, w, h, pos='center', s=1, r=8):
    return f'<div style="width:{w}px;height:{h}px;border-radius:{r*s}px;overflow:hidden;background:#eee"><img src="{art(src)}" style="width:100%;height:100%;object-fit:cover;object-position:{pos}"></div>'
def tag(t, s=1, bg='#efe6da', fg=INK):
    return f'<span style="font-size:{13*s}px;font-weight:600;background:{bg};color:{fg};border-radius:99px;padding:{5*s}px {11*s}px;white-space:nowrap">{t}</span>'
def req(k, title, status, s=1):
    col = {'Delivered': ('#e3efe3', '#2f6b3a'), 'In review': ('#fbe7d8', '#9c4a2f')}[status]
    return (f'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:{12*s}px"><div><div style="font-size:{12.5*s}px;letter-spacing:.1em;color:{MUTE};font-weight:600">{k}</div>'
            f'<div style="font-size:{21*s}px;font-weight:600;margin-top:{3*s}px">{title}</div></div>{tag(status, s, *col)}</div>')
SERIF = "font-family:'Cormorant Garamond',Georgia,serif"
def sw_ad(w, h, head='Slow down.<br>Start here.', sub='Classes from 6:30, Monday to Saturday', s=1, dark=False):
    """A complete Stillwater ad drawn at its own size: logo, headline, line, and the arch shapes."""
    m = min(w, h); bg, fg = ('#2b2a28', '#f3ece2') if dark else ('#efe6da', '#2b2622')
    fs = m * (.15 if h >= w else .19); pad = m * .08
    sh = m * .42
    return (f'<div style="position:relative;width:{w}px;height:{h}px;background:{bg};color:{fg};overflow:hidden;border-radius:{8*s}px">'
            f'<div style="position:absolute;left:{pad}px;top:{pad}px;font-size:{m*.055}px;display:flex;gap:{m*.02}px;align-items:center"><span style="width:{m*.05}px;height:{m*.05}px;border:{max(1,m*.006)}px solid {fg};border-radius:50%"></span>Stillwater</div>'
            f'<div style="position:absolute;left:{pad}px;top:{pad + m*.13}px;{SERIF};font-size:{fs}px;line-height:.98;letter-spacing:-.01em">{head}</div>'
            f'<div style="position:absolute;left:{pad}px;bottom:{pad}px;width:{w*.5 if w > h else w*.46}px;font-size:{m*.042}px;opacity:.8;line-height:1.3">{sub}</div>'
            f'<div style="position:absolute;right:{pad}px;bottom:0;width:{sh*.62}px;height:{sh*1.05}px;background:#c8603f;border-radius:{sh}px {sh}px 0 0"></div>'
            f'<div style="position:absolute;right:{pad + sh*.36}px;bottom:0;width:{sh*.42}px;height:{sh*.68}px;background:{"#f3ece2" if dark else "#2b2622"};border-radius:{sh}px {sh}px 0 0"></div>'
            f'<div style="position:absolute;right:{pad + sh*.02}px;bottom:{sh*1.02}px;width:{sh*.4}px;height:{sh*.4}px;border-radius:50%;background:#8aa58c"></div></div>')
D, Ph = (1600, 1200), (1074, 1380)
J = []
# 1 Ad creatives: one request, every size delivered
def ads(x, y, w, s=1):
    g = round(14 * s); a = round((w - 2 * 22 * s - 2 * g) * .42); b = round(a * .56); c = (w - 2 * round(22 * s) - a - b - 2 * g)
    row = (f'<div style="display:flex;gap:{g}px;align-items:flex-end;margin-top:{18*s}px">'
           f'<div>{sw_ad(a, a, s=s)}<div style="font-size:{13*s}px;color:{MUTE};margin-top:{6*s}px">1080 × 1080</div></div>'
           f'<div>{sw_ad(b, round(b*16/9), "Slow<br>down.<br>Start<br>here.", "Classes from 6:30", s, True)}<div style="font-size:{13*s}px;color:{MUTE};margin-top:{6*s}px">1080 × 1920</div></div>'
           f'<div>{sw_ad(c, round(c*.52), "Slow down.<br>Start here.", "From 6:30, Monday to Saturday", s)}<div style="font-size:{13*s}px;color:{MUTE};margin-top:{6*s}px">1200 × 628</div></div></div>')
    return box(x, y, w, req('REQUEST 24 · SPRING CLASSES', 'Ads in every size', 'Delivered', s) + row, s)
J.append(('tile-ads.jpg', *D, '#2f3d33', ads(580, 420, 960)))
J.append(('tile-ads-phone.jpg', *Ph, '#2f3d33', ads(32, 480, 1010, 1.15)))
# 2 Presentations: the deck, slide 4 of 18
def deck(x, y, w, s=1):
    h = round((w - 2 * 22 * s) * 9 / 16)
    return box(x, y, w, req('REQUEST 25 · PARTNER PITCH', 'Pitch deck, 18 slides', 'In review', s) +
               f'<div style="margin-top:{16*s}px">{thumb("c-deck.png", round(w - 2*22*s), h, "center", s, 10)}</div>'
               f'<div style="display:flex;justify-content:space-between;font-size:{14*s}px;color:{MUTE};margin-top:{10*s}px"><span>Slide 4 of 18</span><span>Two comments to resolve</span></div>', s)
J.append(('tile-decks.jpg', *D, '#9c4a2f', deck(600, 410, 920)))
J.append(('tile-decks-phone.jpg', *Ph, '#9c4a2f', deck(32, 480, 1010, 1.15)))
# 3 Brand assets and templates: the template library
def library(x, y, w, cols, s=1, n=6):
    g = round(14 * s); tw = (w - 2 * round(22 * s) - (cols - 1) * g) // cols; th = round(tw * .72)
    def fitimg(src):
        return f'<div style="width:{tw}px;height:{th}px;border-radius:{8*s}px;overflow:hidden;background:#e9e0d3;display:grid;place-items:center"><img src="{art(src)}" style="max-width:100%;max-height:100%;object-fit:contain"></div>'
    items = [(sw_ad(tw, th, s=s), 'Poster'), (fitimg('c-landing.png'), 'Web header'), (fitimg('c-deck.png'), 'Slide'),
             (sw_ad(tw, th, 'Seven days.<br>Seven classes.', 'Your first week, on us to try', s, True), 'Social post'), (fitimg('cbill.png'), 'Billboard'), (sw_ad(tw, th, 'Breathe in.<br>Slow down.', 'Sunrise flow, every day at 6:30', s), 'Email header')]
    cells = ''.join(f'<div>{el}<div style="font-size:{14*s}px;margin-top:{6*s}px">{lab}</div></div>' for el, lab in items[:n])
    head = f'<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:{21*s}px">Stillwater templates</b>{tag("24 files", s)}</div>'
    return box(x, y, w, head + f'<div style="display:grid;grid-template-columns:repeat({cols},{tw}px);gap:{g}px;margin-top:{16*s}px">{cells}</div>', s)
J.append(('tile-assets.jpg', *D, '#5f7360', library(590, 410, 950, 3)))
J.append(('tile-assets-phone.jpg', *Ph, '#5f7360', library(32, 470, 1010, 2, 1.12, 4)))
# 4 Motion graphics: the animation, frame by frame
def motion(x, y, w, s=1):
    h = round((w - 2 * 22 * s) / 2.36)
    bar = (f'<div style="display:flex;align-items:center;gap:{12*s}px;margin-top:{14*s}px;font-size:{14*s}px;color:{MUTE}"><span style="width:0;height:0;border-left:{12*s}px solid {INK};border-top:{8*s}px solid transparent;border-bottom:{8*s}px solid transparent"></span>'
           f'<div style="flex:1;height:{5*s}px;border-radius:9px;background:#e6ddd1"><div style="width:42%;height:100%;border-radius:9px;background:{TERRA}"></div></div><span>0:06 / 0:15</span></div>')
    return box(x, y, w, req('REQUEST 26 · LOGO STING', 'Animated logo, 15 seconds', 'Delivered', s) + f'<div style="margin-top:{16*s}px">{thumb("cmotion.png", round(w-2*22*s), h, "center", s, 10)}</div>' + bar, s)
J.append(('tile-motion.jpg', *D, '#2b2a28', motion(580, 420, 960)))
J.append(('tile-motion-phone.jpg', *Ph, '#2b2a28', motion(32, 480, 1010, 1.15)))
# 5 AI imagery and video: generated, then finished by a designer
def aiimg(x, y, w, s=1):
    h = round((w - 2 * 22 * s) / 1.26)
    return box(x, y, w, req('REQUEST 27 · CLASS CAMPAIGN', 'Images made with AI', 'Delivered', s) + f'<div style="margin-top:{16*s}px">{thumb("cai.png", round(w-2*22*s), h, "center", s, 10)}</div>'
               f'<div style="display:flex;gap:{8*s}px;margin-top:{12*s}px">{tag("Take 3 chosen", s)}{tag("Retouched and colour matched", s, "#e3efe3", "#2f6b3a")}</div>', s)
J.append(('tile-ai.jpg', *D, '#7d4a36', aiimg(860, 380, 660)))
J.append(('tile-ai-phone.jpg', *Ph, '#7d4a36', aiimg(32, 470, 1010, 1.15)))
# 6 Email and landing pages
J.append(('tile-email.jpg', *D, '#4e5a3c', browser('c-landing.png', 640, 420, 900, 652, 'stillwater.example/new-members')))
J.append(('tile-email-phone.jpg', *Ph, '#4e5a3c', browser('c-landing.png', 22, 480, 1030, 746, 'stillwater.example/new-members')))
if __name__ == '__main__':
    render(J, '../out/flat-cre')
