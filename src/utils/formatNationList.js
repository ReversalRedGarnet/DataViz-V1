// List grammar -- "A, B, and C" in English, "A, B et C" in French (no serial
// comma, and "and" becomes "et" rather than being transliterated). Needed by
// the snapshot charts, where any number of nations can be missing the same
// moment -- unlike the comparison views, which never exceed "A and B".
//
// Intl.ListFormat, not hand-written joins: it already knows each locale's
// conjunction convention (the Oxford comma is an English-specific style
// choice; French's equivalent style drops it), so this file doesn't have to
// hard-code a second grammar rule alongside the first. `names` should already
// be the display strings for the target language -- see nationLabel() in
// content/nations.js -- since this function only joins, it doesn't translate.
const listFormatters = {}

function formatterFor(language) {
  const locale = language === 'fr' ? 'fr' : 'en'
  if (!listFormatters[locale]) {
    listFormatters[locale] = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' })
  }
  return listFormatters[locale]
}

export function formatNationList(names, language = 'en') {
  if (names.length === 0) return ''
  return formatterFor(language).format(names)
}
