// The header and footer backdrops, in one place. This file is the knob: change
// a name, an opacity, or swap in your own artwork, and nothing else moves.
//
// Two ways to fill a backdrop:
//
//   { pattern: 'ripples' }        one of the built-in tiles in
//                                 BackgroundPattern.jsx ('ripples' | 'fish' |
//                                 'weave'). Drawn in currentColor, so it
//                                 inverts with the theme for free.
//
//   { image: '/patterns/x.svg' }  your own tiling artwork from /public.
//                                 Add `imageDark` for a second file, since a
//                                 fixed-colour image can't invert itself.
//
// Shared options:
//   opacity -- 0.04-0.08 is the useful band. Above that the pattern starts
//     competing with the text sitting on it; below it stops being visible on a
//     phone screen at all.
//   scale -- multiplies the tile size. Larger reads as a motif, smaller as a
//     texture.

// Concentric rings spreading and interfering, for the page the site is named
// after. Kept quieter than the footer's: the header carries the wordmark, the
// nav, and the canoe progress bar already.
export const HEADER_BACKDROP = {
  pattern: 'ripples',
  opacity: 0.05,
  scale: 1,
}

// Interlocking fish, closing the page the way the wave divider opens each
// section. Slightly stronger than the header's -- the footer is a solid block
// with less competing for attention inside it.
export const FOOTER_BACKDROP = {
  pattern: 'fish',
  opacity: 0.07,
  scale: 1,
}

// Swapping in your own artwork, for reference:
//
// export const FOOTER_BACKDROP = {
//   image: '/patterns/tapa-light.svg',
//   imageDark: '/patterns/tapa-dark.svg',
//   opacity: 0.06,
//   scale: 1.5,
// }
