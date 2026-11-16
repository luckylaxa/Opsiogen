from render import render, art
from mvps import iphone, browser
P = 'position:absolute;'
INK = '#121a33'; MUTE = '#66708a'; BLUE = '#2346d6'; ORANGE = '#f26b1d'
def box(x, y, w, inner, s=1, pad=24, r=18, bg='#fff', fg=INK):
    return f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;background:{bg};color:{fg};border-radius:{r*s}px;padding:{pad*s}px">{inner}</div>'
def metric(x, y, k, v, sub, s=1, bg='#fff', fg=INK):
    return box(x, y, round(250 * s), f'<div style="font-size:{12.5*s}px;letter-spacing:.1em;color:{MUTE if bg == "#fff" else "rgba(255,255,255,.75)"};font-weight:600">{k}</div><div style="font-size:{40*s}px;font-weight:650;letter-spacing:-.02em;margin-top:{4*s}px">{v}</div><div style="font-size:{14*s}px;color:#1f8a4c;font-weight:600;margin-top:{2*s}px">{sub}</div>', s, 20, 16, bg, fg)
D, Ph = (1600, 1200), (1074, 1380)
J = []
# 1 Paid social ads: the ad in the feed, and what a test ride cost
J.append(('tile-social.jpg', *D, '#10245c', iphone('d-feed.png', 1140, 390, 380) + metric(780, 700, 'COST PER TEST RIDE', '£6.40', '↓ 38% on last month')))
J.append(('tile-social-phone.jpg', *Ph, '#10245c', iphone('d-feed.png', 560, 470, 440) + metric(32, 760, 'COST PER TEST RIDE', '£6.40', '↓ 38% on last month', 1.25)))
# 2 Search ads: the results page, with our ad on top
def serp(x, y, w, s=1):
    q = f'<div style="display:flex;align-items:center;gap:{12*s}px;border:1px solid #dfe3ee;border-radius:99px;padding:{12*s}px {18*s}px;font-size:{18*s}px"><span style="width:{16*s}px;height:{16*s}px;border:{2.5*s}px solid {MUTE};border-radius:50%"></span>electric bike for commuting</div>'
    ad = (f'<div style="margin-top:{20*s}px"><div style="font-size:{14*s}px;color:{MUTE}"><b style="color:{INK}">Sponsored</b> · peloro.example/commute</div>'
          f'<div style="font-size:{25*s}px;color:#1a3fbf;margin-top:{4*s}px">Peloro Electric Bikes: Hills, Flattened</div>'
          f'<div style="font-size:{16*s}px;color:#3a4256;margin-top:{6*s}px;line-height:1.4">80 km on one charge and a motor that makes the ride home easy. Book a test ride at your nearest shop this weekend.</div>'
          f'<div style="display:flex;gap:{10*s}px;margin-top:{12*s}px">' + ''.join(f'<span style="font-size:{14*s}px;color:#1a3fbf;border:1px solid #d6dcf0;border-radius:99px;padding:{6*s}px {12*s}px">{t}</span>' for t in ['Book a test ride', 'Compare models', 'Pay monthly']) + '</div></div>')
    rest = ''.join(f'<div style="margin-top:{18*s}px;opacity:.55"><div style="height:{10*s}px;width:{w*.35}px;background:#d9deea;border-radius:5px"></div><div style="height:{16*s}px;width:{w*.7}px;background:#c8d0e4;border-radius:5px;margin-top:{8*s}px"></div></div>' for _ in range(1))
    return box(x, y, w, q + ad, s, 26, 18)
