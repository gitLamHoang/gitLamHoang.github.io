# Redesign plan: launch film

Date: 2026-11-03. Status: **approved by Harvey, 2026-11-03.** Building on `redesign/launch-film`.
Inputs: the audit of 2026-11-03 (below), Harvey's answers, `PRODUCT.md`, direction contract in `.impeccable/surfaces/src-pages-index-astro.md`.
Skills: impeccable (direction, finish review, DESIGN.md), taste-skill (composition sheet, house rules, inspector), Emil Kowalski's design engineering (motion and component feel).

## What Harvey asked for

- A new visual world, not polish on the notebook. The Nov 2 "report and instrument" redesign was rejected as **not different enough**.
- The feel: professional, robust, smooth, minimal, and still very creative, with beautiful animation and graphics.
- Both readers equally: robotics people (read HARP, email) and recruiters (open the CV and one write-up within a minute).
- The crowd lab and run explorer move off the home page to their own page.
- The HARP entry is updated to the latest simulation run and technical state.
- Kept: Specter quotes, People I've met, IM²C certificates, every fact and truth rule.

## Audit summary (before)

Taste inspector: 9 FAIL, 6 WARN. Impeccable health about 15/20. Measured on the home page at 1440, 768, 390 px:
13.4 screens and 2,966 words; 16 font sizes; 76 hairlines and 14 outlined boxes; hero media 18% of the first screen;
pulsing "Now" dot and a looping hero video; 0 `:active` states and 16 ungated `:hover` rules; only 2 elements move;
red used for four meanings; red on tint at 4.49:1 in two places; quotes 8 px from the phone edge; macro paper title on 3 to 4 lines.
Screenshots: `.taste-skill/before/`.

## The direction: launch film

**Idea.** On this page, the G1's recorded run through a moving crowd becomes the pinned film the whole page plays past.
Another robotics portfolio can't use this sentence: the run, its log-synced overlay, and its planner modes are Harvey's alone.

**World.**

| Role | Value | Rule |
|---|---|---|
| Ground | graphite `#0d0f12` | the whole page; panels one tone step up |
| Ink | `#f4f5f6` | all running text, full strength |
| Secondary | steel `#8a9099` (checked to 4.5:1 or better) | dates, captions, citations |
| Measured | yellow `#ffcf3f`, the sim's LiDAR-track colour | only on numbers that came out of an evaluation, and the robot's path |
| Type | Switzer only, self-hosted | semibold display at -0.04em, 400/500 text, tabular figures for readouts; no serif, no mono |
| Shape | square corners, one button shape | no rules, no outlined boxes, no glass, no shadows at rest, no gradients except a neutral scrim over footage |

Limits lose the red pen. A limit is set in the full ink under a "Limit" label in steel, the same place in every entry, so it reads as part of the evidence rather than an alarm.

**The film itself.** The current replay is a bright white MuJoCo frame, which can't carry white type. I'll re-render it from the newest suitable run with `scripts/replay/`, in a graphite studio look: dark floor, light low-cut walls, pedestrians in neutral greys, the robot's path in the measured yellow. Same log, different materials, and the caption says so.

## Page structure (home)

Composition comes from the taste-skill sheet "pinned poster" (`.taste-skill/direction.json`), mapped to Harvey's content. Target length: about 7 desktop screens (down from 13.4).

| # | Section | Composition | Content |
|---|---|---|---|
| 1 | **Hero: the film** | Name split to corners, pinned; full-bleed replay between | "Harvey" top-left, "Phan" bottom-right at 9vw. One sentence, Resume (solid) and Email. The run's result as a yellow readout top-right. The hero quote small under the sentence. |
| 2 | **How it decides** | Pinned story, at most 3 screens | The name stays pinned; the replay steps through six chapters (Perceive, Track, Forecast, Optimize, Certify, Command). Each chapter plays its stretch of the run once and shows one line plus its real parameter (for example 4 s horizon, 5 Hz). Ends with "Open the lab" to `/lab`. |
| 3 | **Work** | Small index, large picture (pinned) | 38/62 split. Left: the heading, then the current project's claim, result (yellow number) and limit, with the four-row index at the bottom. Right: that project's figure (film still, pharma workspace, EEG chart, NYC explorer), which wipes in as each project arrives. Each row links to its write-up. |
| 4 | **Organizations** | Names running off the edges | One slow line: Stanford, HARP, POSH (YC W22), Stanford AUV, Pfizer, Brown, HNUE, HUST, IM²C, with one plain sentence under it. Paused under reduced motion. |
| 5 | **Research** | Sticky figure, active list | Two papers and IM²C as rows. The left figure changes with the row: the typeset B-matrix, the forecasting result, the certificate. The active row opens its abstract, DOI and role. |
| 6 | **Experience** | Now and Before, two columns | Kept from today's route timeline, rebuilt in the new type. No route line, so it doesn't fight the film. |
| 7 | **People I've met** | Pinned title, portraits pass | The three real photos pass behind the pinned heading, each with name and title. |
| 8 | **Education and honors** | One compact block | Education, honors and scores, tools, as plain rows. |
| 9 | **Contact** | Card on a photograph | A graphite film still under one solid card: email, phone, Palo Alto and Stanford, Resume button. |
| 10 | **Footer** | One quiet line | What this is, links, year; the legal-name line and the quote credit; the footer quote. |

