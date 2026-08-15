// A domain that extends below zero when the data does. Signed metrics (SPI/
// SPEI, sea-level anomaly) need this: a d3 linear scale happily returns a pixel
// position for an out-of-domain input, so a negative value on a [0, max] domain
// doesn't error, it just collapses to a zero-height bar.
//
// `pad` is the headroom past the data. Snapshots ask for more so a value label
// printed past the end of a bar has somewhere to sit.
export function zeroAnchoredDomain(values, pad = 1.1) {
  const dataMin = Math.min(0, ...values)
  const dataMax = Math.max(0, ...values)
  return [dataMin < 0 ? dataMin * pad : 0, dataMax * pad]
}

// A bar's top y and height, for a value either side of the baseline. SVG y
// grows downward, so which of y(0)/y(value) is the top depends on the sign.
//
// Nothing measured should be invisible, and bars used to disappear two ways: a
// reported zero drew at height 0, indistinguishable from a year nobody
// reported (Tonga reported none affected in 2016-17, which is a measurement);
// and a small value beside a large one rounded away -- against Fiji's 633,584
// in 2016, Tonga's 68 in 2020 came out at two hundredths of a pixel.
//
// So any non-zero value gets at least MIN_BAR_HEIGHT, and an exact zero gets a
// printed "0" on the baseline instead of a bar (see drawZeroLabels). Giving
// zero a stub was worse: it made a reported nothing taller than a reported 68.
// Module-private: barTopAndHeight below applies it, and a renderer applying the
// floor itself would be a second copy of this rule to keep in step.
const MIN_BAR_HEIGHT = 2

export function barTopAndHeight(y, value) {
  const yZero = y(0)
  if (value === 0) return { top: yZero, height: 0 }
  const yValue = y(value)
  const height = Math.max(MIN_BAR_HEIGHT, Math.abs(yZero - yValue))
  return { top: value < 0 ? yZero : yZero - height, height }
}

// Where a series sits at a fractional year -- what the leading dot needs while
// the sweep is between two measured years. Before the first point and after
// the last it parks on the end value rather than extrapolating: a nation whose
// record stops in 2022 has stopped, and inventing a 2024 position for it would
// be inventing data.
export function indexAtYear(points, year) {
  if (year <= points[0].year) return points[0].index
  const last = points[points.length - 1]
  if (year >= last.year) return last.index
  for (let i = 1; i < points.length; i++) {
    if (points[i].year >= year) {
      const a = points[i - 1]
      const b = points[i]
      return a.index + (b.index - a.index) * ((year - a.year) / (b.year - a.year))
    }
  }
  return last.index
}
