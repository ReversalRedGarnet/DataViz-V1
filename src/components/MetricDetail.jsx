import { CHAIN_METRICS, metricLabel, metricCaveat } from '../utils/metrics.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { nationLabel } from '../content/nations.js'
import { pluralize } from '../utils/pluralize.js'

// What one link of the ripple chain actually is, opened in place.
//
// Everything printed here is either the metric's own caveat -- the same
// sentence that sits under its chart, moved nowhere and shortened not at all --
// or counted out of the rows already loaded for the selected countries. There
// are no new figures, no new sources and no new claims: the panel answers "what
// am I looking at, and how much of it was actually reported", which is the
// question a reader has at the moment they press a link, and it answers it
// without sending them to the method section and back.
//
// The coverage line is the part worth having. A chart with four points and a
// chart with twelve look equally confident, and this is the only place the
// difference is stated in words -- including how many of those points are
// reported zeros rather than gaps, a distinction this project refuses to blur
// anywhere else and will not start blurring here.
//
// Props:
//   metric -- one of CHAIN_METRICS
//   rows -- that metric's rows, already filtered to the selected nations
//   nations -- the selected nations, in order
//   onClose -- () => void
//
// `metric.label`/`metric.caveat` (utils/metrics.js) are resolved through
// metricLabel()/metricCaveat(); everything else here translates directly.
const STRINGS = {
  en: {
    linkOf: (n, total) => `Link ${n} of ${total}`,
    close: 'Close',
    follows: (label) => `Follows ${label}. `,
    firstLink: 'The first link: who the storm reached. ',
    feedsInto: (label) => `Feeds into ${label}.`,
    lastLink: 'The last link in the chain.',
    nothingReported: 'nothing reported for this metric.',
    yearsReported: (n, from, to) => `${n} ${pluralize(n, { one: 'year', other: 'years' }, 'en')} reported, ${from}\u2013${to}`,
    reportedZero: (n) => ` \u00b7 ${n} of them a reported zero, not a gap`,
  },
  fr: {
    linkOf: (n, total) => `Maillon ${n} sur ${total}`,
    close: 'Fermer',
    follows: (label) => `Fait suite à ${label}. `,
    firstLink: 'Le premier maillon\u00A0: qui le cyclone a touché. ',
    feedsInto: (label) => `Alimente ${label}.`,
    lastLink: 'Le dernier maillon de la chaîne.',
    nothingReported: 'rien de déclaré pour cet indicateur.',
    yearsReported: (n, from, to) => `${n} ${pluralize(n, { one: 'an', other: 'ans' }, 'fr')} déclaré${n === 1 ? '' : 's'}, ${from}\u2013${to}`,
    reportedZero: (n) => ` \u00b7 ${n} d\u2019entre eux un zéro déclaré, pas une lacune`,
  },
}

function coverage(rows, nation, field) {
  const mine = rows.filter((r) => r.nation === nation)
  if (mine.length === 0) return { reported: 0 }
  const years = mine.map((r) => r.year)
  const zeros = mine.filter((r) => r[field] === 0).length
  return {
    reported: mine.length,
    from: Math.min(...years),
    to: Math.max(...years),
    zeros,
  }
}

export default function MetricDetail({ metric, rows, nations, onClose }) {
  const { language } = useLanguage()
  const t = STRINGS[language]
  const stage = CHAIN_METRICS.findIndex((m) => m.key === metric.key)
  const before = CHAIN_METRICS[stage - 1]
  const after = CHAIN_METRICS[stage + 1]

  return (
    <div className="mt-4 rounded-xl border border-accent/30 bg-surface/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-eyebrow text-accent">{t.linkOf(stage + 1, CHAIN_METRICS.length)}</p>
          <h3 className="type-h3 mt-0.5 text-base">{metricLabel(metric, language)}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] shrink-0 rounded-full px-3 text-xs underline decoration-ink/30 underline-offset-2 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t.close}
        </button>
      </div>

      {/* Where this link sits, said rather than implied by grid position. The
          order of the chain is an argument -- the damage travels this way --
          and a reader who has opened one card should not have to count cards
          to see what it follows. */}
      <p className="mt-2 text-xs opacity-70">
        {before ? t.follows(metricLabel(before, language).toLowerCase()) : t.firstLink}
        {after ? t.feedsInto(metricLabel(after, language).toLowerCase()) : t.lastLink}
      </p>

      <ul className="mt-3 space-y-1 text-xs">
        {nations.map((nation) => {
          const c = coverage(rows, nation, metric.field)
          return (
            <li key={nation} className="flex flex-wrap gap-x-2 opacity-80">
              <span className="font-semibold">{nationLabel(nation, language)}:</span>
              {c.reported === 0 ? (
                <span className="italic">{t.nothingReported}</span>
              ) : (
                <span className="tabular-nums">
                  {t.yearsReported(c.reported, c.from, c.to)}
                  {c.zeros > 0 && <span className="not-italic">{t.reportedZero(c.zeros)}</span>}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-3 border-l-2 border-ink/15 pl-3 text-xs italic leading-snug opacity-75">
        {metricCaveat(metric, language)}
      </p>
    </div>
  )
}
