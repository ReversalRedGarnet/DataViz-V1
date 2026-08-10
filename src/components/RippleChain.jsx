import { useMemo } from 'react'
import { CHAIN_METRICS, FOOTNOTE_METRICS } from '../utils/metrics.js'
import { buildComparativeInsights } from '../utils/insights.js'
import { rowsByMetricForNations } from '../utils/rows.js'
import { useTooltip } from '../hooks/useTooltip.js'
import Section from './Section.jsx'
import SelectionLegend from './SelectionLegend.jsx'
import EmptyState from './EmptyState.jsx'
import TrendChart from './TrendChart.jsx'
import InsightsPanel from './InsightsPanel.jsx'
import Tooltip from './Tooltip.jsx'

// One small chart per stage of the chain, filtered to the selected nations.
// Which chart type each metric gets is decided in metrics.js, based on how
// complete that metric's data actually is.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   selectedNations -- ordered; order drives colour, matching the map's badges
//   style -- forwarded to Section (entrance stagger)
export default function RippleChain({ data, selectedNations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  // Memoised deliberately: the tooltip state lives here, so an unmemoised
  // filter would redraw every chart on every hover. See rows.js.
  const filteredByMetric = useMemo(
    () => rowsByMetricForNations(data, CHAIN_METRICS, selectedNations),
    [data, selectedNations]
  )

  const insights = useMemo(() => {
    if (!data || selectedNations.length !== 2) return null
    return buildComparativeInsights(data, selectedNations[0], selectedNations[1])
  }, [data, selectedNations])

  if (!data) return <EmptyState style={style}>Ripple chain -- waiting on data.</EmptyState>
  if (!selectedNations || selectedNations.length === 0) {
    return <EmptyState style={style}>Click a country on the map above to see its ripple chain.</EmptyState>
  }

  return (
    <Section style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">The ripple chain</h2>
        <p className="mb-3 max-w-prose text-sm opacity-70">
          Five linked records, in the order the damage travels: who was hit, then the harvest, the
          herds, the power supply and the visitors that follow.
        </p>
        <p className="mb-4 max-w-prose text-sm opacity-70">
          Read this as a sequence of plausible links rather than a measured causal path. Every
          series here is an annual national total that no cyclone has to itself, and 2020 in
          particular carries the pandemic alongside the storm. The note under each chart says what
          that particular record cannot be asked to prove.
        </p>
        <SelectionLegend selected={selectedNations} />
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CHAIN_METRICS.map((m, i) => (
            <TrendChart
              key={m.key}
              label={m.label}
              allRows={filteredByMetric[m.key]}
              nations={selectedNations}
              valueField={m.field}
              chartType={m.chartType}
              format={m.format}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              index={i}
              stage={i + 1}
              ripple
              caveat={m.caveat}
              className={i === CHAIN_METRICS.length - 1 && CHAIN_METRICS.length % 2 !== 0 ? 'sm:col-span-2' : ''}
            />
          ))}
        </div>

        <p className="mt-6 max-w-prose text-xs italic opacity-70">
          Direct economic loss is deliberately not a link here. {FOOTNOTE_METRICS[0].caveat} A chart
          of it would be mostly empty space, and an empty chart argues that little was lost.
        </p>

        {insights && (
          <InsightsPanel
            title={`${selectedNations[0]} vs. ${selectedNations[1]}: similarities and differences`}
            items={insights}
            staggerItems
          />
        )}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
