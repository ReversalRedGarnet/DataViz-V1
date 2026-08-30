import * as d3 from 'd3'
import { AXIS_FONT, VALUE_FONT } from './constants.js'
import { shortName } from '../../content/nations.js'

// shortName lives with the nation data rather than here: it is a fact about
// a country, not about a chart axis, and this module was a fifth place the
// project's country names were written down.
export { shortName }

// Measuring text properly would mean a hidden canvas; a per-character estimate
// at these font sizes is accurate enough to decide whether a label fits.
export function textWidth(text, fontSize = AXIS_FONT) {
  return String(text).length * fontSize * 0.58
}

export function labelsFit(names, bandwidth) {
  return Math.max(...names.map((n) => textWidth(shortName(n)))) <= bandwidth - 4
}

// Decided for the chart as a whole, not per bar, so a section never shows some
// bars labelled and others not.
export function valueLabelsFit(rows, format, bandwidth) {
  return Math.max(...rows.map((d) => textWidth(format(d.value), VALUE_FONT))) + 4 <= bandwidth
}

// Year labels overlap long before the plot itself runs out of room.
export function yearTickCount(width) {
  if (width < 360) return 3
  if (width < 560) return 5
  return 7
}

// SI-prefixed axis ticks ("1.5M", "200k"), with a French decimal comma rather
// than d3.format's fixed English period. Built once per locale rather than
// per tick -- formatLocale is the setup step, .format('~s') the per-value one.
const SI_FORMAT_EN = d3.format('~s')
const SI_FORMAT_FR = d3
  .formatLocale({ decimal: ',', thousands: ' ', grouping: [3], currency: ['', ' $'] })
  .format('~s')
export function siTickFormat(language) {
  return language === 'fr' ? SI_FORMAT_FR : SI_FORMAT_EN
}

// For a band scale, whether every year can be labelled is a question about the
// band's actual step, not the chart's overall width -- eight years in a narrow
// card label fine, sixty in a wide one don't.
export function bandLabelStep(years, step) {
  const needed = textWidth('2020') + 8
  return Math.max(1, Math.ceil(needed / step))
}

// Push overlapping end labels apart, nearest-to-its-line first. Four nations
// starting from a common point spend the first second of the sweep stacked on
// top of each other, which is exactly the moment the labels are least useful
// and most in the way.
export function spreadLabels(entries, minGap, top, bottom) {
  const sorted = [...entries].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].y - sorted[i - 1].y
    if (gap < minGap) sorted[i].y = sorted[i - 1].y + minGap
  }
  // The push above only ever moves labels down, so the last one can end up
  // past the bottom of the plot; walk back up to bring the run inside.
  const overflow = sorted[sorted.length - 1].y - bottom
  if (overflow > 0) {
    for (let i = sorted.length - 1; i >= 0; i--) {
      sorted[i].y = Math.min(sorted[i].y, bottom - (sorted.length - 1 - i) * minGap)
      if (i > 0 && sorted[i].y - sorted[i - 1].y < minGap) sorted[i - 1].y = sorted[i].y - minGap
    }
  }
  for (const entry of sorted) entry.y = Math.max(top, entry.y)
  return sorted
}
