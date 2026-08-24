import Section from './Section.jsx'

// The site's one hero pattern, shared by every page. Hero.jsx is this with
// any one storm's copy hardcoded.
//
// Props:
//   kicker -- short uppercase framing line above the headline
//   headline -- the page's one real <h1>
//   body -- lead paragraph(s); a string or any React node
//   className -- forwarded to Section, appended to the centring class. The
//     interactive hero uses it to become a positioned, clipping box for the
//     atmosphere it draws behind itself.
//   children -- anything the page wants under the lead paragraph: Hero.jsx puts
//     its nation nodes, its storm dots and its call to action here. Passed as
//     children rather than as more named props because what goes there is one
//     page's composition, not a shape every hero shares.
//   style -- forwarded to Section
//   backdrop -- forwarded to Section; see content/patterns.js
//   wash -- an optional background layer, rendered behind everything this
//     component draws. A node rather than a flag, because what goes back there
//     is one page's composition: the cyclones hero passes <HeroWash />, which
//     draws the roster's storm tracks over the region's coastline. A hero that
//     passes nothing is unchanged.
// THREE PROPS WENT WITH THE CLEANUP, and all three were unreachable. `cta` was
// never passed. `headlineClassName` was never passed either, and its comment
// pointed at a Home.jsx this repository does not contain. The eyebrow branched
// on an 'ink' background that Section had already stopped offering, so it could
// only ever take the one path.
export default function PageHero({
  kicker,
  headline,
  body,
  className = '',
  atmosphere,
  backdrop,
  wash,
  children,
  style,
}) {
  return (
    <Section
      atmosphere={atmosphere}
      backdrop={backdrop}
      className={`text-center ${className}`}
      style={style}
    >
      {/* A background layer, and therefore NOT part of `children`. Children are
          rendered after the lead paragraph and so paint above it; this has to
          paint below everything. It is a sibling of .section-content for the
          same reason the atmosphere and the backdrop are -- see Section.jsx --
          and it takes its own z-index rather than relying on source order
          against them. */}
      {wash}
      <p className="type-eyebrow mx-auto max-w-2xl text-accent">{kicker}</p>
      <h1 className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-semibold tracking-tight md:text-5xl">
        {headline}
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg opacity-80">{body}</p>
      {children}
    </Section>
  )
}
