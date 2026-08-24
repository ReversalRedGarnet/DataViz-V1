import { useEffect, useMemo } from 'react'
import NoDataNote from './NoDataNote.jsx'
import SeriesLegend from './SeriesLegend.jsx'
import { useChartCanvas } from '../hooks/useChartCanvas.js'
import { slug } from '../utils/d3helpers.js'
import { renderMetricChart, CHART_HEIGHT, seriesStyles } from '../utils/charts/index.js'
import { chartTheme } from '../utils/theme.js'
import VisuallyHidden from './VisuallyHidden.jsx'

// One "selected nations, over time" chart card: heading, chart or placeholder,
// a missing-nations note, and the matching sr-only table. Every trends section
// renders these; only the metric config and the rows differ.
//
// Props:
//   label -- heading, sr-only caption, and svg aria-label
//   allRows, nations, valueField, chartType, format, yTickFormat --
//     forwarded to renderMetricChart
//   emptyNote -- "no data at all" copy; every caller uses the default
//   showTooltip, hideTooltip
//   index -- entrance stagger
//   stage -- position in a numbered sequence, printed as a badge. Only the
//     ripple chain passes this: its metrics are a causal order, and the number
//     is the one place that order is stated rather than implied by layout.
//   ripple -- emit a ring as the card arrives, for the same section
//   dimNations -- names to draw at reduced strength. Used where a nation is
//     shown for comparison rather than because the event reached it: a country
//     a storm missed is the closest thing this data has to a control, so it
//     stays on the chart rather than being filtered out, but it must not read
//     as though it were struck. Applied as a class after the draw, the same way
//     the cross-chart highlight works, so the renderers need no knowledge of it.
//   legend -- draw a key above the chart. Off by default: the ripple chain
//     already prints one SelectionLegend above its whole grid, and a key on
//     each of five cards would be the same two names five times. Sections
//     drawing more than two nations need it, since four lines with no key are
//     four lines the reader has to hover to tell apart.
//   caveat -- what this series cannot be read as, printed under the chart
//   emphasis -- 'active' | 'dim' | undefined. The ripple chain sets it while a
//     link is being held: the held card is ringed and the others recede, so
//     following one thread through five charts is a matter of looking rather
//     than of remembering which card was which. Purely presentational, and
//     applied as a class so nothing is redrawn.
//   cardHandlers -- spread onto the card, so the section that owns the
//     emphasis state can also receive pointer and focus events from the card
//     itself. Passing handlers rather than lifting the card into a wrapper
//     keeps the grid's column spans on the element that has them.
//   className -- layout hook (e.g. sm:col-span-2 for an odd one out)
//
// The chart holds its draw until the card is on screen. These sit several
// screens below the fold on every page that uses them, and drawing at mount
// meant the entrance animation had always finished by the time anyone scrolled
// down to it.
export default function TrendChart({
  label,
  allRows,
  nations,
  valueField,
  chartType,
  format,
  yTickFormat,
  emptyNote = 'Data not available for this metric.',
  showTooltip,
  hideTooltip,
  index = 0,
  stage,
  ripple = false,
  dimNations,
  legend = false,
  caveat,
  emphasis,
  cardHandlers,
  className = '',
}) {
  const nationsMissing = nations.filter((n) => !allRows.some((d) => d.nation === n))
  // Only worth explaining where a reported zero is actually on screen.
  const hasReportedZero = chartType === 'bar' && allRows.some((d) => d[valueField] === 0)

  const { svgRef, cardRef, node, inView, theme, drawCount } = useChartCanvas({
    height: CHART_HEIGHT,
    ready: allRows?.length > 0,
    deps: [allRows, nations, valueField, chartType, format, yTickFormat, showTooltip, hideTooltip],
    draw: (svg, { width, theme }) =>
      renderMetricChart(svg, {
        width,
        allRows,
        nations,
        valueField,
        chartType,
        format,
        showTooltip,
        hideTooltip,
        yTickFormat,
        theme,
      }),
  })

  // Reduced strength for nations shown only as comparison. A separate effect
  // from the draw so that changing which storm is selected re-dims without
  // redrawing the chart and replaying its entrance.
  //
  // `drawCount` is the third dependency and the non-obvious one. The marks
  // these classes go on belong to D3 and are destroyed and recreated by every
  // redraw, so a re-dim has to follow each one -- a theme flip would otherwise
  // silently drop the dimming. It stands in for "the chart was drawn again",
  // which is not something node identity or dimNations can express.
  //
  // This effect previously had no dependency array at all, so it ran a
  // querySelectorAll and a full class-string scan of every mark after every
  // render. Correct, and on the ripple chain that was five charts' worth of it
  // per frame of any scroll.
  useEffect(() => {
    if (!node) return
    const dim = new Set((dimNations ?? []).map(slug))
    for (const mark of node.querySelectorAll('.nation-mark')) {
      const isDim = [...mark.classList].some(
        (c) => c.startsWith('nation-') && dim.has(c.slice('nation-'.length))
      )
      mark.classList.toggle('nation-unstruck', isDim)
    }
  }, [node, dimNations, drawCount])

  const legendStyles = useMemo(
    () => (legend ? seriesStyles(nations, chartTheme(theme).palette) : null),
    [legend, nations, theme]
  )

  return (
    <div
      ref={cardRef}
      {...cardHandlers}
      className={`chain-card relative overflow-hidden rounded-xl border border-ink/10 bg-surface/60 p-4 ${
        inView ? 'animate-pop-in' : 'opacity-0'
      } ${emphasis === 'active' ? 'is-held' : ''} ${emphasis === 'dim' ? 'is-receded' : ''} ${className}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {ripple && inView && (
        <span
          aria-hidden="true"
          className="ripple-ring"
          style={{ animationDelay: `${index * 60}ms` }}
        />
      )}
      <h3 className="relative mb-2 flex items-center gap-2 text-sm font-semibold">
        {stage != null && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent/40 text-[10px] font-bold tabular-nums text-accent">
            {stage}
          </span>
        )}
        {label}
      </h3>
      {legendStyles && allRows.length > 0 && (
        <SeriesLegend styles={legendStyles} className="mb-3" />
      )}
      {allRows.length > 0 ? (
        <svg ref={svgRef} role="img" aria-label={label} className="block w-full" style={{ height: CHART_HEIGHT }} />
      ) : (
        <NoDataNote
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          className="block py-6 text-center text-sm italic opacity-70"
        >
          {emptyNote}
        </NoDataNote>
      )}
      {allRows.length > 0 && nationsMissing.length > 0 && (
        <NoDataNote
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          className="mt-1 inline-block text-xs italic opacity-70"
        >
          No data available for {nationsMissing.join(' and ')}.
        </NoDataNote>
      )}
      {hasReportedZero && (
        <p className="mt-2 text-xs italic leading-snug opacity-70">
          A &ldquo;0&rdquo; on the baseline is a reported zero. An empty slot is a year with no
          report at all. Very small values are drawn at a minimum height so they stay visible
          beside much larger ones &mdash; hover for the exact figure.
        </p>
      )}
      {caveat && (
        <p className="mt-2 border-l-2 border-ink/15 pl-3 text-xs italic leading-snug opacity-70">
          {caveat}
        </p>
      )}
      <VisuallyHidden>
        <table>
          <caption>{label} by year and country</caption>
          <thead>
            <tr>
              <th scope="col">Country</th>
              <th scope="col">Year</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((d) => (
              <tr key={`${d.nation}-${d.year}`}>
                <td>{d.nation}</td>
                <td>{d.year}</td>
                <td>{d[valueField]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  )
}
