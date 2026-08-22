import { useState } from 'react'
import Section from './Section.jsx'
import { sectionGuard } from './sectionGuard.jsx'

// ONE QUESTION, ASKED BEFORE THE ANSWER.
//
// Everything up to here has shown the reader four countries moving apart after
// one storm. This asks them what they think is doing it, and then shows them
// which part of the site bears on their guess. The point is not the guess. It
// is that a reader who has committed to an answer reads the evidence for it
// differently from a reader who has been handed a conclusion.
//
// WHAT THIS IS CAREFUL NOT TO DO, and the care is the whole design:
//
//   - No new data. Every factor below points at a chart the site already
//     draws, and the "what the site shows" line under each one describes that
//     chart rather than making a fresh claim.
//   - No scoring. There is no right answer, nothing is marked, and no factor
//     is revealed to be the cause -- because the data does not identify one.
//   - No implied test. The reader's pick is not counted, compared against
//     other readers, or treated as a hypothesis this site has evaluated. It is
//     a way of choosing what to look at next.
//   - The interpretation at the end says association and context, and says
//     plainly that association is not what it would take to prove cause.
//
// Skippable by construction: the deck's Next button never waits on it.
//
// Each factor names the section its evidence lives in rather than offering to
// take the reader there. Nothing on this site moves the reader between slides
// except the footer's Back and Next -- a rule this section would otherwise be
// the loudest violation of, since it would be sending someone backwards out of
// a question they are still in the middle of answering.
//
// Props:
//   storm -- the selected storm, for the question's wording
const FACTORS = [
  {
    id: 'capacity',
    label: 'Infrastructure and capacity',
    evidence:
      'The capacity section carries the standing difference in monitoring stations between these four nations, unchanged in every year on record -- a structural difference, not a trend.',
    section: 'context',
    sectionLabel: 'Capacity & Context',
  },
  {
    id: 'agriculture',
    label: 'How much of life runs on farming',
    evidence:
      'Crop yield and livestock yield are the second and third links of the ripple chain. They move for weather, planting decisions and markets as well as storms, and yield per animal can hold steady through a year that killed stock.',
    section: 'ripple-chain',
    sectionLabel: 'The Ripple Chain',
  },
  {
    id: 'tourism',
    label: 'How much of the economy is visitors',
    evidence:
      'Tourist arrivals is the last link of the chain, and the one with the largest movements -- almost all of which, across 2020 and 2021, is border closure rather than any cyclone.',
    section: 'ripple-chain',
    sectionLabel: 'The Ripple Chain',
  },
  {
    id: 'exposure',
    label: 'How many people were in the way',
    evidence:
      'The overview reads people affected against population, because the same raw count is a different event in a country of 300,000 and a country of 900,000.',
    section: 'big-picture',
    sectionLabel: 'The Bigger Picture',
  },
  {
    id: 'reporting',
    label: 'Who was able to report at all',
    evidence:
      'The gaps are the finding here: consequence data depends on the capacity to assess and report after being hit, which is exactly what a disaster destroys and what the least-resourced countries have least of. Several tolls on this roster are never reported rather than zero.',
    section: 'method',
    sectionLabel: 'How This Was Made',
  },
]

export default function DataDetective({ storm, style }) {
  const [picked, setPicked] = useState(null)

  const blocked = sectionGuard({
    data: true,
    storm,
    style,
    subject: 'The question',
    prompt: 'ask what shaped the difference',
  })
  if (blocked) return blocked

  const factor = FACTORS.find((f) => f.id === picked) ?? null

  return (
    <Section style={style}>
      <div className="mx-auto max-w-3xl">
        <p className="type-eyebrow mb-1 text-accent">Before the conclusion</p>
        <h2 className="type-h2 mb-2">
          Why might two countries hit by {storm.name} recover differently?
        </h2>
        <p className="prose-column prose-wide mb-5 text-sm opacity-75">
          Pick whichever you think matters most. Nothing here is marked right or wrong &mdash;
          this site cannot tell you which factor caused what, and any version of it that claimed to
          would be overstating four countries and ten years of annual figures. Choosing one just
          decides what you look at next.
        </p>

        <ul className="flex flex-wrap gap-2">
          {FACTORS.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setPicked(picked === f.id ? null : f.id)}
                aria-pressed={picked === f.id}
                className={`press-target min-h-[44px] rounded-full border px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
                  picked === f.id
                    ? 'border-accent bg-accent/10 font-semibold'
                    : 'border-ink/20 bg-surface/60 hover:border-accent/60'
                }`}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Reserved, so pressing a factor does not shunt the interpretation
            below it down the slide out from under the reader's eye. */}
        <div className="mt-5 min-h-[9rem]">
          {factor ? (
            <div className="animate-pop-in rounded-xl border border-accent/30 bg-surface/70 p-4">
              <p className="type-eyebrow text-accent">What this site actually shows</p>
              <p className="mt-2 text-sm leading-snug opacity-85">{factor.evidence}</p>
              <p className="mt-3 text-xs opacity-65">
                Where to look: <span className="font-semibold">{factor.sectionLabel}</span>.
              </p>
            </div>
          ) : (
            <p className="text-sm opacity-55">
              Your pick decides which evidence appears here.
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-ink/10 pt-4">
          <p className="type-eyebrow mb-2 text-accent">What the evidence supports</p>
          <p className="prose-column prose-wide text-sm leading-snug opacity-80">
            All of these are visible in the record, and none of them is measured here as a cause.
            What these ten years show is that countries which met the same storm did not follow the
            same path afterwards, and that the countries with the least capacity to observe and
            report are also the ones whose aftermath is least completely recorded. That is an
            association, and it is context. It is not a controlled comparison: four nations, six
            events and annual national totals cannot separate a cyclone from a drought, a pandemic
            or a policy in the same year, and this site does not claim to have done so.
          </p>
        </div>
      </div>
    </Section>
  )
}
