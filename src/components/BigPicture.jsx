import { useMemo, useState } from 'react'
import Section from './Section.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import Tooltip from './Tooltip.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { NATION_NAMES, NATION_COUNT } from '../content/nations.js'
import { CHAIN_METRICS } from '../utils/metrics.js'
import { formatNationList } from '../utils/formatNationList.js'
import { missingNations, snapshotRowsByMetric, shareOfPopulationRows } from '../utils/rows.js'

// The one metric in the chain that is a count of people, and so the only one a
// population denominator means anything for. Crop yield is already per hectare
// and generation is already national; dividing either by population would
// produce a number with no referent.
const PER_CAPITA_KEY = 'affected_persons'

// Short enough to sit on top of a bar. The longer phrasing lives in the card
// heading and the aria-label, which is where a reader looks for the unit.
const SHARE_FORMAT = (v) => `${v.toFixed(1)}%`
const SHARE_TICK_FORMAT = (v) => `${v}%`

export default function BigPicture({ data, storm, style }) {
  const eventYear = storm?.year ?? null
  const [perCapita, setPerCapita] = useState(false)
  const hasPopulation = (data?.population?.length ?? 0) > 0
  // The effective mode, not the button state. If the denominator never
  // arrived the tile falls back to counts, so it cannot end up disagreeing
  // with the chart beside it.
  const showShareStats = perCapita && hasPopulation
  const stats = useMemo(
    () => computeStats(data, eventYear, showShareStats),
    [data, eventYear, showShareStats]
  )
  const snapshots = useMemo(
    () => (eventYear ? snapshotRowsByMetric(data, CHAIN_METRICS, eventYear, NATION_NAMES) : null),
    [data, eventYear]
  )
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  const blocked = sectionGuard({
    data,
    storm,
    style,
    tone: 'panel',
    subject: 'The bigger picture',
    prompt: 'see how the region looked that year',
  })
  if (blocked) return blocked

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative">
        <h2 className="type-h2 mb-2">The Bigger Picture</h2>

        <div className="prose-column prose-wide prose-short space-y-3 text-sm opacity-80">
          <p>
            A shared disaster, and a recovery shaped by far more than the weather. All four nations
            at the same moment, before the rest of the story takes them one at a time.
          </p>
        </div>

        {stats ? (
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              index={0}
              label="What happened"
              value={`${storm.nations.length} of ${NATION_COUNT} nations`}
              detail={`${storm.name}, ${storm.year}`}
            />
            <StatTile
              index={1}
              label={`People affected, ${storm.year}`}
              value={stats.totalAffected.toLocaleString()}
              detail="Across all four nations combined"
            />
            <StatTile
              index={2}
              label="Hardest- vs. least-hit"
              value={stats.ratio ? `${stats.ratio.toLocaleString()}×` : 'n/a'}
              detail={
                stats.maxNation
                  ? `${stats.maxNation} vs. ${stats.minNation}, ${
                      showShareStats ? 'as a share of population' : 'by reported count'
                    } for ${storm.year}`
                  : `No comparable figures for ${storm.year}`
              }
            />
            <StatTile
              index={3}
              label="Economic loss reported"
              value={`${stats.economicLossReported} of ${NATION_COUNT} nations`}
              detail={`For ${storm.year} itself, in the official dataset`}
            />
          </div>
        ) : (
          <p className="mt-6 text-sm opacity-70">Loading overview...</p>
        )}

        {snapshots && (
          <div className="mt-6">
            <h3 className="type-subhead mb-1 text-accent">
              Regional Snapshot — {storm.year}
            </h3>
            <p className="prose-column prose-wide prose-short mb-3 text-sm opacity-80">
              All four nations at one moment rather than over time. Countries {storm.name} did not
              reach are shown too &mdash; the point of a same-moment comparison is that it includes
              them.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CHAIN_METRICS.map((m, i) => {
                // The toggle is offered only when the denominator actually
                // arrived. population.json is optional, so a reader whose copy
                // failed to load gets the counts silently rather than a control
                // that produces an empty chart.
                const offerToggle = m.key === PER_CAPITA_KEY && hasPopulation
                const showShare = offerToggle && perCapita
                // Derived at render rather than in the snapshots memo: the
                // conversion is a map over at most four rows, and keeping it
                // here means the memo above stays keyed on the data alone
                // rather than on the toggle.
                const baseRows = snapshots[m.key]
                const rows = showShare
                  ? shareOfPopulationRows(baseRows, data.population, eventYear)
                  : baseRows
                // With the toggle on, a nation can be absent for two different
                // reasons: the source reported nothing for it, or it has no
                // population figure to divide by. Calling the second "no data
                // available" would be wrong -- the count exists, the
                // denominator doesn't -- and this site's whole argument rests
                // on a gap saying accurately what kind of gap it is.
                const nationsMissing = missingNations(NATION_NAMES, rows)
                const noDenominator = showShare
                  ? nationsMissing.filter((n) => baseRows.some((r) => r.nation === n))
                  : []
                const notReported = nationsMissing.filter((n) => !noDenominator.includes(n))
                const missingNote = [
                  notReported.length > 0
                    ? `No ${storm.year} data available for ${formatNationList(notReported)}.`
                    : '',
                  noDenominator.length > 0
                    ? `No ${storm.year} population figure for ${formatNationList(noDenominator)}, so ${
                        noDenominator.length > 1 ? 'they are' : 'it is'
                      } left out of this view.`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                const label = showShare ? 'People affected (share of population)' : m.label
                return (
                  <MetricSnapshotChart
                    key={m.key}
                    label={label}
                    ariaLabel={`${label}, ${storm.year}, by nation`}
                    rows={rows}
                    nationsMissing={nationsMissing}
                    missingNote={missingNote}
                    emptyNote={`Data not available for ${storm.year}.`}
                    format={showShare ? SHARE_FORMAT : m.format}
                    yTickFormat={showShare ? SHARE_TICK_FORMAT : undefined}
                    caveat={showShare ? SHARE_CAVEAT : undefined}
                    control={
                      offerToggle ? (
                        <PerCapitaToggle value={perCapita} onChange={setPerCapita} />
                      ) : undefined
                    }
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                    index={i}
                    className={i === CHAIN_METRICS.length - 1 && CHAIN_METRICS.length % 2 !== 0 ? 'sm:col-span-2' : ''}
                  />
                )
              })}
            </div>
          </div>
        )}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

// What the percentage version cannot be read as. The count already carries its
// own caveats in metrics.js; these are the ones the division adds.
//
// The source note is here rather than only in the methods panel because this is
// where the conflict becomes visible: the storm cards quote shares from
// government and PDNA assessments, and dividing the SPC series gives a
// different figure for the same event. Naming both is the only honest option --
// silently printing 68.9% beside a card that says 62% invites the reader to
// assume one of them is a mistake.
const SHARE_CAVEAT =
  'Each figure divided by that nation\u2019s mid-year population estimate for the same year. Still an annual, all-hazard total, so a year holding two cyclones is one number here as well. Percentages derived from the SPC series will not always match the shares quoted on the storm cards, which come from government and PDNA assessments counting a single event on their own population base: for Cyclone Winston the two give roughly 69% and 62% of Fiji. Both are reported figures; neither is a correction of the other.'

function PerCapitaToggle({ value, onChange }) {
  const option = (active) =>
    `press-target rounded-md px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
      active ? 'bg-accent/15 font-semibold text-accent' : 'opacity-70 hover:opacity-100'
    }`

  return (
    <div
      role="group"
      aria-label="Measure people affected as a count or as a share of population"
      className="flex shrink-0 items-center rounded-lg border border-ink/15 p-0.5 text-xs"
    >
      <button type="button" onClick={() => onChange(false)} aria-pressed={!value} className={option(!value)}>
        Count
      </button>
      <button type="button" onClick={() => onChange(true)} aria-pressed={value} className={option(value)}>
        Share
      </button>
    </div>
  )
}

function StatTile({ index, label, value, detail }) {
  return (
    <div
      className="animate-pop-in rounded-xl border border-ink/10 bg-surface/60 p-4"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <p className="type-eyebrow text-accent">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs opacity-70">{detail}</p>
    </div>
  )
}

// Rounded to a precision the gap can actually carry. The old rule rounded
// every ratio to the nearest hundred, which reads as sensible against Harold's
// 3,629x and silently turned every smaller gap into zero -- and zero is falsy,
// so the tile printed "n/a" for Pam, Winston and Gita while holding perfectly
// good figures for all three. Only one of the six storms ever showed a number.
//
// Per-capita ratios are smaller than raw ones almost by construction, since
// dividing by population pulls the extremes together, so the toggle would have
// made a rare bug into a common one.
function roundRatio(value) {
  if (value >= 100) return Math.round(value / 100) * 100
  if (value >= 10) return Math.round(value)
  return Math.round(value * 10) / 10
}

// The hardest/least-hit ratio is drawn from every nation with a figure that
// year, not only the ones the storm reached. That is the right population for a
// regional snapshot, but it means the two named nations were not necessarily
// both struck -- so the tile no longer says "the same event", which for five of
// the six storms was not true.
//
// The ratio follows the per-capita toggle, and has to: it is a comparison
// between two nations at one moment, which is precisely the quantity a raw
// count distorts. Left in counts while the chart beside it offered shares, the
// tile would be making the error the chart exists to correct.
//
// The total affected does not follow the toggle, and must not. It is a sum of
// people across four nations; shares of four different denominators do not add
// up to anything, and a "112%" here would be meaningless.
function computeStats(data, eventYear, perCapita) {
  if (!data || !eventYear) return null
  const rows = data.affected_persons ?? []
  const eventRows = rows.filter((d) => d.year === eventYear)
  if (eventRows.length === 0) return null

  const totalAffected = eventRows.reduce((sum, d) => sum + d.affected_persons, 0)

  // Compared in whichever unit the reader has chosen. A nation with no
  // population figure drops out of the per-capita comparison rather than being
  // ranked against the others on a different basis.
  const comparable = perCapita
    ? shareOfPopulationRows(
        eventRows.map((d) => ({ nation: d.nation, value: d.affected_persons })),
        data.population,
        eventYear
      )
    : eventRows.map((d) => ({ nation: d.nation, value: d.affected_persons }))

  let maxNation = null
  let minNation = null
  let ratio = null
  // Two nations or it isn't a comparison. Pam's year reports one country, and
  // ranking it against itself would print a confident 1x.
  if (comparable.length >= 2) {
    const max = comparable.reduce((a, b) => (b.value > a.value ? b : a))
    const min = comparable.reduce((a, b) => (b.value < a.value ? b : a))
    maxNation = max.nation
    minNation = min.nation
    ratio = min.value > 0 ? roundRatio(max.value / min.value) : null
  }

  const economicLossReported = (data.economic_loss ?? []).filter((d) => d.year === eventYear).length

  return { totalAffected, maxNation, minNation, ratio, economicLossReported }
}

