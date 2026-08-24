import { useEffect, useMemo, useRef, useState } from 'react'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import Tooltip from './Tooltip.jsx'
import DivergenceChart from './DivergenceChart.jsx'
import SeriesLegend from './SeriesLegend.jsx'
import { NATION_NAMES } from '../content/nations.js'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { useInView } from '../hooks/useInView.js'
import { useNationHighlight } from '../hooks/useNationHighlight.jsx'
import { chartColorsFor } from '../utils/theme.js'
import { seriesStyles } from '../utils/charts/index.js'
import { CHAIN_METRICS } from '../utils/metrics.js'
import { buildDivergencePanels, divergenceYearRange } from '../utils/divergence.js'
import { motionDuration } from '../utils/motion.js'

const SWEEP_MS = 3400

// Caveats that belong to a specific metric rather than to the section. Kept
// here rather than in metrics.js because they're about what this indexed view
// implies, not about the underlying figures.
//
// A function of the baseline year, not a constant. As a constant it printed the
// 2020 sentence under every storm, and for a 2015 baseline that sentence is
// simply false -- arrivals in 2015 were not collapsed by anything. COVID is
// still relevant to an earlier baseline, because the sweep crosses 2020-21 on
// its way to the present, so the note changes form rather than disappearing.
function metricNotes(eventYear) {
  const baselineIsCollapsed = eventYear === 2020 || eventYear === 2021
  return {
    tourist_arrivals: baselineIsCollapsed
      ? 'Arrivals in the baseline year were already collapsed by COVID-19 border closures, so this traces recovery from that floor rather than from the cyclone alone.'
      : 'The 2020\u201321 stretch of this line is dominated by COVID-19 border closures, not by the storm.',
  }
}

// The legend's colours and dashes come from seriesStyles(), the same resolver
// the charts draw with. They used to be a LEGEND_DASH array declared here --
// a fourth copy of DIVERGENCE_DASH, differing only in spelling solid as
// 'none' rather than null, with nothing keeping the two in step.

// Every nation indexed to its own event-year figure, so the four lines start
// from one point and the chart can only show how far apart they finish.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   style -- forwarded to Section (entrance stagger)
export default function DivergenceView({ data, dataError, storm, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()
  const palette = chartColorsFor(theme)
  const [sectionRef, inView] = useInView({ threshold: 0.25 })
  const { pinned, setPinned } = useNationHighlight()
  const [progress, setProgress] = useState(0)
  // Explicit, rather than inferred from `progress < 1`. Inferred, the button
  // read "Playing..." from the moment the slide mounted -- before the sweep had
  // ever run -- and there was no state in which it said what pressing it would
  // do. It also stayed pressable mid-sweep and silently restarted from zero.
  const [playState, setPlayState] = useState('idle') // 'idle' | 'playing' | 'done'
  const frameRef = useRef(null)

  const eventYear = storm?.year ?? null
  const panels = useMemo(
    () => (eventYear ? buildDivergencePanels(data, CHAIN_METRICS, NATION_NAMES, eventYear) : []),
    [data, eventYear]
  )
  const years = useMemo(
    () => (eventYear ? divergenceYearRange(panels, eventYear) : [0, 0]),
    [panels, eventYear]
  )
  const notes = useMemo(() => metricNotes(eventYear), [eventYear])
  const legendStyles = useMemo(() => seriesStyles(NATION_NAMES, palette), [palette])

  function play() {
    cancelAnimationFrame(frameRef.current)
    const duration = motionDuration(SWEEP_MS)
    if (duration === 0) {
      // Under reduced motion the sweep has no meaningful slow form, so it
      // arrives at its end. That is a finished sweep, not an idle one.
      setProgress(1)
      setPlayState('done')
      return
    }
    setPlayState('playing')
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setProgress(t)
      if (t < 1) frameRef.current = requestAnimationFrame(step)
      else setPlayState('done')
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
  }, [inView, panels.length])

  const blocked = sectionGuard({
    data,
    error: dataError,
    storm,
    style,
    subject: 'The divergence',
    prompt: 'see how the four nations moved apart after it',
  })
  if (blocked) return blocked
  if (panels.length === 0) {
    return (
      <EmptyState style={style}>
        No metric in this chain has enough data after {storm.year} to index.
      </EmptyState>
    )
  }

  const sweepYear = Math.round(years[0] + (years[1] - years[0]) * progress)

  return (
    <Section style={style} backdrop={scatterBackdrop('divergence')}>
      <div ref={sectionRef}>
        <div ref={containerRef} className="relative">
          <p className="type-eyebrow mb-1 text-accent">
            One storm, one starting point
          </p>
          <h2 className="type-h2 mb-2">
            Where the four nations part ways after {storm.name}
          </h2>
          <p className="prose-column prose-wide prose-short mb-6 text-sm opacity-75">
            Each line begins at 100 &mdash; that nation&rsquo;s own figure in {storm.year}. Nothing
            else is adjusted and no country is measured against another, so the only thing left for
            the chart to show is the distance that opens up afterwards.
          </p>

          {/* Buttons, not decorative swatches -- see SeriesLegend. Pointing at
              one already lifted that nation's line out of the other three on
              every chart in the deck, but pointing is a gesture a touch screen
              does not have, so the same chip presses to hold the thread and
              presses again to release it. */}
          <SeriesLegend
            styles={legendStyles}
            pinned={pinned}
            onPin={setPinned}
            className="mb-6 gap-x-5 gap-y-3"
          />

          <div className="mb-5 flex items-center gap-4">
            <button
              type="button"
              onClick={play}
              disabled={playState === 'playing'}
              className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:bg-surface/70 active:scale-95 disabled:opacity-55 disabled:hover:scale-100 disabled:hover:bg-transparent"
            >
              {playState === 'playing'
                ? 'Playing\u2026'
                : playState === 'done'
                  ? 'Play again'
                  : 'Play the sweep'}
            </button>
            <span className="type-figure text-3xl" aria-hidden="true">
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
                note={notes[panel.metric.key]}
                missing={panel.missing}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                className={i === panels.length - 1 && panels.length % 2 !== 0 ? 'lg:col-span-2' : ''}
              />
            ))}
          </div>

          <p className="prose-wide mt-6 text-xs italic opacity-70">
            People affected is left out of this view and economic loss is not in the chain at all:
            both are reported in scattered years, and an index across gaps draws a confident line
            over years nobody measured.
          </p>
          <p className="prose-wide mt-2 text-xs italic opacity-70">
            The further right the sweep runs, the less of what it shows belongs to {storm.name}.
            Read the separation as the shape of four different recoveries, not as a measurement of
            one storm&rsquo;s reach.
          </p>

          <Tooltip tooltip={tooltip} />
        </div>
      </div>
    </Section>
  )
}
