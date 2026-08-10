import PageHero from './PageHero.jsx'
import { ROSTER_START, ROSTER_END } from '../content/storms.js'

// The opening claim is a count, not a trend. Every figure in the headline is
// plain event-counting against the roster rule in content/storms.js, so a
// reader who doubts it can check it against the exclusions section rather than
// having to trust a confidence level.
export default function Hero({ style }) {
  return (
    <PageHero
      kicker={`${ROSTER_START}\u2013${ROSTER_END} \u00b7 Six severe cyclones \u00b7 Four Pacific nations`}
      headline={`Between ${ROSTER_START} and ${ROSTER_END}, each of these four nations was struck three or four times. No two recovered the same way.`}
      body="Solomon Islands, Vanuatu, Fiji and Tonga share an ocean and a cyclone season. They do not share what a cyclone leaves behind. Differences in population, geography, infrastructure, economic resilience and emergency preparedness shape how each country absorbs a storm and how long it takes to come back. This data story follows six severe cyclones through the official record \u2014 who was hit, what happened to the harvest, the power supply and the visitors afterwards \u2014 and asks why the same weather produces such different aftermaths."
      cta="Start with the timeline below, then pick a storm to follow."
      style={style}
    />
  )
}
