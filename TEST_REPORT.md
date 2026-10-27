# Test report — Ayushman Saha portfolio

Date: 2026-10-27 · Node 20.20.2 · Chromium 141 (headless, SwiftShader for WebGL in QA only)
Everything below was executed in this workspace against the real build. Anything not run is
listed in **§8 Not verified**.

---

## 1. Static checks

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc -b` | **pass** (strict, `noUncheckedIndexedAccess`, `noUnusedLocals`) |
| ESLint | `npx eslint . --max-warnings 0` | **pass**, 0 warnings |
| Production build | `npm run build` | **pass** |

Build output (gzip):

| Asset | Size | Gzip |
| --- | --- | --- |
| `index.html` | 3.88 kB | 1.43 kB |
| `index-*.css` | 46.62 kB | 9.96 kB |
| `index-*.js` (app) | 202.26 kB | 64.04 kB |
| `Scene-*.js` (Three.js + R3F) | 817.61 kB | 220.04 kB — **lazy chunk** |

`dist/index.html` contains **no `modulepreload`** for the 3D chunk; verified by inspecting the
built HTML after removing `manualChunks` (which had silently made Three.js eager).

---

## 2. Accessibility — axe-core 4.10.2

Rule sets: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`. Page scrolled/rendered
with all reveals forced visible.

```
VIOLATIONS: 0
```

Two issues found during the run and fixed:
1. `landmark-complementary-is-top-level` — nested `<aside>` landmarks → converted to labelled
   `role="group"` containers.
2. Duplicate `id` values from four `ResumeButton` instances → dialogs now use `useId()`.

Manual checks:
- Skip link is the first tab stop and jumps to `#main`.
- All focusable elements show a 2 px cyan focus ring (`:focus-visible`).
- Tabs implement the WAI-ARIA tabs pattern: roving `tabIndex`, `ArrowLeft/Right/Up/Down`,
  `Home`/`End`, `aria-selected`, `aria-controls`/`aria-labelledby` wiring.
- The resume dialog uses native `<dialog>` + `showModal()` (focus trap, `Escape`), restores
  focus to the trigger on close, and closes on backdrop click.

---

## 3. Interaction suite — 28/28 pass

Reproduce with `.tools/interact.mjs` (dev server on :5173):

```
PASS  skip link is first tab stop
PASS  hero terminal: ArrowRight selects next step
PASS  hero terminal: Home selects first step
PASS  pipeline diagram: ArrowDown moves to next step
PASS  pipeline diagram: panel content follows selection
PASS  <details> technical breakdown opens on click
PASS  project card role/notes disclosure opens
PASS  resume fallback dialog opens when PDF absent
PASS  fallback dialog offers a working email route
PASS  resume dialog closes on Escape
PASS  focus returns to the resume trigger
PASS  all primary nav anchors resolve
PASS  nav click scrolls to the Experience section
PASS  active nav follows the section in view
PASS  keyboard Enter on a nav link reaches Contact
PASS  all six project/demo/video links present
PASS  no page errors during interaction pass
PASS  mobile: menu button is visible
PASS  mobile: toggle exposes an accessible name
PASS  mobile: menu opens and links are reachable
PASS  mobile: Escape closes menu
PASS  mobile: tapping a nav link scrolls to the section
PASS  reduced motion: parallax float animation disabled
PASS  reduced motion: reveal content is visible without animation
PASS  reduced motion: hero step autoplay does not advance
PASS  WebGL blocked: static SVG constellation fallback renders
PASS  WebGL blocked: no dead canvas is left behind
PASS  WebGL blocked: hero terminal still interactive
```

Bugs found and fixed by this suite (in addition to the two listed above):
- `.stage__layer--editor` never matched its CSS (class-name mismatch) → the editor panel
  stayed visible on phones and overflowed the page.
- Nav tracking used intersection ratios, which mis-report very tall sections → replaced with a
  scroll-position model (section top crossing a 180 px reading line).
- Reduced motion left the hero's drift animation running → explicitly disabled in CSS and in JS.
- The drifting (animated) element contained the terminal's clickable tabs, so tab clicks could be
  rejected while it moved → only the decorative editor drifts now; the interactive panel is static.
- The terminal panel changed height between the three steps (and the SQL command wrapped at
  1440 px) → transcripts shortened to fit one line and the log area reserves six lines, so the
  panel height is identical across steps at every tested width.
