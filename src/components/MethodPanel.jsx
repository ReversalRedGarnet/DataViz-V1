import Section from './Section.jsx'
import { EXCLUDED, STORMS, ROSTER_START, ROSTER_END } from '../content/storms.js'
import { NATION_COUNT } from '../content/nations.js'
import { numberWord, numberWordCapitalized } from '../utils/numberWords.js'

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
// The closing section is the one part here that argues rather than qualifies.
// Every limitation above concerns what the records fail to capture; that one
// concerns who the record is readable by, which is the same inequality one
// step further on. It is deliberately not filed under PLANNED -- listing it as
// future work would make it read as a feature that got descoped rather than as
// part of what the site is about.
//
// PLANNED WORK is the one block here that is not a statement of fact about the
// build. Replace it with your own roadmap before submitting -- it is written
// from what the code currently does not do, not from anything you have told me
// you intend.

const BUILD = [
  { label: 'Interface', value: 'React 18, built with Vite' },
  { label: 'Charts and map', value: 'D3 (no charting library), TopoJSON, Natural Earth land via world-atlas' },
  { label: 'Styling', value: 'Tailwind CSS, PostCSS' },
  { label: 'Data pipeline', value: 'Python and pandas, run offline; the site ships static JSON' },
]

const LIMITS = [
  {
    title: 'Annual national totals, not storm totals',
    body: 'Every series here is a yearly figure for a whole country. A year holding two cyclones reports them as one number, and the 2020–21 stretch carries the pandemic as well as the weather. Nothing on this site isolates the effect of a single storm, and the note under each chart says what that record cannot prove.',
  },
  {
    title: 'A reported zero is not the same as no harm',
    body: `In the people-affected series a figure of exactly zero is treated as unreported and drawn as missing. That series does not distinguish "nobody was affected" from "nothing was submitted", and the difference is not academic: Vanuatu's official figure for 2015, the year Cyclone Pam became the most destructive storm in its history, is zero. The rule is applied to every zero in the series rather than only to years a storm is known to have struck, so no individual figure is overridden on our judgement.`,
  },
  {
    title: 'Two sources give two different shares',
    body: 'The regional snapshot can restate people affected as a share of population, dividing the SPC series by SPC mid-year population estimates. The storm cards quote shares from government and PDNA assessments instead, which count a single event against their own population base. For Cyclone Winston the two give roughly 69% and 62% of Fiji. Neither figure is a correction of the other, and the site prints both rather than picking the one that reads more cleanly.',
  },
  {
    title: 'The gaps are not evenly spread',
    body: 'Direct economic loss is patchy throughout, tourist arrivals are absent for Solomon Islands entirely, and no disaster figures are reported for any of these countries after 2022. The nations with the fewest weather stations are the same ones missing most often from the disaster records, which is why observing capacity is charted here rather than mentioned in a footnote.',
  },
  {
    title: 'Sea level rise is described, not charted',
    body: 'It is the best-attributed of the three mechanisms, with IPCC AR6 rating the human contribution since 1971 very likely. The regional record is reported only to the nearest 0.1 m, which gives three distinct values across twelve years and hides any movement under 10 cm. Charting it would claim a precision the measurement does not have.',
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
    <Section tone="panel" style={style}>
      <p className="type-eyebrow mb-1 text-accent">
        Method, data and limitations
      </p>
      <h2 className="type-h2 mb-2">
        How this was made
      </h2>
      <div className="prose-column prose-wide mb-8 space-y-3 text-sm opacity-80">
        <p>
          Everything on the preceding slides rests on two choices: which storms count, and which
          figures are trusted to describe them. Both are stated here so they can be checked rather
          than taken on trust, along with what the records do not support, what the site does not
          yet do, and who it is &mdash; and is not &mdash; legible to.
        </p>
      </div>

      {/* The roster rule and its casualties. Yasa is first and given more room:
          it is the exclusion that costs the argument something, and a list
          containing only convenient omissions would be doing the same selective
          work it claims to prevent. */}
      <div className="mb-8">
        <h3 className="type-subhead mb-1 text-accent">
          The roster rule, and what it left out
        </h3>
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

        <ul aria-label="Storms excluded by the roster rule" className="grid gap-3 sm:grid-cols-2">
          {EXCLUDED.map((storm, i) => (
            <li
              key={storm.name}
              className={`rounded-xl border border-ink/10 bg-surface/60 p-4 ${
                i === 0 ? 'sm:col-span-2' : ''
              }`}
            >
              <p className="text-base font-semibold">
                {storm.name} <span className="text-sm font-normal opacity-60">{storm.year}</span>
              </p>
              <p className="mt-1 text-sm opacity-80">{storm.reason}</p>
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

      <div className="mb-8">
        <h3 className="type-subhead mb-1 text-accent">
          Where the figures come from
        </h3>
        <div className="prose-column prose-wide space-y-3 text-sm opacity-80">
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

      <div className="mb-8">
        <h3 className="type-subhead mb-1 text-accent">
          What the data cannot say
        </h3>
        <ul className="space-y-3">
          {LIMITS.map((limit) => (
            <li key={limit.title} className="rounded-xl border border-ink/10 bg-surface/60 p-4">
              <p className="text-sm font-semibold">{limit.title}</p>
              {/* Deliberately NOT .prose-short. These bodies run 300-450
                  characters inside a half-width card, so they set to six or
                  eight lines and any one badly-stretched line is lost among
                  the well-set ones. This is the case justification is for. */}
              <p className="prose-column prose-wide mt-1 text-sm opacity-80">{limit.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="type-subhead mb-1 text-accent">
          How it is built
        </h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          {BUILD.map((row) => (
            <div key={row.label} className="rounded-xl border border-ink/10 bg-surface/60 p-4">
              <dt className="type-eyebrow opacity-60">
                {row.label}
              </dt>
              <dd className="mt-1 text-sm opacity-85">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="prose-column prose-wide mt-3 text-sm opacity-80">
          Charts are drawn directly in D3 rather than through a charting library, so every axis,
          label and empty state is a decision made here rather than a default inherited from
          somewhere else. The cleaning scripts are committed alongside the site, and the JSON they
          produce is what ships &mdash; there is no live API call, and the figures cannot change
          under the argument after it has been read.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="type-subhead mb-1 text-accent">
          What is not here yet
        </h3>
        <ul className="prose-column prose-wide prose-short space-y-2 text-sm opacity-80">
          {PLANNED.map((item) => (
            <li key={item} className="border-l-2 border-ink/15 pl-3">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* The closing note, and the one that is an argument rather than a
          caveat. It is last because it turns the site's own method back on
          itself: every limitation above is about what the records fail to
          capture, and this one is about who the record -- and this site --
          is legible to. Stated as the same finding, not as a roadmap item,
          because filing it under future work would make it sound like a
          feature that was descoped rather than a gap that is the subject. */}
      <div>
        <h3 className="type-subhead mb-1 text-accent">
          Whose language the record is kept in
        </h3>
        <div className="prose-column prose-wide space-y-3 text-sm opacity-80">
          <p>
            This site is written in English. So is every figure it draws on: the portal exports,
            the national statistics releases, the disaster assessments filed after each cyclone.
            English is the language of the institutions that count, and it is not the first
            language of most of the people being counted.
          </p>
        </div>

        <ul aria-label="First languages of the four nations" className="mt-4 grid gap-3 sm:grid-cols-2">
          {LANGUAGES.map((row) => (
            <li key={row.nation} className="rounded-xl border border-ink/10 bg-surface/60 p-4">
              <p className="text-sm font-semibold">{row.nation}</p>
              <p className="mt-1 text-sm opacity-80">{row.tongues}</p>
            </li>
          ))}
        </ul>

        <div className="prose-column prose-wide mt-4 space-y-3 text-sm opacity-80">
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

        <p className="prose-wide mt-6 text-xs italic opacity-70">
          This site is illustrative. It is not intended to inform policy, funding or financial
          decisions.
        </p>
      </div>
    </Section>
  )
}
