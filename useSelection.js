import { useState } from 'react'

// "Pick up to two nations to compare" -- owned by each hazard page and passed
// down to its map and comparison sections.
export function useSelection() {
  const [selected, setSelected] = useState([])

  function toggle(name) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name)
      if (prev.length >= 2) return [prev[1], name] // drop the oldest, keep the newest pair
      return [...prev, name]
    })
  }

  function clear() {
    setSelected([])
  }

  return { selected, toggle, clear }
}

// Copy for each page's aria-live region -- the charts below it update
// silently otherwise. `singleNote` is an optional extra sentence for
// the one-nation case (Cyclones points at its ripple chain).
export function selectionAnnouncement(selected, singleNote = '') {
  if (selected.length === 0) return ''
  if (selected.length === 1) return `${selected[0]} selected.${singleNote ? ` ${singleNote}` : ''}`
  return `Comparing ${selected[0]} and ${selected[1]}.`
}
