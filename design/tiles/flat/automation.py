from render import render, art
from mvps import iphone, browser
P = 'position:absolute;'
INK = '#1d1530'; MUTE = '#6b6280'; VIO = '#5b3a8c'
def box(x, y, w, inner, s=1, pad=26, r=20, bg='#fff'):
    return f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;background:{bg};border-radius:{r*s}px;padding:{pad*s}px;color:{INK}">{inner}</div>'
def tick(s, c='#1f7a4d'):
    return f'<span style="width:{26*s}px;height:{26*s}px;border-radius:50%;background:{c};display:inline-grid;place-items:center;flex:none"><svg width="{14*s}" height="{14*s}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>'
def node(x, y, w, kicker, title, s=1, state='done'):
    end = tick(s) if state == 'done' else (f'<span style="font-size:{13*s}px;font-weight:600;background:#fff1d6;color:#8a5a00;border-radius:99px;padding:{4*s}px {10*s}px">Waiting</span>' if state == 'wait' else '')
    return (f'<div style="{P}left:{x}px;top:{y}px;width:{w}px;background:#fff;border-radius:{16*s}px;padding:{16*s}px {20*s}px;display:flex;align-items:center;gap:{14*s}px;color:{INK}">'
            f'<span style="width:{40*s}px;height:{40*s}px;border-radius:{11*s}px;background:#efe9fa;color:{VIO};display:grid;place-items:center;font-weight:700;font-size:{17*s}px;flex:none">F</span>'
            f'<div style="flex:1;min-width:0"><div style="font-size:{12.5*s}px;letter-spacing:.08em;color:{MUTE};font-weight:600">{kicker}</div><div style="font-size:{20*s}px;font-weight:600;margin-top:{2*s}px">{title}</div></div>{end}</div>')
def link(x, y, h, s=1):
    return f'<div style="{P}left:{x}px;top:{y}px;width:{3*s}px;height:{h}px;background:rgba(255,255,255,.55)"></div>'
def flow(x, y, w, steps, gap, s=1):
    out = ''; nh = round(72 * s)
    for i, (k, t, st) in enumerate(steps):
        yy = y + i * (nh + gap); out += node(x, yy, w, k, t, s, st)
        if i < len(steps) - 1: out += link(x + round(38 * s), yy + nh, gap, s)
    return out
D, Ph = (1600, 1200), (1074, 1380)
J = []
# 1 Process audit: the process map, timed, with the steps worth automating marked
def pmap(x, y, w, s=1):
    rows = [('Enquiry arrives by email', '2 min', False), ('Details copied into the sheet', '6 min', True), ('Stock checked by hand', '4 min', False), ('Quote written from scratch', '18 min', True), ('Reply chased after two days', '9 min', True)]
    li = ''.join(f'<div style="display:flex;align-items:center;gap:{12*s}px;padding:{13*s}px 0;border-top:1px solid #eee8f5;font-size:{18*s}px">'
                 f'<b style="width:{30*s}px;color:{VIO};font-weight:700">{i+1}</b><span style="flex:1">{t}</span><span style="color:{MUTE};width:{70*s}px;text-align:right">{m}</span>'
                 + (f'<span style="font-size:{12.5*s}px;font-weight:600;background:#e8f7ee;color:#1f7a4d;border-radius:99px;padding:{4*s}px {10*s}px;width:{94*s}px;text-align:center">Automate</span>' if a else f'<span style="width:{94*s}px"></span>') + '</div>'
                 for i, (t, m, a) in enumerate(rows))
    head = f'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:{10*s}px"><b style="font-size:{22*s}px">Quote process</b><span style="font-size:{15*s}px;color:{MUTE}">39 min per enquiry</span></div>'
    foot = f'<div style="margin-top:{14*s}px;background:#2a1748;color:#fff;border-radius:{12*s}px;padding:{14*s}px {18*s}px;font-size:{17*s}px"><b style="font-size:{24*s}px">27 h</b>&nbsp; a week the computer could do</div>'
    return box(x, y, w, head + li + foot, s)
J.append(('tile-audit.jpg', *D, '#2a1748', pmap(600, 420, 900)))
J.append(('tile-audit-phone.jpg', *Ph, '#2a1748', pmap(32, 480, 1010, 1.25)))
# 2 Lead and enquiry automation: the flow, and the phone it lands on
LS = [('NEW ENQUIRY', 'Priya Shah wants a quote', 'done'), ('SCORED', 'Hot lead, sent to Sam', 'done'), ('REPLY', 'Three call times offered', 'done'), ('BOOKED', 'Call on Thursday, 10:30', 'done')]
J.append(('tile-leads.jpg', *D, '#1e2552', flow(600, 440, 520, LS, 46) + iphone('lead.png', 1190, 400, 340)))
J.append(('tile-leads-phone.jpg', *Ph, '#1e2552', flow(32, 500, 560, LS, 54, 1.08) + iphone('lead.png', 640, 470, 400)))
# 3 Internal dashboards: the dashboard, and the report it sends itself
sched = lambda x, y, w, s=1: box(x, y, w, f'<div style="font-size:{12.5*s}px;letter-spacing:.08em;color:#b8a6e0;font-weight:600">SCHEDULED</div><div style="font-size:{22*s}px;font-weight:600;margin-top:{4*s}px">Every Monday at 8:00</div><div style="font-size:{15*s}px;color:#cfc6e6;margin-top:{4*s}px">Sent to the leadership group with a short summary</div>', s, 20, 16, '#2a1748').replace(f'color:{INK}', 'color:#fff')
J.append(('tile-dashboards.jpg', *D, '#3b1f4f', browser('fdash.png', 640, 420, 900, 600, 'reports.flowdesk.example') + sched(560, 900, 380)))
J.append(('tile-dashboards-phone.jpg', *Ph, '#3b1f4f', browser('fdash.png', 22, 480, 1030, 690, 'reports.flowdesk.example') + sched(32, 1120, 520, 1.15)))
# 4 Document and data extraction: an invoice in, filed fields out
def invoice(x, y, w, s=1):
    rows = ''.join(f'<div style="display:flex;justify-content:space-between;padding:{8*s}px 0;border-top:1px solid #eee;font-size:{15*s}px"><span>{a}</span><span>{b}</span></div>' for a, b in [('Paper, A4, 20 boxes', '£480.00'), ('Toner cartridges, black', '£132.00'), ('Desk lamps', '£120.00')])
    inner = (f'<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><b style="font-size:{19*s}px;font-family:Georgia,serif">Greenleaf Supplies Ltd</b><div style="font-size:{13*s}px;color:#888;margin-top:{3*s}px">Unit 4, Mill Lane</div></div><b style="font-size:{17*s}px;letter-spacing:.12em;color:#555">INVOICE</b></div>'
             f'<div style="font-size:{14*s}px;color:#555;margin:{14*s}px 0 {10*s}px;line-height:1.6">No. GL-20418<br>3 April 2026</div>{rows}'
             f'<div style="display:flex;justify-content:space-between;padding-top:{10*s}px;border-top:2px solid #222;font-size:{17*s}px;font-weight:700"><span>Total due</span><span>£732.00</span></div>')
    return box(x, y, w, inner, s, 24, 6, '#fdfcf8')
