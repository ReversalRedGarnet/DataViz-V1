import { useState } from 'react'
import PageHero from './PageHero.jsx'
import { STORMS, ROSTER_START, ROSTER_END } from '../content/storms.js'
import { NATIONS } from './MapView.jsx'
import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { numberWordCapitalized } from '../utils/numberWords.js'

// The opening claim is a count, not a trend. Every figure in the headline is
// plain event-counting against the roster rule in content/storms.js, so a
// reader who doubts it can check it against the exclusions section rather than
// having to trust a confidence level.
//
// The kicker below is the same line the timeline slide opens with, and both
// now compute it. They were typed out separately, which is how a single roster
// came to assert its own size in four places -- see utils/numberWords.js.
//
// `body` is passed as an expression, not a quoted attribute. A JSX attribute
// written as "..." is a literal string, not a JS string, so \u escapes inside
// one are never processed -- they rendered on the live site as the raw text
// \u2014 in the middle of a sentence.
//
// WHAT CHANGED HERE, AND WHAT DID NOT.
//
// The words are the words. The claim, the scope and the roster figures are
// untouched, and nothing below reads a dataset the page did not already load:
// every fact in the interactive layer is counted out of STORMS, the same list
// the headline counts. What changed is that the opening now answers something.
// It used to end on the sentence "Pick a storm from the timeline to begin",
// which asks the reader to act on a control that is on the next slide -- so the
// only thing to do on the opening slide was leave it.
//
// Now the four nations are here as nodes: point at one, or press it on a touch
// screen, and the roster answers with that country's own share of it -- how
// many of the six storms reached it, and which years. That is the site's whole
// argument in miniature, made by the reader in about a second, and it is made
// out of the same event-counting the headline is making.
//
// There is no call-to-action button here any more. There were two forward
// controls on this slide saying the same thing -- a button in the body and the
// deck's own Next in the footer -- and two ways onward is one more than a
// reader needs to be told about. The deck's control now carries the wording
// (see `cue` in App.jsx), which puts the instruction in the place every other
// slide has trained the reader to look for it.
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
      )} severe cyclones \u00b7 ${numberWordCapitalized(NATIONS.length)} Pacific nations`}
      headline={`Between ${ROSTER_START} and ${ROSTER_END}, each of these nations was struck multiple times. No two recovered the same way.`}
      body={
        'Solomon Islands, Vanuatu, Fiji and Tonga share an ocean as well as a ' +
        'cyclone season. The same storm may sweep through different territories, ' +
        `yet the aftermath is seldom ever the same. ${numberWordCapitalized(STORMS.length)} ` +
        'severe storms, followed ' +
        'through official records from trusted sources and examined across key ' +
        'factors, reveal why the same weather can produce such different outcomes.'
      }
      className={`hero-atmos relative overflow-hidden ${stirred ? 'is-stirred' : ''}`}
      style={style}
    >
      <HeroAtmosphere />

      {/* The thesis, on mobile only. It is in the header at every width from
          sm up; on a phone the header cannot afford it, so it lands here
          instead -- once, at the top of the piece, rather than on all fourteen
          sections. */}
      <p className="relative mt-3 font-serif text-base italic leading-snug text-ink/70 sm:hidden">
        Climate doesn't create inequality. It reveals it.
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

// The weather behind the words.
//
// Three rings spreading from a point in the ocean, and a slow cyclone glyph off
// to one side. Both are drawn in accent at very low opacity and both animate
// transform and opacity only -- the two properties a browser can hand to the
// compositor -- for the reason given at length in styles/animations.css: a
// third of this site's likely audience is on mid-range Android over Pacific
// mobile data, and a hero that stutters is worse than a hero that is plain.
//
// It is decoration, so it carries no information, is hidden from assistive
// technology, settles once the reader has touched anything, and is removed
// entirely under prefers-reduced-motion. Nothing here is on the critical path:
// the nodes above are pressable on the first frame, whatever the rings are
// doing behind them.
function HeroAtmosphere() {
  return (
    <div aria-hidden="true" className="hero-atmos-layer">
      <span className="hero-ring" style={{ animationDelay: '0ms' }} />
      <span className="hero-ring" style={{ animationDelay: '2600ms' }} />
      <span className="hero-ring" style={{ animationDelay: '5200ms' }} />
      <svg className="hero-cyclone" viewBox="-20 -20 40 40" fill="none">
        <g className="cyclone-spin">
          <path d="M0,-3 C10,-13 22,-9 20,1 C16,-6 7,-7 0,-3 Z" fill="currentColor" />
          <path d="M0,3 C-10,13 -22,9 -20,-1 C-16,6 -7,7 0,3 Z" fill="currentColor" />
          <circle r="3.4" fill="currentColor" />
        </g>
      </svg>
    </div>
  )
}
