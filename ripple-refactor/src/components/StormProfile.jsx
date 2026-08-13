import { useEffect } from 'react'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { useElementWidth } from '../hooks/useElementWidth.js'
import { useInView } from '../hooks/useInView.js'
import { resetSvg } from '../utils/d3helpers.js'
import { renderStormProfileChart, STORM_CHART_HEIGHT } from '../utils/charts/index.js'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import { formatNationList } from '../utils/formatNationList.js'

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
  const [ref, node, width] = useElementWidth()
  const [chartRef, inView] = useInView()
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()

  // The dots and their labels arrive one at a time, and this chart sits below
  // three paragraphs of framing -- far enough down that at mount it is off
  // screen on most windows.
  useEffect(() => {
    if (!inView || !node || !width || !rows) return
    const svg = resetSvg(node, width, STORM_CHART_HEIGHT)
    renderStormProfileChart(svg, { width, rows, showTooltip, hideTooltip, theme })
  }, [inView, node, width, rows, showTooltip, hideTooltip, theme])

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
    <Section style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
          {storm.name} at a glance
        </h2>

        <div className="prose-column max-w-prose space-y-3 text-sm opacity-80">
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

        <div ref={chartRef}>
          <svg
            ref={ref}
            role="img"
            aria-label={`Scatter chart comparing ${storm.name}'s category at closest approach against deaths, for each nation it struck`}
            className="mt-6 block w-full"
            style={{ height: STORM_CHART_HEIGHT }}
          />
        </div>

        {(unreported.length > 0 || indirect.length > 0) && (
          <div className="mt-3 max-w-prose space-y-2 border-l-2 border-ink/15 pl-3 text-xs italic opacity-75">
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

            whitespace-normal overrides the nowrap that .sr-only sets
            (and which inherits down into every cell): the "Local
            detail" column below holds full prose sentences, and
            table layout doesn't let a table's rendered width shrink
            below its content's min-content width -- with nowrap
            inherited, that min-content width was the length of the
            single longest unbroken sentence, which stretched this
            table (and, since it's position:absolute, the whole page)
            to roughly 2000px wide on every screen size, invisibly.
            Letting the text wrap keeps min-content down to the
            longest unbreakable *word* instead. */}
        <table className="sr-only whitespace-normal">
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

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
