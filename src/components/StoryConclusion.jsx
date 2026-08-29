import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import { sectionGuard } from './sectionGuard.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useInView } from '../hooks/useInView.js'
import { chartColorsFor } from '../utils/theme.js'
import { NATION_COUNT, NATION_NAMES, nationListInProse } from '../content/nations.js'

// THE END OF THE ARGUMENT, NOT THE END OF THE PAGE.
//
// The piece used to run out rather than finish: comparison, then method, then
// sources. Everything the reader had assembled -- a storm, a pair of countries,
// five records, four trajectories -- was left for them to add up on their own
// while the site moved on to explaining itself.
//
// This says the one thing all of it adds up to, in the site's own terms and
// without a figure that has not already been shown: a shared hazard does not
// produce a shared recovery. Then it offers the loop back, because the honest
// response to "these four went different ways" is to go and look at another
// storm rather than to be thanked for reading.
//
// The drawing is the argument's shape and nothing more. Four lines from one
// point, spreading. It carries no scale, no axis and no figures, precisely so
// that it cannot be mistaken for a chart -- the charts are four slides back,
// with their caveats attached. It is aria-hidden and the sentence beside it
// says the same thing in words.
//
// The loop back is one button, and it is not a navigation control: it clears
// the storm and the pair. The deck follows because it has to -- with no storm
// the ten sections after the timeline do not exist, so the reader lands back on
// the question the piece opens with. That is a consequence of the state
// changing, not a slide jump, which is the distinction the whole deck runs on:
// the footer's Back and Next are the only things that move a reader.
//
// The two other offers that used to sit here -- compare another pair, watch the
// divergence again -- were slide jumps and are gone. What they pointed at is
// named in the line below instead.
//
// Props:
//   storm / selectedNations -- what the reader chose, named back to them
//   onReset -- clears the storm and the pair, for "start again"
const PATHS = [
  'M8,60 C90,58 150,46 292,18',
  'M8,60 C90,60 150,56 292,44',
  'M8,60 C90,62 150,68 292,74',
  'M8,60 C90,64 150,80 292,104',
]

const STRINGS = {
  en: {
    whatShowed: (name) => `What ${name} showed`,
    heading: 'A shared storm is not a shared recovery.',
    intro: (name, reachedList, year, missedClause, comparedClause) =>
      `${name} reached ${reachedList} in ${year}${missedClause}. Indexed to their own figures in that year, the four national trajectories start from one point and do not stay together: the harvest, the herds, the power supply and the visitors move by different amounts, for different lengths of time, and the record of them is least complete where the capacity to record was thinnest.${comparedClause} None of that ranks these countries, and this site does not: no trajectory here is a score, and the ones with the largest movements are not the ones that coped worst.`,
    missedClause: (list) => ` and missed ${list}`,
    comparedClause: (list) => ` You compared ${list}; the same storm, and two different afterwards.`,
    lookAgain: 'Look again',
    startAgain: 'Start again with another storm',
    footnote:
      'Or page back with the footer: the map takes another pair of countries against this same storm, and Where They Part Ways replays the divergence. How the roster was built, what it excludes and where every figure came from are in the two sections after this one.',
    guardSubject: 'The finding',
    guardPrompt: 'see what it all adds up to',
  },
  fr: {
    whatShowed: (name) => `Ce qu\u2019a montré ${name}`,
    heading: 'Un cyclone partagé n\u2019est pas un redressement partagé.',
    intro: (name, reachedList, year, missedClause, comparedClause) =>
      `${name} a touché ${reachedList} en ${year}${missedClause}. Indexées à leur propre chiffre de cette année-là, les quatre trajectoires nationales partent d\u2019un même point et ne restent pas ensemble\u00A0: la récolte, le cheptel, l\u2019approvisionnement électrique et les visiteurs évoluent d\u2019amplitudes différentes, sur des durées différentes, et leur suivi est le moins complet là où la capacité à l\u2019assurer était la plus faible.${comparedClause} Rien de tout cela ne classe ces pays, et ce site ne le fait pas\u00A0: aucune trajectoire ici n\u2019est un score, et celles aux mouvements les plus marqués ne sont pas celles qui s\u2019en sont le moins bien sorties.`,
    missedClause: (list) => ` et n\u2019a pas touché ${list}`,
    comparedClause: (list) =>
      ` Vous avez comparé ${list}\u00A0: le même cyclone, et deux suites différentes.`,
    lookAgain: 'Regarder à nouveau',
    startAgain: 'Recommencer avec un autre cyclone',
    footnote:
      'Ou revenez en arrière avec le pied de page\u00A0: la carte permet de choisir une autre paire de pays face à ce même cyclone, et « Où les trajectoires divergent » relance la divergence. Comment la liste des cyclones a été établie, ce qu\u2019elle exclut et d\u2019où proviennent tous les chiffres se trouvent dans les deux sections suivantes.',
    guardSubject: 'Le résultat',
    guardPrompt: 'voir ce que cela signifie dans son ensemble',
  },
}

