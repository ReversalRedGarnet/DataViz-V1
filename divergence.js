// Reshapes the ripple-chain data into "every nation against its own event-year
// figure". Indexing each nation to itself is the only normalisation here:
// nothing is blended, weighted, or ranked, and a line at 140 means that nation
// is 40% above the figure it recorded in the event year, not 40% above anyone
// else.
//
// A metric qualifies only if:
//   * it isn't drawn as bars elsewhere on the site. That flag already marks
//     the records with gaps in them (see metrics.js), and a gappy record run
//     through an index would draw a confident line across years nobody
//     measured -- exactly the thing the bar treatment exists to avoid.
//   * at least two nations have both an event-year figure and a later one.
//     One nation on its own isn't a divergence.
//
// A nation needs a positive event-year baseline: indexing against zero, or
// against a missing figure, has no meaning.
export function buildDivergencePanels(data, metrics, nations, eventYear) {
  if (!data) return []

  const panels = []

  for (const metric of metrics) {
    if (metric.chartType === 'bar') continue

    const series = []
    for (const [slot, nation] of nations.entries()) {
      const rows = (data[metric.key] ?? [])
        .filter((d) => d.nation === nation && d.year >= eventYear)
        .sort((a, b) => a.year - b.year)

      const base = rows.find((r) => r.year === eventYear)
      if (!base || !(base[metric.field] > 0) || rows.length < 2) continue

      series.push({
        nation,
        colorIndex: slot,
        points: rows.map((r) => ({
          year: r.year,
          index: (r[metric.field] / base[metric.field]) * 100,
          raw: r[metric.field],
          baseYear: eventYear,
        })),
      })
    }

    if (series.length < 2) continue

    panels.push({
      metric,
      series,
      lastYear: Math.max(...series.flatMap((s) => s.points.map((p) => p.year))),
      missing: nations.filter((n) => !series.some((s) => s.nation === n)),
    })
  }

  return panels
}

// The year range every panel sweeps across. Shared rather than per-panel so
// the three charts stay on one clock: a metric whose record stops in 2023
// should visibly stop, not finish its sweep early and imply it kept going.
export function divergenceYearRange(panels, eventYear) {
  if (panels.length === 0) return [eventYear, eventYear + 1]
  return [eventYear, Math.max(...panels.map((p) => p.lastYear))]
}
