import { flushSync } from 'react-dom'
import { useTheme } from '../hooks/useTheme.jsx'
import { prefersReducedMotion } from '../utils/motion.js'

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

  // The whole page repaints on a theme change, so the switch is either an
  // abrupt flash or something deliberate. This wipes the new theme in as a
  // circle expanding from the button the reader just pressed, which makes the
  // change feel caused rather than glitched.
  //
  // flushSync inside startViewTransition is required, not stylistic: the
  // browser snapshots the page when the callback returns, and React's default
  // batching would mean it snapshots the old theme.
  //
  // Everything here is progressive. No View Transition support, or a reader
  // who has asked for less motion, and it falls through to a plain toggle.
  function handleClick(event) {
    if (typeof document === 'undefined' || !document.startViewTransition || prefersReducedMotion()) {
      toggleTheme()
      return
    }

    const x = event.clientX
    const y = event.clientY
    // Radius out to the furthest corner, so the circle finishes by covering
    // the viewport rather than stopping short of a corner.
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    document.documentElement.classList.add('theme-sweep')
    const transition = document.startViewTransition(() => flushSync(toggleTheme))

    transition.ready
      .then(() =>
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {
            duration: 480,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        ).finished
      )
      .catch(() => {})
      .finally(() => document.documentElement.classList.remove('theme-sweep'))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`press-target flex h-9 w-9 items-center justify-center rounded-md text-ink hover:bg-ink/5 ${className}`}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
