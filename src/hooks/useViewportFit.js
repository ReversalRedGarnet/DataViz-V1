import { useEffect, useState } from 'react'

/*
  Is the current viewport one the deck was actually designed for?

  MEASURED, NOT GUESSED, and not a device sniff. `navigator.userAgent` answers a
  question nobody here is asking: an iPad at 1024x768 runs the deck layout
  perfectly and a desktop browser dragged down to a quarter of the screen does
  not, so the device the request came from predicts the wrong one of those two.
  Both numbers below are read off `window`.

  WHERE THE TWO THRESHOLDS COME FROM. Neither is a preference. Each is a
  breakpoint this project had already committed to before this file existed, so
  a layout change that moves one has exactly one other place to move it:

    MIN_WIDTH = 768   styles/slideshow.css, `@media (min-width: 768px)`. This is
                      where "Follow the Storm" becomes its pinned two-column
                      layout -- the map held still on the left while the detail
                      column scrolls beside it. Below 768 that slide stacks, and
                      the stacked form is a fallback rather than the design.

    MIN_HEIGHT = 640  styles/slideshow.css, `@media (min-height: 640px)`. The
                      gate on `.section-lock`'s overflow clipping, and its own
                      comment says why it is gated: "below this the content may
                      genuinely not fit, and clipping it would hide the chart
                      rather than tidy the layout." That is the stylesheet
                      stating the point at which it stops guaranteeing a slide
                      fits its panel, which is the same line this check wants.

  MEASURED AGAINST THE REAL DECK. Sweeping Chrome across viewport sizes and
  recording the worst per-panel vertical overflow on the four core slides: at
  1440px wide the hero overflows by 320px at 480px tall, 160px at 640, 32px at
  768, and nothing at 820 and up. At 900px tall it overflows by 393px at 280px
  wide, 171px at 360, 30px at 480, and nothing from 640 up. So the honest "not
  one pixel out of place" floor is around 640x800 -- but a floor set there would
  warn an iPad in portrait, which measured clean on every core slide, and
  warning a viewport that works is the one thing this popup must not do. The
  stylesheet's own two numbers sit just below that and cost nothing that was
  measured to be fine.

  WHAT THIS DELIBERATELY DOES NOT FLAG:

    - Phones in portrait at a sensible size. 390x844 is under MIN_WIDTH and does
      get the notice, because the deck really is a different, lesser thing at
      that width -- but it is a notice, not a wall, and the site stays usable.
    - Large displays. There is no upper bound. Sections are max-width capped
      already, so a 4K window is a wide margin around a correct layout, and a
      popup on it would be noise.
    - `big-picture`, when the sweep above was taken. It overflows its panel at
      every size including 1920x1080 because it is a deliberately scrolling
      slide, so including it would have made every viewport look broken.
*/
export const MIN_WIDTH = 768
export const MIN_HEIGHT = 640

export function viewportFits(width, height) {
  return width >= MIN_WIDTH && height >= MIN_HEIGHT
}

function readViewport() {
  // innerWidth/innerHeight rather than screen.* on purpose: the deck lives in
  // the window, not on the display. A 5K monitor holding a 500px-wide window is
  // a cramped viewport and screen.width would call it roomy.
  if (typeof window === 'undefined') return { width: MIN_WIDTH, height: MIN_HEIGHT }
  return { width: window.innerWidth, height: window.innerHeight }
}

/*
  Returns { fits, width, height }, kept current across resizes and rotations.

  Rechecked rather than read once, because the two ways a reader most often
  arrives outside the range are both live events rather than page loads: turning
  a phone on its side, and dragging a desktop window narrow. A one-shot read at
  mount would miss the first and misreport the second.

  Coalesced through requestAnimationFrame so a drag that fires resize on every
  frame still only does the work once per frame.
*/
export function useViewportFit() {
  const [viewport, setViewport] = useState(readViewport)

  useEffect(() => {
    let frame = 0
    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setViewport(readViewport()))
    }

    // One read on mount as well. useState's initialiser ran during the first
    // render, which on a cold load can be before the browser has settled on a
    // final viewport -- a phone's collapsing address bar moves innerHeight by
    // ~60px shortly after paint, which is enough to cross MIN_HEIGHT.
    onResize()

    window.addEventListener('resize', onResize)
    // Safari on iOS updates innerWidth/innerHeight late enough on rotation that
    // resize alone can report the pre-rotation size; orientationchange fires on
    // the same gesture and the rAF coalescing above makes the overlap free.
    window.addEventListener('orientationchange', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  return { ...viewport, fits: viewportFits(viewport.width, viewport.height) }
}
