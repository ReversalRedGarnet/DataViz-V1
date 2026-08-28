import { CHAIN_METRICS, metricLabel } from '../utils/metrics.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { chartColorsFor } from '../utils/theme.js'
import { pctChange } from '../utils/rows.js'
import { useTooltip } from '../hooks/useTooltip.js'
import { useCountUp } from '../hooks/useCountUp.js'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import NoDataNote from './NoDataNote.jsx'
import Tooltip from './Tooltip.jsx'
import { nationLabel } from '../content/nations.js'

// `m.label` (from utils/metrics.js) is resolved through metricLabel().
const STRINGS = {
  en: {
    selectSecond: 'Select a second country on the map to compare.',
    heading: 'Compare recovery',
    intro: (stormName, year) =>
      `${stormName}\u2019s year (${year}) versus the latest year on record, the same five records on both sides and the same scale under each figure.`,
    left: 'Left',
    right: 'Right',
    swapAria: (a, b) => `Swap ${a} and ${b}`,
    swap: 'Swap',
    since: (year) => `Since ${year}`,
    noDataAvailable: 'No data available',
    footnote:
      'Both columns read the same annual national series the ripple chain draws, so each figure carries everything else that happened in that year as well as the storm \u2014 the 2020\u201321 stretch carries the pandemic in particular. A larger movement is not evidence of a worse recovery, and neither column is a score.',
    guardSubject: 'Comparison',
    guardPrompt: 'compare recovery',
  },
  fr: {
    selectSecond: 'Sélectionnez un second pays sur la carte pour comparer.',
    heading: 'Comparer le redressement',
    intro: (stormName, year) =>
      `L\u2019année de ${stormName} (${year}) comparée à la dernière année disponible, les cinq mêmes indicateurs des deux côtés et la même échelle sous chaque chiffre.`,
    left: 'Gauche',
    right: 'Droite',
    swapAria: (a, b) => `Permuter ${a} et ${b}`,
    swap: 'Permuter',
    since: (year) => `Depuis ${year}`,
    noDataAvailable: 'Aucune donnée disponible',
    footnote:
      'Les deux colonnes lisent la même série nationale annuelle que la chaîne de répercussions, donc chaque chiffre porte tout ce qui s\u2019est passé cette année-là en plus du cyclone \u2014 la période 2020\u20132021 porte en particulier la pandémie. Un mouvement plus important n\u2019est pas la preuve d\u2019un redressement plus difficile, et aucune des deux colonnes n\u2019est un score.',
    guardSubject: 'Comparaison',
    guardPrompt: 'comparer le redressement',
  },
}

