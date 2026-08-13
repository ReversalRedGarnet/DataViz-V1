import { useEffect, useRef } from 'react'
import { useChartCanvas } from '../hooks/useChartCanvas.js'
import { buildDivergenceChart, DIVERGENCE_HEIGHT } from '../utils/charts/index.js'

// One panel of the divergence section. Unlike every other chart card on the
// site this one is built once and then driven: the section above it owns a
// single sweep clock, and each panel exposes an update function it calls. A
// redraw per frame across three panels would be three passes of D3 draw code
// sixty times a second.
//
// Props:
//   label -- heading and svg aria-label stem
//   series -- [{ nation, colorIndex, points }], see buildDivergenceChart
//   years -- [firstYear, lastYear], shared by every panel in the section
//   progress -- 0..1, the section's sweep position
//   format -- the metric's own value formatter, for tooltips
//   note -- optional caveat printed under the chart
//   missing -- nation names with no usable record for this metric
//   className -- layout hook (e.g. lg:col-span-2 for an odd one out)
export default function DivergenceChart({
  label,
  series,
  years,
  progress,
  format,
  note,
  missing = [],
  showTooltip,
  hideTooltip,
  className = '',
}) {
  const apiRef = useRef(null)
  // The build effect needs the current sweep position without taking progress
  // as a dependency, which would rebuild the chart on every frame.
  const progressRef = useRef(progress)

  // waitForInView is off: this chart is driven by a scroll position the parent
  // already computes from its own visibility, so gating on a second visibility
  // check would only delay the first frame.
  const { svgRef } = useChartCanvas({
    height: DIVERGENCE_HEIGHT,
    ready: series.length > 0,
    waitForInView: false,
    deps: [series, years, format, showTooltip, hideTooltip],
    draw: (svg, { width, theme }) => {
      apiRef.current = buildDivergenceChart(svg, {
        width,
        series,
        years,
        format,
        showTooltip,
        hideTooltip,
        theme,
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

  return (
    <div className={`rounded-xl border border-ink/10 bg-surface/60 p-4 ${className}`}>
      <h3 className="mb-1 text-sm font-semibold">{label}</h3>
      <p className="mb-2 text-xs opacity-60">Indexed to each nation&rsquo;s own {years[0]} figure = 100</p>
      <svg
        ref={svgRef}
        role="img"
        aria-label={`${label}, each nation indexed to its own ${years[0]} figure`}
        className="block w-full"
        style={{ height: DIVERGENCE_HEIGHT }}
      />
      {note && <p className="mt-2 text-xs italic opacity-70">{note}</p>}
      {missing.length > 0 && (
        <p className="mt-1 text-xs italic opacity-70">
          No usable record for {missing.join(' or ')} on this metric.
        </p>
      )}
      <table className="sr-only whitespace-normal">
        <caption>{label}, indexed to each nation&rsquo;s own {years[0]} figure</caption>
        <thead>
          <tr>
            <th scope="col">Country</th>
            <th scope="col">Year</th>
            <th scope="col">Value</th>
            <th scope="col">Index ({years[0]} = 100)</th>
          </tr>
        </thead>
        <tbody>
          {series.flatMap((s) =>
            s.points.map((p) => (
              <tr key={`${s.nation}-${p.year}`}>
                <td>{s.nation}</td>
                <td>{p.year}</td>
                <td>{format(p.raw)}</td>
                <td>{p.index.toFixed(1)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
