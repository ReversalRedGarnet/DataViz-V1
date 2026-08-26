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
// and the weave is the content one, scattered into the margins of every section
// but the title card by weaveScatter below. Rings on the two bands a reader
// never reads *through*, a weave beside the ones they do.
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

// THE CANONICAL WEAVE UNIT, and it is one number for the whole site.
//
// The cloth and the shape cut out of it are two separate things, and this is
// the cloth. Every woven fragment anywhere on the site -- whatever size,
// rotation or silhouette its outline has -- is filled with weave at exactly
// this scale, so the margins read as one material seen in different pieces
// rather than as one pattern re-rendered at whatever size a seed happened to
// pick. There was per-seed jitter on this (0.7x to 1.3x) and a `scale` knob in
// content/patterns.js feeding it; both are gone. Variety lives in the outlines
// (see randomShape and scatterShapes below), which is where it can vary
// without the material changing.
//
// The unit is measured in the 1200x640 backdrop viewBox rather than in CSS
// pixels, which is what makes it consistent: every section draws that same
// viewBox, so the same number is the same apparent weave everywhere.
//
// WEAVE_CELL is the coordinate system weaveTile() happens to be drawn in and
// is not a knob -- to make the weave coarser or finer, move WEAVE_UNIT.
const WEAVE_CELL = 24
const WEAVE_UNIT = 33.6
const WEAVE_TILE_SCALE = WEAVE_UNIT / WEAVE_CELL

// The weave tile itself, ported from the reference prototype (seed 11):
// short strokes over-and-under in the base cell. Only the colour changes --
// currentColor in place of the fixed ink hex -- so it inverts with the theme
// like the tiles above. It takes no scale argument: there is only one.
function weaveTile() {
  const sw = 0.9
  return (
    <g transform={`scale(${WEAVE_TILE_SCALE})`}>
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

// ONE FRAGMENT'S OUTLINE, AND THE SITE'S ONE GEOMETRY RULE: three sides or
// four, and nothing else is reachable from here.
//
// `sides` can only ever evaluate to 3 or 4, so a pentagon is not something
// that gets filtered out downstream or hidden at low opacity -- it is not a
// thing this function can return. That matters because the alternative (draw
// anything, discard what we don't like) leaves the rule somewhere a later
// edit can quietly step around.
//
// It replaces a three-to-six-point version whose reasoning was that a wider
// span of point counts stops the eye matching shapes up. It did, and what it
// cost was the thing that made the scatter feel made rather than generated:
// with six points and enough radial wander to keep them off a regular hexagon,
// the outlines rounded off into pebbles, and a margin of pebbles is a stain.
// Triangles and quadrilaterals read as cut pieces of something. The variety
// now comes from size, placement, rotation and proportion instead -- see the
// three knobs below and the clustering in scatterShapes.
//
// WHY THE JITTER IS NARROW NOW. The old version pulled vertices anywhere from
// 0.45 to 1.4 of the radius, which a hexagon absorbs and a quadrilateral does
// not: at four points that range folds a corner inside the opposite edge and
// the shape arrives as a dart or a splinter. Holding radius to 0.84-1.16 and
// angle to a few degrees keeps every corner a corner, so what varies is which
// irregular triangle or quad it is, not whether it is still one.
function randomShape(rand, cx, cy, baseR) {
  const sides = 3 + Math.floor(rand() * 2)
  const spin = rand() * Math.PI * 2
  // Silhouette proportion, at roughly constant area: one axis stretches by as
  // much as the other compresses. This is the knob that makes a squat quad and
  // a long triangle the same *size* of fragment -- baseR stays what the shape
  // is worth, and this is only what it looks like. Applied in the fragment's
  // own frame and rotated afterwards by `spin`, so a wide shape can arrive at
  // any angle rather than always lying flat.
  const stretch = 0.72 + rand() * 0.56
  // A triangle carries its irregularity better than a quad does -- three
  // corners can move further before the outline stops looking deliberate.
  const wobble = sides === 3 ? 0.26 : 0.18
  const cos = Math.cos(spin)
  const sin = Math.sin(spin)
  const pts = []
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + (rand() - 0.5) * wobble
    const r = baseR * (0.84 + rand() * 0.32)
    const x = Math.cos(angle) * r * stretch
    const y = (Math.sin(angle) * r) / stretch
    // Returned as coordinate pairs rather than as the finished `points`
    // string: scatterShapes has to be able to ask whether two of these
    // overlap before it accepts either. Formatting happens at the end, in
    // pointsAttr below.
    pts.push([cx + x * cos - y * sin, cy + x * sin + y * cos])
  }
  return pts
}

function pointsAttr(pts) {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

// DO TWO FRAGMENTS SHARE ANY AREA?
//
// This is the whole of the mat rule. randomShape can only draw a triangle or a
// quadrilateral, but that constrains each polygon rather than what the reader
// sees: every shape is a hole in one shared <clipPath>, so two that overlap
// stop being two shapes and become a single merged silhouette with as many
// sides as the union happens to have. A margin full of five- and seven-sided
// blobs was the result, and it read as torn cloth. Pandanus and coconut-leaf
// mats are made of discrete pieces laid beside one another, so the fix is to
// keep the pieces discrete.
//
// Edge-crossing first, then containment. Two polygons overlap if any of their
// edges cross; if no edges cross they are either disjoint or one is entirely
// inside the other, which a single point-in-polygon test each way settles.
// Written for the general simple polygon rather than assuming convexity: a
// quad from randomShape is convex in practice but nothing in that function
// guarantees it, and a separating-axis test would silently give the wrong
// answer on the day one is not.
function cross(ax, ay, bx, by, px, py) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax)
}

