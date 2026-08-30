# Ripple
### Climate Doesn't Create Inequality. It Reveals It.

> An interactive data story exploring how climate change amplifies existing social and economic vulnerabilities across the Pacific.

---

## Core Question

> How do existing inequalities determine who suffers most from climate change?

Rather than asking *which country is worst*, Ripple asks *why do places hit by the same hazard end up in such different places a year later?*

## Scope & Methodology

Six storms, four nations, ten years.

Solomon Islands, Vanuatu, Fiji and Tonga weren't picked for their stories. They sit along the same corridor of the South Pacific cyclone basin, which makes them the group most often struck by the *same* storm rather than merely by storms of their own — and that shared exposure is the entire basis for comparing them. When one weather system reaches all four, the differences in what it leaves behind cannot be explained by the weather.

Nor is the roster a selection of interesting cyclones. It's everything that passed a rule fixed before the list was drawn:

> A severe tropical cyclone that made landfall or had major impact in two or more of the four in-scope nations, between 2015 and 2024.

| Storm | Year | In-scope nations struck |
|---|---|---|
| Pam | 2015 | Solomon Islands, Vanuatu |
| Winston | 2016 | Tonga, Fiji |
| Gita | 2018 | Tonga, Fiji |
| Harold | 2020 | Solomon Islands, Vanuatu, Fiji, Tonga |
| Judy & Kevin | 2023 | Solomon Islands, Vanuatu |
| Lola | 2023 | Solomon Islands, Vanuatu |

Judy and Kevin are counted as one event: they struck Vanuatu two days apart, and every official assessment — the government PDNA and OCHA's situation reports — reports combined figures for the pair rather than separating them.

Four more storms fell just short of the same rule, and are named on the site itself, because a roster nobody can check is not evidence: Yasa (2020), Ana (2021) and Cody (2022) struck Fiji alone, and Rae (2022) never reached severe intensity and caused no reported deaths. Yasa is the one that actually costs the argument something — it was severe, and a second severe cyclone in 2020 would have made that year look far worse. It's excluded anyway, because the rule was fixed before the roster was drawn, and a rule that bends for its most inconvenient case isn't a rule.

The opening claim is a count, not a trend: each of these four nations was struck three or four times in ten years, computed from the same roster the headline counts rather than typed in twice. No statistical inference, nothing requiring a confidence interval to stand up.

## What the Site Shows

Ripple is a single continuous page, not a set of separate views. It opens with an illustrated poem, then a title slide, then a timeline of all six storms — which holds the reader there until one is picked, since every section after it is about one storm and there's nothing to walk forward into otherwise. Even the opening slide is interactive: point at or press one of the four nations and it answers with its own share of the roster.

Once a storm is picked, the page opens up into everything that storm's own record supports. Follow the Storm is a real slider — pointer drag, arrow keys, Home/End, or a button per stop — that snaps to the storm's documented impact points in order rather than interpolating between them. Next to it, a storm profile sets category at closest approach against reported deaths, hand-researched from national assessments, with the reported/unreported distinction spelled out rather than folded into a silent zero.

Then an interactive map: the four nations, faded where the storm didn't reach, clickable everywhere. Picking a pair here drives everything downstream —

- a ripple chain of five linked records (people affected, crop yield, livestock yield, power generation, tourist arrivals) anchored to the storm's year, with nations it never reached staying on the chart, faded, as the nearest thing this data has to a control
- a divergence view indexing each nation to its own event-year figure, so the fan-out afterward is visible without ranking anyone against anyone else
- capacity and physical context — weather-station counts, sea surface temperature, emissions per head — complete precisely because none of it needs anyone to file a report after a disaster
- a paired recovery comparison, an optional interpretive question, and a synthesis with a way back into the loop

Like the timeline, the map holds the reader until a pair is chosen — three empty charts in a row would read as a broken site, not an unanswered question. And because the map is one slide and the charts it drives are several more, a persistent strip in the header carries the current storm and country pair across all of them, says which choice the story is still waiting on, and can clear either from anywhere.

## Guiding Principles

- Data should tell a human story.
- Climate change is a multiplier — not the sole cause — of social issues.
- Every visualization should answer "why?" rather than simply showing "what."
- One narrow, finished story beats five shallow ones.
- Focus on empathy through evidence.

## Data Sources

Ten indicators, all from the Pacific Data Hub's .Stat Explorer, cover Solomon Islands, Vanuatu, Fiji and Tonga across 2013–2024. The analysis window itself runs 2015–2024; the two extra years before it exist so the storm period has a baseline to be read against.

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
- Mid-year population estimates (denominator for share-of-population figures only — not charted on its own)
- Direct disaster economic loss (footnote only — ten country-years across the whole twelve-year window)

The grouping is an argument, not a filing convenience. The chain metrics are the patchy ones, because a disaster figure only exists if a country had the capacity to assess and file it after being hit — which is exactly what a disaster destroys, and exactly what the least-resourced countries have least of. The capacity and context records are complete because they are structural or satellite-derived and need nobody to report them after the fact. That asymmetry is one of the things the data says, not an inconvenience in it.

