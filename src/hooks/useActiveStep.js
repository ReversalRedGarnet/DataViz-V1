import { useEffect, useState } from 'react'

// Which step of a scroll-driven sequence is currently being read. Give the
// container a ref and mark each step with `data-step="N"`; this returns N for
// whichever one is crossing the middle of the viewport.
//
// Steps are found by query rather than by collecting refs so the caller can
// render them however it likes, and so adding a step is a change in one place.
//
// The margins deliberately collapse the observer's root to a thin band across
// the middle of the screen. A full-viewport root would report two or three
// steps intersecting at once and the answer would depend on which entry the
// callback happened to see last; a band shorter than any step can only ever
// hold one.
//
// Without IntersectionObserver, every step is treated as read: the sequence
// then renders in its finished state rather than stuck on step one, which is
// also what the reduced-motion path wants.
// `root` is the scrolling box the steps live in: null for the viewport, or a
// panel element in slideshow layout. The -45% margins still do their job -- they
// collapse the observer's root to a thin band across the middle of whatever
// container is given, and a band shorter than any step can only ever hold one.
export function useActiveStep(container, count, root = null) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    // `container` may be a ref or the element itself. Callers that need the
    // element to also be the observer root have to pass the node, because a
    // ref's .current is still null on the render where the root is chosen.
    const el = container && 'current' in container ? container.current : container
    if (!el) return

    const steps = Array.from(el.querySelectorAll('[data-step]'))
    if (steps.length === 0) return

    if (typeof IntersectionObserver === 'undefined') {
      setActive(steps.length - 1)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.step))
        }
      },
      // This used to read `const root = containerRef.current` a few lines up,
      // shadowing the parameter and making the steps' own container the
      // observer root. That container does not scroll, so the -45% band sat at
      // a fixed place in the list and never moved: a step that had once
      // intersected went on intersecting, entries stopped firing, and the
      // active step could only ever go forwards. Scrolling back up left the
      // map showing the furthest point reached, with no way to reverse it.
      { root: root ?? null, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    steps.forEach((step) => observer.observe(step))
    return () => observer.disconnect()
  }, [container, count, root])

  return active
}
