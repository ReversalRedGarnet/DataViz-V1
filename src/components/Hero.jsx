import { useState } from 'react'
import PageHero from './PageHero.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import { STORMS, ROSTER_START, ROSTER_END } from '../content/storms.js'
import { NATIONS, NATION_COUNT } from '../content/nations.js'
import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { numberWordCapitalized } from '../utils/numberWords.js'

// The opening claim is a count, not a trend. Every figure in the headline is
// computed from the roster, so a change to content/storms.js reaches the first
// screen without anybody editing prose.
//
// The four nations are pressable, and pressing one lights its storms on the
// decade strip below. That is the whole interaction: the point is that the
// reader touches something before the first argument arrives, and finds out
// that the marks under the headline mean something.
export default function Hero({ style }) {
  const { setHighlight } = useNationHighlight()
  // Which nation the reader is pointing at, and whether they pinned it. Pinning
  // exists because hover does not: on a touch screen there is no pointer to
  // rest, and an opening whose only interaction is hover is an opening with no
  // interaction at all for half the audience.
  const [hovered, setHovered] = useState(null)
  const [pinned, setPinned] = useState(null)
  const active = hovered ?? pinned

  // Any interaction at all settles the ambient motion behind the title. The
  // atmosphere is an invitation, and an invitation that has been accepted has
  // no further business moving.
  const stirred = active != null

  const struck = active ? STORMS.filter((s) => s.nations.includes(active)) : []

  return (
    <PageHero
      kicker={`${ROSTER_START}\u2013${ROSTER_END} \u00b7 ${numberWordCapitalized(
        STORMS.length
      )} severe cyclones \u00b7 ${numberWordCapitalized(NATION_COUNT)} Pacific nations`}
      headline={`Between ${ROSTER_START} and ${ROSTER_END}, each of these nations was struck multiple times. No two recovered the same way.`}
      body={
        'Solomon Islands, Vanuatu, Fiji and Tonga share an ocean as well as a ' +
        'cyclone season. The same storm may sweep through different territories, ' +
        `yet the aftermath is seldom ever the same. ${numberWordCapitalized(STORMS.length)} ` +
        'severe storms, followed ' +
        'through official records from trusted sources and examined across key ' +
        'factors, reveal why the same weather can produce such different outcomes.'
      }
      atmosphere="hero"
      backdrop={scatterBackdrop('top')}
      className={`hero-atmos relative overflow-hidden ${stirred ? 'is-stirred' : ''}`}
      style={style}
    >

      {/* The thesis, on mobile only. It is in the header at every width from
          sm up; on a phone the header cannot afford it, so it lands here
          instead -- once, at the top of the piece, rather than on all fourteen
          sections. */}
      <p className="relative mt-3 font-serif text-base italic leading-snug text-ink/70 sm:hidden">
        Climate doesn&rsquo;t create inequality. It reveals it.
      </p>

      {/* The four nations, as the thing to touch first. Buttons, not labels:
          they are pressable, they say so, and they are in the tab order in the
          same order the map draws them. */}
      <ul className="relative mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:mt-8 short:mt-5">
        {NATIONS.map((nation) => {
          const isActive = active === nation.name
          return (
            <li key={nation.name}>
              <button
                type="button"
                aria-pressed={pinned === nation.name}
                onClick={() => setPinned((p) => (p === nation.name ? null : nation.name))}
                onPointerEnter={() => setHovered(nation.name)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(nation.name)}
                onBlur={() => setHovered(null)}
                {...highlightHandlers(nation.name, setHighlight)}
                className={`press-target min-h-[44px] rounded-full border px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
                  isActive
                    ? 'border-accent bg-accent/10 font-semibold text-accent'
                    : 'border-ink/20 bg-surface/60 hover:border-accent/60'
                }`}
              >
                {nation.name}
              </button>
            </li>
          )
        })}
      </ul>

      {/* The roster, as six marks on the decade. Idle, it is the storm count
          and the span the kicker states, drawn rather than spelled. Pointed at
          a nation, the marks that reached that nation light and the rest
          recede -- so the count in the headline and the count for one country
          are visibly the same six events seen two ways.

          Space is reserved for the sentence below, so lighting a nation moves
          nothing else on the slide. A hero that reflows under the pointer is a
          hero the reader stops pointing at. */}
      <div className="relative mx-auto mt-5 max-w-md sm:mt-6 short:mt-4">
        <ul className="flex items-end justify-center gap-3" aria-hidden="true">
          {STORMS.map((storm) => {
            const lit = active ? storm.nations.includes(active) : null
            return (
              <li key={storm.id} className="flex flex-col items-center gap-1.5">
                <span
                  className={`storm-pip h-2.5 w-2.5 rounded-full ${
                    lit === false ? 'bg-ink/15' : 'bg-accent'
                  } ${lit ? 'is-lit' : ''}`}
                />
                <span
                  className={`text-[10px] tabular-nums transition-opacity duration-200 ${
                    lit === false ? 'opacity-25' : 'opacity-60'
                  }`}
                >
                  {storm.year}
                </span>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 min-h-[3.25rem] text-sm leading-snug opacity-80 short:mt-3 short:min-h-[2.5rem]">
          {active ? (
            <>
              <span className="font-semibold">{active}</span> was in the path of{' '}
              <span className="font-semibold text-accent">{struck.length}</span> of these{' '}
              {STORMS.length} storms &mdash; {struck.map((s) => s.label).join(', ')}.
            </>
          ) : (
            <span className="opacity-70">
              Point at a country, or press one, to see its share of the decade.
            </span>
          )}
        </p>
      </div>

    </PageHero>
  )
}
