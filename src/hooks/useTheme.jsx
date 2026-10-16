import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { withoutMotion } from '../utils/motion.js'

// Site-wide light/dark state. Context rather than props because every
// D3-drawing component on every page reads it (axis text and the wave divider
// need a real colour string, not a Tailwind class -- see theme.js).
//
// The visitor's system setting is the only source. There is no toggle and no
// stored choice: a 'ripple-theme' value left in localStorage by the old toggle
// is never read, so it cannot override the system. The inline script in
// index.html applies the same query to <html> before first paint; keep the two
// in step.
const ThemeContext = createContext(null)

const DARK_QUERY = '(prefers-color-scheme: dark)'

// Synchronous, so the first render -- and with it every chart's first draw --
// already has the theme the inline script painted, rather than drawing light
// and redrawing dark a frame later.
function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function applyThemeClass(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

// A LIVE CHANGE SWITCHES INSTANTLY. Nobody pressed anything, so there is
// nothing for a transition to answer, and a page easing between palettes
// reads as a glitch. Two kinds of motion would otherwise play:
//
// - CSS transitions on colour (every `transition-colors` control). A style
//   element turns them off for the one frame of the swap; reading computed
//   style forces the new colours to apply while it is in place.
// - D3 transitions. Charts redraw and the map recolours when `theme` changes,
//   and their entrance animations would replay. flushSync commits the new
//   theme -- render and effects -- before it returns, so every draw it causes
//   runs inside withoutMotion and lands on its final state.
function switchTheme(theme, setTheme) {
  const style = document.createElement('style')
  style.textContent = '*,*::before,*::after{transition:none!important}'
  document.head.appendChild(style)
  applyThemeClass(theme)
  withoutMotion(() => flushSync(() => setTheme(theme)))
  void window.getComputedStyle(document.body).backgroundColor
  // Removed on the next frame, after the new colours are painted, so hover
  // and other transitions work as before.
  requestAnimationFrame(() => style.remove())
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(systemTheme)

  // Normally a no-op: the inline script has already set the class.
  useLayoutEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  useEffect(() => {
    if (!window.matchMedia) return
    const list = window.matchMedia(DARK_QUERY)
    const onChange = (event) => switchTheme(event.matches ? 'dark' : 'light', setTheme)
    // addListener is the Safari <14 spelling, as in useMediaQuery.js.
    if (list.addEventListener) list.addEventListener('change', onChange)
    else list.addListener(onChange)
    // Catches a change in the moment between the first render and this
    // listener existing; a no-op otherwise.
    setTheme(systemTheme())
    return () => {
      if (list.removeEventListener) list.removeEventListener('change', onChange)
      else list.removeListener(onChange)
    }
  }, [])

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}

// Throws rather than defaulting: a chart quietly rendering in the wrong
// palette is far harder to spot than an error at the call site.
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
