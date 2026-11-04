# AGENTS.md — WAT ARUN 3D

> Handoff for the next maintainer or agent. Rebuild detail is in
> [docs/REPRODUCTION.md](docs/REPRODUCTION.md); the technical map is
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 1. What this is

A static, three-file **3D walkthrough of Wat Arun Ratchawararam**, the Temple of Dawn
on the Chao Phraya in Bangkok: `index.html`, `style.css` and one 4,526-line
`script.js` driving **Three.js r128**. Every mesh, texture, shader, chime and footstep
is generated in the browser; the repository ships no model, texture, font or audio
asset used at runtime. It offers five bilingual hotspots, three interpolated lighting
presets, first-person walking with collision and jumping, a drone orbit camera, a live
mini-map, a photo journal persisted to `localStorage`, and portable JSON export/import.

It is **not** an official reconstruction or an affiliated representation of the temple,
not a quiz or game, not a server-backed service, and **not offline-capable**: Three.js,
its two control add-ons and four Google fonts are fetched from CDNs at runtime. There is
no build step, package manager, framework or CI.

Live copy: <https://somphol.github.io/wat-arun-3d/>. Local master:
`~/Projects/wat-arun-3d`. Source version **1.0.0** (`script.js:431`); there is no git tag.

## 2. Commands

```bash
cd ~/Projects/wat-arun-3d

# run — a local server is recommended for storage and pointer lock
python3 -m http.server 8080
open http://localhost:8080/

# built-in self-test: 28 checks, prints the result into the DOM
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-angle=metal --mute-audio \
  --virtual-time-budget=15000 --timeout=30000 \
  --dump-dom "http://localhost:8080/?selftest=1" | grep -o '[0-9]* / [0-9]* checks passed'

# one frame, drone camera (no intro gate)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-angle=metal --mute-audio \
  --virtual-time-budget=9000 --timeout=25000 --window-size=1600,1000 \
  --screenshot=/tmp/wat-arun.png "http://localhost:8080/?shot=1&cam=orbit"

# live probe
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/wat-arun-3d/

# deploy — Pages serves the repository root of main; no workflow
git push origin main
```

Headless WebGL on this Mac needs `--use-angle=metal`. With `--disable-gpu` the renderer
never initialises and the loader stays on screen; that is a known limitation, not a test
failure you can paper over. The complete evidence is in [docs/TESTING.md](docs/TESTING.md).

## 3. Architecture

| File | Lines | Role |
| --- | ---: | --- |
| `index.html` | 311 | head and fonts (1–19), loader (24–35), intro gate (37–62), HUD (64–123), side panels (125–151), bottom bar (153–182), hotspot card (196–227), help (229–283), gallery (285–296), toast/self-test (298–304), CDN scripts (306–309) |
| `style.css` | 579 | palette tokens and base (1–54), stage (55–62), loader (63–93), intro (94–151), buttons (152–185), HUD (186–233), panels (234–298), bottom bar (299–339), crosshair (340–363), modals (364–430), help/gallery (431–453), toast/self-test (454–485), responsive (486–576), reduced motion (577–579) |
| `script.js` | 4,526 | 34 numbered sections: utilities (0), i18n (1), hotspots (2), state (3), renderer (4), textures (5), materials (6), groups (7), helpers (8), sky (9), lighting (10), ground (11), prang (12), satellites (13), ubosot (14), promenade (15), water/gardens (16), markers (17), world build (18), presets (19), audio (20), mini-map (21), DOM (22), language (23), modal (24), controls (25), movement (26), journal (27), audio UI (28), bindings (29), animation (30), intro camera (31), loop (32), self-test (33), init (34) |

Key paths:

- **Boot** — `init()` (`script.js:4404`) sets camera defaults, reads `?lang`, `?preset`,
  `?shot`, builds the world, applies the preset and language, binds UI, restores the
  local journal, places the camera and starts `animate()` (`script.js:4253`).
  `buildWorld()` (`script.js:2466`) is the fixed construction order.
- **State** — one `State` object (`script.js:434`) and one `player` object
  (`script.js:446`). `State` holds `lang`, `preset`, `mode`, `audio`, `visited`,
  `photos`, `lastHotspot`, `startedAt`, `errors`; `player` holds position, velocity,
  yaw/pitch, radius 0.62 and eye height 1.68.
