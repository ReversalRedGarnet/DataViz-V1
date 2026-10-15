import roster from './roster.json'

// THE STORM ROSTER'S PROSE HALF.
//
// THE RULE: a severe tropical cyclone that made landfall or had major impact in
// two or more of the four in-scope nations, between ROSTER_START and ROSTER_END.
//
// Applied evenly, which is the whole point. A roster picked for the story it
// tells is not evidence of anything; a roster picked by a stated rule can be
// checked by a reader who disagrees with it. That is why the storms the rule
// throws out are named on the page, in the Method section's prose
// (components/MethodPanel.jsx), rather than kept in a comment -- they are what
// make the ones it keeps mean something.
//
// WHERE THE SPLIT FALLS, AND WHY THERE IS ONE. The facts the rule determines --
// id, name, year, label, and which in-scope nations each storm struck -- live in
// roster.json, because data-pipeline/clean_data.py needs them too and cannot
// import a JavaScript module. It used to keep its own copy of all six storms,
// under a comment asking whoever edited one list to remember the other. This
// file holds everything the pipeline has no use for: the researched per-nation
// profiles, the sentences that connect them, and the citations.
//
// The two halves are merged by id below, and the merge THROWS AT IMPORT TIME if
// either side has an entry the other does not. A roster that disagrees with
// itself is precisely what naming the exclusions exists to rule out, so this
// fails the build rather than the reader.
//
// Each entry in STORM_DETAIL is keyed by its id in roster.json:
//   note -- optional, printed under the storm's name where the entry needs a
//     qualification the reader would otherwise have to take on trust
//   profile -- per-nation storm facts, hand-researched from BOM cyclone
//     histories and UN OCHA situation reports. Null until researched. A storm
//     without a profile still gets a full ripple chain; it just doesn't get the
//     journey and category-versus-deaths sections, which have nothing to draw.
//   sources -- the supplementary citations for that storm's profile: an
//     assessment and a situation report or met record, plus the record behind
//     any figure those two do not state
//
// FRENCH TRANSLATION. `note`, `categoryLabel`, `fact`, `lead`, `deathsNote` and
// `date` each carry an *Fr sibling (noteFr, categoryLabelFr, factFr, leadFr,
// deathsNoteFr, dateFr) rather than becoming { en, fr } objects outright --
// this data flows through half a dozen components (MapView, StormJourney,
// StormProfile, StormTimeline, RippleChain's insights) that all read
// .fact/.categoryLabel/.date etc. directly, and reshaping the field itself
// would mean touching every one of those read sites individually. Instead,
// localizeStorm()/localizeRow() below swap in the *Fr sibling once, at the
// point each storm object is first obtained (App.jsx's pageSections(),
// StormTimeline.jsx's STORMS lookup), and every existing
// .fact/.categoryLabel/.lead/.deathsNote/.note/.date read downstream keeps
// working unchanged. `date` needed one by hand rather than an
// Intl.DateTimeFormat call at read time because a handful of entries are not
// a single calendar date to format -- see Judy & Kevin's below, two dates and
// a parenthetical. `name` (the nation), `category`, `deaths`, `deathsKind` and
// `dodge` are still data, not prose, and are never localized.
// `sources[].label` is now { en, fr } too, resolved via sourceLabel() from
// utils/metrics.js -- descriptive terms (assessment names, report types)
// translate; organisation and agency names (UN OCHA, ReliefWeb, IFRC, World
// Bank, VanKIRAP) stay as given, the way an English-language citation isn't
// re-lettered inside a French sentence either.
const STORM_DETAIL = {
  pam: {
    profile: [
      {
        name: 'Solomon Islands',
        // Local date (UTC+11) of the closest pass: 15:00 UTC on 11 March in
        // RSMC Nadi's best track is 02:00 on 12 March in Solomon Islands.
        date: '12 March 2015',
        dateFr: '12 mars 2015',
        category: 4,
        // RSMC Nadi's best track (IBTrACS 2015066S08170): Category 4, 90 kt, at
        // the closest pass, about 20 km from Anuta at 15:00 UTC on 11 March. Pam
        // was Category 1 only on 9 March, while still far north of Temotu.
        categoryLabel: 'Category 4 at closest approach, about 20 km from Anuta; passed offshore, no landfall',
        categoryLabelFr: "Catégorie 4 à l'approche la plus proche, à environ 20\u00A0km d'Anuta\u00A0; passé au large, sans atterrissage",
        deaths: null,
        deathsNote:
          'IFRC, OCHA and government response documents record affected populations and damage for Solomon Islands but publish no separate fatality figure. Not zero \u2014 never reported.',
        deathsNoteFr:
          "Les documents de réponse de la FICR, de l'OCHA et du gouvernement recensent les populations touchées et les dégâts pour les Îles Salomon, mais ne publient aucun bilan distinct de décès. Pas zéro \u2014 jamais déclaré.",
        dodge: 0,
        fact: "Storm surge, swells and heavy rain struck Temotu and Malaita provinces while Pam was still intensifying offshore. 83 of 260 houses were damaged across Temotu's outer islands; more than half of garden crops were damaged, and NDMO assessments found 2,344 families \u2014 11,780 people needing support across 19 wards of Malaita Province.",
        factFr:
          "Une onde de tempête, une forte houle et de fortes pluies ont frappé les provinces de Temotu et de Malaita alors que Pam s'intensifiait encore au large. 83 des 260 maisons ont été endommagées sur les îles périphériques de Temotu\u00A0; plus de la moitié des cultures vivrières ont été endommagées, et les évaluations du NDMO ont recensé 2\u00A0344 familles \u2014 11\u00A0780 personnes ayant besoin d'aide dans 19 circonscriptions de la province de Malaita.",
        lead: 'Nearly two days before it reached Vanuatu, Pam was already flooding coastlines it never made landfall on.',
        leadFr: "Près de deux jours avant d'atteindre Vanuatu, Pam inondait déjà des côtes sur lesquelles il n'a jamais touché terre.",
      },
      {
        name: 'Vanuatu',
        date: '13 March 2015',
        dateFr: '13 mars 2015',
        category: 5,
        categoryLabel: 'Category 5 (landfall, Shefa and Tafea Provinces)',
        categoryLabelFr: 'Catégorie 5 (atterrissage, provinces de Shefa et Tafea)',
        deaths: 11,
        dodge: 0,
        fact: "Sustained winds of 250 km/h with gusts to 320 km/h. The government's Post-Disaster Needs Assessment confirmed 11 fatalities in Tafea and Shefa, roughly 17,000 buildings damaged or destroyed, 65,000 people displaced, and total effects of US$449 million \u2014 equal to 64% of Vanuatu's GDP.",
        factFr:
          "Vents soutenus de 250 km/h avec des rafales à 320 km/h. L'évaluation des besoins post-catastrophe du gouvernement a confirmé 11 décès à Tafea et Shefa, environ 17\u00A0000 bâtiments endommagés ou détruits, 65\u00A0000 personnes déplacées, et des effets totaux de 449 millions de dollars US \u2014 soit 64\u00A0% du PIB de Vanuatu.",
        lead: 'Then it reached full strength.',
        leadFr: 'Puis il a atteint sa pleine puissance.',
      },
    ],
    sources: [
      {
        label: {
          en: 'Tropical Cyclone Pam \u2014 Post-Disaster Needs Assessment, Government of Vanuatu',
          fr: 'Cyclone tropical Pam \u2014 Évaluation des besoins post-catastrophe, gouvernement du Vanuatu',
        },
        url: 'https://reliefweb.int/report/vanuatu/post-disaster-needs-assessment-tropical-cyclone-pam-march-2015',
      },
      {
        label: {
          en: 'Tropical Cyclone Pam \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
          fr: 'Cyclone tropical Pam \u2014 rapports de situation humanitaire, OCHA de l’ONU / ReliefWeb',
        },
        url: 'https://reliefweb.int/disaster/tc-2015-000020-vut',
      },
      {
        label: {
          en: 'Pacific: Tropical Cyclone Pam \u2014 international appeal MDR55001, operations update 2 (15 May 2015), IFRC',
          fr: 'Pacifique\u00A0: cyclone tropical Pam \u2014 appel international MDR55001, point sur les opérations n°\u00A02 (15 mai 2015), IFRC',
        },
        url: 'https://reliefweb.int/report/vanuatu/pacific-tropical-cyclone-pam-international-appeal-n-mdr55001-operations-update-n-2',
      },
      {
        label: {
          en: 'Tropical Cyclone Pam \u2014 RSMC Nadi best track, IBTrACS v04r01 (2015066S08170)',
          fr: 'Cyclone tropical Pam \u2014 trajectoire de référence du RSMC Nadi, IBTrACS v04r01 (2015066S08170)',
        },
        url: 'https://ncics.org/ibtracs/index.php?name=v04r01-2015066S08170',
      },
    ],
  },
  winston: {
    profile: [
      {
        name: 'Tonga',
        date: '16 February 2016',
        dateFr: '16 février 2016',
        category: 1,
        // The two figures in this label are both true of different moments, and
        // the number above is the national met service's own. This is exactly
        // the case categoryLabel exists for.
        categoryLabel:
          "Category 1 at closest approach to Vava'u (no landfall); returned as a Category 4 passing north of Vava'u on 19 February",
        categoryLabelFr:
          "Catégorie 1 à l'approche la plus proche de Vava'u (sans atterrissage)\u00A0; revenu en catégorie 4 en passant au nord de Vava'u le 19 février",
        deaths: 0,
        dodge: 0,
        fact: "Ten houses destroyed and about 200 damaged in Tonga, as of 19 February. In Vava'u, over 80% of homes sustained some rain damage, and flash flooding forced nine patients to be moved inside Prince Ngu hospital. Deputy Prime Minister Siaosi Sovaleni told Parliament no lives were lost anywhere in Tonga.",
        factFr:
          "Dix maisons détruites et environ 200 endommagées à Tonga, au 19 février. À Vava'u, plus de 80\u00A0% des habitations ont subi des dégâts liés à la pluie, et des inondations soudaines ont forcé le déplacement de neuf patients à l'intérieur de l'hôpital Prince Ngu. Le vice-Premier ministre Siaosi Sovaleni a déclaré au Parlement qu'aucune vie n'avait été perdue nulle part à Tonga.",
        lead: 'Tonga met Winston twice and lost no one, four days before Fiji lost 44.',
        leadFr: "Tonga a affronté Winston deux fois sans perdre personne, quatre jours avant que Fidji n'en perde 44.",
      },
      {
        name: 'Fiji',
        date: '20 February 2016',
        dateFr: '20 février 2016',
        category: 5,
        categoryLabel: 'Category 5 (landfall, Koro Island then Viti Levu)',
        categoryLabelFr: 'Catégorie 5 (atterrissage, île de Koro puis Viti Levu)',
        deaths: 44,
        dodge: 0,
        fact: "Average winds of 233 km/h with gusts to 306 km/h \u2014 the strongest landfalling cyclone in Fiji's records and one of the most powerful cyclones ever recorded in the Southern Hemisphere. 540,400 people affected, 62% of the population, over 30,000 buildings damaged or destroyed, and 88 of 214 health facilities damaged.",
        factFr:
          "Vents moyens de 233 km/h avec des rafales à 306 km/h \u2014 le cyclone le plus fort à avoir touché terre dans les annales de Fidji et l'un des cyclones les plus puissants jamais enregistrés dans l'hémisphère Sud. 540\u00A0400 personnes touchées, soit 62\u00A0% de la population, plus de 30\u00A0000 bâtiments endommagés ou détruits, et 88 des 214 établissements de santé endommagés.",
        lead: "Forty-four deaths, and the only stop that is both Category 5 and the roster's deadliest.",
        leadFr:
          "44 morts, et la seule étape de la liste à être à la fois de catégorie 5 et la plus meurtrière.",
      },
    ],
    sources: [
      {
        label: {
          en: 'Tropical Cyclone Winston \u2014 Post-Disaster Needs Assessment, Government of Fiji',
          fr: 'Cyclone tropical Winston \u2014 Évaluation des besoins post-catastrophe, gouvernement des Fidji',
        },
        url: 'https://reliefweb.int/report/fiji/fiji-post-disaster-needs-assessment-may-2016-tropical-cyclone-winston-february-20-2016',
      },
      {
        label: {
          en: 'Tropical cyclone record, Tonga Meteorological Service',
          fr: 'Registre des cyclones tropicaux, Service météorologique des Tonga',
        },
        url: 'https://www.met.gov.to/index_files/TC_list_update.pdf',
      },
      {
        label: {
          en: 'Tonga, Fiji \u2014 Tropical Cyclone Winston (ECHO Daily Flash, 19 February 2016), ECHO / ReliefWeb',
          fr: 'Tonga, Fidji \u2014 cyclone tropical Winston (ECHO Daily Flash, 19 février 2016), ECHO / ReliefWeb',
        },
        url: 'https://reliefweb.int/report/tonga/tonga-fiji-tropical-cyclone-winston-gdacs-jtwc-nasa-vanuatu-met-services-fiji-met',
      },
      {
        label: {
          en: "More than 100 families in Vava'u and Ha'apai evacuated \u2014 Radio & TV Tonga News, via PINA (17 February 2016)",
          fr: "Plus de 100 familles évacuées à Vava'u et Ha'apai \u2014 Radio & TV Tonga News, via PINA (17 février 2016)",
        },
        url: 'https://reliefweb.int/report/tonga/more-100-families-vavau-and-haapai-evacuated-tonga-s-agriculture-sector-suffers-major',
      },
    ],
  },
  gita: {
    profile: [
      {
        name: 'Tonga',
        date: '12 February 2018',
        dateFr: '12 février 2018',
        category: 4,
        categoryLabel: "Category 4 (landfall, Tongatapu and 'Eua)",
        categoryLabelFr: "Catégorie 4 (atterrissage, Tongatapu et 'Eua)",
        deaths: 1,
        dodge: -0.35,
        fact: "Average winds of 130 km/h crossing Tongatapu and 'Eua \u2014 the strongest cyclone to hit those islands since Isaac in 1982. The 100-year-old Parliament House was flattened. NEMO recorded 4,708 houses damaged or destroyed and about 4,500 people in evacuation centres; damage reached US$164 million, 37.8% of GDP.",
        factFr:
          "Vents moyens de 130 km/h traversant Tongatapu et 'Eua \u2014 le cyclone le plus fort à avoir touché ces îles depuis Isaac en 1982. Le Parlement, vieux de 100 ans, a été rasé. Le NEMO a recensé 4\u00A0708 maisons endommagées ou détruites et environ 4\u00A0500 personnes dans des centres d'évacuation\u00A0; les dégâts ont atteint 164 millions de dollars US, soit 37,8\u00A0% du PIB.",
        lead: 'The strongest storm to cross Tongatapu in 36 years killed one person.',
        leadFr: 'Le cyclone le plus fort à traverser Tongatapu en 36 ans a fait un mort.',
      },
      {
        name: 'Fiji',
        date: '13 February 2018',
        dateFr: '13 février 2018',
        category: 4,
        categoryLabel:
          'Category 4 passing the southern Lau group; peaked at Category 5 about 205 km south of Kadavu \u2014 no landfall',
        categoryLabelFr:
          'Catégorie 4 en passant au sud du groupe des Lau\u00A0; a culminé en catégorie 5 à environ 205\u00A0km au sud de Kadavu \u2014 sans atterrissage',
        deaths: 0,
        dodge: 0.35,
        fact: '1,579 people affected in the southern Lau group, with Ono-i-Lau and Vatoa worst hit \u2014 three buildings destroyed, gusts of 84 knots (about 155 km/h) at Ono-i-Lau, no injuries reported.',
        factFr:
          "1\u00A0579 personnes touchées dans le sud du groupe des Lau, Ono-i-Lau et Vatoa étant les plus durement touchées \u2014 trois bâtiments détruits, rafales de 84 nœuds (environ 155 km/h) à Ono-i-Lau, aucun blessé signalé.",
        lead: 'Still Category 4 \u2014 105 knots at closest approach, the same as Tonga \u2014 and nobody was hurt.',
        leadFr: "Toujours en catégorie 4 \u2014 105 nœuds à l'approche la plus proche, comme à Tonga \u2014 et personne n'a été blessé.",
      },
    ],
    sources: [
      {
        label:
          {
            en: 'Tropical Cyclone Gita \u2014 Post-Disaster Rapid Assessment, Government of Tonga / World Bank',
            fr: 'Cyclone tropical Gita \u2014 Évaluation rapide post-catastrophe, gouvernement des Tonga / Banque mondiale',
          },
        url: 'https://www.gfdrr.org/sites/default/files/publication/tonga-pdna-tc-gita-2018.pdf',
      },
      {
        label: {
          en: 'Tropical Cyclone Gita \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
          fr: 'Cyclone tropical Gita \u2014 rapports de situation humanitaire, OCHA de l’ONU / ReliefWeb',
        },
        url: 'https://reliefweb.int/disaster/tc-2018-000102-ton',
      },
      {
        label: {
          en: 'Pacific Islands Cyclone Gita \u2014 humanitarian situation report 2 (16 February 2018), UNICEF',
          fr: 'Cyclone Gita, îles du Pacifique \u2014 rapport de situation humanitaire n°\u00A02 (16 février 2018), UNICEF',
        },
        url: 'https://reliefweb.int/report/tonga/pacific-islands-cyclone-gita-humanitarian-situation-report-2-16-february-2018',
      },
      {
        label: {
          en: 'One death, 3 seriously injured in Tongatapu during TC Gita \u2014 Matangi Tonga (14 February 2018)',
          fr: 'Un mort et trois blessés graves à Tongatapu pendant le cyclone Gita \u2014 Matangi Tonga (14 février 2018)',
        },
        url: 'https://matangitonga.to/2018/02/14/one-death-3-seriously-injured-tongatapu-tc-gita',
      },
      {
        label: {
          en: 'Cyclone Gita in Tonga \u2014 activation 566, International Charter Space and Major Disasters',
          fr: 'Cyclone Gita aux Tonga \u2014 activation 566, Charte internationale «\u00A0Espace et catastrophes majeures\u00A0»',
        },
        url: 'https://disasterscharter.org/web/guest/activations/-/article/cyclone-in-tonga-activation-566-',
      },
      {
        label: {
          en: 'Severe TC Gita (Category 4) passes just south of Ono-i-Lau \u2014 media release 35 (13 February 2018), Fiji Meteorological Service',
          fr: "Le cyclone tropical sévère Gita (catégorie 4) passe juste au sud d'Ono-i-Lau \u2014 communiqué n°\u00A035 (13 février 2018), Service météorologique des Fidji",
        },
        url: 'https://reliefweb.int/report/fiji/fiji-meteorological-services-severe-tc-gita-cat4-passes-just-south-ono-5pm-13-february',
      },
      {
        label: {
          en: 'Fiji, Tonga, Niue, American Samoa, Samoa \u2014 Tropical Cyclone Gita (ECHO Daily Flash, 14 February 2018), ECHO / ReliefWeb',
          fr: 'Fidji, Tonga, Niue, Samoa américaines, Samoa \u2014 cyclone tropical Gita (ECHO Daily Flash, 14 février 2018), ECHO / ReliefWeb',
        },
        url: 'https://reliefweb.int/report/fiji/fiji-tonga-niue-american-samoa-samoa-tropical-cyclone-gita-update-gdacs-jtwc-meteo-0',
      },
    ],
  },
  harold: {
    // Listed in the order the storm reached them, which is the order the
    // journey section walks through.
    profile: [
      {
        name: 'Solomon Islands',
        date: '3 April 2020',
        dateFr: '3 avril 2020',
        category: 1,
        categoryLabel: 'Tropical low / Category 1 at time of impact',
        categoryLabelFr: "Dépression tropicale / Catégorie 1 au moment de l'impact",
        deaths: 27,
        dodge: 0,
        fact: "The passenger ferry MV Taimareho was overwhelmed by Harold's swell in Ironbottom Sound, Malaita Province -- the deadliest single event of the whole cyclone, at its weakest documented phase.",
        factFr:
          "Le ferry de passagers MV Taimareho a été submergé par la houle de Harold dans le détroit d'Ironbottom, province de Malaita \u2014 l'événement le plus meurtrier de tout le cyclone, survenu à sa phase la plus faible documentée.",
        lead: 'The deadliest day came first, at the storm\u2019s weakest.',
        leadFr: 'Le jour le plus meurtrier a été le premier, à la phase la plus faible du cyclone.',
      },
      {
        name: 'Vanuatu',
        date: '6 April 2020',
        dateFr: '6 avril 2020',
        category: 5,
        categoryLabel: 'Category 5 (landfall, Espiritu Santo)',
        categoryLabelFr: 'Catégorie 5 (atterrissage, Espiritu Santo)',
        deaths: 2,
        dodge: 0,
        fact: '230 km/h sustained winds, gusts to 325 km/h -- the strongest storm to hit Vanuatu since Cyclone Pam in 2015. Up to 90% of homes lost in the worst-hit areas.',
        factFr:
          "Vents soutenus de 230 km/h, rafales à 325 km/h \u2014 le cyclone le plus fort à avoir frappé Vanuatu depuis le cyclone Pam en 2015. Jusqu'à 90\u00A0% des habitations perdues dans les zones les plus touchées.",
        lead: 'Three days later, the same system made landfall at full strength.',
        leadFr: 'Trois jours plus tard, le même système a touché terre à pleine puissance.',
      },
      {
        name: 'Fiji',
        date: '8 April 2020',
        dateFr: '8 avril 2020',
        category: 4,
        categoryLabel: 'Category 4 (landfall, Kadavu)',
        categoryLabelFr: 'Catégorie 4 (atterrissage, Kadavu)',
        deaths: 1,
        dodge: -0.35,
        fact: '1,919 buildings damaged.',
        factFr: '1\u00A0919 bâtiments endommagés.',
        lead: 'Still a severe storm, over a country with more to absorb it.',
        leadFr: "Toujours un cyclone sévère, mais sur un pays davantage en mesure de l'absorber.",
      },
      {
        name: 'Tonga',
        date: '9 April 2020',
        dateFr: '9 avril 2020',
        category: 4,
        categoryLabel: 'Category 4 (passed offshore, no landfall)',
        categoryLabelFr: 'Catégorie 4 (passé au large, sans atterrissage)',
        deaths: 0,
        dodge: 0.35,
        fact: "428 homes damaged or destroyed, without a direct hit. Storm surge and high tide flooded coastal areas of Tongatapu, 'Eua and Ha'apai.",
        factFr: "428 habitations endommagées ou détruites, sans impact direct. L'onde de tempête, combinée à la marée haute, a inondé les zones côtières de Tongatapu, 'Eua et Ha'apai.",
        lead: 'A near miss, and the shortest recovery of the four.',
        leadFr: 'Un coup évité de justesse, et le redressement le plus rapide des quatre.',
      },
    ],
    sources: [
      {
        label:
          {
            en: 'Severe Tropical Cyclone Harold \u2014 official cyclone history, Australian Bureau of Meteorology',
            fr: 'Cyclone tropical sévère Harold \u2014 historique officiel du cyclone, Bureau de météorologie australien',
          },
        url: 'https://www.bom.gov.au/cyclone/history/Harold.shtml',
      },
      {
        label: {
          en: 'Tropical Cyclone Harold \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
          fr: 'Cyclone tropical Harold \u2014 rapports de situation humanitaire, OCHA de l’ONU / ReliefWeb',
        },
        url: 'https://reliefweb.int/disaster/tc-2020-000049-vut',
      },
      {
        label: {
          en: 'Tropical Cyclone Harold \u2014 situation report 6 (13 April 2020), Pacific Humanitarian Team / UN OCHA',
          fr: 'Cyclone tropical Harold \u2014 rapport de situation n°\u00A06 (13 avril 2020), Équipe humanitaire pour le Pacifique / OCHA de l’ONU',
        },
        url: 'https://reliefweb.int/report/vanuatu/pacific-humanitarian-team-tropical-cyclone-harold-situation-report-6-13-april-2020',
      },
      {
        label: {
          en: 'Pacific Islands \u2014 Tropical Cyclone Harold (ECHO Daily Flash, 14 April 2020), ECHO / ReliefWeb',
          fr: 'Îles du Pacifique \u2014 cyclone tropical Harold (ECHO Daily Flash, 14 avril 2020), ECHO / ReliefWeb',
        },
        url: 'https://reliefweb.int/report/vanuatu/pacific-islands-tropical-cyclone-harold-dg-echo-unicef-echo-daily-flash-14-april-2020',
      },
    ],
  },
  'judy-kevin': {
    note: 'Two named cyclones, counted here as one event: they struck Vanuatu two days apart in March 2023, and every official assessment -- the government PDNA, OCHA\u2019s situation reports, the IFRC appeal -- reports combined figures for the pair rather than separating them.',
    noteFr:
      "Deux cyclones nommés, comptés ici comme un seul événement\u00A0: ils ont frappé Vanuatu à deux jours d'intervalle en mars 2023, et chaque évaluation officielle \u2014 le PDNA du gouvernement, les rapports de situation de l'OCHA, l'appel de la FICR \u2014 présente des chiffres combinés pour la paire plutôt que de les séparer.",
    profile: [
      {
        name: 'Solomon Islands',
        date: '27 February 2023',
        dateFr: '27 février 2023',
        category: 1,
        categoryLabel:
          'Category 1 (Judy passed close to the southern islands; Kevin followed offshore \u2014 no landfall)',
        categoryLabelFr:
          'Catégorie 1 (Judy est passé près des îles du sud\u00A0; Kevin a suivi au large \u2014 sans atterrissage)',
        deaths: null,
        deathsNote:
          'The Solomon Islands NDMO and National Emergency Operation Centre published response plans and assessment deployments but no fatality figure. Not zero \u2014 never reported.',
        deathsNoteFr:
          "Le NDMO des Îles Salomon et le Centre national des opérations d'urgence ont publié des plans de réponse et des déploiements d'évaluation, mais aucun bilan de décès. Pas zéro \u2014 jamais déclaré.",
        dodge: 0,
        fact: "Judy passed close to the small islands of southern Temotu Province as a Category 1 system on the day it was named. Tikopia and Anuta, the province's two most remote islands, were assessed as worst affected, with damage to fruit trees and other livelihood sources. The assessment team, carried by patrol boat via Lata, reached Tikopia on 13 March, 14 days after the storm.",
        factFr:
          "Judy est passé près des petites îles du sud de la province de Temotu en tant que système de catégorie 1 le jour même où il a été nommé. Tikopia et Anuta, les deux îles les plus isolées de la province, ont été évaluées comme les plus touchées, avec des dégâts aux arbres fruitiers et à d'autres sources de subsistance. L'équipe d'évaluation, transportée par un patrouilleur via Lata, a atteint Tikopia le 13 mars, 14 jours après le cyclone.",
        lead: 'The storm first passed close to the islands it would take 14 days to reach.',
        leadFr: "Le cyclone est d'abord passé près des îles qu'il faudrait 14 jours pour atteindre.",
      },
      {
        name: 'Vanuatu',
        date: '1 and 3 March 2023 (Judy, then Kevin)',
        dateFr: '1er et 3 mars 2023 (Judy, puis Kevin)',
        category: 4,
        categoryLabel:
          'Category 4 at both landfalls, on 1 and 3 March; Judy made landfall on Efate (combined entry for two cyclones)',
        categoryLabelFr:
          'Catégorie 4 aux deux atterrissages, les 1er et 3 mars\u00A0; Judy a touché terre sur Efate (entrée combinée pour deux cyclones)',
        // A stated zero, not an absent one: the government's own PDNA records
        // no casualties in terms. The most load-bearing zero on the roster.
        deaths: 0,
        dodge: 0,
        fact: 'Combined figures for both cyclones. The Government of Vanuatu\u2019s Post-Disaster Needs Assessment reports no casualties. 197,388 people (43,623 households) were assessed as affected, around 66% of the population, with roughly 90% of houses in Shefa and Tafea destroyed or severely damaged (NDMO via OCHA). A separate figure of 251,346 circulates and measures something else \u2014 people exposed to Category 2\u20133 winds, not people assessed as affected. Two earthquakes, magnitudes 6.5 and 5.4, struck off Espiritu Santo on 3 March in the middle of it.',
        factFr:
          "Chiffres combinés pour les deux cyclones. L'évaluation des besoins post-catastrophe du gouvernement de Vanuatu ne recense aucune victime. 197\u00A0388 personnes (43\u00A0623 foyers) ont été évaluées comme touchées, soit environ 66\u00A0% de la population, avec environ 90\u00A0% des maisons de Shefa et Tafea détruites ou gravement endommagées (NDMO, via l'OCHA). Un autre chiffre de 251\u00A0346 circule et mesure autre chose \u2014 les personnes exposées à des vents de catégorie 2 à 3, non les personnes évaluées comme touchées. Deux séismes, de magnitude 6,5 et 5,4, ont frappé au large d'Espiritu Santo le 3 mars, en plein milieu de l'épisode.",
        lead: 'Two Category 4 landfalls in 48 hours, nine tenths of the housing in two provinces destroyed or severely damaged, and not one person killed.',
        leadFr:
          "Deux atterrissages de catégorie 4 en 48 heures, neuf dixièmes des habitations de deux provinces détruites ou gravement endommagées, et pas une seule personne tuée.",
      },
    ],
    sources: [
      {
        label:
          {
            en: 'Tropical Cyclones Judy and Kevin \u2014 Post-Disaster Needs Assessment, Government of Vanuatu',
            fr: 'Cyclones tropicaux Judy et Kevin \u2014 Évaluation des besoins post-catastrophe, gouvernement du Vanuatu',
          },
        url: 'https://dsppac.gov.vu/index.php?option=com_content&view=article&id=135&Itemid=615',
      },
      {
        label:
          {
            en: 'Tropical Cyclones Judy and Kevin \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
            fr: 'Cyclones tropicaux Judy et Kevin \u2014 rapports de situation humanitaire, OCHA de l’ONU / ReliefWeb',
          },
        url: 'https://reliefweb.int/report/vanuatu/vanuatu-tropical-cyclones-judy-kevin-situation-report-no1-10-march-2023',
      },
      {
        label: {
          en: 'Tropical Cyclones Judy and Kevin \u2014 situation report 4 (22 March 2023), UN OCHA / ReliefWeb',
          fr: 'Cyclones tropicaux Judy et Kevin \u2014 rapport de situation n°\u00A04 (22 mars 2023), OCHA de l’ONU / ReliefWeb',
        },
        url: 'https://reliefweb.int/report/vanuatu/vanuatu-tropical-cyclone-judy-and-tropical-cyclone-kevin-situation-report-no-4-22-march-2023',
      },
      {
        label: {
          en: 'NDC and N-DOC deploy assessment team to support Temotu P-DOC \u2014 Government of Solomon Islands (10 March 2023)',
          fr: 'Le NDC et le N-DOC déploient une équipe d’évaluation en appui au P-DOC de Temotu \u2014 gouvernement des Îles Salomon (10 mars 2023)',
        },
        url: 'https://reliefweb.int/report/solomon-islands/ndc-and-n-doc-deploys-assessment-team-support-temotu-p-doc',
      },
      {
        label: {
          en: 'Multi-sectoral assessment for Tikopia and Anuta completed \u2014 Government of Solomon Islands (20 March 2023)',
          fr: 'Évaluation multisectorielle achevée à Tikopia et Anuta \u2014 gouvernement des Îles Salomon (20 mars 2023)',
        },
        url: 'https://reliefweb.int/report/solomon-islands/multi-sectoral-assessment-tikopia-and-anuta-completed',
      },
      {
        label: {
          en: 'Tropical Cyclone Judy \u2014 RSMC Nadi best track, IBTrACS v04r01 (2023055S14184)',
          fr: 'Cyclone tropical Judy \u2014 trajectoire de référence du RSMC Nadi, IBTrACS v04r01 (2023055S14184)',
        },
        url: 'https://ncics.org/ibtracs/index.php?name=v04r01-2023055S14184',
      },
    ],
  },
  lola: {
    profile: [
      {
        name: 'Solomon Islands',
        date: '22 October 2023',
        dateFr: '22 octobre 2023',
        category: 3,
        categoryLabel: 'Category 3 (landfall, Tikopia Island, Temotu Province)',
        categoryLabelFr: 'Catégorie 3 (atterrissage, île de Tikopia, province de Temotu)',
        deaths: 4,
        // These four are INDIRECT -- a post-storm disease outbreak, reported
        // nearly two weeks after landfall. Harold's 27 are direct drownings.
        // Plotting the two on one axis without saying so claims an equivalence
        // the sources do not support.
        deathsKind: 'indirect',
        deathsNote:
          'Indirect deaths: from a dysentery and diarrhoea outbreak on Vanikoro declared by health officials, nearly two weeks after landfall. Not deaths during the cyclone itself.',
        deathsNoteFr:
          "Décès indirects\u00A0: dus à une épidémie de dysenterie et de diarrhée sur Vanikoro, déclarée par les autorités sanitaires, près de deux semaines après l'atterrissage. Pas des décès survenus pendant le cyclone lui-même.",
        dodge: 0,
        fact: '116 houses, 114 kitchens and one church destroyed on Tikopia, with water sources damaged and four people injured. Around 22,319 people were exposed across Temotu.',
        factFr:
          "116 maisons, 114 cuisines et une église détruites à Tikopia, avec des points d'eau endommagés et quatre personnes blessées. Environ 22\u00A0319 personnes ont été exposées dans l'ensemble de Temotu.",
        lead: 'Lola made landfall here first, and the deaths were reported nearly two weeks later.',
        leadFr: "Lola a d'abord touché terre ici, et les décès ont été signalés près de deux semaines plus tard.",
      },
      {
        name: 'Vanuatu',
        date: '25 October 2023',
        dateFr: '25 octobre 2023',
        category: 4,
        categoryLabel: 'Category 4 at landfall on Maewo and Pentecost; had peaked at Category 5 on 24 October',
        categoryLabelFr: "Catégorie 4 à l'atterrissage sur Maewo et Pentecost\u00A0; avait culminé en catégorie 5 le 24 octobre",
        deaths: 1,
        // NDMO's own count, and only deaths it calls directly attributable to
        // the cyclone (NEOC Situation Report 13). Other counts run from 2 to 4,
        // so the note says so rather than the chart quietly picking one. It
        // mirrors the Solomon Islands stop above, whose note says its four
        // deaths were indirect, so the two markers can be read side by side.
        deathsNote:
          'Direct deaths: NDMO\u2019s count of deaths directly attributable to the cyclone (NEOC Situation Report 13, 13 November 2023). Other agencies report up to four.',
        deathsNoteFr:
          "Décès directs\u00A0: décompte du NDMO des décès directement imputables au cyclone (rapport de situation n°\u00A013 du NEOC, 13 novembre 2023). D'autres organismes en signalent jusqu'à quatre.",
        dodge: 0,
        fact: 'Landfall on the eastern shores of Maewo and Pentecost at Category 4, after peaking at Category 5 with ten-minute sustained winds of 215 km/h \u2014 the earliest Category 5 cyclone ever recorded in the Southern Hemisphere, a week before Vanuatu\u2019s cyclone season officially opened. About 91,000 people affected across five provinces. In Malampa alone, 220 houses were destroyed and 492 significantly damaged (Vanuatu Red Cross data, via NDMO), and three schools were completely destroyed: Ranon, Ranvetlam and Makam.',
        factFr:
          "Atterrissage sur les côtes orientales de Maewo et Pentecost en catégorie 4, après avoir culminé en catégorie 5 avec des vents moyens sur dix minutes de 215 km/h \u2014 le cyclone de catégorie 5 le plus précoce jamais enregistré dans l'hémisphère Sud, une semaine avant l'ouverture officielle de la saison cyclonique de Vanuatu. Environ 91\u00A0000 personnes touchées dans cinq provinces. Rien qu'à Malampa, 220 maisons ont été détruites et 492 fortement endommagées (données de la Croix-Rouge de Vanuatu, via le NDMO), et trois écoles ont été entièrement détruites\u00A0: Ranon, Ranvetlam et Makam.",
        lead: 'The third severe cyclone to hit Vanuatu in eight months arrived before the season had started.',
        leadFr: "Le troisième cyclone sévère à frapper Vanuatu en huit mois est arrivé avant même le début de la saison.",
      },
    ],
    // One per figure the Vanuatu stop states, because no single assessment
    // carries them all: deaths, houses and schools are NDMO's; the peak is RSMC
    // Nadi's; the affected count is NDMO's as reported by OCHA and the IFRC; the
    // range of other death counts needs its own citation to be checkable. The
    // last four cover the season-opening date and the Solomon Islands stop.
    sources: [
      {
        label: {
          en: 'Tropical Cyclone Lola \u2014 NEOC Situation Report 13 (13 November 2023), NDMO, Government of Vanuatu',
          fr: 'Cyclone tropical Lola \u2014 rapport de situation n°\u00A013 du NEOC (13 novembre 2023), NDMO, gouvernement du Vanuatu',
        },
        url: 'https://reliefweb.int/report/vanuatu/vanuatu-national-disaster-management-office-neoc-situation-report-13-tc-lola-13-november-2023',
      },
      {
        label: {
          en: 'Tropical Cyclone Lola \u2014 NEOC Situation Report 14 (15 November 2023), NDMO, Government of Vanuatu',
          fr: 'Cyclone tropical Lola \u2014 rapport de situation n°\u00A014 du NEOC (15 novembre 2023), NDMO, gouvernement du Vanuatu',
        },
        url: 'https://reliefweb.int/report/vanuatu/vanuatu-national-disaster-management-office-neoc-situation-report-14-tc-lola-15-november-2023',
      },
      {
        label: {
          en: 'Report on Severe Tropical Cyclone Lola \u2014 Fiji Meteorological Service (RSMC Nadi)',
          fr: 'Rapport sur le cyclone tropical sévère Lola \u2014 Service météorologique des Fidji (RSMC Nadi)',
        },
        url: 'https://www.met.gov.fj/media/tropical_cyclone_files/TC_Lola_October_2023TC_Report2024.02.26_10.56.23.pdf',
      },
      {
        label: {
          en: 'Tropical Cyclone Lola \u2014 internationally deployed assets (2 November 2023), UN OCHA / ReliefWeb',
          fr: 'Cyclone tropical Lola \u2014 moyens déployés à l’international (2 novembre 2023), OCHA de l’ONU / ReliefWeb',
        },
        url: 'https://reliefweb.int/report/vanuatu/vanuatu-tropical-cyclone-lola-internationally-deployed-assets-2-november-2023',
      },
      {
        label: {
          en: 'Tropical Cyclone Lola \u2014 emergency appeal final report (MDRVU011), IFRC',
          fr: 'Cyclone tropical Lola \u2014 rapport final de l’appel d’urgence (MDRVU011), IFRC',
        },
        url: 'https://reliefweb.int/report/vanuatu/vanuatu-asia-pacific-tropical-cyclone-lola-final-report-mdrvu011',
      },
      {
        label: {
          en: 'Cyclone Lola deaths caused by inaccessibility to urgent medical care \u2014 Save the Children, via Pacific Media Network (2 November 2023)',
          fr: 'Décès dus au cyclone Lola faute d’accès à des soins urgents \u2014 Save the Children, via Pacific Media Network (2 novembre 2023)',
        },
        url: 'https://pmn.co.nz/read/pacific-region/cyclone-lola-deaths-caused-by-inaccessibility-to-urgent-medical-care',
      },
      {
        label:
          {
            en: 'Cyclone Lola \u2014 Vanuatu Meteorology and Geo-hazards Department / VanKIRAP',
            fr: 'Cyclone Lola \u2014 Département de météorologie et des géorisques de Vanuatu / VanKIRAP',
          },
        url: 'https://reliefweb.int/report/vanuatu/cyclone-lola-regions-earliest-ever-category-5-cyclone-devastates-vanuatu',
      },
      {
        label: {
          en: 'Tropical Cyclone Lola \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
          fr: 'Cyclone tropical Lola \u2014 rapports de situation humanitaire, OCHA de l’ONU / ReliefWeb',
        },
        url: 'https://reliefweb.int/disaster/tc-2023-000207-vut',
      },
      {
        label: {
          en: 'Cyclone Lola batters remote Tikopia in Solomon Islands, disaster office confirms \u2014 RNZ (28 October 2023)',
          fr: 'Le cyclone Lola frappe l’île isolée de Tikopia, aux Îles Salomon, confirme l’office de gestion des catastrophes \u2014 RNZ (28 octobre 2023)',
        },
        url: 'https://www.rnz.co.nz/international/pacific-news/501115/cyclone-lola-batters-remote-tikopia-in-solomon-islands-disaster-office-confirms',
      },
      {
        label: {
          en: 'SBD$2.7 million for Cyclone Lola\u2019s emergency response in Temotu \u2014 SIBC (4 November 2023)',
          fr: '2,7 millions de SBD pour la réponse d’urgence au cyclone Lola à Temotu \u2014 SIBC (4 novembre 2023)',
        },
        url: 'https://www.sibconline.com.sb/sbd2-7-million-for-cyclone-lolas-emergency-response-in-temotu/',
      },
    ],
  },
}

