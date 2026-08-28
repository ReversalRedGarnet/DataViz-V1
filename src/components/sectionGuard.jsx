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
//   const blocked = sectionGuard({ data, storm, style, prompt: '...', language })
//   if (blocked) return blocked
//
// `prompt` completes the sentence "Pick a storm from the timeline to ..." so
// each section can say what it specifically offers, which is the part worth
// varying. `subject` names the section in the loading message. Both are
// call-site strings, not {en, fr} objects -- the caller already has its own
// `language` in scope and passes the resolved string for that language, the
// same convention every other component here uses for its own copy.
//
// `error` is checked before `data`, because a failed load and a load still in
// flight both arrive here as data === null. Without the distinction a 404 read
// as "waiting on data" and never stopped saying so, which is the one thing a
// loading message must never do.
// LEAVING `storm` OUT ENTIRELY means the section does not depend on one, and
// only the two data checks run. That is not the same as passing null, which
// still gates. ContextPanel draws regional records that exist with or without a
// selection, and for want of this it wrote the two data branches out by hand --
// a seventh copy of the checks this module exists to hold once, and one whose
// wording had already begun to drift from these.
const STRINGS = {
  en: {
    couldNotLoad: (subject) => `${subject} \u2014 the data could not be loaded. Reload the page to try again.`,
    waiting: (subject) => `${subject} \u2014 waiting on data.`,
    pickStorm: (prompt) => `Pick a storm from the timeline to ${prompt}.`,
  },
  fr: {
    couldNotLoad: (subject) => `${subject} \u2014 les données n\u2019ont pas pu être chargées. Rechargez la page pour réessayer.`,
    waiting: (subject) => `${subject} \u2014 en attente des données.`,
    pickStorm: (prompt) => `Choisissez un cyclone dans la chronologie pour ${prompt}.`,
  },
}

export function sectionGuard({ data, error, storm, style, subject, prompt, language = 'en' }) {
  const t = STRINGS[language]

  if (error) {
    return <EmptyState style={style}>{t.couldNotLoad(subject)}</EmptyState>
  }

  if (!data) {
    return <EmptyState style={style}>{t.waiting(subject)}</EmptyState>
  }

  if (storm === undefined) return null

  if (!storm) {
    return <EmptyState style={style}>{t.pickStorm(prompt)}</EmptyState>
  }

  return null
}
