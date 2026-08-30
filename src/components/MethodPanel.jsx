import Section from './Section.jsx'
import { EXCLUDED, STORMS, ROSTER_START, ROSTER_END, localizeExcluded } from '../content/storms.js'
import { NATION_COUNT } from '../content/nations.js'
import { numberWord, numberWordCapitalized } from '../utils/numberWords.js'
import { scatterBackdrop } from '../content/patterns.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

// How the site was made, and what it cannot say -- rewritten as a plain
// methodology note rather than a styled continuation of the slides before it.
//
// THIRD VERSION OF THIS SLIDE. The first was six flat, same-weight sections
// with the site's own tech stack sitting between two sections about whether
// the data could be trusted. The second grouped those six into three acts
// with type-h3 headings and unified every list to one of two card styles.
// Testers still flagged it after that pass, and the actual complaint was
// simpler than either fix addressed: opacity-muted body text and card/border
// chrome are the visual language of the *data* slides, borrowed here for a
// page that isn't showing data, it's documenting method -- so however
// internally consistent this page became, it still read as an attempt to be
// a slide rather than what it actually is, which is closer to an appendix.
//
// So this version stops trying. Plain sections, full-contrast prose
// (text-ink, not opacity-70/75/80), no card chrome, no coloured dividers, one
// hairline rule between sections doing the only visual separation a plain
// document needs. The eyebrow reads "Appendix" rather than restating the
// title, because a reader who has just scrolled through thirteen slides of
// argument should be able to tell from the label alone that the register is
// changing on purpose.
//
// WHAT GOT COMPRESSED, ON PURPOSE. The per-nation language table collapsed to
// one sentence: the person building this site wants to make that argument in
// person at submission rather than spend a paragraph on it here. The
// "what's not here yet" roadmap folded into one clause inside Limitations
// rather than keeping its own section -- sub-national and recovery-time data
// being limited is a fact about this analysis; a fuller roadmap of planned
// work is a fact about the project, and belonged less on a page about what
// the data can and cannot say.
//
// WHAT DID NOT GET COMPRESSED. Every checkable specific survived the two
// passes before this one for the same reason each time: a caveat that just
// says "the sources disagree" is a disclaimer a reader has to take on trust;
// one that says 69% and 62% is a fact they can go and test themselves. Vanuatu's
// 2015 zero, Winston's two shares, the sea level record's 0.1 m floor, and
// Yasa's cost to the roster's own case are all still here, in prose instead of
// in cards.
const STRINGS = {
  en: {
    appendix: 'Appendix',
    title: 'Method, Data and Limitations',
    methodHeading: 'Method',
    methodP1: (nationWord, rosterStart, rosterEnd, stormWord, excludedWord, yasaName, yasaYear, yasaCost) => (
      <>
        The analysis covers severe tropical cyclones affecting at least two of these {nationWord}{' '}
        nations: Solomon Islands, Vanuatu, Fiji and Tonga, between {rosterStart} and {rosterEnd}. The
        resulting roster contains {stormWord} storms. {excludedWord}{' '}
        additional storms did not meet that bar: Cyclones Ana (2021) and Cody (2022) affected Fiji
        alone, and Cyclone Rae (2022) did not reach severe intensity. The exclusion that costs the
        analysis something is {yasaName} ({yasaYear}) — {yasaCost} It is excluded anyway, because
        the rule was fixed before the roster was drawn. Storm dates, classifications and reported
        deaths were verified against national meteorological services and UN OCHA sources.
      </>
    ),
    methodP2:
      'Indicator data for 2013\u20132024 comes from the Pacific Data Hub and is filtered to the four countries and selected years using Python and pandas. The 2013 baseline provides context for changes occurring during the storm period.',
    limitationsHeading: 'Limitations',
    limP1:
      'The indicator data is primarily reported as annual national totals rather than storm-specific measurements. This means individual cyclone impacts cannot always be isolated from other events occurring in the same year \u2014 the 2020\u201321 figures, for instance, also carry the effect of the pandemic alongside any storm.',
    limP2:
      "A reported figure of zero is not necessarily the same as no impact. In the people-affected series, an exact zero is treated as unreported rather than as evidence that nobody was affected, since the two cannot be distinguished. Vanuatu\u2019s official figure for 2015 \u2014 the year Cyclone Pam became the most destructive storm in its history \u2014 is zero.",
    limP3:
      'Data coverage also varies by country and indicator. Tourist arrivals, for instance, are not reported for Solomon Islands at all, and no disaster figures are reported after 2022. Economic-loss records are patchy throughout, and sub-national and recovery-time data are also limited, preventing more detailed comparisons of individual islands and post-storm recovery.',
    limP4:
      "Some figures use different population or assessment bases depending on their source. A regional snapshot divides reported totals by population estimates, while individual storm figures come from government and PDNA assessments measured against their own base; for Cyclone Winston the two approaches give roughly 69% and 62% of Fiji\u2019s population respectively. These values are retained as reported rather than combined into a single estimate.",
    limP5:
      'Sea level rise, the best-attributed of the three climate mechanisms behind these storms, is reported only to the nearest 0.1\u00A0metre \u2014 three distinct values across twelve years. It is described in this analysis rather than charted, since charting it would imply a precision the underlying measurement does not have.',
    limP6:
      'This site and every source it draws on are written in English, which is not the first language of most of the people being counted.',
    techHeading: 'Technical Implementation',
    techP1:
      'The interface is built with React 18 and Vite, with Tailwind CSS and PostCSS for styling. Charts and maps are rendered directly with D3, using TopoJSON and Natural Earth data for geographic features.',
    techP2:
      'The data pipeline uses Python and pandas and runs offline. Cleaned datasets are exported as static JSON and bundled with the site, so the deployed application does not depend on live API requests.',
    techP3: 'All source material and data-processing scripts are included in the project repository.',
    ackHeading: 'Acknowledgements',
    ackP1:
      'Special thanks to Eljevisima Gani, Terah Maitoo Manenau, and Cynthia Oatasia for their creative input; to Gregory Malaii, Gabriel Salini, and Aleetza Mahli for helping test the site; and to Marama Taura for helping finalize the French translations.',
  },
  fr: {
    appendix: 'Annexe',
    title: 'Méthode, données et limites',
    methodHeading: 'Méthode',
    methodP1: (nationWord, rosterStart, rosterEnd, stormWord, excludedWord, yasaName, yasaYear, yasaCost) => (
      <>
        L’analyse porte sur les cyclones tropicaux sévères ayant touché au moins deux de ces{' '}
        {nationWord} nations : Îles Salomon, Vanuatu, Fidji et Tonga, entre {rosterStart} et{' '}
        {rosterEnd}. La liste qui en résulte compte {stormWord} cyclones. {excludedWord} cyclones
        supplémentaires n’ont pas atteint ce seuil : les cyclones Ana (2021) et Cody (2022)
        n’ont touché que Fidji, et le cyclone Rae (2022) n’a pas atteint une intensité sévère.
        L’exclusion qui coûte le plus à l’analyse est {yasaName} ({yasaYear}) — {yasaCost}{' '}
        Il est tout de même exclu, car la règle avait été fixée avant l’établissement de la liste.
        Les dates, classifications et décès recensés des cyclones ont été vérifiés auprès des services
        météorologiques nationaux et de l’OCHA de l’ONU.
      </>
    ),
    methodP2:
      'Les données d\u2019indicateurs pour 2013\u20132024 proviennent du Pacific Data Hub et sont filtrées sur les quatre pays et les années retenues à l\u2019aide de Python et pandas. L\u2019année de référence 2013 donne un contexte aux évolutions survenues pendant la période des cyclones.',
    limitationsHeading: 'Limites',
    limP1:
      'Les données d\u2019indicateurs sont principalement déclarées sous forme de totaux nationaux annuels plutôt que de mesures propres à un cyclone. Cela signifie que l\u2019impact d\u2019un cyclone donné ne peut pas toujours être isolé d\u2019autres événements survenus la même année \u2014 les chiffres de 2020\u20132021, par exemple, portent aussi l\u2019effet de la pandémie en plus de tout cyclone.',
    limP2:
      "Un chiffre déclaré de zéro n\u2019équivaut pas nécessairement à une absence d\u2019impact. Dans la série des personnes touchées, un zéro exact est considéré comme non déclaré plutôt que comme la preuve que personne n\u2019a été touché, les deux ne pouvant être distingués. Le chiffre officiel de Vanuatu pour 2015 \u2014 l\u2019année où le cyclone Pam est devenu le plus destructeur de son histoire \u2014 est de zéro.",
    limP3:
      'La couverture des données varie aussi selon le pays et l\u2019indicateur. Les arrivées touristiques, par exemple, ne sont pas du tout déclarées pour les Îles Salomon, et aucun chiffre de catastrophe n\u2019est déclaré après 2022. Les données de pertes économiques sont lacunaires dans l\u2019ensemble, et les données infranationales et sur le temps de redressement sont également limitées, ce qui empêche des comparaisons plus fines entre îles ou sur le redressement après cyclone.',
    limP4:
      "Certains chiffres utilisent des bases de population ou d\u2019évaluation différentes selon leur source. Un aperçu régional divise les totaux déclarés par des estimations de population, tandis que les chiffres propres à un cyclone proviennent d\u2019évaluations gouvernementales et PDNA mesurées sur leur propre base\u00A0; pour le cyclone Winston, les deux approches donnent environ 69\u00A0% et 62\u00A0% de la population de Fidji respectivement. Ces valeurs sont conservées telles que déclarées plutôt que combinées en une seule estimation.",
    limP5:
      'L\u2019élévation du niveau de la mer, le mieux établi des trois mécanismes climatiques derrière ces cyclones, n\u2019est rapportée qu\u2019au 0,1\u00A0mètre près \u2014 trois valeurs distinctes sur douze ans. Elle est décrite dans cette analyse plutôt que représentée graphiquement, car la représenter graphiquement laisserait entendre une précision que la mesure sous-jacente n\u2019a pas.',
    limP6:
      "Ce site et chacune de ses sources sont rédigés en anglais, qui n\u2019est pas la langue maternelle de la plupart des personnes comptabilisées.",
    techHeading: 'Mise en œuvre technique',
    techP1:
      'L\u2019interface est construite avec React 18 et Vite, avec Tailwind CSS et PostCSS pour le style. Les graphiques et les cartes sont directement générés avec D3, en utilisant les données TopoJSON et Natural Earth pour les éléments géographiques.',
    techP2:
      'Le pipeline de données utilise Python et pandas et fonctionne hors ligne. Les jeux de données nettoyés sont exportés en JSON statique et intégrés au site, de sorte que l\u2019application déployée ne dépend d\u2019aucune requête API en direct.',
    techP3:
      'Tout le matériel source et les scripts de traitement des données sont inclus dans le dépôt du projet.',
    ackHeading: 'Remerciements',
    ackP1:
      'Merci en particulier à Eljevisima Gani, Terah Maitoo Manenau et Cynthia Oatasia pour leur contribution créative\u00A0; à Gregory Malaii, Gabriel Salini et Aleetza Mahli pour avoir aidé à tester le site\u00A0; et à Marama Taura pour son aide à la finalisation des traductions françaises.',
  },
}

