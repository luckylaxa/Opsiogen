from render import render, art
def iphone(src, x, y, w, extra=''):
    return f'<div class=iphone style="left:{x}px;top:{y}px;width:{w}px"><div class=in><div class=sc><div class=isl></div><img class=scr src="{art(src)}"></div></div></div>{extra}'
def mac(src, x, y, w):
    return f'<div class=mac style="left:{x}px;top:{y}px;width:{w}px"><div class=lid><div class=sc><div class=notch></div><img class=scr src="{art(src)}"></div></div><div class=base></div></div>'
def ipad(src, x, y, w, h, port=False):
    return f'<div class="ipad{" port" if port else ""}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><div class=sc><img class=scr src="{art(src)}"></div></div>'
def display(src, x, y, w):
    return f'<div class=display style="left:{x}px;top:{y}px;width:{w}px"><div class=scr0><div class=blk><div class=sc><img class=scr src="{art(src)}"></div></div></div><div class=neck></div><div class=foot></div></div>'
def browser(src, x, y, w, h, url):
    return f'<div class=browser style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><div class=bar><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span>{url}</span></div><div class=sc><img class=scr src="{art(src)}"></div></div>'
def chip(x, y, w, title, sub, s=1):
    return (f'<div class=card style="left:{x}px;top:{y}px;width:{w}px;padding:{22*s}px {26*s}px;border-radius:{20*s}px">'
            f'<div style="font-size:{15*s}px;color:#8a8279;font-weight:500;letter-spacing:.02em">{sub}</div>'
            f'<div style="font-size:{26*s}px;font-weight:650;color:#1e1b18;margin-top:{4*s}px;letter-spacing:-.01em">{title}</div></div>')
D, P = (1600, 1200), (1074, 1380)
jobs = [
 ('tile-mvp.jpg', *D, '#7a2a1b', mac('o-mvp.png', 560, 430, 1010)),
 ('tile-mvp-phone.jpg', *P, '#7a2a1b', mac('o-mvp.png', 17, 500, 1040)),
 ('tile-ai.jpg', *D, '#3b1456', ipad('o-ai.png', 590, 430, 950, 665)),
 ('tile-ai-phone.jpg', *P, '#3b1456', ipad('o-ai.png', 27, 500, 1020, 714)),
 ('tile-portal.jpg', *D, '#5a4535', browser('o-portal.png', 580, 440, 960, 640, 'portal.orderly.example')),
 ('tile-portal-phone.jpg', *P, '#5a4535', browser('o-portal.png', 22, 500, 1030, 720, 'portal.orderly.example')),
 ('tile-dashboard.jpg', *D, '#26323f', display('o-dash.png', 600, 410, 930)),
 ('tile-dashboard-phone.jpg', *P, '#26323f', display('o-dash.png', 22, 500, 1030)),
 ('tile-booking.jpg', *D, '#6b3313', iphone('o-book-phone.png', 1060, 370, 380) + chip(640, 820, 380, 'Wed 15 April, 8 to 10 am', 'DELIVERY BOOKED')),
 ('tile-booking-phone.jpg', *P, '#6b3313', iphone('o-book-phone.png', 322, 470, 430)),
 ('tile-internal.jpg', *D, '#0f3a25', ipad('o-pick.png', 970, 380, 570, 762, port=True) + chip(600, 860, 330, '5 of 8 picked', 'HARBOUR CAFÉ · VAN 2')),
 ('tile-internal-phone.jpg', *P, '#0f3a25', ipad('o-pick.png', 202, 470, 670, 880, port=True)),
]
if __name__ == '__main__':
    render(jobs, '../out/flat-mvps')
