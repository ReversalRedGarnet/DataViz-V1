import roster from './roster.json'

// THE STORM ROSTER'S PROSE HALF.
//
// THE RULE: a severe tropical cyclone that made landfall or had major impact in
// two or more of the four in-scope nations, between ROSTER_START and ROSTER_END.
//
// Applied evenly, which is the whole point. A roster picked for the story it
// tells is not evidence of anything; a roster picked by a stated rule can be
// checked by a reader who disagrees with it. That is why EXCLUDED below is
// rendered on the page rather than kept in a comment -- the storms the rule
// throws out are what make the ones it keeps mean something.
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
// itself is precisely what the exclusions section exists to rule out, so this
// fails the build rather than the reader.
//
// Each entry in STORM_DETAIL is keyed by its id in roster.json:
//   note -- optional, printed under the storm's name where the entry needs a
//     qualification the reader would otherwise have to take on trust
//   profile -- per-nation storm facts, hand-researched from BOM cyclone
//     histories and UN OCHA situation reports. Null until researched. A storm
//     without a profile still gets a full ripple chain; it just doesn't get the
//     journey and category-versus-deaths sections, which have nothing to draw.
//   sources -- the two supplementary citations for that storm's profile
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
        date: '10\u201311 March 2015',
        dateFr: '10\u201311 mars 2015',
        category: 1,
        categoryLabel: 'Category 1 while intensifying; passed offshore, no landfall',
        categoryLabelFr: "Catégorie 1 en cours d'intensification ; passé au large, sans atterrissage",
        deaths: null,
        deathsNote:
          'IFRC, OCHA and government response documents record affected populations and damage for Solomon Islands but publish no separate fatality figure. Not zero \u2014 never reported.',
        deathsNoteFr:
          "Les documents de réponse de la FICR, de l'OCHA et du gouvernement recensent les populations touchées et les dégâts pour les Îles Salomon, mais ne publient aucun bilan distinct de décès. Pas zéro \u2014 jamais déclaré.",
        dodge: 0,
        fact: "Storm surge, swells and heavy rain struck Temotu and Malaita provinces while Pam was still intensifying offshore. 83 of 260 houses were damaged across Temotu's outer islands; more than half of garden crops were lost, and NDMO assessments found 2,344 families \u2014 11,780 people needing support across 19 wards of Malaita Province.",
        factFr:
          "Une onde de tempête, une forte houle et de fortes pluies ont frappé les provinces de Temotu et de Malaita alors que Pam s'intensifiait encore au large. 83 des 260 maisons ont été endommagées sur les îles périphériques de Temotu\u00A0; plus de la moitié des cultures vivrières ont été perdues, et les évaluations du NDMO ont recensé 2\u00A0344 familles \u2014 11\u00A0780 personnes ayant besoin d'aide dans 19 circonscriptions de la province de Malaita.",
        lead: 'Two days before it reached Vanuatu, Pam was already flooding coastlines it never made landfall on.',
        leadFr: "Deux jours avant d'atteindre Vanuatu, Pam inondait déjà des côtes sur lesquelles il n'a jamais touché terre.",
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
        fact: "Ten houses destroyed and about 200 damaged in Vava'u, with over 80% of homes sustaining some rain damage and flash flooding forcing nine patients to be moved inside Prince Ngu hospital. Deputy Prime Minister Siaosi Sovaleni told Parliament no lives were lost anywhere in Tonga.",
        factFr:
          "Dix maisons détruites et environ 200 endommagées à Vava'u, plus de 80\u00A0% des habitations ayant subi des dégâts liés à la pluie, et des inondations soudaines ayant forcé le déplacement de neuf patients à l'intérieur de l'hôpital Prince Ngu. Le vice-Premier ministre Siaosi Sovaleni a déclaré au Parlement qu'aucune vie n'avait été perdue nulle part à Tonga.",
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
        fact: "Average winds of 233 km/h with gusts to 306 km/h \u2014 the strongest landfalling cyclone in Fiji's records and the most intense on record in the Southern Hemisphere. 540,400 people affected, 62% of the population, over 30,000 buildings damaged or destroyed, and 88 of 214 health facilities damaged.",
        factFr:
          "Vents moyens de 233 km/h avec des rafales à 306 km/h \u2014 le cyclone le plus fort à avoir touché terre dans les annales de Fidji et le plus intense jamais enregistré dans l'hémisphère Sud. 540\u00A0400 personnes touchées, soit 62\u00A0% de la population, plus de 30\u00A0000 bâtiments endommagés ou détruits, et 88 des 214 établissements de santé endommagés.",
        lead: "Fiji's deadliest storm on record, and the only stop on this roster where the death toll matches the category.",
        leadFr:
          "Le cyclone le plus meurtrier jamais enregistré à Fidji, et la seule étape de cette liste où le bilan humain correspond à la catégorie.",
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
        // Reported as 1 in the first OCHA/ECHO flashes and settled at 2 in later
        // reporting; the final figure is used.
        deaths: 2,
        dodge: -0.35,
        fact: "Average winds of 130 km/h crossing Tongatapu and 'Eua \u2014 the strongest cyclone to hit those islands since Isaac in 1982. The 100-year-old Parliament House was flattened. NEMO recorded 4,708 houses damaged or destroyed and about 4,500 people in evacuation centres; damage reached US$164 million, 37.8% of GDP.",
        factFr:
          "Vents moyens de 130 km/h traversant Tongatapu et 'Eua \u2014 le cyclone le plus fort à avoir touché ces îles depuis Isaac en 1982. Le Parlement, vieux de 100 ans, a été rasé. Le NEMO a recensé 4\u00A0708 maisons endommagées ou détruites et environ 4\u00A0500 personnes dans des centres d'évacuation\u00A0; les dégâts ont atteint 164 millions de dollars US, soit 37,8\u00A0% du PIB.",
        lead: 'The strongest storm to cross Tongatapu in 36 years killed two people.',
        leadFr: 'Le cyclone le plus fort à traverser Tongatapu en 36 ans a fait deux morts.',
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
        fact: '1,579 people affected in the southern Lau group, with Ono-i-Lau and Vatoa worst hit \u2014 three homes destroyed, gusts to 190 km/h, no injuries reported. The entire population of Ono-i-Lau, about 470 people, had been moved into evacuation centres before the storm arrived.',
        factFr:
          "1\u00A0579 personnes touchées dans le sud du groupe des Lau, Ono-i-Lau et Vatoa étant les plus durement touchées \u2014 trois maisons détruites, rafales à 190 km/h, aucun blessé signalé. L'ensemble de la population d'Ono-i-Lau, environ 470 personnes, avait été déplacée vers des centres d'évacuation avant l'arrivée du cyclone.",
        lead: 'A stronger storm than the one that hit Tonga, and nobody was hurt, because everyone had already moved.',
        leadFr: "Un cyclone plus fort que celui qui a frappé Tonga, et personne n'a été blessé, parce que tout le monde s'était déjà déplacé.",
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
        lead: 'Four days later, the same system made landfall at full strength.',
        leadFr: 'Quatre jours plus tard, le même système a touché terre à pleine puissance.',
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
        fact: '1,919 buildings damaged; 103mm of rain recorded at Sigatoka in a single day.',
        factFr: '1\u00A0919 bâtiments endommagés\u00A0; 103\u00A0mm de pluie enregistrés à Sigatoka en une seule journée.',
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
        fact: '428 homes damaged or destroyed by flooding and storm surge, without a direct hit.',
        factFr: "428 habitations endommagées ou détruites par les inondations et l'onde de tempête, sans impact direct.",
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
        url: 'http://www.bom.gov.au/cyclone/history/Harold.shtml',
      },
      {
        label: {
          en: 'Tropical Cyclone Harold \u2014 humanitarian situation reports, UN OCHA / ReliefWeb',
          fr: 'Cyclone tropical Harold \u2014 rapports de situation humanitaire, OCHA de l’ONU / ReliefWeb',
        },
        url: 'https://reliefweb.int/disaster/tc-2020-000049-vut',
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
          'Category 1 (Judy tracked over the southern islands; Kevin followed offshore \u2014 no landfall)',
        categoryLabelFr:
          'Catégorie 1 (Judy a traversé les îles du sud\u00A0; Kevin a suivi au large \u2014 sans atterrissage)',
        deaths: null,
        deathsNote:
          'The Solomon Islands NDMO and National Emergency Operation Centre published response plans and assessment deployments but no fatality figure. Not zero \u2014 never reported.',
        deathsNoteFr:
          "Le NDMO des Îles Salomon et le Centre national des opérations d'urgence ont publié des plans de réponse et des déploiements d'évaluation, mais aucun bilan de décès. Pas zéro \u2014 jamais déclaré.",
        dodge: 0,
        fact: "Judy crossed the small islands of southern Temotu Province as a Category 1 system on the day it was named. Tikopia and Anuta, the province's two most remote islands, were assessed as worst affected, with damage to fruit trees and other livelihood sources. Reaching them took until 9 March, when a patrol boat carried assessment teams and relief from Lata.",
        factFr:
          "Judy a traversé les petites îles du sud de la province de Temotu en tant que système de catégorie 1 le jour même où il a été nommé. Tikopia et Anuta, les deux îles les plus isolées de la province, ont été évaluées comme les plus touchées, avec des dégâts aux arbres fruitiers et à d'autres sources de subsistance. Il a fallu attendre le 9 mars pour les atteindre, quand un patrouilleur a transporté les équipes d'évaluation et l'aide depuis Lata.",
        lead: "The storm's first landfall was on the islands it would take twelve days to reach.",
        leadFr: "Le premier atterrissage du cyclone a eu lieu sur les îles qu'il faudrait douze jours pour atteindre.",
      },
      {
        name: 'Vanuatu',
        date: '1 and 3 March 2023 (Judy, then Kevin)',
        dateFr: '1er et 3 mars 2023 (Judy, puis Kevin)',
        category: 4,
        categoryLabel:
          'Category 4 at both landfalls \u2014 Judy on Efate and Tanna, Kevin on Erromango (combined entry for two cyclones)',
        categoryLabelFr:
          'Catégorie 4 aux deux atterrissages \u2014 Judy sur Efate et Tanna, Kevin sur Erromango (entrée combinée pour deux cyclones)',
        // A stated zero, not an absent one: the government's own PDNA records
        // no casualties in terms. The most load-bearing zero on the roster.
        deaths: 0,
        dodge: 0,
        fact: 'Combined figures for both cyclones. The Government of Vanuatu\u2019s Post-Disaster Needs Assessment reports no casualties. 197,388 people (43,623 households) were assessed as affected, around 66% of the population, with roughly 90% of houses in Shefa and Tafea destroyed or severely damaged. A separate figure of 251,346 circulates and measures something else \u2014 people exposed to Category 2\u20133 winds, not people assessed as affected. Two earthquakes, magnitudes 6.5 and 5.4, struck off Espiritu Santo on 3 March in the middle of it.',
        factFr:
          "Chiffres combinés pour les deux cyclones. L'évaluation des besoins post-catastrophe du gouvernement de Vanuatu ne recense aucune victime. 197\u00A0388 personnes (43\u00A0623 foyers) ont été évaluées comme touchées, soit environ 66\u00A0% de la population, avec environ 90\u00A0% des maisons de Shefa et Tafea détruites ou gravement endommagées. Un autre chiffre de 251\u00A0346 circule et mesure autre chose \u2014 les personnes exposées à des vents de catégorie 2 à 3, non les personnes évaluées comme touchées. Deux séismes, de magnitude 6,5 et 5,4, ont frappé au large d'Espiritu Santo le 3 mars, en plein milieu de l'épisode.",
        lead: 'Two Category 4 landfalls in 48 hours, nine tenths of the housing in two provinces gone, and not one person killed.',
        leadFr:
          "Deux atterrissages de catégorie 4 en 48 heures, neuf dixièmes des habitations de deux provinces disparues, et pas une seule personne tuée.",
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
        // These four are INDIRECT -- a post-storm disease outbreak, weeks
        // later. Harold's 27 are direct drownings. Plotting the two on one axis
        // without saying so claims an equivalence the sources do not support.
        deathsKind: 'indirect',
        deathsNote:
          'Indirect deaths: a dysentery and diarrhoea outbreak on Vanikoro declared by health officials after the storm damaged water supplies, weeks after landfall. Not deaths during the cyclone itself.',
        deathsNoteFr:
          "Décès indirects\u00A0: une épidémie de dysenterie et de diarrhée sur Vanikoro, déclarée par les autorités sanitaires après que le cyclone a endommagé les points d'eau, des semaines après l'atterrissage. Pas des décès survenus pendant le cyclone lui-même.",
        dodge: 0,
        fact: '116 houses, 114 kitchens and one church destroyed on Tikopia, with water sources and desalination plants damaged and four people injured. Around 22,319 people were exposed across Temotu.',
        factFr:
          "116 maisons, 114 cuisines et une église détruites à Tikopia, avec des points d'eau et des installations de dessalement endommagés et quatre personnes blessées. Environ 22\u00A0319 personnes ont été exposées dans l'ensemble de Temotu.",
        lead: 'Lola made landfall here first, and the deaths came weeks later, out of the water supply.',
        leadFr: "Lola a d'abord touché terre ici, et les décès sont survenus des semaines plus tard, à cause de l'approvisionnement en eau.",
      },
      {
        name: 'Vanuatu',
        date: '25 October 2023',
        dateFr: '25 octobre 2023',
        category: 4,
        categoryLabel: 'Category 4 at landfall on Maewo and Pentecost; had peaked at Category 5 on 24 October',
        categoryLabelFr: "Catégorie 4 à l'atterrissage sur Maewo et Pentecost\u00A0; avait culminé en catégorie 5 le 24 octobre",
        deaths: 2,
        dodge: 0,
        fact: 'Landfall on the eastern shores of Maewo and Pentecost with winds of 205 km/h, after peaking at Category 5 with 230 km/h \u2014 the earliest Category 5 cyclone ever recorded in the Southern Hemisphere, a week before Vanuatu\u2019s cyclone season officially opened. Around 110,750 people affected across five provinces, some 10,000 homes damaged, and over 100 schools hit, 70 of them destroyed or needing major repair.',
        factFr:
          "Atterrissage sur les côtes orientales de Maewo et Pentecost avec des vents de 205 km/h, après avoir culminé en catégorie 5 à 230 km/h \u2014 le cyclone de catégorie 5 le plus précoce jamais enregistré dans l'hémisphère Sud, une semaine avant l'ouverture officielle de la saison cyclonique de Vanuatu. Environ 110\u00A0750 personnes touchées dans cinq provinces, quelque 10\u00A0000 habitations endommagées, et plus de 100 écoles touchées, dont 70 détruites ou nécessitant des réparations majeures.",
        lead: 'The third severe cyclone to hit Vanuatu in eight months arrived before the season had started.',
        leadFr: "Le troisième cyclone sévère à frapper Vanuatu en huit mois est arrivé avant même le début de la saison.",
      },
    ],
    sources: [
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

// Storms the rule throws out. Shown on the page, because a roster is only
// defensible if the near-misses are visible: a reader who suspects the list was
// picked to suit the argument can check these and see that at least one
// exclusion cost the argument something.
//
// `reason`/`cost` carry *Fr siblings, same convention as STORM_DETAIL above;
// localizeExcluded() resolves them.
export const EXCLUDED = [
  {
    name: 'Cyclone Yasa',
    year: 2020,
    reason: 'Severe, but within these four nations it struck Fiji alone.',
    reasonFr: "Sévère, mais parmi ces quatre nations, il n'a touché que Fidji.",
    cost: 'Excluding it weakens the case: a second severe cyclone in 2020 would have made that year look far worse. The rule is applied anyway, or it is not a rule.',
    costFr:
      "L'exclure affaiblit la démonstration\u00A0: un second cyclone sévère en 2020 aurait rendu cette année bien pire en apparence. La règle est appliquée malgré tout, sans quoi ce n'en serait pas une.",
  },
  {
    name: 'Cyclone Ana',
    year: 2021,
    reason: 'Fiji only.',
    reasonFr: 'Fidji uniquement.',
  },
  {
    name: 'Cyclone Cody',
    year: 2022,
    reason: 'Fiji only.',
    reasonFr: 'Fidji uniquement.',
  },
  {
    name: 'Cyclone Rae',
    year: 2022,
    reason: 'Did not reach severe intensity, and caused no reported deaths.',
    reasonFr: "N'a pas atteint une intensité sévère, et n'a causé aucun décès signalé.",
  },
]

export function localizeExcluded(entry, language = 'en') {
  if (!entry || language !== 'fr') return entry
  return {
    ...entry,
    reason: entry.reasonFr ?? entry.reason,
    cost: entry.costFr ?? entry.cost,
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
