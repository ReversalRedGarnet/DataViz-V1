import { formatNationList } from '../utils/formatNationList.js'

// WHAT THE READER HAS CHOSEN, VISIBLE FROM EVERY SLIDE.
//
// The map is on one slide and the charts it drives are on the next three, so
// the reader can no longer see a pick and its consequence at the same time.
// This strip carries the current selection across every slide, says which
// choice the story is waiting on when there isn't one yet, and can clear a
// choice from anywhere.
//
// What it never does is navigate. Moving between slides is the footer's job
// alone -- see the note in App.jsx.
function Action({ children, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="shrink-0 rounded px-1.5 py-1 underline decoration-ink/30 underline-offset-2 opacity-60 transition-opacity duration-150 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </button>
  )
}

// A label and its value, so "Harold 2020" is never mistaken for a heading and
// the two facts the bar carries are told apart by structure rather than only by
// colour.
function Field({ label, children }) {
  return (
    <span className="flex min-w-0 items-baseline gap-1.5">
      <span className="type-eyebrow shrink-0 opacity-45">{label}</span>
      <span className="min-w-0 truncate">{children}</span>
    </span>
  )
}

export default function StoryStateBar({ storm, selectedNations, onClearNations, onReset }) {
  const nations = selectedNations ?? []

  return (
    // One row on a phone, wrapping only from sm up. Two rows of state above
    // fourteen sections of content is the header eating the story; nowrap plus
    // truncation on the values keeps it to a single line at any width, and the
    // values are short enough ("Pam · 2015", "Fiji + Tonga") that truncation
    // almost never bites.
    <div className="deck-status mt-1.5 flex flex-nowrap items-center gap-x-2.5 gap-y-1 overflow-hidden border-t border-ink/10 pt-1.5 text-xs sm:mt-2 sm:flex-wrap sm:gap-x-3 sm:pt-2">
      {storm ? (
        <>
          <Field label="Storm">
            <span className="font-medium text-accent">
              {storm.name.replace(/^Cyclones? /, '')} &middot; {storm.year}
            </span>
          </Field>

          <span aria-hidden="true" className="shrink-0 opacity-25">
            |
          </span>

          {nations.length > 0 ? (
            <>
              <Field label="Country">{formatNationList(nations)}</Field>
              <Action onClick={onClearNations} title="Clear the country selection">
                Clear
              </Action>
            </>
          ) : (
            // Not styled as a warning. Nothing is broken -- the reader simply
            // has not answered the next question yet, and the bar's job here is
            // to say which question that is and where it is asked.
            <Field label="Country">
              {/* The long form only where it fits. On a phone the map slide is
                  where this is answered and the reader is on their way to it;
                  the short form still says the choice is outstanding. */}
              <span className="opacity-60">
                <span className="sm:hidden">Not chosen</span>
                <span className="hidden sm:inline">Not chosen yet &mdash; pick one on the map</span>
              </span>
            </Field>
          )}

          <Action onClick={onReset} title="Clear the storm and start again">
            Reset
          </Action>
        </>
      ) : (
        <Field label="Storm">
          <span className="opacity-60">
            <span className="sm:hidden">Not chosen</span>
            <span className="hidden sm:inline">Not chosen yet &mdash; pick one on the timeline</span>
          </span>
        </Field>
      )}
    </div>
  )
}
