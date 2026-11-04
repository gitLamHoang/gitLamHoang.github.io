# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two readers, weighted equally (Harvey, 2026-11-03):

- **Robotics and AI people**: lab PIs, grad students, team leads. They want to see that Harvey writes real navigation software for a humanoid robot and that his results hold up. Success: they read the HARP work and email him.
- **Internship recruiters** at robotics and AI companies. They skim. Success: within a minute they know who he is, open the CV, and open one write-up.

Both arrive from a link (LinkedIn, CV, email signature, GitHub), on a laptop or a phone.

## Product Purpose

Harvey Phan's portfolio ("Harvey's Hub"). It shows his robotics and AI work, with each project's claim, measured result, and main limit, so a reader can check the evidence rather than take his word for it.

## Positioning

Every result comes with how it was measured and what it can't do yet. Harvey's READMEs already work this way; the site makes that honesty visible. The proof is the work running: a replayed HARP simulation run from its own logs, a live crowd-avoidance model in the browser, and a typeset proof checked by tests.

## Operating Context

- Static Astro 7 site on GitHub Pages at https://gitlamhoang.github.io, deployed on every push to `main` after tests, type check, and a link check.
- Content lives in data files: projects in `src/content/work/*.md` (frontmatter checked by schema), profile in `src/data/profile.ts`, quotes in `src/data/quotes.ts`.
- HARP media is rendered from real run logs by `scripts/replay/` (MuJoCo replay of a recorded run).

## Capabilities and Constraints

- Pages: home, one write-up per project (`/work/<slug>`), the crowd lab (`/lab`), 404. Command palette (⌘K), dark only (decided 2026-11-03), print-as-CV stylesheet, per-project link-preview cards.
- Interactive pieces: HARP replay with log-synced overlay, recorded-run explorer, live crowd-navigation lab (a browser model of the method, not HARP's controller code), balancing-matrix method panel.
- Decided 2026-11-03: the crowd lab and run explorer move off the home page to their own page; the home page keeps the replay.
- Decided 2026-11-03: the HARP entry gets updated to the latest simulation run and technical state from Harvey's HARP checkout.
- Decided 2026-11-04: the home page follows Harvey's resume. Order: Projects, Experience, People I've met, then Research and one band for Education, Skills, and Awards. Each project reads like a resume entry, its method and technical choices first, then the result with its limit. The poster's sentence says Harvey is interested in robotics and AI, not his HARP title. Experience keeps its waypoint timeline. No sections that are mostly empty space.
- Static output only; no backend, CMS, analytics, contact form, or blog.

## Brand Commitments

- Name: Harvey Phan everywhere; legal name Phan Hoang Lam once in the footer; paper citations keep the published name Phan Hoang Lam. Site title "Harvey's Hub".
- One verified Harvey Specter (Suits) quote per home-page section and on the 404, each matched word for word against an episode transcript. Quotes stay in `src/data/quotes.ts`.
- Copy: direct, specific, sentence case, no em dashes, no excess adjectives, technical and professional.
- Harvey's words for the feel he wants: professional, robust, smooth, minimal, and still very creative, with beautiful animation and graphics.
- Rejected before: the "report and instrument" redesign (IBM Carbon structure, Plex type), 2026-11-02, as not different enough.
- Rejected 2026-11-03: the "launch film" redesign (graphite cinema, Switzer), as too simple and not designed well.
- Rejected 2026-11-04: the elaya case-file site (flat black SaaS look), as having "no animations, no nice background, no creative idea".
- Pinned 2026-11-04: impeccable runs the process; the look follows Harvey's reference, an illustrated night poster (the "Villa Castagneto" screenshot): a full-bleed drawn night scene, navy ground, cream and vermilion type, gold outline details, screen-print grain, a condensed poster face for headlines, a classic serif for the nav, vertical side tabs, and a strip along the bottom. The scene is Stanford at night (Hoover Tower, the Main Quad arcades, palms, a full moon) with the G1 walking its waypoints, drawn in code so it can move. Harvey's copy rules still win: dates like LinkedIn.

## Evidence on Hand

- Four projects with sources: HARP predictive crowd navigation, pharmaceutical document processing (AI Engineer Apprenticeship at Pfizer plus a public continuation), EEG classification, NYC mobility forecasting.
- Two co-authored papers with DOIs, IM²C Honorable Mentions 2024 and 2025 (certificate PDFs), experience, education, honors and scores.
- Media: HARP replay video and poster (`public/media/`), project screenshots from his own repos (`src/assets/work/`), three photos with people he has met (`src/assets/people/`), certificate images.
- No testimonials, logos of employers as endorsements, or press. None may be invented.

## Product Principles

1. No claim, metric, or date without a source. A measured number never appears without its limit.
2. Show the work running before describing it.
3. Separate Harvey's part from the team's platform.
4. Pfizer is always the "AI Engineer Apprenticeship" (role AI Engineer Apprentice, Jun to Sep 2026); never "extern" or "externship". The public pharma repo is a public continuation, never Pfizer code. EEG uses 79.9% balanced accuracy on 22 unseen participants.

## Accessibility & Inclusion

WCAG AA contrast in both themes, visible keyboard focus, every control reachable by keyboard, `prefers-reduced-motion` respected, touch targets at least 44 px, no horizontal scroll at 320 px.
