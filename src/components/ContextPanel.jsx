import { useMemo } from 'react'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import Tooltip from './Tooltip.jsx'
import TrendChart from './TrendChart.jsx'
import MetricSnapshotChart from './MetricSnapshotChart.jsx'
import NationRef, { NationRefList } from './NationRef.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { NATION_NAMES } from '../content/nations.js'
import { CAPACITY_METRICS, CONTEXT_METRICS, CHAIN_METRICS, metricLabel, metricCaveat } from '../utils/metrics.js'
import { DATA_YEAR_MIN, DATA_YEAR_MAX } from '../content/storms.js'
import { snapshotRowsByMetric, rowsByMetricForNations, reportingCompletenessByNation } from '../utils/rows.js'

// The capacity chart is flat in every year, so any year is representative --
// but "any year" still has to be a year the pipeline actually exported. This
// was a bare 2024 that had to match YEAR_MAX in data-pipeline/common.py and
// would not have been updated when the window moved, leaving this section
// silently empty. Both now read src/content/roster.json.
const CAPACITY_YEAR = DATA_YEAR_MAX

// `m.format` comes from utils/metrics.js; label/caveat are resolved through
// metricLabel()/metricCaveat() there.
const STRINGS = {
  en: {
    eyebrow: 'Underneath the chain',
    heading: 'Who can measure, and what is changing',
    intro:
      'Every record in the ripple chain has holes in it. These two do not, for the same reason the others do: a disaster figure only exists if a country had the capacity to assess and file it after being hit, while the records below are structural or measured from orbit and need nobody to report them.',
    observeHeading: 'Who can observe their own weather',
    rankingIntro: (rankingList) => (
      <>
        {'Uneven data is not only a limitation of this project \u2014 it is an unequal distribution of '}
        the ability to describe what happened to you. The two charts below are the same ranking,
        best to worst: {rankingList}. One counts monitoring stations, unchanged in every year on
        record; the other counts how much of the ripple chain each nation actually got to report.{' '}
        <NationRef nation="Solomon Islands" />
        {' sits last on both \u2014 it has the fewest stations, and no tourist arrivals were ever reported for it at all.'}
      </>
    ),
    dataNotAvailable: 'Data not available.',
    ariaByNation: (label) => `${label}, by nation`,
    yearsReported: 'Years of data actually reported',
    yearsReportedAria: 'Years of data actually reported, out of 60 possible, by nation',
    completenessCaveat: (max, yearMax) =>
      `Out of ${max} possible country-years (5 records \u00d7 12 years), this counts how many each nation actually reported. A gap shared by all four nations \u2014 like ${yearMax} power-generation data, not yet published for anyone \u2014 doesn't count against any one country. Only gaps that fall unevenly, where one nation has data and another doesn't, move this ranking.`,
    changingHeading: 'What is changing underneath',
    changingP1:
      'Warmer seas raise the ceiling on how intense a cyclone can become; emissions per head say who is doing the warming. These are the only two climate claims this site makes with confidence, and both are about trends across all four nations \u2014 not evidence about any one storm.',
    changingP2:
      'A third mechanism is stated rather than charted. Sea level rise worsens storm surge \u2014 a storm arriving on a higher ocean reaches further inland \u2014 and it is the best-attributed link of the three, with IPCC AR6 rating the human contribution since 1971 very likely. The regional record is reported only to the nearest 0.1\u00A0m, giving three distinct values across twelve years and hiding any movement under 10\u00A0cm. Charting it would claim a precision the measurement does not have.',
    guardSubject: 'Context',
  },
  fr: {
    eyebrow: 'Sous la chaîne',
    heading: 'Qui peut mesurer, et ce qui change',
    intro:
      "Chaque indicateur de la chaîne de répercussions comporte des lacunes. Ces deux-là n\u2019en ont pas, pour la raison même qui explique les autres\u00A0: un chiffre de catastrophe n\u2019existe que si un pays avait la capacité d\u2019évaluer et de déclarer l\u2019impact après avoir été touché, alors que les indicateurs ci-dessous sont structurels ou mesurés par satellite et ne nécessitent aucune déclaration.",
    observeHeading: 'Qui peut observer sa propre météo',
    rankingIntro: (rankingList) => (
      <>
        {'Des données inégales ne sont pas seulement une limite de ce projet \u2014 c\u2019est une '}
        {'répartition inégale de la capacité à décrire ce qui vous est arrivé. Les deux graphiques '}
        {'ci-dessous montrent le même classement, du meilleur au pire\u00A0: '}
        {rankingList}
        {'. L\u2019un compte les stations de surveillance, inchangées chaque année sur la période\u00A0; '}
        {'l\u2019autre compte la part de la chaîne de répercussions que chaque nation a effectivement pu déclarer.'}{' '}
        <NationRef nation="Solomon Islands" />
        {' arrive dernier dans les deux cas \u2014 c\u2019est le pays avec le moins de stations, et aucune arrivée touristique n\u2019y a jamais été déclarée.'}
      </>
    ),
    dataNotAvailable: 'Données non disponibles.',
    ariaByNation: (label) => `${label}, par nation`,
    yearsReported: 'Années de données effectivement déclarées',
    yearsReportedAria: 'Années de données effectivement déclarées, sur 60 possibles, par nation',
    completenessCaveat: (max, yearMax) =>
      `Sur ${max} années-pays possibles (5 indicateurs \u00d7 12 ans), ce chiffre compte combien chaque nation en a effectivement déclaré. Une lacune partagée par les quatre nations \u2014 comme les données de production électrique ${yearMax}, non encore publiées pour aucune d\u2019elles \u2014 ne compte contre aucun pays en particulier. Seules les lacunes réparties de façon inégale, où une nation a des données et une autre non, déplacent ce classement.`,
    changingHeading: 'Ce qui change en profondeur',
    changingP1:
      "Des mers plus chaudes relèvent le plafond d\u2019intensité qu\u2019un cyclone peut atteindre\u00A0; les émissions par habitant indiquent qui est à l\u2019origine du réchauffement. Ce sont les deux seules affirmations climatiques que ce site avance avec confiance, et toutes deux portent sur des tendances à travers les quatre nations \u2014 non sur la preuve d\u2019un cyclone en particulier.",
    changingP2:
      "Un troisième mécanisme est énoncé plutôt que représenté graphiquement. L\u2019élévation du niveau de la mer aggrave les ondes de tempête \u2014 un cyclone arrivant sur un océan plus haut pénètre plus loin dans les terres \u2014 et c\u2019est le lien le mieux établi des trois, le rapport du GIEC AR6 jugeant très probable la contribution humaine depuis 1971. Le relevé régional n\u2019est rapporté qu\u2019au 0,1\u00A0m près, ce qui donne trois valeurs distinctes sur douze ans et masque tout mouvement inférieur à 10\u00A0cm. Le représenter graphiquement reviendrait à revendiquer une précision que la mesure n\u2019a pas.",
    guardSubject: 'Contexte',
  },
}

