import { useMemo, useState } from 'react'
import { CHAIN_METRICS, FOOTNOTE_METRICS } from '../utils/metrics.js'
import { buildComparativeInsights } from '../utils/insights.js'
import { rowsByMetricForNations } from '../utils/rows.js'
import { useTooltip } from '../hooks/useTooltip.js'
import Section from './Section.jsx'
import SelectionLegend from './SelectionLegend.jsx'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import TrendChart from './TrendChart.jsx'
import MetricDetail from './MetricDetail.jsx'
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
//   activeMetric -- which link the reader has opened, from the story state.
//     Held there rather than here because the emphasis is meant to reach past
//     this section: a link held open here is the same link the ending points
//     back at.
//   onActiveMetric -- (key | null) => void
//   style -- forwarded to Section (entrance stagger)
export default function RippleChain({
  data,
  storm,
  selectedNations,
  activeMetric,
  onActiveMetric,
  style,
}) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  // Pointing at a link is not the same as opening one, so the two are kept
  // apart: `hovered` evaporates when the pointer leaves, `activeMetric`
  // survives until the reader closes it. Emphasis follows whichever is live,
  // which is what lets a reader with a card open still glance at another.
  const [hovered, setHovered] = useState(null)
  const held = hovered ?? activeMetric

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
    return <EmptyState style={style}>Choose a country in the map section to see its ripple chain.</EmptyState>
  }

  const unstruck = selectedNations.filter((n) => !storm.nations.includes(n))

  return (
    <Section style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="type-h2 mb-2">
          After {storm.name}, {storm.year}
        </h2>
        {/* "2020 in particular carries the pandemic alongside the storm" read
            as though the storm were always Harold. The caveat belongs to the
            data window, not to the selected event. */}
        <p className="prose-column prose-wide mb-4 text-sm opacity-70">
          Five linked records, in the order the damage travels: who was hit, then the harvest, the
          herds, the power supply and the visitors. Read it as plausible links, not a measured
          causal path &mdash; every series is an annual national total no cyclone has to itself,
          and its 2020&ndash;21 stretch carries the pandemic too. The note under each chart says
          what that record cannot prove.
        </p>
        <SelectionLegend selected={selectedNations} />
        {unstruck.length > 0 && (
          <p className="prose-wide mt-3 text-xs italic opacity-70">
            {unstruck.join(' and ')} {unstruck.length === 1 ? 'was' : 'were'} not struck by{' '}
            {storm.name}, and {unstruck.length === 1 ? 'is' : 'are'} drawn faded rather than
            removed: the closest thing these records have to a comparison.
          </p>
        )}
        {/* THE CHAIN, AS A CHAIN.
            Five cards in a grid are five cards; the order between them is the
            argument, and until now it was carried only by a numbered badge and
            the reading direction. This rail states it: five links in sequence,
            each one an arrow from the last, in the order the damage travels.

            It is also the section's control surface. Pointing at a link rings
            its chart below and lets the other four recede; pressing one opens
            what that record is and how much of it was actually reported. The
            charts carry the same handlers, so the rail and the grid are two
            views of one state rather than two things to keep in step. */}
        <ol className="chain-rail mt-5">
          {CHAIN_METRICS.map((m, i) => {
            const isHeld = held === m.key
            return (
              <li key={m.key} className="chain-rail-item">
                <button
                  type="button"
                  onClick={() => onActiveMetric(activeMetric === m.key ? null : m.key)}
                  onPointerEnter={() => setHovered(m.key)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(m.key)}
                  onBlur={() => setHovered(null)}
                  aria-pressed={activeMetric === m.key}
                  aria-label={`Link ${i + 1} of ${CHAIN_METRICS.length}: ${m.label}. Open what this record can and cannot show.`}
                  className={`press-target chain-link ${isHeld ? 'is-held' : ''}`}
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <span aria-hidden="true" className="chain-link-stage">
                    {i + 1}
                  </span>
                  <span className="chain-link-label">{m.label}</span>
                </button>
              </li>
            )
          })}
        </ol>

        {activeMetric && (
          <MetricDetail
            metric={CHAIN_METRICS.find((m) => m.key === activeMetric)}
            rows={filteredByMetric[activeMetric] ?? []}
            nations={selectedNations}
            onClose={() => onActiveMetric(null)}
          />
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
              emphasis={held ? (held === m.key ? 'active' : 'dim') : undefined}
              cardHandlers={{
                onPointerEnter: () => setHovered(m.key),
                onPointerLeave: () => setHovered(null),
                onFocusCapture: () => setHovered(m.key),
                onBlurCapture: () => setHovered(null),
              }}
              className={i === CHAIN_METRICS.length - 1 && CHAIN_METRICS.length % 2 !== 0 ? 'sm:col-span-2' : ''}
            />
          ))}
        </div>

        <p className="prose-wide mt-6 text-xs italic opacity-70">
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
