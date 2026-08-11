import { useMemo } from 'react'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import TrendChart from './TrendChart.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import EmptyState from './EmptyState.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { NATIONS } from './MapView.jsx'
import { CAPACITY_METRICS, CONTEXT_METRICS } from '../utils/metrics.js'
import { snapshotRowsByMetric, rowsByMetricForNations } from '../utils/rows.js'

const NATION_NAMES = NATIONS.map((n) => n.name)

// The capacity chart is flat in every year, so any year is representative.
// Pinned rather than computed from the data so the caption can name it.
const CAPACITY_YEAR = 2024

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
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Underneath the chain
        </p>
        <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
          Who can measure, and what is changing
        </h2>
        <p className="prose-column mb-8 max-w-prose text-sm opacity-75">
          Every record in the chain above has holes in it. These two do not, and the reason is the
          same reason the others do: a disaster figure only exists if a country had the capacity to
          assess and file it after being hit, while the records below are structural or measured
          from orbit and need nobody to report them.
        </p>

        {capacity && (
          <div className="mb-10">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              Who can observe their own weather
            </h3>
            <p className="prose-column mb-4 max-w-prose text-sm opacity-80">
              The number of meteorological monitoring stations in each national network, unchanged
              in every year on record. Set this ranking beside the gaps in the chain above and it
              is the same ranking. Solomon Islands has the fewest stations, no tourist arrivals
              reported at all, and a single economic-loss figure in twelve years. Uneven data is
              not only a limitation of this project; it is a real and unequal distribution of the
              ability to describe what happened to you.
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
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              What is changing underneath
            </h3>
            <p className="prose-column mb-4 max-w-prose text-sm opacity-80">
              Two regional records, all four nations on each. These are the only climate claims
              this site makes with confidence, and both are claims about trends rather than about
              any individual storm. Warmer seas raise the ceiling on how intense a cyclone can
              become; emissions per head say who is doing the warming. The note under each chart
              says where its limits are.
            </p>
            <p className="prose-column mb-4 max-w-prose text-sm opacity-80">
              A third mechanism belongs here and is stated rather than charted. Sea level rise
              worsens storm surge — a storm arriving on a higher ocean reaches further inland,
              whatever caused the storm — and it is the best-attributed link of the three, with
              IPCC AR6 rating the human contribution to sea level rise since 1971 very likely. The
              regional record for it is reported only to the nearest 0.1&nbsp;m, which across
              twelve years gives three distinct values and hides any movement under 10&nbsp;cm.
              Charting it would claim a precision the measurement does not have, so it is left as a
              sentence.
            </p>
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
