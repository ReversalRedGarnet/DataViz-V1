// The before/after anchor is no longer a constant: it is a property of
// whichever storm the reader has selected (see src/content/storms.js). The old
// module-level EVENT_YEAR is gone deliberately rather than left as a default,
// because a default would silently anchor a 2015 storm's charts to 2020 and
// nothing would look wrong.

// Filenames match data-pipeline/clean_data.py's DATASETS dict.
//
// chartType: 'bar' where the year range has gaps, since a line would imply a
// trend across years never measured; 'line' for continuous data; 'area' where
// the drop in volume is itself the point.
//
// caveat: what this series cannot be read as. Printed under the chart rather
// than kept in a methodology note at the bottom of the page, because the
// misreading each one guards against happens at the moment the chart is
// looked at.
//
// source: { label, url } -- the FILTERED Pacific Data Hub query this series was
// exported from, printed under the chart by components/FigureCaption.jsx and
// collected into the sources slide by App.jsx. It lives here rather than in
// App.jsx because it is a property of the metric, and because App.jsx used to
// keep its own hand-written list of exactly these URLs -- two places to type
// one value, with no way for a search to catch a drift between them. App.jsx
// now derives its list from this one. `source.label` is { en, fr }, resolved
// through sourceLabel() below -- "Pacific Data Hub (SPC)" itself stays as
// given in both, since that's the platform's own name rather than a
// description of it.
//
// FOUR METRICS HAVE NO source AND THAT IS A REAL GAP, not a design decision:
// livestock_yield, meteo_stations, sst_anomaly and ghg_per_capita were charted
// and caveated but their query URLs were never recorded anywhere in this
// repository. A caption without a source renders as the figure number and the
// title alone, which is honest, and a fabricated link would not be. Paste the
// four filtered .Stat Explorer URLs in as `source` and the captions and the
// sources slide both pick them up with no other change.
//
// population's URL is the portal root rather than a filtered query, which is
// what App.jsx already carried. It is a denominator rather than a charted
// series, so it appears in the sources slide and in no caption.
//
// The three groups below are an argument, not a filing convenience.
//
// CHAIN metrics are consequences of a disaster, and they are the patchy ones.
// Consequence data depends on a country having the capacity to assess and
// report after being hit -- which is exactly the capacity a disaster destroys,
// and exactly what the least-resourced countries have least of. CAPACITY and
// CONTEXT metrics are complete because they are structural or
// satellite-derived and need nobody to file a return. That asymmetry is not an
// inconvenience in the data; it is one of the things the data says.
//
// TRANSLATION-ERA CHANGE: `label`, `caveat` and `source.label` are { en, fr }
// objects rather than plain strings -- call metricLabel(m, language),
// metricCaveat(m, language) and sourceLabel(m.source, language) below rather
// than reading .label/.caveat/.source.label directly. `format` now also takes
// a language argument for its unit word and its number formatting (comma vs.
// period decimal, space vs. comma thousands separator) -- call sites default
// to 'en' when they don't have a language in scope, so nothing older breaks.

