import { useCallback, useEffect, useRef, useState } from 'react'

// Marks a scrolling box with data-overflowing="true" while there is content
// still hidden BELOW its bottom edge.
//
// WHY THIS EXISTS. Hiding scrollbars site-wide took away the only thing telling
// a reader that a locked box had more text below the fold, and these boxes are
// exactly where that matters: a fixed-height panel whose content is a casualty
// figure or a caveat. The replacement is a fade at the bottom edge -- text
// dissolving rather than stopping -- and this is what switches it on.
//
// IT IS A SCROLL QUESTION, NOT A SIZE QUESTION. This first shipped asking only
// "is the content taller than the box", which is true for the whole life of an
// overflowing box -- including once the reader has scrolled to the end. So the
// last line stayed half-dissolved with nothing left below it, which reads as a
// rendering fault rather than as an invitation, and is the one place the
// affordance actively misinforms: it promises more text at the exact moment
// there is none.
//
// The real condition is "is anything hidden below the bottom edge right now",
// which needs scrollTop as well as the two heights. At the bottom the fade
// clears and the final line sets solid.
//
//   const { ref, overflowing } = useOverflowFade([currentStorm])
//   <div className="locked-scroll" ref={ref} data-overflowing={overflowing}>
//
// `deps` re-measures when the content changes, and scrolls the box back to the
// top. Both matter, because these boxes swap their content in place: the same
// panel overflows for one storm and has room to spare for the next, and a box
// left at its previous scroll position starts the next storm's text part-way
// through a sentence.
export function useOverflowFade(deps = []) {
  const ref = useRef(null)
  const [overflowing, setOverflowing] = useState(false)

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    // A pixel of slack: sub-pixel layout rounding leaves scrollHeight a
    // fraction above clientHeight + scrollTop on boxes that are visibly at
    // their end, and without it the fade never quite clears.
    const hiddenBelow = el.scrollHeight - el.clientHeight - el.scrollTop
    setOverflowing(hiddenBelow > 1)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // New content starts at the top. Done before measuring so the first
    // reading is taken at the position the reader will actually see.
    el.scrollTop = 0
    measure()

    // Coalesced into a frame: a trackpad flick fires scroll events far faster
    // than the fade needs to be re-evaluated, and each one would otherwise be
    // a React state update.
    let frame = null
    const onScroll = () => {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        measure()
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    // The content, not only the box: text reflowing to a new height inside a
    // box that never changes size is the common case here.
    if (el.firstElementChild) observer.observe(el.firstElementChild)

    return () => {
      el.removeEventListener('scroll', onScroll)
      observer.disconnect()
      if (frame !== null) cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps])

  return { ref, overflowing }
}
