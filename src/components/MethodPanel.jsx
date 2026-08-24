import Section from './Section.jsx'
import { EXCLUDED, STORMS, ROSTER_START, ROSTER_END } from '../content/storms.js'
import { NATION_COUNT } from '../content/nations.js'
import { numberWord, numberWordCapitalized } from '../utils/numberWords.js'
import { scatterBackdrop } from '../content/patterns.js'

// How the site was made, and what it cannot say.
//
// This replaced the old exclusions-only panel, which sat third in the deck and
// interrupted the argument to answer an objection nobody had raised yet. The
// roster's exclusions are still here -- they are the part a sceptical reader
// most needs, since any list of six storms can be made to support almost any
// claim if the chooser is free to stop once the pattern looks right -- but they
// are now one section of a methods page rather than a slide of their own.
//
// It also takes the limitations prose that used to live on the sources slide,
// which had grown into five paragraphs of caveat under a list of links.
//
// THREE ACTS, NOT SIX FLAT SECTIONS. This slide used to read as six same-weight
// disclosures in a row, with the site's own tech stack sitting between "where
// the numbers come from" and "what the numbers can't prove" -- a fact about
// this project's toolchain has nothing to do with whether the data can be
// trusted, and its presence there made every section beside it feel just as
// arbitrary by association. The intro paragraph now names the three questions
// this slide actually answers, and each gets its own type-h3 act heading one
// step above the type-subhead sections nested under it:
//   1. What counts, and where it came from (the roster rule + provenance)
//   2. What the numbers still can't tell you (limitations + what's not built yet)
//   3. Whose language the record is kept in (standalone -- see below)
//
// The closing section is the one part here that argues rather than qualifies.
// Every limitation above concerns what the records fail to capture; that one
// concerns who the record is readable by, which is the same inequality one
// step further on. It is deliberately its own act rather than folded into act
// two: filing it alongside "what the data cannot say" would flatten an
// argument into one more item on a list of caveats.
//
// HOW IT IS BUILT moved to a quietly-demoted block at the very bottom. It is
// real information -- a developer or judge auditing the project may want it --
// but it answers "what was this made with", not "can this data be trusted",
// and the rest of this slide is entirely the second question. Demoted rather
// than deleted or moved to the sources slide: the sources slide is a
// deliberately quiet footer (see CitationPanel.jsx), and a stack of framework
// names does not belong in the same register as a list of citations.
//
// Demoted with type scale and opacity, not with a collapsed <details> toggle.
// That was tried first and reverted: it was the only click-to-expand element
// anywhere in the fourteen-slide deck, arriving on the second-to-last one, and
// a reader thirteen slides into a consistent, non-interactive design reads a
// sudden toggle as a different site bolted on at the end -- the same "feels
// unplanned" complaint this whole restructure exists to fix, recurring in a
// new spot instead of being solved.
//
// PLANNED WORK is the one block here that is not a statement of fact about the
// build: it is a roadmap, so it goes stale in a way the rest of this slide
// cannot. Check it against what the site actually does before each release.

// One card style, named once. It was written out identically four times, so a
// density change meant four edits and any one of them could be missed -- which
// is most of why this slide drifted heavier than the ones around it.
//
// p-3.5 rather than p-4, and that is the whole of the "shrink things" part of
// this pass. The rest of the height came out of layout, not type.
//
// SPLIT IN TWO because the exclusions list is a card whose padding sits on its
// rows rather than on itself, and `${CARD} p-0` would not reliably do that:
// two Tailwind padding utilities on one element are the same specificity, so
// the generated stylesheet's own order decides which wins, not the order they
// are written in the class attribute. Naming the chrome separately makes it a
// fact rather than a coin flip.
const CARD_CHROME = 'rounded-xl border border-ink/10 bg-surface/60'
const CARD = `${CARD_CHROME} p-3.5`

const BUILD = [
  { label: 'Interface', value: 'React 18, built with Vite' },
  { label: 'Charts and map', value: 'D3 (no charting library), TopoJSON, Natural Earth land via world-atlas' },
  { label: 'Styling', value: 'Tailwind CSS, PostCSS' },
  { label: 'Data pipeline', value: 'Python and pandas, run offline; the site ships static JSON' },
]

