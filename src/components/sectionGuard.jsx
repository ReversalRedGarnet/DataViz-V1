import EmptyState from './EmptyState.jsx'

// Every storm-driven section opens with the same two checks in the same order:
// is the data here, and has the reader chosen a storm. Written out six times it
// drifted -- the prompts disagreed about whether the timeline was "above" or
// just "the timeline", and one section checked the storm before the data, which
// would have told a reader to pick a storm when the real problem was a failed
// fetch.
//
// Returns an element to render instead of the section, or null to carry on.
//
//   const blocked = sectionGuard({ data, storm, style, tone, prompt: '...' })
//   if (blocked) return blocked
//
// `prompt` completes the sentence "Pick a storm from the timeline to ..." so
// each section can say what it specifically offers, which is the part worth
// varying. `subject` names the section in the loading message.
export function sectionGuard({ data, storm, style, tone, subject, prompt }) {
  if (!data) {
    return (
      <EmptyState tone={tone} style={style}>
        {subject} &mdash; waiting on data.
      </EmptyState>
    )
  }

  if (!storm) {
    return (
      <EmptyState tone={tone} style={style}>
        Pick a storm from the timeline to {prompt}.
      </EmptyState>
    )
  }

  return null
}
