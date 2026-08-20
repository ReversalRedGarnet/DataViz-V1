import { useCallback, useEffect, useRef, useState } from 'react'

// Which slide is on stage, plus the three ways a reader can change that:
// the Next/Previous controls, the section menu, and the keyboard.
//
// Deliberately an index into the live sections array rather than an id. The
// array changes shape when a storm is picked -- ten storm sections appear after
// the timeline -- and an index means the reader stays on the slide they were
// already looking at instead of being thrown back to the top.
//
// Left/Right and PageUp/PageDown page the deck. Up/Down are NOT bound: they
// belong to the panel's own internal scroll, and taking them would make a long
// section unreadable by keyboard.
export function useDeck(sections) {
  const [active, setActive] = useState(0)
  // Which way the deck last moved. The incoming slide's contents animate in
  // from the side the reader came from, so a Back press reads as retracing
  // rather than as more of the same forward motion.
  const [direction, setDirection] = useState(1)
  const count = sections.length
  const countRef = useRef(count)
  countRef.current = count

  // A section carrying `requires` holds the deck at itself until the reader has
  // done what it asks. Enforced here rather than only on the Next button, so
  // the keyboard and the section menu cannot walk around it -- and enforced as
  // a clamp rather than a refusal, so jumping from slide 2 to slide 9 still
  // moves the reader as far as the gate instead of doing nothing.
  const gateRef = useRef([])
  gateRef.current = sections.map((s) => Boolean(s.requires))

  const go = useCallback((next) => {
    setActive((current) => {
      const target = Math.max(0, Math.min(countRef.current - 1, typeof next === 'function' ? next(current) : next))
      if (target < current) {
        setDirection(-1)
        return target
      }
      if (target === current) return target
      for (let i = current; i < target; i += 1) {
        if (gateRef.current[i]) {
          if (i !== current) setDirection(1)
          return i
        }
      }
      setDirection(1)
      return target
    })
  }, [])

  const goToId = useCallback(
    (id) => {
      const index = sections.findIndex((s) => s.id === id)
      if (index >= 0) go(index)
    },
    [sections, go]
  )

  // goToId is rebuilt whenever the sections array changes shape, and the hash
  // listener below is bound once. Without this ref that listener would hold the
  // very first goToId for the life of the page -- the one closed over the
  // two-section deck that exists before a storm is chosen -- so every id from
  // 'storm-journey' onwards would be looked up in an array that does not
  // contain it and quietly do nothing. That is what made a pasted #compare
  // link, and the browser's Back button after paging around, both land on
  // whatever slide happened to be on stage.
  const goToIdRef = useRef(goToId)
  goToIdRef.current = goToId

  // The deck grows from two sections to twelve when a storm is chosen, and
  // collapses again when it is cleared. Clearing while deep in the deck would
  // leave `active` pointing past the end of the array at a section that no
  // longer exists, so it is clamped whenever the shape changes.
  useEffect(() => {
    setActive((current) => Math.max(0, Math.min(count - 1, current)))
  }, [count])

  // Deep links, both directions. The id is the same one the section menu and
  // the single-document layout use, so a URL means the same thing in either.
  useEffect(() => {
    const fromHash = window.location.hash.replace('#', '')
    if (fromHash) goToIdRef.current(fromHash)
    function onHashChange() {
      const id = window.location.hash.replace('#', '')
      if (id) goToIdRef.current(id)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
    // Still runs once -- re-running on every sections change would drag the
    // reader back to the hash's section every time they picked a storm -- but
    // it now calls through the ref above, so "bound once" no longer means
    // "answering with a stale deck".
  }, [])

  useEffect(() => {
    const id = sections[active]?.id
    if (!id) return
    // replaceState, not a hash assignment: assigning to location.hash pushes a
    // history entry per slide, so Back would walk the reader through every
    // section they had visited rather than out of the piece.
    window.history.replaceState(null, '', `#${id}`)
  }, [active, sections])

  useEffect(() => {
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
  }, [go])

  return { active, direction, go, goToId, count }
}
