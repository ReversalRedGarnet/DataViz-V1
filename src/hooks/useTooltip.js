import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TOOLTIP_GAP, TOOLTIP_MAX_WIDTH } from '../components/Tooltip.jsx'

// Where the anchor point has to sit for a box of this height to fit.
//
// Tooltip.jsx draws the box with its bottom edge at `y - TOOLTIP_GAP` and its
// height going upward from there, so the box occupies
// [y - GAP - height, y - GAP]. Keeping that inside [0, containerHeight] is the
// whole of it.
//
// When the container is shorter than the box, min wins and the box overhangs
// the bottom rather than the top -- the same choice the x clamp makes, where a
// container narrower than the box pins the left edge and lets the right run
// over. A tooltip's first line is the one that has to be readable.
function clampY(y, height, containerHeight) {
  const min = TOOLTIP_GAP + height
  const max = containerHeight + TOOLTIP_GAP
  return Math.min(Math.max(y, min), Math.max(max, min))
}

// Tooltip state for anything drawn with D3 (map markers, chart marks) or plain
// React (the "no data" notes).
//
// Native <title>/`title` only appear on mouse hover, never on touch -- a real
// problem on a map whose instruction is "tap a marker". This backs a real HTML
// tooltip covering hover, focus, and tap, reading content off the event so a
// D3 handler bound once on mount still shows what's current when it fires.
//
// containerRef must sit on a `position: relative` element wrapping both the
// source content and <Tooltip />, so their coordinates line up.
export function useTooltip() {
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null) // { x, y, content } | null

  const showTooltip = useCallback((event, content) => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()

    // Focus events carry no clientX/clientY; fall back to the element itself.
    let clientX = event.clientX
    let clientY = event.clientY
    if (clientX === undefined) {
      const targetRect = event.target.getBoundingClientRect()
      clientX = targetRect.left + targetRect.width / 2
      clientY = targetRect.top
    }

    // Clamp so the box doesn't run off either edge on a phone. Half the box's
    // real width, imported rather than guessed -- these were two independent
    // numbers before, and the clamp was the smaller of them.
    const half = TOOLTIP_MAX_WIDTH / 2
    const rawX = clientX - containerRect.left
    const x = Math.min(Math.max(rawX, half), Math.max(containerRect.width - half, half))
    // Vertically unclamped on purpose: the box grows upward from here and its
    // height is whatever the content came to, which is not known until it has
    // been laid out. The effect below does that half, before the browser
    // paints. See clampY.
    const y = clientY - containerRect.top

    setTooltip({ x, y, content })
  }, [])

  // THE OTHER HALF OF THE CLAMP.
  //
  // x could be clamped as the event arrived because the box's width is capped
  // in CSS and imported above. Height has no cap and no ceiling worth
  // guessing: the map's marker tooltips come to 94px, a chart's two-line note
  // to barely a third of that, and a constant big enough for the first would
  // shove the second down off its own mark for no reason. So the box is
  // positioned, measured, and corrected -- and this runs as a layout effect so
  // the correction lands in the same frame and nothing is ever painted out of
  // bounds.
  //
  // Found through the map: a marker in the top row of the nation map put 57px
  // of a 94px box above the container, where it is clipped or lost behind the
  // section above.
  //
  // Reached through the container rather than through a ref of its own. The
  // hook's contract already says <Tooltip /> renders inside containerRef (see
  // above), and threading a ref through would have to be repeated at seven
  // call sites and remembered at the eighth.
  useLayoutEffect(() => {
    if (!tooltip) return
    const container = containerRef.current
    const box = container?.querySelector('[role="tooltip"]')
    if (!box) return

    // offsetHeight, not getBoundingClientRect(). This runs before the pop-in
    // animation's first frame, when the box is still at scale(0.85), so a
    // measured rect would read 15% short. offsetHeight is layout height and
    // ignores the transform.
    //
    // clientHeight for the container, because an absolutely positioned child
    // is placed against its padding box -- the same box `top` is measured in.
    const y = clampY(tooltip.y, box.offsetHeight, container.clientHeight)
    // Idempotent, so this settles on the second pass rather than looping:
    // clamping an already-clamped y returns it unchanged and the guard holds.
    if (y !== tooltip.y) setTooltip((current) => (current ? { ...current, y } : current))
  }, [tooltip])

  const hideTooltip = useCallback(() => setTooltip(null), [])

  // A touch user can't "hover away", so tapping outside dismisses instead.
  useEffect(() => {
    function handlePointerDownOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setTooltip(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDownOutside)
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside)
  }, [])

  return { containerRef, tooltip, showTooltip, hideTooltip }
}
