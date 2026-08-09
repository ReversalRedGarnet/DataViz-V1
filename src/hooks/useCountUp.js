import { useEffect, useRef, useState } from 'react'
import { motionDuration } from '../utils/motion.js'

// Eases a displayed number from its previous value to a new one. Returns the
// current in-between value; format it exactly as you would the target.
//
// This is what turns swapping the second country in the comparison from a
// blink into a movement: the figures travel from one nation's numbers to the
// other's, so the size of the difference is visible in how far they had to go.
// It only does anything when the target changes -- on first mount the value is
// already correct, so nothing counts up from zero.
//
// requestAnimationFrame rather than a CSS transition because the thing being
// animated is text content, not a style. motionDuration() returning 0 under
// prefers-reduced-motion collapses this to a plain assignment.
export function useCountUp(target, duration = 550) {
  const [value, setValue] = useState(target)
  // What is currently on screen. A tween interrupted part-way -- someone
  // clicking through three countries quickly -- has to resume from here rather
  // than from either endpoint, or the figures jump backwards mid-flight.
  const shownRef = useRef(target)

  useEffect(() => {
    const from = shownRef.current
    const ms = motionDuration(duration)

    if (from === target || !Number.isFinite(from) || !Number.isFinite(target) || ms === 0) {
      shownRef.current = target
      setValue(target)
      return
    }

    let frame
    const start = performance.now()

    function tick(now) {
      const t = Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      shownRef.current = from + (target - from) * eased
      setValue(shownRef.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
