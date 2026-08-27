import Section from './Section.jsx'
import { EXCLUDED, STORMS, ROSTER_START, ROSTER_END } from '../content/storms.js'
import { NATION_COUNT } from '../content/nations.js'
import { numberWord, numberWordCapitalized } from '../utils/numberWords.js'
import { scatterBackdrop } from '../content/patterns.js'

// How the site was made, and what it cannot say -- rewritten as a plain
// methodology note rather than a styled continuation of the slides before it.
//
// THIRD VERSION OF THIS SLIDE. The first was six flat, same-weight sections
// with the site's own tech stack sitting between two sections about whether
// the data could be trusted. The second grouped those six into three acts
// with type-h3 headings and unified every list to one of two card styles.
// Testers still flagged it after that pass, and the actual complaint was
// simpler than either fix addressed: opacity-muted body text and card/border
// chrome are the visual language of the *data* slides, borrowed here for a
// page that isn't showing data, it's documenting method -- so however
// internally consistent this page became, it still read as an attempt to be
// a slide rather than what it actually is, which is closer to an appendix.
//
// So this version stops trying. Plain sections, full-contrast prose
// (text-ink, not opacity-70/75/80), no card chrome, no coloured dividers, one
// hairline rule between sections doing the only visual separation a plain
// document needs. The eyebrow reads "Appendix" rather than restating the
// title, because a reader who has just scrolled through thirteen slides of
// argument should be able to tell from the label alone that the register is
// changing on purpose.
//
// WHAT GOT COMPRESSED, ON PURPOSE. The per-nation language table collapsed to
// one sentence: the person building this site wants to make that argument in
// person at submission rather than spend a paragraph on it here. The
// "what's not here yet" roadmap folded into one clause inside Limitations
// rather than keeping its own section -- sub-national and recovery-time data
// being limited is a fact about this analysis; a fuller roadmap of planned
// work is a fact about the project, and belonged less on a page about what
// the data can and cannot say.
//
// WHAT DID NOT GET COMPRESSED. Every checkable specific survived the two
// passes before this one for the same reason each time: a caveat that just
// says "the sources disagree" is a disclaimer a reader has to take on trust;
// one that says 69% and 62% is a fact they can go and test themselves. Vanuatu's
// 2015 zero, Winston's two shares, the sea level record's 0.1 m floor, and
// Yasa's cost to the roster's own case are all still here, in prose instead of
// in cards.

