import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { slug } from '../utils/d3helpers.js'

// Hovering a country anywhere on a page dims every mark that isn't that
// country, on every chart at once. On a page whose whole argument is that one
// storm produced four different outcomes, being able to pull a single thread
// through five charts is the difference between reading them one at a time and
// reading them together.
//
// The marks belong to D3, not to React -- they're appended inside effects and
// React never sees them -- so this reaches for them by class name rather than
// by re-rendering. That also makes it free: dimming is a class toggle and a CSS
// opacity transition, with no chart redrawn and no D3 work at all.
//
// Marks opt in by carrying `nation-mark` plus `nation-<slug>`; anything without
// those is left alone, which is how axes, gridlines and annotations stay at
// full strength while the data dims around them.
//
// There are two ways to hold the thread, and the second one exists because the
// first is a pointer gesture. `highlight` is hover or focus and evaporates; a
// pinned nation is a press and survives, so a reader on a touch screen -- who
// has no pointer to rest anywhere -- can still pull one country out of four.
// The hover wins while it lasts, then falls back to the pin, which is what lets
// someone with Fiji pinned glance at Tonga and come back without re-pressing.
const HighlightContext = createContext({
  highlight: null,
  setHighlight: () => {},
  pinned: null,
  setPinned: () => {},
})

export function NationHighlightProvider({ children }) {
  const [highlight, setHighlight] = useState(null)
  const [pinned, setPinned] = useState(null)
  const rootRef = useRef(null)
  const effective = highlight ?? pinned

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const wanted = effective ? `nation-${slug(effective)}` : null
    for (const mark of root.querySelectorAll('.nation-mark')) {
      mark.classList.toggle('nation-dimmed', Boolean(wanted) && !mark.classList.contains(wanted))
    }
  }, [effective])

  // Cleared on any pointer leaving the subtree, so a hover highlight can't
  // survive the cursor moving to another part of the page. A pin is deliberately
  // not cleared here: it was asked for explicitly and is released the same way.
  const clear = useCallback(() => setHighlight(null), [])
  const value = useMemo(
    () => ({ highlight: effective, setHighlight, pinned, setPinned }),
    [effective, pinned]
  )

  return (
    <HighlightContext.Provider value={value}>
      <div ref={rootRef} onPointerLeave={clear} onBlurCapture={clear}>
        {children}
      </div>
    </HighlightContext.Provider>
  )
}

export function useNationHighlight() {
  return useContext(HighlightContext)
}

// Spread onto anything that names a single country -- a legend chip, a map
// pin, a comparison heading -- to make it a handle for the highlight. Focus is
// wired alongside pointer so the same thread can be pulled with a keyboard.
export function highlightHandlers(nation, setHighlight) {
  return {
    onPointerEnter: () => setHighlight(nation),
    onPointerLeave: () => setHighlight(null),
    onFocus: () => setHighlight(nation),
    onBlur: () => setHighlight(null),
  }
}
