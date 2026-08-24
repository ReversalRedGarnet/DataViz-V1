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
// TWO MOTIFS, SPLIT BY WHERE THEY GO. There were three tiling designs here --
// drop rings, interlocking fish, and the plait. The fish went; it was the one
// that read as a picture of something rather than as a texture, and nothing on
// the site was using it.
//
// The two that stayed did not stay as alternatives to pick between. They divide
// the page: 'ripples' is the chrome tile, on the header and the slide footer,
// and the weave is the content one, scattered into every section's margins by
// weaveScatter below. Rings on the two bands a reader never reads *through*, a
// weave beside the ones they do.
//
// Both are original geometric designs, not reproductions of any specific
// traditional Pacific textile or tattoo pattern -- the same line the wave divider
// holds. They're built from the vocabulary the site already uses: line weight,
// tiling, and no fills.
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

// Plaited strands, over and under -- the structure behind a woven mat, reduced
// to its alternation. The densest and quietest of the set.
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

const PATTERNS = { ripples, weave }

// A third form, and a different shape of one: the two tiles above run edge to
// edge, which is exactly what keeps them off argument slides -- a field under a
// chart competes with the marks. This one instead scatters a handful of woven
// shapes into the section's own gutters and leaves the content column clear, the
// same way a page margin can carry a texture a paragraph never could. That is
// what makes it safe to put on every slide rather than just the two apparatus
// ones.
//
// Deterministic per slide: a plain string seed ('timeline', 'ripple-chain',
// ...) hashes to a PRNG state, so the same slide always draws the same
// scatter -- a reload doesn't reshuffle it, and no two slides land on the
// same layout by construction.
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return h
}

// The weave tile itself, ported from the reference prototype (seed 11):
// short strokes over-and-under in a 24-unit base cell, scaled up 1.4x. Only
// the colour changes -- currentColor in place of the fixed ink hex -- so it
// inverts with the theme like the tiles above.
function weaveTile(scale) {
  const sw = 0.9
  return (
    <g transform={`scale(${1.4 * scale})`}>
      <line x1="-1" y1="2" x2="13" y2="2" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="23" y1="2" x2="37" y2="2" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="-1" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="23" y1="6" x2="37" y2="6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="-1" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="23" y1="10" x2="37" y2="10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="11" y1="14" x2="25" y2="14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="-13" y1="14" x2="1" y2="14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="11" y1="18" x2="25" y2="18" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="-13" y1="18" x2="1" y2="18" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="11" y1="22" x2="25" y2="22" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="-13" y1="22" x2="1" y2="22" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="14" y1="-1" x2="14" y2="13" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="14" y1="23" x2="14" y2="37" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="18" y1="-1" x2="18" y2="13" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="18" y1="23" x2="18" y2="37" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="22" y1="-1" x2="22" y2="13" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="22" y1="23" x2="22" y2="37" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="2" y1="11" x2="2" y2="25" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="2" y1="-13" x2="2" y2="1" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="6" y1="11" x2="6" y2="25" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="6" y1="-13" x2="6" y2="1" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="10" y1="11" x2="10" y2="25" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="10" y1="-13" x2="10" y2="1" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </g>
  )
}

