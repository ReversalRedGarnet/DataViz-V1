import { useEffect } from 'react'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { useElementWidth } from '../hooks/useElementWidth.js'
import { useInView } from '../hooks/useInView.js'
import { resetSvg } from '../utils/d3helpers.js'
import { renderStormProfileChart, STORM_CHART_HEIGHT } from '../utils/chartRenderers.jsx'

// In the order Harold reached them, which is also the order the journey
// section walks through. `date` is the day of that nation's closest approach
// or defining impact, from the Bureau of Meteorology's cyclone history and the
// UN OCHA situation reports already cited on this page.
export const STORM_PROFILE = [
  {
    name: 'Solomon Islands',
    date: '3 April 2020',
    category: 1,
    categoryLabel: 'Tropical low / Category 1 at time of impact',
    deaths: 27,
    dodge: 0,
    fact: "The passenger ferry MV Taimareho was overwhelmed by Harold's swell in Ironbottom Sound, Malaita Province -- the deadliest single event of the whole cyclone, at its weakest documented phase.",
  },
  {
    name: 'Vanuatu',
    date: '6 April 2020',
    category: 5,
    categoryLabel: 'Category 5 (landfall, Espiritu Santo)',
    deaths: 2,
    dodge: 0,
    fact: '230 km/h sustained winds, gusts to 325 km/h -- the strongest storm to hit Vanuatu since Cyclone Pam in 2015. Up to 90% of homes lost in the worst-hit areas.',
  },
  {
    name: 'Fiji',
    date: '8 April 2020',
    category: 4,
    categoryLabel: 'Category 4 (landfall, Kadavu)',
    deaths: 1,
    dodge: -0.35,
    fact: '1,919 buildings damaged; 103mm of rain recorded at Sigatoka in a single day.',
  },
  {
    name: 'Tonga',
    date: '9 April 2020',
    category: 4,
    categoryLabel: 'Category 4 (passed offshore, no landfall)',
    deaths: 0,
    dodge: 0.35,
    fact: '428 homes damaged or destroyed by flooding and storm surge, without a direct hit.',
  },
]

// Props:
//   style -- forwarded to the underlying Section, used by App.jsx to
//     stagger each section's entrance on first load
export default function StormProfile({ style }) {
  const [ref, node, width] = useElementWidth()
  const [chartRef, inView] = useInView()
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()

  // The dots and their labels arrive one at a time, and this chart sits below
  // three paragraphs of framing -- far enough down that at mount it is off
  // screen on most windows.
  useEffect(() => {
    if (!inView || !node || !width) return
    const svg = resetSvg(node, width, STORM_CHART_HEIGHT)
    renderStormProfileChart(svg, { width, rows: STORM_PROFILE, showTooltip, hideTooltip, theme })
  }, [inView, node, width, showTooltip, hideTooltip, theme])

  return (
    <Section style={style}>
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">Cyclone Harold at a Glance</h2>

        <div className="prose-column max-w-prose space-y-3 text-sm opacity-80">
          <p>
            Tropical Cyclone Harold was one of the strongest storms of the 2020 South Pacific
            cyclone season. Between 2 and 10 April 2020, it tracked across Solomon Islands,
            Vanuatu, Fiji, and Tonga, bringing destructive winds, heavy rainfall, storm surges,
            and widespread flooding.
          </p>

          <p>
            Although Harold was the same weather system throughout its journey, its intensity
            changed over time. Some countries experienced a direct Category 5 landfall, while
            others encountered a weaker system or were affected primarily by rough seas and
            coastal flooding.
          </p>

          <p>
            The chart below compares Cyclone Harold's strength at its closest approach to each
            nation against the reported loss of life. It introduces an important observation:
            stronger storms do not always produce the greatest human impact.
          </p>
        </div>

        <div ref={chartRef}>
          <svg
            ref={ref}
            role="img"
            aria-label="Scatter chart comparing cyclone category at closest approach against deaths, for each of the four nations"
            className="mt-6 block w-full"
            style={{ height: STORM_CHART_HEIGHT }}
          />
        </div>

        <p className="mt-3 max-w-2xl text-sm font-medium">
          One of the most striking findings is that the cyclone's deadliest single event occurred
          while Harold was at its weakest documented phase. Twenty-seven people lost their lives
          when the passenger ferry <em>MV Taimareho</em> was overwhelmed off Solomon Islands&mdash;
          more than the combined death toll recorded in Vanuatu, Fiji, and Tonga.
        </p>

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
          <caption>Cyclone Harold: category at closest approach and deaths, by nation</caption>
          <thead>
            <tr>
              <th scope="col">Country</th>
              <th scope="col">Category at closest approach</th>
              <th scope="col">Deaths</th>
              <th scope="col">Local detail</th>
            </tr>
          </thead>
          <tbody>
            {STORM_PROFILE.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.categoryLabel}</td>
                <td>{row.deaths}</td>
                <td>{row.fact}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
