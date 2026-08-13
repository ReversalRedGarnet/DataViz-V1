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
export const FOOTER_BACKDROP = {
  pattern: 'fish',
  opacity: 0.07,
  scale: 1,
}

// With your own artwork:
//   { image: '/patterns/tapa-light.svg', imageDark: '/patterns/tapa-dark.svg',
//     opacity: 0.06, scale: 1.5 }
