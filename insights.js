import { METRICS, EVENT_YEAR } from './metrics.js'
import { pctChange } from './rows.js'

// One bullet per metric, comparing the two selected nations from the event year
// to the latest on record. Deliberately not a ranking of "most interesting"
// findings: every bullet traces back to a specific chart above it.
//
// Records don't all end in the same year. Fiji's tourist arrivals run to 2024
// while Tonga's and Vanuatu's stop at 2022, so an unqualified "+452% against
// +94% since 2020" compares a four-year recovery with a two-year one and reads
// as a gap in outcome when part of it is a gap in the calendar. Where the two
// end years differ, the bullet says so and names both.
//
// Returns [{ key, text }], always exactly METRICS.length entries.


function formatPct(p) {
  if (p === null) return null
  const sign = p > 0 ? '+' : ''
  return `${sign}${p.toFixed(0)}%`
}

export function buildComparativeInsights(data, nationA, nationB) {
  if (!data) return []

  return METRICS.map((m) => {
    const rowsA = (data[m.key] ?? []).filter((d) => d.nation === nationA).sort((a, b) => a.year - b.year)
    const rowsB = (data[m.key] ?? []).filter((d) => d.nation === nationB).sort((a, b) => a.year - b.year)
    const eventA = rowsA.find((r) => r.year === EVENT_YEAR)
    const latestA = rowsA[rowsA.length - 1]
    const eventB = rowsB.find((r) => r.year === EVENT_YEAR)
    const latestB = rowsB[rowsB.length - 1]

    const hasA = Boolean(eventA && latestA)
    const hasB = Boolean(eventB && latestB)

    if (!hasA && !hasB) {
      return {
        key: m.key,
        text: `${m.label}: not reliably reported for either ${nationA} or ${nationB} in the official dataset.`,
      }
    }
    if (!hasA || !hasB) {
      const missing = hasA ? nationB : nationA
      const present = hasA ? nationA : nationB
      return {
        key: m.key,
        text: `${m.label}: reported for ${present} but not for ${missing} -- a gap in reporting capacity, not necessarily in impact.`,
      }
    }

    // The event year can also be the last year on record: no post-event data
    // at all, not a 0% change. "X went from N to N" would read as a result.
    const noNewDataA = latestA.year === EVENT_YEAR
    const noNewDataB = latestB.year === EVENT_YEAR
    if (noNewDataA && noNewDataB) {
      return {
        key: m.key,
        text: `${m.label}: neither ${nationA} nor ${nationB} has data beyond ${EVENT_YEAR} in the official dataset.`,
      }
    }
    if (noNewDataA || noNewDataB) {
      const stalled = noNewDataA ? nationA : nationB
      const tracked = noNewDataA ? nationB : nationA
      const trackedRow = noNewDataA ? latestB : latestA
      const trackedEvent = noNewDataA ? eventB : eventA
      return {
        key: m.key,
        text: `${m.label}: ${stalled} has no data beyond ${EVENT_YEAR}, while ${tracked} went from ${m.format(
          trackedEvent[m.field]
        )} to ${m.format(trackedRow[m.field])} by ${trackedRow.year}.`,
      }
    }

    const pctA = pctChange(eventA[m.field], latestA[m.field])
    const pctB = pctChange(eventB[m.field], latestB[m.field])
    const sameDirection = pctA !== null && pctB !== null && Math.sign(pctA) === Math.sign(pctB)
    const gap = pctA !== null && pctB !== null ? Math.abs(pctA - pctB) : null

    // The pace verdict is only earned when both records cover the same span.
    // "A very different pace" across a four-year window and a two-year one is
    // partly just the extra two years, and that is the claim this whole
    // paragraph exists to avoid making.
    const sameWindow = latestA.year === latestB.year

    let comparison
    if (!sameDirection) comparison = 'opposite directions'
    else if (!sameWindow) comparison = 'the same direction'
    else if (gap !== null && gap < 25) comparison = 'a similar trajectory'
    else comparison = 'the same direction, but at a very different pace'

    const changeA = formatPct(pctA)
    const changeB = formatPct(pctB)

    const windowNote = sameWindow
      ? ''
      : ` The two records end in different years, so those percentages cover spans of different lengths and are not directly comparable.`

    return {
      key: m.key,
      text: `${m.label}: ${nationA} went from ${m.format(eventA[m.field])} to ${m.format(
        latestA[m.field]
      )} by ${latestA.year}${changeA ? ` (${changeA})` : ''}, ${nationB} from ${m.format(
        eventB[m.field]
      )} to ${m.format(latestB[m.field])} by ${latestB.year}${
        changeB ? ` (${changeB})` : ''
      } -- ${comparison} since ${EVENT_YEAR}.${windowNote}`,
    }
  })
}