// The selected nations side by side across each stage of the ripple chain,
// event year against the latest year on record.
//
// The pair is chosen on the map, four slides back. That was the only way to
// change it, which made this section a readout rather than a comparison: a
// reader looking at Fiji beside Tonga and wondering about Vanuatu had to page
// back, unpick, repick and page forward again. The two pickers at the top are
// the same selection state the map writes to -- one source of truth, so a swap
// here moves the numbered pins on the map -- reachable from the section where
// the question actually occurs to you.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   selectedNations -- ordered; order drives colour and which side each is on
//   nations -- every in-scope nation, for the pickers
//   onSetNationAt -- (side, name) => void; swaps rather than duplicating
//   onSwapNations -- () => void
//   style -- forwarded to Section (entrance stagger)
export default function ComparisonView({
  data, dataError,
  storm,
  selectedNations,
  nations,
  onSetNationAt,
  onSwapNations,
  style,
}) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()
  const { language } = useLanguage()
  const t = STRINGS[language]
  const palette = chartColorsFor(theme)

  const blocked = sectionGuard({
    data,
    error: dataError,
    storm,
    style,
    subject: t.guardSubject,
    prompt: t.guardPrompt,
    language,
  })
  if (blocked) return blocked
  if (!selectedNations || selectedNations.length < 2) {
    return <EmptyState style={style}>{t.selectSecond}</EmptyState>
  }

  return (
    <Section style={style} backdrop={scatterBackdrop('compare')}>
      <div ref={containerRef} className="relative">
        <h2 className="type-h2 mb-2">{t.heading}</h2>
        <p className="prose-column prose-wide prose-short mb-5 text-sm opacity-70">
          {t.intro(storm.name, storm.year)}
        </p>

        {/* The pair, stated as a pair. Native selects rather than a custom
            control: they are keyboard- and screen-reader-complete on every
            platform for free, and the deck already knows to keep its paging
            keys off a focused SELECT. Picking a country that is already on the
            other side swaps the two rather than refusing the press or drawing
            a country against itself -- see setAt in useSelection. */}
        <div className="compare-pickers mb-6">
          {[0, 1].map((side) => (
            <label key={side} className="flex min-w-0 flex-col gap-1 text-xs">
              <span className="type-eyebrow opacity-soft">{side === 0 ? t.left : t.right}</span>
              <select
                value={selectedNations[side] ?? ''}
                onChange={(event) => onSetNationAt(side, event.target.value)}
                className="min-h-[44px] rounded-lg border border-ink/20 bg-surface/70 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {nations.map((nation) => (
                  <option key={nation} value={nation}>
                    {nationLabel(nation, language)}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="button"
            onClick={onSwapNations}
            className="press-target min-h-[44px] self-end rounded-full border border-ink/20 px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t.swapAria(nationLabel(selectedNations[0], language), nationLabel(selectedNations[1], language))}
          >
            <span aria-hidden="true">&#8646;</span> {t.swap}
          </button>
        </div>

        <div className="compare-split grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Keyed by position, not by name. Keying by name would tear the
              card down and build a new one whenever the second pick changed,
              and the figures inside are meant to travel from the old nation's
              numbers to the new one's -- how far they have to move is the
              comparison. */}
          {selectedNations.map((nation, i) => (
            <NationSummary
              key={i}
              nation={nation}
              data={data}
              eventYear={storm.year}
              color={palette.selection[i]}
              index={i}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              language={language}
              t={t}
            />
          ))}
        </div>
        {/* Kept on the slide rather than behind a control. Every figure above
            is an annual national total that no cyclone has to itself, and a
            side-by-side layout is the most persuasive way there is to imply
            otherwise -- so the qualification travels with it. */}
        <p className="prose-wide mt-6 text-xs italic leading-snug opacity-70">{t.footnote}</p>

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}


function NationSummary({ nation, data, eventYear, color, index, showTooltip, hideTooltip, language, t }) {
  return (
    <div
      className="animate-pop-in rounded-2xl border-t-4 bg-surface/80 p-6 shadow-sm"
      style={{ borderColor: color, animationDelay: `${index * 100}ms` }}
    >
      <h3 className="type-h3">{nationLabel(nation, language)}</h3>
      <p className="type-eyebrow mb-5 text-accent">{t.since(eventYear)}</p>
      <ul className="divide-y divide-ink/10 text-sm">
        {CHAIN_METRICS.map((m) => {
          const rows = (data[m.key] ?? [])
            .filter((d) => d.nation === nation)
            .sort((a, b) => a.year - b.year)
          const eventRow = rows.find((r) => r.year === eventYear)
          const latestRow = rows[rows.length - 1]

          return (
            <li key={m.key} className="flex items-center justify-between gap-4 py-2.5">
              <span className="opacity-70">{metricLabel(m, language)}</span>
              {eventRow && latestRow ? (
                <Delta metric={m} eventRow={eventRow} latestRow={latestRow} language={language} />
              ) : (
                <NoDataNote
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  className="text-xs italic opacity-70"
                >
                  {t.noDataAvailable}
                </NoDataNote>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Before/after figures plus a direction and magnitude badge. Ink-only, with a
// glyph carrying the direction rather than red/green, so this doesn't layer a
// second colour scheme on top of the one used for nation selection.
//
// The figures ease between values rather than switching, so swapping the
// country being compared shows the size of the difference as movement. The bar
// underneath is driven by the same eased percentage, capped at 100% of its
// track -- a metric that tripled and one that quadrupled both fill it, and the
// printed number is what separates them.
function Delta({ metric, eventRow, latestRow }) {
  const target = pctChange(eventRow[metric.field], latestRow[metric.field])
  // All three move together on the same clock -- see hooks/useCountUp.js.
  const [from, to, pct] = useCountUp([
    eventRow[metric.field],
    latestRow[metric.field],
    target ?? 0,
  ])
  const magnitude = Math.min(1, Math.abs(pct) / 100)

  return (
    <span className="flex flex-col items-end">
      <span className="font-medium tabular-nums">
        {metric.format(from)} <span className="opacity-faint">{'\u2192'}</span> {metric.format(to)}
      </span>
      {target !== null && (
        <>
          <span className="mt-0.5 flex items-center gap-1 text-xs font-medium opacity-70">
            <span aria-hidden="true">{pct >= 0 ? '\u25b2' : '\u25bc'}</span>
            {Math.abs(pct).toFixed(0)}%
          </span>
          <span aria-hidden="true" className="relative mt-1 block h-[3px] w-24 rounded-full bg-ink/10">
            <span
              className="absolute top-0 h-full rounded-full bg-ink/45"
              style={
                pct >= 0
                  ? { left: '50%', width: `${magnitude * 50}%` }
                  : { right: '50%', width: `${magnitude * 50}%` }
              }
            />
          </span>
        </>
      )}
    </span>
  )
}
