import PageHero from './PageHero.jsx'
import { ROSTER_START, ROSTER_END } from '../content/storms.js'

// The opening claim is a count, not a trend. Every figure in the headline is
// plain event-counting against the roster rule in content/storms.js, so a
// reader who doubts it can check it against the exclusions section rather than
// having to trust a confidence level.
//
// `body` is passed as an expression, not a quoted attribute. A JSX attribute
// written as "..." is a literal string, not a JS string, so \u escapes inside
// one are never processed -- they rendered on the live site as the raw text
// \u2014 in the middle of a sentence.
//
// The body used to carry the roster justification -- why these four nations,
// why the same-storm test -- and a list of the factors that shape a recovery.
// Both are gone. The justification is now made once, on the timeline, directly
// above the roster it justifies; the factors are what the charts are for. A
// reader told that population and infrastructure matter before seeing a single
// figure has been asked to accept the conclusion on the way in.
export default function Hero({ style }) {
  return (
    <PageHero
      kicker={`${ROSTER_START}\u2013${ROSTER_END} \u00b7 Six severe cyclones \u00b7 Four Pacific nations`}
      headline={`Between ${ROSTER_START} and ${ROSTER_END}, each of these four nations was struck three or four times. No two recovered the same way.`}
      body={
        'Solomon Islands, Vanuatu, Fiji and Tonga share an ocean and a cyclone ' +
        'season. They do not share what a cyclone leaves behind. Six severe ' +
        'storms, followed through the official record \u2014 the harvest, the ' +
        'power supply, the visitors afterwards \u2014 asking why the same ' +
        'weather produces such different aftermaths.'
      }
      cta="Pick a storm from the timeline below."
      style={style}
    />
  )
}