function edgesCross(p1, p2, p3, p4) {
  const d1 = cross(p3[0], p3[1], p4[0], p4[1], p1[0], p1[1])
  const d2 = cross(p3[0], p3[1], p4[0], p4[1], p2[0], p2[1])
  const d3 = cross(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1])
  const d4 = cross(p1[0], p1[1], p2[0], p2[1], p4[0], p4[1])
  return d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0
}

function pointInPolygon([x, y], poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function overlaps(a, b) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (edgesCross(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length])) return true
    }
  }
  return pointInPolygon(a[0], b) || pointInPolygon(b[0], a)
}

// The two margins of the 1200x640 canvas, given as the edges that matter: the
// cleared reading column between them, and how far past the canvas a fragment
// may sit. `dir` points away from the column, which is the direction a
// fragment is pushed if it would otherwise reach into the text.
//
// The column is wider than the 280/920 it started at. The canvas is drawn with
// preserveAspectRatio="slice", so on a section taller than 1200x640 the viewBox
// is scaled up and cropped, which pulls the margins inward in CSS terms and let
// fragments sit under the edge of the reading column at desktop widths. 240/960
// clears it at the widths the deck actually uses without starving the bands,
// which are still 290 units wide apiece.
const COLUMN_LEFT = 240
const COLUMN_RIGHT = 960
// The outer edge is past the canvas on purpose, so fragments run off the page
// rather than all sitting neatly inside it -- but only by 50 units. At the 90
// it started at, a small cluster could be centred far enough out that all the
// reader saw was a 15px sliver at the edge, which reads as a stray mark rather
// than as a shape continuing past the page.
const BANDS = [
  { inner: COLUMN_LEFT, outer: -50, dir: -1 },
  { inner: COLUMN_RIGHT, outer: 1250, dir: 1 },
]

// The furthest randomShape can throw a vertex from the centre it is handed, as
// a multiple of the radius: the longest radius (1.16) times the widest stretch
// (1 / 0.72). Kept next to the two numbers it is derived from, and used below
// to keep a fragment's *reach* out of the reading column rather than only its
// centre -- which is what a fragment 200 units across needs, and what the old
// centre-only band check did not give it.
const SHAPE_REACH = 1.62

// How many positions a fragment may be offered before it is dropped. The jitter
// distribution is unchanged -- each attempt draws from exactly the same
// `spread` box the single attempt used to -- so this only decides how hard the
// scatter tries before accepting a gap.
//
// 14 IS THE KNEE, AND THE CURVE IS FLAT. Across the site's fourteen seeds the
// drop rate is 46% at 8 attempts, 44% at 14, 42% at 24 and 35% at 80 -- so
// raising it buys about one extra fragment per slide for several times the
// work. The reason it plateaus rather than converging is geometric: a cluster
// jitters its members inside a box of `spread` (1.6r) while a fragment reaches
// up to about 2.1r, so a second fragment in a cluster usually has nowhere to go
// that clears the first, however many times it is asked. That is a property of
// the cluster sizing, which is deliberately unchanged here -- the scatter is
// roughly half as dense as it was, and every fragment left is its own shape.
const PLACEMENT_ATTEMPTS = 14

