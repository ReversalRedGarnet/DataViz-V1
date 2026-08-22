import { useState } from 'react'
import Section from './Section.jsx'
import { NATIONS } from './MapView.jsx'
import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { STORMS, ROSTER_START, ROSTER_END, strikeCounts } from '../content/storms.js'
import { numberWord, numberWordCapitalized } from '../utils/numberWords.js'
import { formatNationList } from '../utils/formatNationList.js'

const NATION_NAMES = NATIONS.map((n) => n.name)
const YEARS = Array.from({ length: ROSTER_END - ROSTER_START + 1 }, (_, i) => ROSTER_START + i)

// Counts set in words, because the eyebrow and the button labels are prose and
// a digit reads as data there. The helper is shared -- see utils/numberWords.js
// for the drift it closes and why the roster figures are computed rather than
// typed.
const NATION_COUNT_WORD = numberWord(NATION_NAMES.length)

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
function StormCard({ storm, active, awaiting, onSelect, onPreview, delay = 0, row = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(active ? null : storm.id)}
      // Pointer and focus both, always together. The preview below is the only
      // place a storm's own facts appear before it is chosen, and a preview
      // reachable only by hover is a preview that does not exist on a phone or
      // to a keyboard -- so every one of these four events writes to the same
      // state, and pressing the card commits it.
      onPointerEnter={() => onPreview(storm.id)}
      onPointerLeave={() => onPreview(null)}
      onFocus={() => onPreview(storm.id)}
      onBlur={() => onPreview(null)}
      aria-pressed={active}
      aria-label={`${storm.name}, ${storm.year}. Struck ${storm.nations.length} of ${NATION_COUNT_WORD} nations.`}
      style={awaiting ? { animationDelay: `${delay}ms` } : undefined}
      className={`press-target storm-card relative min-h-[44px] cursor-pointer rounded-lg border px-2.5 py-2 text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
        active
          ? 'is-active border-accent bg-accent/10 font-semibold'
          : 'border-ink/20 bg-surface/70 hover:border-accent/60 hover:bg-surface'
      } ${awaiting ? 'awaiting-press' : ''} ${
        row ? 'flex w-full items-center justify-between gap-3' : ''
      }`}
    >
      <span className="flex items-center gap-1.5 text-xs leading-tight">
        {/* The selected card is the story's current state, so it says so with
            a mark as well as a colour -- the brief's "do not rely on colour
            alone", applied to the one control the whole page hangs off. */}
        {active && (
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        )}
        <span className="truncate">{storm.label}</span>
      </span>
      <span className={`flex items-center gap-1.5 ${row ? 'shrink-0' : 'mt-1.5'}`}>
        <CoverageDots struck={storm.nations} />
        <span className="text-[10px] leading-none tabular-nums opacity-60">
          {storm.nations.length} of {NATION_NAMES.length}
        </span>
      </span>
    </button>
  )
}

// The storm under the reader's attention, in four facts and one sentence.
//
// Every word of it is already in the roster -- name, year, which of the four
// nations it reached, and the storm's own opening line from its first stop.
// Nothing is written here that a reader could not check against
// content/storms.js, and no storm gets a sentence invented to make it sound
// more interesting than the record makes it.
//
// It shows the hovered or focused storm if there is one, and otherwise the
// selected storm, so the panel is never empty once a choice has been made and
// the reader can always see what they picked. The box holds its height whether
// or not it has anything in it: a timeline that grows a panel under the cursor
// pushes the axis the reader is aiming at out from under them.
function StormPreview({ storm, selected }) {
  return (
    // A locked box, not a minimum. min-height only guarantees the floor: the
    // longest storm note runs to four lines where the shortest runs to two, so
    // moving the pointer along the axis pumped the whole slide up and down
    // under the reader's hand. The box is now a fixed size that the text lives
    // inside -- what changes is the words, and nothing else on the slide moves
    // when they do. Anything taller than the box scrolls within it.
    <div className="storm-preview locked-box mt-4 h-[11rem] rounded-xl border border-ink/10 bg-surface/60 sm:h-[9.5rem]">
      <div className="locked-scroll p-4">
      {storm ? (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="type-h3 text-base">{storm.name}</h3>
            <span className="type-eyebrow text-accent">{storm.year}</span>
            {selected && (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                Selected
              </span>
            )}
          </div>
          <p className="mt-1 text-xs opacity-70">
            Reached {formatNationList(storm.nations)} &mdash; {storm.nations.length} of{' '}
            {NATION_COUNT_WORD} nations in scope.
          </p>
          <p className="mt-2 max-w-prose text-sm opacity-85">
            {storm.note ?? storm.profile?.[0]?.lead ?? ''}
          </p>
        </>
      ) : (
        <p className="text-sm opacity-60">
          Point at a cyclone, or tab to one, to see where it went. Press it to follow it.
        </p>
      )}
      </div>
    </div>
  )
}

export default function StormTimeline({ selectedId, onSelect, style }) {
  const { setHighlight } = useNationHighlight()
  const counts = strikeCounts(NATION_NAMES)
  const awaiting = selectedId == null
  const axisLabel = `Severe cyclones by year, ${ROSTER_START} to ${ROSTER_END}`
  // Hover/focus only. The committed choice lives in App's story state; this is
  // the transient one, and keeping the two apart is what lets the reader look
  // at a second storm without losing the one they are following.
  const [previewId, setPreviewId] = useState(null)
  const shownId = previewId ?? selectedId
  const shown = STORMS.find((s) => s.id === shownId) ?? null

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
      <p className="type-eyebrow mb-1 text-accent">
        {ROSTER_START}&ndash;{ROSTER_END} &middot; {numberWordCapitalized(STORMS.length)} severe
        cyclones &middot; {numberWordCapitalized(NATION_NAMES.length)} Pacific nations
      </p>
      <h2 className="type-h2 mb-2">
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
            <p aria-hidden="true" className="type-figure text-2xl leading-none">
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
      <p className="type-eyebrow mt-7 flex items-center gap-2 text-accent">
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
                    onPreview={setPreviewId}
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
                      onPreview={setPreviewId}
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

      {/* One panel under both axes, deliberately not one per card. A preview
          that opens inside the timeline would move every other card on the
          slide whenever the pointer crossed one; a fixed place to look means
          the reader's eye learns where the answer appears and stays there. */}
      <StormPreview storm={shown} selected={shown != null && shown.id === selectedId} />
    </Section>
  )
}
