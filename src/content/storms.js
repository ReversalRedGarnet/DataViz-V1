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
    // Strike order: Pam formed east of the Solomon Islands and reached them two
    // days before Vanuatu.
    nations: ['Solomon Islands', 'Vanuatu'],
    profile: [
      {
        name: 'Solomon Islands',
        date: '10\u201311 March 2015',
        category: 1,
        categoryLabel: 'Category 1 while intensifying; passed offshore, no landfall',
        deaths: null,
        deathsNote:
          'IFRC, OCHA and government response documents record affected populations and damage for Solomon Islands but publish no separate fatality figure. Not zero \u2014 never reported.',
        dodge: 0,
        fact: "Storm surge, swells and heavy rain struck Temotu and Malaita provinces while Pam was still intensifying offshore. 83 of 260 houses were damaged across Temotu's outer islands; more than half of garden crops were lost, and NDMO assessments found 2,344 families \u2014 11,780 people \u2014 needing support across 19 wards of Malaita.",
        lead: 'Two days before it reached Vanuatu, Pam was already flooding coastlines it never made landfall on.',
      },
      {
        name: 'Vanuatu',
        date: '13 March 2015',
        category: 5,
        categoryLabel: 'Category 5 (landfall, Shefa and Tafea Provinces)',
        deaths: 11,
        dodge: 0,
        fact: "Sustained winds of 250 km/h with gusts to 320 km/h. The government's Post-Disaster Needs Assessment confirmed 11 fatalities in Tafea and Shefa, roughly 17,000 buildings damaged or destroyed, 65,000 people displaced, and total effects of US$449 million \u2014 equal to 64% of Vanuatu's GDP.",
        lead: 'Then it reached full strength over the country it is still remembered for.',
      },
    ],
    sources: [
      {
        label: 'Tropical Cyclone Pam \u2014 Post-Disaster Needs Assessment, Government of Vanuatu',
        url: 'https://reliefweb.int/report/vanuatu/post-disaster-needs-assessment-tropical-cyclone-pam-march-2015',
      },
      {
        label: 'Tropical Cyclone Pam \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
        url: 'https://reliefweb.int/disaster/tc-2015-000020-vut',
      },
    ],
  },
  {
    id: 'winston',
    name: 'Cyclone Winston',
    year: 2016,
    label: 'Winston',
    // Strike order: Winston passed Tonga on 16 February, four days before its
    // Fiji landfall.
    nations: ['Tonga', 'Fiji'],
    profile: [
      {
        name: 'Tonga',
        date: '16 February 2016',
        category: 1,
        // The two figures in this label are both true of different moments, and
        // the number above is the national met service's own. This is exactly
        // the case categoryLabel exists for.
        categoryLabel:
          "Category 1 at closest approach to Vava'u (no landfall); returned as a Category 4 passing north of Vava'u on 19 February",
        deaths: 0,
        dodge: 0,
        fact: "Ten houses destroyed and about 200 damaged in Vava'u, with over 80% of homes sustaining some rain damage and flash flooding forcing nine patients to be moved inside Prince Ngu hospital. Deputy Prime Minister Siaosi Sovaleni told Parliament no lives were lost anywhere in Tonga.",
        lead: 'Tonga met Winston twice and lost no one, four days before Fiji lost 44.',
      },
      {
        name: 'Fiji',
        date: '20 February 2016',
        category: 5,
        categoryLabel: 'Category 5 (landfall, Koro Island then Viti Levu)',
        deaths: 44,
        dodge: 0,
        fact: "Average winds of 233 km/h with gusts to 306 km/h \u2014 the strongest landfalling cyclone in Fiji's records and the most intense on record in the Southern Hemisphere. 540,400 people affected, 62% of the population, over 30,000 buildings damaged or destroyed, and 88 of 214 health facilities damaged.",
        lead: "Fiji's deadliest storm on record, and the only stop on this roster where the death toll matches the category.",
      },
    ],
    sources: [
      {
        label: 'Tropical Cyclone Winston \u2014 Post-Disaster Needs Assessment, Government of Fiji',
        url: 'https://reliefweb.int/report/fiji/fiji-post-disaster-needs-assessment-may-2016-tropical-cyclone-winston-february-20-2016',
      },
      {
        label: 'Tropical cyclone record, Tonga Meteorological Service',
        url: 'https://www.met.gov.to/index_files/TC_list_update.pdf',
      },
    ],
  },
  {
    id: 'gita',
    name: 'Cyclone Gita',
    year: 2018,
    label: 'Gita',
    nations: ['Tonga', 'Fiji'],
    profile: [
      {
        name: 'Tonga',
        date: '12 February 2018',
        category: 4,
        categoryLabel: "Category 4 (landfall, Tongatapu and 'Eua)",
        // Reported as 1 in the first OCHA/ECHO flashes and settled at 2 in later
        // reporting; the final figure is used.
        deaths: 2,
        dodge: -0.35,
        fact: "Average winds of 130 km/h crossing Tongatapu and 'Eua \u2014 the strongest cyclone to hit those islands since Isaac in 1982. The 100-year-old Parliament House was flattened. NEMO recorded 4,708 houses damaged or destroyed and about 4,500 people in evacuation centres; damage reached US$164 million, 37.8% of GDP.",
        lead: 'The strongest storm to cross Tongatapu in 36 years killed two people.',
      },
      {
        name: 'Fiji',
        date: '13 February 2018',
        category: 4,
        categoryLabel:
          'Category 4 passing the southern Lau group; peaked at Category 5 about 205 km south of Kadavu \u2014 no landfall',
        deaths: 0,
        dodge: 0.35,
        fact: '1,579 people affected in the southern Lau group, with Ono-i-Lau and Vatoa worst hit \u2014 three homes destroyed, gusts to 190 km/h, no injuries reported. The entire population of Ono-i-Lau, about 470 people, had been moved into evacuation centres before the storm arrived.',
        lead: 'A stronger storm than the one that hit Tonga, and nobody was hurt, because everyone had already moved.',
      },
    ],
    sources: [
      {
        label:
          'Tropical Cyclone Gita \u2014 Post-Disaster Rapid Assessment, Government of Tonga / World Bank',
        url: 'https://www.gfdrr.org/sites/default/files/publication/tonga-pdna-tc-gita-2018.pdf',
      },
      {
        label: 'Tropical Cyclone Gita \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
        url: 'https://reliefweb.int/disaster/tc-2018-000102-ton',
      },
    ],
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
    // Strike order: Judy crossed southern Temotu on 27 February, before either
    // system reached Vanuatu. Fiji is deliberately absent -- see the note.
    nations: ['Solomon Islands', 'Vanuatu'],
    note: 'Two named cyclones, counted here as one event: they struck Vanuatu two days apart in March 2023, and every official assessment -- the government PDNA, OCHA\u2019s situation reports, the IFRC appeal -- reports combined figures for the pair rather than separating them.',
    profile: [
      {
        name: 'Solomon Islands',
        date: '27 February 2023',
        category: 1,
        categoryLabel:
          'Category 1 (Judy tracked over the southern islands; Kevin followed offshore \u2014 no landfall)',
        deaths: null,
        deathsNote:
          'The Solomon Islands NDMO and National Emergency Operation Centre published response plans and assessment deployments but no fatality figure. Not zero \u2014 never reported.',
        dodge: 0,
        fact: "Judy crossed the small islands of southern Temotu Province as a Category 1 system on the day it was named. Tikopia and Anuta, the province's two most remote islands, were assessed as worst affected, with damage to fruit trees and other livelihood sources. Reaching them took until 9 March, when a patrol boat carried assessment teams and relief from Lata.",
        lead: "The storm's first landfall was on the islands it would take twelve days to reach.",
      },
      {
        name: 'Vanuatu',
        date: '1 and 3 March 2023 (Judy, then Kevin)',
        category: 4,
        categoryLabel:
          'Category 4 at both landfalls \u2014 Judy on Efate and Tanna, Kevin on Erromango (combined entry for two cyclones)',
        // A stated zero, not an absent one: the government's own PDNA records
        // no casualties in terms. The most load-bearing zero on the roster.
        deaths: 0,
        dodge: 0,
        fact: 'Combined figures for both cyclones. The Government of Vanuatu\u2019s Post-Disaster Needs Assessment reports no casualties. 197,388 people (43,623 households) were assessed as affected, around 66% of the population, with roughly 90% of houses in Shefa and Tafea destroyed or severely damaged. A separate figure of 251,346 circulates and measures something else \u2014 people exposed to Category 2\u20133 winds, not people assessed as affected. Two earthquakes, magnitudes 6.5 and 5.4, struck off Espiritu Santo on 3 March in the middle of it.',
        lead: 'Two Category 4 landfalls in 48 hours, nine tenths of the housing in two provinces gone, and not one person killed.',
      },
    ],
    sources: [
      {
        label:
          'Tropical Cyclones Judy and Kevin \u2014 Post-Disaster Needs Assessment, Government of Vanuatu',
        url: 'https://dsppac.gov.vu/index.php?option=com_content&view=article&id=135&Itemid=615',
      },
      {
        label:
          'Tropical Cyclones Judy and Kevin \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
        url: 'https://reliefweb.int/report/vanuatu/vanuatu-tropical-cyclones-judy-kevin-situation-report-no1-10-march-2023',
      },
    ],
  },
  {
    id: 'lola',
    name: 'Cyclone Lola',
    year: 2023,
    label: 'Lola',
    // Strike order: Tikopia on 22 October, Vanuatu on 25 October.
    nations: ['Solomon Islands', 'Vanuatu'],
    profile: [
      {
        name: 'Solomon Islands',
        date: '22 October 2023',
        category: 3,
        categoryLabel: 'Category 3 (landfall, Tikopia Island, Temotu Province)',
        deaths: 4,
        // These four are INDIRECT -- a post-storm disease outbreak, weeks
        // later. Harold's 27 are direct drownings. Plotting the two on one axis
        // without saying so claims an equivalence the sources do not support.
        deathsKind: 'indirect',
        deathsNote:
          'Indirect deaths: a dysentery and diarrhoea outbreak on Vanikoro declared by health officials after the storm damaged water supplies, weeks after landfall. Not deaths during the cyclone itself.',
        dodge: 0,
        fact: '116 houses, 114 kitchens and one church destroyed on Tikopia, with water sources and desalination plants damaged and four people injured. Around 22,319 people were exposed across Temotu.',
        lead: 'Lola made landfall here first, and the deaths came weeks later, out of the water supply.',
      },
      {
        name: 'Vanuatu',
        date: '25 October 2023',
        category: 4,
        categoryLabel: 'Category 4 at landfall on Maewo and Pentecost; had peaked at Category 5 on 24 October',
        deaths: 2,
        dodge: 0,
        fact: 'Landfall on the eastern shores of Maewo and Pentecost with winds of 205 km/h, after peaking at Category 5 with 230 km/h \u2014 the earliest Category 5 cyclone ever recorded in the Southern Hemisphere, a week before Vanuatu\u2019s cyclone season officially opened. Around 110,750 people affected across five provinces, some 10,000 homes damaged, and over 100 schools hit, 70 of them destroyed or needing major repair.',
        lead: 'The third severe cyclone to hit Vanuatu in eight months arrived before the season had started.',
      },
    ],
    sources: [
      {
        label:
          'Cyclone Lola \u2014 Vanuatu Meteorology and Geo-hazards Department / VanKIRAP',
        url: 'https://reliefweb.int/report/vanuatu/cyclone-lola-regions-earliest-ever-category-5-cyclone-devastates-vanuatu',
      },
      {
        label: 'Tropical Cyclone Lola \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
        url: 'https://reliefweb.int/disaster/tc-2023-000207-vut',
      },
    ],
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
