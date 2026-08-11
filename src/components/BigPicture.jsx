import { useMemo } from 'react'
import Section from './Section.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import Tooltip from './Tooltip.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { NATIONS } from './MapView.jsx'
import { CHAIN_METRICS } from '../utils/metrics.js'
import { formatNationList } from '../utils/formatNationList.js'
import { missingNations, snapshotRowsByMetric } from '../utils/rows.js'

const NATION_NAMES = NATIONS.map((n) => n.name)

export default function BigPicture({ data, storm, style }) {
  const eventYear = storm?.year ?? null
  const stats = useMemo(() => computeStats(data, eventYear), [data, eventYear])
  const snapshots = useMemo(
    () => (eventYear ? snapshotRowsByMetric(data, CHAIN_METRICS, eventYear, NATION_NAMES) : null),
    [data, eventYear]
  )
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  const blocked = sectionGuard({
    data,
    storm,
    style,
    tone: 'panel',
    subject: 'The bigger picture',
    prompt: 'see how the region looked that year',
  })
  if (blocked) return blocked

  return (
    <Section tone="panel" style={style}>
      <div ref={containerRef} className="relative">
        <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">The Bigger Picture</h2>

        <div className="prose-column max-w-prose space-y-3 text-sm opacity-80">
          <p>
            Each of these storms was a shared disaster, but recovery was shaped by far more than
            the weather. Population size, infrastructure, economic capacity, and national
            preparedness all influenced how a country experienced the aftermath &mdash; which is
            why the same storm can leave two neighbours in very different places.
          </p>

          <p>
            Rather than focusing on one nation at a time, this section compares the region as a
            whole. By looking at key indicators side by side, patterns begin to emerge that are
            difficult to see in isolation.
          </p>

          <p>
            Together, these snapshots provide a foundation for the detailed comparisons explored
            throughout the rest of this project.
          </p>
        </div>

        {stats ? (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              index={0}
              label="What happened"
              value={`${storm.nations.length} of 4 nations`}
              detail={`${storm.name}, ${storm.year}`}
            />
            <StatTile
              index={1}
              label={`People affected, ${storm.year}`}
              value={stats.totalAffected.toLocaleString()}
              detail="Across all four nations combined"
            />
            <StatTile
              index={2}
              label="Hardest- vs. least-hit"
              value={stats.ratio ? `${stats.ratio.toLocaleString()}×` : 'n/a'}
              detail={`${stats.maxNation} vs. ${stats.minNation} -- the same event`}
            />
            <StatTile
              index={3}
              label="Economic loss reported"
              value={`${stats.economicLossReported} of ${NATIONS.length} nations`}
              detail={`For ${storm.year} itself, in the official dataset`}
            />
          </div>
        ) : (
          <p className="mt-6 text-sm opacity-70">Loading overview...</p>
        )}

        {snapshots && (
          <div className="mt-8">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              Regional Snapshot — {storm.year}
            </h3>
            <p className="prose-column mb-4 max-w-prose text-sm opacity-80">
              Each chart presents a single snapshot from {storm.year}, allowing all four nations to
              be compared at the same moment rather than over time. Countries {storm.name} did not
              reach are shown too &mdash; the point of a same-moment comparison is that it includes
              them.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {CHAIN_METRICS.map((m, i) => {
                const rows = snapshots[m.key]
                const nationsMissing = missingNations(NATION_NAMES, rows)
                return (
                  <MetricSnapshotChart
                    key={m.key}
                    label={m.label}
                    ariaLabel={`${m.label}, ${storm.year}, by nation`}
                    rows={rows}
                    nationsMissing={nationsMissing}
                    missingNote={`No ${storm.year} data available for ${formatNationList(nationsMissing)}.`}
                    emptyNote={`Data not available for ${storm.year}.`}
                    format={m.format}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                    index={i}
                    className={i === CHAIN_METRICS.length - 1 && CHAIN_METRICS.length % 2 !== 0 ? 'sm:col-span-2' : ''}
                  />
                )
              })}
            </div>
          </div>
        )}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}

function StatTile({ index, label, value, detail }) {
  return (
    <div
      className="animate-pop-in rounded-xl border border-ink/10 bg-surface/60 p-5"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</p>
      <p className="mt-2 text-3xl font-semibold leading-none tabular-nums">{value}</p>
      <p className="mt-2 text-xs opacity-70">{detail}</p>
    </div>
  )
}

function computeStats(data, eventYear) {
  if (!data || !eventYear) return null
  const rows = data.affected_persons ?? []
  const eventRows = rows.filter((d) => d.year === eventYear)
  if (eventRows.length === 0) return null

  const totalAffected = eventRows.reduce((sum, d) => sum + d.affected_persons, 0)
  const max = eventRows.reduce((a, b) => (b.affected_persons > a.affected_persons ? b : a))
  const min = eventRows.reduce((a, b) => (b.affected_persons < a.affected_persons ? b : a))
  // Rounded to the nearest hundred -- the precise ratio reads as false
  // precision on what's fundamentally a rough, order-of-magnitude gap.
  const rawRatio = min.affected_persons > 0 ? max.affected_persons / min.affected_persons : null
  const ratio = rawRatio ? Math.round(rawRatio / 100) * 100 : null

  const economicLossReported = (data.economic_loss ?? []).filter((d) => d.year === eventYear).length

  return { totalAffected, maxNation: max.nation, minNation: min.nation, ratio, economicLossReported }
}

