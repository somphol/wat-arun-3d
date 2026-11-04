# Architecture

`wat-arun-3d` is a static, three-file Three.js walkthrough. There is no build step, no
module graph and no asset pipeline: `index.html` loads `style.css`, three CDN scripts and
one IIFE in `script.js`. This map exists so a change can be made without reading all
5,416 source lines.

## 1. File map

| File | Lines | Contents |
| --- | ---: | --- |
| `index.html` | 311 | head, meta and Google Fonts (1–19), WebGL stage (22), loader (24–35), intro gate (37–62), HUD and controls (64–123), hotspot list (125–136), mini-map panel (138–151), bottom bar and touch pad (153–182), mobile hotspot toggle (184–188), crosshair/prompts (190–194), hotspot card (196–227), field guide (229–283), photo gallery (285–296), toast (298), self-test panel (300–304), CDN scripts (306–309) |
| `style.css` | 579 | palette and base (1–54), stage (55–62), loader (63–93), intro (94–151), buttons (152–185), HUD top (186–233), panels (234–298), bottom bar (299–339), crosshair (340–363), modals (364–430), help/gallery (431–453), toast (454–473), self-test (474–485), responsive 1180/960/760 px (486–565), small screens 390/420 px (566–576), reduced motion (577–579) |
| `script.js` | 4,526 | 34 numbered sections, listed below |
| `favicon.svg` | — | stylised prang mark |
| `screenshot*.png` | — | seven captures used by the README |
| `STATE.md`, `state.json` | — | historical build record, not generated at runtime |

`script.js` section map:

| § | Lines | Subject |
| ---: | --- | --- |
| 0 | 9–24 | utilities, touch/URL flags |
| 1 | 25–277 | `I18N` English/Thai dictionary |
| 2 | 278–426 | `HOTSPOTS` content and `HOTSPOT_BY_ID` |
| 3 | 427–475 | storage keys, `State`, `player`, `ZONES` |
| 4 | 476–510 | renderer, scene, camera, DPR cap |
| 5 | 511–878 | canvas textures and water normal map |
| 6 | 879–961 | `MAT` materials |
| 7 | 962–988 | scene groups, collider and animation registries |
| 8 | 989–1042 | mesh/box/instanced helpers, collider helpers |
| 9 | 1043–1226 | sky shader, sun sprite, stars, environment |
| 10 | 1227–1281 | light rig |
| 11 | 1282–1422 | terrace, ramp, boardwalk, river, `groundHeight` |
| 12 | 1423–1739 | prang tiers, galleries, finial, Indra niche |
| 13 | 1740–1804 | satellite prangs and mondops |
| 14 | 1805–2014 | ubosot, yakshas, chofah, gate |
| 15 | 2015–2128 | promenade, six salas, lanterns |
| 16 | 2129–2368 | water, boats, contact shadows, monks, gardens |
| 17 | 2369–2455 | hotspot marker sprites and beams |
| 18 | 2456–2486 | `setLoader`, `buildWorld` |
| 19 | 2487–2720 | `PRESETS`, `applyPreset`, `updateLighting` |
| 20 | 2721–2944 | Web Audio synthesis and speech |
| 21 | 2945–3101 | mini-map |
| 22 | 3102–3161 | DOM references and toasts |
| 23 | 3162–3228 | language switching |
| 24 | 3229–3342 | hotspot card, visits, proximity |
| 25 | 3343–3483 | OrbitControls, PointerLockControls, mode switching |
| 26 | 3484–3607 | collision resolution and player movement |
| 27 | 3608–3859 | photos, journal payload, save/export/import |
| 28 | 3860–3895 | audio button and narration |
| 29 | 3896–4186 | all UI bindings, resize, start experience |
| 30 | 4187–4240 | world animation |
| 31 | 4241–4249 | intro orbit camera |
| 32 | 4250–4283 | main loop |
| 33 | 4284–4391 | self-test |
| 34 | 4392–4526 | initialisation and global inspection handle |

## 2. Runtime state

```js
State = {
  lang: 'en', preset: 'dawn', mode: 'orbit', audio: true,
  visited: [], photos: [], lastHotspot: null,
  startedAt: Date.now(), errors: []
}

player = {
  x: 50.4, z: 0, y: 0.7, vy: 0, onGround: true,
  radius: 0.62, eye: 1.68, yaw: π/2, pitch: 0.10
}
```

