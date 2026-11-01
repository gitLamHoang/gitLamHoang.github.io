# Harvey's Hub: portfolio site design

Date: 2026-11-01, revision 2. Owner: Harvey Phan (legal name Phan Hoang Lam). Wireframes: `wireframes/` (home, project page, 404).

Revision 2 changes: the site is branded Harvey Phan with the title "Harvey's Hub"; one verified Harvey Specter quote opens each home-page section; the CV is Harvey's current resume; new roles (POSH, Stanford AUV); the Pfizer AI Engineer Apprenticeship and its public continuation merge into one project; test scores added; major is B.S. in Computer Science.

## Intent

Harvey is a Stanford CS student (class of 2030) aiming at robotics (humanoids, autonomy) and AI. The site should make a robotics or AI reader, such as a lab lead, a recruiter, or a teammate, understand within one screen that Harvey writes real navigation software for a humanoid robot, then let them check the evidence behind each project.

Harvey's READMEs already have a strong voice: every result comes with its protocol and its main limit. The site turns that habit into its design. The Harvey Specter lines add swagger on top; the ledger underneath keeps it honest. That pairing, confident epigraph and plain evidence, is the site's personality.

## Goals

- First screen: Harvey's name, the HARP role, and an interactive waypoint route that shows what that work does.
- Four projects, each as a ledger entry: Claim, Result, Limit. Each has a detail page.
- Research: two co-authored papers with DOIs, an interactive balancing-matrix widget, and IMMC.
- Experience, education, honors and scores, tools, contact, and the one-page CV.
- Easy to update: content and quotes live in data files, not in layout code.
- Deployed at https://gitlamhoang.github.io from a public GitHub repo, rebuilt on every push.

## Non-goals

- No blog, CMS, contact form, analytics, comments, or i18n in v1.
- No live robot data and no backend.
- No private repositories. No detail pages for POSH or AUV until there is public material.

## Anti-goals (a failure even if it works)

- Any claim, metric, or date not traceable to a source below. Inflated wording.
- A Harvey Specter quote that isn't in the show. Every quote must match an episode transcript.
- Quotes that swamp the content: one per section, never inside the evidence itself.
- Looking like a template: generic SaaS cards, purple gradients, Inter or Space Grotesk, ALL-CAPS eyebrow labels, `→` on every link.
- A hero animation that loops forever or blocks reading.
- Presenting the route widget as real robot data.
- Taking credit for HARP team infrastructure Harvey did not build.

## Constraints

- Static output only (GitHub Pages). Repo `gitLamHoang/gitLamHoang.github.io`, public, branch `main`.
- Node 24+ in CI.
- Accessibility: WCAG AA contrast in both themes, visible keyboard focus, `prefers-reduced-motion` respected, all controls reachable by keyboard, touch targets at least 44 px.
- No horizontal scroll at 320 px. Fonts self-hosted.
- Copy rules (from `writing_style.md`): direct, specific, sentence case, no em dashes, no excess adjectives.
- Published citations keep the published author name, Phan Hoang Lam.

## Approaches considered

| Approach | Trade-off | Verdict |
|---|---|---|
| **Astro static site** on GitHub Pages | Content collections keep projects in Markdown with typed frontmatter; ships zero JS by default, islands only where needed; Vite-based like Harvey's other web demos. One extra build step. | **Chosen by Harvey.** |
| Plain HTML/CSS/JS | No build, but content and layout mix; project pages would duplicate markup. | Rejected |
| Next.js on Vercel | Familiar from earlier work, but heavier than a portfolio needs and hosting moves off GitHub. | Rejected |

## Decisions made with Harvey

- Name: "Harvey Phan" everywhere; the footer says "Legal name: Phan Hoang Lam". Site title "Harvey's Hub".
- Harvey Specter: one short verified quote per home-page section, plus the 404. The visual design stays as planned.
- Audience: robotics and AI first.
- Direction: evidence ledger (Claim, Result, Limit on every project).
- Hero: waypoint route demo modeled on HARP PRs #2 and #5. The balancing matrix lives in Research.
- Stack and host: Astro + GitHub Pages at the root user-site URL.
- Public contact: hoanglam@stanford.edu, (302) 687-2315, Palo Alto and Stanford, CA, LinkedIn, GitHub, CV download.
- Dates: HARP Oct. 2026 to present (the CV was changed to match). POSH and AUV Sep. 2026 to present. Pfizer AI Engineer Apprenticeship Jun. to Sep. 2026.
- CV: Harvey's current Ace Mentorship resume with the name changed to Harvey Phan. Served as `/Harvey_Phan_Resume.pdf`, PDF title "Harvey Phan's Resume", link text "Harvey Phan's Resume (PDF)".
- Keep on the site even though the new CV drops them: Brown role, HNUE role, Java and R.
- Major: B.S. in Computer Science.

