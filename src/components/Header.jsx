import { useLayoutEffect, useRef } from 'react'
import ScrollProgress from './ScrollProgress.jsx'
import SectionNav from './SectionNav.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import BackgroundPattern from './BackgroundPattern.jsx'
import { HEADER_BACKDROP } from '../content/patterns.js'

// Persistent site header: wordmark, thesis, controls, scroll progress. Fixed
// from the top, since the progress bar has to be visible there.
//
// A plain <header> here (not nested inside <main>) gets the implicit "banner"
// landmark automatically, which is the correct role for persistent site-level
// chrome -- no explicit role attribute needed. The title is deliberately not a
// heading element: Hero already carries the page's one real <h1>, and a second
// would break the single-h1 document outline screen reader users rely on.
//
// Ripple is a single page, so there is no site-level nav row here -- the
// section menu on the right is the only navigation, and it moves within this
// one page. That's the one structural difference from the multi-hazard build
// this header was ported from.
//
// Props:
//   onHeightChange -- (px: number) => void, called with the header's actual
//     rendered height whenever it changes, so App.jsx can give <main> matching
//     padding-top and keep the in-page anchor offset current. Measured rather
//     than hardcoded so it can't drift out of sync with a future copy or
//     font-size change.
export default function Header({ onHeightChange, availableIds }) {
  const headerRef = useRef(null)

  // useLayoutEffect, not useEffect: this measurement drives another element's
  // layout, so it has to run before paint or the hero flashes unpadded under
  // the header for one frame on every load.
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const report = () => onHeightChange(el.offsetHeight)
    report()
    const observer = new ResizeObserver(report)
    observer.observe(el)
    return () => observer.disconnect()
  }, [onHeightChange])

  // No bottom border on the <header>: ScrollProgress now draws that edge
  // itself, as the water the canoe travels on. A border here would double the
  // line the canoe is supposed to be riding.
  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-40 bg-sand shadow-sm">
      {/* No overflow-hidden on the header itself: the section menu below opens
          past its bottom edge and would be clipped by it. The backdrop clips
          itself instead.

          Solid fill, not a translucent bar -- whatever scrolls underneath
          (chart colours, the map's ocean fill) would otherwise show through
          and put the title's contrast at the mercy of content that changes on
          every scroll. */}
      <BackgroundPattern backdrop={HEADER_BACKDROP} />

      <div className="relative mx-auto max-w-5xl px-6 py-3 md:py-3.5">
        {/* Grouped right so they read as controls, not part of the wordmark. */}
        <div className="flex items-start justify-between gap-3 md:items-baseline">
          <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3">
            <a
              href="#top"
              className="rounded font-serif text-2xl font-semibold leading-tight tracking-tight text-ink hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:text-4xl"
            >
              Ripple
            </a>
            <p className="font-serif text-sm italic leading-snug text-ink/70 md:border-l md:border-ink/15 md:pl-3 md:text-lg">
              Climate doesn't create inequality. It reveals it.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <SectionNav availableIds={availableIds} />
            <ThemeToggle />
          </div>
        </div>
      </div>
      {/* -mt pulls the bar up so the waterline lands on the header's edge
          rather than below it; overflow-visible on the svg lets the canoe and
          paddle rise above without being clipped. */}
      <div className="relative -mt-1">
        <ScrollProgress />
      </div>
    </header>
  )
}