- A floating "mcp · filesystem · shell" chip was clipped by the stage's `overflow: clip` and also
  collided with the editor's `MCP` badge → removed (the editor tab already carries that signal).

Final re-run after all fixes: **axe 0 violations**, **28/28 interaction checks**, **0 overflowing
elements at all nine widths**.

---

## 4. Responsive / layout

Automated overflow probe at 360, 390, 430, 768, 834, 1024, 1280, 1440 and 1920 px:
`scrollWidth === clientWidth` at **every** width (0 overflowing elements).

Previously failing: `document.scrollWidth` was 380/414/459 at 360/390/430 px because two
decorative hero overlays extended past the stage. Fixed by clipping the stage
(`overflow: clip`) and `overflow-x: clip` on `html`/`body`.

Hydration/consistency: exactly one `<h1>`, one `<main>`, no `<img>` without `alt`
(the design uses inline SVG and CSS only).

Screens reviewed visually at 1440×900, 1440×1400, 834×1112, 390×844 and 390×1200.

---

## 5. Performance (production build, `vite preview`)

Measured in headless Chromium (real numbers from this sandbox — not a Lighthouse score):

| Scenario | LCP | CLS | DCL | Transfer (initial) |
| --- | --- | --- | --- | --- |
| Desktop 1440 | 1.34 s | **0.000** | 40 ms | ~366 KB (incl. 3D chunk) |
| Mobile 390, CPU 4× throttled | 0.57 s | **0.000** | 107 ms | ~366 KB |

- With WebGL disabled the initial transfer drops to **~151 KB** — the Three.js chunk is never
  requested, confirming true lazy loading.
- The app shell renders and the hero copy is readable before the 3D chunk arrives (the chunk is
  requested only after `requestIdleCallback` and after a WebGL capability probe).
- Fonts are self-hosted (`woff2`, ~79 KB total) and preloaded; no third-party requests, no
  analytics, no cookies.

---

## 6. Graceful degradation

| Condition | Behaviour | Verified |
| --- | --- | --- |
| WebGL unavailable / blocked | Static SVG constellation renders; no canvas left behind; terminal stays interactive | yes |
| `Save-Data: on` | WebGL probe short-circuits to the static fallback | by code path |
| Context lost at runtime | `webglcontextlost` → scene unmounted, fallback shown | read-only path |
| Three.js throws | `SceneBoundary` (error boundary) removes the scene, logs in dev only | yes |
| `prefers-reduced-motion: reduce` | No drift, no autoplay, no entrance animations, reveals visible immediately, WebGL renders on demand only | yes |
| Off-screen hero | Autoplay timer paused via `IntersectionObserver` | yes |
| Resume PDF missing | Honest dialog + email route (no 404) | yes |
| JavaScript disabled | `<noscript>` block with email and GitHub | by markup |
| Touch / coarse pointer | Pointer parallax disabled | by `matchMedia` |

---

## 7. Link verification

HTTP status checked on 2026-10-27 (from the sandbox):

| Link | Status |
| --- | --- |
| `github.com/ayushmansaha1013` | 200 |
| `Fly_rank_ML_internship_repo` | 200 |
| `deft-marshmallow-4c3163.netlify.app` (live demo) | 200 |
| `youtu.be/V3si_I3IC4Y` (walkthrough, title “Search Intel”) | 200 |
| `TRUTHGUARD_01` | 200 |
| `Study-Compass-AI` | 200 |
| `MoodTunes` (repository; a live demo link also exists in its README) | 200 |

All six project/demo/video links are rendered on the page and asserted by the interaction suite.
**No URL was invented**; MoodTunes has no deployment link in this portfolio, only its repository.

---

## 8. Not verified

- Real hardware and real browsers: Safari (WebKit), Firefox, and iOS/Android devices were not
  available. WebGL behaviour on old mobile GPUs is unverified.
- Lighthouse/PageSpeed could not be run (no Chrome install in the sandbox); the LCP/CLS figures
  above come from the Performance Observer API in Chromium.
- The resume PDF does not exist yet, so the “resume opens” success path is untested — only the
  fallback path is.
- Deployment was **not** performed. Build output exists in `dist/`; no host was configured and
  nothing was pushed to GitHub.
- Copy accuracy was checked against the repositories (README, `work/paper.md`, `docs/`) as of
  2026-10-27, not against the live demos' runtime behaviour.
