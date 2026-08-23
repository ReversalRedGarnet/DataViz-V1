import { useEffect, useRef, useState } from 'react'
import { motionDuration } from '../utils/motion.js'

// Eases a set of displayed numbers from their previous values to new ones.
// Returns the current in-between values, in the order given; format each one
// exactly as you would its target.
//
// This is what turns swapping the second country in the comparison from a blink
// into a movement: the figures travel from one nation's numbers to the other's,
// so the size of the difference is visible in how far they had to go. It only
// does anything when a target changes -- on first mount the values are already
// correct, so nothing counts up from zero.
//
// ONE CLOCK, NOT ONE PER FIGURE. This took a single number until now, and the
// comparison called it three times per metric row -- five metrics, two nations,
// so thirty independent requestAnimationFrame loops each calling its own
// setState on every frame, all animating the same 550ms and all finishing
// together. Taking the whole row at once means one loop and one state update
// per frame instead of thirty, for identical output.
//
// requestAnimationFrame rather than a CSS transition because the thing being
// animated is text content, not a style. motionDuration() returning 0 under
// prefers-reduced-motion collapses this to a plain assignment.
export function useCountUp(targets, duration = 550) {
  const [values, setValues] = useState(targets)
  // What is currently on screen. A tween interrupted part-way -- someone
  // clicking through three countries quickly -- has to resume from here rather
  // than from either endpoint, or the figures jump backwards mid-flight.
  const shownRef = useRef(targets)

  // Compared by content, not by identity: callers build this array inline, so a
  // reference check would restart the tween on every render.
  const key = targets.join('|')

  useEffect(() => {
    const from = shownRef.current
    const ms = motionDuration(duration)

    const unanimatable =
      ms === 0 ||
      targets.length !== from.length ||
      targets.every((t, i) => t === from[i]) ||
      targets.some((t, i) => !Number.isFinite(t) || !Number.isFinite(from[i]))

    if (unanimatable) {
      shownRef.current = targets
      setValues(targets)
      return
    }

    const start = performance.now()
    let frame

    function tick(now) {
      const t = Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from.map((f, i) => f + (targets[i] - f) * eased)
      shownRef.current = next
      setValues(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // `key` stands in for `targets`, which is a fresh array every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, duration])

  return values
}
