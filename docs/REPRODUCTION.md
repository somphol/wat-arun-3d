# Reproduction book

How to rebuild **Wat Arun 3D — Virtual Riverside Sanctuary & Walkthrough Studio** from
scratch, or re-verify that a rebuild matches the published release. Read
[ARCHITECTURE.md](ARCHITECTURE.md) first for the file and function map.

> **The source is the truth.** `main` at HEAD is the release. Rebuild only when the files
> are unavailable or you deliberately want a variant. There is no generated bundle, no
> tagged release and no asset pipeline.

## 1. What is being reproduced

A static, three-file 3D walkthrough of Wat Arun on the Chao Phraya:

- **Architecture** — an eleven-tier central prang ~76 m tall with galleries, balustrades,
  steep stairs, a gilded finial and an Indra-on-Erawan niche; four satellite prangs; four
  corner mondops; an ubosot with two yaksha guardians; six riverside salas; a gate, monks,
  boats, trees and a procedural river.
- **Bilingual content** — five hotspots, each with English and Thai title, subtitle,
  three paragraphs, pull quote and narration; every HUD label, zone, hint and toast has
  both languages.
- **Navigation** — first-person WASD/arrow walking with sprint, jump, collision and
  step-up; drone orbit with zoom and pan; touch pad and drag-look.
- **Lighting** — Golden Dawn, Sunset Glow and Night Illumination, eased over about a
  second, with six floodlights, stars and a water reflection path.
- **Audio** — synthesised river bed, wind chimes and footsteps; SpeechSynthesis
  narration. No audio files.
- **Journal** — visits and up to 12 JPEG thumbnails in `localStorage`, plus a portable
  `watarun_3d_journal.json` export/import with settings and player position.
- **Verification** — a built-in 28-check self-test at `?selftest=1`.
- **Delivery** — `index.html` + `style.css` + `script.js`; Three.js r128 from CDNs; no
  build, package manager, CI or offline mode.

## 2. Requirements matrix

| # | Requirement | Implementation | Where |
| ---: | --- | --- | --- |
| 1 | Central prang over 70 m, eleven tiers, galleries, stairs, finial | `PRANG_TIERS`, `buildPrangTower`, `buildCentralPrang` | `script.js` |
| 2 | Four satellite prangs and four mondops | `buildSatellitePrang`, `buildMondop`, `buildWorld` | `script.js` |
| 3 | Ubosot with Thotsakan and Sahassa Deja | `buildUbosot`, `buildYaksha` | `script.js` |
| 4 | Six granite salas and river landing | `buildPromenade`, `buildSala` | `script.js` |
| 5 | Animated Chao Phraya and long-tail boats | `buildWater`, `buildBoat`, `buildBoats` | `script.js` |
| 6 | First-person walking, sprint, jump, collision, step-up | `updatePlayer`, `resolveCollisions`, `groundHeight` | `script.js` |
| 7 | Drone orbit with 16–270 m zoom and pan | `OrbitControls` setup, `setMode`, `resetDrone` | `script.js` |
| 8 | Five bilingual hotspots with narration and proximity | `HOTSPOTS`, `buildHotspotMarkers`, `openHotspot`, `updateNearby`, `speak` | `script.js` |
| 9 | Three lighting presets with interpolation | `PRESETS`, `applyPreset`, `updateLighting`, `updateEnvironment` | `script.js` |
| 10 | Instant EN ↔ TH switch across all UI | `I18N`, `setLanguage`, `data-i18n` | `script.js`, `index.html` |
| 11 | Mini-map with player position and view cone | `MM`, `drawMinimap` | `script.js` |
| 12 | Synthesised river, chimes and footsteps | `AudioEngine.init`, `chime`, `footstep`, `tick` | `script.js` |
| 13 | Photo capture and gallery | `capturePhoto`, `renderGallery` | `script.js` |
| 14 | Autosave and JSON export/import | `journalPayload`, `saveLocal`, `exportJournal`, `applyJournal`, `loadJournal`, `restoreLocal` | `script.js` |
| 15 | Responsive desktop/phone layout with touch pad | media queries, `#touch-pad`, drawer bindings | `style.css`, `index.html` |
| 16 | Built-in regression check | `runSelfTest` (`?selftest=1`) | `script.js` |
| 17 | Static hosting with no build | plain scripts, `.nojekyll`, root `index.html` | repository root |
| 18 | Educational, non-affiliated framing | README, intro, help, journal credits | `README.md`, `index.html` |

## 3. Build order

