import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import { pacificProjection, fitToPoints } from '../utils/map.js'
import { loadLandTopology } from '../utils/loadLand.js'
import { NATION_COORDS } from '../content/nations.js'
import { STORMS } from '../content/storms.js'

// THE TITLE CARD'S TEXTURE, MADE OF THE ROSTER.
//
// What was here before is still here: Atmosphere's rings, and the scattered
// weave motif from content/patterns.js. Both are decoration in the strict
// sense -- they carry nothing, and switching them off costs nothing. This
// layer sits behind them and is decoration that happens to be true: the
// coastline of the region the piece is about, and the six storm paths the
// headline is counting.
//
// It is still ornament and is still treated as such -- hidden from assistive
// technology, incapable of taking a pointer event, and carrying no information
// a reader needs, since the same six storms are spelled out in the kicker,
// drawn as pips below the headline and given a section each further down. A
// reader with images off or a failed fetch loses nothing but the texture.
//
// WHY THE PATHS ARE NOT LABELLED, and why they are drawn this faint: a legible
// map here would be a second map competing with the real one four slides down,
// and a legible one competing for the same attention as the headline. The
// intent is that a reader registers "storm tracks" without reading them --
// close to how the eye takes a watermark.
//
// WHAT A PATH ACTUALLY IS. The same construction the storm journey uses: a
// smoothed line through the documented impact points of the nations that storm
// reached, in the order it reached them, from the one coordinate table the
// whole site positions marks from. It is NOT an official track, which is why
// it is never presented as one -- the journey map says so in a note, and here
// it says nothing because it claims nothing.
//
// A storm that reached only one nation would be a single point with no line to
// draw; every storm on the roster reached at least two, but the filter below
// makes that a property of the code rather than of the current roster.

// The drawing surface. Fixed rather than measured: this is a background wash,
// so it is sized by CSS to fill the hero and cropped by preserveAspectRatio,
// which means a resize never needs to reach JavaScript. No observer, no
// redraw, no work on a window drag -- which is exactly the budget a decorative
// layer deserves.
const VIEW_W = 960
const VIEW_H = 640

export default function HeroWash({ className = '' }) {
  const ref = useRef(null)
  const [land, setLand] = useState(null)

  // A failed coastline fetch leaves `land` null and the component renders the
  // storm paths alone against nothing. That degrades honestly: the layer is
  // quieter than intended and the hero is otherwise untouched. It is not worth
  // an error state, because there is no error a reader could act on.
  useEffect(() => {
    let live = true
    loadLandTopology()
      .then((topo) => {
        if (live) setLand(topo)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    // Fitted to the four nations, not to the coastline: the coastline file
    // covers a far wider window than this project does, so fitting to it would
    // put the four countries in a small cluster in the middle of an ocean.
    // Generous padding because this is cropped by `slice` -- the fit decides
    // what is central, and the viewport decides how much of the rest survives.
    const projection = fitToPoints(pacificProjection(), Object.values(NATION_COORDS), {
      width: VIEW_W,
      height: VIEW_H,
      padding: 150,
    })

    if (land) {
      const path = d3.geoPath(projection)
      svg
        .append('path')
        .attr('class', 'hero-wash-land')
        .attr('d', path(feature(land, land.objects.land)))
    }

    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5))

    svg
      .append('g')
      .attr('class', 'hero-wash-tracks')
      .selectAll('path')
      .data(
        STORMS
          // Impact order where the research supplies it, roster order
          // otherwise. A storm without a researched profile still has the
          // list of nations it struck, which is enough to draw a line
          // through -- it just cannot say which end the storm arrived at.
          //
          // The length check is the condition and not `??`: a profile is an
          // array either way, and an array is truthy even when empty, so
          // `profile ?? nations` and `profile || nations` both silently
          // resolve to an empty profile rather than falling back to the
          // roster.
          .map((storm) =>
            storm.profile?.length > 0 ? storm.profile.map((p) => p.name) : storm.nations
          )
          .map((names) => names.map((n) => NATION_COORDS[n]).filter(Boolean))
          // Two points is the minimum a line can be drawn through. Every storm
          // on the current roster reaches at least two nations by the rule that
          // put it there, so this filter removes nothing today -- it is here so
          // that a coordinate missing from the table degrades to one fewer
          // track rather than to a path with a NaN in it, which renders as
          // nothing anyway but logs on every draw.
          .filter((coords) => coords.length > 1)
      )
      .join('path')
      .attr('class', 'hero-wash-track')
      .attr('d', (coords) => line(coords.map((c) => projection(c))))
  }, [land])

  return (
    <div aria-hidden="true" className={`hero-wash ${className}`}>
      <svg
        ref={ref}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      />
    </div>
  )
}
