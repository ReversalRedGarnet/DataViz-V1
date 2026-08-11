import Section from './Section.jsx'

// The story gate. Everything below the exclusions section stays unrendered
// until a storm is chosen, so the page simply ends here and there is nothing
// further to scroll to.
//
// Deliberately implemented by not rendering the rest, rather than by
// intercepting scroll events. Hijacking the wheel is the usual way this effect
// is built and it is the wrong way: it breaks keyboard paging, find-in-page,
// screen-reader virtual cursors and the browser's own scroll restoration, all
// to simulate a shorter page. Actually having a shorter page costs none of
// that. Every navigation method still works perfectly; there is just less
// document until the reader makes a choice.
//
// The trade this does make: the reader cannot skim ahead to decide whether the
// rest is worth their time. That is the point of the pacing, but it is a real
// cost and worth remembering if the piece ever reads as withholding rather than
// sequencing.
export default function StoryGate({ style }) {
  return (
    <Section style={style}>
      <div className="mx-auto max-w-prose rounded-2xl border border-dashed border-ink/25 bg-surface/50 px-6 py-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Your turn
        </p>
        <h2 className="mb-3 font-serif text-2xl font-semibold tracking-tight">
          Pick a storm to carry on
        </h2>
        <p className="mx-auto max-w-md text-sm opacity-75">
          The rest of this story follows one cyclone at a time &mdash; where it went, who it
          reached, and what the record shows in the years after. Choose any of the six above; you
          can change your mind at any point.
        </p>
      </div>
    </Section>
  )
}
