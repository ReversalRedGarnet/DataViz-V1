// The site's decorative weather: rings spreading from a point. Extracted from
// Hero.jsx, where it was a local HeroAtmosphere that only the title card could
// use.
//
// THERE WAS A SLOW-SPINNING CYCLONE GLYPH HERE TOO, in the top-right corner of
// every section. It is gone. The one cyclone left on the site is the glyph on
// the storm journey map, which marks where a storm actually was -- a decorative
// second one in the corner of every slide only diluted it.
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
//   variant -- 'hero' is the title card's original weather, unchanged.
//     'ambient' is the quieter version every other section gets: one ring
//     instead of three, roughly a third of the opacity, and a slower cycle.
//   className -- extra classes on the layer, if a caller needs to reposition it

const VARIANTS = {
  hero: {
    // No modifier class: the hero IS .atmos-layer's own defaults, and the
    // ambient variant below is what overrides them. There was an `atmos-hero`
    // here that no stylesheet ever matched.
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

export default function Atmosphere({ variant = 'ambient', className = '' }) {
  const { className: variantClass, delays } = VARIANTS[variant] ?? VARIANTS.ambient

  return (
    <div aria-hidden="true" className={`${variantClass} ${className}`}>
      {delays.map((animationDelay) => (
        <span key={animationDelay} className="atmos-ring" style={{ animationDelay }} />
      ))}
    </div>
  )
}
