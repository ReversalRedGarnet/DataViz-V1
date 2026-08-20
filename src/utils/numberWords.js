// Small counts, set in words.
//
// This exists to close a drift, not because spelling numbers is interesting.
// The roster's two headline figures -- how many storms, how many nations --
// were typed out in four places (the hero kicker, the hero body, the timeline
// eyebrow and the method panel's roster paragraph) while being derived from
// STORMS and NATIONS everywhere else on the site. Two of those four were the
// same sentence, written twice.
//
// The roster is designed to accept a new storm: the rule in content/storms.js
// is stated so a reader can apply it themselves, and any storm meeting it
// belongs on the list. That edit is one line in the registry, and it used to
// leave four sentences quietly asserting six.
//
// Words rather than digits because every one of these sits in prose, where a
// numeral reads as data and pulls the eye the way a figure in a chart should.
// The site's own rule elsewhere is the same: tabular-nums for quantities, words
// for counts inside a sentence.
//
// Past ten it falls back to the digit, which is the point at which spelling a
// number out stops helping a reader anyway. Nothing here is expected to reach
// it: the roster is severe cyclones striking two or more of four nations in a
// decade, and the nation count is the scope of the project.
const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
]

export function numberWord(n) {
  return NUMBER_WORDS[n] ?? String(n)
}

// For a count that opens a sentence or a kicker segment. Kept beside
// numberWord rather than inlined at the call sites, so a count reads the same
// wherever it is capitalised.
export function numberWordCapitalized(n) {
  const word = numberWord(n)
  return word.charAt(0).toUpperCase() + word.slice(1)
}
