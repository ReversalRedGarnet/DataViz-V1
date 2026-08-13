// Tooltip bodies. These return JSX rather than markup strings so the renderers
// stay free of hand-built HTML, and so useTooltip can render them into a
// single positioned node instead of one per chart.

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

export function stormPointTooltip(row) {
  return (
    <>
      <p className="font-semibold">{row.name}</p>
      <p className="opacity-80">{row.categoryLabel}</p>
      <p className="opacity-80">
        {row.deaths == null
          ? 'Deaths not reported'
          : `${row.deaths} ${row.deaths === 1 ? 'death' : 'deaths'}${
              row.deathsKind === 'indirect' ? ', indirect' : ''
            }`}
      </p>
      {row.deathsNote && <p className="mt-1 italic opacity-70">{row.deathsNote}</p>}
      <p className="mt-1 opacity-70">{row.fact}</p>
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
  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">
        {point.year}: {format(point.raw)}
      </p>
      <p className="mt-1 opacity-70">
        {delta === 0 ? 'level with' : `${delta > 0 ? '+' : ''}${delta.toFixed(0)}% against`} its own{' '}
        {point.baseYear} figure
      </p>
    </>
  )
}