- **Persistence** — one key, `watarun3d.journal.v1` (`script.js:430`), and one export
  filename, `watarun_3d_journal.json` (`script.js:432`). `journalPayload()`
  (`script.js:3693`) defines format version 1; `saveLocal()` (`script.js:3721`)
  debounces through `saveLocalSoon()` (`script.js:3739`, 450 ms).
- **Geometry** — the central prang is `PRANG_TIERS` (`script.js:1426`, eleven tiers)
  fed to `buildPrangTower()` (`script.js:1508`) and wrapped by `buildCentralPrang()`
  (`script.js:1719`). See `buildSatellitePrang` (1752), `buildMondop` (1765),
  `buildUbosot` (1916), `buildYaksha` (1808), `buildPromenade` (2092),
  `buildSala` (2018), `buildWater` (2132), `buildBoats` (2177), `buildGardens`
  (2327), `buildMonks` (2304), `buildGate` (2257), `buildHotspotMarkers` (2411).
- **Coordinates** — `TERRACE` (x −48…36, z −41…41, y 1.5), `BOARDWALK`
  (x 41.5…53.4, |z| ≤ 50, y 0.7) and `RIVER_X = 53.6` (`script.js:1285–1287`).
  `groundHeight()` (`script.js:1289`) owns the terrace/ramp/boardwalk profile; the
  water, collisions and mini-map all assume it.
- **Lighting** — `PRESETS` (`script.js:2490`) defines dawn, sunset and night;
  `applyPreset()` (`script.js:2672`) retargets; `updateLighting()`
  (`script.js:2696`) eases every colour and intensity with
  `k = 1 − exp(−3.4·dt)` and calls `pushLightingToScene()`.
- **Navigation** — `PointerLockControls` and `OrbitControls` are created at
  `script.js:3346–3347`; orbit is clamped to 16–270 m and 0.495π polar angle.
  `setMode()` (`script.js:3375`), `resolveCollisions()` (`script.js:3487`) and
  `updatePlayer()` (`script.js:3534`, walk 4.35 m/s, sprint 8.2 m/s, jump 5.5,
  gravity 19) are the movement contract.
- **Journal** — `capturePhoto()` (`script.js:3617`) renders and downscales to 520 px
  JPEG at quality 0.72, capped at 12 photos; `exportJournal()` (3758),
  `applyJournal()` (3766), `loadJournal()` (3797) and `restoreLocal()` (3833) are the
  import paths.
- **Audio** — `AudioEngine` (`script.js:2724`) synthesises the river buffer, chimes and
  footsteps; `speak()` (`script.js:2913`) uses SpeechSynthesis with `th-TH` / `en-US`.
- **Verification** — `runSelfTest()` (`script.js:4287`) is the only automated harness;
  it asserts 28 facts and writes `window.__SELFTEST__`.

## 4. Decisions and constraints

- **Static, dependency-light delivery.** One classic `<script>` and one IIFE. Do not
  introduce ES modules, a bundler, npm or a framework without a product decision; there
  is no build step to lean on.
- **Three.js is pinned by URL, not vendored.** `index.html:306–308` loads r128 plus the
  two r128 control add-ons from cdnjs/unpkg, with no SRI. Changing the version or host
  requires re-running the full self-test and the screenshots.
- **The network dependency is deliberate and documented.** No offline claim is made.
  Google Fonts (`index.html:15–17`) fall back to system faces when unavailable, but the
  app itself will not run without Three.js.
- **Everything visible is procedural.** Textures are canvas-drawn, geometry is built
  from primitives, audio is synthesised. Adding PNG/GLB/MP3 assets changes the load
  contract and the "no external asset" property.
- **Thai and English are peers.** Each hotspot carries `en` and `th` objects with three
  body paragraphs, quote and narration; `HOTSPOTS` is at `script.js:281`. Keep both
  sides complete or the self-test and the language toggle become misleading.
- **The coordinate system is shared state.** `TERRACE`, `BOARDWALK`, `RIVER_X`,
  `groundHeight()` and `resolveCollisions()` must change together, then the mini-map
  and spawn point checked.
