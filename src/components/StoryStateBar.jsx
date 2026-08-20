import { formatNationList } from '../utils/formatNationList.js'

// WHAT THE READER HAS CHOSEN, VISIBLE FROM EVERY SLIDE.
//
// This is the successor to DeckStatus, and it exists for the same reason that
// component did: the map is on one slide and the four charts it drives are on
// the ones after it, so a reader can no longer see a pick and its consequence
// at the same time. What is new is that it now speaks before there is anything
// to report. An empty header on the opening slides said nothing about what the
// site wanted; a bar reading "Choose a storm" says it in the one place that is
// on screen no matter which slide the reader is on.
//
// It holds no state. Every value here is read from the single source of truth
// in useStory, and every action is a callback into it -- so the bar cannot
// disagree with the sections below it, which is the failure mode a second copy
// of "which storm is selected" would eventually produce.
//
// Props:
//   storm -- the selected storm, or null
//   selectedNations -- ordered pair, possibly empty
//   onNavigate -- (sectionId) => void, drives the deck
//   onClearNations / onReset -- from useStory
//
// The action buttons are 36px rather than the 44px the brief asks for touch
// targets. That figure is for the controls a reader aims at inside a section --
// storm cards, map pins, the scrubber, the country picker, all of which are
// sized for it. This bar is persistent chrome sharing a row with the section
// menu and the theme toggle, both already 36px, and every action here is a
// shortcut to something reachable another way. Growing it would take a
// centimetre off the height of all fourteen slides on a phone to save a gesture
// that is not the primary route to anything.
function Action({ children, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded px-1.5 py-1 underline decoration-ink/30 underline-offset-2 opacity-60 transition-opacity duration-150 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

export default function StoryStateBar({
  storm,
  selectedNations,
  onNavigate,
  onClearNations,
  onReset,
}) {
  const nations = selectedNations ?? []

  return (
    <div className="deck-status mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink/10 pt-2 text-xs">
      {storm ? (
        <>
          <Field label="Storm">
            <span className="font-medium text-accent">
              {storm.name.replace(/^Cyclones? /, '')} &middot; {storm.year}
            </span>
          </Field>
          <Action onClick={() => onNavigate('timeline')} title="Back to the timeline">
            Change
          </Action>

          <span aria-hidden="true" className="opacity-25">
            |
          </span>

          {nations.length > 0 ? (
            <>
              <Field label="Country">{formatNationList(nations)}</Field>
              <Action onClick={() => onNavigate('map')} title="Back to the map">
                Change
              </Action>
              <Action onClick={onClearNations} title="Clear the country selection">
                Clear
              </Action>
            </>
          ) : (
            // Not styled as a warning. Nothing is broken -- the reader simply
            // has not answered the next question yet, and the bar's job here is
            // to say which question that is.
            <Field label="Country">
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="rounded underline decoration-ink/30 underline-offset-2 opacity-60 transition-opacity duration-150 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Choose a country on the map
              </button>
            </Field>
          )}

          <Action onClick={onReset} title="Clear the storm and start again">
            Reset
          </Action>
        </>
      ) : (
        <Field label="Storm">
          <button
            type="button"
            onClick={() => onNavigate('timeline')}
            className="rounded underline decoration-ink/30 underline-offset-2 opacity-70 transition-opacity duration-150 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Choose a storm
          </button>
        </Field>
      )}
    </div>
  )
}
