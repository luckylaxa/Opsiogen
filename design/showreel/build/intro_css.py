"""Writes the character intro's CSS for src/app/globals.css: the comment that starts the intro's rules, the `.intro`
rules and their keyframes (everything from "First-visit intro" to the end of `@keyframes intro-glass`).
The intro (Lucky, 25 Nov): on a black screen our character pops in, crouches, jumps, does a backflip in the air,
comes out of it facing the visitor, then flies at the screen and the page opens through its visor. Its pictures come
from design/hero/character/v3/web/intro.cjs and intro_pictures.py, which also print the visor's place (VX..FACE below).
Usage: python3 intro_css.py, then paste its output over the old intro rules in globals.css."""
D = 1.60          # the whole intro, seconds
B = 1.04          # intro-bg ends here (the page's own entrance starts; the dark around the visor has taken over)
EIN, EOUT = "cubic-bezier(0.333, 0, 0.667, 0.333)", "cubic-bezier(0.333, 0.667, 0.667, 1)"
EIO, SNAP = "cubic-bezier(0.45, 0, 0.55, 1)", "cubic-bezier(0.22, 0.8, 0.35, 1)"
LAUNCH = "cubic-bezier(0.2, 0.75, 0.4, 1)"
N = 11            # pictures in the strip: crouch, jump, then the backflip in 9
VX, VY, RX, RY = 0.5, 0.468, 0.25, 0.1461          # the visor in the box (centre, radii), from the front picture
FACE = (0.2469, 0.3187, 0.5062, 0.2984)            # the visor picture's box (left, top, width, height)
def P(t, d=D):
    return ("%g" % round(t / d * 100, 3)) + "%"
def kf(name, rows, d=D):
    out = [f"@keyframes {name} {{"]
    for t, decl, ease in rows:
        sel = ", ".join(P(x, d) for x in (t if isinstance(t, tuple) else (t,)))
        e = f" animation-timing-function: {ease};" if ease else ""
        out.append(f"  {sel} {{ {decl};{e} }}")
    out.append("}")
    return "\n".join(out)
Y = lambda k: "transform: translateY(calc(var(--size) * %g))" % k if k else "transform: translateY(0)"
pct = lambda v: "%g%%" % round(v * 100, 2)
base = f"""
/*
 * First-visit intro (design system; components/motion/IntroLoader.tsx, started by INTRO_SCRIPT in lib/theme.ts).
 * On a black screen our character (a solid one: it never changes shape) pops in, crouches, jumps and does a backflip
 * in the air, comes out of it facing the visitor, then flies at the screen and the page opens through its visor
 * (Lucky, 25 Nov). Only transforms and opacity move, so it stays smooth while the page is still busy loading.
 * {D:g} s in all; `intro-bg` ends at {B:g} s, when the page's own entrance starts, so it is already rising when the visor
 * opens. The backdrop is pure black because the flip's pictures are drawn on it (no transparency, so a third of the
 * size): any other dark would show their square. The rules come from design/showreel/build/intro_css.py.
 */
.intro {{
  /* The character's box, about as big as the Home character's own 3D canvas. */
  --size: clamp(157px, 16.1vw, 241px);
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: none;
  overflow: hidden;
  /* Never left covering the page if scripts fail part-way. */
  animation: intro-failsafe 0s linear 4.5s forwards;
}}
[data-intro] .intro {{
  display: block;
}}
@keyframes intro-failsafe {{
  to {{
    visibility: hidden;
  }}
}}
.intro-done .intro {{
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.25s,
    visibility 0s 0.25s;
}}
/* Its character layer is made visible while it plays (below), so it must be hidden again by name when it ends:
   left visible, the zoomed layer would cover the page, invisible, and take every click and hover. */
.intro-go.intro-done .intro__zoom {{
  visibility: hidden;
  transition: visibility 0s 0.25s;
}}
.intro__bg {{
  position: absolute;
  inset: 0;
  background: #000;
}}
/* The character's box in the middle of the screen, and the floor under it; they wait out of sight until the
   pictures are in. The box carries the jump; the lens inside it the rush, about the visor. */
.intro__zoom,
.intro__floor {{
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size);
  height: var(--size);
  margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
  visibility: hidden;
}}
.intro-go .intro__zoom,
.intro-go .intro__floor {{
  visibility: visible;
}}
.intro__lens,
.intro__pop,
.intro__front,
.intro__shell,
.intro__turn {{
  position: absolute;
  inset: 0;
}}
.intro__lens {{
  transform-origin: {pct(VX)} {pct(VY)};
}}
/* Takes over from the backdrop for the rush and grows with the character: dark all round, clear in the visor
   (a little wider than the visor, under the shell's rim). */
.intro__veil {{
  position: absolute;
  left: 50%;
  top: 50%;
  width: 160vmax;
  height: 160vmax;
  margin: -80vmax 0 0 -80vmax;
  background: radial-gradient(calc(var(--size) * {RX * 1.08:.4f}) calc(var(--size) * {RY * 1.08:.4f}) at 50% calc(50% - var(--size) * {VX - VY:.3f}), transparent 97%, #000 100%);
  opacity: 0;
}}
/* The character facing the visitor: its shell (the visor cut out) over the visor picture, which clears for the rush. */
.intro__face {{
  position: absolute;
  left: {pct(FACE[0])};
  top: {pct(FACE[1])};
  width: {pct(FACE[2])};
  height: {pct(FACE[3])};
}}
.intro__face,
.intro__shell {{
  background: center / 100% 100% no-repeat;
}}
/* The jump and the backflip: {N} pictures side by side, on the backdrop's own dark. */
.intro__turn {{
  overflow: hidden;
  opacity: 0;
}}
.intro__strip {{
  display: block;
  width: {N}00%;
  height: 100%;
  background: 0 0 / 100% 100% no-repeat;
}}
/* The pool of our colours on the floor, just below the character. */
.intro__glow {{
  position: absolute;
  left: 10%;
  top: 86%;
  width: 80%;
  height: 12%;
  background: linear-gradient(90deg, #35d4ff 4%, #5a7dff 26%, #b667ff 48%, #ff5fb4 70%, #ff9a3c 96%);
  -webkit-mask-image: radial-gradient(closest-side, #000 10%, transparent);
  mask-image: radial-gradient(closest-side, #000 10%, transparent);
  opacity: 0;
}}
.intro-go .intro__bg {{
  animation: intro-bg {B:g}s both;
}}
.intro-go .intro__zoom {{
  animation: intro-path {D:g}s both;
}}
.intro-go .intro__lens {{
  animation: intro-rush {D:g}s both;
}}
.intro-go .intro__veil {{
  animation: intro-on {D:g}s both;
}}
.intro-go .intro__pop {{
  animation: intro-pop {D:g}s both;
}}
.intro-go .intro__front {{
  animation: intro-front {D:g}s both;
}}
.intro-go .intro__face {{
  animation: intro-glass {D:g}s both;
}}
.intro-go .intro__turn {{
  animation: intro-flip {D:g}s both;
}}
.intro-go .intro__strip {{
  animation: intro-turn {D:g}s both;
}}
.intro-go .intro__glow {{
  animation: intro-glow {D:g}s both;
}}
@media (prefers-reduced-motion: reduce) {{
  .intro {{
    display: none !important;
  }}
}}
""".strip("\n")
css = [base]
# It pops in, crouches, jumps, hangs at the top through the backflip, drifts down a little as it turns to us,
# then swoops to the middle of the screen as it rushes at it.
css.append(kf("intro-path", [
    (0, Y(0), "linear"),
    (.22, Y(0), EIO),
    (.32, Y(.06), LAUNCH),
    (.50, Y(-.90), EOUT),
    (.66, Y(-.98), EIN),
    (.86, Y(-.90), "linear"),
    (.94, Y(-.86), EIO),
    (1.04, Y(-.76), EOUT),
    ((1.32, D), Y(0), None)]))
