import { CHAIN_METRICS, metricLabel } from './metrics.js'
import { pctChange } from './rows.js'
import { nationLabel, nationListInProse, nationListIsPlural } from '../content/nations.js'

// One bullet per metric, comparing the two selected nations from the event year
// to the latest on record. Deliberately not a ranking of "most interesting"
// findings: every bullet traces back to a specific chart above it.
//
// Bullets stay short on purpose: the chart above already shows each nation's
// full trajectory, so the text only needs to carry what the chart can't --
// the verdict and the two percentages. The full "went from X to Y" phrasing
// used to duplicate the chart and was the wordiest part of the page for what
// is meant to be its headline takeaway.
//
// Records don't all end in the same year. Fiji's tourist arrivals run to 2024
// while Tonga's and Vanuatu's stop at 2022, so an unqualified "+452% against
// +94% since 2020" compares a four-year recovery with a two-year one and reads
// as a gap in outcome when part of it is a gap in the calendar. Where the two
// end years differ, the bullet still says so, just in fewer words.
//
// Returns { items, summary }. items is [{ key, text, comparison }], always
// exactly CHAIN_METRICS.length entries; comparison is only set on entries
// with a real two-nation comparison (undefined for reporting-gap and
// no-new-data cases, which summary excludes). summary is a single sentence
// naming how many of the comparable metrics moved in opposite directions, or
// null when fewer than two metrics are comparable -- not enough to summarise.
//
// `comparison` stays one of the four internal English keys below regardless
// of `language` -- RippleChain.jsx filters on it (=== 'opposite') to count the
// summary, so it has to be a stable code, not display text. `text`, `summary`
// and the resolved metric label (via metricLabel()) are the translated parts.

function formatPct(p) {
  if (p === null) return null
  const sign = p > 0 ? '+' : ''
  return `${sign}${p.toFixed(0)}%`
}

const STRINGS = {
  en: {
    notReportedEither: (label, a, b) =>
      `${label}: not reliably reported for either ${a} or ${b} in the official dataset.`,
    gapReporting: (label, present, missing) =>
      `${label}: reported for ${present} but not for ${missing} -- a gap in reporting capacity, not necessarily in impact.`,
    neitherHasData: (label, a, b, year) =>
      `${label}: neither ${a} nor ${b} has data beyond ${year} in the official dataset.`,
    stalledVsTracked: (label, stalled, stalledPlural, year, tracked, trackedPlural, from, to, toYear) =>
      `${label}: ${stalled} has no data beyond ${year}, while ${tracked} went from ${from} to ${to} by ${toYear}.`,
    comparisonWord: {
      opposite: 'opposite directions',
      sameDirNoWindow: 'the same direction',
      similar: 'a similar trajectory',
      samePaceDiffers: 'the same direction, but at a very different pace',
    },
    comparisonSentence: (label, comparisonText, year, a, changeA, b, changeB, windowNote) =>
      `${label}: ${comparisonText} since ${year} (${a} ${changeA ?? '\u2014'}, ${b} ${changeB ?? '\u2014'}).${windowNote}`,
    windowNote: ' Spans differ in length, so these percentages aren\u2019t directly comparable.',
    dash: '\u2014',
    summary: (opposing, comparable, year) =>
      `${opposing} of ${comparable} comparable metrics moved in opposite directions since ${year}.`,
  },
  fr: {
    notReportedEither: (label, a, b) =>
      `${label}\u00A0: non recensé de façon fiable pour ${a} ni pour ${b} dans le jeu de données officiel.`,
    gapReporting: (label, present, missing) =>
      `${label}\u00A0: déclaré pour ${present} mais pas pour ${missing} \u2014 un écart de capacité de déclaration, pas nécessairement d\u2019impact.`,
    neitherHasData: (label, a, b, year) =>
      `${label}\u00A0: ni ${a} ni ${b} n\u2019ont de données au-delà de ${year} dans le jeu de données officiel.`,
    stalledVsTracked: (label, stalled, stalledPlural, year, tracked, trackedPlural, from, to, toYear) =>
      `${label}\u00A0: ${stalled} ${stalledPlural ? 'n’ont' : 'n’a'} pas de données au-delà de ${year}, tandis que ${tracked} ${trackedPlural ? 'sont passées' : 'est passé'} de ${from} à ${to} d’ici ${toYear}.`,
    comparisonWord: {
      opposite: 'directions opposées',
      sameDirNoWindow: 'la même direction',
      similar: 'une trajectoire similaire',
      samePaceDiffers: 'la même direction, mais à un rythme très différent',
    },
    comparisonSentence: (label, comparisonText, year, a, changeA, b, changeB, windowNote) =>
      `${label}\u00A0: ${comparisonText} depuis ${year} (${a} ${changeA ?? '\u2014'}, ${b} ${changeB ?? '\u2014'}).${windowNote}`,
    windowNote:
      ' Les périodes couvertes diffèrent en longueur, donc ces pourcentages ne sont pas directement comparables.',
    dash: '\u2014',
    summary: (opposing, comparable, year) =>
      `${opposing} indicateur(s) comparable(s) sur ${comparable} a (ont) évolué en directions opposées depuis ${year}.`,
  },
}

