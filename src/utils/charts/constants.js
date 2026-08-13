import * as d3 from 'd3'

// Every chart is drawn at its container's measured pixel width (see
// useElementWidth.js), so these are real CSS pixels rather than viewBox units.
// One type scale, one stroke weight, one point size, everywhere on the site.
export const AXIS_FONT = 11
export const VALUE_FONT = 11
export const MARK_STROKE = 2
export const POINT_R = 3.5
export const POINT_R_HOVER = 6

// The second series is dashed. The two picks are a blue and a gold chosen for
// contrast against the card, which leaves them near-identical in luminance --
// distinguishable by hue alone, and blue-yellow is the one axis tritanopia
// loses. A dash pattern separates them without colour.
export const SERIES_DASH = [null, '7 4']

// Same reasoning extended to four lines on one plot, where hue is doing less
// work than it can carry.
export const DIVERGENCE_DASH = [null, '7 4', '2 3', '9 3 2 3']

// Uniform per chart family, so a chart spanning two grid columns is wider than
// its neighbours but exactly as tall.
export const CHART_HEIGHT = 210
export const STORM_CHART_HEIGHT = 260
export const DIVERGENCE_HEIGHT = 220

// Left margin holds a four-character tick label plus its gap; bottom holds one
// row of horizontal labels, or a taller band when they have to be angled.
export const MARGIN = { top: 16, right: 14, bottom: 30, left: 48 }
export const MARGIN_TILTED_BOTTOM = 62

export const POP_EASE = d3.easeBackOut.overshoot(1.4)
export const INT_FORMAT = d3.format('d')