// The ripple chain: who was hit, then the harvest, the herds, the power supply
// and the visitors that follow. A sequence of plausible links, not a measured
// causal path.
export const CHAIN_METRICS = [
  {
    key: 'affected_persons',
    file: 'disaster_affected_persons.json',
    source: {
      label: {
        en: 'Directly affected persons attributed to disasters \u2014 Pacific Data Hub (SPC)',
        fr: 'Personnes directement touchées attribuées aux catastrophes \u2014 Pacific Data Hub (SPC)',
      },
      url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=ds%3ASPC2&df[id]=DF_SDG_11&df[ag]=SPC&df[vs]=3.0&dq=A.VC_DSR_AFFCT.........&pd=,&to[TIME_PERIOD]=false&lb=bt',
    },
    field: 'affected_persons',
    label: { en: 'People affected', fr: 'Personnes touchées' },
    chartType: 'bar',
    format: (v, language = 'en') =>
      language === 'fr'
        ? `${Math.round(v).toLocaleString('fr')} personnes`
        : `${Math.round(v).toLocaleString('en')} people`,
    caveat: {
      en: 'Annual, all-hazard national totals -- not one storm alone. A year holding two cyclones reports them as a single figure. Years where the official figure was exactly zero are shown as missing rather than as zero, because this series cannot distinguish "nobody affected" from "nothing reported" -- Vanuatu\u2019s figure for 2015, the year Cyclone Pam struck, is zero. Gaps here are reporting gaps, and they fall most often on the countries least able to report.',
      fr: 'Totaux nationaux annuels, tous risques confondus \u2014 pas un seul cyclone. Une année comportant deux cyclones les déclare comme un chiffre unique. Les années où le chiffre officiel était exactement zéro sont affichées comme manquantes plutôt que comme zéro, car cette série ne peut pas distinguer « personne touché » de « rien déclaré » \u2014 le chiffre de Vanuatu pour 2015, l\u2019année du cyclone Pam, est zéro. Les lacunes ici sont des lacunes de déclaration, et elles touchent le plus souvent les pays les moins en mesure de déclarer.',
    },
  },
  {
    key: 'crop_yield',
    file: 'crop_yield.json',
    source: {
      label: {
        en: 'Crop yield \u2014 Pacific Data Hub (SPC)',
        fr: 'Rendement des cultures \u2014 Pacific Data Hub (SPC)',
      },
      url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.CROP_YIELD.&pd=,&to[TIME_PERIOD]=false',
    },
    field: 'crop_yield_index',
    label: { en: 'Crop yield (kg/ha)', fr: 'Rendement des cultures (kg/ha)' },
    chartType: 'line',
    format: (v, language = 'en') =>
      `${v.toLocaleString(language === 'fr' ? 'fr' : 'en', { maximumFractionDigits: 1 })} kg/ha`,
    caveat: {
      en: 'A national aggregate across all crops. Year-to-year movement carries drought, planting decisions and market conditions as well as storm damage.',
      fr: 'Un agrégat national toutes cultures confondues. Les variations d\u2019une année à l\u2019autre reflètent la sécheresse, les décisions de plantation et les conditions de marché autant que les dégâts causés par les cyclones.',
    },
  },
  {
    key: 'livestock_yield',
    file: 'livestock_yield.json',
    field: 'livestock_yield_kg',
    label: { en: 'Livestock yield (kg/animal)', fr: 'Rendement de l\u2019élevage (kg/animal)' },
    chartType: 'line',
    format: (v, language = 'en') =>
      `${v.toLocaleString(language === 'fr' ? 'fr' : 'en', { maximumFractionDigits: 0 })} kg/animal`,
    caveat: {
      en: 'Output per animal, not herd size \u2014 a year that kills stock can still show flat or rising yield. Moves independently of crop yield, so losing one doesn\u2019t mean losing both.',
      fr: 'Le rendement par animal, pas la taille du cheptel \u2014 une année qui décime le cheptel peut malgré tout afficher un rendement stable ou en hausse. Évolue indépendamment du rendement des cultures\u00A0: perdre l\u2019un ne signifie pas perdre les deux.',
    },
  },
  {
    key: 'power_generation',
    file: 'power_generation.json',
    source: {
      label: {
        en: 'Power generation \u2014 Pacific Data Hub (SPC)',
        fr: 'Électricité produite \u2014 Pacific Data Hub (SPC)',
      },
      url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.POWER_GEN.&pd=,&to[TIME_PERIOD]=false',
    },
    field: 'power_generation_index',
    label: { en: 'Power generation (GWh)', fr: 'Production électrique (GWh)' },
    chartType: 'line',
    format: (v, language = 'en') =>
      `${v.toLocaleString(language === 'fr' ? 'fr' : 'en', { maximumFractionDigits: 1 })} GWh`,
    caveat: {
      en: 'National generation follows economy-wide demand. The 2020\u201321 dip sits on top of pandemic restrictions, not only storm damage to the network.',
      fr: 'La production nationale suit la demande de l\u2019ensemble de l\u2019économie. Le creux de 2020\u20132021 s\u2019explique aussi par les restrictions liées à la pandémie, pas seulement par les dégâts causés au réseau par les cyclones.',
    },
  },
  {
    key: 'tourist_arrivals',
    file: 'tourist_arrivals.json',
    source: {
      label: {
        en: 'Tourist arrivals \u2014 Pacific Data Hub (SPC)',
        fr: 'Arrivées touristiques \u2014 Pacific Data Hub (SPC)',
      },
      url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.TRSM_ARR.&pd=,&to[TIME_PERIOD]=false',
    },
    field: 'tourist_arrivals_index',
    label: { en: 'Tourist arrivals', fr: 'Arrivées touristiques' },
    chartType: 'area',
    format: (v, language = 'en') =>
      language === 'fr'
        ? `${Math.round(v).toLocaleString('fr')} visiteurs`
        : `${Math.round(v).toLocaleString('en')} visitors`,
    caveat: {
      en: 'Pacific borders closed to visitors in March 2020, a month before Cyclone Harold. The collapse in this series is overwhelmingly COVID-19, and no part of it can be separated out as any cyclone\u2019s. Solomon Islands is absent entirely, and Vanuatu and Tonga stop reporting after 2022.',
      fr: 'Les frontières du Pacifique se sont fermées aux visiteurs en mars 2020, un mois avant le cyclone Harold. L\u2019effondrement de cette série est très majoritairement dû à la COVID-19, et aucune part ne peut en être isolée comme relevant d\u2019un cyclone. Les Îles Salomon en sont totalement absentes, et Vanuatu et Tonga cessent de déclarer après 2022.',
    },
  },
]