Both are module-level (`script.js:434` and `script.js:446`). Other session values include
`keys`, `touchMove`, `clock`, `stepState`, `colliders`, `buildStats`, `lightTarget`,
`LIGHT_NOW`, `inModal`, `introVisible`, `hoverHotspot`, `markerSprites`, `saveTimer` and
`envTimer`. None are persisted except through the journal.

| Value | Persisted? | Notes |
| --- | --- | --- |
| `State.visited`, `State.photos` | yes, `localStorage` + JSON | filtered against known hotspot ids on restore |
| `State.lang`, `State.preset`, `State.audio` | yes | restored without replaying audio |
| `player.x/z` | JSON export only | `restoreLocal()` ignores it |
| camera position, orbit target | no | recreated per mode |
| `State.errors` | no | feeds the last self-test check |

The storage key is `watarun3d.journal.v1`; the export filename is
`watarun_3d_journal.json`; `APP_VERSION` is `1.0.0` (`script.js:430–432`).

## 3. World construction and coordinates

`buildWorld()` (`script.js:2466`) runs a fixed order, because later builders rely on
earlier materials and groups:

1. `buildGround()` — terrace, ramp, boardwalk, far bank.
2. `buildCentralPrang()` — eleven `PRANG_TIERS` (`script.js:1426`), galleries, stairs,
   finial, Indra shrine.
3. Four satellite prangs at radius 20.4, 45° offsets.
4. Four mondops at radius 33.0, 45° offsets.
5. `buildUbosot()` and the two yakshas.
6. `buildPromenade()` with six salas.
7. `buildWater()` and `buildBoats()`.
8. `buildGardens()`, `buildMonks()`, `buildGate()`, `buildContactShadows()`.
9. `buildHotspotMarkers()`.

The ground contract (`script.js:1285–1297`):

| Region | Extent | Height |
| --- | --- | --- |
| Terrace | x −48…36, z −41…41 | 1.5 |
| Ramp | x 36…41.5, \|z\| ≤ 8.5 | lerp 1.5 → 0.7 |
| Boardwalk | x 41.5…53.4, \|z\| ≤ 50 | 0.7 |
| River | x > 53.6 | plane at water level |

`groundHeight(x, z)` is the single source of truth used by spawning, jumping and the
camera. `resolveCollisions()` clamps x to −47.1…52.8 and z to ±48.4, then iterates
circles and axis-aligned boxes three times. Colliders are registered by the builders
through `addCircle()` / `addBoxCollider()` (`script.js:1038–1041`).

## 4. Lighting, sky and presets

`PRESETS` (`script.js:2490`) holds three complete targets. Every target carries sun
colour/intensity/direction, three sky stops, sun glow, star amount, fog colour and
density, hemisphere and ambient values, exposure, floodlight level, moon level, water
tint and sun-sprite scale.

`applyPreset(name, instant)` (`script.js:2672`) sets `lightTarget`, updates the HUD and
`data-preset`, and either copies the target immediately or lets `updateLighting()` ease
toward it. The easing constant is `1 − exp(−3.4·dt)` (`script.js:2697`), which is roughly
a one-second transition. `updateEnvironment()` (`script.js:1215`) rebuilds the PMREM
environment map after the transition settles (1100 ms timer).

The floodlights, lanterns, stars, water normal offset and marker bobbing are animated in
`animateWorld()` (`script.js:4190`); the intro camera is a separate slow orbit in
`updateIntroCamera()` (`script.js:4244`).

## 5. Navigation and collision

Two control objects share the camera:

- `pointer = new THREE.PointerLockControls(...)` — explicit opt-in only.
- `orbit = new THREE.OrbitControls(...)` — damping 0.07, rotate 0.55, zoom 0.9, pan 0.6,
  distance 16–270, max polar 0.495π, disabled until drone mode.

`setMode('walk' | 'orbit', silent)` (`script.js:3375`) toggles the body class, enables
the right control, places the camera and swaps the 52°/60° field of view. Walk mode uses
`updatePlayer()`:

- movement basis from `camera.getWorldDirection()`, flattened to the XZ plane;
- walk 4.35 m/s, sprint 8.2 m/s (`Shift`);
- jump impulse 5.5, gravity 19;
- step-up is implicit in `groundHeight()`, which returns the terrace/ramp/boardwalk
  height at the new position;
- head bob and footsteps are driven by distance walked, not time;
- the camera is set to `player.y + eye + bob`.

Drone mode delegates to OrbitControls; the walk position is not changed while orbiting,
which is why switching back returns to the same spot.

## 6. UI, hotspots and language

