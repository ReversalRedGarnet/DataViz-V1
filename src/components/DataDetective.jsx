import { useState } from 'react'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import { sectionGuard } from './sectionGuard.jsx'
import { PAGE_SECTIONS, sectionLabel as resolveSectionLabel } from '../content/pageSections.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

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
//
// `section` is the id of the slide each factor's evidence lives on. It used to
// sit here unused beside a hand-copied `sectionLabel` string, so the name shown
// to the reader was a second copy of PAGE_SECTIONS' label with nothing keeping
// the two in step. The id is looked up below instead: the dead field turned out
// to be the fix for the duplication.
//
// Renamed to `whereToLook` to avoid colliding with pageSections.js's own
// exported `sectionLabel(section, language)`, which this now calls directly.
function whereToLook(id, language) {
  const section = PAGE_SECTIONS.find((s) => s.id === id)
  return section ? resolveSectionLabel(section, language) : id
}

const FACTORS = {
  en: [
    {
      id: 'capacity',
      label: 'Infrastructure and capacity',
      evidence:
        'The capacity section carries the standing difference in monitoring stations between these four nations, unchanged in every year on record -- a structural difference, not a trend.',
      section: 'context',
    },
    {
      id: 'agriculture',
      label: 'How much of life runs on farming',
      evidence:
        'Crop yield and livestock yield are the second and third links of the ripple chain. They move for weather, planting decisions and markets as well as storms, and yield per animal can hold steady through a year that killed stock.',
      section: 'ripple-chain',
    },
    {
      id: 'tourism',
      label: 'How much of the economy is visitors',
      evidence:
        'Tourist arrivals is the last link of the chain, and the one with the largest movements -- almost all of which, across 2020 and 2021, is border closure rather than any cyclone.',
      section: 'ripple-chain',
    },
    {
      id: 'exposure',
      label: 'How many people were in the way',
      evidence:
        'The overview reads people affected against population, because the same raw count is a different event in a country of 300,000 and a country of 900,000.',
      section: 'big-picture',
    },
    {
      id: 'reporting',
      label: 'Who was able to report at all',
      evidence:
        'The gaps are the finding here: consequence data depends on the capacity to assess and report after being hit, which is exactly what a disaster destroys and what the least-resourced countries have least of. Several tolls on this roster are never reported rather than zero.',
      section: 'method',
    },
  ],
  fr: [
    {
      id: 'capacity',
      label: 'Infrastructure et capacité',
      evidence:
        'La section sur la capacité porte l\u2019écart permanent en stations de surveillance entre ces quatre nations, inchangé chaque année sur la période \u2014 une différence structurelle, pas une tendance.',
      section: 'context',
    },
    {
      id: 'agriculture',
      label: 'La part de l\u2019agriculture dans la vie quotidienne',
      evidence:
        'Le rendement des cultures et le rendement de l\u2019élevage sont les deuxième et troisième maillons de la chaîne de répercussions. Ils évoluent avec la météo, les décisions de plantation et les marchés autant qu\u2019avec les cyclones, et le rendement par animal peut rester stable pendant une année où le cheptel a pourtant été décimé.',
      section: 'ripple-chain',
    },
    {
      id: 'tourism',
      label: 'La part du tourisme dans l\u2019économie',
      evidence:
        'Les arrivées touristiques forment le dernier maillon de la chaîne, et celui aux mouvements les plus importants \u2014 presque tous, en 2020 et 2021, dus à la fermeture des frontières plutôt qu\u2019à un cyclone.',
      section: 'ripple-chain',
    },
    {
      id: 'exposure',
      label: 'Le nombre de personnes exposées',
      evidence:
        'La vue d\u2019ensemble compare les personnes touchées à la population, car le même chiffre brut représente un événement différent dans un pays de 300\u00A0000 habitants et un pays de 900\u00A0000.',
      section: 'big-picture',
    },
    {
      id: 'reporting',
      label: 'Qui a été en mesure de déclarer quoi que ce soit',
      evidence:
        'Les lacunes sont le résultat ici\u00A0: les données de conséquence dépendent de la capacité à évaluer et déclarer après avoir été touché, ce qui est précisément ce qu\u2019une catastrophe détruit et ce dont les pays les moins dotés en ressources manquent le plus. Plusieurs bilans de cette liste ne sont jamais déclarés plutôt que nuls.',
      section: 'method',
    },
  ],
}

