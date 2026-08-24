import { DIVERGENCE_DASH, SERIES_DASH } from './constants.js'

// HOW A SET OF NATIONS IS DRAWN: one colour and one dash pattern each.
//
// THE TWO-SERIES AND FOUR-SERIES CASES ARE DIFFERENT PALETTES, not one palette
// truncated, and treating them as the same thing is what this exists to stop.
//
// renderMetricChart used to build its scale as `d3.scaleOrdinal(nations,
// palette.selection)` with a two-colour range and pick its dash with
// `SERIES_DASH[i]` from a two-entry array. That is correct for the ripple
// chain, which draws the reader's selected pair. ContextPanel passes all four
// nations, and scaleOrdinal cycles its range while the dash lookup falls
// through to null -- so Fiji and Vanuatu came out the same colour AND solid,
// which is to say identical, on two charts whose entire job is comparing four
// countries.
//
// Resolved in one place because the renderer and the legend have to agree: a
// legend that assigns colours by its own rule is a legend that can lie.
export function seriesStyles(nations, palette) {
  // Above two, hue is doing less work than it can carry and the four-way ramp
  // and its dash patterns take over -- the same pair the divergence chart has
  // always used for exactly this reason.
  const wide = nations.length > 2
  const colors = wide ? palette.series : palette.selection
  const dashes = wide ? DIVERGENCE_DASH : SERIES_DASH

  // Modulo rather than an index, so a fifth nation degrades to a repeated
  // colour instead of an undefined one. Nothing reaches five today; the point
  // is that adding a country to nations.json cannot produce an invisible line.
  return nations.map((nation, i) => ({
    nation,
    color: colors[i % colors.length],
    dash: dashes[i % dashes.length] ?? null,
  }))
}
