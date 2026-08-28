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
//   aboutTitle -- heading for the disclaimer block, per-language; default is
//     the standard {en, fr} pair below. Overridden by whatever page mounts
//     this with different data, same shape.
//   children -- optional; replaces the default Cyclone-specific
//     disclaimer paragraphs so a page with different data gaps/caveats
//     can say so accurately. Cyclones passes no children.
//   style -- forwarded onto the <footer>
import BackgroundPattern from './BackgroundPattern.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

const YEAR = new Date().getFullYear()

const DEFAULT_ABOUT_TITLE = { en: 'About this data', fr: 'À propos de ces données' }

const STRINGS = {
  en: {
    dataSources: 'Data sources',
    noSources: 'No data sources listed yet.',
    opensNewTab: ' (opens in a new tab)',
    disclaimer1:
      'Figures are drawn from official Pacific Data Hub statistics for Solomon Islands, Vanuatu, Fiji and Tonga, covering 2013 to 2024. Coverage varies by country and by metric, and missing figures are labelled unavailable rather than left blank. How the roster was chosen, what the gaps are and where they fall is set out on the previous slide.',
    disclaimer2:
      "This site is illustrative and isn\u2019t intended to inform policy, funding, or financial decisions.",
    copyright: (year) =>
      `\u00A9 ${year} Aziel Douglas Orihao. Code licensed under MIT (see LICENSE in the repository). Underlying datasets belong to their original sources, listed here, under their own respective licenses.`,
  },
  fr: {
    dataSources: 'Sources des données',
    noSources: 'Aucune source de données répertoriée pour le moment.',
    opensNewTab: ' (ouvre un nouvel onglet)',
    disclaimer1:
      'Les chiffres proviennent des statistiques officielles du Pacific Data Hub pour les Îles Salomon, Vanuatu, Fidji et Tonga, de 2013 à 2024. La couverture varie selon le pays et l\u2019indicateur, et les chiffres manquants sont indiqués comme non disponibles plutôt que laissés vides. La façon dont la liste des cyclones a été établie, ainsi que la nature et l\u2019emplacement des lacunes, sont expliquées sur la diapositive précédente.',
    disclaimer2:
      "Ce site est illustratif et n\u2019a pas vocation à orienter des décisions de politique publique, de financement ou d\u2019ordre financier.",
    copyright: (year) =>
      `\u00A9 ${year} Aziel Douglas Orihao. Code sous licence MIT (voir LICENSE dans le dépôt). Les jeux de données sous-jacents appartiennent à leurs sources d\u2019origine, listées ci-dessus, sous leurs propres licences respectives.`,
  },
}

export default function CitationPanel({ sources = [], aboutTitle, children, style }) {
  const { language } = useLanguage()
  const t = STRINGS[language]
  const title = aboutTitle ? (aboutTitle[language] ?? aboutTitle.en) : DEFAULT_ABOUT_TITLE[language]

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
        {/* THE SAME PAIR THE POEM CARRIES, AND FOR THE SAME REASON: with the
            header faded out on this bookend too (see `chromeless` in App.jsx),
            neither control is reachable any other way from here. See the note
            in IslanderPoem.jsx -- a reader who set French on slide one still
            wants French here without it having silently reverted, which is
            why this pair exists even though the theme toggle alone was judged
            unnecessary before French existed. */}
        <div className="flex items-center justify-end gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div>
          <h2 className="type-eyebrow mb-3 opacity-80">{t.dataSources}</h2>
          {sources.length === 0 ? (
            <p className="text-ink/75">{t.noSources}</p>
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
                    // THE SAME RING EVERY OTHER CONTROL ON THE SITE USES. These
                    // eighteen links were the one place that fell through to
                    // the browser's default outline -- focusable and visible,
                    // but a different shape and colour from the ring a keyboard
                    // reader had been following for fourteen slides. rounded-sm
                    // and the offset keep the ring off the underline, which
                    // sits close enough to a tight outline to read as one mark.
                    className="rounded-sm underline decoration-ink/40 hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
                  >
                    {s.label}
                    <span className="sr-only">{t.opensNewTab}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="prose-column prose-wide">
          <h2 className="type-eyebrow mb-3 opacity-80">{title}</h2>
          {children ?? (
            <>
              {/* Trimmed to a pointer. The gaps, the zero-as-unreported rule and
                  the uneven-reporting finding were five paragraphs of caveat
                  sitting under a list of links; they are the subject of the
                  method slide before this one, and stating them twice made
                  neither slide readable. */}
              <p className="prose-column prose-wide text-ink/85">{t.disclaimer1}</p>

              <p className="prose-column prose-wide prose-short mt-3 text-ink/85">
                {t.disclaimer2}
              </p>
            </>
          )}
        </div>

        <div className="text-xs text-ink/75">
          <p>{t.copyright(YEAR)}</p>
        </div>
      </div>
    </footer>
  )
}
