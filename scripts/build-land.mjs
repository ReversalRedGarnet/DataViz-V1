/*
  Regenerate public/land-50m.json, clipped to the Pacific.

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

  The window is generous on purpose -- it reaches from Papua New Guinea to well
  east of Tonga and from the equator into the Tasman -- so a reader dragging the
  map at 1x still finds coastline rather than empty ocean at the edges.

  Output stays TopoJSON with the same `objects.land` shape, so nothing in
  utils/map.js or loadLand.js changes.
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
const TARGET = path.join(here, '..', 'public', 'land-50m.json')

// Longitudes are normalised into 0..360 before testing, because this window
// straddles the antimeridian -- the same reason the projection is rotated.
const BOX = { lonMin: 138, lonMax: 222, latMin: -38, latMax: 8 }
const norm = (lon) => (lon < 0 ? lon + 360 : lon)

function ringTouchesBox(ring) {
  return ring.some(([lon, lat]) => {
    const l = norm(lon)
    return l >= BOX.lonMin && l <= BOX.lonMax && lat >= BOX.latMin && lat <= BOX.latMax
  })
}

const world = JSON.parse(fs.readFileSync(SOURCE, 'utf8'))
const land = feature(world, world.objects.land)

// Keep whole polygons that intersect the window rather than cutting them at the
// edge: a clipped coastline leaves a straight artificial line where the box was,
// which reads as a landmass with a ruler-edged shore.
const kept = []
for (const f of land.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const poly of polys) {
    if (ringTouchesBox(poly[0])) kept.push(poly)
  }
}

const clipped = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'MultiPolygon', coordinates: kept },
}

// Quantisation grid is set by topology()'s second argument. 1e5 over this
// window is roughly a 1e-3 degree grid -- about 100 m, far finer than a 0.5px
// coastline stroke can show at 6x zoom.
//
// NO SIMPLIFICATION. It was tried and removed. Clipping alone takes the world's
// 60,629 points down to 4,250, and at that size topojson-simplify made the file
// LARGER at every threshold that kept the coastlines intact -- the arc structure
// it produces costs more than the points it removes. Every vertex inside the
// window is the vertex Natural Earth published, which is the honest thing for a
// map whose subject is small islands.
const out = topology({ land: clipped }, 1e5)

fs.writeFileSync(TARGET, JSON.stringify(out))

const bytes = fs.statSync(TARGET).size
console.log(`kept ${kept.length} polygons`)
console.log(`wrote ${TARGET} (${(bytes / 1024).toFixed(0)} KB raw)`)