const STRINGS = {
  en: {
    beforeConclusion: 'Before the conclusion',
    heading: (name) => `Why might two countries hit by ${name} recover differently?`,
    intro:
      "Pick whichever you think matters most. Nothing here is marked right or wrong \u2014 this site cannot tell you which factor caused what, and any version of it that claimed to would be overstating four countries and ten years of annual figures. Choosing one just decides what you look at next.",
    whatShows: 'What this site actually shows',
    whereToLook: 'Where to look: ',
    pickToSee: 'Your pick decides which evidence appears here.',
    whatEvidenceSupports: 'What the evidence supports',
    closing:
      'All of these are visible in the record, and none of them is measured here as a cause. What these ten years show is that countries which met the same storm did not follow the same path afterwards, and that the countries with the least capacity to observe and report are also the ones whose aftermath is least completely recorded. That is an association, and it is context. It is not a controlled comparison: four nations, six events and annual national totals cannot separate a cyclone from a drought, a pandemic or a policy in the same year, and this site does not claim to have done so.',
    guardSubject: 'The question',
    guardPrompt: 'ask what shaped the difference',
  },
  fr: {
    beforeConclusion: 'Avant la conclusion',
    heading: (name) => `Pourquoi deux pays touchés par ${name} pourraient-ils se redresser différemment\u00A0?`,
    intro:
      "Choisissez ce qui vous semble le plus déterminant. Rien ici n\u2019est jugé juste ou faux \u2014 ce site ne peut pas vous dire quel facteur a causé quoi, et toute version qui le prétendrait exagérerait la portée de quatre pays et dix ans de chiffres annuels. Votre choix détermine simplement ce que vous regarderez ensuite.",
    whatShows: 'Ce que ce site montre réellement',
    whereToLook: 'Où regarder\u00A0: ',
    pickToSee: 'Votre choix détermine quelle preuve apparaît ici.',
    whatEvidenceSupports: 'Ce que les données appuient',
    closing:
      'Tout ceci est visible dans les données, et rien n\u2019est mesuré ici comme une cause. Ce que montrent ces dix années, c\u2019est que des pays touchés par le même cyclone n\u2019ont pas suivi le même chemin par la suite, et que les pays ayant le moins de capacité à observer et déclarer sont aussi ceux dont les suites sont les moins complètement enregistrées. C\u2019est une association, et c\u2019est un contexte. Ce n\u2019est pas une comparaison contrôlée\u00A0: quatre nations, six événements et des totaux nationaux annuels ne peuvent pas isoler un cyclone d\u2019une sécheresse, d\u2019une pandémie ou d\u2019une politique survenue la même année, et ce site ne prétend pas l\u2019avoir fait.',
    guardSubject: 'La question',
    guardPrompt: 'vous demander ce qui a fait la différence',
  },
}

export default function DataDetective({ storm, style }) {
  const [picked, setPicked] = useState(null)
  const { language } = useLanguage()
  const t = STRINGS[language]
  const factors = FACTORS[language]

  const blocked = sectionGuard({
    data: true,
    storm,
    style,
    subject: t.guardSubject,
    prompt: t.guardPrompt,
    language,
  })
  if (blocked) return blocked

  const factor = factors.find((f) => f.id === picked) ?? null

  return (
    <Section width="narrow" style={style} backdrop={scatterBackdrop('detective')}>
      <div>
        <p className="type-eyebrow mb-1 text-accent">{t.beforeConclusion}</p>
        <h2 className="type-h2 mb-2">{t.heading(storm.name)}</h2>
        <p className="prose-column prose-wide mb-5 text-sm opacity-75">{t.intro}</p>

        {/* Full-width stacked on a phone, wrapped pills from sm up. Five
            options of very different lengths wrapped into a pill cloud gave a
            ragged block of small targets; one per line is one clear thing to
            press per line. */}
        <ul className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          {factors.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setPicked(picked === f.id ? null : f.id)}
                aria-pressed={picked === f.id}
                className={`press-target w-full min-h-[44px] rounded-xl border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel sm:w-auto sm:rounded-full sm:py-2 sm:text-center ${
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
              <p className="type-eyebrow text-accent">{t.whatShows}</p>
              <p className="mt-2 text-sm leading-snug opacity-85">{factor.evidence}</p>
              <p className="mt-3 text-xs opacity-soft">
                {t.whereToLook}
                <span className="font-semibold">{whereToLook(factor.section, language)}</span>.
              </p>
            </div>
          ) : (
            <p className="text-sm opacity-quiet">{t.pickToSee}</p>
          )}
        </div>

        <div className="mt-6 border-t border-ink/10 pt-4">
          <p className="type-eyebrow mb-2 text-accent">{t.whatEvidenceSupports}</p>
          <p className="prose-column prose-wide text-sm leading-snug opacity-80">{t.closing}</p>
        </div>
      </div>
    </Section>
  )
}
