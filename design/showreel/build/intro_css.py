"""Writes the character intro's keyframes for src/app/globals.css (the `@keyframes intro-*` rules after `.intro`).
Usage: python3 intro_css.py, then paste its output over the old keyframes."""
import math
D = 1.62          # the whole intro, seconds
B = 1.04          # intro-bg ends here: the page's own entrance starts, so it is already rising when the lens opens
EIN, EOUT = "cubic-bezier(0.333, 0, 0.667, 0.333)", "cubic-bezier(0.333, 0.667, 0.667, 1)"
EIO, SNAP = "cubic-bezier(0.45, 0, 0.55, 1)", "cubic-bezier(0.22, 0.8, 0.35, 1)"
def P(t, d=D):
    v = round(t / d * 100, 3)
    return ("%g" % v) + "%"
def kf(name, rows, d=D):
    out = [f"@keyframes {name} {{"]
    for t, decl, ease in rows:
        sel = ", ".join(P(x, d) for x in (t if isinstance(t, tuple) else (t,)))
        e = f" animation-timing-function: {ease};" if ease else ""
        out.append(f"  {sel} {{ {decl};{e} }}")
    out.append("}")
    return "\n".join(out)
css = []
# Drop from above the screen, a bounce, one hop, land facing the visitor.
css.append(kf("intro-hop", [
    (0, "transform: translateY(-62vh) rotate(0deg)", EIN),
    (.30, "transform: translateY(0) rotate(0deg)", "linear"),
    (.35, "transform: translateY(0) rotate(0deg)", EOUT),
    (.63, "transform: translateY(-15vh) rotate(-5deg)", EIN),
    ((.91, D), "transform: translateY(0) rotate(0deg)", None)]))
# A solid character (Lucky): no squash or stretch. It tips as it hits the floor and rocks as it lands, about its middle.
css.append(kf("intro-rock", [
    (0, "transform: rotate(0deg)", "linear"),
    (.30, "transform: rotate(0deg)", EOUT),
    (.36, "transform: rotate(-10deg)", EIO),
    (.45, "transform: rotate(6deg)", EIO),
    (.54, "transform: rotate(-2deg)", EIO),
    (.62, "transform: rotate(0deg)", "linear"),
    (.91, "transform: rotate(0deg)", EOUT),
    (.96, "transform: rotate(8deg)", EIO),
    (1.02, "transform: rotate(-3deg)", EIO),
    ((1.07, D), "transform: rotate(0deg)", None)]))
# One full turn in the air: the 12 pictures of the strip, a little slower at the start and end.
t0, t1, N = .40, .88, 12
p = lambda u: .4 * u + .6 * (1 - math.cos(math.pi * u)) / 2
def inv(y):
    a, b = 0.0, 1.0
    for _ in range(60):
        m = (a + b) / 2
        a, b = (m, b) if p(m) < y else (a, m)
    return (a + b) / 2
rows = [(0, "transform: translateX(0)", "step-end")]
for k in range(1, N):
    rows.append((t0 + (t1 - t0) * inv(k / N), "transform: translateX(-%g%%)" % round(100 * k / N, 4), "step-end"))
rows.append(((t1, D), "transform: translateX(0)", None))
css.append(kf("intro-turn", rows))
# The pool of light on the floor: bigger and brighter the nearer the character is.
css.append(kf("intro-glow", [
    (0, "transform: scale(0.35); opacity: 0", EIN),
    (.30, "transform: scale(1.1); opacity: 1", "linear"),
    (.35, "transform: scale(1.15); opacity: 1", EOUT),
    (.63, "transform: scale(0.7); opacity: 0.5", EIN),
    (.91, "transform: scale(1.1); opacity: 1", EOUT),
    (.98, "transform: scale(1); opacity: 0.9", EIO),
    ((1.08, D), "transform: scale(0.9); opacity: 0", None)]))
# The rush: a small pull back, then faster and faster at the screen until the lens is wider than it.
a, b, S0, S1 = 1.10, D, .86, 30
rows = [(0, "transform: scale(1)", "linear"), (1.00, "transform: scale(1)", SNAP)]
for u in (0, .25, .45, .6, .72, .82, .9, .96, 1):
    s = S0 * (S1 / S0) ** (u ** 1.4)
    rows.append((a + (b - a) * u, "transform: scale(%g)" % round(s, 3), "linear" if u < 1 else None))
css.append(kf("intro-zoom", rows))
# Hand-over before the rush: the dark backdrop gives way to the one around the lens (both dark, so nothing shows).
css.append(kf("intro-bg", [(0, "opacity: 1", "step-end"), (B, "opacity: 0", None)], B))
css.append(kf("intro-on", [(0, "opacity: 0", "step-end"), ((1.02, D), "opacity: 1", None)]))
# The glass clears: the page shows through the lens.
css.append(kf("intro-glass", [(0, "opacity: 1", "linear"), (1.12, "opacity: 1", EIO), ((1.28, D), "opacity: 0", None)]))
print("\n".join(css))
