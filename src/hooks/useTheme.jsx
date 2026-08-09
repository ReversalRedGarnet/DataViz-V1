import { createContext, useContext, useEffect, useState } from 'react'

// Site-wide light/dark state. Context rather than props because both ends of
// the site need it: Header's toggle sets it, and every D3-drawing component on
// every page reads it (axis text and the wave divider need a real colour
// string, not a Tailwind class -- see theme.js).
const ThemeContext = createContext(null)

// Also read by the inline script in index.html, which applies the same choice
// before first paint. Renaming it here means renaming it there.
const STORAGE_KEY = 'ripple-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // No explicit choice in this browser yet, so follow the OS. Read once: a
  // later manual toggle is written to localStorage and wins from then on.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// Throws rather than defaulting: a chart quietly rendering in the wrong
// palette is far harder to spot than an error at the call site.
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
