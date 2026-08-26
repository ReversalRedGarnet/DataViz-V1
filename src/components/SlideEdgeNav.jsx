// The one control on a chromeless bookend slide, in place of SlideFooter.
//
// WHY THIS EXISTS RATHER THAN A SMALLER SlideFooter. The footer bar is four
// things at once: a Back destination, a Next destination, the "N / total"
// counter, and the held-slide refusal behaviour. A bookend needs exactly one
// of them. Passing four props' worth of nothing into the footer and hiding
// most of what it draws would leave the bar's own chrome -- its sand fill, its
// ripple backdrop, its top shadow -- which is the thing the bookends are
// defined by not having.
//
// It draws one button and nothing else. See .slide-edge-nav in
// styles/slideshow.css: it is positioned against the panel rather than sitting
// in the flex column, so the slide's content runs the panel's full height
// behind it.
//
// Props:
//   direction -- 'forward' | 'back'. Decides which way the arrow points, which
//     side of the panel it sits on, and which index onNavigate is called with.
//   label -- the one word on the button ('Begin', 'Back'). Kept as the visible
//     accessible name rather than an aria-label, so what a screen reader
//     announces and what everyone else reads are the same string.
//   index -- this panel's real position in the deck.
//   onNavigate -- (index, origin?) => void. `origin` is the press point, which
//     runRippleTransition uses to land the drop where the reader pressed --
//     the same contract SlideFooter's buttons use.
export default function SlideEdgeNav({ direction, label, index, onNavigate }) {
  const forward = direction === 'forward'

  return (
    <button
      type="button"
      onClick={(event) =>
        onNavigate(forward ? index + 1 : index - 1, { x: event.clientX, y: event.clientY })
      }
      className={`slide-edge-nav press-target focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
        forward ? 'slide-edge-nav-forward' : 'slide-edge-nav-back'
      }`}
    >
      {/* Arrow after the word going forward and before it going back, so the
          glyph always sits on the side of the label the reader is travelling
          towards. aria-hidden on both: the direction is already carried by the
          word, and "left arrow Back" announces the same thing twice. */}
      {!forward && (
        <span aria-hidden="true" className="deck-btn-arrow">
          &larr;
        </span>
      )}
      <span className="font-medium">{label}</span>
      {forward && (
        <span aria-hidden="true" className="deck-btn-arrow">
          &rarr;
        </span>
      )}
    </button>
  )
}
