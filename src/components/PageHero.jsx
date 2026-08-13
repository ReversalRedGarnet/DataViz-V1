import Section from './Section.jsx'

// The site's one hero pattern, shared by every page. Hero.jsx is this with
// any one storm's copy hardcoded.
//
// Props:
//   kicker -- short uppercase framing line above the headline
//   headline -- the page's one real <h1>
//   body -- lead paragraph(s); a string or any React node
//   cta -- optional closing line; omitted entirely when not passed
//   tone -- forwarded to Section, default 'panel'.
//   headlineClassName -- replaces the default h1 sizing when passed;
//     Home.jsx uses this for a bigger display size.
//   style -- forwarded to Section
export default function PageHero({
  kicker,
  headline,
  body,
  cta,
  tone = 'panel',
  headlineClassName,
  style,
}) {
  return (
    <Section tone={tone} className="text-center" style={style}>
      <p
        className={`mx-auto max-w-2xl text-xs font-semibold uppercase tracking-[0.16em] md:text-sm ${
          tone === 'ink' ? 'opacity-70' : 'text-accent'
        }`}
      >
        {kicker}
      </p>
      <h1
        className={`mx-auto mt-4 max-w-3xl font-serif ${
          headlineClassName ?? 'text-3xl font-semibold tracking-tight md:text-5xl'
        }`}
      >
        {headline}
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg opacity-80">{body}</p>
      {cta && <p className="mx-auto mt-4 max-w-2xl text-lg font-medium opacity-80">{cta}</p>}
    </Section>
  )
}
