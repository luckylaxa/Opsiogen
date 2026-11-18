"""Fits a library track to the film: it starts on the track's first beat, repeats on bar lines as often as the
film needs, and its last pass is placed so the track's own last hit lands on the logo.
Usage: python3 track.py cuts.json TRACK OUT.wav   (TRACK is a name in TRACKS; render the film with the same ?bpm)"""
import sys, json, subprocess
import numpy as np
from scipy.io import wavfile
# For each track: its file, tempo, first beat, last hit, and how many whole bars repeat cleanly.
TRACKS = {
    "percussion": dict(file="../music/fast-percussion.mp3", bpm=140, t0=1.726, hit=28.723, bars=15),
    "rhythmic": dict(file="../music/fast-dynamic-rhythmic.mp3", bpm=134, t0=0.010, hit=21.281, bars=11),
}
tr = TRACKS[sys.argv[2]]; cut = json.load(open(sys.argv[1])); SR = 44100
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tr["file"], "-ar", str(SR), "-ac", "2", "/tmp/_track.wav"], check=True)
_, x = wavfile.read("/tmp/_track.wav"); x = x.astype(float) / 32768
BAR = 60 / tr["bpm"] * 4; T0, HIT = tr["t0"], tr["hit"]
DUR, LOGO = cut["dur"], cut["cuts"][-1]
last = LOGO - (HIT - T0)                  # film time where the last pass starts
assert abs(last / BAR - round(last / BAR)) < 0.03, f"the last pass must start on a bar line: move the logo by {round((last / BAR - round(last / BAR)) * 8, 2)} half-beats"
i = lambda t: int(round(t * SR)); f = int(.015 * SR); ramp = np.linspace(0, 1, f)[:, None]
out = np.zeros((i(DUR) + SR, 2))
def lay(at, seg):                         # a piece of the track at a film time, with a very short fade at each end
    seg = seg.copy(); seg[:f] *= ramp; seg[-f:] *= 1 - ramp
    n = min(len(seg), len(out) - i(at)); out[i(at):i(at) + n] += seg[:n]
loop = x[i(T0):i(T0 + tr["bars"] * BAR)]; t = 0.0
while t < last - 1e-6:
    lay(t, loop[:i(min(len(loop) / SR, last - t))]); t += tr["bars"] * BAR
lay(last, x[i(T0):])
out = out[:i(DUR)]; out = out / np.abs(out).max() * .9
wavfile.write(sys.argv[3], SR, (out * 32767).astype(np.int16))
print("film", round(DUR, 2), "logo", round(LOGO, 2), "last pass from", round(last, 2))