1. **Shell** — `index.html` head/meta/fonts, stage, loader, intro gate, HUD, side panels,
   bottom bar, hotspot card, help, gallery, toast, self-test panel. Keep the stage as the
   only WebGL surface.
2. **Theme** — CSS palette and base, then loader/intro, HUD, panels, modals, responsive
   breakpoints and reduced motion. Thai line-height must be checked before layout is
   frozen.
3. **Renderer skeleton** — scene, camera, fog, WebGL renderer, ACES tone mapping, sRGB,
   PCF soft shadows, DPR cap, resize handler. Confirm a lit plane before adding geometry.
4. **Textures and materials** — canvas stucco, porcelain mosaic, gold leaf, paving, roof
   tile, granite, wood and water normal maps; `MAT` and `GEO` caches.
5. **Ground contract** — terrace, ramp, boardwalk, river plane, `groundHeight`, collision
   clamps and the player spawn. Freeze these coordinates before placing buildings.
6. **Central prang** — `PRANG_TIERS`, tower body, corner buttresses, niches, galleries,
   stairs, finial and Indra niche. Verify the reported height is 76 m.
7. **Satellites and mondops** — reuse the tower builder at smaller scale; four of each on
   the diagonal corners.
8. **Ubosot and guardians** — hall, porch, roof, chofah, doors, two yakshas and colliders.
9. **Promenade and water** — boardwalk, railing, bollards, lamps, six salas, river
   material, light path, boats.
10. **Courtyard life** — gate, trees, blossoms, hedges, monks, contact shadows, hotspot
    marker sprites.
11. **Interaction** — i18n dictionary, hotspot model, list, card, visits, proximity, orbit
    and pointer-lock controls, walking, collision, mini-map.
12. **Lighting** — the three preset objects, easing, environment regeneration, floodlights
    and stars.
13. **Audio and journal** — Web Audio graph, chimes, footsteps, speech, photo capture,
    payload, autosave, export/import.
14. **Verification and docs** — self-test, screenshots, README, CHANGELOG, this set.

## 4. Acceptance checks

A rebuild is done when all of these pass:

1. `python3 -m http.server 8080` serves the page; the intro gate appears with the prang
   loader behind it and "Explore in 3D" / "Walk the courtyard".
2. `?selftest=1` reports **28 / 28 checks passed** locally, with zero `.row.fail` rows.
3. The same self-test reports **28 / 28** against the live Pages URL.
4. Five gold markers are visible in the scene; the hotspot list has five rows; each card
   opens with three body paragraphs, a quote and narration.
5. EN/ไทย switches the header, list, open card and mini-map labels without reload.
6. Dawn → Sunset → Night visibly changes sun colour, sky, fog, exposure, stars and
   floodlights over about a second; returning to Dawn restores the warm scene.
7. Walk mode moves with WASD, sprints with Shift, jumps with Space, and cannot pass
   through the prang, ubosot, salas, trees or river boundary.
8. Drone mode orbits with left drag, zooms with the wheel, pans with right drag, and `1`
   returns to the river three-quarter view.
9. A photo capture produces a JPEG data URL; the gallery shows it; more than 12 photos
   leaves the newest 12.
10. Visits, photos, language, preset and audio survive a reload; export produces
    `watarun_3d_journal.json`; importing it restores the same state.
11. Audio starts only after a gesture; the river loops, chimes are sparse and footsteps
    follow distance.
12. Screenshots at 1600 × 1000 and 390 × 844 render a live canvas, not a blank stage.
13. The live `index.html` SHA-1 matches the local file.
14. The loader advances to 100% on a machine with working WebGL. Headless
    `--disable-gpu` is expected to stall; record it as a known limitation.

Record what you actually ran in [TESTING.md](TESTING.md), including failures.

## 5. Provenance

| Item | Value |
| --- | --- |
| Initial build | `1d47477` "feat: Wat Arun 3D virtual riverside sanctuary and walkthrough studio" |
| Navigation revision | `e32cf07` "feat: use hold-drag orbit, zoom and pan instead of automatic pointer lock" |
| Build-state refresh | `3951eaf` "docs: refresh build state after navigation revision" |
| Release docs | this commit (`AGENTS.md` + `docs/`) |
| Three.js | r128 from cdnjs; PointerLockControls and OrbitControls from unpkg |
| Fonts | Cinzel, Inter, Noto Sans Thai, Noto Serif Thai (Google Fonts, SIL OFL 1.1) |
| Author | Somphol Boonjing, MIT |

There is no tagged release and no build artefact. `CHANGELOG.md` is the change record;
`STATE.md` / `state.json` are the 2026-11-02 build receipt and are not regenerated by
later commits.
