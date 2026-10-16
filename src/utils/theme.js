// Real colour strings (like '#24333A') for D3 charts and the maps, which
// cannot read Tailwind classes. Light and dark versions of each; see the
// header of hooks/useTheme.jsx for how the theme as a whole works.

import { THEME_TOKENS } from '../styles/tokens.js'

// Real color values, for the places JS and D3 need an actual string rather than
// a Tailwind class. A canvas or SVG renderer cannot read a utility class.
//
// The three colours needed both here and in CSS -- ink, surface and the
// accent -- are read from styles/tokens.js, which also generates the CSS
// custom properties, so each is typed once. (Typed twice, as hex here and as
// RGB triples in CSS, they would be two formats no search could compare.)
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
  light: { ocean: '#7FBFD9', land: '#EAF3F7', coastline: '#C9DCE2' },
  dark: { ocean: '#2E4A57', land: '#293236', coastline: '#3E4B50' },
}


// The three values every D3 renderer opens by reading, resolved together.
// They are always wanted as a set, and resolving them in one call with one
// fallback means a chart cannot end up half-themed because one lookup was
// spelled differently. Destructure what you need:
//
//   const { ink, surface, palette } = chartTheme(theme)
export function chartTheme(theme) {
  return {
    ink: CHART_INK[theme] ?? CHART_INK.light,
    surface: CHART_SURFACE[theme] ?? CHART_SURFACE.light,
    palette: chartColorsFor(theme),
  }
}
