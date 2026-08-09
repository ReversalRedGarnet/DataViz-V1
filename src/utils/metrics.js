// Cyclone Harold, April 2020: the before/after anchor for this page.
export const EVENT_YEAR = 2020

// Filenames match data-pipeline/clean_data.py's DATASETS dict.
//
// chartType: 'bar' where the year range has gaps, since a line would imply a
// trend across years never measured; 'line' for continuous data; 'area' where
// the drop in volume is itself the point.
//
// caveat: what this series cannot be read as. Printed under the chart rather
// than kept in a methodology note at the bottom of the page, because the
// misreading each one guards against happens at the moment the chart is
// looked at. Every one of these is about attribution: none of these series
// isolates Cyclone Harold, and the chain they form is a sequence of plausible
// links, not a measured causal path.
export const METRICS = [
  {
    key: 'affected_persons',
    file: 'disaster_affected_persons.json',
    field: 'affected_persons',
    label: 'People affected',
    chartType: 'bar',
    format: (v) => `${Math.round(v).toLocaleString()} people`,
    caveat:
      'Annual, all-hazard national totals -- not Harold alone. Fiji was also struck by Severe Tropical Cyclone Yasa in December 2020, and that is inside the same year\u2019s figure.',
  },
  {
    key: 'economic_loss',
    file: 'disaster_economic_loss.json',
    field: 'economic_loss_usd',
    label: 'Economic loss (US$)',
    chartType: 'bar',
    format: (v) => `US$${Math.round(v).toLocaleString()}`,
    caveat:
      'Reported for only seven country-years across this whole period. Solomon Islands has no figure at all, and 2020 is reported for Fiji only, so this link in the chain is mostly absent rather than mostly zero.',
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
    key: 'tourist_arrivals',
    file: 'tourist_arrivals.json',
    field: 'tourist_arrivals_index',
    label: 'Tourist arrivals',
    chartType: 'area',
    format: (v) => `${Math.round(v).toLocaleString()} visitors`,
    caveat:
      'Pacific borders closed to visitors in March 2020, a month before Harold. The collapse in this series is overwhelmingly COVID-19, and no part of it can be separated out as the cyclone\u2019s.',
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
]
