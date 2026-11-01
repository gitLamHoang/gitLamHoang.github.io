# Harvey's Hub Implementation Plan

> **For agentic workers:** executed natively in one session (Harvey asked to build, push, and deploy after approving the design). Steps use checkbox syntax.

**Goal:** Build and deploy the Harvey's Hub portfolio described in the design doc.

**Architecture:** Astro 7 static site. Projects are a content collection with a typed, validated schema; everything else lives in two data files. The two interactive pieces (route field, balancing matrix) are framework-free scripts over pure, tested modules.

**Tech Stack:** Astro 7.4, TypeScript 6, Node's built-in test runner, Fontsource, GitHub Actions and Pages.

**Spec:** `docs/superpowers/specs/2026-11-01-portfolio-design.md`

## Global Constraints

- Static output only; deployed from `main` to https://gitlamhoang.github.io.
- Node 24 or later.
- WCAG AA contrast in both themes, visible focus, reduced motion respected, 44 px touch targets, no horizontal scroll at 320 px.
- Copy: no claim without a source, no em dashes, Pfizer only as the AI Engineer Apprenticeship, Specter quotes only if they match a transcript.

## Review Focus

1. Stop during a run: speed must read 0.00 at once and stay there until Run. Pinned by `takeover drops speed to zero at once and freezes the robot`.
2. A route of one waypoint: Run must not move or crash. Pinned by `a route with fewer than two waypoints never moves`.
3. Clicking past the 8-waypoint cap: the route stays at 8 and says why. Checked in the browser.
4. Large matrix powers: values stay exact (BigInt) and the step button stops at n = 30. Pinned by `Theorem 2.1 holds for n = 1..30`.
5. A highlight string that drifts from its result text: the build fails. Pinned by the schema refinement in `src/content.config.ts`.

---

### Task 1: Scaffold
- [x] `package.json` (pinned versions), `astro.config.mjs` (`compressHTML: true` to keep HTML whitespace rules), `tsconfig.json`, `.gitignore`.

### Task 2: Route model
**Files:** `src/lib/route-model.ts`, `src/lib/route-model.test.ts`
**Produces:** `nextSpeed(v, dt, d, limits)`, `step(state, route, laps, dt, limits)`, `run`, `takeover`, `initialState`, `lapLength`.
- [x] Tests for the speed cap, ramp rate, stopping-distance cap, lap completion, slowing near targets, takeover, and degenerate routes.
- [x] Implement until `npm test` passes.

### Task 3: Balancing matrix
**Files:** `src/lib/balancing.ts`, `src/lib/balancing.test.ts`
**Produces:** `B`, `mul`, `power(n)`, `balancingNumbers(count)`, `det`.
- [x] Tests for B², Theorem 2.1 for n = 1..30, det = 1, and gcd(B(m), B(n)) = B(gcd(m, n)).

### Task 4: Styles, layout, shared components
- [x] Tokens and base styles, `Base.astro`, `Header`, `ThemeToggle`, `Epigraph`, `Footer`, `Marked`.

### Task 5: Content
- [x] `src/content.config.ts` schema; four project files; `src/data/profile.ts`; `src/data/quotes.ts`.

### Task 6: Interactive pieces
- [x] `RouteField.astro` and `src/scripts/route-field.ts`; `BalancingMatrix.astro`.

### Task 7: Pages
- [x] Home, `/work/[slug]`, 404.

### Task 8: Ship
- [x] Favicon, robots.txt, sitemap, OG image, JSON-LD, Pages workflow, README.
- [x] Verify: `npm test`, `npm run check`, `npm run build`, browser review at 1440 px and 375 px in both themes.
