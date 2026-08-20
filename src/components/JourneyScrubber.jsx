import { useRef, useState } from 'react'

// THE STORM, UNDER THE READER'S THUMB.
//
// This replaces a scroll-driven sequence. The old Follow the Storm advanced its
// map by watching which step of a tall column had crossed a band in the middle
// of the viewport -- which worked, and which nobody could see was a control.
// The reader scrolled, something moved, and whether they had caused it was a
// matter of inference. A track with a handle on it says what it is before it is
// touched, works the same way on a phone as on a desktop, and can be driven
// from the keyboard without a scroll container to argue with.
//
// A slider, not a set of buttons, because the thing being chosen is a position
// along a path. It reports itself as one: role="slider" with min, max, now and
// -- the part that matters for a screen reader -- valuetext, so it announces
// "Vanuatu, 6 April 2020" rather than "3".
//
// The stops are discrete on purpose. The roster records documented impact
// points, not a continuous track, so there is nothing between Solomon Islands
// on 3 April and Vanuatu on 6 April to interpolate. Dragging snaps to the
// nearest stop rather than inventing a position the sources do not support --
// section 4.4 of the brief, and the same rule the whole project runs on.
//
// Props:
//   stops -- the selected storm's profile rows, in strike order
//   index -- the current stop
//   onIndex -- (i) => void, writes to the story state
//   label -- accessible name, e.g. "Cyclone Harold's journey"
export default function JourneyScrubber({ stops, index, onIndex, label }) {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const last = Math.max(1, stops.length - 1)
  const fraction = stops.length > 1 ? index / last : 0
  const current = stops[index]

  function indexFromClientX(clientX) {
    const el = trackRef.current
    if (!el) return index
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return index
    const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return Math.round(t * last)
  }

  function onPointerDown(event) {
    // Pointer capture, so a drag that leaves the track keeps steering it. Every
    // slider that does not do this loses the storm the moment the reader's
    // thumb strays off a 6px rail.
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.currentTarget.focus?.()
    setDragging(true)
    onIndex(indexFromClientX(event.clientX))
  }

  function onPointerMove(event) {
    if (!dragging) return
    onIndex(indexFromClientX(event.clientX))
  }

  function endDrag(event) {
    if (!dragging) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setDragging(false)
  }

  // stopPropagation, not only preventDefault. The deck binds Left/Right/Home/
  // End on window to page between slides, and it ignores typing by checking for
  // form elements -- which this is not. Without stopping the event here, an
  // arrow press would move the storm and then throw the reader onto the next
  // slide to watch it happen from somewhere else.
  function onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    let next = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') next = index + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'PageDown') next = index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next == null) return
    event.preventDefault()
    event.stopPropagation()
    onIndex(Math.min(last, Math.max(0, next)))
  }

  return (
    <div className="journey-scrubber">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="type-eyebrow text-accent">Move the storm</span>
        <span className="text-xs tabular-nums opacity-60">
          Stop {index + 1} of {stops.length}
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={index}
        aria-valuetext={current ? `Stop ${index + 1} of ${stops.length}: ${current.name}, ${current.date}` : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        data-dragging={dragging ? 'true' : 'false'}
        className="scrub-track"
      >
        <span aria-hidden="true" className="scrub-rail" />
        <span
          aria-hidden="true"
          className="scrub-fill"
          style={{ transform: `scaleX(${fraction})` }}
        />
        {/* One tick per documented stop, so the reader can see how many there
            are before dragging and where the handle will settle. Harold has
            four; five of the six storms have two. */}
        {stops.map((stop, i) => (
          <span
            key={stop.name}
            aria-hidden="true"
            className={`scrub-tick ${i <= index ? 'is-reached' : ''}`}
            style={{ left: `${stops.length > 1 ? (i / last) * 100 : 0}%` }}
          />
        ))}
        <span
          aria-hidden="true"
          className="scrub-knob-layer"
          style={{ transform: `translateX(${fraction * 100}%)` }}
        >
          <span className="scrub-knob" />
        </span>
      </div>

      {/* The same positions as buttons, outside the slider rather than inside
          it -- a control nested in a slider is a control a screen reader has to
          fight its way into. This is the direct route: the reader who knows
          they want Fiji presses Fiji instead of stepping there. */}
      <ul className="mt-3 flex flex-wrap gap-2">
        {stops.map((stop, i) => (
          <li key={stop.name}>
            <button
              type="button"
              onClick={() => onIndex(i)}
              aria-pressed={i === index}
              className={`press-target min-h-[44px] rounded-full border px-3 py-2 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
                i === index
                  ? 'border-accent bg-accent/10 font-semibold text-accent'
                  : 'border-ink/20 bg-surface/60 hover:border-accent/60'
              }`}
            >
              <span className="mr-1.5 tabular-nums opacity-50">{i + 1}</span>
              {stop.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
