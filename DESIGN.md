---
name: Harvey's Hub
description: Harvey Phan's robotics and AI portfolio, a case file of work shown running beside its claim, measured result, and limit.
colors:
  ground: "#000000"
  surface-1: "#181818"
  surface-2: "#1f1f1f"
  surface-3: "#272727"
  surface-4: "#313131"
  border: "#272727"
  border-strong: "#313131"
  text: "#ffffff"
  text-2: "#9b9b9b"
  text-3: "#8a8a8a"
  accent: "#e5c04a"
  accent-ink: "#000000"
typography:
  heading-1:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: "3.75rem"
    letterSpacing: "-0.035em"
  heading-2:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: "3rem"
    letterSpacing: "-0.03em"
  heading-3:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: "2.5rem"
    letterSpacing: "-0.025em"
  heading-5:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.015em"
  heading-6:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
  title-1:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
  title-2:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: "1.75rem"
  title-4:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  body-2:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: "1.5rem"
  body-3:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  body-6:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  button-md:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.5rem"
  caption-2:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  space-25: "2px"
  space-50: "4px"
  space-75: "8px"
  space-100: "12px"
  space-200: "16px"
  space-300: "24px"
  space-400: "32px"
  space-500: "40px"
  space-600: "48px"
  space-700: "64px"
  space-800: "80px"
  space-900: "96px"
components:
  button-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground}"
    typography: "{typography.button-md}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    typography: "{typography.button-md}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-3}"
  button-small:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    height: "36px"
  panel:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.2xl}"
    padding: "8px"
  panel-inset:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.lg}"
    padding: "24px"
  tab-track:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.xl}"
    padding: "4px"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    typography: "{typography.title-4}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "40px"
  tab-selected:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground}"
  nav-pill:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.full}"
    padding: "4px 4px 4px 16px"
  nav-link:
    textColor: "{colors.text-2}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
    height: "36px"
  nav-link-current:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text}"
---

# Design System: Harvey's Hub

## Overview

**Creative North Star: "The Case File"**

The site is a case file opened on black: flat dark surfaces stacked in a fixed order, each holding evidence, and one gold mark reserved for numbers that came out of a measurement. The world is elayadesign's landing-page-design system (Part B), pinned by the owner on 2026-11-03 and run under impeccable's process. It is Geist alone, named text styles on the Tailwind scale, spacing from a fixed 2 to 96 px token set, Tailwind radii with nested-radius math, full 1px borders, a floating blurred pill nav, and a white to grey gradient on each page's top heading.

Density is calm and wide: a 1312 px page, 96 px between sections, and panels that hold content with an 8 px shell so media sits inside with the nested radius. Motion is weighted and decelerating (`cubic-bezier(0.22, 1, 0.36, 1)`): content rises 32 px and fades in once, tabs cross-fade with an 8 px rise, and the tagline lights word by word. Everything honours `prefers-reduced-motion`.

The site is dark only. Print is the one exception: the print stylesheet turns the page into a clean black-on-white CV. Rejected worlds (the IBM Carbon "report and instrument" pass and the "launch film" graphite cinema pass) are not to return.

