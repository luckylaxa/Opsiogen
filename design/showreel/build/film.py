"""Cuts the approved shots (frames.html, saved by frames.cjs) into the film on the beat of the percussion track.
Cut 7, our own motion: stills move frame by frame in frames.html (render-anim.cjs): pieces spring in and drift, words
type on, and our character runs through the film (the camera dives into its eye, it zips through the grid, hops on the
chapter words, bounces on the closing words, lands on the logo). Stock clips play their best moment with a quick
punch-in; the first opens out of the opening line in a circle; the four after the chapter words push the word card up
and out; in three of them (OVER) the character joins the people, drawn on its own and laid over the clip.
Cuts land on the beat (140 bpm) and the track's last hit lands on the logo.
Usage: python3 film.py FRAMES_DIR OUT.mp4   (FRAMES_DIR holds the approved stills NN.jpg and shots.json)"""
import sys, json, os, subprocess, shutil
from handoff import tail   # how a stock clip of people hands over to the work after it (no text)
FR, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
HERE = os.path.dirname(os.path.abspath(__file__)); ST = os.path.join(HERE, "../raw/stock/")
BPM, FPS = 140, 30; BEAT = 60 / BPM
# Stock: a word from the shot's name -> (file, in point in seconds). The green-screen clip is keyed onto our violet.
# Cut 22: three clips stay (Lucky, 26 Nov: "change only what I asked"); the other ten became big words in frames.html.
STOCK = {"488563452": ("as-488563452.mov", 1.2), "405010525": ("as-405010525.mov", 3.0)}   # cut 23: the big laugh became a brand being built
OVER = ("488563452",)  # the stock clip the character joins
MULTI = ("Grid of", "collage", "tiles", "wall across", "row of", "Torvi: site", "billboard, badge", "guideline pages", "Three apps")
def beats(n):
    if n == "Opening line": return 3
    if n == "Brands already did": return 8   # the opening logo beat (frames.html ?share)
    if n.startswith("We take it"): return 2
    if n == "Chapter word": return 2
    if n.startswith("Fast word"): return 1
    if n.startswith("One partner"): return 4   # the closing line, in the place (and time) of the line it replaced
    if n in ("Word: Adoption.", "Word: Growth."): return 3   # two clips' worth (Adoption), and the climb (Growth)
    if n.startswith("Word:"): return 2
    if n.startswith("Logo"): return 9    # 4 beats flying through the O (frames.html LOGO_IN), then 5 (the film within a minute)
    if n.startswith("Wall of"): return 3   # the closing wall pulls back into the grid (cut 5's tilted wall)
    if n == "Website: Cabot Solutions": return 2   # it lands out of the word before: give it time
    if n.startswith("Brand: a brand being built"): return 5   # drawn fast (owner, 27 Nov): the bulb lights up by 1.25 s of its 2.1 s
    if n.startswith("Illustration:"): return 4   # a filler drawing: outlines, colours, then the picture by 1.15 s
    if n == "Websites: wall across projects": return 1      # ...and the wall after it takes one beat less
    if "488563452" in n: return 3   # she points, our character pops up there, she turns to look at it
    if n.startswith(("Stock", "Life")): return 2
    if any(m in n for m in MULTI): return 2
    return 1
shots = json.load(open(os.path.join(FR, "shots.json")))
B = [beats(s["name"]) for s in shots]
logo = len(shots) - 1
while sum(B[:logo]) % 4 != 3: B[logo - 1] += 1   # the last hit (4 beats into the logo) falls 3 beats past a bar line (see track.py); the closing line takes the time
start = [sum(B[:i]) for i in range(len(B) + 1)]
fr = lambda b: round(b * BEAT * FPS)
N = [fr(start[i + 1]) - fr(start[i]) for i in range(len(shots))]
stock = {i: next((v for k, v in STOCK.items() if k in s["name"]), None) for i, s in enumerate(shots)}
WD = os.path.join(FR, "film"); shutil.rmtree(WD, ignore_errors=True); os.makedirs(WD)
clip = lambda i: os.path.join(WD, f"{i:03d}.mp4")
last = lambda i: os.path.join(WD, f"last-{i:03d}.jpg") if stock[i] else os.path.join(WD, "frames", f"{i:03d}", f"{N[i] - 1:03d}.jpg")
run = lambda c: subprocess.run(c, check=True)
ENC = lambda n, o: ["-frames:v", str(n), "-an", "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", str(FPS), o]
FIT = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1"
PUNCH = "scale=w='2*trunc(960*(1+0.1*pow(max(0,1-t/0.2),3)))':h=-2:eval=frame,crop=1920:1080"
EASE = "(1-pow(1-min(t/0.24,1),3))"
def source(i, k):  # filter chain for stock clip i from input k, ending in [v]
    if "556948644" in shots[i]["name"]:
        return (f"[{k}:v]setpts=PTS-STARTPTS,{FIT},chromakey=0x16a012:0.16:0.06,despill=type=green[fg];"
                f"color=c=0xa98bff:s=1920x1080:r={FPS}[g];[g][fg]overlay=shortest=1,fps={FPS},settb=1/{FPS}[v]")
    return f"[{k}:v]setpts=PTS-STARTPTS,{FIT},fps={FPS},settb=1/{FPS}[v]"