Exported from [stats.pacificdata.org](https://stats.pacificdata.org/) and cleaned by `data-pipeline/clean_data.py`, which prints a coverage report per metric and per storm on every run — which nation-years exist, which are missing, and which storms each cleaned dataset can and cannot support.

### Zero treated as unreported — in one series only

The people-affected series cannot distinguish "nobody was affected" from "nothing was submitted," and the pipeline drops every reported-zero row in that series rather than charting it as a zero (`data-pipeline/clean_data.py`, the `disaster_affected_persons.csv` config). The rule is applied uniformly to every zero in the series, not case-by-case against the storm roster, so no individual figure is overridden on the project's own judgement. The motivating cases, named directly in the pipeline's own comments: Vanuatu's figure for 2015 — the year Cyclone Pam became the most destructive storm in its history — is zero, and so is Tonga's for 2016 and Fiji's for 2015 and 2017.

### Sea level, exported and then cut

The portal reports it to the nearest 0.1 m, which across this period gives three distinct values and hides any movement under 10 cm. It underwrites the best-attributed mechanism available — higher seas carry a storm surge further inland — so the point is made in prose in the capacity/context section rather than in a chart that would claim more precision than the record has.

### No global comparator on the emissions chart

The source gives the unit only as "tonnes," without stating whether it counts CO₂ alone or all greenhouse gases as CO₂-equivalent, or whether land use is included. A comparator built on a different accounting basis would look like a fair comparison and would not be one, so none is drawn.

### Supplementary sources

Used only for the per-storm facts in the profile and journey sections, never for a chain metric — the chain always cites its own filtered Pacific Data Hub query. Each storm carries its own pair of supplementary citations in `src/content/storms.js`: a government post-disaster needs assessment (or equivalent national/regional assessment), and a UN OCHA / ReliefWeb situation report or national meteorological service record. Where no figure was ever published for a nation a storm reached, the site shows "not reported" rather than zero.

## Architecture & State

Ripple is one continuous page (`src/hooks/useDeck.js`) — there is no separate "Explore" mode or alternate way to move through it. `active` is a single index into a live list of sections that grows once a storm is picked and shrinks again if it's cleared, moved by Next/Previous, the section menu, or the keyboard (arrows and Page Up/Down page the deck; Home/End jump to the ends). Two sections carry a `requires` gate — the timeline holds the reader until a storm is picked, and the map holds them until a country pair is — enforced on every path forward, including the keyboard, but never backward: a gate asks for something before the reader goes on, not before they look again.

One hook holds everything the reader has chosen: `src/hooks/useStory.js` — the selected storm, the country pair (via `useSelection`), the position along the storm's own path, and which ripple-chain link is currently open. Every section reads these as props rather than keeping a copy, so nothing downstream of a pick can go stale relative to it. Picking a new storm atomically resets the path position, closes the open link, and clears the country pair, since a pair chosen against one storm's damage isn't a pair chosen against another's.

What the URL does carry is a deep link to whichever slide is on screen, written with `history.replaceState` on every move rather than a new history entry per slide, and read on load and on every `hashchange` so an incoming link resolves to that section (falling back to the opening slide if it doesn't match any current one). What it doesn't carry is the storm, the country pair, or the position on the storm's path — a shared link reopens the piece at the right slide, not at the exact state a previous reader had reached.

## Technical Stack

**Languages**
- Python — one-time, offline data cleaning only (`data-pipeline/`), never run in-browser
- JavaScript — the entire frontend, no TypeScript
- HTML/CSS — written through JSX + Tailwind, not hand-authored separately

**Data pipeline**
- Pandas — cleans official Pacific Data Hub CSV exports into per-metric JSON files, scoped to the four nations and the 2013–2024 window, then bundles them into one `public/data/metrics.json` (currently ~26 KB) so the site makes one request instead of ten

**Frontend**
- React 18 (via Vite) — app shell and rendering. No router: this is one page, and the header's section menu moves within it
- D3.js — every chart, the ripple chain, and the map. No Plotly, no Observable Plot
- topojson-client — decodes the pre-built land TopoJSON (`public/land-50m.json`) for the map
- Tailwind CSS — all styling, with class-based dark mode
- Newsreader (Google Fonts) — headings and the wordmark only; body and UI text stay on the system sans

**Tools**
- Node.js + npm, Vite for dev/build/preview
- ESLint, with `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y` — not just the default rule set
- Deployed on Vercel

## Known Limitations

Four of the ten indicators — `livestock_yield`, `meteo_stations`, `sst_anomaly` and `ghg_per_capita` — were charted and caveated, but their filtered .Stat Explorer query URLs were never saved anywhere in this repository. The code names this as exactly what it is, a real gap rather than a design decision, and their captions currently show a figure number and title with no link rather than a fabricated one.

Sea level rise is described rather than charted, for the same precision reason: three distinct values across twelve years isn't enough to plot honestly. The emissions chart, similarly, carries no comparator line, because the source doesn't say what the unit actually measures closely enough to compare it against anything else fairly.

Economic loss and tourist arrivals are the sparsest series on the site — ten country-years of data out of a possible forty-eight for the former, and for the latter, Solomon Islands missing entirely and Vanuatu and Tonga stopping early, with the 2020 collapse being COVID-19 border closures rather than any one storm. Both caveats already sit under their own charts rather than being buried here.

And a shared link only reopens the right slide, not the right state: deep-linking covers which section is on screen, not the storm, country pair, or storm-path position a previous reader had reached.

---

## Author

**Aziel Douglas Orihao**

Information Systems | Climate Justice | Data Storytelling | Pacific Technology

*"The most important stories in data aren't the numbers themselves—they're the people whose lives those numbers represent."*
