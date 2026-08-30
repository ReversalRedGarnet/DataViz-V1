/*
  Regenerate public/land-50m.json and public/land-50m-wide.json, both clipped
  from world-atlas's land-50m.json.

    node scripts/build-land.mjs

  WHY THIS EXISTS. The file shipped here was world-atlas's land-50m.json,
  byte-identical and unclipped -- the whole world's coastlines, at 174 KB
  gzipped. That was LARGER THAN THE ENTIRE JAVASCRIPT BUNDLE, for a map that
  only ever shows four Pacific nations at a zoom capped at 6x.

  Clipping rather than downsampling is deliberate. world-atlas also ships a
  110m land file at 21 KB gzipped, which is tempting until you zoom: at 110m the
  Solomon, Vanuatu and Tongan archipelagos start dropping islands, and those
  islands are the subject. Keeping 50m detail and throwing away the continents
  nobody can pan to costs nothing visible.

  TWO FILES, NOT ONE. utils/loadLand.js's loadLandTopology() is the one fetch
  MapView.jsx and StormJourney.jsx both use, at a fixed padding of 150 --
  their crop never reaches New Zealand's South Island or Tasmania. The opening
  poem (IslanderPoem.jsx, via CoastlineWash.jsx's `wide` prop) asks for a far
  larger padding of 270 and its crop does reach them, so it fetches a second,
  larger file instead of forcing MapView and StormJourney to ship and re-walk
  (StormJourney rebuilds its geoPath on every storm selection) geometry they
  never render a single pixel of. Keep these two boxes and two outputs
  separate -- collapsing them back into one file re-couples the poem's needs
  to the interactive map's payload size, which is the exact thing this split
  exists to prevent. See utils/loadLand.js and CoastlineWash.jsx for the
  fetch/prop side of the split.

  THE WINDOWS ARE NOT EYEBALLED.

  BOX_PACIFIC is the original window this file has always used: sized to what
  MapView and StormJourney actually draw, at their fixed 150 padding.

  BOX_WIDE is sized to the widest this layer is ever actually asked to show:
  <CoastlineWash padding={270} ... /> in IslanderPoem.jsx -- the largest
  padding any caller passes, and therefore the most zoomed-out this projection
  ever gets. Reproducing that exact call (pacificProjection() + fitToPoints()
  from utils/map.js, at the component's fixed 960x640 drawing surface) and
  running projection.invert() on the corners and edge midpoints of the full
  0,0-960,640 viewBox -- not just the fitExtent box padding leaves around the
  four nations, since preserveAspectRatio="xMidYMid slice" means the whole
  viewBox is what can reach the screen -- gives the true visible extent at
  that zoom: roughly 114 to 231 degrees longitude (0-360 form) and -47.7 to
  22.7 degrees latitude. BOX_WIDE pads that out by a further ~8 degrees on
  every side (to 106-239 / -56-31) so a landmass is never kept by grazing the
  box at a single vertex right at its edge, and to leave a little room for a
  future caller with a wider padding than 270 without silently reintroducing
  this bug. See git history for the scratch script that computed the extent,
  if that number ever needs rechecking against a changed padding or a changed
  set of nations.

  BECAUSE WHOLE POLYGONS ARE KEPT, NOT CLIPPED (see ringTouchesBox below), each
  box only has to touch a landmass, not contain it -- so both are deliberately
  generous rather than tight. For BOX_WIDE that pulls in countries with
  nothing to do with the four project nations -- Australia, Indonesia, Papua
  New Guinea, all of New Zealand including Stewart Island -- which is the
  point, not a leak: a tighter box (latMin: -38, BOX_PACIFIC's value) sits
  north of New Zealand's South Island and all of Tasmania, silently dropping
  both from a file that wants to show them. A reader dragging the poem's map
  still finds coastline rather than empty ocean at the edges, and every
  landmass that does appear is a complete, unclipped shape.

  Output stays TopoJSON with the same `objects.land` shape in both files, so
  nothing in utils/map.js changes, and loadLand.js's two loaders differ only
  in which URL they fetch.
*/
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { feature } from 'topojson-client'
import topojsonServer from 'topojson-server'

// CommonJS; Node will not give named exports for it.
const { topology } = topojsonServer

const here = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.join(here, '..', 'node_modules', 'world-atlas', 'land-50m.json')

const BOX_PACIFIC = { lonMin: 138, lonMax: 222, latMin: -38, latMax: 8 }
const BOX_WIDE = { lonMin: 106, lonMax: 239, latMin: -56, latMax: 31 }

// Longitudes are normalised into 0..360 before testing, because both windows
// straddle the antimeridian -- the same reason the projection is rotated.
const norm = (lon) => (lon < 0 ? lon + 360 : lon)

function ringTouchesBox(ring, box) {
  return ring.some(([lon, lat]) => {
    const l = norm(lon)
    return l >= box.lonMin && l <= box.lonMax && lat >= box.latMin && lat <= box.latMax
  })
}

const world = JSON.parse(fs.readFileSync(SOURCE, 'utf8'))
const land = feature(world, world.objects.land)

function build(box, targetName) {
  const TARGET = path.join(here, '..', 'public', targetName)

  // Keep whole polygons that intersect the window rather than cutting them at
  // the edge: a clipped coastline leaves a straight artificial line where the
  // box was, which reads as a landmass with a ruler-edged shore.
  const kept = []
  for (const f of land.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    for (const poly of polys) {
      if (ringTouchesBox(poly[0], box)) kept.push(poly)
    }
  }

  const clipped = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiPolygon', coordinates: kept },
  }

  // Quantisation grid is set by topology()'s second argument. 1e5 over these
  // windows is roughly a 1e-3 degree grid -- about 100 m, far finer than a
  // 0.5px coastline stroke can show at 6x zoom.
  //
  // NO SIMPLIFICATION. It was tried and removed. Clipping alone takes the
  // world's 60,629 points down to a few thousand, and at that size
  // topojson-simplify made the file LARGER at every threshold that kept the
  // coastlines intact -- the arc structure it produces costs more than the
  // points it removes. Every vertex inside the window is the vertex Natural
  // Earth published, which is the honest thing for a map whose subject is
  // small islands.
  const out = topology({ land: clipped }, 1e5)

  fs.writeFileSync(TARGET, JSON.stringify(out))

  const bytes = fs.statSync(TARGET).size
  console.log(`kept ${kept.length} polygons`)
  console.log(`wrote ${TARGET} (${(bytes / 1024).toFixed(0)} KB raw)`)
}

build(BOX_PACIFIC, 'land-50m.json')
build(BOX_WIDE, 'land-50m-wide.json')
