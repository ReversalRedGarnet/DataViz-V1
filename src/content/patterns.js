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
// paragraph never could.
//
// EVERY SECTION PASSES THIS, AND THE TITLE CARD USED TO BE THE EXCEPTION.
// The hero was held out because it has nothing in its margins to be beside --
// no chart, no table, just a headline on an open field -- and because on an
// early version the shapes drifted under the lead paragraph.
//
// That was true when it was written and stopped being true when the scatter
// learned to keep out of the way. COLUMN_LEFT/COLUMN_RIGHT in
// BackgroundPattern.jsx clear the reading column by a fragment's whole reach
// rather than just its centre, so on the hero at 1440px not one of the eight
// pieces touches the headline's box. The exception outlived its reason, and
// the hero now takes the same weave and the same ambient atmosphere as every
// other slide. See the note in components/Hero.jsx.
//
// `seed` is any stable string -- the slide's own id reads well and guarantees
// no two slides draw the same layout. Passing the same seed always draws the
// same shapes; change the string to reshuffle a given slide.
//
// WHAT THE SHAPES ARE MEANT TO LOOK LIKE: a pandanus or coconut-leaf mat, laid
// from discrete strips, rather than a piece of draped or torn cloth. That is
// the whole reason BackgroundPattern.jsx refuses to let two pieces overlap or
// even touch (see tooClose and MIN_SEPARATION there): every polygon it draws
// is a triangle or a quadrilateral, but a pair that merges under the shared
// <clipPath> arrives at the reader as one five- or seven-sided blob, and a
// margin of those reads as fabric. Kept apart, they read as pieces of a mat.
//
// THERE IS NO `scale` HERE ANY MORE, and its absence is the rule. The weave
// inside the shapes is one fixed size site-wide (WEAVE_UNIT in
// BackgroundPattern.jsx); what a seed varies is the shapes cut out of it --
// their size, position, rotation and proportion -- so every section's margins
// show different pieces of one mat rather than the same pattern at different
// magnifications. A per-section scale knob is exactly the thing that would
// break that, so there isn't one. `opacity` stays: it is how loud the texture
// is, not what it is made of.
export function scatterBackdrop(seed, { opacity = 0.05 } = {}) {
  return { pattern: 'weaveScatter', seed, opacity }
}
