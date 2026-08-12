import { useCallback, useEffect, useRef, useState } from 'react'

// Which slide is on stage, plus the three ways a reader can change that:
// the Next/Previous controls, the section menu, and the keyboard.
//
// Deliberately an index into the live sections array rather than an id. The
// array changes shape when a storm is picked -- the gate is replaced by nine
// storm sections at the same position -- and an index means the reader lands on
// the first of the new sections instead of being thrown back to the top.
//
// Left/Right and PageUp/PageDown page the deck. Up/Down are NOT bound: they
// belong to the panel's own internal scroll, and taking them would make a long
// section unreadable by keyboard.
export function useDeck(sections, { enabled = true } = {}) {
  const [active, setActive] = useState(0)
  const count = sections.length
  const countRef = useRef(count)
  countRef.current = count

  const go = useCallback((next) => {
    setActive((current) => {
      const target = typeof next === 'function' ? next(current) : next
      return Math.max(0, Math.min(countRef.current - 1, target))
    })
  }, [])

  const goToId = useCallback(
    (id) => {
      const index = sections.findIndex((s) => s.id === id)
      if (index >= 0) go(index)
    },
    [sections, go]
  )

  // The gate collapses from four sections to twelve when a storm is chosen, and
  // back again when it is cleared. Clearing while deep in the deck would leave
  // `active` pointing past the end of the array at a section that no longer
  // exists, so it is clamped whenever the shape changes.
  useEffect(() => {
    setActive((current) => Math.max(0, Math.min(count - 1, current)))
  }, [count])

  // Deep links, both directions. The id is the same one the section menu and
  // the single-document layout use, so a URL means the same thing in either.
  useEffect(() => {
    if (!enabled) return
    const fromHash = window.location.hash.replace('#', '')
    if (fromHash) goToId(fromHash)
    function onHashChange() {
      const id = window.location.hash.replace('#', '')
      if (id) goToId(id)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
    // Runs once: re-running on every sections change would drag the reader back
    // to the hash's section every time they picked a storm.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const id = sections[active]?.id
    if (!id) return
    // replaceState, not a hash assignment: assigning to location.hash pushes a
    // history entry per slide, so Back would walk the reader through every
    // section they had visited rather than out of the piece.
    window.history.replaceState(null, '', `#${id}`)
  }, [active, sections, enabled])

  useEffect(() => {
    if (!enabled) return
    function onKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (typing) return

      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        go((i) => i + 1)
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        go((i) => i - 1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        go(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        go(countRef.current - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, go])

  return { active, go, goToId, count }
}
