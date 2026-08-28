import { useState } from 'react'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import { NATION_NAMES, nationLabel } from '../content/nations.js'
import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { STORMS, ROSTER_START, ROSTER_END, strikeCounts, localizeStorm } from '../content/storms.js'
import { numberWord, numberWordCapitalized } from '../utils/numberWords.js'
import { formatNationList } from '../utils/formatNationList.js'
import { useOverflowFade } from '../hooks/useOverflowFade.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

const YEARS = Array.from({ length: ROSTER_END - ROSTER_START + 1 }, (_, i) => ROSTER_START + i)

// Counts set in words, because the eyebrow and the button labels are prose and
// a digit reads as data there. The helper is shared -- see utils/numberWords.js
// for the drift it closes and why the roster figures are computed rather than
// typed. Resolved per-language inside the component now rather than as a
// module constant, since numberWord takes a language.

// `m.label`/`storm.note` etc. from content/storms.js are still English-only;
// everything else on this slide translates.
const STRINGS = {
  en: {
    cardAria: (name, year, count, total) => `${name}, ${year}. Struck ${count} of ${total} nations.`,
    selected: 'Selected',
    reachedNote: (list, count, total) => `Reached ${list} \u2014 ${count} of ${total} nations in scope.`,
    pointAt: 'Point at a cyclone, or tab to one, to see where it went. Press it to follow it.',
    eyebrow: (start, end, stormWord, nationWord) =>
      `${start}\u2013${end} \u00b7 ${stormWord} severe cyclones \u00b7 ${nationWord} Pacific nations`,
    heading: 'How often, and to whom',
    intro: (start, end) =>
      `This site records every severe cyclone that struck more than one of these four nations from ${start}\u2013${end}.`,
    countAria: (count, nation, start, end) =>
      `${count} severe cyclones struck ${nation} between ${start} and ${end}.`,
    strucRow: (nation) => `severe cyclones struck ${nation}`,
    selectCyclone: 'Select a cyclone',
    axisLabel: (start, end) => `Severe cyclones by year, ${start} to ${end}`,
    of: 'of',
  },
  fr: {
    cardAria: (name, year, count, total) => `${name}, ${year}. A touché ${count} des ${total} nations.`,
    selected: 'Sélectionné',
    reachedNote: (list, count, total) =>
      `A touché ${list} \u2014 ${count} des ${total} nations concernées.`,
    pointAt: 'Pointez un cyclone, ou naviguez jusqu\u2019à un, pour voir où il est passé. Sélectionnez-le pour le suivre.',
    eyebrow: (start, end, stormWord, nationWord) =>
      `${start}\u2013${end} \u00b7 ${stormWord} cyclones sévères \u00b7 ${nationWord} nations du Pacifique`,
    heading: 'À quelle fréquence, et pour qui',
    intro: (start, end) =>
      `Ce site recense chaque cyclone sévère ayant touché plus d\u2019une de ces quatre nations entre ${start} et ${end}.`,
    countAria: (count, nation, start, end) =>
      `${count} cyclones sévères ont touché ${nation} entre ${start} et ${end}.`,
    strucRow: (nation) => `cyclones sévères ont touché ${nation}`,
    selectCyclone: 'Choisir un cyclone',
    axisLabel: (start, end) => `Cyclones sévères par année, ${start} à ${end}`,
    of: 'sur',
  },
}

// The opening. Six storms on a ten-year axis, and the strike count per nation
// above it.
//
// The count is the claim, not the calendar. An earlier draft planned to open on
// year-clustering -- "they keep getting hit in bursts" -- and the roster does
// not support it: one year of the ten holds more than one storm. Counting per
// nation says something the data does show, without any trend or attribution
// claim attached.
//
// Nothing is selected on load. The timeline is the argument; the storm chosen
// from it is the evidence. That makes the chips the only control on the slide,
// so they carry more selection affordance than a resting card normally would --
// see .awaiting-press in styles/animations.css.
//
// Props:
//   selectedId -- id of the chosen storm, or null
//   onSelect -- (id) => void, toggles selection
//   style -- forwarded to Section (entrance stagger)

