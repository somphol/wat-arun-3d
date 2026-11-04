# Deployment

Hosted on **GitHub Pages**, served straight from `main` as a static site. There is no
build artefact, package manager or workflow: what is committed is what is served.

- Live URL: <https://somphol.github.io/wat-arun-3d/>
- Repository: <https://github.com/somphol/wat-arun-3d>
- Source branch: `main`, folder `/` (repository root)
- Entry file: `index.html`
- Runtime network calls: **Three.js r128, two control add-ons and Google Fonts** (see §3)

## 1. Deploy a change

```bash
cd ~/Projects/wat-arun-3d

# 1. verify locally
python3 -m http.server 8080        # http://localhost:8080/
#    run the matrix in docs/TESTING.md

# 2. commit and push
git add -A
git commit -m "…"
git push origin main
```

Pages rebuilds on push, usually within a minute. Confirm:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/wat-arun-3d/
```

Re-check that the served document is the committed one:

```bash
shasum index.html
curl -sL https://raw.githubusercontent.com/somphol/wat-arun-3d/main/index.html | shasum
```

At the documentation release both hashes were
`8172a4fb5a6be8a6c0e2e6e94d536bafcdb610e7`.

## 2. Repository settings that matter

| Setting | Value | Why |
| --- | --- | --- |
| Pages source | Deploy from a branch → `main` → `/ (root)` | the app lives at the root |
| Custom domain | none | default `*.github.io` host |
| Enforce HTTPS | on | default certificate |
| Actions | none required | no workflow exists in `.github/workflows/` |

`.nojekyll` is committed. Keep it: it stops Jekyll from processing the site and keeps the
publish path a plain static copy. The app uses classic `<script>` tags, so MIME handling
is simple; `index.html`, `style.css` and `script.js` are served as their normal types.

## 3. Files that are published

Everything in the repository root is public, including documentation and screenshots:

- `index.html` — document, HUD, cards and dialogs
- `style.css` — all layout, responsive rules and visual design
- `script.js` — scene, textures, builders, controls, audio, journal
- `favicon.svg` — prang mark
- `screenshot.png`, `screenshot-walk.png`, `screenshot-sunset.png`,
  `screenshot-night.png`, `screenshot-hotspot.png`, `screenshot-thai.png`,
  `screenshot-mobile.png` — README images, about 6.2 MB total
- `README.md`, `CHANGELOG.md`, `AGENTS.md`, `docs/*.md`
- `STATE.md`, `state.json` — historical build record
- `THIRD_PARTY_NOTICES.md`, `LICENSE`
- `robots.txt`, `sitemap.xml` — crawler hints

There is no secrets file, no environment variable and no runtime configuration.

**Runtime network dependencies.** These are real requests on every cold load, not
navigation links:

| Request | Host | Purpose |
| --- | --- | --- |
| `three.min.js` r128 | `cdnjs.cloudflare.com` | Three.js core |
| `PointerLockControls.js` r128 | `unpkg.com` | optional immersive mouse look |
| `OrbitControls.js` r128 | `unpkg.com` | drone camera |
| Google Fonts stylesheet | `fonts.googleapis.com` | Cinzel, Inter, Noto Sans/Serif Thai |
| Font files | `fonts.gstatic.com` | the same four families |

The CDN script tags have no `integrity` attribute. If a host is unreachable the app does
not run; if only fonts fail, the browser falls back to system faces. Do not describe the
site as offline-capable.

## 4. Rollback

Pages serves the current `main`, so rolling back is a normal history operation:

```bash
git revert <bad-commit>          # preferred: keeps history
git push origin main
```

or, for an immediate local reset:

```bash
git reset --hard <good-commit>
git push --force-with-lease origin main
```

Force-pushing rewrites published history; prefer `git revert` unless the bad commit
contains something that must not remain public.

## 5. Caching

At the time of writing the live document returned:

```text
cache-control: max-age=600
etag: "6ae825a8-448e"
last-modified: Mon, 02 Nov 2026 05:54:48 GMT
```

A browser may keep an old `index.html` for up to ten minutes. After a deploy, hard-refresh
(Shift-Reload) or check in a private window. There is no service worker and no offline
cache to invalidate. Pages serves ETags, so conditional requests are cheap.

## 6. Local preview versus production

`file://` mostly works because the scripts are classic, not modules, but a local server is
the supported preview:

```bash
python3 -m http.server 8080
open http://localhost:8080/
```

Reasons to use HTTP: `localStorage` origins are more predictable, pointer lock is treated
as a secure context feature by some browsers, and the CDN/font requests behave as they do
in production. `?shot=1` bypasses the intro gate for screenshots; `?selftest=1` runs the
28 checks after initialisation.

## 7. Platform requirements

- A browser with **WebGL** and JavaScript enabled. Chrome/Chromium is the verified target;
  Safari, Firefox, Edge and real mobile devices are unverified for this release.
- On macOS headless Chrome, WebGL needs `--use-angle=metal`. With `--disable-gpu` the
  renderer is not created, `init()` throws and the loader remains on screen; there is no
  in-page fallback message.
- Touch devices get the four-way pad and drag-look at 760 px and below, but real touch
  hardware has not been tested.
- No installation, service worker or manifest; there is nothing to add to a home screen.
