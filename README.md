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

## Scope

Six storms, four nations, ten years.

**The four countries were not chosen for their stories.** Solomon Islands,
Vanuatu, Fiji and Tonga sit along the same corridor of the South Pacific cyclone
basin, which makes them the group most often struck by the *same* storm rather
than merely by storms of their own. That shared exposure is the entire basis for
comparing them: when one weather system reaches all four, the differences in what
it leaves behind cannot be explained by the weather.

**The roster is not a selection of interesting cyclones** either; it is
everything that passed a rule fixed before the list was drawn:

> **A severe tropical cyclone that made landfall or had major impact in two or
> more of the four in-scope nations, between 2015 and 2024.**

| Storm | Year | In-scope nations struck |
|---|---|---|
| Pam | 2015 | Solomon Islands, Vanuatu |
| Winston | 2016 | Tonga, Fiji |
| Gita | 2018 | Tonga, Fiji |
| Harold | 2020 | Solomon Islands, Vanuatu, Fiji, Tonga |
| Judy & Kevin | 2023 | Solomon Islands, Vanuatu |
| Lola | 2023 | Solomon Islands, Vanuatu |

Judy and Kevin are counted as one event: they struck Vanuatu two days apart and
every official assessment reports them together.

**Excluded by the same rule:** Yasa (2020), Ana (2021), Cody (2022) — Fiji only;
Rae (2022) — not severe, no deaths. These are named on the site itself, because
a roster nobody can check is not evidence. Yasa is the one that costs the
argument something: a second severe cyclone in 2020 would have made that year
look far worse. It is excluded anyway, or it is not a rule.

**The opening claim is a count, not a trend.** Each of these four nations was
struck three or four times in ten years. That is plain event-counting against a
stated rule — no statistical inference, nothing requiring an IPCC confidence
level to stand up. An earlier plan was to open on year-clustering, and it was
dropped when the roster failed to support it: only one year in ten holds more
than one of these storms. The recurrence is in the countries, not the calendar.

### What the site shows

- **A timeline** of all six storms across the ten-year window, nothing selected
  on load. Picking one drives every section below it.
- **A ripple chain** of five linked records — people affected, crop yield,
  livestock yield, power generation, tourist arrivals — anchored to the selected
  storm's year. Nations that storm did not reach stay on the chart, faded: a
  country the storm missed is the nearest thing this data has to a control.
- **A storm profile and journey** per storm, comparing category at closest
  approach against reported deaths, from hand-researched national assessments.
- **A divergence view** indexing each nation to its own event-year figure, so
  the fan-out is visible without ranking anyone against anyone else.
- **Capacity and physical context** — weather-station counts, sea surface
  temperature, emissions per head — records that are complete precisely because
  they need nobody to file a report.

---

## Guiding Principles

- Data should tell a human story.
- Climate change is a multiplier — not the sole cause — of social issues.
- Every visualization should answer "why?" rather than simply showing "what."
- One narrow, finished story beats five shallow ones.
- Focus on empathy through evidence.

---

## Data Sources

**Ten indicators, all from the official 2026 list** on the Pacific Data Hub's
.Stat Explorer, covering Solomon Islands, Vanuatu, Fiji and Tonga across
2013–2024.

*Chain — consequences of a disaster:*
- Directly affected persons attributed to disasters
- Crop yield
- Livestock yield
- Power generation
- Tourist arrivals

*Capacity:*
- Meteorological monitoring network

*Physical context:*
- Sea surface temperature anomaly
- Greenhouse gas emissions per capita

*Supporting:*
- Mid-year population estimates (denominator for share-of-population figures)
- Direct disaster economic loss (footnote only — ten country-years in twelve)

The grouping is an argument, not a filing convenience. The chain metrics are the
patchy ones, because a disaster figure only exists if a country had the capacity
to assess and file it after being hit — which is exactly what a disaster
destroys, and exactly what the least-resourced countries have least of. The
capacity and context records are complete because they are structural or
satellite-derived and need nobody to report them. That asymmetry is one of the
things the data says.

