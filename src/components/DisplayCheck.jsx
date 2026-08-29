import { useEffect, useState } from 'react'
import { useViewportFit, MIN_WIDTH, MIN_HEIGHT } from '../hooks/useViewportFit.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

const STRINGS = {
  en: {
    largerWindow: 'a larger window',
    widerWindow: 'a wider window',
    tallerWindow: 'a taller window',
    bestIn: 'This deck is best in',
    around: 'around',
    orMore: 'or more. Everything still works at this size.',
    dismiss: 'Dismiss display size notice',
  },
  fr: {
    largerWindow: 'une fenêtre plus grande',
    widerWindow: 'une fenêtre plus large',
    tallerWindow: 'une fenêtre plus haute',
    bestIn: 'Ce diaporama est optimisé pour',
    around: 'environ',
    orMore: 'ou plus. Tout fonctionne encore à cette taille.',
    dismiss: "Ignorer l'avis de taille d'affichage",
  },
}

/*
  A one-line notice for readers whose viewport is outside the range the deck was
  built for. See hooks/useViewportFit.js for where that range comes from -- it is
  measured, and both numbers are breakpoints the stylesheets already use.

  IT IS A NOTICE AND NOTHING ELSE. No overlay, no backdrop, no focus trap, no
  gate in front of the content. Every slide, control and chart stays exactly as
  reachable with this on screen as without it, and a reader who ignores it
  forever loses nothing. A site that decides on a reader's behalf that their
  screen disqualifies them is worse than a site that just renders small.

  DISMISSAL LASTS THE SESSION, and sessionStorage is the right store for exactly
  that reason. localStorage would be a promise this component cannot keep -- the
  answer to "is this window big enough" changes when the window does, so a
  permanent dismissal would silently swallow the notice on a genuinely new
  situation months later. Session scope means a reader who dismisses it is done
  with it for this visit, and a new tab starts fresh.
*/

const DISMISS_KEY = 'ripple:display-check-dismissed'

// Every sessionStorage access is wrapped. Safari in Private Browsing has
// historically thrown on write rather than returning null, and a storage
// exception must not be the thing that takes down the page -- this component is
// the least important thing on it.
function readDismissed() {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function writeDismissed() {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // Storage unavailable. The dismissal still holds for this page view through
    // component state below; it just will not survive a reload. Correct
    // degradation for a notice.
  }
}

export default function DisplayCheck() {
  const { fits, width, height } = useViewportFit()
  const [dismissed, setDismissed] = useState(readDismissed)
  const { language } = useLanguage()
  const t = STRINGS[language]

  // Persist on the way out rather than inside the click handler alone, so the
  // stored flag and the state that hides the notice cannot disagree.
  useEffect(() => {
    if (dismissed) writeDismissed()
  }, [dismissed])

  if (fits || dismissed) return null

  // Name the axis that actually failed. "Best viewed on a larger display" is
  // useless to someone on a 27-inch monitor with a narrow window, and both
  // axes can fail at once.
  const tooNarrow = width < MIN_WIDTH
  const tooShort = height < MIN_HEIGHT
  const reason =
    tooNarrow && tooShort
      ? t.largerWindow
      : tooNarrow
        ? t.widerWindow
        : t.tallerWindow

  return (
    <div
      // polite, not assertive: it is worth saying once when a screen reader
      // next pauses, and never worth interrupting for.
      role="status"
      aria-live="polite"
      className="display-check"
    >
      <p className="display-check-text">
        {t.bestIn}{' '}
        <span className="whitespace-nowrap">{reason}</span> &mdash; {t.around}{' '}
        <span className="whitespace-nowrap tabular-nums">
          {MIN_WIDTH}&times;{MIN_HEIGHT}
        </span>{' '}
        {t.orMore}
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="display-check-dismiss"
        aria-label={t.dismiss}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  )
}