- **Pointer lock is opt-in.** Entry is hold-drag orbit; continuous mouse look is a field
  guide action (`requestLock`, `script.js:3418`). Do not restore automatic capture.
- **The journal format is a contract.** `format: "watarun-3d-journal"`, version 1, key
  `watarun3d.journal.v1`, filename `watarun_3d_journal.json`. A rename needs migration
  for existing browsers and exported files.
- **Photos are compressed for quota reasons.** 520 px wide, JPEG 0.72, newest first,
  maximum 12; `saveLocal()` halves the photo list once on quota failure. Do not raise
  these limits casually.
- **The self-test is the regression gate.** It is coarse and mutates UI state, but it is
  the only automated check. If a change alters a fact it asserts, update the check and
  this documentation together.
- **Documentation-only changes should not touch the three app files.** The published
  copy is served directly from `main`; there is no staging build.

## 5. Known issues

- **No graceful WebGL failure.** If `THREE.WebGLRenderer` cannot be created,
  `init()` throws before the loader advances. Headless `--disable-gpu` leaves the
  "Building the riverside sanctuary…" loader forever; there is no in-page error card.
- **Runtime network dependency.** Three.js, PointerLockControls, OrbitControls and the
  Google Fonts stylesheet are remote. A first load offline fails. The CDN tags have no
  `integrity` attribute.
- **No CI or test runner.** `runSelfTest()` at `?selftest=1` is the whole harness. It
  applies the night preset and restores dawn, switches language, opens and closes a
  hotspot card, captures a photo and writes `localStorage`; it is not hermetic.
- **Only Chrome was verified.** Chromium 156 headless on macOS with Metal-backed WebGL.
  Safari, Firefox, Edge, real iOS/Android, touch gestures and screen-reader output are
  unverified for this release.
- **Thai narration depends on an installed voice.** If no `th` voice exists the browser
  may still speak with a default voice; the visible fallback string is
  `modal.statusNoVoice`, whose English text says "No English voice found" even when the
  selected language is Thai (`script.js:3888`, code inspection).
- **Accessibility is partial.** Icon-only header buttons (`#btn-audio`, `#btn-photo`,
  `#btn-save`, `#btn-load`, `#btn-help`) use `title` but no `aria-label`; dialogs have
  `aria-modal` but no focus trap; the viewport disables user scaling; the 3D stage is
  `aria-hidden`. Keyboard walking and labelled text controls do work.
- **Autosave does not restore the player position.** `journalPayload()` includes
  `player.x/z` and file import applies it, but `restoreLocal()` ignores `data.player`, so
  a reload starts at the default river landing (x 50.4, z 0). An imported position is
  only pushed to the camera while in walk mode.
- **The 390 px header overflows.** In the 390 × 844 headless capture the top HUD row
  runs past the right edge, clipping the icon buttons; the active preset label also
  remains visible despite the `max-width: 390px` rule. The 3D scene and bottom controls
  still render. Desktop and the 760 px breakpoint are not affected by this observation.
- **The self-test is visible.** `?selftest=1` opens the hidden panel, flashes presets and
  can leave the page in a different UI state. Use a separate tab.
- **Build records are historical.** `STATE.md` and `state.json` describe the 2026-11-02
  build and its token snapshot; they are not regenerated by later commits.

## 6. Continuity

- Live: <https://somphol.github.io/wat-arun-3d/> (HTTP 200 at the time of writing).
- Pages: `main` branch, repository root, `.nojekyll` present, no Actions workflow.
- Repository: <https://github.com/somphol/wat-arun-3d>.
- Local master copy: `~/Projects/wat-arun-3d`.
- First build: commit `1d47477` "feat: Wat Arun 3D virtual riverside sanctuary and
  walkthrough studio".
- Navigation revision: commit `e32cf07` "feat: use hold-drag orbit, zoom and pan instead
  of automatic pointer lock".
- Last app/state commit before the documentation release: `3951eaf` "docs: refresh build
  state after navigation revision".
- Documentation release: the commit adding this file and `docs/`.
- Author: Somphol Boonjing, MIT. The temple's name and image belong to the temple and
  the Thai people; this project claims no rights over them.