export function buildComparativeInsights(data, nationA, nationB, eventYear, language = 'en') {
  const t = STRINGS[language]
  if (!data) return { items: [], summary: null }

  const nameA = nationLabel(nationA, language)
  const nameB = nationLabel(nationB, language)
  // Prose forms -- see nationListInProse: unlike nameA/nameB above (the bare
  // label form used everywhere below as a value's neighbour, e.g.
  // "Fidji +12%"), a nation named as the object of a verb or preposition in a
  // full sentence ("pour Fidji ni pour...") needs this instead.
  const proseA = nationListInProse([nationA], language)
  const proseB = nationListInProse([nationB], language)

  const items = CHAIN_METRICS.map((m) => {
    const label = metricLabel(m, language)
    const rowsA = (data[m.key] ?? []).filter((d) => d.nation === nationA).sort((a, b) => a.year - b.year)
    const rowsB = (data[m.key] ?? []).filter((d) => d.nation === nationB).sort((a, b) => a.year - b.year)
    const eventA = rowsA.find((r) => r.year === eventYear)
    const latestA = rowsA[rowsA.length - 1]
    const eventB = rowsB.find((r) => r.year === eventYear)
    const latestB = rowsB[rowsB.length - 1]

    const hasA = Boolean(eventA && latestA)
    const hasB = Boolean(eventB && latestB)

    if (!hasA && !hasB) {
      return { key: m.key, text: t.notReportedEither(label, proseA, proseB) }
    }
    if (!hasA || !hasB) {
      const missing = hasA ? proseB : proseA
      const present = hasA ? proseA : proseB
      return { key: m.key, text: t.gapReporting(label, present, missing) }
    }

    // The event year can also be the last year on record: no post-event data
    // at all, not a 0% change. "X went from N to N" would read as a result.
    const noNewDataA = latestA.year === eventYear
    const noNewDataB = latestB.year === eventYear
    if (noNewDataA && noNewDataB) {
      return { key: m.key, text: t.neitherHasData(label, proseA, proseB, eventYear) }
    }
    if (noNewDataA || noNewDataB) {
      const stalledNation = noNewDataA ? nationA : nationB
      const trackedNation = noNewDataA ? nationB : nationA
      const trackedRow = noNewDataA ? latestB : latestA
      const trackedEvent = noNewDataA ? eventB : eventA
      return {
        key: m.key,
        text: t.stalledVsTracked(
          label,
          nationListInProse([stalledNation], language),
          nationListIsPlural([stalledNation]),
          eventYear,
          nationListInProse([trackedNation], language),
          nationListIsPlural([trackedNation]),
          m.format(trackedEvent[m.field], language),
          m.format(trackedRow[m.field], language),
          trackedRow.year
        ),
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

    // Internal key, stable across languages -- see the note at the top of
    // this file. comparisonWord[comparison] is the only translated form.
    let comparison
    if (!sameDirection) comparison = 'opposite'
    else if (!sameWindow) comparison = 'sameDirNoWindow'
    else if (gap !== null && gap < 25) comparison = 'similar'
    else comparison = 'samePaceDiffers'

    const changeA = formatPct(pctA)
    const changeB = formatPct(pctB)

    const windowNote = sameWindow ? '' : t.windowNote

    return {
      key: m.key,
      comparison,
      text: t.comparisonSentence(
        label,
        t.comparisonWord[comparison],
        eventYear,
        nameA,
        changeA,
        nameB,
        changeB,
        windowNote
      ),
    }
  })

  const comparable = items.filter((item) => item.comparison !== undefined)
  const opposing = comparable.filter((item) => item.comparison === 'opposite')
  const summary = comparable.length >= 2 ? t.summary(opposing.length, comparable.length, eventYear) : null

  return { items, summary }
}
