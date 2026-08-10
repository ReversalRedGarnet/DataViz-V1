import { CHAIN_METRICS } from '../utils/metrics.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { chartColorsFor } from '../utils/theme.js'
import { pctChange } from '../utils/rows.js'
import { useTooltip } from '../hooks/useTooltip.js'
import { useCountUp } from '../hooks/useCountUp.js'
import Section from './Section.jsx'
import EmptyState from './EmptyState.jsx'
import NoDataNote from './NoDataNote.jsx'
import Tooltip from './Tooltip.jsx'

// The selected nations side by side across each stage of the ripple chain,
// event year against the latest year on record.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   selectedNations -- ordered; order drives colour
//   style -- forwarded to Section (entrance stagger)
export default function ComparisonView({ data, storm, selectedNations, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()
  const palette = chartColorsFor(theme)

  if (!data) return <EmptyState tone="panel" style={style}>Comparison -- waiting on data.</EmptyState>
  if (!storm) {
    return (
      <EmptyState tone="panel" style={style}>Pick a storm from the timeline to compare recovery.</EmptyState>
    )
  }
  if (!selectedNations || selectedNations.length < 2) {
    return (
      <EmptyState tone="panel" style={style}>
        Select a second country on the map to compare.
      </EmptyState>
    )
  }

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative">
        <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">Compare recovery</h2>
        <p className="mb-8 max-w-prose text-sm opacity-70">
          {storm.name}&rsquo;s year ({storm.year}) versus the latest year on record.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Keyed by position, not by name. Keying by name would tear the
              card down and build a new one whenever the second pick changed,
              and the figures inside are meant to travel from the old nation's
              numbers to the new one's -- how far they have to move is the
              comparison. */}
          {selectedNations.map((nation, i) => (
            <NationSummary
              key={i}
              nation={nation}
              data={data}
              eventYear={storm.year}
              color={palette.selection[i]}
              index={i}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />
          ))}
        </div>
        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}


function NationSummary({ nation, data, eventYear, color, index, showTooltip, hideTooltip }) {
  return (
    <div
      className="animate-pop-in rounded-2xl border-t-4 bg-surface/80 p-6 shadow-sm"
      style={{ borderColor: color, animationDelay: `${index * 100}ms` }}
    >
      <h3 className="font-serif text-xl font-semibold tracking-tight">{nation}</h3>
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Since {eventYear}</p>
      <ul className="divide-y divide-ink/10 text-sm">
        {CHAIN_METRICS.map((m) => {
          const rows = (data[m.key] ?? [])
            .filter((d) => d.nation === nation)
            .sort((a, b) => a.year - b.year)
          const eventRow = rows.find((r) => r.year === eventYear)
          const latestRow = rows[rows.length - 1]

          return (
            <li key={m.key} className="flex items-center justify-between gap-4 py-2.5">
              <span className="opacity-70">{m.label}</span>
              {eventRow && latestRow ? (
                <Delta metric={m} eventRow={eventRow} latestRow={latestRow} />
              ) : (
                <NoDataNote
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  className="text-xs italic opacity-70"
                >
                  No data available
                </NoDataNote>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Before/after figures plus a direction and magnitude badge. Ink-only, with a
// glyph carrying the direction rather than red/green, so this doesn't layer a
// second colour scheme on top of the one used for nation selection.
//
// The figures ease between values rather than switching, so swapping the
// country being compared shows the size of the difference as movement. The bar
// underneath is driven by the same eased percentage, capped at 100% of its
// track -- a metric that tripled and one that quadrupled both fill it, and the
// printed number is what separates them.
function Delta({ metric, eventRow, latestRow }) {
  const target = pctChange(eventRow[metric.field], latestRow[metric.field])
  const from = useCountUp(eventRow[metric.field])
  const to = useCountUp(latestRow[metric.field])
  const pct = useCountUp(target ?? 0)
  const magnitude = Math.min(1, Math.abs(pct) / 100)

  return (
    <span className="flex flex-col items-end">
      <span className="font-medium tabular-nums">
        {metric.format(from)} <span className="opacity-40">→</span> {metric.format(to)}
      </span>
      {target !== null && (
        <>
          <span className="mt-0.5 flex items-center gap-1 text-xs font-medium opacity-70">
            <span aria-hidden="true">{pct >= 0 ? '▲' : '▼'}</span>
            {Math.abs(pct).toFixed(0)}%
          </span>
          <span aria-hidden="true" className="relative mt-1 block h-[3px] w-24 rounded-full bg-ink/10">
            <span
              className="absolute top-0 h-full rounded-full bg-ink/45"
              style={
                pct >= 0
                  ? { left: '50%', width: `${magnitude * 50}%` }
                  : { right: '50%', width: `${magnitude * 50}%` }
              }
            />
          </span>
        </>
      )}
    </span>
  )
}
