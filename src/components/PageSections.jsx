import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NationHighlightProvider } from '../hooks/useNationHighlight.jsx'
import { ScrollRootProvider } from '../hooks/useScrollRoot.jsx'
import BackgroundPattern from './BackgroundPattern.jsx'
import { HEADER_BACKDROP } from '../content/patterns.js'

// The deck. Every section of the piece, in order, as slides.
//
// THE RULE THIS FILE EXISTS TO ENFORCE: nothing is ever conditionally rendered.
// All sections are mounted all of the time. The off-stage ones sit in a
// horizontal flex track at full width with live layout -- translated out of
// sight, not removed.
//
// That is not a stylistic preference, it is the whole design. Every chart on
// this site measures a real DOM node (useElementWidth) and waits for a real
// IntersectionObserver callback (useInView) before drawing. An unmounted
// section has no box, so a conditionally-rendered deck would hand every chart a
// width of zero and then rely on an async retry to fix it -- which is precisely
// the failure mode that has produced every rendering bug in this project. The
// boxes stay alive, so the measurement path never changes.
//
// Props:
//   sections -- [{ id, element, label, requires }], in order
//   active -- index of the on-stage section
//   direction -- 1 forward, -1 back; the enter animation reads it
//   onNavigate -- (index) => void
//   onProgress -- (fraction 0..1) => void, the active panel's own scroll
export default function PageSections({ sections, active, direction, onNavigate, onProgress }) {
  // Whether the panel on stage has more below the fold. The document scrollbar
  // is hidden site-wide and the panels hide theirs, so without this nothing on
  // screen says a slide continues past its bottom edge -- and most do.
  const [more, setMore] = useState(false)

  return (
    <NationHighlightProvider>
      <div className="slide-viewport" data-dir={direction < 0 ? 'back' : 'forward'}>
        <div className="slide-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {sections.map((section, i) => (
            <SlidePanel
              key={section.id}
              section={section}
              index={i}
              total={sections.length}
              isActive={i === active}
              nextLabel={sections[i + 1]?.label}
              prevLabel={sections[i - 1]?.label}
              onNavigate={onNavigate}
              onProgress={onProgress}
              onOverflow={setMore}
            />
          ))}
        </div>

        {/* Outside the track, so it holds still while a panel scrolls beneath
            it. aria-hidden because a screen reader is already walking the
            panel's content directly. */}
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
      </div>
    </NationHighlightProvider>
  )
}

function SlidePanel({
  section,
  index,
  total,
  isActive,
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
  const [node, setNode] = useState(null)
  const hasActivated = useRef(false)

  // Arriving at a panel puts you at its top and moves focus to its heading --
  // otherwise a keyboard or screen-reader user pages the deck and nothing they
  // can perceive has changed. Skipped on the first activation so the page does
  // not steal focus on load.
  useEffect(() => {
    if (!isActive || !node) return
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
  }, [isActive, node])

  // Does this panel's content fit inside it? Answered by measurement rather
  // than by a flag on the section, because it is not a property of the section:
  // the same block centres on a desktop and overflows on a laptop, and half of
  // these slides change height as the reader picks countries or a chart draws
  // for the first time. A hand-placed `center` class can only ever be right for
  // one window.
  //
  // Measured for every panel, on stage or off. Off-stage panels have live
  // layout -- the rule this file exists to enforce -- so their boxes are
  // already the right size, and a slide that arrives already centred saves the
  // reader a visible jump on the frame after it lands.
  const [fits, setFits] = useState(false)

  // useLayoutEffect, not useEffect: this measurement decides how the panel is
  // laid out, so it has to resolve before the browser paints. After paint, the
  // first frame of every short slide would show it top-aligned and then snap.
  useLayoutEffect(() => {
    if (!node) return
    let frame = null
    const measure = () => {
      frame = null
      // A pixel of slack. Sub-pixel rounding routinely leaves scrollHeight a
      // fraction above clientHeight on a panel that is plainly not scrolling,
      // and without the tolerance those slides never centre.
      setFits(node.scrollHeight - node.clientHeight <= 1)
    }
    const schedule = () => {
      if (frame == null) frame = requestAnimationFrame(measure)
    }
    // This cannot oscillate, and the reason is worth keeping: the section
    // already fills the panel whenever it fits (`.slide-scroll > *` grows and
    // never shrinks), so centring only repositions content inside a box whose
    // height is unchanged. The measurement that turned centring on therefore
    // reads exactly the same with centring applied.
    const resize = new ResizeObserver(schedule)
    resize.observe(node)
    if (node.firstElementChild) resize.observe(node.firstElementChild)
    measure()
    // Same settle as the progress readout below. A chart that draws on
    // activation changes the answer a few hundred milliseconds after the panel
    // arrives, and nothing resizes an observed box when the growth happens
    // inside a descendant that overflows its own.
    const settle = setTimeout(measure, 720)
    return () => {
      resize.disconnect()
      clearTimeout(settle)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [node, isActive])

  // Only the on-stage panel reports. The others sit wherever the reader last
  // left them and would fight over the readout.
  useEffect(() => {
    if (!isActive || !node) return
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
    // Measured again once the entrance animation has finished. A transform
    // contributes to the scrollable overflow area while it runs, so the first
    // reading is taken against a box that is still moving.
    const settle = setTimeout(report, 720)
    // Content height changes without a scroll event -- picking a second country
    // grows the comparison panel, and a chart drawing for the first time grows
    // whatever holds it.
    const resize = new ResizeObserver(onScroll)
    resize.observe(node)
    if (node.firstElementChild) resize.observe(node.firstElementChild)
    return () => {
      node.removeEventListener('scroll', onScroll)
      resize.disconnect()
      clearTimeout(settle)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [isActive, node, onProgress, onOverflow])

  return (
    <div
      id={section.id}
      className="slide-panel"
      data-active={isActive ? 'true' : 'false'}
      // inert keeps Tab out of the off-stage panels. Without it the focus ring
      // walks off the side of the screen and the reader cannot tell where it
      // went. React 18 does not special-case this attribute, hence the empty
      // string rather than a boolean.
      inert={!isActive ? '' : undefined}
      aria-hidden={!isActive ? 'true' : undefined}
    >
      <ScrollRootProvider node={node}>
        <div className="slide-panel-inner">
          {/* The scroll happens here, one level in, not on the panel itself.
              That is what keeps every slide exactly one screen tall with its
              footer in the same place: overflow belongs to the content region,
              and the frame around it never moves. A section that manages its
              own internal scrolling -- Follow the Storm, with its pinned map --
              fills this box without overflowing it. */}
          <div className="slide-scroll" data-fits={fits ? 'true' : 'false'} ref={setNode}>
            {section.element}
          </div>

          <SlideFooter
            index={index}
            total={total}
            nextLabel={nextLabel}
            prevLabel={prevLabel}
            onNavigate={onNavigate}
            requires={section.requires}
          />
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
// through it, rather than a page with unrelated furniture at each end.
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
              <span className="type-meta block opacity-55">
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

        {nextLabel || requires ? (
          // `requires` holds up the deck until the reader has done the thing
          // the next slides depend on. Shown as the button's own label rather
          // than as a message elsewhere on the page: a disabled control that
          // does not say why is just a broken one.
          //
          // Rendered on `requires` alone, not only on `nextLabel`, because a
          // held slide can legitimately be the last one in the deck -- the
          // timeline is, until a storm is picked, since the sections it gates
          // do not exist yet. Keyed on nextLabel only, that slide would show no
          // forward control at all and read as the end of the piece rather than
          // as a question waiting on an answer.
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
              <span className="type-meta block opacity-55">
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
