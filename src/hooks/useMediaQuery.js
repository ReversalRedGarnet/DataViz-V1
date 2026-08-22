import { useEffect, useState } from 'react'

// Match a media query from JavaScript.
//
// This is for the cases where mobile and desktop want genuinely different
// component trees rather than the same tree at different sizes -- the ripple
// chain, which is five charts in a grid on a desktop and one expanded chart in
// an accordion on a phone. CSS can hide the wrong one, but hiding is not the
// same as not building: both sets of D3 charts would still be measured, drawn
// and animated, on the device least able to afford it.
//
// Everything that CAN be done in CSS still is. Reach for this only when the
// difference is structural.
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
    // addListener is the Safari <14 spelling; still worth keeping, since a
    // 2019 iPhone is squarely inside this project's likely audience.
    if (list.addEventListener) list.addEventListener('change', onChange)
    else list.addListener(onChange)
    return () => {
      if (list.removeEventListener) list.removeEventListener('change', onChange)
      else list.removeListener(onChange)
    }
  }, [query])

  return matches
}
