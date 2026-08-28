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
      // FOUR BOLD PHRASES, AND THEY ARE THE DECK'S SPINE.
      //
      // Not emphasis in the ordinary sense -- nothing here is being said
      // louder. Each phrase names a section the reader is about to reach: the
      // same storm is the timeline and the journey, the aftermath is the
      // ripple chain, the records are the capacity section, and different
      // outcomes is the divergence view. Read the bold alone and it is the
      // argument in four beats; read the paragraph and the bold is invisible
      // until it is useful.
      //
      // Which is also the constraint on ever adding a fifth. The device works
      // because the bold set is small enough to take in at a glance and maps
      // onto something; a paragraph with eight bold phrases is a paragraph
      // with none.
      body={
        <>
          Solomon Islands, Vanuatu, Fiji and Tonga share an ocean as well as a cyclone season.{' '}
          <strong className="font-semibold">The same storm</strong> may sweep through different
          territories, yet <strong className="font-semibold">the aftermath</strong> is seldom ever
          the same. {numberWordCapitalized(STORMS.length)} severe storms, followed through{' '}
          <strong className="font-semibold">official records</strong> from trusted sources and
          examined across key factors, reveal why the same weather can produce such{' '}
          <strong className="font-semibold">different outcomes</strong>.
        </>
      }
      // THE TITLE CARD IS NOW DRESSED LIKE EVERY OTHER SLIDE, and the
      // exception it used to be is what this replaces.
      //
      // It carried three background treatments of its own: the loud 'hero'
      // atmosphere (three rings at full strength on a fast cycle), a coastline
      // and storm-track wash, and no margin weave -- the one section on the
      // site opting out of the scatter. The reasoning was that an opening
      // should announce itself. What it produced was a first screen with more
      // decoration on it than any slide that actually had something to show,
      // and a piece whose visual system started one slide late.
      //
      // So: the ambient atmosphere every section gets, and the same weave
      // seeded with this section's own id. The coastline moved to the opening
      // poem (components/CoastlineWash.jsx), where it is the only picture on
      // the slide instead of the third layer on this one.
      //
      // `atmosphere` is omitted rather than set: Section already defaults to
      // 'ambient', and passing it explicitly would suggest a choice being made
      // here that isn't.
      backdrop={scatterBackdrop('top')}
      // hero-atmos and is-stirred stay. They are Hero's own interactivity --
      // the rings settle once the reader touches a nation -- and that is a
      // property of this slide having something to touch, not of which
      // atmosphere variant is running. It works the same against one ring.
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
                    lit === false ? 'opacity-faint' : 'opacity-soft'
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
