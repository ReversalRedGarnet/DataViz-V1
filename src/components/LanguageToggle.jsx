import { useLanguage } from '../hooks/useLanguage.jsx'
import { runRippleTransition } from '../utils/rippleTransition.js'

// Same convention as ThemeToggle.jsx, deliberately: a language flip repaints
// the whole page the same way a theme flip does, so it goes through the same
// ripple-droplet transition and lands the reader in the same place they
// pressed. Two toggles that behave identically read as one family of control
// rather than two different mechanisms bolted on at different times.
//
// Text rather than an icon, unlike Sun/MoonIcon above it: there is no widely
// legible glyph for "the other language" the way a sun and moon stand for
// light and dark, and a flag risks reading as a claim about which country the
// language belongs to rather than which language the page is in. The label
// shows the language a click switches TO, matching ThemeToggle's rule.
//
// Props:
//   className -- forwarded to the <button>, same reason as ThemeToggle
export default function LanguageToggle({ className = '' }) {
  const { language, toggleLanguage } = useLanguage()

  function handleClick(event) {
    runRippleTransition({ x: event.clientX, y: event.clientY, run: toggleLanguage })
  }

  const target = language === 'en' ? 'fr' : 'en'

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={target === 'fr' ? 'Passer au français' : 'Switch to English'}
      className={`press-target flex h-9 w-9 items-center justify-center rounded-md text-[13px] font-semibold tracking-wide text-ink hover:bg-ink/5 ${className}`}
    >
      {target.toUpperCase()}
    </button>
  )
}
