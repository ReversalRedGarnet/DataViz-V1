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

// HOW FAR TEXT IS ALLOWED TO STEP BACK, PER THEME.
//
// De-emphasis on this site is element opacity over the theme's own ground, and
// the two themes are not symmetrical about it. Dark ink on sand loses contrast
// far faster than light ink on a dark panel: at 0.60 the same text reads 3.55:1
// in light and 5.45:1 in dark. The scale was tuned while looking at the dark
// theme, so one flat set of numbers left the light theme's small text below
// WCAG AA in 67 places -- the timeline's gap years at 2.18:1, the deck counter
// at 2.84:1, the footer's Back/Next sublabels at 3.23:1.
//
// So the numbers are per theme, the way MAP_COLORS and chartTheme() in
// utils/theme.js already are, and they are named for the job rather than for a
// percentage. A call site asks for the level of step-back it wants and each
// theme answers with a value that still clears 4.5:1 on its own ground.
//
// THE FLOORS, MEASURED AGAINST THE DARKEST GROUND EACH THEME PAINTS. Light ink
// (#24333A) over panel (#F1EADC) needs 0.69 to reach 4.5:1; dark ink (#F0ECE3)
// over surface (#293236) needs 0.55. Everything below sits above its floor with
// room to spare, so a future panel a shade darker does not silently drop a
// level under the line.
//
// The consequence for light is real and intended: its usable de-emphasis range
// is 0.72-1.0 rather than 0.40-1.0, so the three levels sit closer together
// than they used to. Where a step-back has to read as a state rather than as a
// texture -- the hero's unlit years, the timeline's gap years -- the colour and
// weight cues beside the text are what carry it, and those are untouched.
//
//   faint  a thing that is present but not part of what is being compared
//   quiet  chrome that must not compete with the content it frames
//   soft   supporting prose: notes, dates, captions, counts
export const DIM_TOKENS = {
  light: { faint: 0.72, quiet: 0.78, soft: 0.84 },
  dark: { faint: 0.58, quiet: 0.62, soft: 0.66 },
}