// One irregular polygon, points laid out around a circle at an offset,
// random-walked angle and radius so they don't come out regular.
//
// THREE TO SIX POINTS, not the original three or four. A triangle and a quad
// at the same radius are close enough in silhouette that a margin full of them
// reads as one repeated shape; a five- or six-pointer starts to round off, so
// the set spans "shard" to "pebble" and the eye stops matching them up.
//
// The radial jitter widens with the point count for the same reason. A hexagon
// with the old +-0.6 rad of angular wander is nearly regular, and a regular
// hexagon is the one shape here that would read as deliberate geometry rather
// than as scatter.
function randomShape(rand, cx, cy, baseR) {
  const points = 3 + Math.floor(rand() * 4)
  const angleOffset = rand() * Math.PI * 2
  const wander = 0.5 + points * 0.14
  const pts = []
  for (let i = 0; i < points; i++) {
    const angle = angleOffset + (i / points) * Math.PI * 2 + (rand() - 0.5) * wander
    // 0.45-1.4 of the base radius, against the old 0.6-1.3. The widening is
    // what keeps a six-pointer from closing into a circle: some vertices have
    // to fall well inside the others or the outline has no corners left.
    const r = baseR * (0.45 + rand() * 0.95)
    pts.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r * 0.78).toFixed(1)}`)
  }
  return pts.join(' ')
}

// 12-30 shapes total, confined to the two side margins of a 1200x640 canvas --
// x < 280 or x > 920, the mirror of the reference's cleared 640px reading
// column -- with a little bleed past the canvas edge so they don't all read
// as neatly bounded. Small fused clusters rather than one shape per spot: the
// reference note is that overlaps in a single clip merge instead of doubling
// in opacity, which is just how one <clipPath> works, but it only shows if
// something overlaps.
//
// DENSITY WAS RAISED FROM THE ORIGINAL 6-10, and the ceiling is set by the
// clip, not by taste. Every shape is a hole in one <clipPath>, so overlapping
// shapes merge rather than compounding -- density can go up without the
// texture going darker, which is the only reason this is safe to do on slides
// that carry charts. What it costs instead is the margin reading as a field
// rather than as scatter, and 3-5 clusters a side is where that line sat in
// testing at 0.05 opacity.
//
// The cluster spread widens with the cluster's own size (`spread` below) so a
// cluster of large shapes does not fuse into one blob while a cluster of small
// ones sits in three separate specks -- the old flat +-45 jitter did both.
function scatterShapes(rand, prefix) {
  const bands = [
    { xMin: -80, xMax: 260 },
    { xMin: 940, xMax: 1280 },
  ]
  const shapes = []
  bands.forEach((band, bi) => {
    const clusters = 3 + Math.floor(rand() * 3)
    for (let c = 0; c < clusters; c++) {
      const cx = band.xMin + rand() * (band.xMax - band.xMin)
      const cy = 40 + rand() * 560
      // 30-135 against the old 55-125: the range is what stops every cluster
      // landing at the same visual weight, and the low end gives the margins
      // some small debris to break up the large forms.
      const r = 30 + rand() * 105
      const fused = 1 + Math.floor(rand() * 3)
      const spread = r * 1.5
      for (let s = 0; s < fused; s++) {
        const jx = (rand() - 0.5) * spread
        const jy = (rand() - 0.5) * spread
        // Each shape in a cluster varies around the cluster's radius rather
        // than drawing its own, so a cluster still reads as one thing.
        const sr = r * (0.7 + rand() * 0.6)
        shapes.push(
          <polygon key={`${prefix}-${bi}-${c}-${s}`} points={randomShape(rand, cx + jx, cy + jy, sr)} />
        )
      }
    }
  })
  return shapes
}

function WeaveScatter({ seed, opacity, scale, id }) {
  const rand = mulberry32(seedFromString(String(seed ?? 'default')))
  // Drawing the shapes first also draws from `rand` first, so the tile-size
  // jitter below doesn't shift which shapes a given seed produces.
  const shapes = scatterShapes(rand, id)
  // 0.7-1.3 against the old 0.85-1.15. The weave inside the shapes is the
  // other axis of variety here, and a 30% span either side is enough that two
  // slides side by side read as different weights of the same cloth.
  const tileScale = (scale ?? 1) * (0.7 + rand() * 0.6)
  const tileId = `${id}-tile`
  const clipId = `${id}-clip`

  return (
    <div aria-hidden="true" className="backdrop-layer pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 1200 640"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        style={{ opacity }}
      >
        <defs>
          <pattern id={tileId} width={33.6 * tileScale} height={33.6 * tileScale} patternUnits="userSpaceOnUse">
            {weaveTile(tileScale)}
          </pattern>
          <clipPath id={clipId}>{shapes}</clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect width="1200" height="640" fill={`url(#${tileId})`} />
        </g>
      </svg>
    </div>
  )
}

export default function BackgroundPattern({ backdrop, className = '' }) {
  // Two backdrops render per page, so the <pattern> ids have to be unique or
  // the second one's fill resolves to the first one's tile.
  const id = useId()

  if (!backdrop) return null

  const { pattern, image, imageDark, opacity = 0.06, scale = 1, seed } = backdrop
  // `backdrop-layer` is a hook, not a style: it is what lets an off-stage slide
  // switch its backdrop off (see styles/slideshow.css). Both branches below
  // carry it, since either can end up inside a panel.
  const wrapper = `backdrop-layer pointer-events-none absolute inset-0 overflow-hidden ${className}`

  if (pattern === 'weaveScatter') {
    return <WeaveScatter seed={seed} opacity={opacity} scale={scale} id={id} />
  }

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
