"""Builds index.html: the scroll script and scene plan for the Home hero journey. Scroll shares are worked out here so the map and the scenes always agree."""
import html, pathlib
E = html.escape
OPEN, LEG, STOP, END = 0.6, 0.6, 0.8, 0.6            # length of each part, in screens of scroll (desktop)
stops = [
 dict(n=1, name="Brand", place="Coast road, early morning", sky="#ffd9a8,#9fd0f5",
  see="We catch up with a rider on a Torvi road bike, in Torvi kit. The camera rides along behind her and to one side.",
  char="Flies beside the rider with its eye on her. When the visitor stops scrolling it turns to face them.",
  head="A brand people know at a glance.", line="Name, logo, colours and voice, made to work everywhere your customers meet you.",
  btn=[("Brand services", "/services/ai-brand-services")],
  marks="The bike frame, the jersey and the bottle. Each lights up with a short label: Logo, Colours, Kit design.",
  swing="A few degrees only. A person on a bike cannot be turned freely, so the view shifts gently with the pointer.",
  make="One picture of the rider from behind. Brand marks come from the Torvi designs we already have."),
 dict(n=2, name="Websites and apps", place="Café terrace, mid-morning", sky="#9fd0f5,#cfe8fb",
  see="A customer at a terrace table orders from the Torvi shop on a laptop. A phone beside the cup shows the Torvi app.",
  char="Hovers over the table and looks at the laptop screen, then at the phone.",
  head="Websites and apps that take the order.", line="Designed and built to be easy on every screen, from the first tap to the thank-you page.",
  btn=[("Websites", "/services/ai-websites"), ("Product and apps", "/services/ai-mvps-business-apps")],
  marks="The laptop screen and the phone. On hover the screen brightens and the page scrolls slowly through our real design.",
  swing="About a third of a circle. The laptop and phone are real 3D objects, so the visitor can look round them.",
  make="One picture of the terrace with the table clear. Laptop and phone built in 3D, with our website and app designs on their screens."),
 dict(n=3, name="Print", place="Waterfront, midday", sky="#cfe8fb,#eaf5ff",
  see="An outdoor cycling show on the quay. The Torvi exhibition booth stands in the middle: back wall, counter, banner stands, brochures on the counter.",
  char="Circles slowly in front of the booth and looks up at the back wall.",
  head="Print that stops people walking past.", line="Booths, brochures and packaging, designed and made ready for the printer.",
  btn=[("Print and collateral", "/services/ai-print-collateral")],
  marks="The booth and the brochure stack. This is the showpiece of the journey.",
  swing="The widest of all: about two thirds of a circle round the booth, from the left banner to the right side of the counter.",
  make="One picture of the quay with an empty pitch. The booth built in 3D from flat panels carrying our Torvi artwork."),
 dict(n=4, name="Automation", place="Workshop yard, afternoon", sky="#ffe2ae,#f7b98a",
  see="A Torvi dispatch table in an open yard. An order arrives on a tablet, the label prints, the parcel's status changes, and nobody touches any of it. Behind, a mechanic works on a bike.",
  char="Watches the order move from tablet to label to parcel, following it with its eye.",
  head="The routine work runs by itself.", line="Orders, replies and reports handled automatically, so people do the work that needs people.",
  btn=[("AI automation", "/services/ai-automation")],
  marks="The tablet and the parcels. On hover the order plays through its three steps: Order received, Label printed, Customer told.",
  swing="About a third of a circle round the table.",
  make="One picture of the yard. Tablet, printer and parcels built in 3D; the order flow is a short screen animation we draw ourselves."),
 dict(n=5, name="Social and marketing", place="City street, dusk", sky="#f08a6a,#5b4a9a",
  see="A Torvi campaign on a lit bus shelter. Two people waiting see the same campaign on their phones.",
  char="Looks at the poster, then glances at the nearest phone.",
  head="Seen on the street and in the feed.", line="Campaigns, posts and ads that bring the right people to you.",
  btn=[("Social media", "/services/ai-social-media-marketing"), ("Digital marketing", "/services/digital-marketing")],
  marks="The shelter poster and one phone. On hover the phone shows the post, then the ad, then the search result.",
  swing="About a third of a circle round the shelter.",
  make="One picture of the street with a blank shelter. Poster panel and phone built in 3D with our campaign artwork."),
 dict(n=6, name="Video", place="City square, night", sky="#3a2f78,#12122e",
  see="The Torvi launch film plays on a large public screen. A few people have stopped to watch.",
  char="Faces the big screen; its glass eye picks up the film's light.",
  head="A film worth stopping for.", line="Scripts, shoots and edits for launches, ads and social.",
  btn=[("Video production", "/services/ai-video-production")],
  marks="The screen. On hover the film plays, silent. A tap plays it larger.",
  swing="About a third of a circle, so the screen is seen from the side as well.",
  make="One picture of the square with a dark screen. A silent Torvi film of about ten seconds: free if cut from the other scenes' pictures, video credits if shot new."),
]
legs = ["Along the coast", "Into town", "Down to the waterfront", "Along the quay", "Into the city as the light drops", "Through lit streets"]
total = OPEN + 6 * (LEG + STOP) + END
parts, at = [], 0.0
def add(kind, length, **kw):
    global at
    parts.append(dict(kind=kind, a=at / total * 100, b=(at + length) / total * 100, w=length / total * 100, **kw)); at += length
