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
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import Tooltip from './Tooltip.jsx'

// One of the five links on the rail.
//
// The phone accordion and the desktop rail rendered a near-identical button
// with the same six classes and the same stage/label/caret structure, differing
// only in whether they carried hover handlers and whether the state they
// announced was aria-expanded or aria-pressed. Two copies of a control is two
// places to change it and one place to forget.
//
// Props:
//   metric, stage, total -- what this link is and where it sits in the chain
//   isHeld -- whether it should be drawn emphasised
//   expanded -- accordion mode; when defined, the button reports aria-expanded
//     and shows a caret. Undefined means the desktop rail, which reports
//     aria-pressed instead.
//   onToggle -- () => void
//   hoverHandlers -- pointer/focus emphasis, desktop only
//   style -- entrance stagger
function ChainLink({ metric, stage, total, isHeld, expanded, onToggle, hoverHandlers, style }) {
  const isAccordion = expanded !== undefined
  const action = isAccordion
    ? 'Show this record and what it can and cannot show.'
    : 'Open what this record can and cannot show.'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isAccordion ? expanded : undefined}
      aria-pressed={isAccordion ? undefined : isHeld}
      aria-label={`Link ${stage} of ${total}: ${metric.label}. ${action}`}
      className={`press-target chain-link ${isHeld ? 'is-held' : ''}`}
      style={style}
      {...hoverHandlers}
    >
      <span aria-hidden="true" className="chain-link-stage">
        {stage}
      </span>
      <span className="chain-link-label">{metric.label}</span>
      {isAccordion && (
        <span aria-hidden="true" className="chain-link-caret">
          {expanded ? '\u2212' : '+'}
        </span>
      )}
    </button>
  )
}

// One small chart per stage of the chain, filtered to the selected nations.
//
// The order is the claim: who was hit, then the harvest, the herds, the power
// supply and the visitors. It is a plausible sequence, not a measured causal
// path, and the section says so in prose -- every series is an annual national
// total that no cyclone has to itself.
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

  // The one structural difference between the two layouts. See the accordion
  // below for why five charts at once is the wrong thing to put on a phone,
  // and hooks/useMediaQuery.js for why this is decided in JavaScript rather
  // than by hiding one of them in CSS.
  const isPhone = useMediaQuery('(max-width: 639px)')
  // On a phone one link is always open: an accordion with everything shut is a
  // section that opens on no chart at all, and the first link is where the
  // chain starts. It is a display fallback, not a write -- nothing is put into
  // the shared state on the reader's behalf.
  const openKey = isPhone ? activeMetric ?? CHAIN_METRICS[0].key : activeMetric

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

  // The thirteen props every chain chart takes, in one place. Both layouts drew
  // the same chart from the same data and each wrote the list out in full, so a
  // prop added for one was a prop silently missing from the other.
  const chainChartProps = (metric, index) => ({
    label: metric.label,
    allRows: filteredByMetric[metric.key],
    nations: selectedNations,
    valueField: metric.field,
    chartType: metric.chartType,
    format: metric.format,
    showTooltip,
    hideTooltip,
    index,
    stage: CHAIN_METRICS.indexOf(metric) + 1,
    ripple: true,
    dimNations: unstruck,
    caveat: metric.caveat,
  })

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
        {/*
          THE CHAIN, AS A CHAIN. Five links joined by a line, in the order the
          damage travels. Holding one rings its chart and lets the other four
          recede, so the rail is a filter as well as a legend.

          On a phone the same links become an accordion, one open at a time:
          five horizontal links on a 360px screen are five illegible ones, and
          a stacked rail above a stacked grid is two scrolls of the same list.
        */}
        {isPhone ? (
          <ol className="chain-rail chain-accordion mt-5">
            {CHAIN_METRICS.map((m, i) => {
              const isOpen = openKey === m.key
              return (
                <li key={m.key} className="chain-rail-item">
                  <ChainLink
                    metric={m}
                    stage={i + 1}
                    total={CHAIN_METRICS.length}
                    isHeld={isOpen}
                    expanded={isOpen}
                    onToggle={() => onActiveMetric(activeMetric === m.key ? null : m.key)}
                  />

                  {isOpen && (
                    <div className="chain-panel">
                      <TrendChart {...chainChartProps(m, 0)} />
                      <MetricDetail
                        metric={m}
                        rows={filteredByMetric[m.key] ?? []}
                        nations={selectedNations}
                        onClose={() => onActiveMetric(null)}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        ) : (
          <>
            <ol className="chain-rail mt-5">
              {CHAIN_METRICS.map((m, i) => (
                <li key={m.key} className="chain-rail-item">
                  <ChainLink
                    metric={m}
                    stage={i + 1}
                    total={CHAIN_METRICS.length}
                    isHeld={held === m.key}
                    onToggle={() => onActiveMetric(activeMetric === m.key ? null : m.key)}
                    hoverHandlers={{
                      onPointerEnter: () => setHovered(m.key),
                      onPointerLeave: () => setHovered(null),
                      onFocus: () => setHovered(m.key),
                      onBlur: () => setHovered(null),
                    }}
                    style={{ animationDelay: `${i * 90}ms` }}
                  />
                </li>
              ))}
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
                  {...chainChartProps(m, i)}
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
          </>
        )}

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
