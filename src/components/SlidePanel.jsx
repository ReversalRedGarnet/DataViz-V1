import { useEffect, useRef, useState } from 'react'
import { ScrollRootProvider } from '../hooks/useScrollRoot.jsx'
import SlideFooter from './SlideFooter.jsx'
import { usePanelFit, usePanelProgress } from '../hooks/usePanelMetrics.js'

// One slide: a bounded scroll region with the deck's footer pinned beneath it.
//
// Props:
//   section -- { id, element, requires }
//   index, total -- position in the deck
//   isActive -- whether this panel is on stage
//   nextLabel, prevLabel -- footer destinations
//   onNavigate -- (index) => void
//   onProgress -- (fraction 0..1) => void, this panel's own scroll
//   onOverflow -- (bool) => void, whether there is more below the fold
export default function SlidePanel({
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
