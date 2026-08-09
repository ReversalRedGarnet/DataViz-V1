import { useCallback, useEffect, useRef, useState } from 'react'

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

    // Clamp so the ~200px box doesn't run off either edge on a phone.
    const rawX = clientX - containerRect.left
    const x = Math.min(Math.max(rawX, 90), Math.max(containerRect.width - 90, 90))
    const y = clientY - containerRect.top

    setTooltip({ x, y, content })
  }, [])

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
