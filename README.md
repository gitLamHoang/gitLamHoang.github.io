# Harvey's Hub

Harvey Phan's portfolio: predictive crowd navigation for humanoid robots, applied machine learning, and mathematical research. Every project opens with the whole project's idea, then Harvey's part, then its claim, measured result, and main limit.

The design follows elayadesign's landing-page-design system under impeccable's process: Geist in named text styles, a fixed spacing scale, flat black surfaces, and one gold accent kept for measured figures. The home page opens on a case file with a tab per project. Product facts are in `PRODUCT.md`, the design system in `DESIGN.md`, and the direction contract in `.impeccable/surfaces/`.

Live at **https://gitlamhoang.github.io**.

## Run it

Requires Node.js 24 or later.

```bash
npm ci
npm run dev       # http://localhost:4321
npm test          # route model and balancing-matrix tests
npm run check     # Astro and TypeScript diagnostics
npm run build     # static site in dist/
npm run check:links  # every internal link and #anchor in dist/ must resolve
```

Pushing to `main` runs the tests and type check, builds the site, and deploys it to GitHub Pages (`.github/workflows/deploy.yml`).

## Edit the content

| What | Where |
|---|---|
| Projects (one Markdown file each) | `src/content/work/*.md` |
| Experience, education, honors, papers, contact | `src/data/profile.ts` |
| Harvey Specter quotes | `src/data/quotes.ts` |
| HARP replay video and explorer data | `public/media/film-*.mp4`, `src/data/harp-crowd-run.json`, built by `scripts/replay/` (`--look graphite`) |
| IM²C certificates, people photos | `public/certificates/`, `src/assets/immc/`, `src/assets/people/` |
| Resume PDF | `public/Harvey_Phan_Resume.pdf`, built from `resume/harvey_phan_resume.tex` |
| Link preview cards and app icons | `public/og.png`, `public/og/<slug>.png`, `public/*icon*.png`, all built by `node scripts/og.mjs` |

Project frontmatter is checked by the schema in `src/content.config.ts`. `highlight` must be an exact substring of `result`, and it should only mark a number that came out of an evaluation. Each entry lists its `sources`.

Rules the content follows:

- No claim, metric, or date without a source.
- Pfizer is always the AI Engineer Apprenticeship.
- Every Specter quote must match an episode transcript word for word.
- Paper citations keep the published author name, Phan Hoang Lam.

## Rebuild the resume

```bash
tectonic -X compile resume/harvey_phan_resume.tex --outdir /tmp/resume
cp /tmp/resume/harvey_phan_resume.pdf public/Harvey_Phan_Resume.pdf
```

## How it's built

- [Astro](https://astro.build) 7, static output, no UI framework.
- `src/components/CaseFile.astro`: the home page's work section, one panel with a tab per project (arrow, Home, and End keys; `#work-<slug>` opens a tab). Each tab shows the project's media, its headline stat, claim, and limit; the write-up holds the rest.
- `src/components/HeroVideo.astro`: the recorded HARP crowd run, replayed in MuJoCo from the run's own logs (`scripts/replay/`, `--look graphite`), with a readout synced to the video frame from the same log. It plays once, then offers Replay.
- `src/components/Tagline.astro`: the statement whose words light up one by one as they scroll past (full colour under reduced motion).
- `src/pages/lab.astro`: the crowd lab page, with the live lab, the run explorer, and the waypoint demo.
- `src/components/RunExplorer.astro`: the same run from above, with a time scrubber and the robot path colored by planner mode.
- `src/components/Pipeline.astro`: the predictive avoidance layer as a signal chain.
- `src/components/CrowdLab.astro` and `src/lib/crowd-mpc.ts`: a live crowd-avoidance lab. A sampling MPC (about 150 rollouts per plan, constant-velocity forecasts, hard collision rejection, local refinement, least-intrusion fallback) re-plans at 5 Hz on a canvas; people can be added by click or drag. Closed-loop tests run each crowd for 120 simulated seconds. It illustrates the method and is not HARP's controller code.
- `src/components/CommandPalette.astro`: ⌘K / Ctrl+K palette for sections, write-ups, papers, demos, and actions (copy email, download CV). It opens at once, with no animation.
- `src/lib/route-model.ts`: the browser waypoint model on the lab page (speed ramp, slow-down near each target, manual takeover). `src/scripts/route-field.ts` draws it.
- `src/components/BalancingMethod.astro`: the HNUE paper's matrix method, typeset with KaTeX at build time (no math JavaScript ships). `src/lib/balancing.ts` and its tests check every identity the panel shows, in exact BigInt arithmetic.
- Cross-document view transitions fade between pages; write-ups get a sticky table of contents. Sections rise into place once as they scroll in; every control has hover, press, and focus states, and hover styles apply only to mouse pointers.
- A print stylesheet turns the home page into a clean CV with link URLs written out.
- Quality gates: unit tests, `astro check`, and the link checker run in CI before deploy. impeccable's detector and finish review ran on the production build.
- Font: Geist (Vercel, SIL Open Font License), self-hosted through Fontsource. Icons: Phosphor (MIT), inlined from `@phosphor-icons/core`.
- Design notes: `docs/superpowers/specs/`. Wireframes: `wireframes/`.

Project screenshots come from Harvey's own repositories. Quotes are from *Suits* (USA Network); this site is not affiliated with the show.
