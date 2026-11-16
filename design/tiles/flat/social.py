from render import render, art
from mvps import iphone
P = 'position:absolute;'
INK = '#2a1d16'; MUTE = '#8a7a6a'; YEL = '#e4a62a'
SERIF = "font-family:Georgia,'Times New Roman',serif"
def head(s):
    return (f'<div style="display:flex;align-items:center;gap:{10*s}px;padding:{12*s}px {14*s}px"><span style="width:{34*s}px;height:{34*s}px;border-radius:50%;background:{YEL};color:{INK};display:grid;place-items:center;font-weight:700;font-size:{13*s}px">DL</span>'
            f'<div style="line-height:1.2"><div style="font-size:{15*s}px;font-weight:600;color:{INK}">dailyloaf</div><div style="font-size:{12.5*s}px;color:{MUTE}">Canal Street bakery</div></div><span style="margin-left:auto;color:{MUTE};font-size:{18*s}px">•••</span></div>')
def post(x, y, w, img, text='', s=1, pos='center', foot='1,284 likes', sponsored=False, bg=None):
    h = round(w * 5 / 4)
    if img and text:
        ph = round(h * .62)
        media = (f'<div style="width:{w}px;height:{h}px;background:{bg or "#2a1d16"}"><img src="{art(img)}" style="display:block;width:100%;height:{ph}px;object-fit:cover;object-position:{pos}">'
                 f'<div style="padding:{18*s}px {20*s}px;{SERIF};color:{"#2a1d16" if bg else "#f6efe3"};font-size:{30*s}px;line-height:1.08">{text}</div></div>')
    else:
        media = (f'<div style="position:relative;width:{w}px;height:{h}px;background:{bg or "#000"}">' + (f'<img src="{art(img)}" style="width:100%;height:100%;object-fit:cover;object-position:{pos}">' if img else '') +
                 (f'<div style="{P}left:{22*s}px;right:{22*s}px;bottom:{22*s}px;{SERIF};color:{INK};font-size:{40*s}px;line-height:1.05">{text}</div>' if text else '') + '</div>')
    sp = f'<span style="font-size:{12*s}px;color:{MUTE}">Sponsored</span>' if sponsored else ''
    footer = f'<div style="padding:{12*s}px {14*s}px;display:flex;justify-content:space-between;font-size:{14*s}px;color:{INK}"><b style="font-weight:600">{foot}</b>{sp}</div>'
    return f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;background:#fff;border-radius:{14*s}px;overflow:hidden">{head(s)}{media}{footer}</div>'
def window(src, x, y, w, ratio, title, s=1):
    h = round(w / ratio); bar = round(40 * s)
    return (f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;height:{h+bar}px;border-radius:{14*s}px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.08)">'
            f'<div style="height:{bar}px;background:#f3eee6;display:flex;align-items:center;gap:{8*s}px;padding:0 {14*s}px;font-size:{14*s}px;color:{MUTE}">'
            + ''.join(f'<i style="width:{11*s}px;height:{11*s}px;border-radius:50%;background:{c}"></i>' for c in ['#ff5f57', '#febc2e', '#28c840']) +
            f'<span style="margin:0 auto">{title}</span></div><img src="{art(src)}" style="display:block;width:100%;height:{h}px;object-fit:cover;object-position:top"></div>')
def chip(x, y, k, t, s=1, bg=YEL, fg=INK):
    return f'<div style="{P}left:{x}px;top:{y}px;background:{bg};color:{fg};border-radius:{12*s}px;padding:{14*s}px {18*s}px"><div style="font-size:{12.5*s}px;letter-spacing:.1em;font-weight:600;opacity:.75">{k}</div><div style="font-size:{20*s}px;font-weight:600;margin-top:{2*s}px">{t}</div></div>'
D, Ph = (1600, 1200), (1074, 1380)
J = []
# 1 Content calendar
J.append(('tile-calendar.jpg', *D, '#3a2516', window('s-cal.png', 580, 420, 960, 1.647, 'April content plan') + chip(520, 880, 'REEL · FRIDAY 7:00', 'The crumb shot')))
J.append(('tile-calendar-phone.jpg', *Ph, '#3a2516', window('s-cal.png', 22, 480, 1030, 1.647, 'April content plan', 1.2) + chip(32, 1150, 'REEL · FRIDAY 7:00', 'The crumb shot', 1.25)))
# 2 Posts and carousels: a three-slide carousel, slide dots below
def carousel(x, y, w, s=1):
    g = round(18 * s)
    out = (post(x, y, w, 'photo-bread1.jpg', 'Baked at 4 am.<br>Gone by noon.', s, 'center 60%') +
           post(x + w + g, y, w, 'photo-bread2.jpg', 'Feed the<br>starter.', s, 'center 55%', '1 of 4 steps', bg='#f2c55c') +
           post(x + 2 * (w + g), y, w, '', 'Sourdough<br>in four<br>slow steps.', s, foot='Save for the weekend', bg='#f2c55c'))
    dots = ''.join(f'<i style="display:inline-block;width:{10*s}px;height:{10*s}px;border-radius:50%;margin:0 {5*s}px;background:{"#fff" if i == 0 else "rgba(255,255,255,.4)"}"></i>' for i in range(3))
    return out + f'<div style="{P}left:{x}px;width:{3*w+2*g}px;top:{y + round(w*5/4) + round(130*s)}px;text-align:center">{dots}</div>'