add("open", OPEN, label="Start", sky="#ffb37a,#ffd9a8")
for s, leg in zip(stops, legs): add("leg", LEG, label=leg, sky=s["sky"]); add("stop", STOP, label=s["name"], sky=s["sky"], s=s)
add("end", END, label="End", sky="#12122e,#ffb37a")
def rng(p): return f"{p['a']:.0f}% to {p['b']:.0f}%"

seg = "".join(f'<div class="seg {p["kind"]}" style="flex:{p["w"]:.3f};background:linear-gradient(90deg,{p["sky"]})"></div>' for p in parts)
lab = "".join(f'<div class="lab {p["kind"]}" style="flex:{p["w"]:.3f}">' + (f'<b>{p["s"]["n"]}</b><span>{E(p["label"])}</span><i>{p["a"]:.0f}%</i>' if p["kind"] == "stop" else (f'<span>{E(p["label"])}</span><i>{p["a"]:.0f}%</i>' if p["kind"] != "leg" else "")) + "</div>" for p in parts)

def row(k, v): return f"<dt>{k}</dt><dd>{v}</dd>"
scenes = []
for p in parts:
    if p["kind"] == "open":
        scenes.append(f'''<article class="scene"><header><span class="sky" style="background:linear-gradient(90deg,{p["sky"]})"></span><h3>Start</h3><p class="where">Coast road, sunrise · scroll {rng(p)}</p></header><dl>
{row("We see", "An empty road along the sea, the sun just up. Nothing of ours is in the picture.")}
{row("Character", "Floats beside the heading, facing the visitor. It blinks, and its body and eye follow the pointer.")}
{row("Words", "<q>AI-first design and digital company</q> · <q class='big'>Your digital department, without the hiring.</q> · button <q>See our work</q> · hint <q>Scroll to travel</q>")}
{row("Pointer and touch", "The character looks toward the pointer and the scene shifts slightly behind it. A tap on the character: it hops, spins once and blinks twice.")}
{row("To make", "One picture of the road at sunrise. The same picture, regraded, closes the journey.")}</dl></article>''')
    elif p["kind"] == "leg":
        scenes.append(f'<div class="travel"><span class="sky" style="background:linear-gradient(90deg,{p["sky"]})"></span><p><b>Travel: {E(p["label"])}</b> · scroll {rng(p)}. The words fade out and the character flies ahead. The scenery streaks past with speed and the light tail pours from its back in our colours. Scenery only.</p></div>')
    elif p["kind"] == "stop":
        s = p["s"]; btns = " · ".join(f'button <q>{E(t)}</q> opens <code>{u}</code>' for t, u in s["btn"])
        scenes.append(f'''<article class="scene stop"><header><span class="sky" style="background:linear-gradient(90deg,{p["sky"]})"></span><h3><em>Stop {s["n"]}</em> {E(s["name"])}</h3><p class="where">{E(s["place"])} · scroll {rng(p)}</p></header><dl>
{row("We see", E(s["see"]))}
{row("Character", E(s["char"]))}
{row("Words", f"<q class='big'>{E(s['head'])}</q> · <q>{E(s['line'])}</q> · {btns}")}
{row("Marked objects", E(s["marks"]))}
{row("Look round", E(s["swing"]))}
{row("To make", E(s["make"]))}</dl></article>''')
    else:
        scenes.append(f'''<article class="scene"><header><span class="sky" style="background:linear-gradient(90deg,{p["sky"]})"></span><h3>End</h3><p class="where">Back on the coast road, night turning to dawn · scroll {rng(p)}</p></header><dl>
{row("We see", "The road from the start, a day later. The sky warms as the last of the scroll runs out.")}
{row("Character", "Turns to face the visitor and gives one slow blink.")}
{row("Words", "<q class='big'>That was one brand. Yours next.</q> · button <q>Start a project</q> opens <code>/contact</code> · button <q>See our work</q> opens <code>/work</code> · small line <q>Need all of this every month? See the creative subscription.</q> opens <code>/services/ai-creative-subscription</code>")}
{row("Then", "The journey lets go and the rest of Home scrolls up as normal.")}</dl></article>''')

