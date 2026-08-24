import { useEffect, useState } from 'react'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import Tooltip from './Tooltip.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useChartCanvas } from '../hooks/useChartCanvas.js'
import { renderStormProfileChart, STORM_CHART_HEIGHT } from '../utils/charts/index.js'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import { formatNationList } from '../utils/formatNationList.js'
import VisuallyHidden from './VisuallyHidden.jsx'

// Per-nation storm facts live in src/content/storms.js, in the order each storm
// reached the nations it struck -- which is also the order the journey section
// walks through.
//
// Sourcing note: the citation for these is NOT uniformly the Bureau of
// Meteorology. BOM only keeps history pages for the Australian region, so it
// covers Harold and none of the others; the rest come from RSMC Nadi, national
// meteorological services, and government post-disaster assessments. There is a
// live trap in the obvious guess: bom.gov.au has a page for a "Cyclone Pam"
// that is a different 1974 Australian storm. Each storm carries its own source
// pair in the registry for exactly this reason.


// Props:
//   style -- forwarded to the underlying Section, used by App.jsx to
//     stagger each section's entrance on first load
export default function StormProfile({ storm, style }) {
  const rows = storm?.profile ?? null
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()

  // The dots and their labels arrive one at a time, and this chart sits below
  // three paragraphs of framing -- far enough down that at mount it is off
  // screen on most windows.
  // The chart's height is the one thing on this slide that can be given back.
  //
  // At a fixed 260px it fits comfortably on a laptop and awkwardly on anything
  // shorter: three paragraphs of framing, a chart that will not yield, and then
  // the unreported-toll caveat -- the most important sentence here -- pushed
  // half under the footer. Technically all of it was reachable. It read as a
  // slide that had been cut off.
  //
  // So the chart takes a share of the window instead, floored at 170px, which
  // is the point below which the category axis and the two label rows start
  // colliding. The scatter carries four points and two labels; it loses nothing
  // by being shorter, and the caveat gains a place on the screen.
  const [viewportHeight, setViewportHeight] = useState(
    () => (typeof window === 'undefined' ? 800 : window.innerHeight)
  )

  // Coalesced into a frame, and only written when the number actually moves.
  // chartHeight is a dependency of the draw below, so an unthrottled listener
  // meant a full resetSvg, a complete D3 redraw and a replay of the staggered
  // entrance on every resize event -- continuously through a window drag, and
  // on a phone every time the address bar slides in or out.
  useEffect(() => {
    let frame = null
    const onResize = () => {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        setViewportHeight((current) =>
          current === window.innerHeight ? current : window.innerHeight
        )
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  const chartHeight = Math.round(
    Math.max(170, Math.min(STORM_CHART_HEIGHT, viewportHeight * 0.26))
  )

  // This was the last chart on the site still assembling the measure / observe
  // / reset scaffolding by hand, which is the exact job useChartCanvas exists
  // to do once. The variable height is not an obstacle: the hook takes it and
  // already lists it as a redraw dependency.
  const { svgRef, cardRef } = useChartCanvas({
    height: chartHeight,
    ready: Boolean(rows),
    deps: [rows, showTooltip, hideTooltip],
    draw: (svg, { width, theme }) =>
      renderStormProfileChart(svg, {
        width,
        height: chartHeight,
        rows,
        showTooltip,
        hideTooltip,
        theme,
      }),
  })

  const blocked = sectionGuard({
    data: true,
    storm,
    style,
    subject: 'Storm profile',
    prompt: 'see how it compared',
  })
  if (blocked) return blocked
  if (!rows) {
    return (
      <EmptyState style={style}>
        {storm.name} has a full ripple chain, but its per-nation impact record has not been
        compiled yet.
      </EmptyState>
    )
  }

  const unreported = rows.filter((r) => r.deaths == null)
  const indirect = rows.filter((r) => r.deathsKind === 'indirect')

  return (
    <Section lock width="narrow" style={style} backdrop={scatterBackdrop('storm-profile')}>
      <div ref={containerRef} className="relative">
        <h2 className="type-h2 mb-2">
          {storm.name} at a glance
        </h2>

        <div className="prose-column figure-prose space-y-3 text-sm opacity-80">
          <p>
            {storm.name} struck {formatNationList(storm.nations)} in {storm.year}. The same weather
            system throughout, and a different storm on arrival: a direct landfall at full strength
            in one country, a weakened system or only rough seas and coastal flooding in another.
          </p>

          {storm.note && <p>{storm.note}</p>}

          {/* The dropped clause was "and that mismatch is the argument this
              whole page is built on". It told the reader what to conclude from
              a chart directly above the chart, and on a two-stop storm --
              Judy & Kevin, one stated zero and one unreported -- there is no
              visible mismatch for it to point at. */}
          <p>
            Below: category at closest approach against reported deaths. The two do not reliably
            move together.
          </p>
        </div>

        <div ref={cardRef}>
          <svg
            ref={svgRef}
            role="img"
            aria-label={`Scatter chart comparing ${storm.name}'s category at closest approach against deaths, for each nation it struck`}
            className="mt-5 block w-full"
            style={{ height: chartHeight }}
          />
        </div>

        {(unreported.length > 0 || indirect.length > 0) && (
          <div className="mt-3 figure-prose space-y-2 border-l-2 border-ink/15 pl-3 text-xs italic opacity-75">
            {unreported.length > 0 && (
              <p>
                {formatNationList(unreported.map((r) => r.name))} sits in the band above the chart
                rather than on it: no national fatality figure was ever published for that impact.
                That is not a toll of zero, and it is not drawn as one. Every unreported stop on
                this roster is the secondary nation in its storm &mdash; the smaller impact, on the
                more remote islands, in the country least able to run an assessment.
              </p>
            )}
            {indirect.length > 0 && (
              <p>
                {formatNationList(indirect.map((r) => r.name))} is drawn as a hollow marker: those
                deaths were indirect, following the storm rather than caused by it in the moment.
                They are counted here because they are real, and marked apart because they are not
                the same kind of fact as a drowning during the storm.
              </p>
            )}
          </div>
        )}

        {/* Screen-reader-only data table -- same pattern as RippleChain:
            the chart above conveys the shape, this gives the same
            numbers as text.

            VisuallyHidden, not className="sr-only" on the table itself.
            .sr-only cannot collapse a table box at all -- see that
            component for the full account. This table was the worst
            case of it, because the "Local detail" column holds prose
            sentences. */}
        <VisuallyHidden>
          <table>
            <caption>{storm.name}: category at closest approach and deaths, by nation</caption>
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col">Category at closest approach</th>
                <th scope="col">Deaths</th>
                <th scope="col">Local detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.categoryLabel}</td>
                  <td>
                    {row.deaths == null
                      ? 'Not reported'
                      : `${row.deaths}${row.deathsKind === 'indirect' ? ' (indirect)' : ''}`}
                  </td>
                  <td>
                    {row.fact}
                    {row.deathsNote ? ` ${row.deathsNote}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </VisuallyHidden>

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
