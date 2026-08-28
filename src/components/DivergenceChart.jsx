import { useEffect, useMemo, useRef, useState } from 'react'
import { useChartCanvas } from '../hooks/useChartCanvas.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { buildDivergenceChart, DIVERGENCE_HEIGHT } from '../utils/charts/index.js'
import { motionDuration } from '../utils/motion.js'
import { nationLabel } from '../content/nations.js'
import { formatNationList } from '../utils/formatNationList.js'
import VisuallyHidden from './VisuallyHidden.jsx'
import FigureCaption from './FigureCaption.jsx'

const SWEEP_MS = 3400

const STRINGS = {
  en: {
    indexedTo: (year) => `Indexed to each nation\u2019s own ${year} figure = 100`,
    tableCaption: (label, year) => `${label}, indexed to each nation\u2019s own ${year} figure`,
    country: 'Country',
    year: 'Year',
    value: 'Value',
    indexOf: (year) => `Index (${year} = 100)`,
    playing: 'Playing\u2026',
    replay: 'Replay',
    play: 'Play',
    latestAvailable: 'Latest data available',
    chartAria: (label, year) => `${label}, each nation indexed to its own ${year} figure`,
    noRecord: (list) => `No usable record for ${list} on this metric.`,
  },
  fr: {
    indexedTo: (year) => `Indexé au chiffre de ${year} de chaque nation = 100`,
    tableCaption: (label, year) => `${label}, indexé au chiffre de ${year} de chaque nation`,
    country: 'Pays',
    year: 'Année',
    value: 'Valeur',
    indexOf: (year) => `Indice (${year} = 100)`,
    playing: 'Lecture\u2026',
    replay: 'Relancer',
    play: 'Lire',
    latestAvailable: 'Dernières données disponibles',
    chartAria: (label, year) => `${label}, chaque nation indexée à son propre chiffre de ${year}`,
    noRecord: (list) => `Aucune donnée exploitable pour ${list} sur cet indicateur.`,
  },
}