page = f'''<title>Hero Journey Script</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap">
<style>
  /* Layout: one reading column. A map of the whole scroll, coloured by the time of day, sits near the top; every scene below it uses the same rows. */
  :root {{ --page: #f8f6f8; --ink: #0a090d; --mute: #5c5a63; --line: rgb(10 9 13 / 0.14); --plate: #ffffff; --band: #eeecf1; --accent: #5437d1;
    --font: "Outfit", "Avenir Next", "Segoe UI", system-ui, sans-serif; }}
  @media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --page: #0a090d; --ink: #f8f6f8; --mute: #a5a3aa; --line: rgb(248 246 248 / 0.16); --plate: #151419; --band: #121115; --accent: #a797ff; color-scheme: dark; }} }}
  :root[data-theme="dark"] {{ --page: #0a090d; --ink: #f8f6f8; --mute: #a5a3aa; --line: rgb(248 246 248 / 0.16); --plate: #151419; --band: #121115; --accent: #a797ff; color-scheme: dark; }}
  body {{ background: var(--page); color: var(--ink); font-family: var(--font); font-size: 17px; line-height: 1.5; }}
  .wrap {{ max-width: 1040px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: clamp(28px, 6vw, 72px); display: flex; flex-direction: column; gap: clamp(40px, 6vw, 72px); }}
  section {{ display: flex; flex-direction: column; gap: 18px; min-width: 0; }}
  h1, h2, h3, p, dl, dd, ul, ol {{ margin: 0; }}
  h1 {{ font-size: clamp(34px, 6.4vw, 68px); line-height: 0.98; letter-spacing: -0.02em; text-transform: uppercase; font-weight: 700; text-wrap: balance; }}
  h2 {{ font-size: clamp(22px, 3vw, 30px); line-height: 1.1; font-weight: 700; text-wrap: balance; }}
  h3 {{ font-size: 21px; line-height: 1.15; font-weight: 700; }}
  h3 em {{ font-style: normal; font-weight: 500; color: var(--accent); margin-right: 0.35em; }}
  .eyebrow {{ font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--mute); }}
  .lead {{ font-size: clamp(18px, 2.1vw, 22px); line-height: 1.4; max-width: 62ch; }}
  p, li, dd {{ max-width: 70ch; }}
  .mute {{ color: var(--mute); }}
  q {{ quotes: none; font-weight: 500; }} q.big {{ font-weight: 700; text-transform: uppercase; letter-spacing: -0.01em; }}
  code {{ font: inherit; font-size: 0.92em; color: var(--accent); overflow-wrap: anywhere; }}
  .facts {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0; border-top: 1px solid var(--line); }}
  .facts div {{ padding: 14px 16px 14px 0; border-bottom: 1px solid var(--line); }}
  .facts b {{ display: block; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mute); font-weight: 500; }}
  /* the map: each part is as wide as its share of the scroll; travel legs are hatched, stops are solid */
  .scroller {{ overflow-x: auto; }}
  .map {{ min-width: 820px; }}
  .bar, .labs {{ display: flex; }}
  .bar {{ height: 46px; border-radius: 8px; overflow: hidden; box-shadow: 0 0 0 1px var(--line); }}
  .seg.leg {{ background-blend-mode: normal; position: relative; }}
  .seg.leg::after {{ content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(115deg, rgb(10 9 13 / 0.34) 0 2px, transparent 2px 8px); }}
  .seg {{ position: relative; }}
  .seg.stop {{ box-shadow: inset 2px 0 0 rgb(10 9 13 / 0.55), inset -2px 0 0 rgb(10 9 13 / 0.55); }}
  .lab {{ padding-top: 8px; font-size: 13px; line-height: 1.2; min-width: 0; display: flex; flex-direction: column; gap: 2px; }}
  .lab b {{ color: var(--accent); font-weight: 700; }} .lab i {{ font-style: normal; color: var(--mute); font-variant-numeric: tabular-nums; }}
  .lab.end {{ text-align: right; align-items: flex-end; }}
  .key {{ display: flex; flex-wrap: wrap; gap: 6px 22px; font-size: 14px; color: var(--mute); }}
  .key span::before {{ content: ""; display: inline-block; width: 22px; height: 10px; margin-right: 8px; border-radius: 2px; background: var(--mute); vertical-align: baseline; }}
  .key .k-leg::before {{ background: repeating-linear-gradient(115deg, var(--mute) 0 2px, transparent 2px 6px); box-shadow: 0 0 0 1px var(--line); }}
  .beats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0 28px; counter-reset: beat; padding: 0; list-style: none; }}
  .beats li {{ counter-increment: beat; border-top: 2px solid var(--ink); padding: 12px 0 8px; }}
  .beats li::before {{ content: counter(beat); display: block; font-weight: 700; font-size: 22px; color: var(--accent); }}
  .scenes {{ gap: 12px; }}
  .scene {{ background: var(--plate); border-radius: 10px; box-shadow: 0 0 0 1px var(--line); padding: clamp(16px, 2.6vw, 26px); display: flex; flex-direction: column; gap: 14px; min-width: 0; }}
  .scene header {{ display: flex; flex-direction: column; gap: 6px; }}
  .sky {{ display: block; width: 72px; height: 8px; border-radius: 4px; }}
  .where {{ color: var(--mute); font-size: 15px; }}
  dl {{ display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 0; }}
  dt, dd {{ padding: 9px 0; border-top: 1px solid var(--line); }}
  dt {{ font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); padding-top: 12px; }}
  .travel {{ display: flex; gap: 14px; align-items: baseline; padding: 4px clamp(16px, 2.6vw, 26px); color: var(--mute); font-size: 15px; }}
  .travel .sky {{ flex: none; width: 40px; }} .travel b {{ color: var(--ink); font-weight: 500; }}
  .tbl {{ overflow-x: auto; }}
  table {{ border-collapse: collapse; width: 100%; min-width: 640px; font-size: 16px; }}
  th, td {{ text-align: left; vertical-align: top; padding: 10px 14px 10px 0; border-top: 1px solid var(--line); }}
  th {{ font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute); font-weight: 500; border-top: 0; }}
  td:first-child {{ font-weight: 500; white-space: nowrap; }}
  td.num {{ font-variant-numeric: tabular-nums; white-space: nowrap; }}
  ul.plain {{ padding-left: 1.1em; display: flex; flex-direction: column; gap: 8px; }}
  .note {{ background: var(--band); border-radius: 10px; padding: 16px 18px; }}
  @media (max-width: 640px) {{ dl {{ grid-template-columns: 1fr; }} dt {{ padding-bottom: 0; }} dd {{ border-top: 0; padding-top: 4px; }} td:first-child {{ white-space: normal; }} }}
</style>
<div class="wrap">
  <section>
    <p class="eyebrow">Opsiogen Home hero · script and scene plan · 17 November 2026</p>
    <h1>One brand, one day, six stops.</h1>
    <p class="lead">The visitor scrolls and our character flies through one day in the life of a single brand, from sunrise on a coast road to a city square at night. At each stop it finds one kind of our work, out in the real world. Nothing of ours appears on the way between stops.</p>
    <div class="facts">
      <div><b>The brand</b>Torvi, our own cycle brand, at every stop. No client names needed.</div>
      <div><b>Length</b>About {total:.1f} screens of scroll on a desktop, about 8 on a phone.</div>
      <div><b>The character</b>The 3D model you approved, drawn live over every scene.</div>
      <div><b>Setting</b>Outdoors only. People in the pictures are AI-made.</div>
    </div>
  </section>

  <section>
    <h2>The whole scroll on one line</h2>
    <p class="mute">Each part is as wide as its share of the scroll. The colour is the sky at that point in the day.</p>
    <div class="scroller"><div class="map"><div class="bar">{seg}</div><div class="labs">{lab}</div></div></div>
    <div class="key"><span class="k-stop">A stop: our work is on screen</span><span class="k-leg">Travel: scenery only</span></div>
  </section>

  <section>
    <h2>Every stop plays the same three beats</h2>
    <ol class="beats">
      <li><b>Arrive.</b> The camera slows and settles. The character swings round from looking ahead to looking at the work.</li>
      <li><b>Show.</b> The heading, one line and the button fade in on the side away from the work. The marked objects start to respond to the pointer.</li>
      <li><b>Hold.</b> If the visitor stops scrolling, the character turns to face them. After six seconds it glances at the work and back, and a small <q>Keep scrolling</q> hint appears.</li>
    </ol>
  </section>

  <section>
    <h2>The travel look</h2>
    <p>Between stops the journey should feel fast, as in the reference picture you sent.</p>
    <ul class="plain">
      <li><b>Speed in the scenery.</b> The place blurs and streaks in the direction of travel, people and plants included. The faster the scroll, the longer the streaks. The character itself stays sharp.</li>
      <li><b>The character at an angle.</b> We see it from behind and slightly to one side, eye pointing where it is going, leaning into the turn.</li>
      <li><b>Light tail in our colours.</b> A wide beam streams from its back toward us and fades out: cyan, blue, violet, pink and orange, the same order as the line on its body. No green and no yellow.</li>
      <li><b>Light on the ground.</b> The same colours wash softly over the ground under the tail, so the tail belongs to the place and is not pasted on top.</li>
      <li><b>Slowing down.</b> As a stop comes near, the streaks shorten, the tail thins to nothing and the picture comes into focus.</li>
      <li><b>Animations turned off.</b> No blur, no tail; the scenes change with a plain fade.</li>
    </ul>
  </section>

  <section class="scenes">
    <h2>Scene by scene</h2>
    {"".join(scenes)}
  </section>

  <section>
    <h2>What the character does</h2>
    <div class="tbl"><table>
      <tr><th>When</th><th>Body</th><th>Eye and light</th><th>Where it sits</th></tr>
      <tr><td>Start, at rest</td><td>Faces the visitor, bobs gently</td><td>Blinks with light every few seconds</td><td>Left of the heading; below it on a phone</td></tr>
      <tr><td>Pointer moves</td><td>Turns up to about 35° toward it</td><td>The light inside the glass slides the same way</td><td>Stays put</td></tr>
      <tr><td>Scrolling</td><td>Turns its back to us and looks ahead</td><td>Light tail in our colours streams from its back toward us; the line on its body brightens with speed</td><td>Drifts to the centre and a little smaller, as if leading the way</td></tr>
      <tr><td>Arriving at a stop</td><td>Swings round to the work</td><td>One blink as it settles</td><td>Moves to the side nearest the work</td></tr>
      <tr><td>Visitor stops</td><td>Turns to face the visitor</td><td>Follows the pointer again</td><td>Stays beside the work</td></tr>
      <tr><td>Marked object hovered</td><td>Turns to look at that object</td><td>Colour line pulses once</td><td>Stays put</td></tr>
      <tr><td>Tapped or clicked</td><td>Hops and spins once</td><td>Blinks twice</td><td>Stays put</td></tr>
      <tr><td>End</td><td>Faces the visitor</td><td>One slow blink</td><td>Centre</td></tr>
    </table></div>
  </section>

  <section>
    <h2>Pointer, touch and keyboard</h2>
    <div class="tbl"><table>
      <tr><th>The visitor</th><th>While travelling</th><th>At a stop</th></tr>
      <tr><td>Moves the pointer</td><td>The character leans slightly</td><td>The scene shifts a few degrees and the character's eye follows</td></tr>
      <tr><td>Hovers a marked object</td><td>Nothing is marked</td><td>The object lights up with a short label and the character looks at it</td></tr>
      <tr><td>Moves across a marked object</td><td>Nothing</td><td>The view swings round it, as far as that stop allows</td></tr>
      <tr><td>Clicks a marked object</td><td>Nothing</td><td>Opens that service page</td></tr>
      <tr><td>Clicks the character</td><td>Nothing</td><td>It says hello</td></tr>
      <tr><td>On a phone</td><td>Swipe up to travel</td><td>Drag sideways to look round. First tap on an object shows its label, second tap opens it. There is no hover.</td></tr>
      <tr><td>On a keyboard</td><td>Down arrow or Space moves on</td><td>Tab moves between the buttons and marked objects, Enter opens one</td></tr>
    </table></div>
    <ul class="plain">
      <li>A <q>Skip the journey</q> link sits at the top and jumps to the rest of Home.</li>
      <li>Visitors who have turned animations off get the six stops as still pictures with their words, one under another. Nothing spins or pins.</li>
      <li>If a device cannot draw 3D, the character is your front artwork as a picture and the look-round is left out.</li>
      <li>No sound anywhere.</li>
    </ul>
  </section>

  <section>
    <h2>How it stays fast and findable</h2>
    <ul class="plain">
      <li>The first screen is the sunrise picture and the heading, sent as ordinary page content. That is what PageSpeed measures, so the score does not wait for 3D.</li>
      <li>The character and the 3D objects load after the first screen is up, outside the page's first-load budget. The character's file needs slimming from about 2.4 MB to a few hundred KB first.</li>
      <li>Each scene's picture loads one stop ahead, never all at once.</li>
      <li>The main heading stays the page's only h1. Each stop's heading is an h2 with real text and a real link, so search engines read all six services.</li>
    </ul>
  </section>

  <section>
    <h2>What we have to make</h2>
    <div class="tbl"><table>
      <tr><th>Item</th><th>How many</th><th>How</th><th>Cost</th></tr>
      <tr><td>Scene pictures</td><td class="num">7</td><td>Generated: the road, plus one per stop. Travel legs reuse them, so no extra pictures.</td><td class="num">About 1,330 to 1,575 image credits of about 2,010 left</td></tr>
      <tr><td>3D objects</td><td class="num">5 sets</td><td>Built the same free way as the character: laptop and phone, booth, dispatch table, shelter and phone, big screen.</td><td>None</td></tr>
      <tr><td>Artwork on the objects</td><td class="num">about 10</td><td>Torvi website, app, booth panels, brochure, poster, posts and ad, from designs we already have or draw ourselves.</td><td>None</td></tr>
      <tr><td>Order flow animation</td><td class="num">1</td><td>Drawn by us for the tablet at stop 4.</td><td>None</td></tr>
      <tr><td>Launch film</td><td class="num">1</td><td>Cut from the scene pictures, or shot new.</td><td>None, or video credits after a top-up</td></tr>
      <tr><td>Travel clips</td><td class="num">6, optional</td><td>Real moving footage between stops instead of a push into the picture.</td><td>Video credits after a top-up</td></tr>
    </table></div>
    <p class="mute">Credit figures are estimates from the prices quoted earlier: 190 a picture, or 433 where a picture must match the Torvi logo exactly. That leaves room for two or three retries.</p>
  </section>

  <section>
    <h2>Order of work</h2>
    <ol class="plain">
      <li><b>The journey in plain colours.</b> The full scroll with the real character, words, timings and buttons, on flat sky-coloured scenes. Free. You feel the pacing before anything is spent.</li>
      <li><b>One stop for real: the booth.</b> One generated picture and the 3D booth. This proves that a 3D object sits believably in a photographed place.</li>
      <li><b>The other five stops and the road.</b> Six more pictures and four sets of objects.</li>
      <li><b>Phone pass.</b> Crops, sizes and touch at 390px.</li>
      <li><b>Into the site.</b> Slim the files, check PageSpeed on phone and desktop, then replace the glass-studio hero.</li>
    </ol>
    <div class="note"><p><b>The one real risk.</b> A 3D object placed in a generated photo can look pasted on. Step 2 tests exactly that with the booth before more credits go out. If it does not hold up, the fallback is a generated picture of each object with a gentle shift of a few degrees instead of a full look-round.</p></div>
  </section>

  <section>
    <h2>Choices made here, yours to change</h2>
    <ul class="plain">
      <li><b>One brand all the way.</b> Torvi at every stop, so the journey reads as one story and no client is named on Home.</li>
      <li><b>Six stops.</b> Brand, Websites and apps, Print, Automation, Social and marketing, Video. The creative subscription is the closing line, not a stop.</li>
      <li><b>All the words are drafts.</b> Headings, lines and button labels are first proposals for you to edit.</li>
      <li><b>Length.</b> About {total:.1f} screens. Shorter legs would bring it down to about 8 without losing a stop.</li>
    </ul>
  </section>
</div>
'''
(pathlib.Path(__file__).parent / "index.html").write_text(page); print(len(page), round(total, 2), [f"{p['a']:.0f}" for p in parts])
