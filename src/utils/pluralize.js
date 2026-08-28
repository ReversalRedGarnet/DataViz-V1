// Locale-aware plural selection, replacing the site's `n === 1 ? a : b`
// ternaries (death/deaths, year/years, was/were, is/are).
//
// Not a French-specific fix so much as a correctness one that happens to
// matter more in French: Intl.PluralRules('fr').select(0) resolves to 'one',
// because French treats zero as grammatically singular ("0 mort", not
// "0 morts") where English does not. A hand-written `n === 1` ternary gets
// English right and French wrong at exactly the value the site's own data
// notes call out as meaningful -- a reported zero, which utils/metrics.js
// already treats as a fact worth stating rather than hiding.
//
// `forms` only needs 'one' and 'other' for the cases this site has (deaths,
// years, was/were, is/are): English and French both reduce to those two
// categories here. select() can return other CLDR categories ('few', 'many',
// 'two') for other locales; the 'other' fallback covers a locale added later
// without a matching key.
const pluralRules = {}

function rulesFor(language) {
  const locale = language === 'fr' ? 'fr' : 'en'
  if (!pluralRules[locale]) pluralRules[locale] = new Intl.PluralRules(locale)
  return pluralRules[locale]
}

export function pluralize(n, forms, language = 'en') {
  const category = rulesFor(language).select(n)
  return forms[category] ?? forms.other
}
