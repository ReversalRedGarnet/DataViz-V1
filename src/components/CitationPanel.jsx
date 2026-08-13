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
                Vanuatu, Fiji, and Tonga, covering 2013 to 2024. Data coverage varies by country
                and metric — direct disaster economic loss in particular is patchy, tourist
                arrivals are absent for Solomon Islands entirely, and no disaster figures are
                reported for any of these countries after 2022. Missing figures are labelled as
                unavailable rather than left blank without explanation.
              </p>

              <p className="text-sand/85 dark:text-ink/85 mt-3">
                Those gaps are not evenly distributed, and the site treats that as a finding rather
                than a disclaimer. The nations with the fewest weather stations are the same ones
                missing most often from the disaster records — which is why observing capacity is
                charted here alongside the consequences it fails to capture.
              </p>

              <p className="text-sand/85 dark:text-ink/85 mt-3">
                One deliberate departure from the source data: in the people-affected series, a
                figure of exactly zero is treated as unreported and shown as missing. That series
                does not distinguish “nobody was affected” from “nothing was submitted”, and the
                difference is not academic — Vanuatu's official figure for 2015, the year Cyclone
                Pam became the most destructive storm in its history, is zero. The rule is applied
                to every zero in that series rather than only to years a storm is known to have
                struck, so no individual figure is being overridden on our judgement.
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
            Underlying datasets belong to their original sources, listed here, under their own
            respective licenses.
          </p>
        </div>
      </div>
    </footer>
  )
}