// Trimmed to roughly two sentences each. They ran 300-450 characters when they
// sat two-up, which was a fair measure for a half-width card; stacked at the
// full column they became five paragraphs a reader scrolls past rather than
// five caveats a reader reads.
//
// WHAT SURVIVED THE CUT, and the rule that decided it: the checkable part. A
// caveat that says "the sources disagree" is a disclaimer; one that says 69%
// and 62% is a fact the reader can go and test. Vanuatu's zero, Winston's two
// shares and the 0.1 m reporting floor are the whole point of the block, so the
// justifying prose around them went instead.
const LIMITS = [
  {
    title: 'Annual national totals, not storm totals',
    body: 'Every series here is a yearly figure for a whole country: a year holding two cyclones reports them as one number, and the 2020\u201321 stretch carries the pandemic as well as the weather. Nothing on this site isolates the effect of a single storm.',
  },
  {
    title: 'A reported zero is not the same as no harm',
    body: `In the people-affected series an exact zero is treated as unreported and drawn as missing, because it cannot distinguish "nobody was affected" from "nothing was submitted". Vanuatu's official figure for 2015 \u2014 the year Cyclone Pam became the most destructive storm in its history \u2014 is zero.`,
  },
  {
    title: 'Two sources give two different shares',
    body: 'The regional snapshot divides the SPC series by SPC population estimates; the storm cards quote government and PDNA assessments, which count a single event against their own base. For Cyclone Winston the two give roughly 69% and 62% of Fiji, and the site prints both rather than picking one.',
  },
  {
    title: 'The gaps are not evenly spread',
    body: 'Direct economic loss is patchy throughout, tourist arrivals are absent for Solomon Islands entirely, and no disaster figures are reported after 2022. The nations with the fewest weather stations are the same ones missing most often from the record.',
  },
  {
    title: 'Sea level rise is described, not charted',
    body: 'It is the best-attributed of the three mechanisms, with IPCC AR6 rating the human contribution since 1971 very likely. But the regional record is reported only to the nearest 0.1 m \u2014 three distinct values across twelve years \u2014 so charting it would claim a precision the measurement does not have.',
  },
]

// The languages actually spoken in the four nations this site is about, which
// is the point of the closing note. Not a wish list of languages in general:
// naming one that is not spoken in any of the four would undercut the argument
// it is being used to make.
//
// Fiji is listed with both of its own official languages. iTaukei and Fiji
// Hindi are distinct languages with distinct speakers, and collapsing them into
// one line would repeat in miniature the flattening the note is objecting to.
const LANGUAGES = [
  { nation: 'Solomon Islands', tongues: 'Solomon Islands Pijin, alongside some seventy vernaculars' },
  { nation: 'Vanuatu', tongues: 'Bislama, alongside more than a hundred vernaculars' },
  { nation: 'Fiji', tongues: 'iTaukei and Fiji Hindi, both official' },
  { nation: 'Tonga', tongues: 'Tongan' },
]

const PLANNED = [
  'Per-storm figures where a national statistics office publishes them, so the chain can separate one cyclone from the year around it.',
  'Sub-national data for the larger nations, since a national total hides which islands were actually hit.',
  'A longer baseline than 2013, which is currently set by how far back the portal figures stay complete rather than by the argument.',
  'Recovery timelines: how long each series takes to return to its pre-storm level, which is the question the comparison slide raises and does not answer.',
]

