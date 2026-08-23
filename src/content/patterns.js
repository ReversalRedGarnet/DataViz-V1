// Header and footer backdrops. This file is the knob: change a value here and
// nothing else moves.
//
// Fill with either `pattern` -- a built-in tile from BackgroundPattern.jsx
// ('ripples' | 'fish' | 'weave'), drawn in currentColor so it inverts with the
// theme -- or `image`, your own tiling SVG from /public, plus an `imageDark`
// companion since a fixed-colour file can't invert itself.
//
// `opacity` is useful between 0.04 and 0.08: above, it competes with the text
// on top of it; below, it vanishes on a phone. `scale` multiplies the tile --
// larger reads as a motif, smaller as a texture.

// Quieter than the footer's: the header already carries the wordmark, the nav
// and the canoe progress bar.
export const HEADER_BACKDROP = {
  pattern: 'ripples',
  opacity: 0.05,
  scale: 1,
}

// Stronger than the header's -- the footer is a solid block with less
// competing for attention inside it.
//
// It also does more work than it used to. The sources slide was the one panel
// on the site that inverted its own colours, which is what made it read as the
// end; now that it uses the same palette as everything else, this texture is
// what marks it. Nudged up accordingly -- 0.07 was calibrated against a black
// ground, and the same value reads fainter on panel.
export const FOOTER_BACKDROP = {
  pattern: 'fish',
  opacity: 0.09,
  scale: 1,
}

// THE BACK MATTER, and the editorial reason there is a third of these.
//
// The patterns were only ever on the chrome: the header, the slide footer and
// the sources panel. Putting them on an argument slide would compete with the
// charts, which is the one thing decoration is not allowed to do. But the last
// two slides are not argument -- they are apparatus: how the site was made, and
// where its figures came from. Giving those two a texture the analysis slides
// do not have marks the shift from "here is what the data says" to "here is how
// we know", which is a real boundary in the piece and was previously carried by
// nothing at all.
//
// Weave for the method slide: plaited strands, over and under, is the motif
// about construction. It is also the quietest of the three, which matters on a
// slide that is mostly text.
//
// To try it elsewhere, pass backdrop={...} to any Section. To take it back out,
// delete the prop -- nothing else moves.
export const METHOD_BACKDROP = {
  pattern: 'weave',
  opacity: 0.05,
  scale: 1.4,
}

// With your own artwork:
//   { image: '/patterns/tapa-light.svg', imageDark: '/patterns/tapa-dark.svg',
//     opacity: 0.06, scale: 1.5 }
