// Site footer: sources, copyright, and a plain-language data disclaimer.
//
// bg-ink/text-sand rather than a light panel with low-opacity small print,
// which is a common way footnotes quietly drop below WCAG contrast. In dark
// mode ink becomes the LIGHT tone, so an un-overridden bg-ink would flip the
// footer to a near-white panel -- correct by contrast logic, too bright in
// practice. dark:bg-panel keeps panel's existing relationship to the page.
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
      className="animate-pop-in relative overflow-hidden px-6 py-10 md:py-14 bg-ink text-sand dark:bg-panel dark:text-ink"
      style={style}
    >
      <BackgroundPattern backdrop={FOOTER_BACKDROP} />

      {/* w-full is not decoration. This panel is a slide, and a slide that fits
          its window is laid out as a flex column (see the data-fits rule in
          styles/slideshow.css) -- where `mx-auto` on an auto-width child stops
          meaning "centre a full-width column" and starts meaning "shrink to the
          content and centre that". An explicit width keeps the column the same
          measure in both layouts. */}
      <div className="relative mx-auto w-full max-w-5xl space-y-8 text-sm">
        <div>
          <h2 className="type-eyebrow mb-3 opacity-80">Data sources</h2>
          {sources.length === 0 ? (
            <p className="text-sand/60 dark:text-ink/60">No data sources listed yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    className="underline decoration-sand/40 hover:decoration-sand dark:decoration-ink/40 dark:hover:decoration-ink"
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
              <p className="prose-column prose-wide text-sand/85 dark:text-ink/85">
                Figures are drawn from official Pacific Data Hub statistics for Solomon Islands,
                Vanuatu, Fiji and Tonga, covering 2013 to 2024. Coverage varies by country and by
                metric, and missing figures are labelled unavailable rather than left blank. How
                the roster was chosen, what the gaps are and where they fall is set out on the
                previous slide.
              </p>

              <p className="prose-column prose-wide prose-short text-sand/85 dark:text-ink/85 mt-3">
                This site is illustrative and isn't intended to inform policy, funding, or financial
                decisions.
              </p>
            </>
          )}
        </div>

        <div className="text-sand/60 dark:text-ink/60 text-xs">
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