# The rush: a small pull back, then faster and faster at the screen until the visor is wider than it.
a, b, S0, S1 = 1.04, D, .88, 30
rows = [(0, "transform: scale(1)", "linear"), (.94, "transform: scale(1)", SNAP)]
for u in (0, .25, .45, .6, .72, .82, .9, .96, 1):
    s = S0 * (S1 / S0) ** (u ** 1.4)
    rows.append((a + (b - a) * u, "transform: scale(%g)" % round(s, 3), "linear" if u < 1 else None))
css.append(kf("intro-rush", rows))
# It pops in, a little past its size and back.
css.append(kf("intro-pop", [
    (0, "transform: scale(0.4); opacity: 0", EOUT),
    (.14, "transform: scale(1.07); opacity: 1", EIO),
    ((.22, D), "transform: scale(1); opacity: 1", None)]))
# Facing the visitor at the start and the end; the strip in between.
css.append(kf("intro-front", [(0, "opacity: 1", "step-end"), (.22, "opacity: 0", "step-end"), ((.86, D), "opacity: 1", None)]))
css.append(kf("intro-flip", [(0, "opacity: 0", "step-end"), (.22, "opacity: 1", "step-end"), ((.86, D), "opacity: 0", None)]))
times = [.22, .32] + [.50 + .04 * i for i in range(9)]
rows = [(0, "transform: translateX(0)", "step-end")]
for k, t in enumerate(times):
    if k: rows.append((t, "transform: translateX(-%g%%)" % round(100 * k / N, 4), "step-end"))
rows.append(((.86, D), "transform: translateX(-%g%%)" % round(100 * (N - 1) / N, 4), None))
css.append(kf("intro-turn", rows))
# The pool of light: bigger and brighter the nearer the character is to the floor.
css.append(kf("intro-glow", [
    (0, "transform: scale(0.4); opacity: 0", EOUT),
    (.14, "transform: scale(1.05); opacity: 1", EIO),
    (.22, "transform: scale(1); opacity: 1", EIO),
    (.32, "transform: scale(1.12); opacity: 1", LAUNCH),
    (.50, "transform: scale(0.55); opacity: 0.45", "linear"),
    (.90, "transform: scale(0.6); opacity: 0.3", EIO),
    ((1.04, D), "transform: scale(0.6); opacity: 0", None)]))
# Hand-over before the rush: the dark around the visor comes on, then the backdrop goes (both dark, so nothing shows).
css.append(kf("intro-bg", [(0, "opacity: 1", "step-end"), (B, "opacity: 0", None)], B))
css.append(kf("intro-on", [(0, "opacity: 0", "step-end"), ((1.0, D), "opacity: 1", None)]))
# The visor clears: the page shows through it.
css.append(kf("intro-glass", [(0, "opacity: 1", "linear"), (1.12, "opacity: 1", EIO), ((1.26, D), "opacity: 0", None)]))
print("\n".join(css))