over = lambda i: os.path.join(WD, "frames", f"{i:03d}a") if any(k in shots[i]["name"] for k in OVER) else None
def make(i, inputs, fc):  # encodes stock clip i from a filter chain ending in [o], with the character laid over it
    if over(i):
        inputs = inputs + ["-framerate", str(FPS), "-i", os.path.join(over(i), "%03d.png")]
        fc = fc.replace("[o]", "[o0]") + f";[o0][{inputs.count('-i') - 1}:v]overlay=0:0[o]"
    tl = tail(shots[i]["name"], N[i] / FPS)   # its hand-over to the work after it, last, so the character moves with it
    if tl: fc = fc.replace("[o]", "[o1]") + f";[o1]{tl}[o]"
    run(["ffmpeg", "-y", "-v", "error"] + inputs + ["-filter_complex", fc, "-map", "[o]"] + ENC(N[i], clip(i)))
def plain(i):  # a hard cut with a quick punch-in
    f, t0 = stock[i]
    make(i, ["-ss", str(t0), "-i", ST + f], source(i, 0) + f";[v]{PUNCH}[o]")
def push(i, word):  # the chapter word card goes up and out, the clip comes up from below
    f, t0 = stock[i]
    make(i, ["-loop", "1", "-framerate", str(FPS), "-i", word, "-ss", str(t0), "-i", ST + f],
         source(i, 1) + f";[0:v]scale=1920:1080,setsar=1,fps={FPS},settb=1/{FPS}[w];color=c=black:s=1920x1080:r={FPS}[c];"
         f"[c][w]overlay=x=0:y='-1080*{EASE}':eval=frame[a];[a][v]overlay=x=0:y='1080*(1-{EASE})':eval=frame:shortest=1[o]")
def iris(i):  # the clip opens out of the opening line in our lens circle (drawn in its character layer)
    f, t0 = stock[i]
    make(i, ["-ss", str(t0), "-i", ST + f], source(i, 0) + ";[v]null[o]")
render = lambda name, jobs: (json.dump({"frames": FR, "out": os.path.join(WD, "frames"), "fps": FPS, "jobs": jobs}, open(os.path.join(WD, name), "w")),
                             run(["node", os.path.join(HERE, "render-anim.cjs"), os.path.join(WD, name)]))
# 0. The character on its own, for the stock clips it joins (after the opening line, with that line's last frame
#    and a growing hole in it: the lens circle the clip opens in).
opens = lambda i: i and shots[i - 1]["name"] in ("Opening line", "Brands already did")   # the share cut opens it out of its logo beat
pre = [[0, N[0], ""]] + ([[1, N[1], last(0)]] if shots[1]["name"] == "Brands already did" else [])   # what the first clip opens out of
render("over.json", pre + [[i, N[i], last(i - 1) if opens(i) else "", "alpha"] for i in stock if stock[i] and over(i)])
# A frame with nothing see-through is saved without its alpha channel, and ffmpeg drops a frame where the format
# changes: keep every frame of a layer RGBA.
from PIL import Image
for i in stock:
    if stock[i] and over(i):
        for fn in sorted(os.listdir(over(i))):
            im = Image.open(os.path.join(over(i), fn))
            if im.mode != "RGBA": im.convert("RGBA").save(os.path.join(over(i), fn))
# 1. Stock clips (plain), and the last frame of each, which the shot after reveals itself over.
for i in stock:
    if stock[i]:
        plain(i)
        run(["ffmpeg", "-y", "-v", "error", "-i", clip(i), "-vf", f"select=eq(n\\,{N[i] - 1})", "-frames:v", "1", "-q:v", "2", last(i)])
# 2. The moving stills, frame by frame, in film order.
render("jobs.json", [[i, N[i], last(i - 1) if i else ""] for i in range(len(shots)) if not stock[i]])
for i in range(len(shots)):
    if not stock[i]:
        run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", os.path.join(WD, "frames", f"{i:03d}", "%03d.jpg")] + ENC(N[i], clip(i)))
# 3. Stock clips that open out of the shot before: the first out of the opening line, the four after the chapter words.
for i in stock:
    if stock[i] and i and shots[i - 1]["name"] == "Chapter word": push(i, last(i - 1))
    elif stock[i] and opens(i): iris(i)
# 4. Join on the beat with the music.
total = fr(start[-1]) / FPS
open(os.path.join(WD, "list.txt"), "w").write("".join(f"file '{clip(i)}'\n" for i in range(len(shots))))
HIT = fr(start[logo] + 4) / FPS   # the track's last hit: as our character settles on the logo, 4 beats into its shot
json.dump({"dur": total, "cuts": [fr(b) / FPS for b in start[:-1]], "hit": HIT}, open(os.path.join(WD, "cuts.json"), "w"))
run(["python3", os.path.join(HERE, "track.py"), os.path.join(WD, "cuts.json"), "percussion", os.path.join(WD, "music.wav")])
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", os.path.join(WD, "list.txt"), "-i", os.path.join(WD, "music.wav"),
     "-t", str(total), "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
     "-af", f"afade=t=out:st={total - 1.2}:d=1.2", "-movflags", "+faststart", OUT])
print("shots", len(shots), "beats", start[-1], "seconds", round(total, 2), "logo at", round(fr(start[logo]) / FPS, 2), "last hit at", round(HIT, 2))
