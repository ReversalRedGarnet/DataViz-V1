import NoDataNote from './NoDataNote.jsx'
import { useChartCanvas } from '../hooks/useChartCanvas.js'
import { renderSnapshotChart, CHART_HEIGHT } from '../utils/charts/index.js'
import VisuallyHidden from './VisuallyHidden.jsx'

// One "all nations, one moment" bar chart card: heading, chart or placeholder,
// a missing-nations note, and the matching sr-only table. Every snapshot
// section renders these; only the copy and the rows differ.
//
// Props:
//   label -- heading and sr-only caption; omit where the section's own <h2>
//     already names the single chart
//   ariaLabel -- label plus which moment is being compared, since the label
//     alone doesn't say when
//   rows -- [{ nation, value }]
//   nationsMissing -- nation names with no row here
//   missingNote, emptyNote -- copy for the two NoDataNote states
//   format, yTickFormat -- forwarded to renderSnapshotChart
//   showTooltip, hideTooltip
//   index -- entrance stagger
//   caveat -- what this series cannot be read as, printed under the chart in
//     the same place and style TrendChart uses, so the two chart types don't
//     put the same kind of note in two different places
//   control -- optional node beside the heading, for a chart that offers the
//     reader a choice about how it is drawn. Kept generic rather than built in:
//     only one chart currently has one, and hard-coding it here would put a
//     people-affected concern inside the shared card.
//   className -- layout hook (e.g. sm:col-span-2 for an odd one out)
export default function MetricSnapshotChart({
  label,
  ariaLabel,
  rows,
  nationsMissing,
  missingNote,
  emptyNote,
  format,
  yTickFormat,
  showTooltip,
  hideTooltip,
  index = 0,
  caveat,
  control,
  className = '',
}) {
  const { svgRef, cardRef, inView } = useChartCanvas({
    height: CHART_HEIGHT,
    ready: rows?.length > 0,
    deps: [rows, format, yTickFormat, showTooltip, hideTooltip],
    draw: (svg, { width, theme }) =>
      renderSnapshotChart(svg, { width, rows, format, showTooltip, hideTooltip, yTickFormat, theme }),
  })

  return (
    <div
      ref={cardRef}
      className={`rounded-xl border border-ink/10 bg-surface/60 p-4 ${
        inView ? 'animate-pop-in' : 'opacity-0'
      } ${className}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {(label || control) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          {label && <h3 className="text-sm font-semibold">{label}</h3>}
          {control}
        </div>
      )}
      {rows.length > 0 ? (
        <svg ref={svgRef} role="img" aria-label={ariaLabel} className="block w-full" style={{ height: CHART_HEIGHT }} />
      ) : (
        <NoDataNote
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          className="block py-6 text-center text-sm italic opacity-70"
        >
          {emptyNote}
        </NoDataNote>
      )}
      {rows.length > 0 && nationsMissing.length > 0 && (
        <NoDataNote
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          className="mt-1 inline-block text-xs italic opacity-70"
        >
          {missingNote}
        </NoDataNote>
      )}
      {caveat && (
        <p className="mt-2 border-l-2 border-ink/15 pl-3 text-xs italic leading-snug opacity-70">
          {caveat}
        </p>
      )}
      <VisuallyHidden>
        <table>
          <caption>{ariaLabel}</caption>
          <thead>
            <tr>
              <th scope="col">Country</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.nation}>
                <td>{d.nation}</td>
                <td>{format ? format(d.value) : d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  )
}
