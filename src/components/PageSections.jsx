import { Fragment, cloneElement, useEffect, useRef, useState } from 'react'
import PacificBorder from './PacificBorder.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { sectionColorsFor } from '../utils/theme.js'
import { delayStyle } from '../utils/motion.js'
import { NationHighlightProvider } from '../hooks/useNationHighlight.jsx'
import { ScrollRootProvider } from '../hooks/useScrollRoot.jsx'
import BackgroundPattern from './BackgroundPattern.jsx'
import { HEADER_BACKDROP } from '../content/patterns.js'

// Every section of the piece, in order, rendered two ways from one tree.
//
// THE RULE THIS FILE EXISTS TO ENFORCE: nothing is ever conditionally rendered.
// All sections are mounted all of the time, in both layouts. In slideshow mode
// the off-stage ones sit in a horizontal flex track at full width with live
// layout -- they are translated out of sight, not removed.
//
// That is not a stylistic preference, it is the whole design. Every chart on
// this site measures a real DOM node (useElementWidth) and waits for a real
// IntersectionObserver callback (useInView) before drawing. An unmounted
// section has no box, so a conditionally-rendered slideshow would hand every
// chart a width of zero and then rely on an async retry to fix it -- which is
// precisely the failure mode that has produced every rendering bug in this
// project so far. Keeping the boxes alive means the measurement path never
// changes, and none of that risk is taken on.
//
// It also buys the escape hatch: because both layouts are the same tree, the
// single-document reading mode is a CSS class rather than a different render.
// That is what gives find-in-page, printing and scroll restoration back to a
// reader -- or a judge -- who needs them.
//
// Props:
//   sections -- [{ id, tone, element, label }], in order
//   layout -- 'slides' | 'document'
//   active -- index of the on-stage section (slideshow layout only)
//   onNavigate -- (index) => void, for the in-panel Next/Back controls
//   onProgress -- (fraction 0..1) => void, the active panel's own scroll
//     position, so the canoe can keep reading progress through a long section
export default function PageSections({ sections, layout, active, direction, onNavigate, onProgress }) {
  const { theme } = useTheme()
  const colors = sectionColorsFor(theme)
  const slides = layout === 'slides'

  // Whether the panel currently on stage has more below the fold.
  //
  // This matters more here than it would anywhere else: the browser scrollbar
  // is hidden site-wide (index.css) because the canoe replaced it, and the
  // panels hide theirs too. Between them a reader gets no indication at all
  // that a slide continues past its bottom edge -- and most of them do. Without
  // this hint the piece silently loses half its content to anyone who takes a
  // full-height panel at face value.
  const [more, setMore] = useState(false)

  return (
    <NationHighlightProvider>
      <div
        className={slides ? 'slide-viewport' : 'slide-viewport is-document'}
        // The enter animation reads this: content arrives from the side the
        // reader travelled from, so Back feels like retracing rather than like
        // more forward motion.
        data-dir={direction < 0 ? 'back' : 'forward'}
      >
        <div
          className="slide-track"
          style={slides ? { transform: `translateX(-${active * 100}%)` } : undefined}
        >
          {sections.map((section, i) => (
            <Fragment key={section.id}>
              <SlidePanel
                section={section}
                index={i}
                total={sections.length}
                isActive={!slides || i === active}
                slides={slides}
                nextLabel={sections[i + 1]?.label}
                prevLabel={sections[i - 1]?.label}
                onNavigate={onNavigate}
                onProgress={onProgress}
                onOverflow={setMore}
              />
              {/* The wave divider is a horizontal seam between two stacked
                  backgrounds. Side by side it has nothing to divide, so it is
                  rendered only in document layout. */}
              {!slides && i < sections.length - 1 && (
                <PacificBorder
                  colorAbove={colors[section.tone]}
                  colorBelow={colors[sections[i + 1].tone]}
                />
              )}
            </Fragment>
          ))}
        </div>

        {slides && (
          // Outside the track, so it holds still while a panel scrolls beneath
          // it. aria-hidden because it duplicates no information -- a screen
          // reader is already walking the panel's content directly.
          <div className={more ? 'slide-more is-visible' : 'slide-more'} aria-hidden="true">
            <span className="slide-more-label">More in this section</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </NationHighlightProvider>
  )
}

function SlidePanel({
  section,
  index,
  total,
  isActive,
  slides,
  nextLabel,
  prevLabel,
  onNavigate,
  onProgress,
  onOverflow,
}) {
  // The scroll box publishes itself through state rather than a ref, so the
  // ScrollRootProvider re-renders once the element exists and every observer
  // inside it binds to the right root. A ref would still be null on the render
  // that matters.
  // The scroll box is the panel's inner region now, not the panel itself, so
  // it is what charts must measure their visibility against.
  const [node, setNode] = useState(null)
  const hasActivated = useRef(false)

  // Arriving at a panel puts you at its top and moves focus to its heading --
  // otherwise a keyboard or screen-reader user pages the deck and nothing they
  // can perceive has changed. Skipped on the very first activation, so the page
  // does not steal focus on load.
  useEffect(() => {
    if (!slides || !isActive || !node) return
    if (!hasActivated.current) {
      hasActivated.current = true
      return
    }
    // Guarded: Element.scrollTo is absent in some environments, and the reset
    // is a nicety -- it must not take the focus move down with it.
    if (typeof node.scrollTo === 'function') node.scrollTo({ top: 0 })
    else node.scrollTop = 0
    const heading = node.querySelector('h1, h2')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    }
  }, [slides, isActive, node])

  // Only the on-stage panel reports progress. The others sit wherever the
  // reader last left them and would fight over the readout.
  useEffect(() => {
    if (!slides || !isActive || !node) return
    let frame = null
    const report = () => {
      frame = null
      const scrollable = node.scrollHeight - node.clientHeight
      const fraction = scrollable > 4 ? Math.min(1, Math.max(0, node.scrollTop / scrollable)) : 0
      if (onProgress) onProgress(fraction)
      // Hidden once the reader is near the end: an arrow still pointing down at
      // the bottom of a panel is an instruction that does nothing.
      if (onOverflow) onOverflow(scrollable > 24 && node.scrollTop < scrollable - 24)
    }
    const onScroll = () => {
      if (frame == null) frame = requestAnimationFrame(report)
    }
    node.addEventListener('scroll', onScroll, { passive: true })
    report()
    // Content height changes without a scroll event -- picking a second country
    // grows the comparison panel, and a chart drawing for the first time grows
    // whatever holds it.
    const resize = new ResizeObserver(onScroll)
    resize.observe(node)
    if (node.firstElementChild) resize.observe(node.firstElementChild)
    return () => {
      node.removeEventListener('scroll', onScroll)
      resize.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [slides, isActive, node, onProgress, onOverflow])

  return (
    <div
      id={section.id}
      className="slide-panel"
      data-active={isActive ? 'true' : 'false'}
      // inert keeps Tab out of the off-stage panels. Without it the focus ring
      // walks off the side of the screen and the reader cannot tell where it
      // went. React 18 does not special-case this attribute, hence the empty
      // string rather than a boolean.
      inert={slides && !isActive ? '' : undefined}
      aria-hidden={slides && !isActive ? 'true' : undefined}
    >
      {/* null in document layout, deliberately. The panel is only a scroll
          container while the deck is paging; used as an observer root when it
          is not, the -45%/-10% bands would sit at fixed points inside a very
          tall box and never move past anything. */}
      <ScrollRootProvider node={slides ? node : null}>
        <div className="slide-panel-inner">
          {/* The scroll happens here, one level in, not on the panel itself.
              That is what keeps every slide exactly one screen tall with its
              footer in the same place: overflow belongs to the content region,
              and the frame around it never moves. A section that manages its
              own internal scrolling -- Follow the Storm, with its pinned map --
              simply fills this box without overflowing it. */}
          <div className="slide-scroll" ref={setNode}>
            {cloneElement(section.element, { style: delayStyle(slides ? 0 : index) })}
          </div>

          {slides && (
            <SlideFooter
              index={index}
              total={total}
              nextLabel={nextLabel}
              prevLabel={prevLabel}
              onNavigate={onNavigate}
              requires={section.requires}
            />
          )}
        </div>
      </ScrollRootProvider>
    </div>
  )
}

// The section's own end, and where to go from it. Named destinations rather
// than bare arrows: a reader deciding whether to move on should be able to see
// what they are moving on to.
//
// Built to match the header exactly -- same sand fill, same ripple backdrop,
// same edge shadow -- so the deck reads as one frame with the content moving
// through it, rather than a page with unrelated furniture at each end. Pinned
// to the bottom of the panel rather than scrolling away with the content, for
// the same reason the header is fixed: navigation that disappears when you
// start reading is navigation you have to go looking for.
function SlideFooter({ index, total, nextLabel, prevLabel, onNavigate, requires }) {
  // A truly disabled button swallows the click, so a reader who presses it gets
  // no answer at all -- and the most likely reason for pressing it is not
  // having noticed what it is asking for. aria-disabled keeps it announced as
  // unavailable and still reachable, and the press answers with a shake.
  const [nudging, setNudging] = useState(false)
  const refuse = () => {
    setNudging(false)
    requestAnimationFrame(() => setNudging(true))
  }

  return (
    <div className="slide-footer relative bg-sand shadow-[0_-1px_2px_0_rgb(0_0_0/0.05)]">
      <BackgroundPattern backdrop={HEADER_BACKDROP} />
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-2.5 sm:px-8">
        {prevLabel ? (
          <button
            type="button"
            onClick={() => onNavigate(index - 1)}
            className="deck-btn deck-btn-back"
          >
            <span aria-hidden="true" className="deck-btn-arrow">
              &larr;
            </span>
            <span className="min-w-0">
              <span className="block text-[0.65rem] uppercase tracking-[0.14em] opacity-55">
                Back
              </span>
              <span className="block truncate font-medium">{prevLabel}</span>
            </span>
          </button>
        ) : (
          <span />
        )}

        <span className="deck-count shrink-0 text-xs tabular-nums opacity-50" aria-hidden="true">
          {index + 1} / {total}
        </span>

        {nextLabel ? (
          // `requires` holds up the deck until the reader has done the thing
          // the next slides depend on. Shown as the button's own label rather
          // than as a message elsewhere on the page: a disabled control that
          // does not say why is just a broken one.
          <button
            type="button"
            onClick={() => (requires ? refuse() : onNavigate(index + 1))}
            onAnimationEnd={() => setNudging(false)}
            aria-disabled={Boolean(requires)}
            title={requires || undefined}
            className={`deck-btn deck-btn-next${requires ? ' is-blocked' : ''}${
              nudging ? ' is-refusing' : ''
            }`}
          >
            <span className="min-w-0">
              <span className="block text-[0.65rem] uppercase tracking-[0.14em] opacity-55">
                {requires ? 'To continue' : 'Next'}
              </span>
              <span className="block truncate">{requires || nextLabel}</span>
            </span>
            <span aria-hidden="true" className="deck-btn-arrow">
              {requires ? '\u2014' : '\u2192'}
            </span>
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
