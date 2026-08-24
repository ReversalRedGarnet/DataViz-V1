import { flushSync } from 'react-dom'
import { prefersReducedMotion } from './motion.js'

// The one page-change animation for the whole site: a droplet landing at the
// point the reader pressed, rings rippling outward from it, and the incoming
// page fading into view *through* those rings as they dissolve, rather than
// only appearing once the ripple has finished playing. Used for both jobs
// that change what is on screen -- the deck moving between slides
// (useDeck.js) and the theme flipping (ThemeToggle.jsx) -- so a reader sees
// the same motion mean the same thing everywhere, rather than a page-slide
// here and a colour-wipe there.
//
// Built on plain WAAPI (opacity + transform), not the View Transitions API.
// That API would have done the old/new crossfade for free, but only in
// Chromium, and this site's audience is exactly the readers a Chromium-only
// effect quietly excludes. This version runs identically in every evergreen
// browser, which is what "the standard transition throughout the entire
// site" has to mean if it is going to mean it for everyone.
//
// The sequence, all layered above the live page in a throwaway overlay:
//   1. Rings start rippling outward from the origin, and a curtain the
//      colour of the current page fades quickly to full opacity over it --
//      the visible "drop landing". Both start in the same frame.
//   2. The instant the curtain reaches full opacity, `run` fires inside
//      flushSync, swapping the page underneath while the curtain still
//      hides it -- a reader never sees a page mutate mid-frame.
//   3. The curtain immediately starts fading back to transparent while the
//      rings are still rippling. Because the swap already happened, that
//      fade *is* the incoming page gradually showing through the ripple --
//      it overlaps the rings instead of waiting for them, so the new page
//      arrives while the water is still moving rather than only once it
//      has settled.
//   4. The rings linger for only a moment after the curtain has fully
//      faded, so the ripple is what dissolves last -- but the new page is
//      already fully visible underneath it by then.
const RING_COUNT = 3
const RING_STAGGER_MS = 65
const RING_DURATION_MS = 500
const RING_EASING = 'cubic-bezier(0.19, 0.72, 0.3, 1)' // the site's existing ripple-out curve, see animations.css
const CURTAIN_IN_MS = 90
const CURTAIN_OUT_MS = 480
const CURTAIN_IN_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'
const CURTAIN_OUT_EASING = 'ease-out'

// ONE DROP AT A TIME.
//
// A held arrow key repeats about every 30ms; the sequence below runs for at
// least 570ms. Without this, paging quickly stacked several fixed overlays,
// each with three animating rings, a full-viewport curtain and its own deferred
// flushSync -- so the reader got a pile of opaque curtains rather than the one
// clean drop the comment above describes, and several forced synchronous
// renders in quick succession.
//
// A second request while one is in flight still changes the page, immediately
// and without animation. Refusing to move would be worse than moving plainly.
let inFlight = false

function radiusToFarthestCorner(x, y) {
  return Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
}

function buildOverlay(x, y, radius) {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;'

  const curtain = document.createElement('div')
  // Matches the live page at the moment of the drop, so hiding the swap
  // behind it reads as continuous rather than a flash of some third colour
  // -- and it is correct for either theme without this module needing to
  // know which one is active.
  const bg = getComputedStyle(document.body).backgroundColor
  curtain.style.cssText = `position:absolute;inset:0;background:${bg};opacity:0;`
  host.appendChild(curtain)

  const rings = []
  for (let i = 0; i < RING_COUNT; i++) {
    const ring = document.createElement('div')
    const size = radius * 2
    ring.style.cssText = `
      position:absolute; left:${x}px; top:${y}px;
      width:${size}px; height:${size}px; margin:${-radius}px 0 0 ${-radius}px;
      border-radius:9999px; border:1.5px solid rgb(var(--color-accent));
      opacity:0;
    `
    host.appendChild(ring)
    rings.push(ring)
  }

  document.body.appendChild(host)
  return { host, curtain, rings }
}

function waapi(el, keyframes, options) {
  try {
    return el.animate(keyframes, options).finished.catch(() => {})
  } catch {
    return Promise.resolve()
  }
}

// Props:
//   x, y -- the drop's origin in viewport coordinates. Omit both for a
//     keyboard- or history-driven change, which has no point to originate
//     from; it falls back to the viewport's centre.
//   run -- the state change to make once the reader can no longer see the
//     page underneath. Called synchronously inside flushSync.
export function runRippleTransition({ x, y, run }) {
  if (typeof document === 'undefined' || prefersReducedMotion() || inFlight) {
    run()
    return
  }

  inFlight = true

  const originX = x ?? window.innerWidth / 2
  const originY = y ?? window.innerHeight / 2
  const radius = radiusToFarthestCorner(originX, originY)
  const { host, curtain, rings } = buildOverlay(originX, originY, radius)

  // Started before the curtain's swap-and-reveal below, so the ripple is
  // already moving by the time the page starts fading through it.
  const ringsDone = Promise.all(
    rings.map((ring, i) =>
      waapi(
        ring,
        [
          { opacity: 0.5, transform: 'scale(0.08)' },
          { opacity: 0, transform: 'scale(1)' },
        ],
        { duration: RING_DURATION_MS, delay: i * RING_STAGGER_MS, easing: RING_EASING, fill: 'both' }
      )
    )
  )

  const curtainDone = waapi(curtain, [{ opacity: 0 }, { opacity: 1 }], {
    duration: CURTAIN_IN_MS,
    easing: CURTAIN_IN_EASING,
    fill: 'forwards',
  }).then(() => {
    flushSync(run)
    return waapi(curtain, [{ opacity: 1 }, { opacity: 0 }], { duration: CURTAIN_OUT_MS, easing: CURTAIN_OUT_EASING, fill: 'forwards' })
  })

  // RING_DURATION_MS (plus its stagger) deliberately outlasts the curtain's
  // full in-then-out run by a beat -- see the module comment -- so cleanup
  // waits for whichever finishes last. Tearing the overlay down while a
  // ring is still mid-fade is exactly the flicker this is supposed to avoid.
  Promise.all([curtainDone, ringsDone]).finally(() => {
    host.remove()
    inFlight = false
  })
}
