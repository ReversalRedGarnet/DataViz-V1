import { useEffect, useState } from 'react'

// THE FACTOR A FIXED-viewBox SVG IS CURRENTLY BEING DRAWN AT.
//
// WHY THIS EXISTS, and it is the same lesson useElementWidth.js opens with.
// That file's rule is that a fixed viewBox scaled to fit multiplies every value
// in the drawing -- font size, stroke width, point radius -- by whatever ratio
// the container happens to impose, which is why every chart on this site is
// measured first and drawn at real pixel sizes. "11px is 11px in every chart."
//
// The two maps are the exception, and they have to be: both are built once
// inside an async effect, and MapView's is then owned by d3.zoom, so redrawing
// them at a new pixel width on every resize would throw away the reader's pan
// and zoom. They keep their viewBox.
//
// The cost was real. MapView is 700x460 inside a container capped at 30vh on a
// phone: about 200px tall, a scale of 0.435, which rendered its 11px country
// labels at 4.8px and turned an 18-unit tap target into a 15.6px one against
// this project's own stated 44px floor. StormJourney is 800x540 under a 22vh
// cap -- a scale of 0.272, and 12px stop names at 3.3px.
//
// So the geography keeps scaling and the furniture does not: knowing this
// factor lets a map counter-scale its markers and labels so they stay the size
// they were designed at, whatever box they end up in.
//
//   const scale = useViewBoxScale(svgRef, WIDTH, HEIGHT, storm?.id)
//   inner.attr('transform', `scale(${1 / scale})`)
//
// Both dimensions are measured, not just width, because the height cap is
// usually what binds. With preserveAspectRatio="xMidYMid meet" the drawing is
// fitted to whichever axis runs out first, so the true factor is the smaller
// ratio -- taking width alone would over-report it on exactly the small screens
// this is for.
//
// Returns null when there is nothing to measure yet.
export function measureViewBoxScale(node, viewBoxWidth, viewBoxHeight) {
  if (!node) return null
  const rect = node.getBoundingClientRect()
  if (!rect.width || !rect.height) return null
  return Math.min(rect.width / viewBoxWidth, rect.height / viewBoxHeight)
}

// The hook form: the same measurement, kept current as the layout changes.
//
// `key` re-attaches the observer when the element is replaced or arrives late.
// StormJourney renders an empty state instead of its <svg> until a storm is
// chosen, so a mount-only effect would find nothing and never look again.
//
// A map built inside an async effect should NOT wait on this: on a warm
// coastline cache the await resolves in a microtask, possibly before this has
// committed its first value. Such a caller measures the node itself with
// measureViewBoxScale() above and uses this only for what happens afterwards.
export function useViewBoxScale(ref, viewBoxWidth, viewBoxHeight, key) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const measure = () => {
      const next = measureViewBoxScale(node, viewBoxWidth, viewBoxHeight)
      if (next === null) return
      // Only stored when it actually moves. A counter-scale is applied to live
      // D3 selections, so a no-op resize would otherwise rewrite a transform on
      // every marker for no reason.
      setScale((current) => (Math.abs(current - next) < 0.001 ? current : next))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, viewBoxWidth, viewBoxHeight, key])

  return scale
}
