"""Fits the library track to the film: it starts on the track's first beat, repeats once (joined on a bar line)
and is placed so the track's own last hit lands on the logo. Usage: python3 track.py cuts.json IN.mp3 OUT.wav"""
import sys, json, subprocess
import numpy as np
from scipy.io import wavfile
cut = json.load(open(sys.argv[1])); SR = 44100
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", sys.argv[2], "-ar", str(SR), "-ac", "2", "/tmp/_track.wav"], check=True)
_, x = wavfile.read("/tmp/_track.wav"); x = x.astype(float) / 32768
BAR = 60 / 140 * 4
T0 = 1.726        # the track's first beat (after its one quiet bar)
HIT = 28.723      # the track's last hit
DUR, LOGO = cut["dur"], cut["cuts"][-1]
JOIN = round(22.3 / BAR) * BAR            # where the repeat starts, in film time: a bar line inside the "We brand it" card
second = HIT - (LOGO - JOIN)              # where in the track the repeat picks up
assert abs((second - T0) / BAR - round((second - T0) / BAR)) < 0.02, "the repeat must start on a bar line"
i = lambda t: int(round(t * SR))
a = x[i(T0):i(T0 + JOIN)].copy(); b = x[i(second):].copy()
f = int(.02 * SR); ramp = np.linspace(0, 1, f)[:, None]
a[-f:] *= 1 - ramp; b[:f] *= ramp
out = np.zeros((i(DUR), 2)); out[:len(a)] += a
n = min(len(b), len(out) - (len(a) - f)); out[len(a) - f:len(a) - f + n] += b[:n]
out = out / np.abs(out).max() * .9
wavfile.write(sys.argv[3], SR, (out * 32767).astype(np.int16))
print("film", round(DUR, 2), "logo", round(LOGO, 2), "join", round(JOIN, 2), "repeat from", round(second, 2))
