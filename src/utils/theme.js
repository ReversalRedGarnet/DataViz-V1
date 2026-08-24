import { THEME_TOKENS } from '../styles/tokens.js'

// Real color values, for the places JS and D3 need an actual string rather than
// a Tailwind class. A canvas or SVG renderer cannot read a utility class.
//
// THE DUPLICATION THIS USED TO CARRY IS GONE. Six of these were written twice:
// once here as hex, once in styles/base.css as space-separated RGB triples for
// Tailwind's <alpha-value> syntax. Because the two formats differ, no search
// would ever have caught a drift between them, and the comment that used to sit
// here was a hand-maintained table mapping one to the other.
//
// The three that appear in both worlds -- ink, surface and the accent -- are now
// read from styles/tokens.js, which is also what generates the CSS custom
// properties. One place to type a value.
//
// The rest stay literals on purpose. They exist only for the renderers and have
// no CSS counterpart to agree with, so hoisting them would move a value out of
// the reasoning that chose it for no gain. The notes on each below are that
// reasoning.
const LIGHT = THEME_TOKENS.light
const DARK = THEME_TOKENS.dark

const CHART_COLORS_BY_THEME = {
  light: {
    selection: [LIGHT.accent, '#8A6300'],
    series: [LIGHT.accent, '#8A6300', '#9A3B2E', '#5C4A8A'],
    single: LIGHT.accent,
    idle: '#5B8FA3',
    onMark: '#FFFFFF',
    markRing: '#FFFFFF',
  },
  dark: {
    selection: [DARK.accent, '#F0C868'],
    series: [DARK.accent, '#F0C868', '#EE9B8A', '#B4A6E0'],
    single: DARK.accent,
    idle: '#7FA8B8',
    onMark: '#1B2226',
    markRing: '#1B2226',
  },
}

export function chartColorsFor(theme) {
  return CHART_COLORS_BY_THEME[theme] ?? CHART_COLORS_BY_THEME.light
}

// Axis text and gridlines for D3 charts, tracking the theme the same way the
// marks above do. Module-private: chartTheme() below is the only way in, so a
// renderer can't reach past it and resolve one of the three with its own
// fallback, which is the half-themed-chart bug chartTheme() exists to prevent.
const CHART_INK = { light: LIGHT.ink, dark: DARK.ink }

// Halo around chart points, matching the card behind them so overlapping marks
// stay distinct -- so it is --color-surface, and now literally so.
const CHART_SURFACE = { light: LIGHT.surface, dark: DARK.surface }


// Map ocean/land/coastline. A dimmed, desaturated dark-mode counterpart in the
// same hue family, rather than the map keeping its light colours the way an
// embedded Google Map does -- at full brightness it overwhelmed a dark page.
// Marker and selection colours are unchanged; both read fine on either.
export const MAP_COLORS = {
  light: { ocean: '#7FBFD9', land: '#FAF7F0', coastline: '#C9DCE2' },
  dark: { ocean: '#2E4A57', land: '#293236', coastline: '#3E4B50' },
}


// The three values every D3 renderer opens by reading, resolved together.
// They are always wanted as a set, and each was previously fetched with its
// own `?? .light` fallback -- six chances for one of them to be spelled
// differently and leave a chart half-themed. Destructure what you need:
//
//   const { ink, surface, palette } = chartTheme(theme)
export function chartTheme(theme) {
  return {
    ink: CHART_INK[theme] ?? CHART_INK.light,
    surface: CHART_SURFACE[theme] ?? CHART_SURFACE.light,
    palette: chartColorsFor(theme),
  }
}
