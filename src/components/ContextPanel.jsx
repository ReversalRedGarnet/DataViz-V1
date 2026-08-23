import { useMemo } from 'react'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import TrendChart from './TrendChart.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import EmptyState from './EmptyState.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { NATION_NAMES } from '../content/nations.js'
import { CAPACITY_METRICS, CONTEXT_METRICS } from '../utils/metrics.js'
import { DATA_YEAR_MAX } from '../content/storms.js'
import { snapshotRowsByMetric, rowsByMetricForNations } from '../utils/rows.js'

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
export default function ContextPanel({ data, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  const capacity = useMemo(
    () => snapshotRowsByMetric(data, CAPACITY_METRICS, CAPACITY_YEAR, NATION_NAMES),
    [data]
  )
  const context = useMemo(
    () => rowsByMetricForNations(data, CONTEXT_METRICS, NATION_NAMES),
    [data]
  )

  if (!data) return <EmptyState style={style}>Context -- waiting on data.</EmptyState>

  return (
    <Section style={style}>
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
            <p className="prose-column prose-wide mb-4 text-sm opacity-80">
              Monitoring stations per national network, unchanged in every year on record. Set this
              ranking beside the gaps in the ripple chain and it is the same ranking: Solomon
              Islands has the fewest stations, no tourist arrivals reported at all, and a single
              economic-loss figure in twelve years. Uneven data is not only a limitation of this
              project &mdash; it is an unequal distribution of the ability to describe what
              happened to you.
            </p>
            <div className="grid grid-cols-1 gap-5">
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
                Two regional records, all four nations on each &mdash; the only climate claims this
                site makes with confidence, and both about trends rather than any individual storm.
                Warmer seas raise the ceiling on how intense a cyclone can become; emissions per head
                say who is doing the warming.
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
