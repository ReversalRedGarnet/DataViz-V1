import { useState, useCallback, useEffect } from 'react'

// An element's rendered width in whole CSS pixels, kept current as the layout
// changes. Returns [ref, node, width]; pass `ref` to the element, and use
// `node` wherever you'd otherwise reach for `ref.current`.
//
// This is what lets the charts be drawn in real pixels instead of a fixed
// viewBox scaled to fit. With a fixed viewBox, every value in the drawing --
// font size, stroke width, point radius, margin -- gets multiplied by whatever
// ratio the container happens to impose, so the same `font-size: 9` came out
// at 12px in a half-width card and 33px in a full-width one. Measuring first
// and drawing at that width means 11px is 11px in every chart on the site.
//
// A callback ref rather than a plain useRef, deliberately: a chart's <svg> is
// only rendered once it has data, so an effect keyed on a ref object would run
// while `current` was still null and never attach an observer when the element
// finally appeared. Keying on the node itself means mounting the element is
// what starts the measurement.
//
// Width is floored to an integer so a fractional layout can't loop the
// observer, and only stored when it actually changes, so a chart doesn't
// redraw -- and replay its entrance -- on a no-op resize.
export function useElementWidth() {
  const [node, setNode] = useState(null)
  const [width, setWidth] = useState(0)

  const ref = useCallback((element) => setNode(element), [])

  useEffect(() => {
    if (!node) return

    const observer = new ResizeObserver(() => {
      const next = Math.floor(node.getBoundingClientRect().width)
      setWidth((current) => (current === next ? current : next))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return [ref, node, width]
}
