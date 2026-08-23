import { useCallback, useEffect, useRef, useState } from 'react'

// Marks a scrolling box with data-overflowing="true" while its content is
// taller than it is.
//
// WHY THIS EXISTS. Hiding scrollbars site-wide took away the only thing telling
// a reader that a locked box had more text below the fold, and these boxes are
// exactly where that matters: a fixed-height panel whose content is a casualty
// figure or a caveat. The replacement is a fade at the bottom edge -- text
// dissolving rather than stopping -- and this is what switches it on.
//
// It has to be measured rather than assumed, because these boxes swap their
// content under the pointer. The same panel overflows for one storm and has
// room to spare for the next, and a box that dims its last line when nothing
// is hidden below it just looks broken.
//
//   const { ref, overflowing } = useOverflowFade([currentStorm])
//   <div className="locked-scroll" ref={ref} data-overflowing={overflowing}>
//
// `deps` re-measures when the content changes. A ResizeObserver covers the box
// being resized and the content reflowing inside it, but not a swap that
// happens to produce the same height with different text.
export function useOverflowFade(deps = []) {
  const ref = useRef(null)
  const [overflowing, setOverflowing] = useState(false)

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    // A pixel of slack: sub-pixel layout rounding leaves scrollHeight a
    // fraction above clientHeight on boxes that visibly fit.
    setOverflowing(el.scrollHeight - el.clientHeight > 1)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    // The content, not only the box: text reflowing to a new height inside a
    // box that never changes size is the common case here.
    if (el.firstElementChild) observer.observe(el.firstElementChild)

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps])

  return { ref, overflowing }
}
