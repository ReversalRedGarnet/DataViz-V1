import Section from './Section.jsx'
import { NATIONS } from './MapView.jsx'
import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { STORMS, ROSTER_START, ROSTER_END, strikeCounts } from '../content/storms.js'

const NATION_NAMES = NATIONS.map((n) => n.name)
const YEARS = Array.from({ length: ROSTER_END - ROSTER_START + 1 }, (_, i) => ROSTER_START + i)

// The opening. Six storms on a ten-year axis, and the strike count per nation
// above it.
//
// The count is the claim, not the calendar. An earlier draft of this project
// planned to open on year-clustering -- "they keep getting hit in bursts" --
// and the roster does not support it: one year of the ten holds more than one
// storm. Counting per nation instead says something the data does show, and
// says it without any trend or attribution claim attached. Every one of these
// four countries was in the path of three or four severe cyclones in ten years.
//
// That reasoning used to be spelled out on the slide in three paragraphs. It
// isn't any more -- the argument is the picture, and a reader who wants the
// roster rule in prose finds it in the method section. One sentence states the
// scope and the timeline does the rest.
//
// Nothing is selected on load. The timeline is the argument; the storm chosen
// from it is the evidence, and the reader picks which piece to look at. That
// makes the chips the only control on the slide and nothing on the page moves
// until one is pressed, so they carry more selection affordance than a resting
// card normally would -- see .awaiting-press in styles/animations.css.
//
// Props:
//   selectedId -- id of the chosen storm, or null
//   onSelect -- (id) => void, toggles selection
//   style -- forwarded to Section (entrance stagger)

// How much of the region a storm covered, as four pips rather than a fraction.
// Scanning the timeline, this is the one comparison worth having pre-attentive:
// Harold reached all four, everything else reached two. Order is fixed (the
// NATIONS order) so the glyph means the same thing on every card, and the whole
// thing is aria-hidden because the button's own label already says "struck N of
// four nations" in words.
function CoverageDots({ struck }) {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center gap-[3px]">
      {NATION_NAMES.map((nation) => (
        <span
          key={nation}
          className={`h-[5px] w-[5px] rounded-full ${
            struck.includes(nation) ? 'bg-accent' : 'bg-ink/25'
          }`}
        />
      ))}
    </span>
  )
}

// One storm, pressable. Shared by both layouts below so the two can't drift --
// only the scaffolding around them differs between wide and narrow screens.
//
// `awaiting` is true only while no storm at all is chosen. It drives the faint
// accent ring that marks these as the thing to press; once the reader has
// pressed one, the invitation has been accepted and every ring stops.
function StormCard({ storm, active, awaiting, onSelect, delay = 0, row = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(active ? null : storm.id)}
      aria-pressed={active}
      aria-label={`${storm.name}, ${storm.year}. Struck ${storm.nations.length} of four nations.`}
      style={awaiting ? { animationDelay: `${delay}ms` } : undefined}
      className={`press-target relative cursor-pointer rounded-lg border px-2.5 py-2 text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
        active
          ? 'border-accent bg-accent/10 font-semibold'
          : 'border-ink/20 bg-surface/70 hover:border-accent/60 hover:bg-surface'
      } ${awaiting ? 'awaiting-press' : ''} ${
        row ? 'flex w-full items-center justify-between gap-3' : ''
      }`}
    >
      <span className="block text-xs leading-tight">{storm.label}</span>
      <span className={`flex items-center gap-1.5 ${row ? 'shrink-0' : 'mt-1.5'}`}>
        <CoverageDots struck={storm.nations} />
        <span className="text-[10px] leading-none tabular-nums opacity-60">
          {storm.nations.length} of 4
        </span>
      </span>
    </button>
  )
}

