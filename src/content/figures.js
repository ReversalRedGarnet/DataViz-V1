// EVERY NUMBERED FIGURE ON THE PAGE, IN READING ORDER.
//
// The numbers under the charts are not counted at runtime, and that is the
// whole point of this file. A counter incremented on mount would produce a
// different numbering depending on what the reader had already unlocked: nine
// of the fourteen sections do not exist until a storm is chosen, the ripple
// chain renders one chart on a phone and five on a laptop, and the chain
// accordion mounts and unmounts panels as the reader opens them. "Fig 4" would
// mean a different chart at different moments, which is worse than no number
// at all -- a figure number's only job is to be a stable name someone can refer
// to.
//
// So the order is written down instead. It is the order the charts appear in
// App.jsx's section list, and it is checkable by reading this file against that
// one.
//
// A key that is rendered but missing here gets no number rather than a wrong
// one; see figureNumber below. Keys are prefixed by section so a glance tells
// you where one lives.
export const FIGURE_ORDER = [
  // big-picture -- the regional snapshot, one card per chain metric
  'snapshot-affected',
  'snapshot-crop',
  'snapshot-livestock',
  'snapshot-power',
  'snapshot-tourism',

  // ripple-chain -- the same five records over time
  'chain-affected',
  'chain-crop',
  'chain-livestock',
  'chain-power',
  'chain-tourism',

  // divergence -- indexed to each nation's own event-year figure
  'divergence-crop',
  'divergence-livestock',
  'divergence-power',
  'divergence-tourism',

  // context -- capacity first, then what is changing underneath
  'capacity-stations',
  'capacity-completeness',
  'context-sst',
  'context-ghg',
]

const NUMBERS = new Map(FIGURE_ORDER.map((key, i) => [key, i + 1]))

// The figure's number, or null for a key that was never registered.
//
// Null rather than a thrown error or a fallback number. A caption is
// supporting apparatus; a chart that renders without one is slightly less
// useful, while a chart that refuses to render because its caption could not be
// numbered is a blank panel where evidence should be. The typo is worth
// catching, but not at the reader's expense -- which is what the console
// warning below is for, in development only.
export function figureNumber(key) {
  const n = NUMBERS.get(key)
  if (n == null && import.meta.env?.DEV) {
    console.warn(`[figures] "${key}" is not in FIGURE_ORDER, so it will render without a number.`)
  }
  return n ?? null
}
