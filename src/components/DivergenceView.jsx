import { useMemo, useState } from 'react'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import Tooltip from './Tooltip.jsx'
import DivergenceChart from './DivergenceChart.jsx'
import SeriesLegend from './SeriesLegend.jsx'
import { NATION_NAMES } from '../content/nations.js'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useNationHighlight } from '../hooks/useNationHighlight.jsx'
import { chartColorsFor } from '../utils/theme.js'
import { seriesStyles } from '../utils/charts/index.js'
import { CHAIN_METRICS, metricLabel } from '../utils/metrics.js'
import { buildDivergencePanels, divergenceYearRange } from '../utils/divergence.js'

// Caveats that belong to a specific metric rather than to the section. Kept
// here rather than in metrics.js because they're about what this indexed view
// implies, not about the underlying figures.
//
// A function of the baseline year, not a constant. As a constant it printed the
// 2020 sentence under every storm, and for a 2015 baseline that sentence is
// simply false -- arrivals in 2015 were not collapsed by anything. COVID is
// still relevant to an earlier baseline, because the sweep crosses 2020-21 on
// its way to the present, so the note changes form rather than disappearing.
function metricNotes(eventYear, language) {
  const baselineIsCollapsed = eventYear === 2020 || eventYear === 2021
  const notes = {
    en: baselineIsCollapsed
      ? 'Arrivals in the baseline year were already collapsed by COVID-19 border closures, so this traces recovery from that floor rather than from the cyclone alone.'
      : 'The 2020\u201321 stretch of this line is dominated by COVID-19 border closures, not by the storm.',
    fr: baselineIsCollapsed
      ? "Les arrivées de l\u2019année de référence étaient déjà effondrées par les fermetures de frontières liées à la COVID-19, donc ceci retrace un redressement depuis ce plancher plutôt que depuis le seul cyclone."
      : "Le tronçon 2020\u20132021 de cette ligne est dominé par les fermetures de frontières liées à la COVID-19, pas par le cyclone.",
  }
  return { tourist_arrivals: notes[language] }
}

const STRINGS = {
  en: {
    eyebrow: 'One storm, one starting point',
    heading: (name) => `Where the four nations part ways after ${name}`,
    intro: (year) =>
      `Each line begins at 100 \u2014 that nation\u2019s own figure in ${year}. Nothing else is adjusted and no country is measured against another, so the only thing left for the chart to show is the distance that opens up afterwards.`,
    replayAll: 'Replay all',
    notEnoughData: (year) => `No metric in this chain has enough data after ${year} to index.`,
    footnote1:
      'People affected is left out of this view and economic loss is not in the chain at all: both are reported in scattered years, and an index across gaps draws a confident line over years nobody measured.',
    footnote2: (name) =>
      `The further right the sweep runs, the less of what it shows belongs to ${name}. Read the separation as the shape of four different recoveries, not as a measurement of one storm\u2019s reach.`,
    guardSubject: 'The divergence',
    guardPrompt: 'see how the four nations moved apart after it',
  },
  fr: {
    eyebrow: 'Un cyclone, un même point de départ',
    heading: (name) => `Où les quatre nations divergent après ${name}`,
    intro: (year) =>
      `Chaque ligne commence à 100 \u2014 le chiffre propre à cette nation en ${year}. Rien d\u2019autre n\u2019est ajusté et aucun pays n\u2019est comparé à un autre, donc la seule chose que le graphique peut montrer est l\u2019écart qui se creuse ensuite.`,
    replayAll: 'Tout relancer',
    notEnoughData: (year) => `Aucun indicateur de cette chaîne n\u2019a assez de données après ${year} pour être indexé.`,
    footnote1:
      "Les personnes touchées sont exclues de cette vue et les pertes économiques ne font pas partie de la chaîne\u00A0: toutes deux sont déclarées de façon éparse selon les années, et un indice construit sur des lacunes tracerait une ligne trompeusement assurée sur des années jamais mesurées.",
    footnote2: (name) =>
      `Plus le balayage avance vers la droite, moins ce qu\u2019il montre appartient à ${name}. Lisez cet écart comme la forme de quatre redressements différents, pas comme une mesure de la portée d\u2019un seul cyclone.`,
    guardSubject: 'La divergence',
    guardPrompt: 'voir comment les quatre nations se sont éloignées après le cyclone',
  },
}