Every section keeps its Specter quote as a small `<blockquote>` under its heading.

## Other pages

- **`/lab` (new):** "Crowd lab", with the live crowd-avoidance lab and the recorded-run explorer moved from home, and a link back to the HARP write-up. It stays labelled as a browser model of the method, not HARP's controller.
- **Write-ups `/work/<slug>`:** same world. Title and one-line summary over the project's figure full-width. Claim, result, limit as one fixed band. Body in a 68ch column with the sticky contents list. Previous and next as two large links.
- **404:** the film's last frame with "No waypoint here." and the 404 quote.
- **Command palette, print-as-CV, link-preview cards:** restyled to the new tokens. The OG cards are regenerated by `scripts/og.mjs`.

## Motion system (Emil's rules)

- Tokens: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`; 120 ms press, 200 ms hover and small UI, 300 ms ceiling for UI, longer only for the film.
- **Signature, once:** the pinned film. Built with `position: sticky` and scroll position, never scroll-jacking. Each chapter plays its video segment forward once when it enters, rather than scrubbing `currentTime` frame by frame, which stutters on most browsers.
- **Entrances:** every section's heading, then text, then figure; 16 to 24 px rise with opacity, 60 to 80 ms apart, once. Content is visible without JavaScript.
- **Feedback:** `scale(0.97)` on press for every button and row; hover styles only under `(hover: hover) and (pointer: fine)`; a visible 2 px focus ring.
- **Gone:** the pulsing dot, the looping video, the frosted header (now a solid bar that appears once you scroll past the film), and `transition: all` everywhere.
- **Reduced motion:** no pin travel, no marquee, no film playback. Chapters show their still frame, entrances become a short opacity fade, and page transitions are off.
- Page transitions: keep today's fade-through view transition (about 300 ms, header holds still).

## HARP content update

A read-only check of `~/harp/stanford-harp-social-interaction` is running; its report lands in `.design-loop/harp-status-2026-11-03.md`. Plan:

1. Harvey confirms which planner variant and suite is the headline (the repo has new runs dated 2026-11-03: `heldout`, `atrium`, `ab46`, `ab47`, `mpc05`, `oneshot45`).
2. Update `src/content/work/harp-crowd-navigation.md` and the HARP lines in `src/data/profile.ts` with the new result, its commit, test count and limit, each with its source.
3. Re-render the hero film from the best new run (reached goal, zero contacts), in the graphite look; re-export the explorer data for `/lab`.

No HARP number changes without Harvey's sign-off.

## Build order

Work happens on branch `redesign/launch-film` from `main`, in small commits (Harvey asked for many). Nothing is pushed or merged without Harvey's OK.

1. Housekeeping: git-ignore `.taste-skill/` and `.impeccable/mocks/`; keep `PRODUCT.md` and the surface brief.
2. Tokens: colour, the five type steps, spacing, motion; self-host Switzer; drop Source Serif, Barlow and Plex.
3. Header and the hero film (desktop and phone), with the new graphite render.
4. How it decides: the six pinned chapters.
5. Work: pinned index and large picture.
6. Organizations band, Research, Experience, People, Education and honors, Contact, Footer.
7. `/lab` page with the lab and explorer; links from home and the HARP write-up.
8. Write-ups and 404 in the new world.
9. HARP content and replay update (after Harvey confirms the numbers).
10. Motion layer pass: entrances, feedback, reduced motion.
11. Palette, print stylesheet, OG cards and icons on the new tokens.
12. Gates on the production build: tests, `astro check`, link check, taste inspector at 1440, 768 and 390 with 0 FAIL, impeccable detector, axe in both states, Lighthouse.
13. Impeccable finish review by a fresh agent, one fix round, then DESIGN.md from the built site.
14. Before and after screenshots for Harvey; merge to `main` only on his yes.

To keep usage lean: I build in one session with text checks before screenshots, 1000 px images, and one fresh reviewer at the end, not the old designer and critic loop.

## Decisions (Harvey, 2026-11-03)

1. **Theme:** dark only. The theme toggle and the light palette go away.
2. **Organizations band:** a slow moving line, paused under reduced motion.
3. **Plan:** approved.
4. **HARP film:** keep the replay of the older public native-sim run (re-rendered in the graphite look); swap to a newer run later, once `scripts/replay` reads the new run format.
5. **HARP text:** update the description and technical detail to the branch's current state (`.design-loop/harp-status-2026-11-03.md`). Lead with the claim (game core vs sampling MPC on four unseen worlds: 3 of 4 vs 0 of 4 reached, 0 contacts, none met the 0.30 m clearance rule), then where it stands (newest suite: 5 of 10 reached, 2 of 10 passed every check, 1 contact).
6. **Old results:** 7 of 7 and 7 of 9 stay as dated history (Nov 1, native simulator, since deleted).

## Rules that still bind

PRODUCT.md truth rules; WCAG AA; visible focus; 44 px targets; no horizontal scroll at 320 px; static output; fonts self-hosted; copy direct, sentence case, no em dashes.
