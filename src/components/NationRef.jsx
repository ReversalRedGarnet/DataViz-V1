import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { nationLabel } from '../content/nations.js'

// A COUNTRY NAMED IN A SENTENCE, AS A CONTROL.
//
// The highlight already existed and already reached every chart on the page --
// see hooks/useNationHighlight.jsx. What it did not reach was prose. Every
// handle on it was a chip, a pin or a legend swatch: a control sitting BESIDE
// the argument, in a row of its own, which the reader has to notice, decode and
// then map back onto the sentence that made them curious.
//
// This closes that gap. "Solomon Islands sits last on both" is the claim the
// charts underneath are evidence for, so the words "Solomon Islands" in that
// sentence are the natural place to press. The reader does not have to leave
// the sentence to test it.
//
// WHY A BUTTON AND NOT A SPAN. It does something on press, so it is in the tab
// order, it announces itself, and it works on a touch screen -- where there is
// no pointer to rest and a hover-only handle is no handle at all. Same
// reasoning as the hero's nation nodes.
//
// The press toggles the pin, matching SeriesLegend: press to hold the thread,
// press again to let go. Hover and focus set the transient highlight, which
// wins while it lasts and then falls back to the pin.
//
// TYPOGRAPHY IS DELIBERATELY QUIET. A dotted underline in the accent, and
// nothing else -- no colour change to the word itself at rest. These appear
// mid-paragraph, several to a sentence, and anything louder turns a paragraph
// into a row of links with prose in between. The word has to still read as a
// word.
//
// `nation` is always the canonical (English) name -- the join key every chart
// and selection on the site already uses. `children`, when passed, is taken
// as-is (a caller supplying its own text already knows what language it's
// in); the default display falls back to nationLabel(nation, language) rather
// than the raw nation prop, so an un-overridden reference still shows the
// right language.
export default function NationRef({ nation, children, className = '' }) {
  const { setHighlight, pinned, setPinned } = useNationHighlight()
  const { language } = useLanguage()
  const isPinned = pinned === nation

  return (
    <button
      type="button"
      aria-pressed={isPinned}
      onClick={() => setPinned((p) => (p === nation ? null : nation))}
      {...highlightHandlers(nation, setHighlight)}
      className={`nation-ref ${isPinned ? 'is-pinned' : ''} ${className}`}
    >
      {children ?? nationLabel(nation, language)}
    </button>
  )
}

// The same thing for a list of countries, with the commas and the final "and"
// OUTSIDE the buttons.
//
// This is the whole reason the helper exists rather than each call site mapping
// over NationRef itself. `{list.map(n => <NationRef .../>)}` with a separator
// between them puts the punctuation inside the flow of controls, and a screen
// reader then reads ", " as part of a button's accessible name. It also lets a
// line break fall inside a country's name, which looks like a rendering fault.
//
// `join` is the separator for all but the last gap; `last` is the final one.
// Defaulted per language rather than a fixed English string, so a call site
// that doesn't override them (RippleChain.jsx) still gets "Fiji, Tonga and
// Vanuatu" in English and "Fidji, Tonga et Vanuatu" in French -- no serial
// comma either way, matching the prose elsewhere on the site. A call site
// that wants uniform commas throughout (ContextPanel.jsx, for a ranked list
// rather than a grouped one) still overrides both explicitly.
const DEFAULT_LAST = { en: ' and ', fr: ' et ' }

export function NationRefList({ nations, join = ', ', last }) {
  const { language } = useLanguage()
  const resolvedLast = last ?? DEFAULT_LAST[language]
  return nations.map((nation, i) => (
    <span key={nation}>
      {i > 0 && (i === nations.length - 1 ? resolvedLast : join)}
      <NationRef nation={nation} />
    </span>
  ))
}