def fields(x, y, w, s=1):
    f = [('Supplier', 'Greenleaf Supplies Ltd'), ('Invoice number', 'GL-20418'), ('Date', '3 April 2026'), ('Total', '£732.00')]
    li = ''.join(f'<div style="display:flex;align-items:center;gap:{12*s}px;padding:{10*s}px 0;border-top:1px solid #eee8f5"><div style="flex:1"><div style="font-size:{12.5*s}px;color:{MUTE};letter-spacing:.06em">{a.upper()}</div><div style="font-size:{17*s}px;font-weight:600">{b}</div></div>{tick(s*.9)}</div>' for a, b in f)
    return box(x, y, w, f'<b style="font-size:{19*s}px">What we read</b>' + li + f'<div style="margin-top:{12*s}px;background:{VIO};color:#fff;border-radius:{10*s}px;padding:{12*s}px;text-align:center;font-size:{16*s}px;font-weight:600">Filed in accounts</div>', s, 22, 18)
J.append(('tile-documents.jpg', *D, '#0f3b3b', invoice(590, 450, 450) + fields(1080, 410, 440)))
J.append(('tile-documents-phone.jpg', *Ph, '#0f3b3b', invoice(32, 480, 548, 1.05) + fields(600, 560, 442, 1.0)))
# 5 AI chatbots and voice assistants: the assistant, with where each answer came from
src = lambda x, y, w, s=1: box(x, y, w, f'<div style="font-size:{12.5*s}px;letter-spacing:.08em;color:{MUTE};font-weight:600">ANSWERED FROM</div>' + ''.join(f'<div style="display:flex;gap:{10*s}px;align-items:center;margin-top:{10*s}px;font-size:{17*s}px"><span style="width:{8*s}px;height:{22*s}px;border-radius:3px;background:{VIO}"></span>{t}</div>' for t in ['Staff handbook, page 14', 'Leave policy 2026']), s, 22, 16)
J.append(('tile-assistants.jpg', *D, '#2b2440', iphone('chat.png', 1150, 390, 360) + src(700, 700, 400)))
J.append(('tile-assistants-phone.jpg', *Ph, '#2b2440', iphone('chat.png', 560, 470, 440) + src(32, 760, 500, 1.15)))
# 6 Reports, proposals and approvals: the request on the phone, and its approval chain
def proposal(x, y, w, s=1):
    secs = [('What you asked for', 'Four laptops for the design team, set up before 21 April.'), ('What we will deliver', 'Laptops, cases and setup, with a two-year warranty.'), ('Price', '£4,800, within the team budget.')]
    body = ''.join(f'<div style="padding:{12*s}px 0;border-top:1px solid #eee8f5"><div style="font-size:{15*s}px;font-weight:600;color:{VIO}">{i+1}&nbsp; {t}</div><div style="font-size:{16*s}px;color:#3b3450;margin-top:{3*s}px">{d}</div></div>' for i, (t, d) in enumerate(secs))
    head = (f'<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:{12.5*s}px;letter-spacing:.08em;color:{MUTE};font-weight:600">PROPOSAL · DRAFTED FROM THE CALL NOTES</div>'
            f'<div style="font-size:{22*s}px;font-weight:600;margin-top:{4*s}px">Laptops for the design team</div></div></div>')
    foot = (f'<div style="display:flex;gap:{8*s}px;margin-top:{12*s}px;font-size:{13.5*s}px;font-weight:600">'
            f'<span style="background:#e8f7ee;color:#1f7a4d;border-radius:99px;padding:{5*s}px {11*s}px">Manager approved</span>'
            f'<span style="background:#fff1d6;color:#8a5a00;border-radius:99px;padding:{5*s}px {11*s}px">With Finance</span></div>')
    return box(x, y, w, head + f'<div style="margin-top:{12*s}px">{body}</div>' + foot, s, 24, 18)
J.append(('tile-approvals.jpg', *D, '#3a1430', proposal(580, 470, 540) + iphone('f-approve.png', 1180, 400, 340)))
J.append(('tile-approvals-phone.jpg', *Ph, '#3a1430', iphone('f-approve.png', 600, 470, 420) + proposal(32, 640, 520, 1.08)))
if __name__ == '__main__':
    render(J, '../out/flat-auto')