// Who can observe their own weather. One indicator, and the reason it earns a
// section of its own is that it explains the gaps in everything above it.
export const CAPACITY_METRICS = [
  {
    key: 'meteo_stations',
    file: 'meteo_stations.json',
    field: 'stations',
    label: { en: 'Meteorological monitoring stations', fr: 'Stations de surveillance météorologique' },
    chartType: 'bar',
    format: (v) => `${Math.round(v)} stations`,
    caveat: {
      en: 'Unchanged in every year on record, which is the point: this is a standing difference in observing capacity, not a trend. Counts national network stations only and says nothing about their age, condition or staffing.',
      fr: 'Inchangé pour chaque année sur la période, ce qui est précisément le propos\u00A0: il s\u2019agit d\u2019une différence permanente de capacité d\u2019observation, pas d\u2019une tendance. Ne compte que les stations du réseau national, sans rien dire de leur âge, de leur état ou de leur personnel.',
    },
  },
]

// What is changing underneath all of it. Trends, never per-storm evidence.
export const CONTEXT_METRICS = [
  {
    key: 'sst_anomaly',
    file: 'sst_anomaly.json',
    field: 'sst_anomaly_c',
    label: { en: 'Sea surface temperature anomaly (°C)', fr: 'Anomalie de température de surface de la mer (°C)' },
    chartType: 'line',
    format: (v, language = 'en') => {
      const n = v.toLocaleString(language === 'fr' ? 'fr' : 'en', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
      return `${v > 0 ? '+' : ''}${n} °C`
    },
    caveat: {
      en: 'A trend, and only a trend. Warmer seas raise the ceiling on how intense a cyclone can become -- IPCC AR6 finds it likely the global proportion of Category 3\u20135 storms has risen over the past four decades. They do not explain any individual storm, and this series makes that plain: the 2015 anomaly is negative in three of these four nations, and 2015 is the year of Cyclone Pam.',
      fr: 'Une tendance, et seulement une tendance. Des mers plus chaudes relèvent le plafond d\u2019intensité qu\u2019un cyclone peut atteindre \u2014 le rapport GIEC AR6 juge probable que la proportion mondiale de cyclones de catégorie 3 à 5 ait augmenté au cours des quatre dernières décennies. Elles n\u2019expliquent aucun cyclone pris individuellement, et cette série le montre clairement\u00A0: l\u2019anomalie de 2015 est négative dans trois de ces quatre nations, et 2015 est l\u2019année du cyclone Pam.',
    },
  },
  {
    key: 'ghg_per_capita',
    file: 'ghg_per_capita.json',
    field: 'ghg_tonnes_per_capita',
    label: { en: 'Greenhouse gas emissions per person (t)', fr: 'Émissions de gaz à effet de serre par habitant (t)' },
    chartType: 'line',
    format: (v, language = 'en') => {
      const n = v.toLocaleString(language === 'fr' ? 'fr' : 'en', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
      return language === 'fr' ? `${n} t par personne` : `${n} t per person`
    },
    caveat: {
      en: 'The one figure here about responsibility rather than exposure. Read it without overstating it: Solomon Islands is genuinely low at around 0.8 t, but Fiji and Tonga sit near 3 t, which is not negligible against many countries. No global-average line is drawn on this chart, and that is a deliberate omission rather than an oversight -- the source gives the unit only as "tonnes", without saying whether it counts carbon dioxide alone or all greenhouse gases as CO2-equivalent, and without saying whether land use is included. A comparator built on a different accounting basis would look like a fair comparison and would not be one.',
      fr: 'Le seul chiffre ici qui porte sur la responsabilité plutôt que sur l\u2019exposition. À lire sans le surinterpréter\u00A0: les Îles Salomon sont réellement basses, autour de 0,8\u00A0t, mais Fidji et Tonga se situent près de 3\u00A0t, ce qui n\u2019est pas négligeable face à beaucoup de pays. Aucune ligne de moyenne mondiale n\u2019est tracée sur ce graphique, et c\u2019est une omission délibérée plutôt qu\u2019un oubli \u2014 la source ne donne l\u2019unité que comme « tonnes », sans préciser s\u2019il s\u2019agit uniquement de dioxyde de carbone ou de l\u2019ensemble des gaz à effet de serre en équivalent CO2, ni si l\u2019usage des sols est inclus. Un comparateur construit sur une base comptable différente aurait l\u2019apparence d\u2019une comparaison équitable sans en être une.',
    },
  },
]

// Reported for only ten country-years in twelve, across four nations. Too
// sparse to hold a link in the chain -- a chart of it would be mostly empty
// space -- but the sparseness is itself worth stating, so it survives as a
// figure in the overview rather than being dropped.
export const FOOTNOTE_METRICS = [
  {
    key: 'economic_loss',
    file: 'disaster_economic_loss.json',
    source: {
      label: {
        en: 'Direct disaster economic loss \u2014 Pacific Data Hub (SPC)',
        fr: 'Pertes économiques directes des catastrophes \u2014 Pacific Data Hub (SPC)',
      },
      url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=ds%3ASPC2&df[id]=DF_SDG_11&df[ag]=SPC&df[vs]=3.0&dq=A.VC_DSR_AALT...._T.....&pd=,&to[TIME_PERIOD]=false',
    },
    field: 'economic_loss_usd',
    label: { en: 'Economic loss (US$)', fr: 'Pertes économiques (US$)' },
    chartType: 'bar',
    format: (v, language = 'en') =>
      `US$${Math.round(v).toLocaleString(language === 'fr' ? 'fr' : 'en')}`,
    caveat: {
      en: 'Reported for only ten country-years across this whole period. Solomon Islands has a single figure, and 2020 is reported for Fiji only, so this record is mostly absent rather than mostly zero.',
      fr: 'Déclarées pour seulement dix années-pays sur toute la période. Les Îles Salomon n\u2019ont qu\u2019un seul chiffre, et 2020 n\u2019est déclaré que pour Fidji\u00A0: ces données sont donc surtout absentes plutôt que surtout nulles.',
    },
  },
]

// Not a metric in any of the three groups above, and deliberately not a member
// of CHAIN_METRICS: nothing charts population on its own, and adding it there
// would put a fifth bar in the regional snapshot saying only that Fiji is the
// biggest country. It exists as a denominator.
//
// The reason it earns a place at all is that raw counts flatten exactly the
// thing this site is about. In 2020 Vanuatu reported roughly 246,800 people
// affected and Fiji roughly 235,900 -- as two bars those read as the same
// event. Against their populations they are 83% and 26%, which is a different
// story about the same year. See shareOfPopulationRows in utils/rows.js.
const POPULATION_METRIC = {
  key: 'population',
  file: 'population.json',
  source: {
    label: {
    en: 'Mid-year population estimates \u2014 Pacific Data Hub (SPC)',
    fr: 'Estimations de population en milieu d’année \u2014 Pacific Data Hub (SPC)',
  },
    url: 'https://stats.pacificdata.org/',
  },
  field: 'population',
  label: { en: 'Population', fr: 'Population' },
  // The page is complete without it: losing this file costs the share-of-
  // population view and nothing else, so it must not be able to blank the
  // site the way a missing chain metric legitimately does. See useMetricData.
  optional: true,
}

// Everything the page loads. Order is irrelevant here; it only drives fetches.
export const METRICS = [
  ...CHAIN_METRICS,
  ...CAPACITY_METRICS,
  ...CONTEXT_METRICS,
  ...FOOTNOTE_METRICS,
  POPULATION_METRIC,
]

// The two resolvers every call site should use instead of reading .label /
// .caveat directly. Falls back to English so a metric added without its
// French half yet still renders something instead of undefined.
export function metricLabel(metric, language = 'en') {
  if (!metric?.label) return ''
  return metric.label[language] ?? metric.label.en
}

export function metricCaveat(metric, language = 'en') {
  if (!metric?.caveat) return undefined
  return metric.caveat[language] ?? metric.caveat.en
}

// Same convention for a { label: { en, fr }, url } source object -- used by
// FigureCaption.jsx and CitationPanel.jsx (the latter via App.jsx's
// DATA_SOURCES, which also spreads in each storm's own sources -- see
// localizeSource() in content/storms.js for that half).
export function sourceLabel(source, language = 'en') {
  if (!source?.label) return ''
  if (typeof source.label === 'string') return source.label
  return source.label[language] ?? source.label.en
}
