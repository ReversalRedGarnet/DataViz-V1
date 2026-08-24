import { CHAIN_METRICS } from '../utils/metrics.js'

// What one link of the ripple chain actually is, opened in place.
//
// Everything printed here is either the metric's own caveat -- the same
// sentence that sits under its chart, moved nowhere and shortened not at all --
// or counted out of the rows already loaded for the selected countries. There
// are no new figures, no new sources and no new claims: the panel answers "what
// am I looking at, and how much of it was actually reported", which is the
// question a reader has at the moment they press a link, and it answers it
// without sending them to the method section and back.
//
// The coverage line is the part worth having. A chart with four points and a
// chart with twelve look equally confident, and this is the only place the
// difference is stated in words -- including how many of those points are
// reported zeros rather than gaps, a distinction this project refuses to blur
// anywhere else and will not start blurring here.
//
// Props:
//   metric -- one of CHAIN_METRICS
//   rows -- that metric's rows, already filtered to the selected nations
//   nations -- the selected nations, in order
//   onClose -- () => void
function coverage(rows, nation, field) {
  const mine = rows.filter((r) => r.nation === nation)
  if (mine.length === 0) return { reported: 0 }
  const years = mine.map((r) => r.year)
  const zeros = mine.filter((r) => r[field] === 0).length
  return {
    reported: mine.length,
    from: Math.min(...years),
    to: Math.max(...years),
    zeros,
  }
}

export default function MetricDetail({ metric, rows, nations, onClose }) {
  const stage = CHAIN_METRICS.findIndex((m) => m.key === metric.key)
  const before = CHAIN_METRICS[stage - 1]
  const after = CHAIN_METRICS[stage + 1]

  return (
    <div className="mt-4 rounded-xl border border-accent/30 bg-surface/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-eyebrow text-accent">
            Link {stage + 1} of {CHAIN_METRICS.length}
          </p>
          <h3 className="type-h3 mt-0.5 text-base">{metric.label}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] shrink-0 rounded-full px-3 text-xs underline decoration-ink/30 underline-offset-2 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Close
        </button>
      </div>

      {/* Where this link sits, said rather than implied by grid position. The
          order of the chain is an argument -- the damage travels this way --
          and a reader who has opened one card should not have to count cards
          to see what it follows. */}
      <p className="mt-2 text-xs opacity-70">
        {before ? `Follows ${before.label.toLowerCase()}. ` : 'The first link: who the storm reached. '}
        {after ? `Feeds into ${after.label.toLowerCase()}.` : 'The last link in the chain.'}
      </p>

      <ul className="mt-3 space-y-1 text-xs">
        {nations.map((nation) => {
          const c = coverage(rows, nation, metric.field)
          return (
            <li key={nation} className="flex flex-wrap gap-x-2 opacity-80">
              <span className="font-semibold">{nation}:</span>
              {c.reported === 0 ? (
                <span className="italic">nothing reported for this metric.</span>
              ) : (
                <span className="tabular-nums">
                  {c.reported} {c.reported === 1 ? 'year' : 'years'} reported, {c.from}&ndash;{c.to}
                  {c.zeros > 0 && (
                    <span className="not-italic">
                      {' '}
                      &middot; {c.zeros} of them a reported zero, not a gap
                    </span>
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-3 border-l-2 border-ink/15 pl-3 text-xs italic leading-snug opacity-75">
        {metric.caveat}
      </p>
    </div>
  )
}
