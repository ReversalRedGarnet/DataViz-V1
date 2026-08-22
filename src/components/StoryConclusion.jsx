import Section from './Section.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { useInView } from '../hooks/useInView.js'
import { chartColorsFor } from '../utils/theme.js'
import { NATIONS } from './MapView.jsx'
import { formatNationList } from '../utils/formatNationList.js'

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

  const blocked = sectionGuard({
    data: true,
    storm,
    style,
    tone: 'panel',
    subject: 'The finding',
    prompt: 'see what it all adds up to',
  })
  if (blocked) return blocked

  const pair = selectedNations ?? []

  return (
    <Section tone="panel" style={style}>
      <div ref={sectionRef} className="mx-auto max-w-3xl">
        <p className="type-eyebrow mb-1 text-accent">What {storm.name} showed</p>
        <h2 className="type-h2 mb-3">A shared storm is not a shared recovery.</h2>

        <div className="md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8">
          <p className="prose-column prose-wide text-sm leading-snug opacity-85">
            {storm.name} reached {formatNationList(storm.nations)} in {storm.year}
            {storm.nations.length < NATIONS.length &&
              ` and missed ${formatNationList(
                NATIONS.map((n) => n.name).filter((n) => !storm.nations.includes(n))
              )}`}
            . Indexed to their own figures in that year, the four national trajectories start from
            one point and do not stay together: the harvest, the herds, the power supply and the
            visitors move by different amounts, for different lengths of time, and the record of
            them is least complete where the capacity to record was thinnest.
            {pair.length === 2 && (
              <>
                {' '}
                You compared {pair[0]} and {pair[1]}; the same storm, and two different afterwards.
              </>
            )}{' '}
            None of that ranks these countries, and this site does not: no trajectory here is a
            score, and the ones with the largest movements are not the ones that coped worst.
          </p>
          <div className="mt-5 w-full max-w-[320px] md:mt-0 md:w-[300px]">
            <ConvergeDiverge inView={inView} />
          </div>
        </div>

        <div className="mt-8">
          <p className="type-eyebrow mb-3 text-accent">Look again</p>
          <button
            type="button"
            onClick={onReset}
            className="press-target min-h-[44px] rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Start again with another storm
          </button>
          <p className="mt-4 max-w-prose text-xs italic leading-snug opacity-70">
            Or page back with the footer: the map takes another pair of countries against this same
            storm, and Where They Part Ways replays the divergence. How the roster was built, what
            it excludes and where every figure came from are in the two sections after this one.
          </p>
        </div>
      </div>
    </Section>
  )
}
