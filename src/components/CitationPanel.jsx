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
// Now bg-panel/text-ink in both, which is what every other slide paints. The
// contrast concern was real but it was answered in the wrong place: the fix is
// that the small print here is text-ink/75 rather than a low opacity on a dark
// ground, which clears AA against panel in both themes.
//
// What it loses is its distinctiveness as the closing slide. It is not bought
// back with a texture of its own: this panel once carried the site's only
// edge-to-edge fish tile for that job, which marked it as different by putting
// it outside the system every other slide belongs to. It now paints the same
// scatter backdrop as the twelve slides before it. Being last is what makes it
// the closing slide.
//
// Props:
//   sources -- array of { label, url }
//   aboutTitle -- heading for the disclaimer block, default "About this data"
//   children -- optional; replaces the default Cyclone-specific
//     disclaimer paragraphs so a page with different data gaps/caveats
//     can say so accurately. Cyclones passes no children.
//   style -- forwarded onto the <footer>
import BackgroundPattern from './BackgroundPattern.jsx'
import { scatterBackdrop } from '../content/patterns.js'

const YEAR = new Date().getFullYear()

export default function CitationPanel({ sources = [], aboutTitle = 'About this data', children, style }) {
  return (
    <footer
      className="animate-pop-in relative overflow-hidden bg-panel px-6 py-10 text-ink md:py-14"
      style={style}
    >
      {/* Seeded 'sources', matching this slide's id in App.jsx -- the same
          convention every Section on the site follows, so the scatter here is
          reproducible and distinct from the method slide's next door. */}
      <BackgroundPattern backdrop={scatterBackdrop('sources')} />

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
                  {/* A new tab, and that is about state rather than habit.
                      Following a citation in place unloads the deck, and coming
                      back lands on a cold page -- a pasted hash cannot restore
                      a storm-gated section, because with no storm chosen those
                      sections do not exist (see useDeck). The reader's storm,
                      country pair, scrubber position and open ripple link all
                      go. Checking a source is exactly what a methods-forward
                      site should encourage, so it should not cost the reader
                      everything they had assembled.

                      noopener is load-bearing only now that there is a target;
                      before, it was doing nothing. */}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-ink/40 hover:decoration-ink"
                  >
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
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
