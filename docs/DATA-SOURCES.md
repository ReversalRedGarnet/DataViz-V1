# Data corrections and their sources

Every correction made to the storm facts in `src/content/storms.js`, with the source each one rests on, grouped by storm. Everything here is taken from the commit messages in this repository's history; nothing has been re-researched for this page. Each entry names its commit, so `git show <hash>` shows the exact change.

Quotes are copied word for word from the commit messages, including the sources' own typos (marked [sic]). Where a commit message wrapped a quote across lines, it is joined onto one line here. Distances described as "my calculation" were worked out by the commit's author from the best-track positions; they are not part of the source.

These are corrections to the per-storm text. The year-by-year charts come from the Pacific Data Hub series listed in the README and in `src/utils/metrics.js`.

## Contents

- [Cyclone Pam (2015)](#cyclone-pam-2015)
- [Cyclone Winston (2016)](#cyclone-winston-2016)
- [Cyclone Gita (2018)](#cyclone-gita-2018)
- [Cyclone Harold (2020)](#cyclone-harold-2020)
- [Cyclones Judy & Kevin (2023)](#cyclones-judy--kevin-2023)
- [Cyclone Lola (2023)](#cyclone-lola-2023)

---

## Cyclone Pam (2015)

### Solomon Islands: Category 4 at closest approach, not 1 — `5d0b37f`, 2026-10-15

The stop was labelled "Category 1 while intensifying". RSMC Nadi's best track has Pam at Category 4 (90 kt, 10-minute mean) at its closest pass to Temotu, about 20 km from Anuta, and at Category 4 at its closest to Tikopia. It was Category 1 only on 9 March, while still well north of Temotu. English and French.

- **IBTrACS v04r01, RSMC Nadi columns, storm 2015066S08170**
  <https://ncics.org/ibtracs/index.php?name=v04r01-2015066S08170>
  <https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.SP.list.v04r01.csv>
  > SID,ISO_TIME,LAT,LON,NADI_CAT,NADI_WIND,NADI_PRES
  > "2015066S08170,2015-03-11 15:00:00,-11.5,170.0,4,90,946" (20 km from Anuta)
  > "2015066S08170,2015-03-11 21:00:00,-12.3,170.1,4,95,941" (138 km from Tikopia, its closest)

  Distances are haversine from the 3-hourly fixes (my calculation).

### Solomon Islands: dated 12 March 2015 — `5cbdaa5`, 2026-10-15

"10–11 March 2015" became "12 March 2015". The closest pass, 15:00 UTC on 11 March, is 02:00 on 12 March in Solomon Islands (UTC+11); the closest pass to Tikopia, 21:00 UTC, is 08:00 on 12 March. English and French.

- **IBTrACS v04r01, RSMC Nadi columns, storm 2015066S08170**
  <https://ncics.org/ibtracs/index.php?name=v04r01-2015066S08170>
  > "2015066S08170,2015-03-11 15:00:00,-11.5,170.0,4,90,946"
  > "2015066S08170,2015-03-11 21:00:00,-12.3,170.1,4,95,941"

### Solomon Islands: garden crops "damaged", not "lost" — `93c071b`, 2026-10-15

"More than half of garden crops were lost" became "damaged". English and French.

- **IFRC, Pacific: Tropical Cyclone Pam international appeal MDR55001, operations update 2 (15 May 2015)**
  <https://reliefweb.int/report/vanuatu/pacific-tropical-cyclone-pam-international-appeal-n-mdr55001-operations-update-n-2>
  > "More than 50 per cent of garden crops were damaged"

### Citations added — `1a09258`, 2026-10-15

- **IFRC MDR55001 operations update 2 (15 May 2015)**, for the crops and the houses and Malaita figures the stop already states
  <https://reliefweb.int/report/vanuatu/pacific-tropical-cyclone-pam-international-appeal-n-mdr55001-operations-update-n-2>
  > "In Temotu Province a total of 83 of the 260 houses were damaged in Utupua, Vanikoro Anuta, Tikopia, Duff and Reef Islands."
  > "Assessments conducted with the National Disaster Management Office (NDMO) report that 2,344 families or 11,780 people require support across the 19 wards in Malaita Province."
- **RSMC Nadi best track, IBTrACS 2015066S08170**, for the category and date
  <https://ncics.org/ibtracs/index.php?name=v04r01-2015066S08170>
  > "2015066S08170,2015-03-11 15:00:00,-11.5,170.0,4,90,946"

### Solomon Islands: "Nearly two days before it reached Vanuatu" — `bf0d6e7`, 2026-10-16

With the stop dated 12 March, "Two days before" read as one day against Vanuatu's 13 March. By the best track the gap is 45 hours: closest pass to the Solomon Islands at 15:00 UTC on 11 March, closest pass to Efate at 12:00 UTC on 13 March. English and French.

- **IBTrACS v04r01, RSMC Nadi columns, storm 2015066S08170**
  <https://ncics.org/ibtracs/index.php?name=v04r01-2015066S08170>
  > SID,ISO_TIME,LAT,LON,NADI_CAT,NADI_WIND,NADI_PRES
  > "2015066S08170,2015-03-11 15:00:00,-11.5,170.0,4,90,946"
  > "2015066S08170,2015-03-13 12:00:00,-17.6,168.7,5,135,899"

---

## Cyclone Winston (2016)

### Fiji: removed the unsourced "deadliest storm on record" — `830410f`, 2026-10-15

The lead opened "Fiji's deadliest storm on record"; no cited source states it, the PDNA included. It now opens with the confirmed toll: "Forty-four deaths" (English), "44 morts" (French).

- **Government of Fiji, Post-Disaster Needs Assessment, Tropical Cyclone Winston (May 2016)**
  <https://reliefweb.int/report/fiji/fiji-post-disaster-needs-assessment-may-2016-tropical-cyclone-winston-february-20-2016>
  > "44 fatalities were subsequently confirmed."

### Tonga: house counts dated; Fiji: "one of the most powerful" — `754840d`, 2026-10-15

- Tonga: "Ten houses destroyed and about 200 damaged in Vava'u" became "in Tonga, as of 19 February". The Vava'u rain damage and hospital details follow as their own sentence.
  - **ECHO Daily Flash, 19 February 2016**
    <https://reliefweb.int/report/tonga/tonga-fiji-tropical-cyclone-winston-gdacs-jtwc-nasa-vanuatu-met-services-fiji-met>
    > "In Tonga, local media reported approx. 2 500 people inside the evacuations centres, 10 houses destroyed and another 200 damaged, as of early 19 February."
  - **Radio & TV Tonga News, via PINA, 17 February 2016**
    <https://reliefweb.int/report/tonga/more-100-families-vavau-and-haapai-evacuated-tonga-s-agriculture-sector-suffers-major>
    > "In Vava'u, over 80 percent of homes were partially damaged from the heavy rain."
    > "Nine patients had to be transferred to another wing at the hospital due to floods."
- Fiji: "the most intense on record in the Southern Hemisphere" became "one of the most powerful cyclones ever recorded in the Southern Hemisphere".
  - **Government of Fiji PDNA (May 2016)**
    <https://reliefweb.int/report/fiji/fiji-post-disaster-needs-assessment-may-2016-tropical-cyclone-winston-february-20-2016>
    > "making Winston one of the most powerful cyclones ever recorded in the Southern Hemisphere."

English and French.

### Citations added — `17f2b3e`, 2026-10-15

The ECHO Daily Flash (19 February 2016) and Radio & TV Tonga News via PINA (17 February 2016), with the URLs and quotes above.

### Fiji: "both Category 5 and the roster's deadliest" — `0e51dac`, 2026-10-16

"The only stop on this roster where the death toll matches the category" never said what "matches" meant; Pam, Vanuatu (Category 5, 11 deaths) could be read as a match too. The lead now says "the only stop that is both Category 5 and the roster's deadliest" (French: "la seule étape de la liste à être à la fois de catégorie 5 et la plus meurtrière"). Checked against every roster stop: the Category 5 stops are Pam, Vanuatu (11 deaths), Winston, Fiji (44) and Harold, Vanuatu (2); the largest toll is Winston, Fiji (44), next Harold, Solomon Islands (27, Category 1).

- **Government of Fiji, PDNA, Tropical Cyclone Winston (May 2016)**
  <https://reliefweb.int/report/fiji/fiji-post-disaster-needs-assessment-may-2016-tropical-cyclone-winston-february-20-2016>
  > "TC Winston was the first Category 5 cyclone to directly impact Fiji"
  > "44 fatalities were subsequently confirmed."

---

## Cyclone Gita (2018)

### Tonga: one death, not two; Fiji: gusts as the FMS measured them — `941fdc3`, 2026-10-15

- Tonga: deaths 2 → 1, and the lead "killed two people" → "killed one person". The code comment saying the count "settled at 2 in later reporting" was removed; no source for 2 was found.
  - **UNICEF, Pacific Islands Cyclone Gita Humanitarian Situation Report #2, 16 February 2018**
    <https://reliefweb.int/report/tonga/pacific-islands-cyclone-gita-humanitarian-situation-report-2-16-february-2018>
    > "There are reports of one fatality with some people reportedly sustaining injuries."
  - **Matangi Tonga, 14 February 2018**
    <https://matangitonga.to/2018/02/14/one-death-3-seriously-injured-tongatapu-tc-gita>
    > "The death toll is at one from severe Tropical Cyclone Gita on the night of Monday February 12"
  - **International Charter Space and Major Disasters, activation 566**
    <https://disasterscharter.org/web/guest/activations/-/article/cyclone-in-tonga-activation-566->
    > "causing one fatalitly and injuring 33" [sic]
- Fiji: "gusts to 190 km/h" → "gusts of 84 knots (about 155 km/h) at Ono-i-Lau". 84 kt is 155.6 km/h.
  - **Fiji Meteorological Service, Media Release No. 35, 13 February 2018**
    <https://reliefweb.int/report/fiji/fiji-meteorological-services-severe-tc-gita-cat4-passes-just-south-ono-5pm-13-february>
    > "Hurricane force winds of 68 knots and maximum momentary gusts of 84 knots were recorded at Ono-i-lau at 2pm this afternoon"

English and French.

### Fiji: removed the unsourced pre-storm evacuation — `e17fb6b`, 2026-10-15

Removed: "The entire population of Ono-i-Lau, about 470 people, had been moved into evacuation centres before the storm arrived.", and the lead's "because everyone had already moved". No source was found for either: only a search-engine summary, and the FBC article it pointed to returns 404. "No injuries reported" stays:

- **ECHO Daily Flash, 14 February 2018**
  <https://reliefweb.int/report/fiji/fiji-tonga-niue-american-samoa-samoa-tropical-cyclone-gita-update-gdacs-jtwc-meteo-0>
  > "In Fiji, no casualties or injuries have been reported."

English and French.

### Fiji: "three buildings", not "three homes" — `efbc04d`, 2026-10-15

"Three homes destroyed" became "three buildings destroyed". English and French.

- **ECHO Daily Flash, 14 February 2018**
  <https://reliefweb.int/report/fiji/fiji-tonga-niue-american-samoa-samoa-tropical-cyclone-gita-update-gdacs-jtwc-meteo-0>
  > "Three buildings have been completely destroyed and four have been partially damaged in Ono-I-Lau island."

### Citations added — `30ce622`, 2026-10-15

UNICEF Humanitarian Situation Report #2 (16 February 2018), Matangi Tonga (14 February 2018), the International Charter activation 566, FMS Media Release No. 35 (13 February 2018) and the ECHO Daily Flash (14 February 2018), with the URLs and quotes above.

### Fiji: lead says Category 4, as at Tonga, not "stronger" — `4e40abd`, 2026-10-16

The lead opened "A stronger storm than the one that hit Tonga". At the two stops it was not: RSMC Nadi's best track gives 105 kt at both closest approaches, and FMS classed it Category 4 as it passed Ono-i-Lau. It peaked at Category 5 only later, south of Kadavu. The lead now reads "Still Category 4 — 105 knots at closest approach, the same as Tonga — and nobody was hurt." English and French.

- **Fiji Meteorological Service, Media Release No. 35, 13 February 2018**
  <https://reliefweb.int/report/fiji/fiji-meteorological-services-severe-tc-gita-cat4-passes-just-south-ono-5pm-13-february>
  > "Severe TC Gita (Category 4) entered Fiji Waters this morning and passed just south of Ono-i-lau at around 1.30pm this afternoon."
- **IBTrACS v04r01, RSMC Nadi columns, storm 2018038S15172**
  <https://ncics.org/ibtracs/index.php?name=v04r01-2018038S15172>
  > SID,ISO_TIME,LAT,LON,NADI_CAT,NADI_WIND,NADI_PRES
  > "2018038S15172,2018-02-12 12:00:00,-21.3,184.4,-1,105,933" (closest to Tongatapu)
  > "2018038S15172,2018-02-13 03:00:00,-21.1,180.9,-1,105,930" (closest to Ono-i-Lau)

  NADI_CAT is blank (-1) for Gita in this file; 105 kt is Category 4 on the Australian scale (86–107 kt).

---

## Cyclone Harold (2020)

### Vanuatu: three days after the Solomon Islands, not four — `c1ff458`, 2026-10-15

The Vanuatu stop said "Four days later", but the profile's own dates are 3 April (Solomon Islands) and 6 April (Vanuatu landfall). The commit records that BoM's Harold history confirms both: landfall on Espiritu Santo at 18Z on 5 April is 6 April local time. English and French. (No quote is recorded in this commit; the BoM history is the stop's cited source, linked below.)

### Fiji: removed the untraced Sigatoka rainfall — `63af642`, 2026-10-15

Removed: "103mm of rain recorded at Sigatoka in a single day". It is not in BoM's Harold history (the stop's cited source), the Pacific Humanitarian Team sitreps 6, 7 and 9, UNICEF or ECHO, and it was added with no source recorded. What BoM does say:

- **Australian Bureau of Meteorology, Severe Tropical Cyclone Harold**
  <https://www.bom.gov.au/cyclone/history/Harold.shtml>
  > "Heavy rainfall and flooding affected several communities across Fiji."
  > "One death and 26 injuries were recorded across Fiji, with 1919 buildings damaged."

English and French.

### Tonga: the 428 houses separated from the surge — `03a656a`, 2026-10-15

"428 homes damaged or destroyed by flooding and storm surge, without a direct hit." became two sentences. No source puts all 428 down to surge and flooding. English and French.

- **Pacific Humanitarian Team, TC Harold Situation Report #6, 13 April 2020**
  <https://reliefweb.int/report/vanuatu/pacific-humanitarian-team-tropical-cyclone-harold-situation-report-6-13-april-2020>
  > "An estimated 428 houses have been damaged or destroyed."
- **ECHO Daily Flash, 14 April 2020**
  <https://reliefweb.int/report/vanuatu/pacific-islands-tropical-cyclone-harold-dg-echo-unicef-echo-daily-flash-14-april-2020>
  > "Storm/sea surge combined with high tide inundated coastal areas in Tongatapu, ‘Eua and Ha’apai."
- **Australian Bureau of Meteorology, Severe Tropical Cyclone Harold**
  <https://www.bom.gov.au/cyclone/history/Harold.shtml>
  > "The centre of Harold passed to the south of Tongatapu in Tonga early on 9 April, still at category 4 strength."

### Citations added — `b9426e4`, 2026-10-15

The Pacific Humanitarian Team Situation Report #6 (13 April 2020) and the ECHO Daily Flash (14 April 2020), with the URLs and quotes above.

### BoM citation linked over https — `85dc8eb`, 2026-10-15

The BoM Harold history citation used http://, which BoM redirects to the https address; the citation now points at <https://www.bom.gov.au/cyclone/history/Harold.shtml> directly.

### Tonga: "no dip in its annual crop, livestock or power figures" — `7a887c4`, 2026-10-16

"The shortest recovery of the four" had no measure behind it: the site computes no recovery time, and on its own annual series Tonga shows no dip to recover from (nor does Solomon Islands), while its tourist arrivals fell furthest. The lead now states what the figures show. English and French.

- **The site's own Pacific Data Hub series, `public/data/*.json` (Tonga, 2019 → 2020 → 2021)**
  - crop yield: 7136 → 7195.5 → 7262.4
    <https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.CROP_YIELD.&pd=,&to[TIME_PERIOD]=false>
  - livestock yield: 1072.6 → 1081.6 → 1085.4 (no source URL recorded in `utils/metrics.js` for this series)
  - power index: 72.6 → 74.7 → 76.6
    <https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.POWER_GEN.&pd=,&to[TIME_PERIOD]=false>
  - for comparison, tourist arrivals: 94000 → 11500 → 200 (pandemic border closure)

---

## Cyclones Judy & Kevin (2023)

### Solomon Islands: reach time ten days, not twelve — `6f62201`, 2026-10-15

The stop dates Judy's crossing to 27 February 2023, the day FMS named it, and the commit records that assessment teams reached the islands on 9 March: ten days, not twelve. English and French. (No source is quoted in this commit. It was superseded the same day by `35fd02e`, below: 9 March was the patrol boat's departure, and Tikopia was reached on 13 March.)

### Solomon Islands: Tikopia reached on 13 March; Vanuatu: no per-island landfall split — `35fd02e`, 2026-10-15

- Solomon Islands: "Reaching them took until 9 March, when a patrol boat carried assessment teams and relief from Lata." became: the team, carried by patrol boat via Lata, reached Tikopia on 13 March, 14 days after the storm. The lead's "ten days" became "14 days". 9 March was the boat's departure from Honiara.
  - **Government of Solomon Islands, 10 March 2023**
    <https://reliefweb.int/report/solomon-islands/ndc-and-n-doc-deploys-assessment-team-support-temotu-p-doc>
    > "A statement from the National Emergency Operation Center (NEOC) confirmed that the Royal Solomon Islands Patrol Vessel (RSIPV)Taro will depart this evening at 1900hrs Friday 9/03/2023 for Lata then to Anuta and Tikopia."
  - **Government of Solomon Islands, 20 March 2023**
    <https://reliefweb.int/report/solomon-islands/multi-sectoral-assessment-tikopia-and-anuta-completed>
    > "Upon arrival in Tikopia on Monday 13th March, the team with the assistance of the Temotu Provincial Government led by the Provincial Premier made a courtesy call with the chiefs of Tikopia"
- Vanuatu: removed "Judy on Efate and Tanna, Kevin on Erromango". The label now says only that both made landfall, on 1 and 3 March, at Category 4, and that Judy made landfall on Efate.
  - **UN OCHA, Situation Report No. 1, 10 March 2023**
    <https://reliefweb.int/report/vanuatu/vanuatu-tropical-cyclones-judy-kevin-situation-report-no1-10-march-2023>
    > "Tropical cyclones JUDY and KEVIN (both of Cat4 intensity) made landfall over Vanuatu on the 1st and 3rd March."
  - **Government of Vanuatu, PDNA, TCs Judy and Kevin (ReliefWeb copy)**
    <https://reliefweb.int/report/vanuatu/vanuatu-tropical-cyclones-judy-and-kevin-post-disaster-needs-assessment-22-june-2023>
    > "Tropical Cyclone Judy (TC Judy) struck the archipelago of Vanuatu on 01 March 2023, making landfall on Efate Island, where the capital city of Port Vila is located."
  - Why the split went: RSMC Nadi's best track (IBTrACS) has both storms passing both southern islands at Category 4 (haversine distances are my calculation).
    > "2023055S14184,2023-03-01 03:00:00,-18.7,168.8,4,98" (Judy, 33 km from Erromango)
    > "2023055S14184,2023-03-01 06:00:00,-19.3,169.2,4,100" (Judy, 27 km from Tanna)
    > "2023059S15149,2023-03-03 15:00:00,-19.1,169.3,4,98" (Kevin, 39 km from Erromango, 47 km from Tanna)

English and French.

### Solomon Islands: "passed close to" Temotu; Vanuatu: the 90% credited to NDMO via OCHA — `78d5587`, 2026-10-15

- Solomon Islands fact, category label and lead: "crossed", "tracked over" and "first landfall" became "passed close to"; French "a traversé" became "est passé près des", and "premier atterrissage" became "d'abord passé près des". In the best track Judy's nearest fixes are 81 km from Anuta and 91 km from Tikopia (haversine, my calculation).
  - **IBTrACS v04r01, RSMC Nadi columns, storm 2023055S14184**
    <https://ncics.org/ibtracs/index.php?name=v04r01-2023055S14184>
    > "2023055S14184,2023-02-27 03:00:00,-12.3,170.1,1,43"
    > "2023055S14184,2023-02-27 12:00:00,-12.9,169.4,1,45"
- Vanuatu: the lead's "nine tenths of the housing in two provinces gone" became "destroyed or severely damaged", and the fact credits the 90% to NDMO via OCHA rather than leaving it to read as the PDNA's.
  - **UN OCHA, Situation Report No. 4, 22 March 2023**
    <https://reliefweb.int/report/vanuatu/vanuatu-tropical-cyclone-judy-and-tropical-cyclone-kevin-situation-report-no-4-22-march-2023>
    > "NDMO estimates that 90% of houses in those provinces are destroyed or severely damaged (22,191 households- 110,956 people)."

### Citations added — `c8effde`, 2026-10-15

- **UN OCHA, Situation Report No. 4, 22 March 2023** — URL and quote above.
- **Government of Solomon Islands, 10 March 2023**
  <https://reliefweb.int/report/solomon-islands/ndc-and-n-doc-deploys-assessment-team-support-temotu-p-doc>
  > "communities in the two most remote islands of Temotu province were the most affected during Tropical Cyclone Judy and Kevin."
- **Government of Solomon Islands, 20 March 2023** — URL and quote above.
- **RSMC Nadi best track, IBTrACS 2023055S14184** — URL and quote above.

---

## Cyclone Lola (2023)

### Vanuatu: NDMO's one direct death, with a note on other counts — `d40e411`, 2026-10-15

Deaths 2 → 1, with a note (English and French) that this is NDMO's count of deaths directly attributable to the cyclone, and that other agencies report up to four.

- **NDMO NEOC Situation Report 13, TC Lola, 13 November 2023**
  <https://reliefweb.int/report/vanuatu/vanuatu-national-disaster-management-office-neoc-situation-report-13-tc-lola-13-november-2023>
  > "There have been 4 Emergency Medical Teams (EMTs) deployed from Vila and Santo with 1 confirmed death and 31 injuries directly attributable to the Cylcone" [sic]
- Upper end of the other counts: **Save the Children via Pacific Media Network, 2 November 2023**
  <https://pmn.co.nz/read/pacific-region/cyclone-lola-deaths-caused-by-inaccessibility-to-urgent-medical-care>
  > "as of yesterday, the official death toll is four."

### Vanuatu: Category 4 at landfall, with a Category 5 ten-minute peak of 215 km/h — `3101f3f`, 2026-10-15

The landfall stays "Category 4". The 205 km/h landfall wind and the 230 km/h peak are removed, and the peak is stated as Category 5 with ten-minute mean winds of 215 km/h, as RSMC Nadi gives it. The best track's knots are not converted into a landfall speed. English and French.

- **Fiji Meteorological Service (RSMC Nadi), Report on Severe Tropical Cyclone Lola 19th–26th October 2023**
  <https://www.met.gov.fj/media/tropical_cyclone_files/TC_Lola_October_2023TC_Report2024.02.26_10.56.23.pdf>
  > Narrative, p. 5: "the FMS estimated Lola's peak intensity with ten-minute sustained winds of 215 km/hr, designating it as a Category 5 severe tropical cyclone"
  > Appendix, Post Event Best Track (mean wind / gust / category), over Pentecost: "24/1200 ... 100 / 140 / Cat 4", "24/1500 ... 95 / 135 / Cat 4", "24/1800 ... 90 / 125 / Cat 4"

### Vanuatu: about 91,000 people affected, NDMO's figure — `6585dc0`, 2026-10-15

110,750 people affected became about 91,000. 110,750 was OCHA's early estimate; 91,000 is NDMO's figure, as cited by OCHA and by the IFRC final report. English and French.

- **UN OCHA, Vanuatu: Tropical Cyclone Lola — internationally deployed assets (2 November 2023)**
  <https://reliefweb.int/report/vanuatu/vanuatu-tropical-cyclone-lola-internationally-deployed-assets-2-november-2023>
  > "NDMO estimates that some 91,000 people were affected (around 21,000 household) in these provinces."
- **IFRC, Vanuatu, Asia Pacific: Tropical Cyclone Lola — Final Report (MDRVU011), published 15 April 2025**
  <https://reliefweb.int/report/vanuatu/vanuatu-asia-pacific-tropical-cyclone-lola-final-report-mdrvu011>
  > "However, as more detailed assessments became available, the figure was revised to 91,000 people directly impacted."

### Vanuatu: Malampa houses and the three destroyed schools — `f807e16`, 2026-10-15

The untraced "some 10,000 homes damaged, and over 100 schools hit, 70 of them destroyed or needing major repair" (no source recorded) was replaced with NDMO's own figures: 220 houses destroyed and 492 significantly damaged in Malampa (Vanuatu Red Cross data, via NDMO), and three schools completely destroyed. English and French.

- **NDMO NEOC Situation Report 13, TC Lola, 13 November 2023**
  <https://reliefweb.int/report/vanuatu/vanuatu-national-disaster-management-office-neoc-situation-report-13-tc-lola-13-november-2023>
- **NDMO NEOC Situation Report 14, TC Lola, 15 November 2023**
  <https://reliefweb.int/report/vanuatu/vanuatu-national-disaster-management-office-neoc-situation-report-14-tc-lola-15-november-2023>
  > Both, Malampa section: "220 houses have been completely destroyed, with 492 houses significantly damaged according to the latest assessment data (Vanuatu Red Cross)"
  > Both, Education: "Ranon, Ranvetlam and Makam Schools have been completely destroyed, with alternate arrangements for education required while reconstruction commences."

### Citations added — `a1c04b7`, 2026-10-15

One citation per figure the Vanuatu stop states: NDMO NEOC Situation Reports 13 and 14, the FMS (RSMC Nadi) report, the UN OCHA internationally deployed assets update, the IFRC final report MDRVU011, and Save the Children via Pacific Media Network — with the URLs and quotes above. VanKIRAP (the season-opening date) and the OCHA disaster page (the Solomon Islands stop) were kept.

### Solomon Islands: removed the untraced water-supply cause — `319089d`, 2026-10-15

- The deaths note's "after the storm damaged water supplies", and the lead's "out of the water supply". The deaths stay, as an outbreak of dysentery and diarrhoea; the report gives no cause.
  - **SIBC, 4 November 2023**
    <https://www.sibconline.com.sb/sbd2-7-million-for-cyclone-lolas-emergency-response-in-temotu/>
    > "Meanwhile, there are 4 confirmed deaths in Vanikoro as a result of diarrhoea and dysentery infections. Health officials have recently declared a dysentery outbreak at Vanikoro"
- The fact's "and desalination plants". NDMO, via RNZ, reports water damage but no desalination plants. (This removal was reversed in `ea7a8ca`, below.)
  - **RNZ, 28 October 2023**
    <https://www.rnz.co.nz/international/pacific-news/501115/cyclone-lola-batters-remote-tikopia-in-solomon-islands-disaster-office-confirms>
    > "The water source has also sustained damages, the NDMO confirmed."
    > "the NDMO said solar panels and water system is also damaged."

English and French.

### Solomon Islands: deaths "reported nearly two weeks later" — `87dca83`, 2026-10-15

The lead's "the deaths came weeks later" became "the deaths were reported nearly two weeks later". Landfall was 22 October (UTC); SIBC reported the deaths on 4 November. English and French.

- **UN OCHA, Asia and the Pacific weekly snapshot, 24–30 October 2023**
  <https://reliefweb.int/report/vanuatu/asia-and-pacific-weekly-regional-humanitarian-snapshot-24-30-october-2023>
  > "On the 22nd of October, Tropical Cyclone LOLA made landfall in Solomon Islands, first striking Tikopia Island as a Category 3 cyclone"
- **SIBC, 4 November 2023**
  <https://www.sibconline.com.sb/sbd2-7-million-for-cyclone-lolas-emergency-response-in-temotu/>
  > "there are 4 confirmed deaths in Vanikoro as a result of diarrhoea and dysentery infections"

### Citations added — `b4c822f`, 2026-10-15

- **RNZ, 28 October 2023**
  <https://www.rnz.co.nz/international/pacific-news/501115/cyclone-lola-batters-remote-tikopia-in-solomon-islands-disaster-office-confirms>
  > "116 houses, 114 kitchens and one church have been destroyed and four people, including a child, have been injured. The water source has also sustained damages, the NDMO confirmed."
- **SIBC, 4 November 2023** — URL and quote above.

### Solomon Islands: "nearly two weeks after landfall" — `a5aedeb`, 2026-10-16

"Weeks after landfall" became "nearly two weeks after landfall", matching the lead (English, French and the code comment). Landfall was 22 October (UTC); SIBC reported the deaths on 4 November, 13 days later.

- **UN OCHA, Asia and the Pacific weekly snapshot, 24–30 October 2023**
  <https://reliefweb.int/report/vanuatu/asia-and-pacific-weekly-regional-humanitarian-snapshot-24-30-october-2023>
  > "On the 22nd of October, Tropical Cyclone LOLA made landfall in Solomon Islands, first striking Tikopia Island as a Category 3 cyclone"
- **SIBC, 4 November 2023**
  <https://www.sibconline.com.sb/sbd2-7-million-for-cyclone-lolas-emergency-response-in-temotu/>
  > "Meanwhile, there are 4 confirmed deaths in Vanikoro as a result of diarrhoea and dysentery infections."

### Solomon Islands: Vanikoro deaths "reported, not attributed" — `4d9ac1a`, 2026-10-16

`deaths: 4` and the hollow marker stay. The note called them "Indirect deaths", but none of the sources found attribute them to the cyclone; it now says so, and that UNICEF reported them alongside Lola's damage in Temotu. Adds the UNICEF report as a citation. English and French.

- **SIBC, 4 November 2023**: reports the deaths on its own authority, after quoting NDMO, and NDMO's list of affected islands omits Vanikoro
  <https://www.sibconline.com.sb/sbd2-7-million-for-cyclone-lolas-emergency-response-in-temotu/>
  > "Meanwhile, there are 4 confirmed deaths in Vanikoro as a result of diarrhoea and dysentery infections."
  > "The affected islands with a total population of approximately 2,504, showing significant damage include Anuta, Tikopia, Niupani, Nukapu, Nifiloli, Pileni, Matema and Duff Islands,"
- **UNICEF, Vanuatu Humanitarian Situation Report No. 2, 10 November 2023, p. 3**
  <https://reliefweb.int/report/vanuatu/unicef-vanuatu-humanitarian-situation-report-no-2-cyclone-lola-10-november-2023>
  > "Extensive damage to desalination plants and food crops underscores the urgency to prioritise health, nutrition, and WASH supplies, especially in areas where outbreaks of diarrhoea and dysentery have reportedly claimed four lives on the island of Vanikoro."
- **UN OCHA, 24–30 October 2023 snapshot**: covers the Solomon Islands stop without mentioning Vanikoro or an outbreak; no Ministry of Health statement was found.
  <https://reliefweb.int/report/vanuatu/asia-and-pacific-weekly-regional-humanitarian-snapshot-24-30-october-2023>

### Solomon Islands: desalination plants restored, across Temotu — `ea7a8ca`, 2026-10-16

`319089d` removed "desalination plants" as untraced. That was wrong: UNICEF reports it, in its paragraph on the Solomon Islands. The sentence does not name an island, so it returns as "desalination plants damaged across Temotu (UNICEF)" rather than on Tikopia. English and French.

- **UNICEF, Vanuatu Humanitarian Situation Report No. 2, 10 November 2023, p. 3**
  <https://reliefweb.int/report/vanuatu/unicef-vanuatu-humanitarian-situation-report-no-2-cyclone-lola-10-november-2023>
  > The paragraph opens: "Tropical Cyclone Lola has not only affected Vanuatu but also impacted the Solomon Islands, specifically in the Temotu province."
  > and continues: "Extensive damage to desalination plants and food crops underscores the urgency to prioritise health, nutrition, and WASH supplies, especially in areas where outbreaks of diarrhoea and dysentery have reportedly claimed four lives on the island of Vanikoro."

### "Not attributed" in place of "indirect" on the chart, table, journey and tooltip — `c02373e`, 2026-10-16

A wording change with no new source: the labels now match the Vanikoro note above (`4d9ac1a`, which quotes SIBC and UNICEF). The chart note, table, journey stop and tooltip say "not attributed" / "non attribués". The hollow marker is unchanged.
