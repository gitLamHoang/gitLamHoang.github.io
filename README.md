# Harvey's Hub

Harvey Phan's portfolio: predictive crowd navigation for humanoid robots, applied machine learning, and mathematical research. Every project opens with the whole project's idea, then Harvey's part, then its claim, measured result, and main limit.

Live at **https://gitlamhoang.github.io**.

## Run it

Requires Node.js 24 or later.

```bash
npm ci
npm run dev       # http://localhost:4321
npm test          # route model and balancing-matrix tests
npm run check     # Astro and TypeScript diagnostics
npm run build     # static site in dist/
```

Pushing to `main` runs the tests and type check, builds the site, and deploys it to GitHub Pages (`.github/workflows/deploy.yml`).

## Edit the content

| What | Where |
|---|---|
| Projects (one Markdown file each) | `src/content/work/*.md` |
| Experience, education, honors, papers, contact | `src/data/profile.ts` |
| Harvey Specter quotes | `src/data/quotes.ts` |
| HARP replay video and explorer data | `public/media/`, `src/data/harp-crowd-run.json`, built by `scripts/replay/` |
| IM²C certificates, people photos | `public/certificates/`, `src/assets/immc/`, `src/assets/people/` |
| Resume PDF | `public/Harvey_Phan_Resume.pdf`, built from `resume/harvey_phan_resume.tex` |
| Link preview image | `public/og.png`, built by `node scripts/og.mjs` |

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
- `src/components/HeroVideo.astro`: the recorded HARP crowd run, replayed in MuJoCo from the run's own logs (`scripts/replay/`).
- `src/components/RunExplorer.astro`: the same run from above, with a time scrubber and the robot path colored by planner mode.
- `src/components/Pipeline.astro`: the NMPC avoidance layer as a signal chain.
- `src/lib/route-model.ts`: the browser waypoint model on the HARP page (speed ramp, slow-down near each target, manual takeover). `src/scripts/route-field.ts` draws it.
- `src/components/BalancingMethod.astro`: the HNUE paper's matrix method, typeset with KaTeX at build time (no math JavaScript ships). `src/lib/balancing.ts` and its tests check every identity the panel shows, in exact BigInt arithmetic.
- Fonts: Source Serif 4, Barlow Semi Condensed, IBM Plex Mono, self-hosted through Fontsource.
- Design notes: `docs/superpowers/specs/`. Wireframes: `wireframes/`.

Project screenshots come from Harvey's own repositories. Quotes are from *Suits* (USA Network); this site is not affiliated with the show.