export default function MethodPanel({ style }) {
  return (
    // The same scatter every other slide carries, seeded with this slide's own
    // id. It used to be the full-bleed 'weave' tile, which marked this slide as
    // apparatus by making it the one slide that did not look like the site --
    // see the note in content/patterns.js.
    <Section backdrop={scatterBackdrop('method')} style={style}>
      <p className="type-eyebrow mb-1 text-accent">
        Method, data and limitations
      </p>
      <h2 className="type-h2 mb-1.5">
        How this was made
      </h2>

      {/* ONE RHYTHM, SET ONCE. Every block below used to carry its own mb-8,
          which is 32px of air repeated six times whether the block above it was
          a paragraph or a grid of cards -- 192px of the scroll, before any
          content. space-y-5 on the wrapper states the gap in one place and lets
          the last block end without a trailing margin. */}
      <div className="space-y-5">
      <div className="prose-column prose-wide text-sm opacity-80">
        <p>
          Everything on the preceding slides rests on two choices: which storms count, and which
          figures are trusted to describe them. What follows checks both, in three parts: what
          counts and where the numbers came from, what those numbers still can&rsquo;t tell you,
          and whose language the record was even kept in.
        </p>
      </div>

      {/* ACT ONE: what counts, and where it came from. One step above the
          type-subhead sections nested under it, so the two read as a
          hierarchy rather than six same-weight disclosures in a row. */}
      <h3 className="type-h3">
        What counts, and where it came from
      </h3>

      {/* The roster rule and its casualties. Yasa is first and given more room:
          it is the exclusion that costs the argument something, and a list
          containing only convenient omissions would be doing the same selective
          work it claims to prevent. */}
      <div>
        <h4 className="type-subhead mb-1 text-accent">
          The roster rule, and what it left out
        </h4>
        <div className="prose-column prose-wide mb-4 space-y-3 text-sm opacity-80">
          <p>
            {/* Both counts computed. This paragraph is the one place on the
                site that states the rule and its yield in the same breath, so
                a typed figure here is a paragraph that can contradict the list
                printed directly beneath it. See utils/numberWords.js. */}
            The roster is every severe tropical cyclone that struck two or more of these{' '}
            {numberWord(NATION_COUNT)} nations between {ROSTER_START} and {ROSTER_END}.{' '}
            {numberWordCapitalized(STORMS.length)} met it. The rule was fixed before the list was
            drawn. {numberWordCapitalized(EXCLUDED.length)} storms did not meet it and are named
            below, including the one whose exclusion makes the case weaker.
          </p>
        </div>

        {/* ONE BOX, NOT FOUR. These were four cards in a two-column grid with
            Yasa spanning the top, which drew four hard edges around what is a
            single four-line answer to a single question. Three of the four
            reasons are a fragment long ("Fiji only.") and got a card the size
            of a paragraph; the grid then left a hole beside Rae, so the block
            ended on an empty cell.

            The same card chrome as everything else on this slide, once, with
            the storms as divided rows inside it. divide-y rather than a border
            per row so the first row has no rule above it and the last none
            below -- the card's own edge is doing that job.

            Yasa keeps the room. It is the exclusion that costs the argument
            something, and a list of exclusions where the expensive one is set
            like the cheap ones is doing the same flattening the rule exists to
            prevent. See EXCLUDED in content/storms.js: `cost` is present on
            exactly one entry, and its presence is what earns the extra lines
            rather than a hardcoded index here. */}
        <ul
          aria-label="Storms excluded by the roster rule"
          className={`${CARD_CHROME} divide-y divide-ink/10`}
        >
          {EXCLUDED.map((storm) => (
            <li key={storm.name} className="px-3.5 py-3">
              <p className="text-base font-semibold">
                {storm.name} <span className="text-sm font-normal opacity-60">{storm.year}</span>
              </p>
              <p className="mt-0.5 text-sm opacity-80">{storm.reason}</p>
              {storm.cost && (
                <p className="mt-2 border-l-2 border-accent pl-3 text-sm italic opacity-80">
                  {storm.cost}
                </p>
              )}
            </li>
          ))}
        </ul>

        <p className="prose-wide mt-4 text-xs italic opacity-70">
          Fiji appears three times here. That is not a judgement about Fiji &mdash; it is what a
          two-nation threshold does to a country storms reach alone. A different threshold would
          produce a different roster, which is why this one is stated rather than assumed.
        </p>
      </div>

      {/* Closes Act One. Full width now that it isn't paired with the tech
          stack -- see the top-of-file note on why that pairing came apart. */}
      <div>
        <h4 className="type-subhead mb-1 text-accent">
          Where the figures come from
        </h4>
        <div className="prose-column prose-wide space-y-2 text-sm opacity-80">
          <p>
            All indicator data is drawn from the Pacific Data Hub, the Pacific Community&rsquo;s
            statistical portal, for Solomon Islands, Vanuatu, Fiji and Tonga across 2013 to 2024.
            The portal exports whole dataflows; the filtering to these four nations and these
            twelve years happens in a Python cleaning step, not by hand, so the same rule is
            applied to every series. Storm dates, categories and death tolls are not portal data
            &mdash; they come from national meteorological services and UN OCHA, cited per storm.
            Every source is linked in full on the next slide.
          </p>
          <p>
            The window opens in 2013 rather than at the first storm on the roster because a chart
            of an event year means nothing without baseline years before it.
          </p>
        </div>
      </div>

      {/* ACT TWO: what the numbers still can't tell you. Same act/section
          hierarchy as Act One above. */}
      <h3 className="type-h3">
        What the numbers still can&rsquo;t tell you
      </h3>

      <div>
        <h4 className="type-subhead mb-1 text-accent">
          What the data cannot say
        </h4>
        {/* ONE COLUMN. This was a two-up grid, which was the right call for
            bodies of 300-450 characters and the wrong one for the two-sentence
            bodies above: at half width they set to five or six short lines, so
            two columns produced two ragged narrow blocks side by side and the
            reader's eye had to find the next card rather than just continuing
            down. Trimmed text buys the height that the second column used to.

            Five titles in a single left-aligned stack also read as a list of
            five limitations, which is what this block is. In two columns they
            read as a grid of cards, which invites comparison between them --
            and these five have nothing to do with each other. */}
        <ul className="space-y-2.5">
          {LIMITS.map((limit) => (
            <li key={limit.title} className={CARD}>
              <p className="text-sm font-semibold">{limit.title}</p>
              {/* .prose-short now, where it was deliberately justified before.
                  Same rule as always (see styles/typography.css): justify a
                  block that sets to four lines or more, range it left below
                  that. At the full measure these bodies are two lines, and a
                  justified two-line block shows every gap it opens because
                  CSS never justifies a last line -- so one of the two lines
                  is the only justified line there. */}
              <p className="prose-short prose-wide mt-1 text-sm opacity-80">{limit.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="type-subhead mb-1 text-accent">
          What is not here yet
        </h4>
        {/* Four one-sentence items at the full measure each set to a single
            long line with a wrapped tail. Two columns halves the block and
            fits each item to its own text. */}
        <ul className="grid gap-x-6 gap-y-2 text-sm opacity-80 sm:grid-cols-2">
          {PLANNED.map((item) => (
            <li key={item} className="prose-short border-l-2 border-ink/15 pl-3">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ACT THREE, standalone rather than nested under a group heading like
          the first two -- see top-of-file note. It gets the same type-h3
          weight as the other two acts (this IS the act; the section title
          doubles as the act title, so no separate group label sits above it)
          and a hairline rule above it, since without a shared group heading
          to mark the transition, something has to say "new movement starts
          here" the way "ACT TWO" did for the section above it.
          
          The closing note, and the one that is an argument rather than a
          caveat. It is last because it turns the site's own method back on
          itself: every limitation above is about what the records fail to
          capture, and this one is about who the record -- and this site --
          is legible to. Stated as the same finding, not as a roadmap item,
          because filing it under future work would make it sound like a
          feature that was descoped rather than a gap that is the subject. */}
      <div className="border-t border-ink/10 pt-5">
        <h3 className="type-h3 mb-1">
          Whose language the record is kept in
        </h3>
        <div className="prose-column prose-wide text-sm opacity-80">
          <p>
            This site is written in English. So is every figure it draws on: the portal exports,
            the national statistics releases, the disaster assessments filed after each cyclone.
            English is the language of the institutions that count, and it is not the first
            language of most of the people being counted.
          </p>
        </div>

        {/* Was four cards, each with 14px of padding on every side around a
            country name and one short line. Card chrome is for something a
            reader compares or acts on; this is a list, so it is set as one.
            Same four facts, roughly a third of the height. */}
        <ul
          aria-label="First languages of the four nations"
          className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2"
        >
          {LANGUAGES.map((row) => (
            <li key={row.nation} className="border-l-2 border-accent/40 pl-3">
              <span className="font-semibold">{row.nation}</span>
              <span className="opacity-80"> &mdash; {row.tongues}</span>
            </li>
          ))}
        </ul>

        <div className="prose-column prose-wide mt-3 space-y-2 text-sm opacity-80">
          <p>
            That is the same asymmetry the rest of this page documents, one step further along.
            Solomon Islands has the fewest weather stations and the largest gaps in the disaster
            record; it is also the nation whose people are least likely to be able to read the
            record that was kept about them, or this account of it. A harvest failure recorded in
            a language the farmer does not read has been counted, but not returned.
          </p>
          <p>
            Translating this site is therefore not a feature it is missing. It is the same finding
            it is already making, and it is not work that machine translation can do: Pijin,
            Bislama, iTaukei, Fiji Hindi and Tongan need speakers, not software, and this project
            does not yet have them. Naming that plainly seemed better than leaving it unsaid, or
            than shipping something approximate in languages the site is not equipped to get right.
          </p>
        </div>

        {/* The "this site is illustrative" line that sat here is gone. It was
            printed verbatim on the sources slide immediately after this one,
            which is where a disclaimer belongs, and saying it twice in
            consecutive slides made neither instance carry weight. */}
      </div>

      {/* THE DEMOTED TECH STACK. Real information, deliberately last and
          deliberately quiet -- but demoted with the type scale and opacity
          this site already leans on everywhere else, not with a new
          interaction. A <details> disclosure lived here first; it was the
          only click-to-expand element anywhere in the deck, arriving on
          slide 13 of 14, and a reader who has scrolled through thirteen
          slides of a consistent, non-interactive design language reads a
          sudden toggle as a different site bolted on at the end -- the exact
          "feels unplanned" complaint this whole slide was being fixed for,
          recurring in a new spot. Smaller type and lower opacity say "this
          matters less" without saying "this behaves differently". */}
      <div className="border-t border-ink/10 pt-4 text-xs opacity-60">
        <p className="type-eyebrow mb-3">
          How this site is built
        </p>
        <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {BUILD.map((row) => (
            <div key={row.label} className={CARD}>
              <dt className="type-eyebrow opacity-60">{row.label}</dt>
              <dd className="mt-1 text-xs opacity-85">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="prose-column prose-wide mt-2.5 text-xs opacity-80">
          Charts are drawn directly in D3 rather than through a charting library, so every axis,
          label and empty state is a decision made here rather than a default inherited from
          somewhere else. The cleaning scripts are committed alongside the site, and the JSON they
          produce is what ships &mdash; there is no live API call, and the figures cannot change
          under the argument after it has been read.
        </p>
      </div>
      </div>
    </Section>
  )
}
