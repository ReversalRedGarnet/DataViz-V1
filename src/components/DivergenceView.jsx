import { useEffect, useMemo, useRef, useState } from 'react'
import Section from './Section.jsx'
import EmptyState from './EmptyState.jsx'
import Tooltip from './Tooltip.jsx'
import DivergenceChart from './DivergenceChart.jsx'
import { NATIONS } from './MapView.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { useInView } from '../hooks/useInView.js'
import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { chartColorsFor } from '../utils/theme.js'
import { CHAIN_METRICS, EVENT_YEAR } from '../utils/metrics.js'
import { buildDivergencePanels, divergenceYearRange } from '../utils/divergence.js'
import { motionDuration } from '../utils/motion.js'

const SWEEP_MS = 3400

// Caveats that belong to a specific metric rather than to the section. Kept
// here rather than in metrics.js because they're about what this indexed view
// implies, not about the underlying figures.
const METRIC_NOTES = {
  tourist_arrivals:
    'Arrivals in 2020 were already collapsed by COVID-19 border closures, so this traces recovery from that floor rather than from the cyclone alone.',
}

// A small line preview, so the legend shows the dash pattern and not just the
// colour -- the pattern is the cue that survives a greyscale print or a reader
// who can't separate the hues.
const LEGEND_DASH = ['none', '7 4', '2 3', '9 3 2 3']

// Every nation indexed to its own event-year figure, so the four lines start
// from one point and the chart can only show how far apart they finish.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   style -- forwarded to Section (entrance stagger)
export default function DivergenceView({ data, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()
  const palette = chartColorsFor(theme)
  const [sectionRef, inView] = useInView({ threshold: 0.25 })
  const { setHighlight } = useNationHighlight()
  const [progress, setProgress] = useState(0)
  const frameRef = useRef(null)

  const nations = useMemo(() => NATIONS.map((n) => n.name), [])
  const panels = useMemo(
    () => buildDivergencePanels(data, CHAIN_METRICS, nations, EVENT_YEAR),
    [data, nations]
  )
  const years = useMemo(() => divergenceYearRange(panels, EVENT_YEAR), [panels])

  function play() {
    cancelAnimationFrame(frameRef.current)
    const duration = motionDuration(SWEEP_MS)
    if (duration === 0) {
      setProgress(1)
      return
    }
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setProgress(t)
      if (t < 1) frameRef.current = requestAnimationFrame(step)
    }
    frameRef.current = requestAnimationFrame(step)
  }

  // Runs itself once, when the section is actually on screen. The whole point
  // is the moment the lines separate, and it can't happen four screens above
  // where the reader is.
  useEffect(() => {
    if (!inView || panels.length === 0) return
    play()
    return () => cancelAnimationFrame(frameRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, panels.length])

  if (!data) return <EmptyState tone="panel" style={style}>The divergence -- waiting on data.</EmptyState>
  if (panels.length === 0) {
    return (
      <EmptyState tone="panel" style={style}>
        No metric in this chain has enough post-{EVENT_YEAR} data to index.
      </EmptyState>
    )
  }

  const sweepYear = Math.round(years[0] + (years[1] - years[0]) * progress)

  return (
    <Section tone="panel" style={style}>
      <div ref={sectionRef}>
        <div ref={containerRef} className="relative">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            One storm, one starting point
          </p>
          <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
            Where the four nations part ways
          </h2>
          <p className="mb-6 max-w-prose text-sm opacity-75">
            Each line begins at 100 &mdash; that nation&rsquo;s own figure in {EVENT_YEAR}, the year
            Harold crossed all four. Nothing else is adjusted, and no country is measured against
            another. Every line therefore starts in the same place, and the only thing left for the
            chart to show is the distance that opens up afterwards.
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            {nations.map((nation, i) => (
              <span
                key={nation}
                tabIndex={0}
                className="flex cursor-help items-center gap-2 rounded text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                {...highlightHandlers(nation, setHighlight)}
              >
                <svg width="26" height="8" aria-hidden="true" className="shrink-0">
                  <line
                    x1="0"
                    y1="4"
                    x2="26"
                    y2="4"
                    stroke={palette.series[i]}
                    strokeWidth="2"
                    strokeDasharray={LEGEND_DASH[i]}
                    strokeLinecap="round"
                  />
                </svg>
                {nation}
              </span>
            ))}
          </div>

          <div className="mb-5 flex items-center gap-4">
            <button
              type="button"
              onClick={play}
              className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:bg-surface/70 active:scale-95"
            >
              {progress >= 1 ? 'Play again' : 'Playing\u2026'}
            </button>
            <span className="font-serif text-3xl font-semibold tabular-nums" aria-hidden="true">
              {sweepYear}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {panels.map((panel, i) => (
              <DivergenceChart
                key={panel.metric.key}
                label={panel.metric.label}
                series={panel.series}
                years={years}
                progress={progress}
                format={panel.metric.format}
                note={METRIC_NOTES[panel.metric.key]}
                missing={panel.missing}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                className={i === panels.length - 1 && panels.length % 2 !== 0 ? 'lg:col-span-2' : ''}
              />
            ))}
          </div>

          <p className="mt-6 max-w-prose text-xs italic opacity-70">
            People affected is left out of this view, and economic loss is not in the chain at
            all. Both are reported in scattered years rather than continuously, and running a
            gappy record through an index would draw a confident line across years nobody
            measured.
          </p>
          <p className="mt-2 max-w-prose text-xs italic opacity-70">
            The further right the sweep runs, the less of what it shows belongs to the storm.
            Fiji&rsquo;s crop yield falls sharply in 2024, four years after Harold and well outside
            anything a single cyclone explains. Read the separation as the shape of four different
            recoveries, not as a measurement of one storm&rsquo;s reach.
          </p>

          <Tooltip tooltip={tooltip} />
        </div>
      </div>
    </Section>
  )
}
