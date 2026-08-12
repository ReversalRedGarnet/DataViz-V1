import { useEffect, useState } from 'react'

// A media query as React state.
//
// Needed because one piece of behaviour, not just styling, changes at the
// split breakpoint: above 768px the storm journey's step column is its own
// scroll box, and below it the whole panel scrolls instead. The
// IntersectionObserver that tracks the active step has to be told which, and a
// CSS-only answer cannot reach it.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const list = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
