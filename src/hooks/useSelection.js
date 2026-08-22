import { useCallback, useState } from 'react'

// "Pick up to two nations to compare" -- owned by the story state hook
// (useStory) and passed down to the map, the ripple chain and the comparison.
//
// The pair is ordered, and the order is load-bearing: it drives which colour a
// nation gets on every chart and which side of the comparison it is drawn on.
// That is why `swap` exists as its own operation rather than being expressed as
// two toggles -- toggling twice would drop a nation out of the comparison and
// back in, replaying every entrance animation on the way past.
export function useSelection() {
  const [selected, setSelected] = useState([])

  const toggle = useCallback((name) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name)
      if (prev.length >= 2) return [prev[1], name] // drop the oldest, keep the newest pair
      return [...prev, name]
    })
  }, [])

  const clear = useCallback(() => setSelected([]), [])

  // Put `name` on one side of the comparison. If it is already on the other
  // side the two are swapped rather than duplicated -- a comparison of a
  // country with itself is not a comparison, and silently refusing the pick
  // would read as a broken control.
  const setAt = useCallback((index, name) => {
    setSelected((prev) => {
      const next = [prev[0] ?? null, prev[1] ?? null]
      const other = index === 0 ? 1 : 0
      if (next[other] === name) next[other] = next[index]
      next[index] = name
      return next.filter(Boolean)
    })
  }, [])

  const swap = useCallback(() => {
    setSelected((prev) => (prev.length === 2 ? [prev[1], prev[0]] : prev))
  }, [])

  return { selected, toggle, clear, setAt, swap }
}

// Copy for each page's aria-live region -- the charts below it update
// silently otherwise. `singleNote` is an optional extra sentence for
// the one-nation case (Cyclones points at its ripple chain).
export function selectionAnnouncement(selected, singleNote = '') {
  if (selected.length === 0) return ''
  if (selected.length === 1) return `${selected[0]} selected.${singleNote ? ` ${singleNote}` : ''}`
  return `Comparing ${selected[0]} and ${selected[1]}.`
}
