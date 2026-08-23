import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme.jsx'
import { prefersReducedMotion } from '../utils/motion.js'
import { chartTheme } from '../utils/theme.js'

// The scroll readout at the bottom of Header: a canoe travelling along the
// header's own bottom edge, with the distance already covered drawn behind it.
//
// The zig-zag wave this replaced was a second decorative motif competing with
// the header's ripple backdrop and the section dividers, and it visually
// detached the canoe from the header by floating it on a line of its own. Now
// the header's edge IS the water. There is one line, it is the boundary the
// layout already had, and the canoe sits on it.
//
// The canoe is a readout of scroll position, not an animation, so it no more
// needs to respect prefers-reduced-motion than a scrollbar thumb does. What it
// does now respect is smoothness: the position is eased toward its target
// rather than snapped, so a fast flick reads as travel rather than teleporting.
// Just tall enough to hold the canoe and its paddle above the rule it rides.
const BAR_HEIGHT = 26
// The waterline: the canoe's keel sits here, and the travelled/remaining rules
// are drawn along it.
const WATER_Y = 21
const CANOE_SCALE = 0.55

// How quickly the drawn position chases the true scroll position, per frame.
// Low enough to smooth a flick, high enough that it never feels laggy or
// detached from the reader's input.
const EASE = 0.18
// Below this, snap. Otherwise the rAF loop runs forever chasing a fraction of
// a pixel it will never close, keeping the CPU awake on an idle page.
const SETTLE_PX = 0.4

// Hull: shallow crescent, hook at the stern, taller curl at the bow --
// simplified to a silhouette that survives this scale.
const HULL_PATH =
  'M -24,-1 C -23.00,-0.33 -20.67,2.08 -18.00,3.00 C -15.33,3.92 -11.67,4.20 -8.00,4.50 C -4.33,4.80 0.33,4.88 4.00,4.80 C 7.67,4.72 11.33,4.55 14.00,4.00 C 16.67,3.45 18.50,2.50 20.00,1.50 C 21.50,0.50 22.50,-1.42 23.00,-2.00 C 23.42,-2.83 25.33,-5.33 25.50,-7.00 C 25.67,-8.67 24.67,-10.75 24.00,-12.00 C 23.33,-13.25 22.25,-14.33 21.50,-14.50 C 20.75,-14.67 19.83,-13.25 19.50,-13.00 C 18.58,-12.33 16.25,-10.08 14.00,-9.00 C 11.75,-7.92 9.00,-7.08 6.00,-6.50 C 3.00,-5.92 -1.00,-5.75 -4.00,-5.50 C -7.00,-5.25 -9.67,-5.33 -12.00,-5.00 C -14.33,-4.67 -17.00,-3.75 -18.00,-3.50 C -18.42,-3.83 -19.83,-4.92 -20.50,-5.50 C -21.17,-6.08 -21.42,-7.75 -22.00,-7.00 C -22.58,-6.25 -23.67,-2.00 -24.00,-1.00 Z'

// Paddle: grip, shaft and blade, built vertically then rotated into place.
const PADDLE_BLADE_PATH =
  'M -3.6,10 C -4.2,13 -4.2,16.5 -2.6,19.5 C -1.4,21.7 1.4,21.7 2.6,19.5 C 4.2,16.5 4.2,13 3.6,10 C 2.4,7.5 -2.4,7.5 -3.6,10 Z'