**Key Characteristics:**
- Flat black ground (#000000) with three stepped surfaces and full 1px borders; no shadows.
- One face, Geist, used only through named text styles.
- Spacing only from the 2 to 96 px token set.
- Gold appears only on measured figures, and every figure sits beside its limit.
- Floating blurred pill nav; panels nested at 16 px outside, 8 px inside.

## Colors

A black ground with grey steps for surfaces, white and two greys for text, and a single gold that means "this was measured".

### Primary
- **Measured Gold** (`accent`): the value of an evaluated result, and nothing else. It colours the case-file stat, the write-up stat, and inline `mark` highlights of a measured number inside running text. Text on a gold fill uses Accent Ink (`accent-ink`, black).

### Neutral
- **Ground Black** (`ground`): the page, and the text colour on white fills (primary button, selected tab, selection).
- **Panel Grey** (`surface-1`): every panel, the nav pill (at 72% opacity behind a blur), and image frames.
- **Inset Grey** (`surface-2`): insets inside a panel, the tab track, secondary buttons, and media wells.
- **Hover Grey** (`surface-3`): hover fill for buttons, tabs, and nav links; the current nav link; inline code. Also the default border colour (`border`).
- **Strong Edge** (`surface-4` / `border-strong`): button borders and the scrollbar thumb.
- **White** (`text`): headings, body copy, focus outlines, primary fills.
- **Quiet Grey** (`text-2`): subheadings, labels (Claim, Limit, The question), meta lines, captions, idle nav links and tabs.
- **Faint Grey** (`text-3`): rare tertiary text; kept at 5:1 or better on black.

### Named Rules
**The Measured Gold Rule.** Gold (#E5C04A) marks only a number that came out of an evaluation. Not links, not icons, not headings, not decoration, not hover states.

**The Number With Its Limit Rule.** A measured figure never appears without its limit in the same view (PRODUCT.md principle 1). On the home page every case-file tab's limit ends above 900 px.

**The Dark Only Rule.** There is one theme, dark. Do not add a light theme or a theme toggle; only print flips to black on white.

## Typography

**Display Font:** Geist Variable (with Geist, system-ui, sans-serif)
**Body Font:** Geist Variable
**Label/Mono Font:** Geist, with `tabular-nums` for figures. Inline `code` is the one place a monospace stack appears.

**Character:** One neutral, precise grotesque carries everything; hierarchy comes from size, weight (400, 500, 600), negative tracking on headings, and the white to grey colour step, never from a second family.

### Hierarchy
- **Heading 1** (600, 3.75rem / 3.75rem, -0.035em; 2.25rem / 2.5rem under 768 px): the home hero heading, two lines, in the text gradient.
- **Heading 2** (600, 3rem / 3rem, -0.03em; 1.875rem under 768 px): section titles and the top heading of write-ups, lab, and 404 (in the gradient there).
- **Heading 3** (600, 2.25rem / 2.5rem): the gold case-file stat.
- **Heading 5 / 6** (600, 1.5rem and 1.25rem): panel and project titles; organisation names in experience.
- **Title 1 / 2** (500, 1.25rem and 1.125rem): hero subheading, section ledes, the organisations row.
- **Title 4** (500, 0.875rem / 1.25rem): tabs and field labels (Claim, Limit, The question), set in Quiet Grey.
- **Body 3** (400, 1rem / 1.5rem): running text, held to a 36rem measure (about 75 characters).
- **Body 6 / Caption 2** (400, 0.875rem / 1.25rem): bylines, dates, meta, captions, held to 30rem.
- **Button md / sm** (600, 1rem and 0.875rem).

### Named Rules
**The Named Style Rule.** Text is set only through the named styles (heading-1 to heading-6, title-1 to title-5, body-1 to body-6, button-lg/md/sm, caption-1 to caption-5). No ad hoc sizes.

**The Upright Rule.** Nothing is italic. `em`, `i`, and `cite` render upright, including the Specter quotes.

**The Copy Is Harvey's Rule.** Dates are written like LinkedIn ("Jun 2026 - Sep 2026"), and project titles are set exactly as Harvey wrote them. The system does not restyle or rewrite either.

## Layout

A centred container of 1312 px plus gutters (24 px, 48 px from 768 px). Sections are separated by 96 px (64 px on phones). Section heads are a two-column grid: a 680 px title and lede block on the left, a 22rem epigraph on the right, collapsing to one column under 900 px. The hero follows the same pattern: 680 px heading and subheading left, actions and epigraph right, aligned to the bottom.

The case file is the signature layout: one panel with a bar (title, tabs, hint) and a two-column body, media left and facts right, stacking under 1000 px. Experience is two panels side by side (Now, Before); research pairs a wide panel with two smaller ones on a 5:7 then 1:1 grid; education is 7:5. People are three staggered portraits (offsets of 0, 80, and 32 px) that stack under 700 px.

**The Fixed Spacing Rule.** Every margin, padding, and gap comes from the 2 to 96 px tokens (2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96). No values between steps.

Touch targets are at least 44 px (36 px for small pills inside the nav and replay, which sit inside larger hit areas). No horizontal scroll at 320 px.

## Elevation & Depth

Flat. Depth comes from tonal steps (black ground, then Panel Grey, then Inset Grey) and from full 1px borders, not from shadows. The only translucency is the nav: the pill at 72% Panel Grey and the phone menu at 90% black, both behind a backdrop blur (16 px with 140% saturation on the pill, 24 px on the menu). The replay readout sits on 78% black over the video.

**The Tonal Step Rule.** To lift something, move it one surface step up and give it a full border. Never add a drop shadow.

**The Blur Order Rule.** Write `-webkit-backdrop-filter` first and the unprefixed `backdrop-filter` after it; the production minifier drops the unprefixed one otherwise. Do not give the nav its own view-transition name, or the blur stops seeing the page.

## Shapes

Tailwind radii with nested-radius math: an outer panel at 16 px with an 8 px shell padding holds insets and media at 8 px, so the inner corner equals the outer minus the gap. Buttons and the tab track are 12 px, tabs inside the track 8 px, and the nav pill, nav links, and small buttons are fully round. Focus outlines take 6 px. Every container has a full 1px border on all four sides.

**The Nested Radius Rule.** Inner radius = outer radius minus padding: 16 px panel, 8 px padding, 8 px inner. The method inset nested in the research panel is sanctioned by the pin and follows the same math.

## Components

### Buttons
Solid, quiet, and compact.
- **Shape:** gently rounded (12 px), 44 px minimum height, 8 by 12 px padding, 8 px gap to an 18 px icon.
- **Primary:** white fill, black text, white border. Hover lightens to #e6e6e6. One per group (Download resume).
- **Secondary:** Inset Grey fill, Strong Edge border, white text. Hover moves to Hover Grey and rises 1 px.
- **Press:** scales to 0.98. Pressed toggles (`aria-pressed`) take the primary white fill. Disabled drops to 45% opacity.
- **Small:** a fully round pill, 36 px high, 0.875rem text; used for the replay toggle and in-panel controls.

### Cards / Containers
- **Corner Style:** 16 px panel, 8 px inset.
- **Background:** Panel Grey, insets Inset Grey.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** full 1px in `border`.
- **Internal Padding:** 8 px shell when the panel wraps media; 24 to 32 px when it wraps text.

### Navigation
A floating pill fixed 16 px from the top, centred: brand name, links, a palette search icon, and a small Resume button. Links are Quiet Grey on transparent; the current page and hover take Hover Grey with white text. Under 768 px the pill stretches full width and a two-line toggle turns into a cross; the full-screen menu fades its items up 24 px with a 60 ms stagger.

### Case File (signature)
One panel, a segmented tab per project. The tab track is Inset Grey at 12 px with a 4 px pad; the selected tab is white with black text. Each tab shows the work running (the HARP replay or a project screenshot on a white well) beside the title, a meta line, the gold stat, Claim, Limit, and links. Arrow, Home, and End keys move between tabs, and `#work-<slug>` opens one. Without script every project shows, stacked. In print every tab prints.

### Replay with readout
The HARP video in an 8 px frame (16:9, 4:5 under 700 px), with a readout panel top right: 78% black, 12 px radius, right-aligned figures in tabular numerals, and a small pause pill. On phones the figures hide and only the toggle stays.

### Tagline reveal
One sentence at 680 px, its words dimmed to 28% white and lit to white one by one as it scrolls in.

### Closing call to action
A 7:5 panel: the ask with Download resume and Email me on the left, a contact list (Phosphor icon, label, value) on the right; fine print and footer links below.

### Icons
Phosphor, regular weight, inlined as SVG so every icon shares one stroke: 18 px in buttons and the nav, 16 px in link rows and the contact list.

## Do's and Don'ts

### Do:
- **Do** set every page's top heading in the white to grey text gradient (#ffffff to #9b9b9b, left to right); that heading is the only gradient on the site.
- **Do** keep gold (#E5C04A) for measured figures, and place each figure's limit in the same view.
- **Do** take every space from the 2 to 96 px tokens and every radius from the Tailwind set, with inner radius = outer minus padding.
- **Do** set figures in tabular numerals.
- **Do** write dates like LinkedIn ("Jun 2026 - Sep 2026") and keep project titles as written.
- **Do** reveal content once, rising 32 px over 700 ms on the weighted ease, and drop the movement under reduced motion.

### Don't:
- **Don't** add a second typeface, italics, or sizes outside the named styles.
- **Don't** add drop shadows; lift with a surface step and a border.
- **Don't** use gold on links, icons, headings, hovers, carets, or decoration.
- **Don't** add a light theme or a theme toggle.
- **Don't** put a gradient anywhere but the top heading's text: no gradient fills, borders, or backgrounds.
- **Don't** add eyebrows or kicker labels above headings.
