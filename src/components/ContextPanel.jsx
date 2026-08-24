import { useMemo } from 'react'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import Tooltip from './Tooltip.jsx'
import TrendChart from './TrendChart.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { NATION_NAMES } from '../content/nations.js'
import { CAPACITY_METRICS, CONTEXT_METRICS, CHAIN_METRICS } from '../utils/metrics.js'
import { DATA_YEAR_MIN, DATA_YEAR_MAX } from '../content/storms.js'
import { snapshotRowsByMetric, rowsByMetricForNations, reportingCompletenessByNation } from '../utils/rows.js'

// The capacity chart is flat in every year, so any year is representative --
// but "any year" still has to be a year the pipeline actually exported. This
// was a bare 2024 that had to match YEAR_MAX in data-pipeline/common.py and
// would not have been updated when the window moved, leaving this section
// silently empty. Both now read src/content/roster.json.
const CAPACITY_YEAR = DATA_YEAR_MAX

// The two things the ripple chain cannot show about itself.
//
// Capacity: how many weather stations each nation has. It never changes, which
// is exactly why it belongs here -- it is the standing difference that explains
// why the chain above it has holes in it, and why those holes fall where they
// do. Drawn as a snapshot bar chart, since a flat line over twelve years would
// be a chart of nothing.
//
// Context: sea surface temperature and emissions per head, drawn for all four
// nations at once. These are complete records precisely because they need
// nobody to report them, and they carry the only climate claims this site can
// make with confidence. Both are trends; neither is evidence about an
// individual storm, and each chart's own caveat says so. Sea level belongs in
// this group and is stated in prose instead -- the portal reports it to 0.1 m,
// which is too coarse to chart honestly.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   style -- forwarded to Section (entrance stagger)
export default function ContextPanel({ data, dataError, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  const capacity = useMemo(
    () => snapshotRowsByMetric(data, CAPACITY_METRICS, CAPACITY_YEAR, NATION_NAMES),
    [data]
  )
  const context = useMemo(
    () => rowsByMetricForNations(data, CONTEXT_METRICS, NATION_NAMES),
    [data]
  )
  const completeness = useMemo(
    () => reportingCompletenessByNation(data, CHAIN_METRICS, NATION_NAMES, DATA_YEAR_MIN, DATA_YEAR_MAX),
    [data]
  )
  // How much of the ripple chain a nation could possibly have reported: every
  // chain metric, every year in the full data window. Read off the rows
  // themselves rather than recomputed here, so this can never drift from what
  // reportingCompletenessByNation actually divided by.
  const completenessMax = completeness[0]?.possible ?? 0

  // The stations ranking, best to worst, read out of the chart's own rows
  // rather than typed as nation names in the paragraph below. Typed out by
  // hand it would go stale silently the moment a data refresh reordered two
  // nations; read from the rows, the sentence can't disagree with the chart
  // sitting right next to it.
  const rankOrder = useMemo(() => {
    const stationsRows = capacity?.[CAPACITY_METRICS[0].key] ?? []
    return [...stationsRows].sort((a, b) => b.value - a.value).map((r) => r.nation)
  }, [capacity])

  // No `storm` key at all, which is what tells sectionGuard this section does
  // not depend on one -- these two records exist with or without a selection.
  // The error and loading branches used to be written out here by hand for
  // want of that, and had already drifted from the wording every other section
  // uses.
  const blocked = sectionGuard({ data, error: dataError, style, subject: 'Context' })
  if (blocked) return blocked

  return (
    <Section style={style} backdrop={scatterBackdrop('context')}>
      <div ref={containerRef} className="relative">
        <p className="type-eyebrow mb-1 text-accent">
          Underneath the chain
        </p>
        <h2 className="type-h2 mb-2">
          Who can measure, and what is changing
        </h2>
        <p className="prose-column prose-wide mb-8 text-sm opacity-75">
          Every record in the ripple chain has holes in it. These two do not, for the same reason
          the others do: a disaster figure only exists if a country had the capacity to assess and
          file it after being hit, while the records below are structural or measured from orbit
          and need nobody to report them.
        </p>

        {capacity && (
          <div className="mb-10">
            <h3 className="type-subhead mb-1 text-accent">
              Who can observe their own weather
            </h3>
            {/* Opens on the human sentence rather than closing on it -- it used
                to be the last clause of this paragraph, which a skim reads
                right past. The ranking claim itself used to be stated in
                prose alone ("set this ranking beside the gaps..."); it is now
                also the second chart below, so the paragraph only needs to
                point at it, not carry the whole argument in words. */}
            <p className="prose-column prose-wide mb-4 text-sm opacity-80">
              Uneven data is not only a limitation of this project &mdash; it is an unequal
              distribution of the ability to describe what happened to you. The two charts below
              are the same ranking, best to worst: {rankOrder.join(', ')}. One counts monitoring
              stations, unchanged in every year on record; the other counts how much of the ripple
              chain each nation actually got to report. Solomon Islands sits last on both &mdash;
              it has the fewest stations, and no tourist arrivals were ever reported for it at all.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {CAPACITY_METRICS.map((m, i) => (
                <MetricSnapshotChart
                  key={m.key}
                  label={m.label}
                  ariaLabel={`${m.label}, by nation`}
                  rows={capacity[m.key]}
                  nationsMissing={[]}
                  emptyNote="Data not available."
                  format={m.format}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  index={i}
                  caveat={m.caveat}
                />
              ))}
              <MetricSnapshotChart
                label="Ripple-chain reporting completeness"
                ariaLabel="Ripple-chain reporting completeness, country-years reported, by nation"
                rows={completeness}
                nationsMissing={[]}
                emptyNote="Data not available."
                format={(v) => `${v} of ${completenessMax} years`}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                index={CAPACITY_METRICS.length}
                caveat={`Reported country-years across the same five records as the ripple chain, out of ${completenessMax} possible. A year every nation is equally missing \u2014 power generation's still-unpublished ${DATA_YEAR_MAX} \u2014 counts the same against all four and does not move this ranking; what moves it is a year one nation has and another does not.`}
              />
            </div>
          </div>
        )}

        {context && (
          <div>
            <h3 className="type-subhead mb-1 text-accent">
              What is changing underneath
            </h3>
            <div className="prose-column prose-wide mb-4 space-y-3 text-sm opacity-80">
              <p>
                Warmer seas raise the ceiling on how intense a cyclone can become; emissions per head
                say who is doing the warming. These are the only two climate claims this site makes
                with confidence, and both are about trends across all four nations &mdash; not
                evidence about any one storm.
              </p>
              <p>
                A third mechanism is stated rather than charted. Sea level rise worsens storm surge —
                a storm arriving on a higher ocean reaches further inland — and it is the
                best-attributed link of the three, with IPCC AR6 rating the human contribution since
                1971 very likely. The regional record is reported only to the nearest 0.1&nbsp;m,
                giving three distinct values across twelve years and hiding any movement under
                10&nbsp;cm. Charting it would claim a precision the measurement does not have.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {CONTEXT_METRICS.map((m, i) => (
                <TrendChart
                  key={m.key}
                  label={m.label}
                  allRows={context[m.key]}
                  nations={NATION_NAMES}
                  valueField={m.field}
                  chartType={m.chartType}
                  format={m.format}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  index={i}
                  legend
                  caveat={m.caveat}
                  className={
                    i === CONTEXT_METRICS.length - 1 && CONTEXT_METRICS.length % 2 !== 0
                      ? 'sm:col-span-2'
                      : ''
                  }
                />
              ))}
            </div>
          </div>
        )}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
