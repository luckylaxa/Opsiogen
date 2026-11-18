"""Cuts the approved shots (frames.html, saved by frames.cjs) into the film, on the beat of the percussion track.
Every still gets a slow push; stock clips play their best moment; cuts are hard, on beats (140 bpm).
Usage: python3 film.py FRAMES_DIR OUT.mp4   (FRAMES_DIR holds NN.jpg and shots.json)"""
import sys, json, os, subprocess
FR, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); ST = os.path.join(HERE, "../raw/stock/")
BPM, FPS = 140, 30; BEAT = 60 / BPM
# Stock: a word from the shot's name -> (file, in point in seconds). The green-screen clip is keyed onto our violet.
STOCK = {"556948644": ("as-556948644.mov", 2.5), "480737977": ("as-480737977.mov", 13.6), "405010525": ("as-405010525.mov", 3.0),
         "249372459": ("as-249372459.mov", 5.6), "191180958": ("as-191180958.mov", 3.4), "490354049": ("as-490354049.mov", 3.0),
         "Pixabay 208770": ("208770_large.mp4", 4.6), "294857367": ("as-294857367.mov", 7.0), "Pexels 5137353": ("5137353-uhd_3840_2160_30fps.mp4", 9.4),
         "150778364": ("as-150778364.mov", 4.0), "329117728": ("as-329117728.mov", 10.0), "577275631": ("as-577275631.mov", 3.2),
         "Pexels 4053012": ("4053012-uhd_3840_2160_25fps.mp4", 5.0)}
MULTI = ("Grid of", "Wall of", "collage", "Torvi: site", "billboard, badge", "guideline pages")
def beats(n):
    if n == "Opening line": return 3
    if n.startswith("We take it"): return 2
    if n == "Chapter word": return 2
    if n.startswith("Fast word"): return 1
    if n.startswith("The spine"): return 4
    if n == "One partner": return 2
    if n.startswith("Logo"): return 6
    if n.startswith(("Stock", "Life")): return 2
    if any(m in n for m in MULTI): return 2
    return 1
shots = json.load(open(os.path.join(FR, "shots.json")))
B = [beats(s["name"]) for s in shots]
# The track's last hit lands on the logo: the logo starts on a beat that is 3 past a bar line (see track.py).
logo = len(shots) - 1
while sum(B[:logo]) % 4 != 3: B[logo - 2] += 1   # hold the typed line a beat longer
start = [sum(B[:i]) for i in range(len(B) + 1)]
fr = lambda b: round(b * BEAT * FPS)
tmp = os.path.join(FR, "clips"); os.makedirs(tmp, exist_ok=True); lst = []
TEXT = ("Opening line", "We take it", "Chapter word", "Fast word", "The spine", "One partner", "Logo")
for i, s in enumerate(shots):
    n = fr(start[i + 1]) - fr(start[i]); d = n / FPS; o = os.path.join(tmp, f"{i:03d}.mp4"); lst.append(o)
    enc = ["-r", str(FPS), "-frames:v", str(n), "-an", "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-pix_fmt", "yuv420p", o]
    st = next((v for k, v in STOCK.items() if k in s["name"]), None)
    if st:
        f, t0 = st; fit = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1"
        if "556948644" in s["name"]:
            vf = f"color=c=0xa98bff:s=1920x1080:r={FPS}[bg];[0:v]{fit},chromakey=0x16a012:0.16:0.06,despill=type=green[fg];[bg][fg]overlay=shortest=0"
            cmd = ["ffmpeg", "-y", "-v", "error", "-ss", str(t0), "-i", ST + f, "-filter_complex", vf] + enc
        else:
            cmd = ["ffmpeg", "-y", "-v", "error", "-ss", str(t0), "-i", ST + f, "-vf", fit] + enc
    else:
        img = os.path.join(FR, f"{i + 1:02d}.jpg")
        if s["name"].startswith(TEXT): z = "1"
        elif i % 2: z = f"1.05-0.05*on/{n}"       # pull back
        else: z = f"1+0.05*on/{n}"                # push in
        vf = f"scale=3840:2160,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps={FPS}"
        cmd = ["ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", img, "-vf", vf] + enc
    subprocess.run(cmd, check=True)
total = fr(start[-1]) / FPS
open(os.path.join(tmp, "list.txt"), "w").write("".join(f"file '{p}'\n" for p in lst))
json.dump({"dur": total, "cuts": [fr(b) / FPS for b in start[:-1]]}, open(os.path.join(tmp, "cuts.json"), "w"))
subprocess.run(["python3", "track.py", os.path.join(tmp, "cuts.json"), "percussion", os.path.join(tmp, "music.wav")], check=True, cwd=HERE)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", os.path.join(tmp, "list.txt"), "-i", os.path.join(tmp, "music.wav"),
                "-t", str(total), "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                "-af", f"afade=t=out:st={total - 1.2}:d=1.2", "-movflags", "+faststart", OUT], check=True)
print("shots", len(shots), "beats", start[-1], "seconds", round(total, 2), "logo at", round(fr(start[logo]) / FPS, 2))
