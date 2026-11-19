"""The share cut (Lucky, 19 Nov: client logos in the video, like Superside's, for sharing): the website's film with the
client logo beat (frames.html?share, "Client logos": the heading of the site's logo strip over twelve client logos) just
before the logo ending. The website keeps its cut, as the logo strip sits right under the film there.
It reuses the website cut's clips (film.py's FRAMES_DIR/film), renders only the logo beat and the logo ending after it
(which reveals itself over the beat's last frame), moves the music's last hit onto the logo again (track.py) and joins.
The beat is 8 beats long, two bars, so the logo still lands where the track's bars want it.
Usage: python3 share.py FRAMES_DIR OUT.mp4   (FRAMES_DIR: the one film.py made the website cut from)"""
import sys, json, os, subprocess
FR, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(FR, "film"); WD = os.path.join(FR, "share")
BPM, FPS = 140, 30; BEAT = 60 / BPM; LOGOS = 8
fr = lambda b: round(b * BEAT * FPS)
run = lambda c, **k: subprocess.run(c, check=True, **k)
cut = json.load(open(os.path.join(SRC, "cuts.json")))
beats = [round(c / BEAT) for c in cut["cuts"]] + [round(cut["dur"] / BEAT)]
logo = len(cut["cuts"]) - 1                                   # the logo ending, the website cut's last shot
start = beats[:logo] + [beats[logo], beats[logo] + LOGOS, beats[-1] + LOGOS]   # ... the beat, the logo ending, the end
N = [fr(start[i + 1]) - fr(start[i]) for i in range(len(start) - 1)]
os.makedirs(WD, exist_ok=True)
prev = sorted(os.listdir(os.path.join(SRC, "frames", f"{logo - 1:03d}")))[-1]   # the last frame of the shot before
under = os.path.join(SRC, "frames", f"{logo - 1:03d}", prev)
beat_last = os.path.join(WD, "frames", f"{logo:03d}", f"{N[logo] - 1:03d}.jpg")
json.dump({"frames": FR, "out": os.path.join(WD, "frames"), "fps": FPS,
           "jobs": [[logo, N[logo], under], [logo + 1, N[logo + 1], beat_last]]}, open(os.path.join(WD, "jobs.json"), "w"))
run(["node", os.path.join(HERE, "render-anim.cjs"), os.path.join(WD, "jobs.json")], env={**os.environ, "SHARE": "1"})
clip = lambda i: os.path.join(WD, f"{i:03d}.mp4")
for i in (logo, logo + 1):
    run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", os.path.join(WD, "frames", f"{i:03d}", "%03d.jpg"),
         "-frames:v", str(N[i]), "-an", "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", str(FPS), clip(i)])
files = [os.path.join(SRC, f"{i:03d}.mp4") for i in range(logo)] + [clip(logo), clip(logo + 1)]
open(os.path.join(WD, "list.txt"), "w").write("".join(f"file '{f}'\n" for f in files))
total = fr(start[-1]) / FPS; HIT = fr(start[logo + 1] + 4) / FPS     # the last hit: 4 beats into the logo ending
json.dump({"dur": total, "cuts": [fr(b) / FPS for b in start[:-1]], "hit": HIT}, open(os.path.join(WD, "cuts.json"), "w"))
run(["python3", os.path.join(HERE, "track.py"), os.path.join(WD, "cuts.json"), "percussion", os.path.join(WD, "music.wav")])
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", os.path.join(WD, "list.txt"), "-i", os.path.join(WD, "music.wav"),
     "-t", str(total), "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
     "-af", f"afade=t=out:st={total - 1.2}:d=1.2", "-movflags", "+faststart", OUT])
print("logo beat at", round(fr(start[logo]) / FPS, 2), "logo at", round(fr(start[logo + 1]) / FPS, 2), "last hit", round(HIT, 2), "seconds", round(total, 2))
