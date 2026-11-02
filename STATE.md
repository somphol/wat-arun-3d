# Build State

| Field | Value |
| --- | --- |
| Project | Wat Arun 3D — Virtual Riverside Sanctuary & Walkthrough Studio (`wat-arun-3d`) |
| Session started | 2026-11-02 04:23:32 UTC |
| Build started | 2026-11-02 04:23:32 UTC |
| Packaged | 2026-11-02 05:29:16 UTC |
| Build duration | **1h 5m 44s** (3,944 seconds) |
| Harness | OpenCode 2.2.5 |
| Model | DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`) |
| Session | `ses_e658073f3ffekRYx9rxH0YtBA0` |
| Repository | <https://github.com/somphol/wat-arun-3d> |
| Live demo | <https://somphol.github.io/wat-arun-3d/> |
| Self-test | **28 / 28 PASS** (local and live) |

## Token usage

| Metric | Tokens |
| --- | ---: |
| Input | 490,057 |
| Output | 118,462 |
| Reasoning | 115,075 |
| **Total (input + output + reasoning)** | **723,594** |
| Cache read | 20,549,760 |
| Cache write | 1,548 |
| Total including cache | 21,274,902 |

> Snapshot from the OpenCode session record at 2026-11-02 05:29:16 UTC. Total cost reported by the session: **$0.00**. Writing and committing this state file, the final GitHub push and the closing response happen after this snapshot, so the live session totals are marginally higher. Cache reads/writes are context-usage figures and are reported separately from the input/output/reasoning total.

## What was built

A complete, self-contained 3D walkthrough of Wat Arun in Bangkok in three modular source files — `index.html`, `style.css` and `script.js` — plus seven screenshots and documentation. There is no build step, bundler or package manager.

### 1. Authentic courtyard modelling

- **Central Phra Prang** — eleven tapering tiers rising ~76 m above the terrace, with redented corner buttresses, porcelain niches on four faces, gold cornice bands and mosaic friezes, three circumambulatory galleries with balustrades and gold corner spires, four steep pilgrim staircases, four base stairways and a multi-pronged gilded finial.
- **Indra on Erawan** — a gilded shrine in the upper east niche: three-headed elephant with trunks, tusks and ears, with Indra, crown and vajra above.
- **Four satellite prangs** on the diagonal corners, each a smaller version of the central tower.
- **Four corner mondops** with four columns, mosaic plinths, niches, tiered tile roofs and gold finials.
- **Ubosot and yaksha guardians** — a raised hall with a five-bay porch, gilded doors and windows, steep tiled roof and chofah finials, guarded by Thotsakan (green ceramic armour) and Sahassa Deja (white ceramic armour), each with a tiered crown, breastplate, club and bared fangs.
- **Chao Phraya riverfront** — a raised stone boardwalk, railing, bollards, lamp posts, landing steps and six green granite salas with two-tier roofs, upturned gold eaves, benches and hanging lanterns.
- **Living courtyard** — ceremonial gate with naga rails, paved approach, planters, flag masts, hedges, seventeen blossoming trees, saffron-robed monks and three long-tail boats on an animated river.
- **Procedural PBR** — seven-plus hand-drawn canvas textures for stucco, porcelain mosaic, gold leaf, paving, roof tile, granite, wood and water normals; ACES filmic tone mapping, sRGB output, environment mapping, PCF soft shadows and instanced geometry.

### 2. Dual-mode navigation

- **First-person walk** — WASD/arrow movement, pointer-lock mouse look, drag-look fallback, sprint, jump, head bob, distance-synced footsteps, collision against walls, towers, halls, salas, trees and the river boundary, and step-up handling for the ramp and gate.
- **Drone flyover** — OrbitControls with 360° rotation, pitch to the horizon, 16–270 m zoom and target panning, plus a one-key return to the river view.
- Mode buttons in the HUD, with the walk position preserved when returning from the drone.

### 3. Bilingual hotspots and lighting

- **Five hotspots** at the prang stair, yaksha gate, porcelain niche, river landing and upper Indra niche. Floating gold markers with beams and ground rings; proximity auto-open, click and `E` interaction; bilingual title, subtitle, three paragraphs, quote and device-voice narration.
- **Dawn / Sunset / Night presets** with interpolated sun angle and colour, sky gradient, fog, hemisphere and ambient light, water tint, cloud tint, exposure, stars, six floodlights and glowing lanterns.
- **Instant EN ↔ TH** switching across buttons, descriptions, zones, hints, toasts, mini-map labels and open cards.

### 4. HUD, audio and export

- **Mini-map** with courtyard plan, river, salas, prang, satellites, mondops, hotspot states, player position and view cone.
- **Web Audio synthesis** — looping brown-noise river with a breathing LFO, pentatonic wind chimes with stereo panning and long decays, and synthesised footsteps tied to distance and sprint state.
- **Photo journal** — canvas captures stored as compact JPEG thumbnails.
- **Autosave** of visits, photos, language, preset and audio to `localStorage`.
- **Portable journal** — `watarun_3d_journal.json` export and import.
- **Responsive UI** — desktop panels, phone hotspot drawer, touch-look area and four-way walking pad.
- **28-check self-test** at `?selftest=1`.

## Verification

- **28 / 28** checks pass locally in headless Google Chrome 156 with SwiftShader WebGL.
- The **live GitHub Pages build** was re-tested at **28 / 28**.
- Checks include Three.js r128, the renderer, the scene, the ~76 m prang, four satellites, four mondops, six salas, two yakshas, five hotspots, five marker sprites, the mini-map, three presets and a transition, six floodlights, the sky and stars, water, ground heights, collision, both control systems, hotspot card open/close, Web Audio, journal shape, live language switching, photo capture, localStorage persistence and zero uncaught errors.
- Seven screenshots were captured from the running build at 1600 × 1000 and 500 × 900.

## Files

| File | Size |
| --- | ---: |
| `index.html` | 16,649 bytes · 304 lines |
| `style.css` | 31,807 bytes · 575 lines |
| `script.js` | 195,499 bytes · 4,445 lines |
| `README.md` | 17,295 bytes · 303 lines |
| `screenshot.png` | 1.12 MB |
| `screenshot-walk.png` | 1.22 MB |
| `screenshot-sunset.png` | 1.03 MB |
| `screenshot-night.png` | 1.01 MB |
| `screenshot-hotspot.png` | 553 KB |
| `screenshot-thai.png` | 527 KB |
| `screenshot-mobile.png` | 363 KB |

## How to run

```bash
cd wat-arun-3d
python3 -m http.server 8080
# open http://localhost:8080
```

Self-test: <http://localhost:8080/?selftest=1>

Or use the live demo: <https://somphol.github.io/wat-arun-3d/>

## Requirements coverage

| Requirement | Status |
| --- | --- |
| Central prang with galleries, stairs, finial and porcelain material | ✅ |
| Four satellite prangs and four corner mondops | ✅ |
| Ubosot entrance with Thotsakan and Sahassa Deja | ✅ |
| Six green granite river salas and animated water | ✅ |
| First-person WASD walking with collision and jump | ✅ |
| Drone orbit with 360° rotation, pitch and zoom | ✅ |
| Five bilingual hotspots with narration | ✅ |
| Golden Dawn, Sunset Glow and Night Illumination | ✅ |
| EN/TH UI switch for all labels and content | ✅ |
| Mini-map with live position and view vector | ✅ |
| Web Audio river, chimes and footsteps | ✅ |
| localStorage autosave and JSON export/import | ✅ |
| Three modular files: index.html, style.css, script.js | ✅ |

## Credits

Built with **OpenCode 2.2.5** and **DeepSeek V4.1 Flash** (`opencode-go/deepseek-v4.1-flash`) in a single agent session. The application code, procedural architecture, shaders, textures, bilingual copy, audio synthesis, documentation and verification harness were generated for this project.

Runtime libraries: [Three.js](https://threejs.org/) r128, PointerLockControls and OrbitControls (MIT). Typefaces: **Cinzel**, **Inter**, **Noto Sans Thai** and **Noto Serif Thai** from Google Fonts (SIL OFL 1.1). No third-party photographs, textures, 3D models or audio recordings are used. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

*Wat Arun Ratchawararam is a living temple. This is an independent educational homage, not an official reconstruction or an affiliated representation.*
