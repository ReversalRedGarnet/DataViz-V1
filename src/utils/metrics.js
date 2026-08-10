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
// The three groups below are an argument, not a filing convenience.
//
// CHAIN metrics are consequences of a disaster, and they are the patchy ones.
// Consequence data depends on a country having the capacity to assess and
// report after being hit -- which is exactly the capacity a disaster destroys,
// and exactly what the least-resourced countries have least of. CAPACITY and
// CONTEXT metrics are complete because they are structural or
// satellite-derived and need nobody to file a return. That asymmetry is not an
// inconvenience in the data; it is one of the things the data says.

// The ripple chain: who was hit, then the harvest, the herds, the power supply
// and the visitors that follow. A sequence of plausible links, not a measured
// causal path.
export const CHAIN_METRICS = [
  {
    key: 'affected_persons',
    file: 'disaster_affected_persons.json',
    field: 'affected_persons',
    label: 'People affected',
    chartType: 'bar',
    format: (v) => `${Math.round(v).toLocaleString()} people`,
    caveat:
      'Annual, all-hazard national totals -- not one storm alone. A year holding two cyclones reports them as a single figure. Years where the official figure was exactly zero are shown as missing rather than as zero, because this series cannot distinguish "nobody affected" from "nothing reported" -- Vanuatu\u2019s figure for 2015, the year Cyclone Pam struck, is zero. Gaps here are reporting gaps, and they fall most often on the countries least able to report.',
  },
  {
    key: 'crop_yield',
    file: 'crop_yield.json',
    field: 'crop_yield_index',
    label: 'Crop yield (kg/ha)',
    chartType: 'line',
    format: (v) => `${v.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg/ha`,
    caveat:
      'A national aggregate across all crops. Year-to-year movement carries drought, planting decisions and market conditions as well as storm damage.',
  },
  {
    key: 'livestock_yield',
    file: 'livestock_yield.json',
    field: 'livestock_yield_kg',
    label: 'Livestock yield (kg/animal)',
    chartType: 'line',
    format: (v) => `${v.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg/animal`,
    caveat:
      'Output per animal, not herd size, so a year that kills stock can leave this figure flat or even raise it. Sits beside crop yield rather than replacing it: the two move for different reasons, and a food system losing one but not the other is a different situation from losing both.',
  },
  {
    key: 'power_generation',
    file: 'power_generation.json',
    field: 'power_generation_index',
    label: 'Power generation (GWh)',
    chartType: 'line',
    format: (v) => `${v.toLocaleString(undefined, { maximumFractionDigits: 1 })} GWh`,
    caveat:
      'National generation follows economy-wide demand. The 2020\u201321 dip sits on top of pandemic restrictions, not only storm damage to the network.',
  },
  {
    key: 'tourist_arrivals',
    file: 'tourist_arrivals.json',
    field: 'tourist_arrivals_index',
    label: 'Tourist arrivals',
    chartType: 'area',
    format: (v) => `${Math.round(v).toLocaleString()} visitors`,
    caveat:
      'Pacific borders closed to visitors in March 2020, a month before Cyclone Harold. The collapse in this series is overwhelmingly COVID-19, and no part of it can be separated out as any cyclone\u2019s. Solomon Islands is absent entirely, and Vanuatu and Tonga stop reporting after 2022.',
  },
]

// Who can observe their own weather. One indicator, and the reason it earns a
// section of its own is that it explains the gaps in everything above it.
export const CAPACITY_METRICS = [
  {
    key: 'meteo_stations',
    file: 'meteo_stations.json',
    field: 'stations',
    label: 'Meteorological monitoring stations',
    chartType: 'bar',
    format: (v) => `${Math.round(v)} stations`,
    caveat:
      'Unchanged in every year on record, which is the point: this is a standing difference in observing capacity, not a trend. Counts national network stations only and says nothing about their age, condition or staffing.',
  },
]

// What is changing underneath all of it. Trends, never per-storm evidence.
export const CONTEXT_METRICS = [
  {
    key: 'sst_anomaly',
    file: 'sst_anomaly.json',
    field: 'sst_anomaly_c',
    label: 'Sea surface temperature anomaly (°C)',
    chartType: 'line',
    format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} °C`,
    caveat:
      'A trend, and only a trend. Warmer seas raise the ceiling on how intense a cyclone can become -- IPCC AR6 finds it likely the global proportion of Category 3\u20135 storms has risen over the past four decades. They do not explain any individual storm, and this series makes that plain: the 2015 anomaly is negative in three of these four nations, and 2015 is the year of Cyclone Pam.',
  },
  {
    key: 'ghg_per_capita',
    file: 'ghg_per_capita.json',
    field: 'ghg_tonnes_per_capita',
    label: 'Greenhouse gas emissions per person (t)',
    chartType: 'line',
    format: (v) => `${v.toFixed(1)} t per person`,
    caveat:
      'The one figure here about responsibility rather than exposure. Read it without overstating it: Solomon Islands is genuinely low at around 0.8 t, but Fiji and Tonga sit near 3 t, which is not negligible against many countries. No global-average line is drawn on this chart, and that is a deliberate omission rather than an oversight -- the source gives the unit only as "tonnes", without saying whether it counts carbon dioxide alone or all greenhouse gases as CO2-equivalent, and without saying whether land use is included. A comparator built on a different accounting basis would look like a fair comparison and would not be one.',
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
    field: 'economic_loss_usd',
    label: 'Economic loss (US$)',
    chartType: 'bar',
    format: (v) => `US$${Math.round(v).toLocaleString()}`,
    caveat:
      'Reported for only ten country-years across this whole period. Solomon Islands has a single figure, and 2020 is reported for Fiji only, so this record is mostly absent rather than mostly zero.',
  },
]

// Everything the page loads. Order is irrelevant here; it only drives fetches.
export const METRICS = [
  ...CHAIN_METRICS,
  ...CAPACITY_METRICS,
  ...CONTEXT_METRICS,
  ...FOOTNOTE_METRICS,
]
