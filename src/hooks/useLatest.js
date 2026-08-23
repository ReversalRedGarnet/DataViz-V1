import { useEffect, useRef } from 'react'

// A ref that always holds the current value of something, for effects that
// must NOT re-run when it changes.
//
// WHY THIS PATTERN EXISTS HERE. Both maps and the deck are built once, inside
// an effect whose closures capture whatever was in scope at build time.
// Rebuilding them on every change is not an option -- the interactive map would
// throw away the reader's pan and zoom, and the deck's hash listener would be
// rebound on every storm selection -- so the handlers reach through a ref
// instead of closing over a value directly.
//
// It was written out by hand nine times across MapView, StormJourney, useDeck
// and useChartCanvas, in two different spellings: some assigned during render,
// some in an effect. Assigning during render is a mutation in the render phase,
// which happens to be safe under React 18's synchronous rendering and is
// exactly what breaks under concurrent features and the React Compiler. One
// implementation means one spelling, and it is the correct one.
//
//   const selectedRef = useLatest(selected)
//   // ...inside a build-once effect:
//   .on('click', () => doSomethingWith(selectedRef.current))
//
// Note the deliberate limitation: because the write happens in an effect, the
// ref is one render behind during the render phase itself. Read it from event
// handlers and effects, never from render.
export function useLatest(value) {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
