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

      <div className="relative max-w-5xl mx-auto text-sm space-y-8">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] opacity-80">Data sources</h2>
          {sources.length === 0 ? (
            <p className="text-sand/60 dark:text-ink/60">No data sources listed yet.</p>
          ) : (
            <ul className="max-w-prose space-y-1.5">
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

        <div className="prose-column max-w-prose">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] opacity-80">{aboutTitle}</h2>
          {children ?? (
            <>
              <p className="text-sand/85 dark:text-ink/85">
                Figures are drawn from official Pacific Data Hub statistics for Solomon Islands,
                Vanuatu, Fiji, and Tonga. Data coverage varies by country and metric — direct
                disaster economic loss in particular is patchy for Solomon Islands and Vanuatu in
                the official dataset, and is labelled as unavailable where that's the case rather
                than left blank without explanation.
              </p>
              <p className="text-sand/85 dark:text-ink/85 mt-3">
                Even the data about these disasters is unevenly distributed — some nations have the
                infrastructure to measure and report losses in detail, others don't. As disasters
                grow more frequent, that gap will matter almost as much as the disasters themselves.
              </p>
              <p className="text-sand/85 dark:text-ink/85 mt-3">
                This site is illustrative and isn't intended to inform policy, funding, or financial
                decisions.
              </p>
            </>
          )}
        </div>

        <div className="text-sand/60 dark:text-ink/60 text-xs">
          <p>
            © {YEAR} Aziel Douglas Orihao. Code licensed under MIT (see LICENSE in the repository).
            Underlying datasets belong to their original sources, listed above, under their own
            respective licenses.
          </p>
        </div>
      </div>
    </footer>
  )
}
