// The site's decorative weather: rings spreading from a point, drawn behind
// each section by Section.jsx.
//
// No cyclone glyph here, on purpose: the only cyclone on the site is the one on
// the storm journey map, which marks where a storm actually was. A decorative
// one in the corner of every slide would dilute it.
//
// Decoration, and treated as such throughout -- hidden from assistive
// technology, removed entirely under reduced motion, and incapable of taking a
// pointer event. Nothing here carries information, so nothing is lost when it
// is switched off.
//
// THREE THINGS KEEP IT OUT OF THE WAY, and all three are in styles/story.css
// rather than here:
//
//   - z-index: -1 puts the layer behind every word, mark and control in its
//     section, while still painting above the section's own background.
//   - pointer-events: none means it can never intercept a hover meant for a
//     chart mark, a map marker or a button.
//   - the layer clips itself with its own overflow: hidden, so a section does
//     NOT need overflow: hidden to contain the rings -- which matters, because
//     a section that clipped its overflow would also clip the tooltips that
//     sit near its edges.
//
// Props:
//   variant -- 'ambient' (the default, and what every section uses): one
//     ring, roughly a third of the opacity, on a slow cycle. 'hero' is the
//     louder version -- three rings at full strength on a faster cycle -- which
//     no section currently passes.

const VARIANTS = {
  hero: {
    // No modifier class: the hero variant is simply .atmos-layer's own
    // defaults, and the ambient variant below is what overrides them.
    className: 'atmos-layer',
    delays: ['0ms', '2600ms', '5200ms'],
  },
  // Written out in full rather than built with a template literal, and that is
  // load-bearing for this one. Tailwind drops any rule in @layer components
  // whose class it cannot find in the source, and `atmos-${variant}` is
  // invisible to that scan -- so `.atmos-ambient { --atmos-ring-peak: 0.07 }`
  // was purged while the descendant rules beside it survived, and the ambient
  // rings animated at full hero strength behind every chart on the site.
  ambient: {
    className: 'atmos-layer atmos-ambient',
    // One ring, not three. Three overlapping sweeps read as an event; behind a
    // chart, an event is the wrong thing for the background to be doing.
    delays: ['0ms'],
  },
}

export default function Atmosphere({ variant = 'ambient' }) {
  const { className: variantClass, delays } = VARIANTS[variant] ?? VARIANTS.ambient

  return (
    <div aria-hidden="true" className={variantClass}>
      {delays.map((animationDelay) => (
        <span key={animationDelay} className="atmos-ring" style={{ animationDelay }} />
      ))}
    </div>
  )
}
