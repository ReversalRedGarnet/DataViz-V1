import Section from './Section.jsx'
import { NATIONS } from './MapView.jsx'
import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { STORMS, ROSTER_START, ROSTER_END, strikeCounts } from '../content/storms.js'

const NATION_NAMES = NATIONS.map((n) => n.name)
const YEARS = Array.from({ length: ROSTER_END - ROSTER_START + 1 }, (_, i) => ROSTER_START + i)

// The opening. Six storms on a ten-year axis, and the strike count per nation
// underneath.
//
// The count is the claim, not the calendar. An earlier draft of this project
// planned to open on year-clustering -- "they keep getting hit in bursts" --
// and the roster does not support it: one year of the ten holds more than one
// storm. Counting per nation instead says something the data does show, and
// says it without any trend or attribution claim attached. Every one of these
// four countries was in the path of three or four severe cyclones in ten years.
//
// Nothing is selected on load. The timeline is the argument; the storm chosen
// from it is the evidence, and the reader picks which piece to look at.
//
// Props:
//   selectedId -- id of the chosen storm, or null
//   onSelect -- (id) => void, toggles selection
//   style -- forwarded to Section (entrance stagger)
export default function StormTimeline({ selectedId, onSelect, style }) {
  const { setHighlight } = useNationHighlight()
  const counts = strikeCounts(NATION_NAMES)

  return (
    <Section style={style}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        {ROSTER_START}&ndash;{ROSTER_END} &middot; Six severe cyclones &middot; Four Pacific nations
      </p>
      <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
        How often, and to whom
      </h2>
      <p className="prose-column mb-6 max-w-prose text-sm opacity-80">
        Every severe tropical cyclone that struck two or more of these four nations between{' '}
        {ROSTER_START} and {ROSTER_END}. The rule was fixed before the list was drawn, and the
        storms it excludes are shown further down &mdash; including one that would have suited the
        argument. Pick any storm to follow what happened after it.
      </p>

      {/* The count, stated before the timeline, because it is the actual claim
          and the timeline is only where it comes from. */}
      <ul className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(({ nation, count }) => (
          <li
            key={nation}
            tabIndex={0}
            className="cursor-help rounded-xl border border-ink/10 bg-surface/60 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            {...highlightHandlers(nation, setHighlight)}
          >
            <p className="font-serif text-3xl font-semibold leading-none tabular-nums">{count}</p>
            <p className="mt-1.5 text-xs leading-snug opacity-70">
              severe cyclones struck {nation}
            </p>
          </li>
        ))}
      </ul>

      <ol className="relative space-y-2">
        {YEARS.map((year) => {
          const storms = STORMS.filter((s) => s.year === year)
          return (
            <li key={year} className="flex items-start gap-3">
              <span className="w-11 shrink-0 pt-2 text-xs font-medium tabular-nums opacity-50">
                {year}
              </span>
              {storms.length === 0 ? (
                // An empty year is drawn, not skipped: the gaps are part of
                // what the ten-year axis is showing.
                <span aria-hidden="true" className="mt-4 h-px flex-1 bg-ink/10" />
              ) : (
                <span className="flex flex-1 flex-wrap gap-2">
                  {storms.map((storm) => {
                    const active = storm.id === selectedId
                    return (
                      <button
                        key={storm.id}
                        type="button"
                        onClick={() => onSelect(active ? null : storm.id)}
                        aria-pressed={active}
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? 'border-accent bg-accent/10 font-semibold'
                            : 'border-ink/15 hover:border-ink/35 hover:bg-surface/60'
                        }`}
                      >
                        <span className="block">{storm.label}</span>
                        <span className="block text-xs opacity-65">
                          {storm.nations.length} of 4 nations
                        </span>
                      </button>
                    )
                  })}
                </span>
              )}
            </li>
          )
        })}
      </ol>

      <p className="mt-6 max-w-prose text-xs italic opacity-70">
        Counting years rather than nations would tell a different and weaker story: only one year
        in ten holds more than one of these storms. The recurrence here is in the countries, not
        in the calendar.
      </p>
    </Section>
  )
}
