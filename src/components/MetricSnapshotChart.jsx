import NoDataNote from './NoDataNote.jsx'
import { useChartCanvas } from '../hooks/useChartCanvas.js'
import { renderSnapshotChart, CHART_HEIGHT } from '../utils/charts/index.js'
import VisuallyHidden from './VisuallyHidden.jsx'
import FigureCaption from './FigureCaption.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { nationLabel } from '../content/nations.js'

const STRINGS = {
  en: { country: 'Country', value: 'Value' },
  fr: { country: 'Pays', value: 'Valeur' },
}

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
//   figure -- { key, source, title? } | undefined. Prints a numbered caption
//     under the chart: "Fig N - title. Data: source (link)". `key` indexes
//     content/figures.js, which fixes the numbering in reading order rather
//     than counting mounts; `title` defaults to this card's own label. Omit the
//     prop entirely on a chart that is not a numbered figure.
//   className -- layout hook (e.g. sm:col-span-2 for an odd one out)
export default function MetricSnapshotChart({
  label,
  ariaLabel,
  // Defaulted rather than optional-chained at one use site and dereferenced at
  // the next, which is what it was. Every caller passes an array today; the
  // point is that the component now answers the question the same way twice.
  rows = [],
  nationsMissing,
  missingNote,
  emptyNote,
  format,
  yTickFormat,
  showTooltip,
  hideTooltip,
  index = 0,
  caveat,
  figure,
  control,
  className = '',
}) {
  const { language } = useLanguage()
  const t = STRINGS[language]
  const { svgRef, cardRef, inView } = useChartCanvas({
    height: CHART_HEIGHT,
    ready: rows.length > 0,
    deps: [rows, format, yTickFormat, showTooltip, hideTooltip],
    draw: (svg, { width, theme, language }) =>
      renderSnapshotChart(svg, { width, rows, format, showTooltip, hideTooltip, yTickFormat, theme, language }),
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
      {figure && (
        <FigureCaption
          figureKey={figure.key}
          title={figure.title ?? label}
          source={figure.source}
          className="mt-2"
        />
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
              <th scope="col">{t.country}</th>
              <th scope="col">{t.value}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.nation}>
                <td>{nationLabel(d.nation, language)}</td>
                <td>{format ? format(d.value) : d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  )
}
