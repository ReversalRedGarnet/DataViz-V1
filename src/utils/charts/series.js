// Picks each nation's colour and dash pattern for a chart, so the lines and
// the legend under them always agree.

import { DIVERGENCE_DASH, SERIES_DASH } from './constants.js'

// HOW A SET OF NATIONS IS DRAWN: one colour and one dash pattern each.
//
// THE TWO-SERIES AND FOUR-SERIES CASES ARE DIFFERENT PALETTES, not one palette
// truncated, and treating them as the same thing is what this exists to stop.
//
// A two-colour d3.scaleOrdinal with a two-entry dash array is right for the
// ripple chain, which draws the reader's selected pair. But ContextPanel
// passes all four nations: scaleOrdinal would cycle its two colours and the
// dash lookup would fall through to null, so Fiji and Vanuatu would come out
// the same colour AND solid -- identical, on charts whose whole job is
// comparing four countries.
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