// One panel of the divergence section. Each panel now owns its own sweep
// clock and its own mini play button, rather than being driven by a single
// section-wide clock: a metric whose record stops in 2022 used to idle,
// frozen, until a 2024 metric caught up, because both were painted from one
// shared progress value. Independent clocks mean this chart finishes when its
// own data does, and says so.
//
// Props:
//   label -- heading and svg aria-label stem
//   series -- [{ nation, colorIndex, points }], see buildDivergenceChart
//   years -- [firstYear, lastYear], the x-axis domain. Shared across every
//     panel on the page so their axes stay visually aligned.
//   lastYear -- this metric's own last real year. What this panel's sweep
//     actually counts up to, and what makes the sweep finish here rather than
//     at the page-wide max.
//   playToken -- bumped by the section to replay every panel at once ("Replay
//     all"). 0 on mount so a fresh page load doesn't auto-play before the
//     section has scrolled into view; the section itself bumps it once that
//     happens.
//   format -- the metric's own value formatter, for tooltips
//   figure -- { key, source, title? } | undefined. Prints a numbered caption
//     under the chart; see content/figures.js for why the number is written
//     down rather than counted.
//   note -- optional caveat printed under the chart
//   missing -- nation names with no usable record for this metric
//   className -- layout hook (e.g. lg:col-span-2 for an odd one out)
export default function DivergenceChart({
  label,
  series,
  years,
  lastYear,
  playToken = 0,
  format,
  note,
  figure,
  missing = [],
  showTooltip,
  hideTooltip,
  className = '',
}) {
  const apiRef = useRef(null)
  const frameRef = useRef(null)
  const { language } = useLanguage()
  const t = STRINGS[language]
  const [progress, setProgress] = useState(0)
  // Explicit rather than inferred from `progress < 1` -- see DivergenceView's
  // former version of this same comment. Inferred, the button read "Playing"
  // before it had ever run, and stayed pressable mid-sweep.
  const [playState, setPlayState] = useState('idle') // 'idle' | 'playing' | 'done'
  // The build effect needs the current sweep position without taking progress
  // as a dependency, which would rebuild the chart on every frame.
  const progressRef = useRef(progress)
  const sweepYears = useMemo(() => [years[0], lastYear], [years, lastYear])

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

  // playToken starts at 0 and this only fires once it has actually been
  // bumped, so mounting never auto-plays on its own -- the section bumps it
  // once when it scrolls into view, and again on every "Replay all" press.
  useEffect(() => {
    if (playToken > 0) play()
    return () => cancelAnimationFrame(frameRef.current)
  }, [playToken])

  // waitForInView is off: the section already gates the first play on its own
  // visibility (via playToken), so a second visibility check here would only
  // delay that first frame.
  const { svgRef } = useChartCanvas({
    height: DIVERGENCE_HEIGHT,
    ready: series.length > 0,
    waitForInView: false,
    deps: [series, years, lastYear, format, showTooltip, hideTooltip],
    draw: (svg, { width, theme, language }) => {
      apiRef.current = buildDivergenceChart(svg, {
        width,
        series,
        years,
        sweepYears,
        format,
        showTooltip,
        hideTooltip,
        theme,
        language,
      })
      apiRef.current.update(progressRef.current)
      return () => {
        apiRef.current = null
      }
    },
  })

  useEffect(() => {
    progressRef.current = progress
    if (apiRef.current) apiRef.current.update(progress)
  }, [progress])

  // MEMOISED BECAUSE OF THE SWEEP. This panel's own clock runs `progress` from
  // 0 to 1 over 3.4 seconds, so the component re-renders on every frame of it
  // -- roughly two hundred times. The chart itself is fine: it is built once
  // and driven through apiRef, so no D3 work happens per frame. This table was
  // not: four nations of a dozen years each was rebuilt and reconciled on
  // every one of those renders, for content that does not depend on
  // `progress` at all.
  const table = useMemo(
    () => (
      <table>
        <caption>{t.tableCaption(label, years[0])}</caption>
        <thead>
          <tr>
            <th scope="col">{t.country}</th>
            <th scope="col">{t.year}</th>
            <th scope="col">{t.value}</th>
            <th scope="col">{t.indexOf(years[0])}</th>
          </tr>
        </thead>
        <tbody>
          {series.flatMap((s) =>
            s.points.map((p) => (
              <tr key={`${s.nation}-${p.year}`}>
                <td>{nationLabel(s.nation, language)}</td>
                <td>{p.year}</td>
                <td>{format(p.raw)}</td>
                <td>{p.index.toFixed(1)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    ),
    [label, series, years, format, t, language]
  )

  // Rounded rather than floored so the counter reads as the year the sweep is
  // actually passing through, not the last one it fully cleared.
  const sweepYear = Math.round(sweepYears[0] + (sweepYears[1] - sweepYears[0]) * progress)

  return (
    <div className={`rounded-xl border border-ink/10 bg-surface/60 p-4 ${className}`}>
      <h3 className="mb-1 text-sm font-semibold">{label}</h3>
      <p className="mb-2 text-xs opacity-soft">{t.indexedTo(years[0])}</p>
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={play}
          disabled={playState === 'playing'}
          className="rounded-full border border-ink/20 px-3 py-1 text-xs font-medium transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:bg-surface/70 active:scale-95 disabled:opacity-55 disabled:hover:scale-100 disabled:hover:bg-transparent"
        >
          {playState === 'playing' ? t.playing : playState === 'done' ? t.replay : t.play}
        </button>
        <span className="type-figure text-sm tabular-nums" aria-hidden="true">
          {playState === 'done' ? t.latestAvailable : sweepYear}
        </span>
      </div>
      <svg
        ref={svgRef}
        role="img"
        aria-label={t.chartAria(label, years[0])}
        className="block w-full"
        style={{ height: DIVERGENCE_HEIGHT }}
      />
      {figure && (
        <FigureCaption
          figureKey={figure.key}
          title={figure.title ?? label}
          source={figure.source}
          className="mt-2"
        />
      )}
      {note && <p className="mt-2 text-xs italic opacity-70">{note}</p>}
      {missing.length > 0 && (
        <p className="mt-1 text-xs italic opacity-70">
          {t.noRecord(formatNationList(missing.map((n) => nationLabel(n, language)), language))}
        </p>
      )}
      <VisuallyHidden>{table}</VisuallyHidden>
    </div>
  )
}
