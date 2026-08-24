// The OS-level "reduce motion" setting, in one place so every D3 transition in
// the app checks it the same way. Exported as well as used below, because a
// few callers need to skip a whole mechanism rather than shorten it: the
// ripple page transition builds a throwaway overlay it should not create at
// all, and the header's canoe paints its position directly instead of easing
// toward it.
//
// The example this used to give was the theme toggle's View Transitions sweep,
// which no longer exists -- that became the ripple transition above.
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Returns `ms`, or 0 if the user has asked for reduced motion.
export function motionDuration(ms) {
  return prefersReducedMotion() ? 0 : ms
}
