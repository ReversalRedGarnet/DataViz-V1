// Tooltip bodies. These return JSX rather than markup strings so the renderers
// stay free of hand-built HTML, and so useTooltip can render them into a single
// positioned node instead of one per chart.
//
// THE BUDGET: two or three short lines. A tooltip is a label on something the
// reader is already pointing at, not a place to put prose -- see the note in
// components/Tooltip.jsx for what happens when it becomes one. Anything longer
// than a line belongs under the chart, where it can be read without holding a
// pointer still.

export function pointTooltip(nation, year, value, format) {
  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">
        {year}: {format(value)}
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

export function stormPointTooltip(row) {
  const deaths =
    row.deaths == null
      ? 'Deaths not reported'
      : `${row.deaths} ${row.deaths === 1 ? 'death' : 'deaths'}${
          row.deathsKind === 'indirect' ? ', indirect' : ''
        }`

  // The researched `fact` and `deathsNote` used to be appended here, which is
  // what made this tooltip a wall of text. Neither is lost: both are printed in
  // full in the table below this chart, which is also what a screen reader
  // reads, and again in Follow the Storm, where each nation gets its own stop.
  // Nothing was removed from the dataset -- only from the hover.
  return (
    <>
      <p className="font-semibold">{row.name}</p>
      <p className="opacity-80">{categoryHeadline(row.categoryLabel)}</p>
      <p className="opacity-80">{deaths}</p>
    </>
  )
}

export function snapshotTooltip(row, format) {
  return (
    <>
      <p className="font-semibold">{row.nation}</p>
      <p className="opacity-80">{format(row.value)}</p>
    </>
  )
}

export function divergenceTooltip(nation, point, format) {
  const delta = point.index - 100
  const against =
    delta === 0 ? `level with ${point.baseYear}` : `${delta > 0 ? '+' : ''}${delta.toFixed(0)}% vs ${point.baseYear}`

  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">
        {point.year}: {format(point.raw)}
      </p>
      <p className="opacity-70">{against}</p>
    </>
  )
}
