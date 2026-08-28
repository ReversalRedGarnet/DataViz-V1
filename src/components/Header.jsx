import { useLayoutEffect, useRef } from 'react'
import ScrollProgress from './ScrollProgress.jsx'
import SectionNav from './SectionNav.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import StoryStateBar from './StoryStateBar.jsx'
import BackgroundPattern from './BackgroundPattern.jsx'
import { HEADER_BACKDROP } from '../content/patterns.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

const TAGLINE = {
  en: "Climate doesn\u2019t create inequality. It reveals it.",
  fr: "Le climat ne crée pas les inégalités. Il les révèle.",
}

// Persistent site header: wordmark, thesis, controls, scroll progress. Fixed
// from the top, since the progress bar has to be visible there.
//
// A plain <header> (not nested inside <main>) gets the implicit "banner"
// landmark automatically. The title is deliberately not a heading element:
// Hero carries the page's one real <h1>, and a second would break the single-h1
// outline screen reader users rely on.
//
// Props:
//   hidden -- true while the deck is on a chromeless bookend slide (the poem
//     and the sources slide; see `chromeless` in App.jsx). The header is one
//     fixed element for the whole app rather than per-slide furniture, so it
//     is faded out here rather than unmounted -- unmounting would tear down
//     the ResizeObserver below and report a height of zero, and the height is
//     what the rest of the layout is measured from. Hidden with visibility
//     and opacity for the same reason: `display: none` would stop it having a
//     box to measure. See .site-header in styles/slideshow.css for the fade
//     and for what takes it out of the tab order.
//   onHeightChange -- (px) => void, called with the header's actual rendered
//     height whenever it changes, so App.jsx can give <main> matching padding
//     and keep --header-height current. Measured rather than hardcoded so it
//     cannot drift out of sync with a copy or font-size change.
export default function Header({
  hidden = false,
  onHeightChange,
  availableIds,
  progress,
  onNavigate,
  storm,
  selectedNations,
  onClearNations,
  onReset,
}) {
  const headerRef = useRef(null)
  const { language } = useLanguage()

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
    <header
      ref={headerRef}
      className={`site-header fixed inset-x-0 top-0 z-40 bg-sand shadow-sm${
        hidden ? ' is-hidden' : ''
      }`}
    >
      {/* No overflow-hidden on the header itself: the section menu below opens
          past its bottom edge and would be clipped by it. The backdrop clips
          itself instead.

          Solid fill, not a translucent bar -- whatever scrolls underneath
          (chart colours, the map's ocean fill) would otherwise show through
          and put the title's contrast at the mercy of content that changes on
          every scroll. */}
      <BackgroundPattern backdrop={HEADER_BACKDROP} />

      {/* Tighter on a phone, and tighter again on a short laptop. This bar is
          on screen for all fourteen sections, so every millimetre it takes is
          taken from the content fourteen times -- and on a 768px-tall window it
          was taking about 135 of them. Nothing is removed to buy that back,
          only set smaller; the measured height feeds --header-height through
          the ResizeObserver above. */}
      <div className="relative mx-auto max-w-5xl px-4 py-2 sm:px-6 sm:py-3 md:py-3.5 short:py-2">
        {/* Grouped right so they read as controls, not part of the wordmark. */}
        <div className="flex items-start justify-between gap-3 md:items-baseline">
          <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3">
            <a
              href="#top"
              className="rounded font-serif text-xl font-semibold leading-tight tracking-tight text-ink hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-2xl md:text-4xl short:text-3xl"
            >
              Ripple
            </a>
            {/* Hidden on phones, where it was a second line of italic serif
                repeating on every section for no gain. Hero carries it there
                instead, at the top of the piece. */}
            <p className="hidden font-serif text-sm italic leading-snug text-ink/70 sm:block md:border-l md:border-ink/15 md:pl-3 md:text-lg short:text-base">
              {TAGLINE[language]}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <SectionNav availableIds={availableIds} onNavigate={onNavigate} />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        {/* The reader's current selection, carried across every slide. See
            StoryStateBar.jsx -- it never navigates. */}
        <StoryStateBar
          storm={storm}
          selectedNations={selectedNations}
          onClearNations={onClearNations}
          onReset={onReset}
        />
      </div>
      {/* -mt pulls the bar up so the waterline lands on the header's edge
          rather than below it; overflow-visible on the svg lets the canoe and
          paddle rise above without being clipped. */}
      <div className="relative -mt-1">
        <ScrollProgress progress={progress} />
      </div>
    </header>
  )
}
