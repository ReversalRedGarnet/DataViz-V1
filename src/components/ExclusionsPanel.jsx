import Section from './Section.jsx'
import { EXCLUDED, ROSTER_START, ROSTER_END } from '../content/storms.js'

// What the rule threw out.
//
// This section exists because a roster nobody can check is not evidence. Any
// list of six storms can be made to support almost any claim if the chooser is
// free to stop choosing once the pattern looks right. The defence against that
// is not to promise it didn't happen -- it is to publish the rule, publish what
// the rule discarded, and let a sceptical reader run it themselves.
//
// Yasa is deliberately first and given more room than the rest. It is the
// exclusion that costs the argument something, and an exclusions list that only
// contains convenient omissions would be doing the same selective work it
// claims to prevent.
export default function ExclusionsPanel({ style }) {
  return (
    <Section tone="panel" style={style}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        The storms not on this page
      </p>
      <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
        What the rule left out
      </h2>
      <div className="prose-column mb-6 max-w-prose space-y-3 text-sm opacity-80">
        <p>
          The roster is every severe tropical cyclone that struck two or more of these four nations
          between {ROSTER_START} and {ROSTER_END}. Six storms met it. These four did not, and they
          are listed here so the rule can be checked rather than taken on trust.
        </p>
        <p>
          A list of storms chosen after the fact can be made to support almost any claim. The only
          real defence is to fix the rule first, apply it evenly, and show what it discarded &mdash;
          including the discards that made the argument weaker.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {EXCLUDED.map((storm) => (
          <li
            key={storm.name}
            className={`rounded-xl border border-ink/10 bg-surface/60 p-5 ${
              storm.cost ? 'sm:col-span-2' : ''
            }`}
          >
            <p className="font-serif text-lg font-semibold tracking-tight">
              {storm.name}{' '}
              <span className="font-sans text-sm font-normal tabular-nums opacity-60">
                {storm.year}
              </span>
            </p>
            <p className="mt-1.5 text-sm opacity-80">{storm.reason}</p>
            {storm.cost && (
              <p className="mt-2 border-l-2 border-accent/50 pl-3 text-sm italic opacity-80">
                {storm.cost}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-prose text-xs italic opacity-70">
        Fiji appears three times in this list. That is not a judgement about Fiji &mdash; it is what
        a two-nation threshold does to a country large enough and placed such that storms reach it
        alone. A different threshold would produce a different roster, which is exactly why the one
        used here is stated rather than assumed.
      </p>
    </Section>
  )
}
