import { useEffect, useRef, useState } from 'react'
import { ScrollRootProvider } from '../hooks/useScrollRoot.jsx'
import SlideFooter from './SlideFooter.jsx'
import SlideEdgeNav from './SlideEdgeNav.jsx'
import { usePanelFit, usePanelProgress } from '../hooks/usePanelMetrics.js'

// One slide: a bounded scroll region with the deck's footer pinned beneath it.
//
// Props:
//   section -- { id, element, requires, chromeless }
//   index, total -- position in the deck (index drives Back/Next targeting)
//   pageNumber -- this panel's footer counter value, or null to hide it
//     entirely (the cover slide has no page number -- see PageSections.jsx)
//   isActive -- whether this panel is on stage
//   nextLabel, prevLabel -- footer destinations
//   onNavigate -- (index) => void
//   onProgress -- (fraction 0..1) => void, this panel's own scroll
//   onOverflow -- (bool) => void, whether there is more below the fold
export default function SlidePanel({
  section,
  index,
  total,
  pageNumber,
  isActive,
  nextLabel,
  prevLabel,
  onNavigate,
  onProgress,
  onOverflow,
}) {
  // The scroll box publishes itself through state rather than a ref, so
  // ScrollRootProvider re-renders once the element exists and every observer
  // inside it binds to the right root. A ref would still be null on the render
  // that matters.
  const [node, setNode] = useState(null)

  const fits = usePanelFit(node, isActive)
  usePanelProgress(node, isActive, onProgress, onOverflow)

  useFocusOnArrival(node, isActive)

  return (
    <div
      id={section.id}
      className="slide-panel"
      data-active={isActive ? 'true' : 'false'}
      // Published on the panel rather than inferred from the active slide, so
      // the rule that keeps content clear of the edge control (see
      // .slide-panel[data-chromeless] in styles/slideshow.css) applies to the
      // panel that has one -- including while it is off stage and being
      // measured, which is when usePanelFit decides whether it centres or
      // scrolls.
      data-chromeless={section.chromeless ? 'true' : undefined}
      // inert keeps Tab out of the off-stage panels; without it the focus ring
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
              footer in the same place. */}
          <div className="slide-scroll" data-fits={fits ? 'true' : 'false'} ref={setNode}>
            {section.element}
          </div>

          {/* A BOOKEND TAKES ONE CONTROL INSTEAD OF THE FOOTER BAR. See
              `chromeless` in App.jsx.

              The branch is on the flag, never on an id: which slides are
              bookends is decided in one place, and this reads that decision
              rather than restating it. Note what does NOT change with it --
              the panel is still mounted, still measured, still keyboard
              navigable through useDeck's window listener. All that moves is
              which control is drawn.

              Direction follows position rather than a third flag: the poem
              opens the deck so it can only go forward, and the sources slide
              closes it so it can only go back. `nextLabel` still supplies the
              forward wording, so the poem's button keeps saying "Begin" from
              Hero's `cue` without that string being written down again. */}
          {section.chromeless ? (
            <SlideEdgeNav
              direction={index === 0 ? 'forward' : 'back'}
              label={index === 0 ? nextLabel : 'Back'}
              index={index}
              onNavigate={onNavigate}
            />
          ) : (
            <SlideFooter
              index={index}
              total={total}
              pageNumber={pageNumber}
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

// Arriving at a panel puts you at its top and moves focus to its heading --
// otherwise a keyboard or screen-reader user pages the deck and nothing they
// can perceive has changed. Skipped on the first activation so the page does
// not steal focus on load.
function useFocusOnArrival(node, isActive) {
  const hasActivated = useRef(false)

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
}
