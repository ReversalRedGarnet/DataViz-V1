import { formatNationList } from '../utils/formatNationList.js'

// WHAT THE READER HAS CHOSEN, VISIBLE FROM EVERY SLIDE.
//
// This is the successor to DeckStatus, and it exists for the same reason that
// component did: the map is on one slide and the four charts it drives are on
// the ones after it, so a reader can no longer see a pick and its consequence
// at the same time. It also speaks before there is anything to report -- an
// empty header on the opening slides said nothing about what the site wanted,
// while a bar reading "Choose a storm" says it in the one place that is on
// screen no matter which slide the reader is on.
//
// IT DOES NOT NAVIGATE, AND THAT IS DELIBERATE.
//
// It used to: the storm and country each carried a "Change" link that jumped
// the deck back to the slide that owned them. They are gone, along with every
// other route between slides that was not the footer's Back and Next. The bar
// reports and it clears; it never moves the reader. Where a choice is made is
// named in words instead ("on the map"), which tells a reader who wants to
// change it exactly which slide to walk back to without deciding for them that
// they want to go there now.
//
// Clear and Reset stay, because neither is navigation. They change what is
// selected, which is the same kind of act as selecting it in the first place,
// and they are the only way to unpick a choice from a slide that is not the one
// that made it.
//
// It holds no state. Every value here is read from the single source of truth
// in useStory, and every action is a callback into it -- so the bar cannot
// disagree with the sections below it, which is the failure mode a second copy
// of "which storm is selected" would eventually produce.
//
// Props:
//   storm -- the selected storm, or null
//   selectedNations -- ordered pair, possibly empty
//   onClearNations / onReset -- from useStory
//
// The action buttons are 36px rather than the 44px used for touch targets in
// the body. That figure is for the controls a reader aims at inside a section --
// storm cards, map pins, the scrubber, the country picker, all of which are
// sized for it. This bar is persistent chrome sharing a row with the section
// menu and the theme toggle, both already 36px, and growing it would take a
// centimetre off the height of all fourteen slides on a phone.
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

export default function StoryStateBar({ storm, selectedNations, onClearNations, onReset }) {
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

          <span aria-hidden="true" className="opacity-25">
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
              <span className="opacity-60">Not chosen yet &mdash; pick one on the map</span>
            </Field>
          )}

          <Action onClick={onReset} title="Clear the storm and start again">
            Reset
          </Action>
        </>
      ) : (
        <Field label="Storm">
          <span className="opacity-60">Not chosen yet &mdash; pick one on the timeline</span>
        </Field>
      )}
    </div>
  )
}
