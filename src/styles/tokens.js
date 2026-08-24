// THE THEME PALETTE, IN ONE PLACE, AS THE SOURCE OF BOTH FORMS.
//
// WHAT THIS CLOSES. These colours were written down twice: as hex in
// utils/theme.js, for the canvas and SVG renderers that need a real colour
// string, and as space-separated RGB triples in styles/base.css, because
// Tailwind's <alpha-value> syntax requires that form. The two spellings meant
// no search could ever catch a drift between them, and theme.js carried a
// hand-maintained table mapping one to the other with a note asking whoever
// changed a value to remember the other file.
//
// Now this file is the only place a value is typed. styles/tokens.css is
// generated from it by scripts/build-tokens.mjs, which Vite runs before every
// build and every dev server start (see vite.config.js), so the CSS custom
// properties cannot fall out of step with the JavaScript. Do not edit
// tokens.css.
//
// WHAT IS DELIBERATELY NOT HERE. The chart series colours beyond the accent --
// the golds, the reds, the purples -- and the map's ocean and coastline. Those
// exist only for the renderers and have no CSS custom property to agree with,
// so hoisting them here would put values in a shared file for the sake of
// tidiness rather than to stop a drift. They stay in utils/theme.js next to
// the reasoning about contrast and colour-blindness that chose them.
export const THEME_TOKENS = {
  light: {
    ink: '#24333A',
    sand: '#FAF7F0',
    panel: '#F1EADC',
    surface: '#FFFFFF',
    // A darkened ocean, for the one accent that has to carry small text: the
    // eyebrow line above each headline. The decorative ocean (#5B8FA3, used
    // for the wave and the map markers) only reaches ~2.9:1 on sand and cannot
    // hold text. This reaches 5.4:1, and 8.1:1 for its dark counterpart.
    accent: '#3D6B7D',
  },
  dark: {
    ink: '#F0ECE3',
    sand: '#181E21',
    panel: '#222A2E',
    surface: '#293236',
    accent: '#8FBACD',
  },
}
