# Testing

## Status of this release

| Evidence | When | Result |
| --- | --- | --- |
| Local self-test (`?selftest=1`, headless Chrome) | 2026-11-03 | **28 / 28 passed**, 0 failed |
| Live Pages self-test | 2026-11-03 | **28 / 28 passed**, 0 failed |
| Local `index.html` vs live raw (`SHA-1`) | 2026-11-03 | **match** (`8172a4fb…`) |
| Live Pages probe (`curl`) | 2026-11-03 | **200** |
| Headless drone screenshot, 1600 × 1000 | 2026-11-03 | **1,272,374-byte PNG** |
| Headless phone screenshot, 390 × 844 | 2026-11-03 | **286,003-byte PNG** |
| CDN probes (Three.js, OrbitControls, Google Fonts) | 2026-11-03 | **200 / 200 / 200** |
| Headless `--disable-gpu` | 2026-11-03 | **loader stalls, no self-test** (known limitation) |
| Safari / Firefox / Edge / real mobile / screen reader | — | **Not verified** |
| CI | — | **None exists** in this repository |

The documentation commit changes Markdown only; the three application files are
unchanged. The self-test was re-run before and after the docs were written, against both
the local server and the live Pages build.

## 1. Commands

```bash
cd ~/Projects/wat-arun-3d

# run
python3 -m http.server 8080          # http://localhost:8080/
open index.html                      # mostly works from file://, server preferred

# live and dependency probes
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/wat-arun-3d/
curl -s -o /dev/null -w '%{http_code}\n' -m 20 \
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
curl -s -o /dev/null -w '%{http_code}\n' -m 20 \
  "https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js"

# self-test (macOS headless WebGL)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-angle=metal --mute-audio \
  --virtual-time-budget=15000 --timeout=30000 \
  --dump-dom "http://localhost:8080/?selftest=1" > /tmp/watarun-dom.html
grep -o '[0-9]* / [0-9]* checks passed' /tmp/watarun-dom.html
grep -o 'class="row fail"' /tmp/watarun-dom.html | wc -l

# screenshot — drone view, intro bypassed
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-angle=metal --mute-audio \
  --virtual-time-budget=9000 --timeout=25000 --window-size=1600,1000 \
  --screenshot=/tmp/watarun-check.png \
  "http://localhost:8080/?shot=1&cam=orbit"

# negative control: no GPU
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --mute-audio \
  --virtual-time-budget=15000 --timeout=30000 \
  --dump-dom "http://localhost:8080/?selftest=1" > /tmp/watarun-dom-nogpu.html
```

`--virtual-time-budget` must be long enough for the CDN fetch and synchronous world build;
`--timeout` is needed because the render loop never idles.

## 2. Results (2026-11-03)

### Local self-test

```text
28 / 28 checks passed
28 pass rows
0 fail rows
DOM dump: 21,892 bytes
```

The checks cover Three.js r128 and the renderer; the world and the 76 m prang; four
satellites, four mondops, six salas and two yakshas; five hotspots, five list rows and
five markers; the mini-map; three presets and a real dawn→night→dawn switch; six
floodlights, sky and stars; water; ground heights at the boardwalk and terrace; collision
at the prang centre; walk and drone controls; the Web Audio API; journal shape and
filename; live EN↔TH switching; card open/close with three paragraphs; JPEG photo capture;
localStorage persistence; and zero uncaught errors.

```
Three.js r128 loaded                         PASS
Central prang taller than 70 m — 76 m        PASS
Preset switch works                          PASS
Collision blocks the prang                   PASS
No uncaught runtime errors                   PASS
```

### Live self-test

The same command against
`https://somphol.github.io/wat-arun-3d/?selftest=1` produced a 21,892-byte DOM with
**28 / 28 passed** and 0 fail rows. The live page is therefore running the same build that
the local server runs.

### Source match and live probe

```text
GET https://somphol.github.io/wat-arun-3d/          200
local index.html SHA-1                              8172a4fb5a6be8a6c0e2e6e94d536bafcdb610e7
raw main index.html SHA-1                           8172a4fb5a6be8a6c0e2e6e94d536bafcdb610e7
cache-control                                       max-age=600
last-modified                                       Mon, 02 Nov 2026 05:54:48 GMT
```

### Screenshots

