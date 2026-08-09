// Curling wave-and-spiral divider -- an original design, not a reproduction of
// any traditional Pacific pattern.
//
// `colorAbove` fills the strip, then `colorBelow` paints only below the wave
// line, so the wave itself is the seam between two sections rather than a
// border sitting next to a flat colour cut.
const TILE_WIDTH = 40
const TILE_COUNT = 10 // 40 * 10 = 400, matching the original total width
const BASELINE_Y = 16
const CREST_Y = 7
const VIEW_WIDTH = TILE_WIDTH * TILE_COUNT
const VIEW_HEIGHT = 20
const WAVE_STROKE = '#5B8FA3' // same ocean blue as the map markers and storm-profile points

// The wave as cubic-bezier swells. Returns only the C commands, since the
// stroke and the region below it share a start point but diverge after.
function buildWaveCommands() {
  let d = ''
  for (let i = 0; i < TILE_COUNT; i++) {
    const x0 = i * TILE_WIDTH
    const cx1 = x0 + TILE_WIDTH * 0.25
    const xMid = x0 + TILE_WIDTH * 0.5
    const cx2 = x0 + TILE_WIDTH * 0.75
    const x1 = x0 + TILE_WIDTH
    d += `C ${cx1},${BASELINE_Y} ${cx1},${CREST_Y} ${xMid},${CREST_Y} `
    d += `C ${cx2},${CREST_Y} ${cx2},${BASELINE_Y} ${x1},${BASELINE_Y} `
  }
  return d
}

// A curl at each crest, radius growing with angle. Turn count and radius are
// tuned to keep it inside the viewBox -- an earlier draft poked above y=0 and
// bled into the section above.
function buildCurlPath(cx, cy) {
  const turns = 1.15
  const rMax = 3.2
  const steps = 28
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const theta = t * turns * 2 * Math.PI
    const r = rMax * t
    const x = cx + r * Math.cos(theta)
    const y = cy - r * Math.sin(theta)
    d += i === 0 ? `M ${x.toFixed(2)},${y.toFixed(2)} ` : `L ${x.toFixed(2)},${y.toFixed(2)} `
  }
  return d
}

const WAVE_LINE_PATH = `M 0,${BASELINE_Y} ${buildWaveCommands()}`
const BOTTOM_REGION_PATH = `${WAVE_LINE_PATH} L ${VIEW_WIDTH},${VIEW_HEIGHT} L 0,${VIEW_HEIGHT} Z`
const CURL_PATHS = Array.from({ length: TILE_COUNT }, (_, i) =>
  buildCurlPath(i * TILE_WIDTH + TILE_WIDTH * 0.5, CREST_Y)
)

// Props:
//   colorAbove / colorBelow -- real hex values (see theme.js
//     sectionColorsFor) matching the sections immediately above/below,
//     so there's no visible seam except along the wave itself.
export default function PacificBorder({ colorAbove = '#FAF7F0', colorBelow = '#FAF7F0' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      className="block h-4 w-full"
    >
      <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={colorAbove} />
      <path d={BOTTOM_REGION_PATH} fill={colorBelow} />
      <path d={WAVE_LINE_PATH} fill="none" stroke={WAVE_STROKE} strokeWidth="1.6" strokeLinecap="round" />
      {CURL_PATHS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={WAVE_STROKE} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}