// How much of the region a storm covered, as four pips rather than a fraction.
// The one comparison worth having pre-attentive when scanning the timeline.
// Order is fixed (NATIONS order) so the glyph means the same thing on every
// card, and it is aria-hidden because the button's label already says it.
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
// `awaiting` is true only while no storm is chosen; it drives the faint accent
// ring that marks these as the thing to press. `strip` is the phone-sized
// variant: same button, same handlers, same state, sized to be thumbed.
function StormCard({ storm, active, awaiting, onSelect, onPreview, delay = 0, row = false, strip = false, t }) {
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
      aria-label={t.cardAria(storm.name, storm.year, storm.nations.length, NATION_NAMES.length)}
      style={awaiting ? { animationDelay: `${delay}ms` } : undefined}
      className={`press-target storm-card relative cursor-pointer rounded-lg border text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
        strip ? 'h-full w-full rounded-xl px-4 py-3.5' : 'min-h-[44px] px-2.5 py-2'
      } ${
        active
          ? 'is-active border-accent bg-accent/10 font-semibold'
          : 'border-ink/20 bg-surface/70 hover:border-accent/60 hover:bg-surface'
      } ${awaiting ? 'awaiting-press' : ''} ${
        row ? 'flex w-full items-center justify-between gap-3' : ''
      }`}
    >
      {strip && (
        <span className="type-eyebrow block text-accent">{storm.year}</span>
      )}
      <span
        className={`flex items-center gap-1.5 leading-tight ${
          strip ? 'mt-1 text-base font-semibold' : 'text-xs'
        }`}
      >
        {/* The selected card is the story's current state, so it says so with
            a mark as well as a colour -- the brief's "do not rely on colour
            alone", applied to the one control the whole page hangs off. */}
        {active && (
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        )}
        <span className="truncate">{storm.label}</span>
      </span>
      <span
        className={`flex items-center gap-1.5 ${row ? 'shrink-0' : 'mt-1.5'} ${
          strip ? 'mt-2.5' : ''
        }`}
      >
        <CoverageDots struck={storm.nations} />
        <span className="text-[10px] leading-none tabular-nums opacity-soft">
          {storm.nations.length} {t.of} {NATION_NAMES.length}
        </span>
      </span>
    </button>
  )
}