// The two things the ripple chain cannot show about itself.
//
// Capacity: how many weather stations each nation has. It never changes, which
// is exactly why it belongs here -- it is the standing difference that explains
// why the chain above it has holes in it, and why those holes fall where they
// do. Drawn as a snapshot bar chart, since a flat line over twelve years would
// be a chart of nothing.
//
// Context: sea surface temperature and emissions per head, drawn for all four
// nations at once. These are complete records precisely because they need
// nobody to report them, and they carry the only climate claims this site can
// make with confidence. Both are trends; neither is evidence about an
// individual storm, and each chart's own caveat says so. Sea level belongs in
// this group and is stated in prose instead -- the portal reports it to 0.1 m,
// which is too coarse to chart honestly.
//
// Props:
//   data -- { [metricKey]: Array<{ nation, year, [field]: number }> }
//   style -- forwarded to Section (entrance stagger)
const CONTEXT_FIGURES = {
  sst_anomaly: 'context-sst',
  ghg_per_capita: 'context-ghg',
}

export default function ContextPanel({ data, dataError, style }) {
  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { language } = useLanguage()
  const t = STRINGS[language]

  const capacity = useMemo(
    () => snapshotRowsByMetric(data, CAPACITY_METRICS, CAPACITY_YEAR, NATION_NAMES),
    [data]
  )
  const context = useMemo(
    () => rowsByMetricForNations(data, CONTEXT_METRICS, NATION_NAMES),
    [data]
  )
  const completeness = useMemo(
    () => reportingCompletenessByNation(data, CHAIN_METRICS, NATION_NAMES, DATA_YEAR_MIN, DATA_YEAR_MAX),
    [data]
  )
  // How much of the ripple chain a nation could possibly have reported: every
  // chain metric, every year in the full data window. Read off the rows
  // themselves rather than recomputed here, so this can never drift from what
  // reportingCompletenessByNation actually divided by.
  const completenessMax = completeness[0]?.possible ?? 0
  // Memoised for the same reason every other chart's format function is a
  // stable reference declared once in metrics.js rather than written inline:
  // useChartCanvas redraws whenever the format function it's given changes
  // identity. An inline arrow here is a new function on every render of this
  // component, and hovering a bar elsewhere on this same panel updates
  // tooltip state that lives in this component -- so every hover was
  // recreating this closure and the chart was redrawing itself, entrance
  // animation and all, on every pointer move.
  const yearsWord = language === 'fr' ? 'ans' : 'years'
  const completenessFormat = useMemo(
    () => (v) => `${v} ${language === 'fr' ? 'sur' : 'of'} ${completenessMax} ${yearsWord}`,
    [completenessMax, language, yearsWord]
  )

  // The stations ranking, best to worst, read out of the chart's own rows
  // rather than typed as nation names in the paragraph below. Typed out by
  // hand it would go stale silently the moment a data refresh reordered two
  // nations; read from the rows, the sentence can't disagree with the chart
  // sitting right next to it.
  const rankOrder = useMemo(() => {
    const stationsRows = capacity?.[CAPACITY_METRICS[0].key] ?? []
    return [...stationsRows].sort((a, b) => b.value - a.value).map((r) => r.nation)
  }, [capacity])

  // No `storm` key at all, which is what tells sectionGuard this section does
  // not depend on one -- these two records exist with or without a selection.
  // The error and loading branches used to be written out here by hand for
  // want of that, and had already drifted from the wording every other section
  // uses.
  const blocked = sectionGuard({ data, error: dataError, style, subject: t.guardSubject, language })
  if (blocked) return blocked

  return (
    <Section style={style} backdrop={scatterBackdrop('context')}>
      <div ref={containerRef} className="relative">
        <p className="type-eyebrow mb-1 text-accent">{t.eyebrow}</p>
        <h2 className="type-h2 mb-2">{t.heading}</h2>
        <p className="prose-column prose-wide mb-8 text-sm opacity-75">{t.intro}</p>

        {capacity && (
          <div className="mb-10">
            <h3 className="type-subhead mb-1 text-accent">{t.observeHeading}</h3>
            {/* Opens on the human sentence rather than closing on it -- it used
                to be the last clause of this paragraph, which a skim reads
                right past. The ranking claim itself used to be stated in
                prose alone ("set this ranking beside the gaps..."); it is now
                also the second chart below, so the paragraph only needs to
                point at it, not carry the whole argument in words. */}
            <p className="prose-column prose-wide mb-4 text-sm opacity-80">
              {t.rankingIntro(<NationRefList nations={rankOrder} join=", " last=", " />)}
            </p>
            <div className="section-bleed grid grid-cols-1 gap-5 sm:grid-cols-2">
              {CAPACITY_METRICS.map((m, i) => (
                <MetricSnapshotChart
                  key={m.key}
                  label={metricLabel(m, language)}
                  ariaLabel={t.ariaByNation(metricLabel(m, language))}
                  rows={capacity[m.key]}
                  nationsMissing={[]}
                  emptyNote={t.dataNotAvailable}
                  format={m.format}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  index={i}
                  caveat={metricCaveat(m, language)}
                  figure={{ key: 'capacity-stations', source: m.source }}
                />
              ))}
              <MetricSnapshotChart
                label={t.yearsReported}
                figure={{ key: 'capacity-completeness' }}
                ariaLabel={t.yearsReportedAria}
                rows={completeness}
                nationsMissing={[]}
                emptyNote={t.dataNotAvailable}
                format={completenessFormat}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                index={CAPACITY_METRICS.length}
                caveat={t.completenessCaveat(completenessMax, DATA_YEAR_MAX)}
              />
            </div>
          </div>
        )}

        {context && (
          <div>
            <h3 className="type-subhead mb-1 text-accent">{t.changingHeading}</h3>
            <div className="prose-column prose-wide mb-4 space-y-3 text-sm opacity-80">
              <p>{t.changingP1}</p>
              <p>{t.changingP2}</p>
            </div>
            <div className="section-bleed grid grid-cols-1 gap-5 sm:grid-cols-2">
              {CONTEXT_METRICS.map((m, i) => (
                <TrendChart
                  key={m.key}
                  label={metricLabel(m, language)}
                  allRows={context[m.key]}
                  nations={NATION_NAMES}
                  valueField={m.field}
                  chartType={m.chartType}
                  format={m.format}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  index={i}
                  legend
                  caveat={metricCaveat(m, language)}
                  figure={{ key: CONTEXT_FIGURES[m.key], source: m.source }}
                  className={
                    i === CONTEXT_METRICS.length - 1 && CONTEXT_METRICS.length % 2 !== 0
                      ? 'sm:col-span-2'
                      : ''
                  }
                />
              ))}
            </div>
          </div>
        )}

        <Tooltip tooltip={tooltip} />
      </div>
    </Section>
  )
}