| View | Size | Result |
| --- | --- | --- |
| Drone, `?shot=1&cam=orbit`, 1600 × 1000 | 1,272,374 bytes | full sanctuary, river and HUD |
| Phone, `?shot=1&cam=orbit`, 390 × 844 | 286,003 bytes | 3D scene renders; top HUD row clips at the right edge |

Both are headless verification captures in `/tmp`; the repository screenshots were taken
from the running build on 2026-11-01 at the same resolutions.

### Negative control

With `--disable-gpu` the DOM dump is 17,724 bytes, contains no `checks passed` summary and
still shows `Building the riverside sanctuary…`. `THREE.WebGLRenderer` could not be
created, so `init()` threw before the loader advanced. This is the current WebGL-failure
behaviour, recorded in [AGENTS.md §5](../AGENTS.md#5-known-issues), not a passing test.

## 3. Manual matrix

| Area | Check | Status |
| --- | --- | --- |
| Entry | Intro gate appears; camera orbits the prang behind it | Verified headless |
| Entry | "Explore in 3D" enters drone mode; "Walk the courtyard" enters walk mode | Verified by self-test path / code |
| Walk | WASD/arrow movement, Shift sprint, Space jump | Self-test checks controls exist; feel not measured |
| Walk | Collision at the prang, ubosot, salas, trees, river boundary | Prang collision verified by self-test; others by code |
| Walk | Step-up on the terrace ramp and gate | Logic verified by `groundHeight`; not walked end-to-end |
| Drone | Left-drag orbit, wheel zoom, right-drag pan, `1` reset | Orbit object and limits verified; gesture feel not measured |
| Hotspots | Five markers, list rows, card, three paragraphs, quote | Verified by self-test |
| Hotspots | Proximity auto-open and `E` interaction | Logic present; not driven headlessly |
| Language | EN ↔ ไทย updates header, list, open card, mini-map | Verified by self-test |
| Presets | Dawn, sunset, night, and an actual transition | Verified by self-test |
| Mini-map | Canvas, player dot, view cone | Canvas and context verified; pixels not diffed |
| Photo | Capture, JPEG data URL, gallery, delete, 12-photo cap | Capture verified; gallery interaction by code |
| Journal | Autosave, reload restore, export file, import file | Shape and localStorage verified; file round-trip by code |
| Audio | River, chimes, footsteps, mute, narration | API verified; audio quality not measured |
| Layout | Desktop panels and phone drawer/touch pad | Two viewport sizes captured; phone header clips (see §2) |
| Accessibility | Keyboard walking, labels, reduced motion | Present in markup/CSS; no screen-reader pass |

## 4. Failure triage

- **Loader never advances** — first check the CDN requests and the console. Three.js must
  be present before `script.js` runs. With `--disable-gpu`, expect the known WebGL stall.
- **Self-test summary missing** — increase `--virtual-time-budget`, or run with a display
  and `--use-angle=metal`. A short budget can dump the DOM before `runSelfTest()`.
- **All checks fail at "Three.js r128 loaded"** — the network is blocked or the CDN is
  unavailable; this build has no local copy.
- **Thai text shows boxes** — the Google Fonts request failed. Content is still present;
  only the typeface is missing.
- **No narration** — `speechSynthesis` unsupported, no voices installed, or autoplay policy.
  The card shows a status line and the text remains.
- **Photo capture fails** — `preserveDrawingBuffer` is enabled, so check WebGL context loss
  and canvas size, not the encoder alone.
- **Storage write fails** — quota is likely full; the save path halves the photo list once
  and retries. A second failure is reported through `State.errors`.
- **Journal import rejected** — `format` must be `watarun-3d-journal`; photo entries must
  start with `data:image`; unknown hotspot ids are dropped.

## 5. Not verified

- Gesture feel, inertia and collision comfort during a full walked tour.
- Web Audio mix quality, chime randomness, footstep sync and SpeechSynthesis voice
  selection/pronunciation, especially Thai.
- Pointer-lock opt-in, Escape release and immersive mouse look.
- Real touch hardware, pinch zoom, the four-way pad and mobile performance.
- Safari, Firefox, Edge, iOS/Android and screen-reader output.
- The photo gallery's delete/load interactions and a full JSON round-trip on a second
  device.
- Long-session memory use and GPU thermals; texture and geometry disposal is not tested.
- Any graceful WebGL-failure UI; none exists.
- Subresource integrity for the CDN scripts; none is configured.