export default function MethodPanel({ style }) {
  // The one exclusion with a `cost` field is the one whose absence weakens
  // the roster's own case (see EXCLUDED in content/storms.js). Read from
  // there rather than retyped here, so this sentence cannot drift from the
  // reasoning it is quoting.
  const yasa = EXCLUDED.find((storm) => storm.cost)

  return (
    // The same scatter every other slide carries, seeded with this slide's own
    // id -- kept even though the content inside is now deliberately plainer,
    // so this page still reads as part of the same site at a glance rather
    // than a pasted-in document.
    <Section backdrop={scatterBackdrop('method')} style={style}>
      <p className="type-eyebrow mb-1 text-accent">
        Appendix
      </p>
      <h2 className="type-h2 mb-6">
        Method, Data and Limitations
      </h2>

      <div className="space-y-8">
        <div>
          <h3 className="type-h3 mb-2">
            Method
          </h3>
          <div className="prose-column prose-wide space-y-3 text-sm text-ink">
            <p>
              The analysis covers severe tropical cyclones affecting at least two of these{' '}
              {numberWord(NATION_COUNT)} nations: Solomon Islands, Vanuatu, Fiji and Tonga, between{' '}
              {ROSTER_START} and {ROSTER_END}. The resulting roster contains{' '}
              {numberWord(STORMS.length)} storms. {numberWordCapitalized(EXCLUDED.length)}{' '}
              additional storms did not meet that bar: Cyclones Ana (2021) and Cody (2022) affected
              Fiji alone, and Cyclone Rae (2022) did not reach severe intensity. The exclusion that
              costs the analysis something is {yasa.name} ({yasa.year}) &mdash; {yasa.cost} It is
              excluded anyway, because the rule was fixed before the roster was drawn. Storm dates,
              classifications and reported deaths were verified against national meteorological
              services and UN OCHA sources.
            </p>
            <p>
              Indicator data for 2013&ndash;2024 comes from the Pacific Data Hub and is filtered to
              the four countries and selected years using Python and pandas. The 2013 baseline
              provides context for changes occurring during the storm period.
            </p>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-8">
          <h3 className="type-h3 mb-2">
            Limitations
          </h3>
          <div className="prose-column prose-wide space-y-3 text-sm text-ink">
            <p>
              The indicator data is primarily reported as annual national totals rather than
              storm-specific measurements. This means individual cyclone impacts cannot always be
              isolated from other events occurring in the same year &mdash; the 2020&ndash;21
              figures, for instance, also carry the effect of the pandemic alongside any storm.
            </p>
            <p>
              A reported figure of zero is not necessarily the same as no impact. In the
              people-affected series, an exact zero is treated as unreported rather than as
              evidence that nobody was affected, since the two cannot be distinguished. Vanuatu&rsquo;s
              official figure for 2015 &mdash; the year Cyclone Pam became the most destructive
              storm in its history &mdash; is zero.
            </p>
            <p>
              Data coverage also varies by country and indicator. Tourist arrivals, for instance,
              are not reported for Solomon Islands at all, and no disaster figures are reported
              after 2022. Economic-loss records are patchy throughout, and sub-national and
              recovery-time data are also limited, preventing more detailed comparisons of
              individual islands and post-storm recovery.
            </p>
            <p>
              Some figures use different population or assessment bases depending on their source.
              A regional snapshot divides reported totals by population estimates, while individual
              storm figures come from government and PDNA assessments measured against their own
              base; for Cyclone Winston the two approaches give roughly 69% and 62% of Fiji&rsquo;s
              population respectively. These values are retained as reported rather than combined
              into a single estimate.
            </p>
            <p>
              Sea level rise, the best-attributed of the three climate mechanisms behind these
              storms, is reported only to the nearest 0.1&nbsp;metre &mdash; three distinct values
              across twelve years. It is described in this analysis rather than charted, since
              charting it would imply a precision the underlying measurement does not have.
            </p>
            <p>
              This site and every source it draws on are written in English, which is not the
              first language of most of the people being counted.
            </p>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-8">
          <h3 className="type-h3 mb-2">
            Technical Implementation
          </h3>
          <div className="prose-column prose-wide space-y-3 text-sm text-ink">
            <p>
              The interface is built with React 18 and Vite, with Tailwind CSS and PostCSS for
              styling. Charts and maps are rendered directly with D3, using TopoJSON and Natural
              Earth data for geographic features.
            </p>
            <p>
              The data pipeline uses Python and pandas and runs offline. Cleaned datasets are
              exported as static JSON and bundled with the site, so the deployed application does
              not depend on live API requests.
            </p>
            <p>
              All source material and data-processing scripts are included in the project
              repository.
            </p>
          </div>
        </div>

        {/* Shortest section on the slide, and deliberately so. It is the only
            one here that is not about what the data can or cannot say, so
            giving it the weight of Method or Limitations would misread the
            page. Same plain register as everything above it -- prose rather
            than a list, because four names in a bulleted list would take more
            vertical space than the thanks are asking for. */}
        <div className="border-t border-ink/10 pt-8">
          <h3 className="type-h3 mb-2">
            Acknowledgements
          </h3>
          <div className="prose-column prose-wide space-y-3 text-sm text-ink">
            <p>
              Special thanks to Eljevisma Gani, Terah Maitoo Manenau, and Cynthia Oastasia for
              their creative input, and to Gregory Malaii, Gabriel Salini, and Aleetza Mahli for
              helping test the site.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