export default function MethodPanel({ style }) {
  const { language } = useLanguage()
  const t = STRINGS[language]
  // The one exclusion with a `cost` field is the one whose absence weakens
  // the roster's own case (see EXCLUDED in content/storms.js). Read from
  // there rather than retyped here, so this sentence cannot drift from the
  // reasoning it is quoting. localizeExcluded swaps in the French reason/cost
  // once, here, the same convention localizeStorm uses in App.jsx.
  const yasa = localizeExcluded(EXCLUDED.find((storm) => storm.cost), language)

  return (
    // The same scatter every other slide carries, seeded with this slide's own
    // id -- kept even though the content inside is now deliberately plainer,
    // so this page still reads as part of the same site at a glance rather
    // than a pasted-in document.
    <Section backdrop={scatterBackdrop('method')} style={style}>
      <p className="type-eyebrow mb-1 text-accent">{t.appendix}</p>
      <h2 className="type-h2 mb-6">{t.title}</h2>

      <div className="space-y-8">
        <div>
          <h3 className="type-h3 mb-2">{t.methodHeading}</h3>
          <div className="prose-column prose-wide space-y-3 text-sm text-ink">
            <p>
              {t.methodP1(
                numberWord(NATION_COUNT, { language, gender: 'f' }),
                ROSTER_START,
                ROSTER_END,
                numberWord(STORMS.length, { language, gender: 'm' }),
                numberWordCapitalized(EXCLUDED.length, { language, gender: 'm' }),
                yasa.name,
                yasa.year,
                yasa.cost
              )}
            </p>
            <p>{t.methodP2}</p>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-8">
          <h3 className="type-h3 mb-2">{t.limitationsHeading}</h3>
          <div className="prose-column prose-wide space-y-3 text-sm text-ink">
            <p>{t.limP1}</p>
            <p>{t.limP2}</p>
            <p>{t.limP3}</p>
            <p>{t.limP4}</p>
            <p>{t.limP5}</p>
            <p>{t.limP6}</p>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-8">
          <h3 className="type-h3 mb-2">{t.techHeading}</h3>
          <div className="prose-column prose-wide space-y-3 text-sm text-ink">
            <p>{t.techP1}</p>
            <p>{t.techP2}</p>
            <p>{t.techP3}</p>
          </div>
        </div>

        {/* Shortest section on the slide, and deliberately so. It is the only
            one here that is not about what the data can or cannot say, so
            giving it the weight of Method or Limitations would misread the
            page. Same plain register as everything above it -- prose rather
            than a list, because four names in a bulleted list would take more
            vertical space than the thanks are asking for. */}
        <div className="border-t border-ink/10 pt-8">
          <h3 className="type-h3 mb-2">{t.ackHeading}</h3>
          <div className="prose-column prose-wide space-y-3 text-sm text-ink">
            <p>{t.ackP1}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
