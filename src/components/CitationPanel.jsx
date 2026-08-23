// Site footer: sources, copyright, and a plain-language data disclaimer.
//
// THIS SLIDE USED TO INVERT ITSELF, AND ONLY IN LIGHT MODE. It was
// bg-ink/text-sand with a dark:bg-panel/dark:text-ink override, on the
// reasoning that dark small print on a light panel is a common way footnotes
// drop below WCAG contrast. The effect was that in dark mode it matched every
// other slide, and in light mode it alone was a black panel -- so the last
// thing a reader saw was the one thing that did not belong to the design
// system, and the inconsistency was invisible to anyone reviewing in dark mode.
//
// Now bg-panel/text-ink in both, which is Section's default tone. The contrast
// concern was real but it was answered in the wrong place: the fix is that the
// small print here is text-ink/75 rather than a low opacity on a dark ground,
// which clears AA against panel in both themes.
//
// What it loses is its distinctiveness as the closing slide. That is carried
// by the fish backdrop instead -- see content/patterns.js. A texture can mark
// a slide as different without taking it out of the palette.
//
// Props:
//   sources -- array of { label, url }
//   aboutTitle -- heading for the disclaimer block, default "About this data"
//   children -- optional; replaces the default Cyclone-specific
//     disclaimer paragraphs so a page with different data gaps/caveats
//     can say so accurately. Cyclones passes no children.
//   style -- forwarded onto the <footer>
import BackgroundPattern from './BackgroundPattern.jsx'
import { FOOTER_BACKDROP } from '../content/patterns.js'

const YEAR = new Date().getFullYear()

export default function CitationPanel({ sources = [], aboutTitle = 'About this data', children, style }) {
  return (
    <footer
      className="animate-pop-in relative overflow-hidden bg-panel px-6 py-10 text-ink md:py-14"
      style={style}
    >
      <BackgroundPattern backdrop={FOOTER_BACKDROP} />

      {/* .section-content rather than a hand-written max-w-5xl, so the sources
          land on the same left and right edges as every slide above them --
          this footer is not a <Section>, but it is still a slide.

          It also carries the width: 100% this panel needs. A slide that fits
          its window is laid out as a flex column (see the data-fits rule in
          styles/slideshow.css), where `mx-auto` on an auto-width child stops
          meaning "centre a full-width column" and starts meaning "shrink to the
          content and centre that". An explicit width keeps the column the same
          measure in both layouts. */}
      <div className="section-content relative space-y-8 text-sm">
        <div>
          <h2 className="type-eyebrow mb-3 opacity-80">Data sources</h2>
          {sources.length === 0 ? (
            <p className="text-ink/75">No data sources listed yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    rel="noreferrer"
                    className="underline decoration-ink/40 hover:decoration-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="prose-column prose-wide">
          <h2 className="type-eyebrow mb-3 opacity-80">{aboutTitle}</h2>
          {children ?? (
            <>
              {/* Trimmed to a pointer. The gaps, the zero-as-unreported rule and
                  the uneven-reporting finding were five paragraphs of caveat
                  sitting under a list of links; they are the subject of the
                  method slide before this one, and stating them twice made
                  neither slide readable. */}
              <p className="prose-column prose-wide text-ink/85">
                Figures are drawn from official Pacific Data Hub statistics for Solomon Islands,
                Vanuatu, Fiji and Tonga, covering 2013 to 2024. Coverage varies by country and by
                metric, and missing figures are labelled unavailable rather than left blank. How
                the roster was chosen, what the gaps are and where they fall is set out on the
                previous slide.
              </p>

              <p className="prose-column prose-wide prose-short mt-3 text-ink/85">
                This site is illustrative and isn&rsquo;t intended to inform policy, funding, or financial
                decisions.
              </p>
            </>
          )}
        </div>

        <div className="text-xs text-ink/75">
          <p>
            © {YEAR} Aziel Douglas Orihao. Code licensed under MIT (see LICENSE in the repository).
            Underlying datasets belong to their original sources, listed here, under their own
            respective licenses.
          </p>
        </div>
      </div>
    </footer>
  )
}
