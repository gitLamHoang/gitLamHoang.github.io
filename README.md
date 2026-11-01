# Harvey's Hub

Harvey Phan's portfolio: navigation software for humanoid robots and applied machine learning. Every project is shown as a ledger entry with its claim, its measured result, and its main limit.

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
- `src/lib/route-model.ts`: the hero's waypoint-following model (speed ramp, slow-down near each target, manual takeover). `src/scripts/route-field.ts` draws it.
- `src/lib/balancing.ts`: the balancing-number matrix from Theorem 2.1 of the HNUE paper, in exact BigInt arithmetic.
- Fonts: Source Serif 4, Barlow Semi Condensed, IBM Plex Mono, self-hosted through Fontsource.
- Design notes: `docs/superpowers/specs/`. Wireframes: `wireframes/`.

Project screenshots come from Harvey's own repositories. Quotes are from *Suits* (USA Network); this site is not affiliated with the show.
