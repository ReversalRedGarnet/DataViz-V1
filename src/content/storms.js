// The storm roster, and the rule that produced it.
//
// THE RULE: a severe tropical cyclone that made landfall or had major impact in
// two or more of the four in-scope nations, between 2015 and 2024.
//
// Applied evenly, which is the whole point. A roster picked for the story it
// tells is not evidence of anything; a roster picked by a stated rule can be
// checked by a reader who disagrees with it. That is why EXCLUDED below is
// rendered on the page rather than kept in a comment -- the storms the rule
// throws out are what make the ones it keeps mean something.
//
// Each entry:
//   id -- stable key, also the value held in selection state
//   name / year -- display
//   label -- short form for the timeline
//   nations -- the in-scope nations this storm actually struck. Drives which
//     lines stay at full strength in the chain; the other nations are still
//     drawn, dimmed, because a country the storm missed is the closest thing
//     this data has to a control.
//   note -- optional, printed under the storm's name where the entry needs a
//     qualification the reader would otherwise have to take on trust
//   profile -- per-nation storm facts, hand-researched from BOM cyclone
//     histories and UN OCHA situation reports. Null until researched. A storm
//     without a profile still gets a full ripple chain; it just doesn't get the
//     journey and category-versus-deaths sections, which have nothing to draw.
//   sources -- the two supplementary citations for that storm's profile
export const STORMS = [
  {
    id: 'pam',
    name: 'Cyclone Pam',
    year: 2015,
    label: 'Pam',
    nations: ['Vanuatu', 'Solomon Islands'],
    profile: null,
    sources: [],
  },
  {
    id: 'winston',
    name: 'Cyclone Winston',
    year: 2016,
    label: 'Winston',
    nations: ['Fiji', 'Tonga'],
    profile: null,
    sources: [],
  },
  {
    id: 'gita',
    name: 'Cyclone Gita',
    year: 2018,
    label: 'Gita',
    nations: ['Tonga', 'Fiji'],
    profile: null,
    sources: [],
  },
  {
    id: 'harold',
    name: 'Cyclone Harold',
    year: 2020,
    label: 'Harold',
    nations: ['Solomon Islands', 'Vanuatu', 'Fiji', 'Tonga'],
    // Listed in the order the storm reached them, which is the order the
    // journey section walks through.
    profile: [
      {
        name: 'Solomon Islands',
        date: '3 April 2020',
        category: 1,
        categoryLabel: 'Tropical low / Category 1 at time of impact',
        deaths: 27,
        dodge: 0,
        fact: "The passenger ferry MV Taimareho was overwhelmed by Harold's swell in Ironbottom Sound, Malaita Province -- the deadliest single event of the whole cyclone, at its weakest documented phase.",
        lead: 'The deadliest day came first, at the storm\u2019s weakest.',
      },
      {
        name: 'Vanuatu',
        date: '6 April 2020',
        category: 5,
        categoryLabel: 'Category 5 (landfall, Espiritu Santo)',
        deaths: 2,
        dodge: 0,
        fact: '230 km/h sustained winds, gusts to 325 km/h -- the strongest storm to hit Vanuatu since Cyclone Pam in 2015. Up to 90% of homes lost in the worst-hit areas.',
        lead: 'Four days later, the same system made landfall at full strength.',
      },
      {
        name: 'Fiji',
        date: '8 April 2020',
        category: 4,
        categoryLabel: 'Category 4 (landfall, Kadavu)',
        deaths: 1,
        dodge: -0.35,
        fact: '1,919 buildings damaged; 103mm of rain recorded at Sigatoka in a single day.',
        lead: 'Still a severe storm, over a country with more to absorb it.',
      },
      {
        name: 'Tonga',
        date: '9 April 2020',
        category: 4,
        categoryLabel: 'Category 4 (passed offshore, no landfall)',
        deaths: 0,
        dodge: 0.35,
        fact: '428 homes damaged or destroyed by flooding and storm surge, without a direct hit.',
        lead: 'A near miss, and the shortest recovery of the four.',
      },
    ],
    sources: [
      {
        label:
          'Severe Tropical Cyclone Harold \u2014 official cyclone history, Australian Bureau of Meteorology',
        url: 'http://www.bom.gov.au/cyclone/history/Harold.shtml',
      },
      {
        label: 'Tropical Cyclone Harold \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
        url: 'https://reliefweb.int/disaster/tc-2020-000049-vut',
      },
    ],
  },
  {
    id: 'judy-kevin',
    name: 'Cyclones Judy & Kevin',
    year: 2023,
    label: 'Judy & Kevin',
    nations: ['Vanuatu', 'Solomon Islands', 'Fiji'],
    note: 'Two named cyclones, counted here as one event: they struck Vanuatu days apart in March 2023, and much of the official reporting covers the pair together rather than each storm separately.',
    profile: null,
    sources: [],
  },
  {
    id: 'lola',
    name: 'Cyclone Lola',
    year: 2023,
    label: 'Lola',
    nations: ['Vanuatu', 'Solomon Islands'],
    profile: null,
    sources: [],
  },
]

// Storms the rule throws out. Shown on the page, because a roster is only
// defensible if the near-misses are visible: a reader who suspects the list was
// picked to suit the argument can check these and see that at least one
// exclusion cost the argument something.
export const EXCLUDED = [
  {
    name: 'Cyclone Yasa',
    year: 2020,
    reason: 'Severe, but within these four nations it struck Fiji alone.',
    cost: 'Excluding it weakens the case: a second severe cyclone in 2020 would have made that year look far worse. The rule is applied anyway, or it is not a rule.',
  },
  {
    name: 'Cyclone Ana',
    year: 2021,
    reason: 'Fiji only.',
  },
  {
    name: 'Cyclone Cody',
    year: 2022,
    reason: 'Fiji only.',
  },
  {
    name: 'Cyclone Rae',
    year: 2022,
    reason: 'Did not reach severe intensity, and caused no reported deaths.',
  },
]

// Per-nation strike counts, computed rather than written down, so the headline
// figure and the roster cannot drift apart. This is the site's opening claim
// and the most checkable thing on the page: plain event-counting against a
// stated rule, with no trend or attribution asserted.
export function strikeCounts(nations) {
  return nations.map((nation) => ({
    nation,
    count: STORMS.filter((s) => s.nations.includes(nation)).length,
  }))
}

export const ROSTER_START = 2015
export const ROSTER_END = 2024

export function stormById(id) {
  return STORMS.find((s) => s.id === id) ?? null
}
