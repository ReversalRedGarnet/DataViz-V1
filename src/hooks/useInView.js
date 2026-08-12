import { useCallback, useEffect, useState } from 'react'
import { useScrollRoot } from './useScrollRoot.jsx'

// "Has this element been scrolled into view yet?" Returns [ref, inView].
//
// The charts on this site animate on entrance, and every one of them used to
// play that entrance at mount -- which on a page this long meant most of the
// animation happened several screens below the fold, where nobody saw it. This
// holds the draw until the card is actually on screen.
//
// A callback ref rather than useRef, for the same reason useElementWidth uses
// one: a chart's card is present from the first render but the elements an
// effect wants to observe aren't always, and keying the effect on the node
// itself means mounting the element is what starts the observation.
//
// Latches on by default (`once`), so scrolling back up a page doesn't replay
// every entrance. Anything without IntersectionObserver -- or without a DOM at
// all, which is how the server-rendered check runs -- reports visible
// immediately rather than rendering a page of permanently hidden cards.
// `root` defaults to whatever ScrollRootProvider is above this component --
// the viewport in document layout, the panel's own scroll box in slideshow
// layout. Pass it explicitly to override.
export function useInView({
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.12,
  once = true,
  root: rootOverride,
} = {}) {
  const contextRoot = useScrollRoot()
  const root = rootOverride === undefined ? contextRoot : rootOverride
  const [node, setNode] = useState(null)
  const [inView, setInView] = useState(false)

  const ref = useCallback((element) => setNode(element), [])

  useEffect(() => {
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { root, rootMargin, threshold }
    )
    observer.observe(node)
    return () => observer.disconnect()
    // `root` is a dependency: in slideshow layout it arrives one render after
    // the node does, because the panel publishes its own element via state.
    // Without it here the observer would stay bound to the viewport forever.
  }, [node, root, rootMargin, threshold, once])

  return [ref, inView]
}