// Props:
//   progress -- 0..1, supplied by the deck. Required: the document itself never
//     scrolls (App puts html.is-slides on permanently), so there is nothing
//     left for this to read on its own.
//
//     There used to be a fallback here that watched window.scrollY, with its
//     own rAF throttle and a ResizeObserver on document.body -- around thirty
//     lines that could not run. This component has one call site, Header, which
//     has one call site, App, which always passes a number. It was dead the
//     moment the deck became the only layout.
export default function ScrollProgress({ progress = 0 }) {
  const wrapperRef = useRef(null)
  const canoeRef = useRef(null)
  const wakeRef = useRef(null)
  const leadRef = useRef(null)
  const [width, setWidth] = useState(0)
  const drawnRef = useRef(0)
  const chaseRef = useRef(null)
  const { theme } = useTheme()
  // The wake used to be a hardcoded '#5B8FA3' that stayed identical in dark
  // mode while every other colour on the page flipped. palette.idle is that
  // exact value in light mode and its dark-mode counterpart otherwise, so this
  // is the same picture in one theme and a correct one in the other.
  const { ink, palette } = chartTheme(theme)
  const ocean = palette.idle

  const target = Math.min(1, Math.max(0, progress))

  // The wrapper's own width, not window.innerWidth: innerWidth includes the
  // scrollbar, and this sits in a header laid out against the narrower
  // scrollbar-excluded viewport, so it pushed the page into overflow.
  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    // Floor, not round: rounding up past the true width on a fractional
    // layout reintroduces a 1px overflow.
    const report = () => setWidth(Math.floor(el.getBoundingClientRect().width))
    report()
    const observer = new ResizeObserver(report)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Chase the true position rather than jumping to it, and do it WITHOUT React.
  //
  // This used to call setDrawn() on every frame, which re-rendered the whole
  // Header subtree -- SectionNav, StoryStateBar and ThemeToggle included --
  // sixty times a second for the length of every deck movement, to move one
  // canoe a few pixels. The eased position is not application state; it is an
  // attribute on three SVG nodes. Writing it straight to them through refs is
  // the same picture at none of the cost, and it is the pattern the divergence
  // chart already uses for its own sweep.
  //
  // Runs only while there is a gap to close and stops itself inside SETTLE_PX,
  // so an idle page does no work at all.
  useEffect(() => {
    if (width <= 0) return

    const paint = (value) => {
      const x = value * width
      if (canoeRef.current) {
        // A gentle bob and pitch, driven by distance travelled rather than by
        // time: the canoe rides the water while it moves and sits still when
        // the reader does. Time-driven idle motion would be movement with
        // nothing behind it.
        const bob = Math.sin(value * Math.PI * 9) * 1.1
        const pitch = Math.cos(value * Math.PI * 9) * 2.5
        // Aligns the hull's keel (local y ~= +5) to the waterline rather than
        // the canoe's own (0,0) origin.
        const canoeY = WATER_Y - 5 * CANOE_SCALE
        canoeRef.current.setAttribute(
          'transform',
          `translate(${x},${canoeY + bob}) rotate(${pitch}) scale(${CANOE_SCALE})`
        )
      }
      if (wakeRef.current) wakeRef.current.setAttribute('x2', String(x))
      if (leadRef.current) {
        leadRef.current.setAttribute('x1', String(Math.max(0, x - 26)))
        leadRef.current.setAttribute('x2', String(x))
      }
    }

    if (prefersReducedMotion()) {
      drawnRef.current = target
      paint(target)
      return
    }

    const step = () => {
      const gap = target - drawnRef.current
      if (Math.abs(gap * width) < SETTLE_PX) {
        drawnRef.current = target
        paint(target)
        chaseRef.current = null
        return
      }
      drawnRef.current += gap * EASE
      paint(drawnRef.current)
      chaseRef.current = requestAnimationFrame(step)
    }

    if (chaseRef.current == null) chaseRef.current = requestAnimationFrame(step)
    return () => {
      if (chaseRef.current) {
        cancelAnimationFrame(chaseRef.current)
        chaseRef.current = null
      }
    }
  }, [target, width])

  // The wrapper always renders (ResizeObserver needs its ref); the SVG waits
  // for a real measurement to avoid a flash at zero width. Every position below
  // is a starting value only -- the effect above owns them from the first frame.
  const initialX = drawnRef.current * width

  return (
    <div ref={wrapperRef} className="w-full">
      {width > 0 && (
        <svg
          aria-hidden="true"
          width={width}
          height={BAR_HEIGHT}
          viewBox={`0 0 ${width} ${BAR_HEIGHT}`}
          className="block overflow-visible"
        >
          {/* The water ahead: the header's own bottom edge, unremarkable until
              it has been travelled. */}
          <line
            x1="0"
            x2={width}
            y1={WATER_Y}
            y2={WATER_Y}
            stroke={ink}
            strokeOpacity="0.16"
            strokeWidth="1.5"
          />

          {/* The wake. Thicker and ocean-blue, so distance covered reads at a
              glance without needing a second motif to carry it. */}
          <line
            ref={wakeRef}
            x1="0"
            x2={initialX}
            y1={WATER_Y}
            y2={WATER_Y}
            stroke={ocean}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* A short bright lead into the hull, so the canoe looks like it is
              pulling the wake rather than sitting on top of a line. */}
          <line
            ref={leadRef}
            x1={Math.max(0, initialX - 26)}
            x2={initialX}
            y1={WATER_Y}
            y2={WATER_Y}
            stroke={ocean}
            strokeOpacity="0.45"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <g ref={canoeRef} transform={`translate(${initialX},${WATER_Y - 5 * CANOE_SCALE}) scale(${CANOE_SCALE})`}>
            <path d={HULL_PATH} fill={ink} />
            <g transform="translate(-1,-4) rotate(-32)">
              <ellipse cx="0" cy="-21" rx="1.9" ry="3" fill={ink} />
              <rect x="-1.1" y="-20" width="2.2" height="31" fill={ink} />
              <path d={PADDLE_BLADE_PATH} fill={ink} />
            </g>
          </g>
        </svg>
      )}
    </div>
  )
}