`HOTSPOTS` (`script.js:281`) is the content model: `id`, number, icon, accent, world
position, radius, `auto`, zone, and `en`/`th` copies. Each copy has `eyebrow`, `title`,
`thaiTitle`, three `body` paragraphs, `quote` and a `narrate` string.

`openHotspot()` (`script.js:3252`) fills the card, marks the visit and stops any current
speech; `updateNearby()` (`script.js:3322`) auto-opens the inner ring of an `auto`
hotspot unless it is in `suppressed`. `setLanguage()` (`script.js:3203`) rewrites every
`[data-i18n]` node, the document `lang`, the hotspot list and any open card.

The mini-map is a 240 × 240 canvas with a fixed transform `scale = 1.62`
(`script.js:2948–2951`). `drawMinimap()` (`script.js:2953`) paints the river, terrace,
boardwalk, buildings, hotspots (gold/green), player dot and view cone. It is called every
other frame while the intro is hidden.

## 7. Journal, photos and audio

```text
visited / photos / settings / player
        ↓ journalPayload()
        ├─ saveLocal() ── localStorage['watarun3d.journal.v1']
        ├─ exportJournal() ── watarun_3d_journal.json
        └─ applyJournal() / loadJournal() / restoreLocal()
```

`journalPayload()` (`script.js:3693`) is the format definition. `capturePhoto()`
(`script.js:3617`) re-renders the scene, draws it into a 520 px-wide canvas and encodes
JPEG at 0.72; only the newest 12 survive. `saveLocal()` (`script.js:3721`) catches quota
errors, halves the photo list once, and retries; `saveLocalSoon()` debounces by 450 ms.

`AudioEngine` (`script.js:2724`) builds one graph on the first gesture:

- brown-noise river buffer, low-pass at 760 Hz, band-pass shimmer at 1500 Hz, 0.09 Hz
  LFO on the lap gain;
- pentatonic chimes scheduled from `nextChime`, with stereo pan and long decay;
- band-passed noise footsteps triggered by distance walked;
- `SpeechSynthesisUtterance` for narration, preferring `th-TH` or `en-US`.

## 8. Interaction flow

```text
intro gate ── startExperience()
                ├─ AudioEngine.init() / resume()
                ├─ setMode('orbit' | 'walk')
                └─ saveLocalSoon()

frame ── animate()
          ├─ intro? updateIntroCamera()
          ├─ else updatePlayer() + orbit.update() + updateNearby()
          ├─ updateHoverTarget() every 3rd frame
          ├─ updateLighting() + animateWorld()
          ├─ AudioEngine.tick()
          ├─ drawMinimap() every 2nd frame
          └─ renderer.render()

hotspot marker / list / E ── openHotspot() ── renderModal() ── markVisited()
                                                       └─ saveLocalSoon()
```

## 9. Change guide

| To change… | Touch | Watch out for |
| --- | --- | --- |
| Palette, typography, layout | `style.css` tokens and section blocks | Thai line height and mobile drawer depend on the same tokens |
| Ground plan or spawn | `TERRACE`, `BOARDWALK`, `RIVER_X`, `groundHeight`, `player` | update collision clamps, water and mini-map together |
| Prang silhouette | `PRANG_TIERS`, `buildPrangTower`, `addGallery`, `addFinial` | selftest expects height > 70 m (reports 76 m) |
| Courtyard objects | the relevant `build*` function in §12–16 | register colliders and instanced batches |
| Hotspot copy or position | `HOTSPOTS`, `buildHotspotMarkers` | keep `en`/`th` parity and update the five-row assertions |
| Lighting mood | `PRESETS`, `pushLightingToScene`, `updateEnvironment` | test all three presets, not just dawn |
| Walking feel | `updatePlayer` speeds/gravity, `resolveCollisions` | step-up is a `groundHeight` property, not a separate solver |
| Drone framing | `resetDrone`, `startExperience`, orbit min/max | `?shot=1&cam=orbit` is the screenshot path |
| Journal fields | `journalPayload`, `applyJournal`, `restoreLocal` | bump `version`, keep import backward compatible |
| Photo quota | `capturePhoto`, `saveLocal` | storage quota failure is handled once, not indefinitely |
| Audio character | `AudioEngine.init`, `chime`, `footstep` | the graph must be created after a user gesture |
| UI copy | `I18N` in §1 and `data-i18n` in `index.html` | every key needs both languages |

Keep the app static: no build step, no module rewrite, no added binary assets. A change
that needs any of those is a product decision, not a refactor.
