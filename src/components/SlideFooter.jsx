import { useState } from 'react'
import BackgroundPattern from './BackgroundPattern.jsx'
import { HEADER_BACKDROP } from '../content/patterns.js'

// The section's own end, and where to go from it. Named destinations rather
// than bare arrows: a reader deciding whether to move on should be able to see
// what they are moving on to.
//
// Built to match the header exactly -- same sand fill, same ripple backdrop,
// same edge shadow -- so the deck reads as one frame with the content moving
// through it rather than a page with unrelated furniture at each end.
//
// Props:
//   index, total -- position readout
//   nextLabel, prevLabel -- destination names
//   onNavigate -- (index) => void
//   requires -- if set, the deck is held here until the reader has done this
export default function SlideFooter({
  index,
  total,
  nextLabel,
  prevLabel,
  onNavigate,
  requires,
}) {
  // A truly disabled button swallows the click, so a reader who presses it
  // gets no answer at all -- and the most likely reason for pressing it is not
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

      {/* On a phone the destination goes above the buttons, not inside them: a
          section called "What Shaped the Difference" cannot fit in a button on
          a 360px screen without truncating it, and a truncated destination is
          worse than none. Desktop keeps the labels in the buttons. */}
      {(nextLabel || requires) && (
        <p className="deck-destination sm:hidden">
          <span className="opacity-55">{requires ? 'To continue' : 'Next'}</span>{' '}
          {requires || nextLabel}
        </p>
      )}

      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-8 sm:py-2.5">
        {prevLabel ? (
          <button
            type="button"
            onClick={() => onNavigate(index - 1)}
            className="deck-btn deck-btn-back"
          >
            <span aria-hidden="true" className="deck-btn-arrow">
              &larr;
            </span>
            <span className="min-w-0 font-medium sm:hidden">Back</span>
            <span className="hidden min-w-0 sm:block">
              <span className="type-meta block opacity-55">Back</span>
              <span className="block truncate font-medium">{prevLabel}</span>
            </span>
          </button>
        ) : (
          <span />
        )}

        <span className="deck-count shrink-0 text-xs tabular-nums opacity-50" aria-hidden="true">
          {index + 1} / {total}
        </span>

        {/* Rendered on `requires` alone, not only on `nextLabel`: a held slide
            can legitimately be the last one in the deck -- the timeline is,
            until a storm is picked, since the sections it gates do not exist
            yet. Keyed on nextLabel only, that slide would show no forward
            control and read as the end of the piece rather than as a question
            waiting on an answer. */}
        {nextLabel || requires ? (
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
            <span className="min-w-0 font-medium sm:hidden">Next</span>
            <span className="hidden min-w-0 sm:block">
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