Exported unfiltered from [stats.pacificdata.org](https://stats.pacificdata.org/)
and cleaned by `data-pipeline/clean_data.py`, which prints a coverage report per
metric and per storm on every run.

### Three deliberate departures from the source data

**Zero treated as unreported** in the people-affected series. That series cannot
distinguish "nobody was affected" from "nothing was submitted", and the
difference is not academic: Vanuatu's official figure for 2015, the year Cyclone
Pam became the most destructive storm in its history, is zero. The rule is
applied to every zero in that series rather than only to years a storm is known
to have struck, so no individual figure is overridden on our judgement. Ten
nation-years are affected, and the pipeline names them on each run.

**Sea level exported, then cut from the charts.** The portal reports it to the
nearest 0.1 m, giving three distinct values across twelve years. It underwrites
the best-attributed mechanism available — higher seas carry a storm surge
further inland — so the point is made in prose in the context section rather
than in a chart that would claim more precision than the record has.

**No global comparator on the emissions chart.** The source gives the unit only
as "tonnes", without stating whether it counts CO₂ alone or all greenhouse gases
as CO₂-equivalent, or whether land use is included. A comparator on a different
accounting basis would look like a fair comparison and would not be one.

### Supplementary sources

Used only for the per-storm facts in the profile and journey sections, never for
a chain metric. Each storm carries its own pair in `src/content/storms.js`:
government post-disaster needs assessments, RSMC Nadi and national
meteorological services, and UN OCHA / ReliefWeb situation reports. Where figures
conflict, the order of preference is national disaster management office, then
OCHA situation reports, then agency appeals — appeals last because they are
written before assessment finishes and usually report people *exposed* rather
than people *affected*.

Note that the Bureau of Meteorology only keeps history pages for the Australian
region, so it covers Harold and none of the others. There is a live trap in the
obvious guess: `bom.gov.au` has a page for a "Cyclone Pam" that is a different
1974 Australian storm.

Where no figure was ever published, the site shows "not reported" rather than
zero — including a separate band above the storm-profile chart, since every
unreported stop on this roster is the secondary nation in its storm.

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

## Rules Compliance Checklist

- [x] Uses at least one dataset from the official 2026 list — ten of them
- [x] All additional data sources are open data
- [x] Final dataviz is deployed and publicly reachable
- [ ] Source list filed in the submission form
- [ ] Submitted before August 31, 2026

---

## Current Status

Built, deployed, and through several rounds of hardening: light/dark theming,
real-pixel chart rendering, motion that respects `prefers-reduced-motion`,
per-metric attribution caveats printed under the charts rather than buried in a
methodology note, cross-chart nation highlighting, and screen-reader data tables
under every visualization.

The multi-storm restructure is complete — timeline, per-storm ripple chain,
storm-aware map, exclusions section, and full profile and journey records for
all six storms.

The experience layer is a second pass over the same data and the same argument,
turning a deck that was read into one that is driven:

- **One state, held once** (`hooks/useStory.js`) — storm, country pair, reading
  mode, position along the storm's path, open ripple link. Sections receive it
  as props and keep no copies, so a stale chart is impossible rather than
  unlikely.
- **Story and Explore modes** — the same sections and the same data. Story holds
  the reader at a section until they have answered it and carries them onward
  when they choose a storm; Explore lifts the country hold and lets them
  navigate freely.
- **A persistent story-state bar** in the header — what is selected, how to
  change it, and, before anything is, which choice the story is waiting on.
- **An interactive opening** — the four nations are nodes that answer with their
  own share of the roster, counted from the same list the headline counts.
- **Follow the Storm is scrubbed, not scrolled** — a real slider with pointer
  drag, arrow/Home/End keys and per-stop buttons, snapping to documented impact
  points rather than interpolating between them. This replaced an
  IntersectionObserver reading a tall column, and with it the two CSS
  percentages that manufactured the scroll travel that mechanism needed.
- **The ripple chain is a chain** — five links in the order the damage travels;
  holding one rings its chart and lets the others recede, opening one shows what
  that record covers, how many years were actually reported, and how many of
  those are reported zeros rather than gaps.
- **A question before the conclusion, and a conclusion** — an optional
  interpretive interaction that points at existing evidence without scoring the
  answer, then a synthesis with replay controls back into the loop.

No dataset, storm inclusion rule, caveat or citation was changed in this pass.

Remaining before submission: replace the deployment-domain placeholders in
`index.html` with the production URL, and file the competition submission form
with the source list above.

---

## Vision

Climate hazards are natural. Disasters are shaped by society.

**Ripple** seeks to make those connections visible — not to tell people what to think, but to help them understand the systems that determine who bears the greatest burden of a changing climate.

---

## Author

**Aziel Douglas Orihao**

Information Systems | Climate Justice | Data Storytelling | Pacific Technology

*"The most important stories in data aren't the numbers themselves—they're the people whose lives those numbers represent."*