// Merged by id, in roster order. The check below is not defensive politeness: a
// storm present in one half and absent from the other means the site and the
// cleaning scripts have parted company about what the roster is, and that is
// worth a hard failure at import rather than a section that quietly renders
// nothing.
const detailIds = Object.keys(STORM_DETAIL)
const rosterIds = roster.storms.map((s) => s.id)
const missingDetail = rosterIds.filter((id) => !detailIds.includes(id))
const orphanDetail = detailIds.filter((id) => !rosterIds.includes(id))

if (missingDetail.length > 0 || orphanDetail.length > 0) {
  throw new Error(
    'roster.json and storms.js disagree about the roster. ' +
      (missingDetail.length > 0 ? `No detail written for: ${missingDetail.join(', ')}. ` : '') +
      (orphanDetail.length > 0 ? `Detail with no roster entry: ${orphanDetail.join(', ')}.` : '')
  )
}

export const STORMS = roster.storms.map((entry) => ({ ...entry, ...STORM_DETAIL[entry.id] }))

// Swap in the *Fr sibling for every prose field, once, at the point a storm
// (or a single profile row) is first obtained -- see the note at the top of
// this file. English is untouched; STORMS itself is never mutated.
export function localizeStormRow(row, language = 'en') {
  if (!row || language !== 'fr') return row
  return {
    ...row,
    date: row.dateFr ?? row.date,
    categoryLabel: row.categoryLabelFr ?? row.categoryLabel,
    fact: row.factFr ?? row.fact,
    lead: row.leadFr ?? row.lead,
    deathsNote: row.deathsNoteFr ?? row.deathsNote,
  }
}

export function localizeStorm(storm, language = 'en') {
  if (!storm || language !== 'fr') return storm
  return {
    ...storm,
    note: storm.noteFr ?? storm.note,
    profile: storm.profile?.map((row) => localizeStormRow(row, language)),
  }
}

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

export const ROSTER_START = roster.rosterStart
export const ROSTER_END = roster.rosterEnd

// The full window the cleaned data covers. Wider than the roster on purpose --
// an event-year chart is meaningless without baseline years before it.
//
// Both bounds are read by ContextPanel: the max to draw its capacity snapshot
// against a year the pipeline actually exported, the min (newly re-exported
// here) to know how many possible country-years its reporting-completeness
// chart is counting out of. yearMin used to be unexported because nothing on
// this side read it; that stopped being true the moment a second chart needed
// the whole window instead of just its edge.
export const DATA_YEAR_MIN = roster.yearMin
export const DATA_YEAR_MAX = roster.yearMax

export function stormById(id) {
  return STORMS.find((s) => s.id === id) ?? null
}
