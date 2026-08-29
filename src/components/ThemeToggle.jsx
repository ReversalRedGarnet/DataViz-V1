import { useTheme } from '../hooks/useTheme.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { runRippleTransition } from '../utils/rippleTransition.js'

const LABEL = {
  en: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
  fr: { toLight: 'Passer au mode clair', toDark: 'Passer au mode sombre' },
}

// Same stroke convention as MapControlIcon.jsx. Shows the mode a click
// switches TO -- answering "what does this do" rather than "what state am I
// in", which the rest of the page already answers.
const STROKE_WIDTH = 2.25

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="12"
          y1="3.5"
          x2="12"
          y2="5.5"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M 20 14.5 A 8.5 8.5 0 1 1 9.5 4 A 6.8 6.8 0 0 0 20 14.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Props:
//   className -- forwarded to the <button>, so Header.jsx can position
//     this alongside its other controls without this component
//     needing to know its own placement
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const { language } = useLanguage()
  const t = LABEL[language]

  // The whole page repaints on a theme change, so the switch is either an
  // abrupt flash or something deliberate. It goes through the same
  // ripple-droplet transition as moving between slides -- see
  // utils/rippleTransition.js -- landing at the button the reader just
  // pressed, which makes the change feel caused rather than glitched, and
  // read as the same kind of event as paging the deck.
  function handleClick(event) {
    runRippleTransition({ x: event.clientX, y: event.clientY, run: toggleTheme })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={theme === 'dark' ? t.toLight : t.toDark}
      className={`press-target flex h-9 w-9 items-center justify-center rounded-md text-ink hover:bg-ink/5 ${className}`}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
