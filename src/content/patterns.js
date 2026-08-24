// Backdrops. This file is the knob: change a value here and nothing else moves.
//
// Fill with either `pattern` -- a built-in tile from BackgroundPattern.jsx
// ('ripples' | 'weave'), drawn in currentColor so it inverts with the theme --
// or `image`, your own tiling SVG from /public, plus an `imageDark` companion
// since a fixed-colour file can't invert itself.
//
// THERE WAS A THIRD TILE, 'fish', and nothing on the site was using it. The two
// left are not really alternatives: 'ripples' is the chrome tile and the weave
// is the content one. See the note on each below.
//
// `opacity` is useful between 0.04 and 0.08: above, it competes with the text
// on top of it; below, it vanishes on a phone. `scale` multiplies the tile --
// larger reads as a motif, smaller as a texture.

// The one edge-to-edge tile left on the site, and it is chrome rather than
// content: the header and the slide footer, which are the two bands a reader
// never reads *through*. Quiet, because the header already carries the
// wordmark, the nav and the canoe progress bar.
export const HEADER_BACKDROP = {
  pattern: 'ripples',
  opacity: 0.05,
  scale: 1,
}

// THE METHOD AND SOURCES SLIDES USED TO HAVE THEIR OWN, AND NO LONGER DO.
//
// There were two more exports here: a 'weave' tile for the method slide and a
// 'fish' tile for the sources slide, on the reasoning that the last two slides
// are apparatus rather than argument and deserved a texture marking the shift
// from "here is what the data says" to "here is how we know".
//
// The reasoning was sound and the result was not. Those two tiles were the only
// full-bleed fields on the site, so the last two slides did not read as a
// different register of the same piece -- they read as two slides from a
// different piece, arriving after twelve that had agreed on a common texture.
// A boundary marked by breaking the system is not marked, it is just a break.
//
// Both slides now pass scatterBackdrop() like every other section. What marks
// them as back matter is what always actually marked them: they are the ones
// that stop arguing and start showing their working.

// With your own artwork:
//   { image: '/patterns/tapa-light.svg', imageDark: '/patterns/tapa-dark.svg',
//     opacity: 0.06, scale: 1.5 }

// THE SITE'S ONE CONTENT BACKDROP, and the reason it can be. An edge-to-edge
// tile behind a chart competes with the marks, which is what kept the tiling
// motifs above to chrome only -- but 'weaveScatter' (BackgroundPattern.jsx)
// doesn't tile the section. It scatters woven shapes into the side margins and
// leaves the content column clear, the way a page margin can carry a texture a
// paragraph never could. Every section on the site passes this.
//
// `seed` is any stable string -- the slide's own id reads well and guarantees
// no two slides draw the same layout. Passing the same seed always draws the
// same shapes; change the string to reshuffle a given slide.
export function scatterBackdrop(seed, { opacity = 0.05, scale = 1 } = {}) {
  return { pattern: 'weaveScatter', seed, opacity, scale }
}
