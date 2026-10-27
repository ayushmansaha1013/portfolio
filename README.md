# Ayushman Saha — developer portfolio

A single-page, developer-first portfolio built for the **GDG On Campus IEM — Core Working Team
2026–27** application (Technical / Website domain). Dark technical aesthetic, a CSS-3D hero
workspace, and an optional WebGL node field that loads only when it can actually help.

**Stack:** React 18 · TypeScript · Vite 5 · Three.js via React Three Fiber · hand-written CSS
(no UI framework, no CSS-in-JS runtime, no analytics).

---

## 1. Run it locally

```bash
npm install       # Node 18+ (tested on Node 20)
npm run dev       # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on `0.0.0.0:5173` |
| `npm run build` | Type-check (`tsc -b`) then production build into `dist/` |
| `npm run preview` | Serve the built site on `:4173` |
| `npm run lint` | ESLint, zero warnings tolerated |
| `npm run typecheck` | TypeScript project check only |

---

## 2. File structure

```
.
├── index.html                  # meta, OG tags, JSON-LD, font preloads, <noscript> fallback
├── public/
│   ├── fonts/                  # self-hosted Inter + JetBrains Mono (latin, woff2)
│   ├── resume/                 # ← put Ayushman_Saha_Resume.pdf here (see §4)
│   ├── favicon.svg
│   ├── og.png                  # 1200×630 social card
│   ├── robots.txt · sitemap.xml
│   └── _headers                # Netlify cache headers for fonts/assets
├── src/
│   ├── data/                   # ALL copy lives here — single source of truth
│   │   ├── profile.ts          # name, email, links, resume path
│   │   ├── projects.ts         # 4 projects: problem, tech, role, breakdown, links
│   │   ├── experience.ts       # 3 experience entries + programs/achievements
│   │   ├── skills.ts           # skills, community areas, proof stats, nav items
│   │   └── heroRuns.ts         # hero terminal transcripts + SQL snippet
│   ├── hooks/                  # reduced motion, media query, WebGL support, idle mount,
│   │                           # in-view-once, active section
│   ├── components/
│   │   ├── layout/             # Header (nav + progress bar), Footer
│   │   ├── hero/               # Hero, WorkspaceStage (CSS-3D), TerminalPanel (tabs)
│   │   ├── three/              # Scene (R3F node field), SceneBoundary (error boundary)
│   │   ├── proof/              # ProofStrip — evidenced numbers
│   │   ├── projects/           # Projects, FeaturedProject, ProjectCard,
│   │   │                       # PipelineDiagram, ProjectVisual (SVG archetypes)
│   │   ├── skills/ · experience/ · community/ · contact/
│   │   └── ui/                 # Icons, Reveal, SectionHead, ExternalLink, ResumeButton
│   └── styles/
│       ├── tokens.css          # design tokens + @font-face
│       └── global.css          # reset, primitives, focus rings, reduced-motion rules
└── .tools/                     # QA scripts used during development (not shipped)
```

### Editing content

Everything a recruiter reads is in `src/data/`. To change a claim, edit the data file — no
component surgery required. Status labels (`ongoing` / `completed`) are typed, so TypeScript
will catch a typo.

---

## 3. Design decisions (short version)

- **One visual concept, not five.** The hero is a layered developer workspace: a syntax-highlighted
  editor + a terminal that walks a real Search-Intel-Scout run, floated over a sparse node graph.
  Only the terminal is interactive, so the scene never competes with the copy.
- **Hick's Law.** Four nav items, one primary CTA, one secondary CTA, three project cards,
  three experience entries, three contribution areas. Secondary detail (technical breakdown,
  role notes) sits in native `<details>` disclosures — present, but not shouting.
- **3D is optional.** WebGL is feature-detected (Save-Data, `failIfMajorPerformanceCaveat`),
  mounted during idle time, and replaced by a static SVG constellation when unavailable.
  Three.js is a separate lazy chunk, so devices without WebGL never download it.
- **Evidence over adjectives.** Every number on the page names its source (`repo · work/paper.md`,
  `TRUTHGUARD_01 README`). No skill percentages, no invented dates.
- **AI transparency stays in.** The Search-Intel-Scout card repeats the repository's own
  statement about which parts were AI-assisted and which were written and verified by hand.

---

## 4. Resume PDF — the one asset you must add

The "View Resume" buttons point at:

```
public/resume/Ayushman_Saha_Resume.pdf
```

Add your CV at that exact path and the buttons open it in a new tab. Until then the button
checks the file and shows an honest fallback dialog with your email (no 404, no broken tab).
To use another filename, edit `profile.resumePath` in `src/data/profile.ts`.
Keep it under ~1.5 MB and make the text selectable so ATS parsers can read it.

---

## 5. Deployment

The site is a static single page; any static host works. Two recommended options:

### Netlify (recommended — `public/_headers` is already configured)

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

Or connect the repo in the Netlify UI with **build command** `npm run build` and
**publish directory** `dist`. No redirect rules are needed (single page, no client router).

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Framework preset: **Vite** · build `npm run build` · output `dist`.

### GitHub Pages (if you prefer to stay inside GitHub)

```bash
npm run build
npx gh-pages -d dist
```

Then set `base: '/<repo-name>/'` in `vite.config.ts`, because the site would otherwise be
served from a subpath.

**Before you deploy:** update the placeholder domain `https://ayushmansaha.dev/` in
`index.html` (canonical, OG/`twitter` URLs, JSON-LD), `public/robots.txt` and
`public/sitemap.xml` to the real URL. Nothing has been deployed or pushed from this workspace.

---

## 6. What is verified vs. what needs your input

Verified in this workspace (see `TEST_REPORT.md`):
production build, type-check, lint, 0 axe WCAG 2.1 AA violations, 26/26 interaction checks,
keyboard paths, reduced-motion behaviour, no-WebGL fallback, and no horizontal overflow from
360 px to 1920 px.

Needs you:
1. `public/resume/Ayushman_Saha_Resume.pdf`
2. Real deployment domain (used in canonical/OG/sitemap)
3. Optional: dates for the three experience entries — currently omitted on purpose
4. Optional: a public artefact for the UptoSkills internship, if one exists
5. Confirm the Cosmos / Phycathon spellings and the McKinsey Forward cohort wording
