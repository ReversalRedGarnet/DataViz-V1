// The four nations the project covers (Solomon Islands, Vanuatu, Fiji,
// Tonga): names, French names, map coordinates and helpers for writing a list
// of them in a sentence. Built from nations.json, which the Python pipeline
// also reads.

import scope from './nations.json'
import { formatNationList } from '../utils/formatNationList.js'

// THE FOUR IN-SCOPE NATIONS, IN ONE PLACE.
//
// Everything below -- the list, the names, the count -- is derived once, here,
// from nations.json, which the cleaning scripts read too, so the site and the
// pipeline cannot disagree about which countries this project covers.
// Components import these rather than deriving their own copies.
//
// ORDER IS LOAD-BEARING. It is the order every chart sorts its rows into (see
// byNationOrder in utils/rows.js) and the order the divergence legend assigns
// its colours and dash patterns in. Reordering this array reorders every chart
// on the site.

export const NATIONS = scope.nations.map(({ name, lat, lon }) => ({ name, lat, lon }))

// The names alone. Exported rather than re-derived at each call site.
export const NATION_NAMES = NATIONS.map((n) => n.name)

// How many countries are in scope. Exported so a sentence can read the number
// rather than repeat it -- "four countries" is true today and is the kind of
// fact that goes stale silently.
export const NATION_COUNT = NATIONS.length

// name -> [lon, lat], in the order d3.geoProjection wants them. Both maps on
// the site position their marks from this, so they cannot place the same
// country in two different spots.
export const NATION_COORDS = Object.fromEntries(scope.nations.map((n) => [n.name, [n.lon, n.lat]]))

// Axis labels have to fit a band that can be under 50px wide on a phone.
// Truncating to the first word turned "Federated States of Micronesia" into
// "Federated", so long names get a real short form and anything not listed is
// left alone.
//
// The in-scope four come from nations.json; the rest are here so that if the
// scope ever widens to more of the region, those names get the same
// treatment for free.
const SHORT_NAMES = {
  'Federated States of Micronesia': 'Micronesia',
  'Papua New Guinea': 'PNG',
  'Marshall Islands': 'Marshall Is.',
  'Cook Islands': 'Cook Is.',
  'New Caledonia': 'N. Caledonia',
  'French Polynesia': 'Fr. Polynesia',
  ...Object.fromEntries(scope.nations.map((n) => [n.name, n.short])),
}

// language defaults to 'en' so every existing call site keeps working
// unchanged; only call sites that now have a language in scope pass it.
export function shortName(nation, language = 'en') {
  const table = language === 'fr' ? SHORT_NAMES_FR : SHORT_NAMES
  return table[nation] ?? nation
}

// FRENCH DISPLAY NAMES. `name` in nations.json (and everywhere in this file
// above) stays the join key -- it's what data-pipeline/common.py matches
// against and what chart data is keyed by. These are read-only display
// lookups layered on top, never substituted into NATIONS/NATION_NAMES/
// NATION_COORDS themselves, so nothing that matches or sorts by nation name
// can be affected by which language is on screen.
const NAME_FR = Object.fromEntries(scope.nations.map((n) => [n.name, n.nameFr ?? n.name]))

const SHORT_NAMES_FR = {
  'Federated States of Micronesia': 'Micronésie',
  'Papua New Guinea': 'PNG',
  'Marshall Islands': 'Îles Marshall',
  'Cook Islands': 'Îles Cook',
  'New Caledonia': 'Nouvelle-Calédonie',
  'French Polynesia': 'Polynésie fr.',
  ...Object.fromEntries(scope.nations.map((n) => [n.name, n.shortFr ?? n.short])),
}

// The one function components should call to display a nation's name. Takes
// the canonical (English) name -- the value every chart, selection and prop
// on the site already carries -- and the current language, and returns
// whichever is right to put on screen. Falls back to the canonical name for
// anything outside the four in-scope nations (e.g. NationRef links to a
// broader roster), matching shortName's existing fallback behaviour.
export function nationLabel(name, language = 'en') {
  if (language === 'fr') return NAME_FR[name] ?? name
  return name
}

// Whether a nation, or list of nations, takes plural grammatical agreement in
// French prose: true for two or more nations, and also for Solomon Islands
// alone, since "Îles Salomon" is a grammatically plural country name in
// French (like "les Pays-Bas") even when it is the only one named.
export function nationListIsPlural(names) {
  return names.length > 1 || names.includes('Solomon Islands')
}

// A nation, or list of nations, as it belongs in running prose -- the object
// of "a touché ..." or "pour ...", rather than a bare label (a chip, a table
// cell, a legend entry, a chart tick -- those stay on nationLabel()/
// formatNationList() above, unchanged). A plural French country name still
// needs its article there, the way "les Pays-Bas" or "les Philippines" would
// -- so unlike the label form, this prepends "les" for Solomon Islands. Fidji,
// Vanuatu and Tonga take no article either way, so this only ever changes
// output when Solomon Islands is in `names`, and is a no-op in English.
//
// Takes canonical (English) names, same as nationLabel -- not already-
// resolved display strings -- so it can tell Solomon Islands apart from its
// French label.
export function nationListInProse(names, language = 'en') {
  const list = formatNationList(names.map((n) => nationLabel(n, language)), language)
  if (language === 'fr' && names.includes('Solomon Islands')) return `les ${list}`
  return list
}