J.append(('tile-search.jpg', *D, '#1d2f6b', serp(570, 430, 970, 1.25) + metric(1270, 840, 'CLICK RATE', '7.9%', '↑ 2.1 points', 1)))
J.append(('tile-search-phone.jpg', *Ph, '#1d2f6b', serp(32, 480, 1010, 1.3) + metric(32, 960, 'CLICK RATE', '7.9%', '↑ 2.1 points', 1.25)))
# 3 SEO: the visibility report
J.append(('tile-seo.jpg', *D, '#0e1a3d', browser('d-seo.png', 620, 430, 920, 575, 'search visibility report')))
J.append(('tile-seo-phone.jpg', *Ph, '#0e1a3d', browser('d-seo.png', 22, 490, 1030, 690, 'search visibility report')))
# 4 Lead generation campaigns: the landing page, and the bookings it brings in
toast = lambda x, y, s=1: box(x, y, round(380 * s), f'<div style="display:flex;gap:{12*s}px;align-items:center"><span style="width:{36*s}px;height:{36*s}px;border-radius:50%;background:#e7f6ec;color:#1f8a4c;display:grid;place-items:center;font-weight:700;font-size:{18*s}px">✓</span><div><div style="font-size:{17*s}px;font-weight:600">New test ride booked</div><div style="font-size:{14*s}px;color:{MUTE}">Saturday, Leeds · 2 min ago</div></div></div>', s, 18, 14)
J.append(('tile-leads.jpg', *D, '#c4561b', browser('d-landing.png', 620, 420, 920, 555, 'peloro.example/test-ride') + toast(540, 900)))
J.append(('tile-leads-phone.jpg', *Ph, '#c4561b', browser('d-landing.png', 22, 480, 1030, 665, 'peloro.example/test-ride') + toast(32, 1180, 1.2)))
# 5 Email and retargeting: the email, and the sequence it sits in
def email(x, y, w):
    h = round(w / 0.726)
    return f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;height:{h}px;border-radius:14px;overflow:hidden;background:#fff"><img src="{art("d-email.png")}" style="width:100%;height:100%;object-fit:cover;object-position:top"></div>'
def seq(x, y, s=1, vertical=False):
    st = [('DAY 1', 'Looked at the Commuter', False), ('DAY 3', 'Still thinking it over?', True), ('DAY 7', 'Ride it this Saturday', False)]
    out = ''
    for i, (d, t, on) in enumerate(st):
        xx, yy = (x, y + i * round(92 * s)) if vertical else (x, y)
        out += box(xx, yy, round(300 * s), f'<div style="font-size:{12.5*s}px;letter-spacing:.1em;font-weight:600;color:{"#fff" if on else MUTE}">{d} · EMAIL</div><div style="font-size:{17*s}px;font-weight:600;margin-top:{3*s}px">{t}</div>', s, 16, 12, BLUE if on else '#fff', '#fff' if on else INK)
    return out
J.append(('tile-email.jpg', *D, '#23314f', email(1100, 400, 420) + seq(700, 560, 1, True)))
J.append(('tile-email-phone.jpg', *Ph, '#23314f', email(500, 470, 540) + seq(32, 640, 1.15, True)))
# 6 Analytics and reporting: from visit to sale
def funnel(x, y, w, s=1):
    rows = [('Visits', '24,600', 1.0, '#121a33'), ('Leads', '428', .62, BLUE), ('Test rides', '231', .44, '#4c6ef5'), ('Bikes sold', '64', .28, ORANGE)]
    li = ''.join(f'<div style="display:flex;align-items:center;gap:{14*s}px;margin-top:{12*s}px"><div style="width:{(w-2*24*s-140*s)*p}px;height:{40*s}px;background:{c};border-radius:{8*s}px"></div><div style="font-size:{16*s}px;color:{MUTE}">{k}<br><b style="font-size:{20*s}px;color:{INK}">{v}</b></div></div>' for k, v, p, c in rows)
    return box(x, y, w, f'<div style="font-size:{12.5*s}px;letter-spacing:.1em;color:{MUTE};font-weight:600">CAMPAIGNS · APRIL</div><div style="font-size:{24*s}px;font-weight:600;margin-top:{4*s}px">From visit to sale</div>' + li, s, 24, 18)
J.append(('tile-analytics.jpg', *D, '#2a2263', funnel(600, 420, 620) + metric(1270, 640, 'RETURN ON AD SPEND', '5.2×', '↑ from 3.9×')))
J.append(('tile-analytics-phone.jpg', *Ph, '#2a2263', funnel(32, 480, 1010, 1.25) + metric(32, 1000, 'RETURN ON AD SPEND', '5.2×', '↑ from 3.9×', 1.25)))
if __name__ == '__main__':
    render(J, '../out/flat-dm')
