import Section from './Section.jsx'

// The title card's layout: eyebrow, the one <h1>, a lead paragraph, and
// whatever goes under it. Hero.jsx is its only caller and supplies the words,
// the nation nodes and the storm dots; this file only arranges them.
//
// Props:
//   kicker -- short uppercase framing line above the headline
//   headline -- the page's one real <h1>
//   body -- lead paragraph(s); a string or any React node
//   className -- forwarded to Section, appended to the centring class. The
//     interactive hero uses it to become a positioned, clipping box for the
//     atmosphere it draws behind itself.
//   children -- anything to show under the lead paragraph: Hero.jsx puts its
//     nation nodes, its storm dots and its call to action here. Passed as
//     children rather than as more named props because what goes there is
//     one slide's composition.
//   backdrop -- forwarded to Section; see content/patterns.js
export default function PageHero({
  kicker,
  headline,
  body,
  className = '',
  backdrop,
  children,
}) {
  return (
    <Section
      backdrop={backdrop}
      className={`text-center ${className}`}
    >
      <p className="type-eyebrow mx-auto max-w-2xl text-accent">{kicker}</p>
      <h1 className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-semibold tracking-tight md:text-5xl">
        {headline}
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg opacity-80">{body}</p>
      {children}
    </Section>
  )
}
