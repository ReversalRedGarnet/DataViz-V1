# Ripple
### Climate Doesn't Create Inequality. It Reveals It.

> An interactive data story exploring how climate change amplifies existing social and economic vulnerabilities across the Pacific.

---

## Competition

Built for the **2026 Pacific DataViz Challenge** (theme: **Climate Change**), submitted to the **Interactive** category.

Submissions close **August 31, 2026**.

---

## Core Question

> How do existing inequalities determine who suffers most from climate change?

Rather than asking *which country is worst*, Ripple asks *why do places hit by the same hazard end up in such different places a year later?*

---

## Scope (locked)

To ship a finished, polished piece solo in ~4 weeks, this project is intentionally narrow:

- **One hazard event** — Cyclone Harold, April 2020 — not a general hazard catalogue.
- **Four countries/territories** (Vanuatu, Fiji, Tonga, Solomon Islands), all struck by the same cyclone within the same week but left in visibly different places a year later — not an open-ended country explorer.
- **One real ripple chain**, built from actual linked official data (disaster → economic loss → crop yield → power generation → tourist arrivals), not an illustrative diagram.
- **One comparison view** letting any two of the four be placed side by side through that same chain, so the "why do outcomes differ" question is visible without extra explanatory text.

Anything beyond this (time sliders, story/exploration mode toggle, downloadable reports, full vulnerability-dimension dashboard) is a **v2 idea**, not part of this submission.

---

## Guiding Principles

- Data should tell a human story.
- Climate change is a multiplier — not the sole cause — of social issues.
- Every visualization should answer "why?" rather than simply showing "what."
- One narrow, finished story beats five shallow ones.
- Focus on empathy through evidence.

---

## Data Sources

All five datasets are drawn from the official 2026 list on the Pacific Data Hub's .Stat Explorer, covering Vanuatu, Fiji, Tonga, and Solomon Islands:

- Number of directly affected persons attributed to disasters
- Direct disaster economic loss (thin coverage — only Fiji has a real 2020 figure in the official data)
- Crop yield
- Tourist arrivals (no data for Solomon Islands; 2020 is confounded by COVID)
- Power generation

All sources were exported manually as CSV from [stats.pacificdata.org](https://stats.pacificdata.org/), cleaned by `data-pipeline/clean_data.py`, and are listed in full in the in-app citation panel. The same list should go in the competition submission form per the competition rules.

**Supplementary sources** (not from the official list; used only for the "storm itself" category-vs-deaths comparison, not for any ripple-chain metric): the Australian Bureau of Meteorology's official cyclone history, and UN OCHA/ReliefWeb humanitarian situation reports. Both are linked in the in-app citation panel alongside the primary five.

---

## Technical Stack (locked — one tool per job)

**Languages**
- Python — one-time, offline data cleaning only (not run in-browser)
- JavaScript — entire frontend (no TypeScript, to avoid added overhead against the timeline)
- HTML/CSS — written through JSX + Tailwind, not hand-authored separately

**Data pipeline**
- Pandas — clean official CSV exports into 5 small static JSON files (one per metric), scoped to the four chosen countries and one event window
- *(GeoPandas skipped — no raw shapefile processing needed; the map uses a pre-made TopoJSON, `public/land-50m.json`)*

**Frontend**
- React (via Vite) — app shell and state. No router: this is one page, and the section menu in the header moves within it
- D3.js — all charts, the ripple-chain visualization, and the map *(Plotly and Observable Plot deliberately excluded to avoid running three charting paradigms in parallel)*
- topojson-client — decodes the pre-made TopoJSON for the map; no separate mapping library needed since D3 renders it directly
- Tailwind CSS — all styling, with class-based dark mode over a CSS-variable palette
- Newsreader (Google Fonts) — headings and the wordmark only; body, UI and data stay on the system sans

**Platforms/tools**
- Node.js + npm — local dev environment
- Git + GitHub — version control and source
- Netlify / Vercel / GitHub Pages — static deploy, satisfying the "must be made public" rule
- Chrome DevTools (device toolbar + Lighthouse) — only testing tool; no test framework or CI needed at this scope

---

## Build Plan

| Phase | Focus | Est. time |
|---|---|---|
| 1 | Lock the hazard + country set, pull real numbers | 2–3 days |
| 2 | Build the Pandas data pipeline into clean static JSON | 2–3 days |
| 3 | Scaffold React + build core D3 ripple-chain charts | 4–5 days |
| 4 | Build the comparison view | 3–4 days |
| 5 | Polish: transitions, citations panel, accessibility, mobile pass | 4–5 days |
| 6 | Write framing text, test, submit with buffer before Aug 31 | 3–4 days |

---

## Rules Compliance Checklist

- [x] Uses at least one dataset from the official 2026 list
- [ ] All additional data sources are open data and listed in the submission form
- [ ] Final dataviz is made public (deployed + link submitted)
- [ ] Submitted before August 31, 2026

---

## Current Status

Built, deployed, and through several rounds of UI/UX polish — tooltips, motion, per-metric chart types, the "Big Picture" section, comparative insights, two-tone section dividers, and the Hero framing copy naming Cyclone Harold directly.

The most recent pass brought forward every hardening change developed in the parallel multi-hazard build, adapted to this single-page shape:

- **Theming** — light/dark mode with a pre-paint script so a dark-mode visitor never sees a frame of the light palette. Every chart, map and divider colour is theme-aware and contrast-checked against both backgrounds (`src/utils/theme.js`).
- **Charts redrawn in real pixels** — a `ResizeObserver` measures each card first (`useElementWidth`) instead of scaling a fixed viewBox to fit, which previously multiplied every font size and stroke width by whatever ratio the container imposed.
- **Motion** — entrance animations hold until a card is actually on screen (`useInView`), and every transition checks `prefers-reduced-motion` through one shared helper.
- **Attribution caveats** — each metric carries a note about what it cannot be read as, printed under its chart rather than buried in a methodology note, because the misreading happens at the moment the chart is looked at.
- **Cross-chart highlight** — pointing at a country anywhere on the page dims it out of every other chart at once.
- **Divergence view** — each nation indexed to its own event-year figure, so the fan-out is visible without ranking anyone against anyone else.
- **Storm journey**, an animated track section; original tiling backdrops; social preview metadata; and a redrawn cursor pair.

Left before submission: the multi-storm pivot (see below), a fresh accessibility/mobile pass, and the competition submission itself.

### Next: multi-storm scope

The roster is widening from Cyclone Harold alone to every severe tropical cyclone that made landfall or had major impact in two or more Pacific nations since ~2015 — Pam, Winston, Gita, Harold, Yasa, Judy & Kevin, and Lola. Ana, Cody and Rae fall outside that rule and are deliberately excluded; that exclusion logic belongs on the site itself, since it is what makes the roster defensible rather than cherry-picked.

That work needs three things this repo does not yet have: a decided architecture for showing more than one storm, a re-export of the Pacific Data Hub series across the full 2015–2024 range, and population denominators so "share of population affected" figures mean something. The "Scope (locked)" section above still describes the shipped single-storm build and will be rewritten when the pivot lands.

---

## Vision

Climate hazards are natural. Disasters are shaped by society.

**Ripple** seeks to make those connections visible — not to tell people what to think, but to help them understand the systems that determine who bears the greatest burden of a changing climate.

---

## Author

**Aziel Douglas Orihao**

Information Systems | Climate Justice | Data Storytelling | Pacific Technology

*"The most important stories in data aren't the numbers themselves—they're the people whose lives those numbers represent."*
