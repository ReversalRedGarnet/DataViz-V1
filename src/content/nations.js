import scope from './nations.json'

// THE FOUR IN-SCOPE NATIONS, IN ONE PLACE.
//
// This list used to live in components/MapView.jsx, and App, BigPicture,
// ContextPanel, DivergenceView and StormJourney each imported it from there --
// a page shell and four siblings reaching into a UI component for the project's
// own scope. Four of them then wrote out the same `NATIONS.map(n => n.name)`
// independently, so the same derivation existed four times and the count was
// typed as a literal `4` in a sixth place.
//
// Everything below is derived once, here, from nations.json -- which the
// cleaning scripts read too, so the site and the pipeline cannot disagree about
// which countries this project covers.
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
// The in-scope four come from nations.json; the rest are here so a future
// hazard page covering more of the region gets the same treatment for free.
const SHORT_NAMES = {
  'Federated States of Micronesia': 'Micronesia',
  'Papua New Guinea': 'PNG',
  'Marshall Islands': 'Marshall Is.',
  'Cook Islands': 'Cook Is.',
  'New Caledonia': 'N. Caledonia',
  'French Polynesia': 'Fr. Polynesia',
  ...Object.fromEntries(scope.nations.map((n) => [n.name, n.short])),
}

export function shortName(nation) {
  return SHORT_NAMES[nation] ?? nation
}
