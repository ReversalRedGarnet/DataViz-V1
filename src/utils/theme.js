// Real color values, for the places JS and D3 need an actual string rather than
// a Tailwind class. The variables in base.css are the source of truth for the
// page; these mirror them for the canvas and SVG renderers, which cannot read a
// utility class.
//
// Resolved from the computed style rather than hardcoded where possible, so a
// theme change reaches the charts on the same frame it reaches the page.
const CHART_COLORS_BY_THEME = {
  light: {
    selection: ['#3D6B7D', '#8A6300'],
    series: ['#3D6B7D', '#8A6300', '#9A3B2E', '#5C4A8A'],
    single: '#3D6B7D',
    idle: '#5B8FA3',
    onMark: '#FFFFFF',
    markRing: '#FFFFFF',
  },
  dark: {
    selection: ['#8FBACD', '#F0C868'],
    series: ['#8FBACD', '#F0C868', '#EE9B8A', '#B4A6E0'],
    single: '#8FBACD',
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
const CHART_INK = {
  light: '#24333A',
  dark: '#F0ECE3',
}

// Halo around chart points, matching the card behind them so overlapping marks
// stay distinct. Kept in step with --color-surface.
const CHART_SURFACE = {
  light: '#FFFFFF',
  dark: '#293236',
}


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
