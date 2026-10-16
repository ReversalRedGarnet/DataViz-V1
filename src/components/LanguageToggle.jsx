import { useLanguage } from '../hooks/useLanguage.jsx'
import { runRippleTransition } from '../utils/rippleTransition.js'

// A language flip repaints the whole page the same way moving between slides
// does, so it goes through the same ripple-droplet transition (see
// utils/rippleTransition.js) and lands the reader in the same place they
// pressed.
//
// Text rather than an icon: there is no widely legible glyph for "the other
// language", and a flag risks reading as a claim about which country the
// language belongs to rather than which language the page is in. The label
// shows the language a click switches TO -- answering "what does this do"
// rather than "what state am I in", which the rest of the page already answers.
export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  function handleClick(event) {
    runRippleTransition({ x: event.clientX, y: event.clientY, run: toggleLanguage })
  }

  const target = language === 'en' ? 'fr' : 'en'

  // The accessible name starts with the visible "FR"/"EN" (WCAG 2.5.3, label
  // in name): a speech-input user says what they can see, and "click FR" has
  // to match. It is written in the target language, so `lang` says so --
  // otherwise an English voice reads "Passer au français" as English.
  return (
    <button
      type="button"
      onClick={handleClick}
      lang={target}
      aria-label={target === 'fr' ? 'FR — Passer au français' : 'EN — Switch to English'}
      className={`press-target flex h-9 w-9 items-center justify-center rounded-md text-[13px] font-semibold tracking-wide text-ink hover:bg-ink/5`}
    >
      {target.toUpperCase()}
    </button>
  )
}