// Six to thirty fragments, clustered, in the two margins. Small fused clusters rather
// than one shape per spot: every shape is a hole in one <clipPath>, so
// overlapping shapes merge instead of doubling in opacity -- which is what
// makes a cluster read as one torn piece rather than as a darker patch, and
// what makes this safe to put beside a chart at all.
//
// SIZES CAME DOWN when the outlines went to three and four sides. At the old
// 30-135 cluster radius a fragment could span 350 units of a 340-wide margin,
// so what the reader saw was one soft-edged mass per side and the geometry was
// academic. At 32-86 a fragment spans roughly forty to two hundred units --
// one to six weave units across, which is enough of the tile to read as cloth
// and little enough that the triangle or quad holding it is still a shape
// rather than a field. The range is what keeps the margins from settling at
// one weight: large anchors, small debris.
//
// The floor is set by the weave rather than by taste. Below about one and a
// half tiles a fragment shows two or three strokes, which at 0.05 opacity is
// a smudge -- so the smallest shapes here are still large enough to be
// recognisably woven.
//
// The cluster spread widens with the cluster's own size so a cluster of large
// shapes does not fuse into one blob while a cluster of small ones sits in
// three separate specks -- a flat jitter did both.
function scatterShapes(rand, prefix) {
  const shapes = []
  // Every fragment already accepted, as coordinates, so each new candidate can
  // be tested against them. Both bands are disjoint in x, so this never
  // compares a left-hand fragment with a right-hand one in practice -- it is
  // one list because it does not need to be two.
  const placed = []
  BANDS.forEach((band, bi) => {
    const clusters = 3 + Math.floor(rand() * 3)
    for (let c = 0; c < clusters; c++) {
      const cx = band.inner + rand() * (band.outer - band.inner)
      const cy = 40 + rand() * 560
      const r = 32 + rand() * 54
      const fused = 1 + Math.floor(rand() * 3)
      const spread = r * 1.6
      for (let s = 0; s < fused; s++) {
        // Each shape in a cluster varies around the cluster's radius rather
        // than drawing its own, so a cluster still reads as one thing.
        //
        // Drawn once, outside the placement loop below, so that rejecting a
        // position never re-rolls the size. Redrawing it there would quietly
        // bias the margins small, because a smaller fragment is likelier to
        // find a free spot -- the sizing distribution has to survive the
        // rejection sampling unchanged.
        const sr = r * (0.7 + rand() * 0.6)
        // Pushed outward by its own reach if it would otherwise cross into the
        // column. Because the push scales with the fragment, the big ones end
        // up out at the page edge and only the small ones sit close to the
        // text -- which is the gradient a printed margin has anyway.
        const limit = band.inner + band.dir * sr * SHAPE_REACH
        let shape = null
        for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS && !shape; attempt++) {
          const jx = (rand() - 0.5) * spread
          const jy = (rand() - 0.5) * spread
          const x = band.dir < 0 ? Math.min(cx + jx, limit) : Math.max(cx + jx, limit)
          const candidate = randomShape(rand, x, cy + jy, sr)
          if (!placed.some((other) => overlaps(candidate, other))) shape = candidate
        }
        // Nowhere free in this cluster: the fragment is dropped rather than
        // laid on top of one already there. A cluster of three large shapes in
        // a spread this tight genuinely cannot hold three, and a mat with a
        // gap in it is still a mat -- two pieces merged into a seven-sided blob
        // is not. This is why the fragment count per seed is now a ceiling
        // rather than an exact number.
        if (!shape) continue
        placed.push(shape)
        shapes.push(<polygon key={`${prefix}-${bi}-${c}-${s}`} points={pointsAttr(shape)} />)
      }
    }
  })
  return shapes
}

// THE CLOTH AND THE CUT, AS TWO SEPARATE THINGS. The <pattern> is fixed at
// WEAVE_UNIT and the seed never touches it; the <clipPath> is the only thing
// the seed decides. That split is the whole design: a section's margins differ
// from the next section's in what was cut, never in what it was cut from.
function WeaveScatter({ seed, opacity, id }) {
  const rand = mulberry32(seedFromString(String(seed ?? 'default')))
  const shapes = scatterShapes(rand, id)
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
          <pattern id={tileId} width={WEAVE_UNIT} height={WEAVE_UNIT} patternUnits="userSpaceOnUse">
            {weaveTile()}
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

  // No `scale` here, and that is rule (3): the scatter's weave is WEAVE_UNIT
  // and nothing else, so there is no per-section knob that could put two
  // sections' margins on different-sized cloth. `scale` still reaches the
  // tiling motifs below, which are chrome and tile edge to edge.
  if (pattern === 'weaveScatter') {
    return <WeaveScatter seed={seed} opacity={opacity} id={id} />
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
