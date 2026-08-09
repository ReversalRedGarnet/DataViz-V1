// Row-shaping helpers shared by every hazard page's charts. All of
// them work on the same { [metricKey]: rows } object the data hooks
// return, so the snapshot/trend components differ only in their copy
// and metric config, not in how they reshape data.

// Sort comparator putting rows in the page's own nation order.
export function byNationOrder(order) {
  return (a, b) => order.indexOf(a.nation) - order.indexOf(b.nation)
}

// Names in `order` with no row in `rows`.
export function missingNations(order, rows) {
  return order.filter((name) => !rows.some((d) => d.nation === name))
}

// One { nation, value } row per nation that actually has a figure for
// `year`, per metric. Nations missing that year are left out rather
// than backfilled from a nearby one: these charts are a same-moment
// comparison, so a gap has to read as a gap.
export function snapshotRowsByMetric(data, metrics, year, order) {
  if (!data) return null
  const result = {}
  for (const m of metrics) {
    result[m.key] = (data[m.key] ?? [])
      .filter((d) => d.year === year)
      .map((d) => ({ nation: d.nation, value: d[m.field] }))
      .sort(byNationOrder(order))
  }
  return result
}

// Rows for the currently selected nations, per metric. Call this
// inside a useMemo keyed on [data, selectedNations]: the tooltip state
// lives in the same component as the charts, so without a stable array
// reference per metric every hover would re-run each chart's D3 draw
// effect and replay its entrance animation.
export function rowsByMetricForNations(data, metrics, nations) {
  if (!data) return null
  const result = {}
  for (const m of metrics) {
    result[m.key] = (data[m.key] ?? []).filter((d) => nations.includes(d.nation))
  }
  return result
}

// Percent change, or null when the baseline is zero or missing and a
// percentage would be meaningless.
export function pctChange(from, to) {
  if (!from) return null
  return ((to - from) / Math.abs(from)) * 100
}