J.append(('tile-posts.jpg', *D, '#8a5a12', carousel(590, 400, 300)))
J.append(('tile-posts-phone.jpg', *Ph, '#8a5a12', carousel(32, 470, 324, 1.0)))
# 3 Reels and short video: a reel playing on the phone
def reel_screen(fn):
    return fn
J.append(('tile-reels.jpg', *D, '#2a1d16', iphone('reel-loaf.png', 1080, 390, 380) + chip(700, 800, 'REEL · 0:18', '24.1k plays', 1, '#fff')))
J.append(('tile-reels-phone.jpg', *Ph, '#2a1d16', iphone('reel-loaf.png', 300, 460, 440)))
# 4 Paid social creative: three ad versions and how each did
def variants(x, y, w, s=1):
    g = round(18 * s); out = ''
    for i, (img, t, pos, ctr, win) in enumerate([('photo-bread1.jpg', 'Bread worth<br>waking up for.', 'center 60%', '1.8%', False), ('photo-bread3.jpg', 'Look at<br>that crumb.', 'center 60%', '2.6%', False), ('photo-bread2.jpg', 'Friday is<br>loaf day.', 'center 55%', '3.4%', True)]):
        xx = x + i * (w + g)
        out += post(xx, y, w, img, t, s, pos, f'Click rate {ctr}', True)
        tag = f'<div style="{P}left:{xx}px;top:{y - round(42*s)}px;font-size:{15*s}px;font-weight:600;color:{"#1d1a10" if win else "#fff"};background:{"#f2c55c" if win else "rgba(255,255,255,.18)"};border-radius:99px;padding:{6*s}px {12*s}px">Version {"ABC"[i]}{" · Winner" if win else ""}</div>'
        out += tag
    return out
J.append(('tile-paid.jpg', *D, '#4a5418', variants(590, 460, 300)))
J.append(('tile-paid-phone.jpg', *Ph, '#4a5418', variants(32, 540, 324, 1.0)))
# 5 Campaign concepts: the concept board
def board(x, y, w, s=1):
    h = round(w * .62)
    return (f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:#f6efe3;border-radius:{16*s}px;padding:{22*s}px;display:grid;grid-template-columns:1.25fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:{14*s}px">'
            f'<div style="grid-row:span 2;background:{YEL};border-radius:{10*s}px;padding:{24*s}px;display:flex;flex-direction:column;justify-content:space-between"><div style="font-size:{13*s}px;letter-spacing:.12em;font-weight:600;color:{INK}">CAMPAIGN · LOAF CLUB</div><div style="{SERIF};font-size:{56*s}px;line-height:.98;color:{INK}">Friday<br>is loaf<br>day.</div></div>'
            f'<div style="border-radius:{10*s}px;overflow:hidden"><img src="{art("photo-bread1.jpg")}" style="width:100%;height:100%;object-fit:cover"></div>'
            f'<div style="border-radius:{10*s}px;overflow:hidden"><img src="{art("photo-bread3.jpg")}" style="width:100%;height:100%;object-fit:cover;object-position:center 60%"></div>'
            f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:{8*s}px">' + ''.join(f'<div style="background:{c};border-radius:{8*s}px"></div>' for c in ['#2a1d16', YEL, '#c9733a', '#efe3cc']) + '</div>'
            f'<div style="background:#2a1d16;color:#f6efe3;border-radius:{10*s}px;padding:{18*s}px;font-size:{17*s}px;line-height:1.35"><b style="font-size:{12.5*s}px;letter-spacing:.1em;color:{YEL}">THE IDEA</b><br>One loaf held back every Friday for members. Posts, reels and a window poster.</div></div>')
J.append(('tile-campaign.jpg', *D, '#7a3a1c', board(570, 440, 980)))
J.append(('tile-campaign-phone.jpg', *Ph, '#7a3a1c', board(32, 500, 1010, 1.05)))
# 6 Publishing and reporting
J.append(('tile-reporting.jpg', *D, '#1f3a3a', window('s-report.png', 580, 420, 960, 1.6, 'April report') + chip(520, 900, 'TOP POST · 18.4K REACH', 'Friday is loaf day', 1, '#fff')))
J.append(('tile-reporting-phone.jpg', *Ph, '#1f3a3a', window('s-report.png', 22, 480, 1030, 1.6, 'April report', 1.2) + chip(32, 1150, 'TOP POST · 18.4K REACH', 'Friday is loaf day', 1.25, '#fff')))
if __name__ == '__main__':
    render(J, '../out/flat-social')
