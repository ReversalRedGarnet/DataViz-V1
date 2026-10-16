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
// One ring, not several: overlapping sweeps read as an event, and behind a
// chart an event is the wrong thing for the background to be doing. How
// strong and how slow it is lives in styles/story.css (.atmos-ring).
//
// No props. Section.jsx renders it unless a slide passes atmosphere={false}.
export default function Atmosphere() {
  return (
    <div aria-hidden="true" className="atmos-layer">
      <span className="atmos-ring" />
    </div>
  )
}