// The legend's colours and dashes come from seriesStyles(), the same resolver
// the charts draw with. They used to be a LEGEND_DASH array declared here --
// a fourth copy of DIVERGENCE_DASH, differing only in spelling solid as
// 'none' rather than null, with nothing keeping the two in step.

// Every nation indexed to its own event-year figure, so the four lines start
// from one point and the chart can only show how far apart they finish.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   style -- forwarded to Section (entrance stagger)
// People affected and economic loss are deliberately absent from this view --
// see the note under the grid -- so this map covers the four metrics that do
// appear, and a fifth appearing later would be added here rather than counted.
const DIVERGENCE_FIGURES = {
  crop_yield: 'divergence-crop',
  livestock_yield: 'divergence-livestock',
  power_generation: 'divergence-power',
  tourist_arrivals: 'divergence-tourism',
}

export default function DivergenceView({ data, dataError, storm, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()
  const { language } = useLanguage()
  const t = STRINGS[language]
  const palette = chartColorsFor(theme)
  const { pinned, setPinned } = useNationHighlight()
  // Each chart now runs its own sweep clock (see DivergenceChart) and reaches
  // its own last real year rather than a page-wide max. This token is how
  // "Replay all" gets every chart moving together: bumping it fans out to
  // every panel's own play(), same trigger, four independent clocks. It starts
  // at 0 so mounting never auto-plays before the section is even on screen --
  // each panel's first play instead comes from that panel's own
  // scroll-into-view trigger (see DivergenceChart), since this is one tall
  // slide with four stacked charts and the section heading scrolling into
  // view says nothing about whether a lower panel is actually on screen yet.
  const [playToken, setPlayToken] = useState(0)

  const eventYear = storm?.year ?? null
  const panels = useMemo(
    () => (eventYear ? buildDivergencePanels(data, CHAIN_METRICS, NATION_NAMES, eventYear) : []),
    [data, eventYear]
  )
  const years = useMemo(
    () => (eventYear ? divergenceYearRange(panels, eventYear) : [0, 0]),
    [panels, eventYear]
  )
  const notes = useMemo(() => metricNotes(eventYear, language), [eventYear, language])
  const legendStyles = useMemo(() => seriesStyles(NATION_NAMES, palette), [palette])

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
  if (panels.length === 0) {
    return <EmptyState style={style}>{t.notEnoughData(storm.year)}</EmptyState>
  }

  return (
    <Section style={style} backdrop={scatterBackdrop('divergence')}>
      <div ref={containerRef} className="relative">
        <p className="type-eyebrow mb-1 text-accent">{t.eyebrow}</p>
        <h2 className="type-h2 mb-2">{t.heading(storm.name)}</h2>
        <p className="prose-column prose-wide prose-short mb-6 text-sm opacity-75">
          {t.intro(storm.year)}
        </p>

        {/* Buttons, not decorative swatches -- see SeriesLegend. Pointing at
            one already lifted that nation's line out of the other three on
            every chart in the deck, but pointing is a gesture a touch screen
            does not have, so the same chip presses to hold the thread and
            presses again to release it. */}
        <SeriesLegend
          styles={legendStyles}
          pinned={pinned}
          onPin={setPinned}
          className="mb-6 gap-x-5 gap-y-3"
        />

        {/* No year printed beside this button any more: with four
            independent clocks below, one shared number would be true of at
            most one of them at any given moment. Each chart's own count is
            on its own card, next to its own mini play button. */}
        <div className="mb-5 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPlayToken((t) => t + 1)}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:bg-surface/70 active:scale-95"
          >
            {t.replayAll}
          </button>
        </div>

        <div className="section-bleed grid grid-cols-1 gap-5 lg:grid-cols-2">
          {panels.map((panel, i) => (
            <DivergenceChart
              key={panel.metric.key}
              label={metricLabel(panel.metric, language)}
              series={panel.series}
              years={years}
              lastYear={panel.lastYear}
              playToken={playToken}
              format={panel.metric.format}
              note={notes[panel.metric.key]}
              missing={panel.missing}
              figure={{ key: DIVERGENCE_FIGURES[panel.metric.key], source: panel.metric.source }}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              className={i === panels.length - 1 && panels.length % 2 !== 0 ? 'lg:col-span-2' : ''}
            />
          ))}
        </div>

        <p className="prose-wide mt-6 text-xs italic opacity-70">{t.footnote1}</p>
        <p className="prose-wide mt-2 text-xs italic opacity-70">{t.footnote2(storm.name)}</p>

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