## Harvey Specter quotes

Each line below was matched in the episode transcripts (Springfield! Springfield! scripts, checked 2026-11-01) and is spoken by Harvey. Popular lines that are not in the show, such as "It's going to happen, because I am going to make it happen" and "Anyone can do my job, but no one can be me", are excluded.

| Placement | Quote | Episode |
|---|---|---|
| Hero (waypoints are the goals) | "I don't have dreams. I have goals." | S3E6 |
| Work | "Winners don't make excuses when the other side plays the game." | S1E7 |
| Research | "I don't play the odds. I play the man." | S2E6 |
| Experience | "Loyalty is a two-way street." | S3E1 |
| Education and honors | "I don't get lucky. I make my own luck." | S3E15 |
| Footer | "Life is this. I like this." | S1E10 |
| 404 | "First impressions last. If you start behind the eight ball, you'll never get in front." | S1E3 |

Each renders as an epigraph: the line in italic serif, then "Harvey Specter, Suits, S3E6" as a small citation. Project pages carry no quote. The footer adds: "Quotes are Harvey Specter's, from Suits (USA Network). This site is not affiliated with the show." Quotes live in `src/data/quotes.ts` so they are easy to swap.

## Visual system (starting point; the frontend-design pass may revise it)

**Concept: the page is the robot's floor.** An engineering lab notebook on faint grid paper. The hero's route field is the same grid at full strength. Claims are written in ink, measured results get a highlighter swipe, limits are red-pen notes in the margin. Specter epigraphs sit at section openings like a margin quote in a notebook.

| Token | Light | Role |
|---|---|---|
| Vellum | `#EEF2EF` | page background (cool, not cream) |
| Grid | `#D3DED9` | grid lines, rules |
| Ink | `#1C2B4B` | text, route lines |
| Graphite | `#5A6470` | secondary text, quote citations |
| Highlighter | `#F0D64A` | behind measured results only |
| Red pen | `#C0283A` | robot marker, Stop, limit notes |

Dark theme: deep blue slate paper, light ink, same roles. Follows system preference with a manual toggle.

**Review against generic defaults (frontend-design pass 1).**
- The accent was an orange-red (`#D8432E`), next to the terracotta-on-paper default. Changed to a crimson red-pen color so it reads as a reviewer's mark, not a brand accent.
- Paper is cool grey-green with a visible engineering grid, not cream. Serif is for reading text and epigraphs; headlines use the condensed sans.
- Entries are separated by space and the grid, with at most one rule per section, to stay away from the hairline broadsheet look.
- Mono is limited to live numeric readouts inside the two widgets. No eyebrow labels, no middle-dot meta strings, no arrow glyphs on links, no highlighted word inside a headline.
- Boldness is spent in one place: the hero route field. Epigraphs stay small and quiet so they don't compete with it.

Type: Source Serif 4 for reading text and epigraphs; Barlow Semi Condensed for headings, nav, and controls (technical-drawing lettering); IBM Plex Mono only for numeric readouts inside widgets.

Layout: left-aligned main column (about 65 to 72ch) plus a right margin column for dates, roles, limits, and citations. On narrow screens margin notes fold inline under their entry and dates move above the title.

Motion: one orchestrated moment. On first load the marker walks one lap of the default route, once. Everything else responds to the visitor. Reduced motion shows the route drawn and the marker parked.

## Page structure

See `wireframes/home.html`, `project.html`, `404.html`.

**Home `/`**
1. Header: "Harvey's Hub" wordmark; Work, Research, Experience, Resume (PDF); theme toggle.
2. Hero: "Harvey Phan", a one-sentence statement, one supporting line naming the HARP role, the hero quote, the route field with controls and readouts, the live speed trace, and a caption saying it is a browser simulation, not robot data.
3. Work ledger (quote, then): HARP, Pharmaceutical document processing, EEG, NYC mobility.
4. Research (quote, then): balancing-numbers paper with matrix widget, macro forecasting paper, IMMC.
5. Experience (quote, then): HARP, POSH, Stanford AUV, Pfizer (AI Engineer Apprentice), Brown, HNUE, HUST.
6. Education and honors (quote, then): education, honors and scores, tools.
7. Footer (quote, then): contact details, CV download, legal-name line, quote credit.