// The storm under the reader's attention, in four facts and one sentence.
//
// Every word is already in the roster, so nothing here is a claim a reader
// could not check against content/storms.js. It shows the hovered or focused
// storm if there is one and otherwise the selected storm, so the panel is never
// empty once a choice has been made.
function StormPreview({ storm, selected, t, language }) {
  // Re-measured whenever the storm changes: the same box overflows for one
  // storm's note and has room to spare for the next.
  const { ref: scrollRef, overflowing } = useOverflowFade([storm?.id])

  return (
    // A locked box, not a minimum. min-height only guarantees the floor, and
    // storm notes run from two lines to four -- so moving the pointer along the
    // axis pumped the whole slide up and down under the reader's hand. The box
    // is a fixed size that the text lives inside; anything taller scrolls.
    <div className="locked-box mt-4 h-[11rem] rounded-xl border border-ink/10 bg-surface/60 sm:h-[9.5rem] short:mt-3 short:h-[8rem]">
      <div ref={scrollRef} data-overflowing={overflowing} className="locked-scroll p-4">
      {storm ? (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="type-h3 text-base">{storm.name}</h3>
            <span className="type-eyebrow text-accent">{storm.year}</span>
            {selected && (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                {t.selected}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs opacity-70">
            {t.reachedNote(
              formatNationList(storm.nations.map((n) => nationLabel(n, language)), language),
              storm.nations.length,
              numberWord(NATION_NAMES.length, { language, gender: 'f' })
            )}
          </p>
          <p className="mt-2 figure-prose text-sm opacity-85">
            {storm.note ?? storm.profile?.[0]?.lead ?? ''}
          </p>
        </>
      ) : (
        <p className="text-sm opacity-soft">{t.pointAt}</p>
      )}
      </div>
    </div>
  )
}

export default function StormTimeline({ selectedId, onSelect, style }) {
  const { setHighlight } = useNationHighlight()
  const { language } = useLanguage()
  const t = STRINGS[language]
  const counts = strikeCounts(NATION_NAMES)
  const awaiting = selectedId == null
  const axisLabel = t.axisLabel(ROSTER_START, ROSTER_END)
  // Hover/focus only. The committed choice lives in App's story state; this is
  // the transient one, and keeping the two apart is what lets the reader look
  // at a second storm without losing the one they are following.
  const [previewId, setPreviewId] = useState(null)
  // The mobile strip scrolls sideways, and every other scrolling region on the
  // site got an affordance back when the scrollbars went. See useOverflowFade.
  const { ref: stripRef, overflowing: stripOverflowing } = useOverflowFade([], { axis: 'x' })
  const shownId = previewId ?? selectedId
  const shown = localizeStorm(STORMS.find((s) => s.id === shownId) ?? null, language)

  // Stagger index, assigned in roster order rather than per year, so the rings
  // travel left to right across the axis instead of pulsing in unison.
  const delayOf = (id) => STORMS.findIndex((s) => s.id === id) * 260

  return (
    <Section style={style} backdrop={scatterBackdrop('timeline')}>
      {/*
        One column, full width. This slide used to be split -- prose left,
        evidence right -- because the prose ran long enough that stacking cost
        the reader a scroll. With the argument down to a single sentence there
        is nothing left for a side column, and a timeline wants the full measure.
      */}
      <p className="type-eyebrow mb-1 text-accent">
        {t.eyebrow(
          ROSTER_START,
          ROSTER_END,
          numberWordCapitalized(STORMS.length, { language, gender: 'm' }),
          numberWordCapitalized(NATION_NAMES.length, { language, gender: 'f' })
        )}
      </p>
      <h2 className="type-h2 mb-2">{t.heading}</h2>
      <p className="figure-prose text-sm opacity-80">{t.intro(ROSTER_START, ROSTER_END)}</p>

      {/* The cards take focus so a keyboard user can reach the cross-chart
          highlight, which is otherwise pointer-only. Each carries its own full
          sentence, because a focusable element with no accessible name is worse
          than one that cannot be focused at all. */}
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 short:mt-4 short:gap-2.5">
        {counts.map(({ nation, count }) => (
          <li
            key={nation}
            tabIndex={0}
            role="note"
            aria-label={t.countAria(count, nationLabel(nation, language), ROSTER_START, ROSTER_END)}
            className="cursor-help rounded-xl border border-ink/10 bg-surface/60 p-3 short:p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
            {...highlightHandlers(nation, setHighlight)}
          >
            <p aria-hidden="true" className="type-figure text-2xl leading-none">
              {count}
            </p>
            <p aria-hidden="true" className="mt-1 text-xs leading-snug opacity-70">
              {t.strucRow(nationLabel(nation, language))}
            </p>
          </li>
        ))}
      </ul>

      {/* A UI label, not a sentence: the chips are the only control on the
          slide and the ring alone can't say what pressing one is for. */}
      <p className="type-eyebrow mt-7 flex items-center gap-2 text-accent short:mt-5">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        {t.selectCyclone}
      </p>

      {/*
        WIDE: a conventional horizontal timeline. One grid column per year, so
        the ten-year axis is drawn to scale and the empty stretches are as wide
        as the busy ones -- the gaps are part of what the axis is showing. The
        axis rule is the columns' own top border with no column gap, which is
        what makes it read as one continuous line. Cards sit on the axis and
        stack upward, so 2023's two storms grow into the space above.
      */}
      <ol
        aria-label={axisLabel}
        className="mt-3 hidden lg:grid short:mt-2"
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
                    t={t}
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
                    hit ? 'font-semibold opacity-80' : 'opacity-faint'
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
        NARROW: a swipeable strip, not a squeezed axis.

        BOTH LAYOUTS ARE IN THE DOM AT EVERY WIDTH, and CSS hides one. That is
        the opposite of what RippleChain does for the same kind of choice, where
        useMediaQuery builds one tree or the other -- so the difference is worth
        stating. There, hiding is not the same as not building: both sets of D3
        charts would still be measured, drawn and animated. Here the hidden
        layout is a handful of buttons over a roster of six, which costs
        nothing to build and nothing to leave hidden. CSS is the cheaper tool
        when the thing being hidden is cheap, and the structural break is only
        worth its complexity when the thing being hidden is not.

        The same year axis turned on its side was honest about the empty years
        and, on a phone, eleven rows tall -- so the reader scrolled a section to
        reach a control and lost the preview off the bottom while doing it.

        The strip drops the empty years and keeps the storms, in the same order,
        with the year on each card. Six cards at a bit under a screen-width
        each: one always fully in view, the next always peeking past the edge.

        Same StormCard, same handlers, same roster -- nothing here is a
        mobile-only data structure. The spared years are still stated in the
        sentence above and drawn on the wide axis.
      */}
      <ul
        ref={stripRef}
        data-overflowing={stripOverflowing}
        aria-label={axisLabel}
        className="storm-strip mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:hidden"
      >
        {STORMS.map((storm) => (
          <li key={storm.id} className="w-[74%] max-w-[17rem] shrink-0 snap-start">
            <StormCard
              storm={storm}
              active={storm.id === selectedId}
              awaiting={awaiting}
              delay={delayOf(storm.id)}
              onSelect={onSelect}
              onPreview={setPreviewId}
              strip
              t={t}
            />
          </li>
        ))}
      </ul>

      {/* One panel under both axes, deliberately not one per card. A preview
          opening inside the timeline would move every other card whenever the
          pointer crossed one; a fixed place to look means the reader's eye
          learns where the answer appears and stays there. */}
      <StormPreview
        storm={shown}
        selected={shown != null && shown.id === selectedId}
        t={t}
        language={language}
      />
    </Section>
  )
}