export default function StormTimeline({ selectedId, onSelect, style }) {
  const { setHighlight } = useNationHighlight()
  const counts = strikeCounts(NATION_NAMES)
  const awaiting = selectedId == null
  const axisLabel = `Severe cyclones by year, ${ROSTER_START} to ${ROSTER_END}`

  // Stagger index, assigned in roster order rather than per year, so the rings
  // travel left to right across the axis instead of pulsing in unison.
  const delayOf = (id) => STORMS.findIndex((s) => s.id === id) * 260

  return (
    <Section style={style}>
      {/*
        One column, full width. This slide used to be split -- prose left,
        evidence right -- because the prose ran long enough that stacking cost
        the reader a scroll to reach the roster it justified. With the argument
        down to a single sentence there is nothing left to put in a side column,
        and a timeline is the one chart that actually wants the full measure.
      */}
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        {ROSTER_START}&ndash;{ROSTER_END} &middot; Six severe cyclones &middot; Four Pacific nations
      </p>
      <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
        How often, and to whom
      </h2>
      <p className="max-w-prose text-sm opacity-80">
        This site records every severe cyclone that struck more than one of these four nations from{' '}
        {ROSTER_START}&ndash;{ROSTER_END}.
      </p>

      {/* The cards take focus so a keyboard user can reach the cross-chart
          highlight, which is otherwise pointer-only. A focusable element with
          no accessible name is worse than one that cannot be focused at all --
          it becomes a stop on the tab order that announces nothing -- so each
          carries its own full sentence and the decorative split between the
          number and its label is hidden from assistive tech. */}
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(({ nation, count }) => (
          <li
            key={nation}
            tabIndex={0}
            aria-label={`${count} severe cyclones struck ${nation} between ${ROSTER_START} and ${ROSTER_END}.`}
            className="cursor-help rounded-xl border border-ink/10 bg-surface/60 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
            {...highlightHandlers(nation, setHighlight)}
          >
            <p aria-hidden="true" className="font-serif text-2xl font-semibold leading-none tabular-nums">
              {count}
            </p>
            <p aria-hidden="true" className="mt-1 text-xs leading-snug opacity-70">
              severe cyclones struck {nation}
            </p>
          </li>
        ))}
      </ul>

      {/* A UI label, not a sentence: the chips are the only control on the
          slide and the ring alone can't say what pressing one is for. */}
      <p className="mt-7 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        Select a cyclone
      </p>

      {/*
        WIDE: a conventional horizontal timeline. One grid column per year, so
        the ten-year axis is drawn to scale and the empty stretches are as wide
        as the busy ones -- the gaps are part of what the axis is showing. The
        axis rule is the columns' own top border with no column gap between
        them, which is what makes it read as one continuous line rather than
        ten segments. Cards sit on the axis and stack upward, so 2023's two
        storms grow into the space above rather than squeezing sideways.
      */}
      <ol
        aria-label={axisLabel}
        className="mt-3 hidden lg:grid"
        style={{ gridTemplateColumns: `repeat(${YEARS.length}, minmax(0, 1fr))` }}
      >
        {YEARS.map((year) => {
          const storms = STORMS.filter((s) => s.year === year)
          const hit = storms.length > 0
          return (
            <li key={year} className="flex flex-col">
              <div className="flex flex-1 flex-col justify-end gap-2 px-1">
                {storms.map((storm) => (
                  <StormCard
                    key={storm.id}
                    storm={storm}
                    active={storm.id === selectedId}
                    awaiting={awaiting}
                    delay={delayOf(storm.id)}
                    onSelect={onSelect}
                  />
                ))}
              </div>
              {/* Stem from card to axis. Drawn only where there is a card to
                  connect, and reserved as empty space where there isn't, so
                  every column's axis rule lands on the same baseline. */}
              <div aria-hidden="true" className={`mx-auto h-4 w-px ${hit ? 'bg-ink/25' : ''}`} />
              <div className="relative border-t border-ink/15 pt-2">
                <span
                  aria-hidden="true"
                  className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    hit ? 'h-2 w-2 bg-accent' : 'h-1 w-1 bg-ink/25'
                  }`}
                />
                <p
                  className={`text-center text-xs tabular-nums ${
                    hit ? 'font-semibold opacity-80' : 'opacity-40'
                  }`}
                >
                  {year}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      {/*
        NARROW: the same axis turned on its side. A spine with a dot per year
        and full-width cards hanging off it -- deliberately full-width, because
        the previous version sized each chip to its own label and a row of
        variable-length blocks off a left-hand year axis read as a bar chart
        whose bars meant nothing. Years without a storm keep their tick and
        their label but collapse to a fraction of the height, so ten years fit
        on a phone without pretending the empty ones aren't there.
      */}
      <ol aria-label={axisLabel} className="mt-3 ml-11 border-l border-ink/15 lg:hidden">
        {YEARS.map((year) => {
          const storms = STORMS.filter((s) => s.year === year)
          const hit = storms.length > 0
          return (
            <li key={year} className={`relative ${hit ? 'py-2' : 'py-1.5'}`}>
              <span
                className={`absolute -left-11 top-2 w-8 text-right text-xs tabular-nums ${
                  hit ? 'font-semibold opacity-80' : 'opacity-40'
                }`}
              >
                {year}
              </span>
              <span
                aria-hidden="true"
                className={`absolute left-0 top-2.5 -translate-x-1/2 rounded-full ${
                  hit ? 'h-2 w-2 bg-accent' : 'h-1 w-1 bg-ink/25'
                }`}
              />
              {hit ? (
                <div className="ml-4 space-y-2">
                  {storms.map((storm) => (
                    <StormCard
                      key={storm.id}
                      storm={storm}
                      active={storm.id === selectedId}
                      awaiting={awaiting}
                      delay={delayOf(storm.id)}
                      onSelect={onSelect}
                      row
                    />
                  ))}
                </div>
              ) : (
                <div aria-hidden="true" className="h-1" />
              )}
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