**Project page `/work/[slug]`**: back link, title, one-line summary, role and dates, optional stack, links, the Claim/Result/Limit block, figure (if any), The problem, What I built, Measured results, Limits, previous/next links. Sections without content are omitted.

**404**: route field with the marker at a dead end, "No waypoint here.", the 404 quote, a "Route back home" button.

Also: sitemap, robots.txt, SVG favicon, Open Graph image, Person JSON-LD (name Harvey Phan, alternateName Phan Hoang Lam), page titles in the form "Page | Harvey's Hub".

## Interactive pieces

**Route field (hero).** SVG, no framework. Coordinates in meters; one grid square = 0.5 m.
- Click or tap the floor to add a waypoint (cap 8). Buttons: Run, Stop (take over), Reset, Add random waypoint, Laps 1 / 2 / 3.
- Motion per frame: `v = min(v_max, v + a·dt, sqrt(2·a_dec·d_remaining))`, so speed ramps up, holds, and slows into each waypoint. Heading turns toward the next waypoint at a bounded rate.
- Stop sets state to "manual takeover" and speed to zero immediately (mirrors the immediate stop on completion, timeout, or fault in PR #5).
- Readouts: state (idle, walking, slowing, manual takeover, done), speed in m/s, distance to target, lap n of N.
- Speed trace: rolling sparkline of v over the last ~20 s.
- Keyboard: all buttons focusable; "Add random waypoint" gives keyboard users the same power as clicking. The SVG has a text alternative describing the current route.

**Balancing matrix (Research).** From the paper (Theorem 2.1): `B = [[6, 1], [-1, 0]]` and `B^n = [[B(n+1), B(n)], [-B(n), -B(n-1)]]` with `B0 = 0, B1 = 1, Bn = 6·B(n-1) - B(n-2)`. Buttons: n + 1, Reset. Shows `B^n` and the sequence so far (1, 6, 35, 204, 1189, ...). BigInt keeps large n exact; cap n at 30.

## Content inventory and sources

All copy is drawn from these sources only:
- Harvey's current CV (`resume/harvey_phan_resume.tex`).
- Harvey's local StanfordOS profile (`master_profile.md`, `facts.jsonl`, `conflicts_and_verification.md`, `writing_style.md`). Not committed.
- GitHub: `gitLamHoang/gitLamHoang` README and TOUR.md (HARP role and PRs), `nyc-mobility-intelligence`, `pharma-ocr-date-rag`, `Classfying-brain-wave-state` READMEs.
- Paper PDF (balancing matrix form).
- Harvey's messages in this design conversation (test scores, dates, name).

| Project | Claim | Result | Limit | Links |
|---|---|---|---|---|
| HARP waypoint navigation (Software Engineer Lead, Human Perception & Social Interaction Team, Stanford Student Robotics, Oct. 2026 to present) | The Unitree G1 follows configurable waypoint routes and repeated laps in simulation, with manual takeover and runtime safeguards. | Two merged PRs: routes with fault handling (#2); ROS 2 odometry route recorder and speed ramping (#5). Tested in simulation and with local ROS 2 tests. | Physical robot validation is pending; latest recorder and speed changes still need target-image and simulator checks. | PR #2, PR #5, team repo, TOUR.md |
| Pharmaceutical document processing (AI Engineer Apprentice, Pfizer, Jun. to Sep. 2026; public continuation 2026) | A Python and Docker pipeline runs OCR, retrieval, and classification over pharmaceutical vendor files; a public follow-up keeps every extracted date tied to its source. | 50+ vendor files; 4 OCR/LLM approaches (Tesseract, PaddleOCR, Mistral, Phi-2) across 6 chunking configurations; 100+ outputs reviewed. Public continuation: 742 source-linked date cells from 60 MHRA notices in 5 languages. | The Pfizer code and data are internal. The public continuation is a historical snapshot; original-PDF OCR measured on 3 PDFs / 6 pages. | public demo, repo |
| EEG classification (started at HUST 2024; public benchmark 2026) | Spectral features separate eyes-open from eyes-closed EEG in participants the model never saw. | 79.9% balanced accuracy on 22 held-out participants, 95% CI 72.7 to 86.2, vs 50.0% majority baseline; 512 features per window, 109 participants. | Offline, same-dataset evaluation; baseline run order is confounded with condition. | repo, protocol doc |
| NYC mobility (personal, 2026) | Boosting on past-only features beats a weekly baseline for hourly pickups per zone. | MAE 3.693 vs 5.104 (27.65% lower) over 559,370 zone-hours of walk-forward validation; 23,263,775 pickups ingested. | Worse on sparse-zone MAE every month; no live feed exists. | live demo, repo |

Other facts:
- Experience: Software Engineer, POSH (YC W22), AI infrastructure, modeling, time series, Sep. 2026 to present. Software Engineer, Stanford Autonomous Underwater Vehicle, Sep. 2026 to present. Titles and dates only.
- Education: Stanford University, B.S. in Computer Science, class of 2030. Hanoi-Amsterdam High School for the Gifted, Mathematics Specialized Class, 2026.
- Honors and scores: Bronze Medal, Vietnam National Student Mathematics Olympiad; Second Prize, Hanoi Mathematics Olympiad; Honorable Mention, IMMC 2024 and 2025; SAT 1550 (800 Math); IELTS 8.0; AP 5s in Calculus BC, Computer Science A, Macroeconomics.
- Tools: Python, C/C++, Java, SQL, R, TypeScript; PyTorch, scikit-learn, pandas, NumPy, SciPy; ROS 2, MuJoCo, Docker, Git.

Truth rules:
- EEG never uses LinkedIn's "92 participants / 77%".
- Brown is title, project (CNN-based soil texture analysis), dates, and mentor (MSc. Leonard Gleyzer) only.
- Pfizer is always called the AI Engineer Apprenticeship (role: AI Engineer Apprentice), with no other program label. Pfizer is CV-level detail only. The public date-review repo is described as a public continuation, as the CV does, never as Pfizer code.
- HARP separates Harvey's contributions from the team's platform (G1, ROS 2 Foxy, Nav2, MuJoCo, GR00T are team context).
- POSH and AUV get no invented detail.

## Calls I made (Harvey can override)

- The Pfizer apprenticeship and the public date-review project are one ledger entry, as on the CV. That leaves four projects.
- Project figures are screenshots copied from Harvey's own repos (`docs/images/...`) into `public/`, not hotlinked.
- No work filter chips: four entries read fine in one list.
- Research section subtitle adds one wink after the odds quote: "These ones do play the odds."
- No photo in v1. Adding `public/photo.jpg` later is a one-line change.

## Builder check answers

A fresh reviewer read revision 1 and the wireframes and confirmed the facts against the sources. Its questions, settled:
- **CV:** ready before the build (`public/Harvey_Phan_Resume.pdf`, one page, compiled with Tectonic from `resume/harvey_phan_resume.tex`, which is committed).
- **Publishing:** in scope; Harvey asked for the site to be pushed through GitHub. Astro lives at the repo root. `docs/` and `wireframes/` are committed as process records, with private repo names and local paths kept out.
- **Highlighter:** marks only a number produced by an evaluation (EEG balanced accuracy, NYC MAE, macro paper RMSE and directional accuracy). HARP and the pharma entry show no highlight. Frontmatter carries an optional `highlight` substring of `result`.
- **Status line:** dropped. The hero's supporting line already names the HARP role.
- **Links and stack:** `links` is a free-form list of `{label, href}`; `stack` is optional.

## Left to the builder

Exact copy wording within the facts above, component breakdown, CSS architecture, OG image technique, and final type sizes, as long as the constraints and anti-goals hold.

## Build notes (decided during the build)

- HARP now carries a highlight. The PR #2 description reports a recorded simulator run (all six waypoint visits over three laps after an 8.2-second manual takeover, zero contacts), which is an evaluation result under the highlighter rule. The HARP page lists the PR's other simulator and test measurements with their limits.
- Route field: top speed 0.8 m/s, 80 px per meter, and a tighter default triangle, so the load-time lap takes about 20 seconds instead of 45. The page grid is 40 px to match one 0.5 m square on the field.
- The robot marker is a narrow arrowhead plus a heading tick; the first, near-equilateral wedge read as pointing backwards.
- Matrix digits are grouped with thin spaces, because thousands commas collided with the commas between sequence terms.
