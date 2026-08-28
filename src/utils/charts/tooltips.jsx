// Tooltip bodies. These return JSX rather than markup strings so the renderers
// stay free of hand-built HTML, and so useTooltip can render them into a single
// positioned node instead of one per chart.
//
// THE BUDGET: two or three short lines. A tooltip is a label on something the
// reader is already pointing at, not a place to put prose -- see the note in
// components/Tooltip.jsx for what happens when it becomes one. Anything longer
// than a line belongs under the chart, where it can be read without holding a
// pointer still.
//
// `nation` arguments below are already display strings (the renderer that
// calls these has resolved nationLabel(name, language) before handing it
// over) -- these functions are presentational only and don't themselves know
// which language a raw nation name should render in.
import { pluralize } from '../pluralize.js'

const STRINGS = {
  en: {
    deathsNotReported: 'Deaths not reported',
    death: 'death',
    deaths: 'deaths',
    indirect: ', indirect',
    levelWith: (year) => `level with ${year}`,
    vs: (year) => `vs ${year}`,
  },
  fr: {
    deathsNotReported: 'Décès non recensés',
    death: 'décès',
    deaths: 'décès',
    indirect: ', indirects',
    levelWith: (year) => `au niveau de ${year}`,
    vs: (year) => `vs ${year}`,
  },
}

export function pointTooltip(nation, year, value, format, language = 'en') {
  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">
        {year}: {format(value, language)}
      </p>
    </>
  )
}

// The category label carries its headline and then a qualification -- "Category
// 4 at landfall on Maewo and Pentecost; had peaked at Category 5 on 24 October".
// The first clause is the answer to "what hit here"; the rest is history, and it
// is already in the table under the chart.
function categoryHeadline(label) {
  if (!label) return null
  return label.split(';')[0].trim()
}

// `nation` -- already resolved to a display string by the caller, same
// convention as the other tooltips here; stormProfileChart.js passes
// nationLabel(row.name, language). `language` drives the deaths sentence
// itself: singular/plural selection (French treats zero as singular; see
// utils/pluralize.js) and the "not reported" / "indirect" wording.
export function stormPointTooltip(row, nation, language = 'en') {
  const t = STRINGS[language]
  const deaths =
    row.deaths == null
      ? t.deathsNotReported
      : `${row.deaths} ${pluralize(row.deaths, { one: t.death, other: t.deaths }, language)}${
          row.deathsKind === 'indirect' ? t.indirect : ''
        }`

  // The researched `fact` and `deathsNote` used to be appended here, which is
  // what made this tooltip a wall of text. Neither is lost: both are printed in
  // full in the table below this chart, which is also what a screen reader
  // reads, and again in Follow the Storm, where each nation gets its own stop.
  // Nothing was removed from the dataset -- only from the hover.
  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">{categoryHeadline(row.categoryLabel)}</p>
      <p className="opacity-80">{deaths}</p>
    </>
  )
}

export function snapshotTooltip(nation, value, format, language = 'en') {
  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">{format(value, language)}</p>
    </>
  )
}

export function divergenceTooltip(nation, point, format, language = 'en') {
  const t = STRINGS[language]
  const delta = point.index - 100
  const against =
    delta === 0 ? t.levelWith(point.baseYear) : `${delta > 0 ? '+' : ''}${delta.toFixed(0)}% ${t.vs(point.baseYear)}`

  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">
        {point.year}: {format(point.raw, language)}
      </p>
      <p className="opacity-70">{against}</p>
    </>
  )
}
