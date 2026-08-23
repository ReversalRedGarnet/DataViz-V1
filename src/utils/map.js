import * as d3 from 'd3'
import { feature } from 'topojson-client'
import { MAP_COLORS } from './theme.js'

// THE PACIFIC BASEMAP, DRAWN ONCE.
//
// Two components put a map on screen -- the interactive MapView and the
// StormJourney track -- and both were independently doing the same five things:
// rotate a Mercator projection onto the antimeridian, fit it to a set of
// points, append an ocean rectangle, append the land path, and colour all three
// from MAP_COLORS. Twenty-five lines duplicated, including two lessons that had
// been learned the hard way in one file and re-learned in the other.
//
// Both lessons are encoded below rather than left to a call site to remember.

// Antimeridian at the centre, or nations either side of 180deg (Fiji +178,
// Samoa -172) land on opposite edges of the map. This is LESSON ONE, and it is
// not optional for anything drawn in this region.
export function pacificProjection() {
  return d3.geoMercator().rotate([-180, 0])
}

// A projection fitted to the given [lon, lat] pairs, with `padding` px of room
// on every side. The padding is what keeps labels and controls off a marker
// sitting near an edge.
export function fitToPoints(projection, coords, { width, height, padding }) {
  projection.fitExtent(
    [
      [padding, padding],
      [width - padding, height - padding],
    ],
    {
      type: 'FeatureCollection',
      features: coords.map((coordinates) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates },
      })),
    }
  )
  return projection
}

// Append the ocean rectangle and the land path to `g`, coloured for `theme`.
//
// LESSON TWO, and the reason the fills are set here rather than left to a paint
// pass: an SVG shape with no fill attribute is BLACK. Any gap between creating
// these and colouring them is a black rectangle the size of the map -- for one
// frame if you are lucky, and permanently if the paint pass is keyed on a state
// flag that does not always change. That is precisely what happened to the
// storm journey on its second storm, and the fix belongs in the code that
// creates the shapes.
//
// `bleed` extends the ocean past the viewBox so panning never reveals empty
// space. Pass 0 for a map that cannot pan; the caller then needs no clip.
//
// Both shapes are classed so recolourStops() below can find them again.
export function drawBasemap(g, { land, projection, width, height, theme, bleed = 0 }) {
  const colors = MAP_COLORS[theme] ?? MAP_COLORS.light

  g.append('rect')
    .attr('class', 'ocean-bg')
    .attr('x', -bleed)
    .attr('y', -bleed)
    .attr('width', width + bleed * 2)
    .attr('height', height + bleed * 2)
    .attr('fill', colors.ocean)

  g.append('path')
    .attr('class', 'land')
    .datum(feature(land, land.objects.land))
    .attr('d', d3.geoPath(projection))
    .attr('fill', colors.land)
    .attr('stroke', colors.coastline)
    .attr('stroke-width', 0.5)

  return g
}

// Recolour an existing basemap in place, so a theme flip does not cost a
// rebuild -- which on the interactive map would throw away pan and zoom.
// `duration` of 0 applies the change immediately.
export function recolourBasemap(g, theme, duration = 0) {
  const colors = MAP_COLORS[theme] ?? MAP_COLORS.light
  const ocean = g.select('rect.ocean-bg')
  const land = g.select('path.land')

  if (duration > 0) {
    ocean.transition().duration(duration).attr('fill', colors.ocean)
    land.transition().duration(duration).attr('fill', colors.land).attr('stroke', colors.coastline)
    return
  }

  ocean.attr('fill', colors.ocean)
  land.attr('fill', colors.land).attr('stroke', colors.coastline)
}
