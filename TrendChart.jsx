import { useEffect } from 'react'
import NoDataNote from './NoDataNote.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { useElementWidth } from '../hooks/useElementWidth.js'
import { useInView } from '../hooks/useInView.js'
import { resetSvg } from '../utils/d3helpers.js'
import { renderMetricChart, CHART_HEIGHT } from '../utils/chartRenderers.jsx'

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
//   caveat -- what this series cannot be read as, printed under the chart
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
  caveat,
  className = '',
}) {
  const [ref, node, width] = useElementWidth()
  const [cardRef, inView] = useInView()
  const { theme } = useTheme()
  const nationsMissing = nations.filter((n) => !allRows.some((d) => d.nation === n))
  // Only worth explaining where a reported zero is actually on screen.
  const hasReportedZero = chartType === 'bar' && allRows.some((d) => d[valueField] === 0)

  useEffect(() => {
    if (!inView || !allRows || allRows.length === 0 || !node || !width) return
    const svg = resetSvg(node, width, CHART_HEIGHT)
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
    })
  }, [inView, node, width, allRows, nations, valueField, chartType, format, yTickFormat, showTooltip, hideTooltip, theme])

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl border border-ink/10 bg-surface/60 p-4 ${
        inView ? 'animate-pop-in' : 'opacity-0'
      } ${className}`}
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
      {allRows.length > 0 ? (
        <svg ref={ref} role="img" aria-label={label} className="block w-full" style={{ height: CHART_HEIGHT }} />
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
      <table className="sr-only whitespace-normal">
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
    </div>
  )
}
