import { useId } from 'react'

// A quiet tiling backdrop for a band of the page. Sits behind its container's
// content, never takes a pointer event, and is hidden from screen readers --
// it carries no information, only texture.
//
// The tiles below are drawn in `currentColor`, which is what makes one pattern
// work in both themes and on both backgrounds without a `dark:` variant
// anywhere: the header inherits ink (light in dark mode), and the footer sets
// text-sand/dark:text-ink for its own contrast, so in every case the pattern is
// already the right colour against what's behind it.
//
// All three motifs are original geometric designs, not reproductions of any
// specific traditional Pacific textile or tattoo pattern -- the same line the
// wave divider holds. They're built from the vocabulary the site already uses:
// line weight, tiling, and no fills.
//
// Props:
//   backdrop -- one entry from src/content/patterns.js, or null for none
//   className -- extra classes on the wrapper, if a caller needs to inset it

// Scattered drop rings, sparse rather than latticed. An earlier draft put a
// ring set on every lattice point; the rings intersected so evenly that they
// closed into rosettes and read as wallpaper. Two drops per tile, offset
// diagonally, keeps it reading as water instead.
function ripples() {
  const size = 104
  const drops = [
    [26, 22],
    [78, 74],
  ]
  const radii = [7, 15, 23, 31]
  const shapes = []
  drops.forEach(([cx, cy], i) =>
    radii.forEach((r, j) =>
      shapes.push(
        <circle
          key={`${i}-${j}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={j === 0 ? 1.2 : 0.9}
        />
      )
    )
  )
  return { size, shapes }
}

// Interlocking geometric fish -- a diamond body, cross-hatch fin lines, a tail
// fork and an eye -- in rows that alternate direction. Carried over from the
// divider this motif was first drawn for, which never found a home as a
// divider; as a field it finally does something.
const FISH_BODY_LEN = 22
const FISH_BODY_H = 9
const FISH_TAIL = 5

function fishAt(cx, cy, facingRight, key) {
  const half = FISH_BODY_LEN / 2
  const sign = facingRight ? 1 : -1
  const frontX = cx + half * sign
  const backX = cx - half * sign
  const topY = cy - FISH_BODY_H / 2
  const botY = cy + FISH_BODY_H / 2
  const tailTipX = backX - FISH_TAIL * sign
  const tailX = cx - (cx - backX) * 0.35
  const body = `M ${frontX},${cy} L ${cx},${topY} L ${backX},${cy} L ${cx},${botY} Z`
  const tail = `M ${tailX},${cy - FISH_BODY_H * 0.32} L ${tailTipX},${cy} L ${tailX},${cy + FISH_BODY_H * 0.32}`
  const crosses = [
    `M ${cx},${topY} L ${cx},${botY}`,
    `M ${cx - half * 0.4},${cy - FISH_BODY_H * 0.3} L ${cx + half * 0.4},${cy + FISH_BODY_H * 0.3}`,
    `M ${cx - half * 0.4},${cy + FISH_BODY_H * 0.3} L ${cx + half * 0.4},${cy - FISH_BODY_H * 0.3}`,
  ]

  return (
    <g key={key}>
      <path d={body} fill="none" stroke="currentColor" strokeWidth="1" />
      <path d={tail} fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      {crosses.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="0.6" />
      ))}
      <circle cx={frontX - half * 0.35 * sign} cy={cy} r="1" fill="currentColor" />
    </g>
  )
}

function fish() {
  const width = 44
  const height = 34
  const shapes = []
  // A pattern tile clips its contents rather than wrapping them, so each row is
  // drawn a fish wider at both ends: the halves cut off at the edges are what
  // the neighbouring tile's halves meet. The row pitch is deliberately tight --
  // at a looser one the rows read as stripes rather than as a field.
  ;[-11, 11, 33, 55].forEach((cx, i) => shapes.push(fishAt(cx, 9, true, `a${i}`)))
  ;[-22, 0, 22, 44, 66].forEach((cx, i) => shapes.push(fishAt(cx, 26, false, `b${i}`)))
  return { width, height, shapes }
}

// Plaited strands, over and under -- the structure behind a woven mat, reduced
// to its alternation. The densest and quietest of the three.
function weave() {
  const size = 32
  const cell = size / 2
  const inset = 2
  const shapes = []
  for (const [ox, oy] of [
    [0, 0],
    [cell, cell],
  ]) {
    for (let i = 1; i <= 3; i++) {
      const y = oy + (cell * i) / 4
      shapes.push(
        <line
          key={`h-${ox}-${i}`}
          x1={ox + inset}
          y1={y}
          x2={ox + cell - inset}
          y2={y}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      )
    }
  }
  for (const [ox, oy] of [
    [cell, 0],
    [0, cell],
  ]) {
    for (let i = 1; i <= 3; i++) {
      const x = ox + (cell * i) / 4
      shapes.push(
        <line
          key={`v-${oy}-${ox}-${i}`}
          x1={x}
          y1={oy + inset}
          x2={x}
          y2={oy + cell - inset}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      )
    }
  }
  return { size, shapes }
}

const PATTERNS = { ripples, fish, weave }

export default function BackgroundPattern({ backdrop, className = '' }) {
  // Two backdrops render per page, so the <pattern> ids have to be unique or
  // the second one's fill resolves to the first one's tile.
  const id = useId()

  if (!backdrop) return null

  const { pattern, image, imageDark, opacity = 0.06, scale = 1 } = backdrop
  const wrapper = `pointer-events-none absolute inset-0 overflow-hidden ${className}`

  if (image) {
    const layer = (src, extra) => (
      <div
        className={`absolute inset-0 ${extra}`}
        style={{ backgroundImage: `url(${src})`, backgroundRepeat: 'repeat', opacity }}
      />
    )
    return (
      <div aria-hidden="true" className={wrapper}>
        {layer(image, imageDark ? 'dark:hidden' : '')}
        {imageDark && layer(imageDark, 'hidden dark:block')}
      </div>
    )
  }

  const build = PATTERNS[pattern]
  if (!build) return null
  const { size, width = size, height = size, shapes } = build()
  const tileW = width * scale
  const tileH = height * scale

  return (
    <div aria-hidden="true" className={wrapper}>
      <svg className="h-full w-full" style={{ opacity }}>
        <defs>
          <pattern id={id} width={tileW} height={tileH} patternUnits="userSpaceOnUse">
            <g transform={`scale(${scale})`}>{shapes}</g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  )
}
