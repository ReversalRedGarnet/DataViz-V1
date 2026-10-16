// Small counts, set in words, in English or French.
//
// This exists so the roster's two headline figures -- how many storms, how
// many nations -- are derived from STORMS and NATIONS wherever they appear in
// prose (the hero kicker, the hero body, the timeline eyebrow and the method
// panel's roster paragraph), rather than typed as words that could fall out of
// step with the data.
//
// The roster is designed to accept a new storm: the rule in content/storms.js
// is stated so a reader can apply it themselves, and any storm meeting it
// belongs on the list. That edit is one line in the registry, and because the
// counts are derived, no sentence is left quietly asserting six.
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
//
// FRENCH GENDER AGREEMENT. Cardinal numbers two and up don't inflect in French
// ("deux cyclones", "deux nations" -- same word either side), so the only
// number that needs to know what noun follows is one: "un cyclone" (m.) but
// "une nation" (f.). `gender` defaults to 'm' since every current call site
// but the nation counts is masculine ("cyclone"), and is a no-op in English
// and for every value but 1.
const NUMBER_WORDS = {
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  fr: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'],
}

export function numberWord(n, { language = 'en', gender = 'm' } = {}) {
  const words = NUMBER_WORDS[language] ?? NUMBER_WORDS.en
  const word = words[n] ?? String(n)
  if (language === 'fr' && n === 1 && gender === 'f') return 'une'
  return word
}

// For a count that opens a sentence or a kicker segment. Kept beside
// numberWord rather than inlined at the call sites, so a count reads the same
// wherever it is capitalised.
export function numberWordCapitalized(n, options) {
  const word = numberWord(n, options)
  return word.charAt(0).toUpperCase() + word.slice(1)
}
