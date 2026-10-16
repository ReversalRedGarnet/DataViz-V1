// The OS-level "reduce motion" setting, in one place so every D3 transition in
// the app checks it the same way. Exported as well as used below, because a
// few callers need to skip a whole mechanism rather than shorten it: the
// ripple page transition builds a throwaway overlay it should not create at
// all, and the header's canoe paints its position directly instead of easing
// toward it.
//
// Also true for the duration of a withoutMotion() call, below.
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  if (motionSuppressed > 0) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Runs `fn` as if the reader had asked for reduced motion: every
// motionDuration() inside it returns 0, so D3 transitions scheduled during
// the call jump to their end state. For redraws nobody asked to watch -- a
// system theme change (hooks/useTheme.jsx) -- not for the reader's own
// actions. Synchronous only: it covers what `fn` schedules before returning.
let motionSuppressed = 0

export function withoutMotion(fn) {
  motionSuppressed += 1
  try {
    return fn()
  } finally {
    motionSuppressed -= 1
  }
}

// Returns `ms`, or 0 if the user has asked for reduced motion.
export function motionDuration(ms) {
  return prefersReducedMotion() ? 0 : ms
}
