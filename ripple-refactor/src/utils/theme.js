// Real color values for places JS/D3 needs an actual string (Tailwind
// classes don't work inside D3's .attr('fill', ...) calls).
//
// Darker than the decorative ocean/sun tokens in tailwind.config.js --
// same hue family, adjusted to clear WCAG 2.1's 3:1 minimum for
// graphical objects (white text on ocean-data/gold-data: 5.8:1/5.4:1).
// Every colour a data mark can take, per theme. Theme-aware because a fixed
// pair can't clear WCAG's 3:1 non-text contrast on both a white card and a
// #293236 one: the light pair measures 5.8:1 and 4.4:1 on white but only
// 2.2:1 and 2.4:1 on the dark card, where marks and map pins were washing out.
// The dark pair measures 6.3:1 and 8.2:1 there.
//
//   selection -- first and second pick. Blue against gold in both themes, the
//     most robust pairing for red/green colour blindness, and the two differ
//     in lightness as well as hue so the distinction survives greyscale.
//   single -- single-series marks (snapshot bars, the storm scatter), where
//     colour carries no information. Deliberately the same blue as the first
//     pick rather than a fourth near-identical ocean tone: one data blue and
//     one data gold across the whole site is easier to learn than four.
//   idle -- a map pin nobody has picked yet. Reads as "available", not as a
//     third category.
//   onMark -- text sitting on top of a mark, i.e. the pin's 1/2 badge. Follows
//     the marks, so it flips as they do.
//   series -- the one place four nations are drawn at once (the divergence
//     charts), where the two-pick palette can't stretch. Extends the same blue
//     and gold with a brick and a violet rather than starting over: measured
//     5.1:1 to 7.0:1 against both the card and the section behind it, in both
//     themes. Deliberately no green, which would put a red/green pair in the
//     same chart. Hue is still the weakest of the three cues these lines carry
//     -- each also gets its own dash pattern and its own end label, so the
//     chart survives being read in greyscale.
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
// marks above do.
export const CHART_INK = {
  light: '#24333A',
  dark: '#F0ECE3',
}

// Halo around chart points, matching the card behind them so overlapping marks
// stay distinct. Kept in step with --color-surface.
export const CHART_SURFACE = {
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
