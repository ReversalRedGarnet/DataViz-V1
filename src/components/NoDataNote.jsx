import { useId } from 'react'
import { useLanguage } from '../hooks/useLanguage.jsx'

const EXPLANATION = {
  en: "This metric isn't consistently reported by every country in the official Pacific Data Hub dataset -- smaller nations often have less capacity to compile detailed disaster statistics. As disasters grow more frequent, closing that reporting gap will matter too.",
  fr: "Cet indicateur n\u2019est pas déclaré de façon homogène par tous les pays dans le jeu de données officiel du Pacific Data Hub \u2014 les plus petites nations ont souvent moins de capacité à compiler des statistiques détaillées sur les catastrophes. À mesure que les catastrophes se multiplient, combler cet écart de déclaration comptera aussi.",
}

// Inline "no data available" note, used anywhere a metric is missing for a
// selected nation. The explanation is worded once, here, and shown through the
// real tooltip rather than a native `title` (invisible on touch).
//
// A REAL BUTTON, AND A REAL DESCRIPTION. This used to be a <span tabIndex={0}>
// with pointer and click handlers, no role and no keyboard handler. Two things
// were wrong with that, and the second is the serious one:
//
//   1. A focusable element with no role announces as plain text, and its click
//      handler was unreachable from a keyboard.
//   2. The explanation existed only inside a visual tooltip. A screen-reader
//      user focused this and heard "No data available" and nothing else --
//      never the sentence about smaller nations having less capacity to report,
//      which is not incidental copy. It is the site's central argument, and it
//      was the one place a reader met it first.
//
// aria-describedby onto a visually-hidden copy is what fixes (2): the text is
// in the accessibility tree whether or not the tooltip is on screen.
//
// Props:
//   showTooltip / hideTooltip -- from the nearest useTooltip() call
//   children -- the visible label, e.g. "No data available"
export default function NoDataNote({ showTooltip, hideTooltip, className = '', children }) {
  const describedBy = useId()
  const { language } = useLanguage()
  const explanation = EXPLANATION[language]

  return (
    <>
      <button
        type="button"
        aria-describedby={describedBy}
        className={`data-note underline decoration-dotted decoration-ink/40 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        onPointerEnter={(e) => showTooltip(e, explanation)}
        onPointerLeave={hideTooltip}
        onFocus={(e) => showTooltip(e, explanation)}
        onBlur={hideTooltip}
        onClick={(e) => showTooltip(e, explanation)}
      >
        {children}
      </button>
      <span id={describedBy} className="sr-only">
        {explanation}
      </span>
    </>
  )
}