function ConvergeDiverge({ inView }) {
  const { theme } = useTheme()
  const palette = chartColorsFor(theme)

  return (
    <svg
      viewBox="0 0 300 120"
      aria-hidden="true"
      className="converge-diverge w-full"
      data-play={inView ? 'true' : 'false'}
    >
      {PATHS.map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={palette.series[i]}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
      {/* The common origin: one storm, one starting point, the same claim the
          divergence section indexes every nation to. */}
      <circle cx="8" cy="60" r="4" fill={palette.single} />
    </svg>
  )
}

export default function StoryConclusion({ storm, selectedNations, onReset, style }) {
  const [sectionRef, inView] = useInView({ threshold: 0.3 })
  const { language } = useLanguage()
  const t = STRINGS[language]

  const blocked = sectionGuard({
    data: true,
    storm,
    style,
    subject: t.guardSubject,
    prompt: t.guardPrompt,
    language,
  })
  if (blocked) return blocked

  const pair = selectedNations ?? []

  const missedClause =
    storm.nations.length < NATION_COUNT
      ? t.missedClause(
          nationListInProse(
            NATION_NAMES.filter((n) => !storm.nations.includes(n)),
            language
          )
        )
      : ''
  const comparedClause = pair.length === 2 ? t.comparedClause(nationListInProse(pair, language)) : ''

  return (
    <Section width="narrow" style={style} backdrop={scatterBackdrop('conclusion')}>
      <div ref={sectionRef}>
        <p className="type-eyebrow mb-1 text-accent">{t.whatShowed(storm.name)}</p>
        <h2 className="type-h2 mb-3">{t.heading}</h2>

        {/* Staggered a beat behind the heading, so the finding is read before
            its evidence -- the diagram's own lines then draw in over 1.1s
            once this frame has arrived (see ConvergeDiverge's inView gate). */}
        <div
          className="animate-pop-in md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8"
          style={{ animationDelay: '110ms' }}
        >
          <p className="prose-column prose-wide text-sm leading-snug opacity-85">
            {t.intro(
              storm.name,
              nationListInProse(storm.nations, language),
              storm.year,
              missedClause,
              comparedClause
            )}
          </p>
          <div className="mt-5 w-full max-w-[320px] md:mt-0 md:w-[300px]">
            <ConvergeDiverge inView={inView} />
          </div>
        </div>

        {/* The closing offer, last in the sequence: what it showed, then what
            to do next. */}
        <div className="animate-pop-in mt-8" style={{ animationDelay: '220ms' }}>
          <p className="type-eyebrow mb-3 text-accent">{t.lookAgain}</p>
          <button
            type="button"
            onClick={onReset}
            className="press-target min-h-[44px] rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t.startAgain}
          </button>
          <p className="mt-4 figure-prose text-xs italic leading-snug opacity-70">{t.footnote}</p>
        </div>
      </div>
    </Section>
  )
}
