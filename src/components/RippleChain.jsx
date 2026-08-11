import { useMemo } from 'react'
import { CHAIN_METRICS, FOOTNOTE_METRICS } from '../utils/metrics.js'
import { buildComparativeInsights } from '../utils/insights.js'
import { rowsByMetricForNations } from '../utils/rows.js'
import { useTooltip } from '../hooks/useTooltip.js'
import Section from './Section.jsx'
import SelectionLegend from './SelectionLegend.jsx'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import TrendChart from './TrendChart.jsx'
import InsightsPanel from './InsightsPanel.jsx'
import Tooltip from './Tooltip.jsx'

// One small chart per stage of the chain, filtered to the selected nations.
// Which chart type each metric gets is decided in metrics.js, based on how
// complete that metric's data actually is.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   storm -- the selected storm, or null. Its year is the before/after anchor,
//     and the nations it struck are drawn at full strength while the rest are
//     dimmed: a country the storm missed is the nearest thing this data has to
//     a control, so it stays on the chart rather than being removed.
//   selectedNations -- ordered; order drives colour, matching the map's badges
//   style -- forwarded to Section (entrance stagger)
export default function RippleChain({ data, storm, selectedNations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  // Memoised deliberately: the tooltip state lives here, so an unmemoised
  // filter would redraw every chart on every hover. See rows.js.
  const filteredByMetric = useMemo(
    () => rowsByMetricForNations(data, CHAIN_METRICS, selectedNations),
    [data, selectedNations]
  )

  const insights = useMemo(() => {
    if (!data || !storm || selectedNations.length !== 2) return null
    return buildComparativeInsights(data, selectedNations[0], selectedNations[1], storm.year)
  }, [data, storm, selectedNations])

  const blocked = sectionGuard({
    data,
    storm,
    style,
    subject: 'Ripple chain',
    prompt: 'follow what came after it',
  })
  if (blocked) return blocked
  if (!selectedNations || selectedNations.length === 0) {
    return <EmptyState style={style}>Click a country on the map above to see its ripple chain.</EmptyState>
  }

  const unstruck = selectedNations.filter((n) => !storm.nations.includes(n))

  return (
    <Section style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
          After {storm.name}, {storm.year}
        </h2>
        {/* "2020 in particular carries the pandemic alongside the storm" read
            as though the storm were always Harold. The caveat belongs to the
            data window, not to the selected event. */}
        <p className="mb-4 max-w-prose text-sm opacity-70">
          Five linked records, in the order the damage travels: who was hit, then the harvest, the
          herds, the power supply and the visitors. Read it as plausible links, not a measured
          causal path &mdash; every series is an annual national total no cyclone has to itself,
          and its 2020&ndash;21 stretch carries the pandemic too. The note under each chart says
          what that record cannot prove.
        </p>
        <SelectionLegend selected={selectedNations} />
        {unstruck.length > 0 && (
          <p className="mt-3 max-w-prose text-xs italic opacity-70">
            {unstruck.join(' and ')} {unstruck.length === 1 ? 'was' : 'were'} not struck by{' '}
            {storm.name}, and {unstruck.length === 1 ? 'is' : 'are'} drawn faded rather than
            removed: the closest thing these records have to a comparison.
          </p>
        )}
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
              dimNations={unstruck}
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
