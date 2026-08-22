import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import CountryPicker from './CountryPicker.jsx'
import MapControlIcon from './MapControlIcon.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { chartColorsFor, MAP_COLORS } from '../utils/theme.js'
import { resetSvg } from '../utils/d3helpers.js'
import { motionDuration } from '../utils/motion.js'
import { loadLandTopology } from '../utils/loadLand.js'
import { useNationHighlight } from '../hooks/useNationHighlight.jsx'

// Illustrative Pacific map: real coastlines, fixed markers, pan and zoom, click
// to select. Two selections at most, because everything downstream of this
// slide is a pairwise comparison.
//
// The land is real TopoJSON; the markers are hand-placed at nation centroids
// rather than derived, because the four nations are archipelagos and a computed
// centroid lands in open water often enough to be wrong.
export const NATIONS = [
  { name: 'Fiji', lat: -18.14, lon: 178.44 },
  { name: 'Solomon Islands', lat: -9.43, lon: 159.95 },
  { name: 'Vanuatu', lat: -17.73, lon: 168.32 },
  { name: 'Tonga', lat: -21.14, lon: -175.2 },
]

const WIDTH = 700
const HEIGHT = 460

// What the selected storm did to this nation, in the storm's own words -- the
// date and category from its profile, and the death toll with the same
// reported/unreported distinction the profile chart makes. A nation the storm
// never reached says so, because a marker with nothing under it reads as
// missing data rather than as a country that was spared.
function stormBlurb(nation, storm) {
  if (!storm) return nation.blurb ?? null
  const entry = storm.profile?.find((p) => p.name === nation.name)
  if (!entry) return `${storm.name} did not reach ${nation.name}.`

  const toll =
    entry.deaths == null
      ? 'Deaths never reported.'
      : `${entry.deaths} ${entry.deaths === 1 ? 'death' : 'deaths'} reported.`
  return `${entry.date}. ${entry.categoryLabel}. ${toll}`
}

// Built from live selection state so the "tap to select / compare / deselect"
// hint is accurate whenever the hover, focus or tap happens.
function markerTooltipContent(nation, selected, storm) {
  const i = selected.indexOf(nation.name)
  let status
  if (i !== -1) status = 'Selected -- tap again to deselect.'
  else if (selected.length >= 2) status = 'Tap to swap into the comparison.'
  else if (selected.length === 1) status = 'Tap to compare with your first pick.'
  else status = 'Tap to select.'

  const blurb = stormBlurb(nation, storm)

  return (
    <>
      <p className="font-semibold">{nation.name}</p>
      {blurb && <p className="opacity-80">{blurb}</p>}
      <p className="mt-1 opacity-70">{status}</p>
    </>
  )
}

// Props:
//   nations -- array of { name, lat, lon, blurb }, defaults to the
//     cyclone-nation set. Other hazard pages pass their own since
//     which nations have usable data varies by hazard.
//   storm -- the selected storm, or null. Nations it did not reach are faded
//     and their aria-labels say so. They stay selectable on purpose: a country
//     the storm missed is the nearest thing this data has to a control, and the
//     ripple chain draws it for exactly that reason. Fading is a statement
//     about the storm, not a restriction on the reader.
//   selected -- array of up to two nation names, in the order picked
//   onToggle -- (name) => void, called on marker click / Enter / Space
//   onClear -- () => void, clears the current selection
//   style -- forwarded to the underlying Section
export default function MapView({ nations = NATIONS, storm, selected, onToggle, onClear, style }) {
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const zoomRef = useRef(null)
  // Pointing at a pin also dims the other countries out of every chart on the
  // page. Held in a ref because the map is built once, inside an effect that
  // must not re-run when the highlight changes -- rebuilding it would throw
  // away the reader's pan and zoom.
  const { setHighlight } = useNationHighlight()
  const setHighlightRef = useRef(setHighlight)
  setHighlightRef.current = setHighlight

  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()

// Which country the reader is pointing at, for the summary under the map.
// Kept apart from the committed selection so hovering a second country does not
// disturb the one being followed -- the same split the timeline's preview uses.
  const [preview, setPreview] = useState(null)
  const setPreviewRef = useRef(setPreview)
  setPreviewRef.current = setPreview

  // The setup effect runs once, so its D3 closures would capture `selected` at
  // mount and never see a later pick. A ref keeps the hint current without
  // rebuilding the map, which would reset pan and zoom.
  const [built, setBuilt] = useState(false)
  const selectedRef = useRef(selected)
  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  // Same reasoning again, for the storm. The setup effect deliberately does not
  // re-run when the storm changes -- rebuilding would throw away the reader's
  // pan and zoom -- so without a ref the D3 handlers would keep describing
  // whichever storm happened to be selected when the map was first built.
  const stormRef = useRef(storm)
  useEffect(() => {
    stormRef.current = storm
  }, [storm])

  // Same reasoning, for the map's initial ocean/land paint.
  const themeRef = useRef(theme)
  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  // Build the map once. Selection and theme recolouring happen in the effects
  // below so pan/zoom survives a marker click. `cancelled` guards against the
  // async coastline fetch resolving after unmount.
  useEffect(() => {
    let cancelled = false

    async function setup() {
      const land50m = await loadLandTopology()
      if (cancelled || !svgRef.current) return

      const svg = resetSvg(svgRef, WIDTH, HEIGHT)

      // Antimeridian at the centre, or nations either side of 180deg (Fiji
      // +178, Samoa -172) land on opposite edges of the map.
      const projection = d3.geoMercator().rotate([-180, 0])

      const points = {
        type: 'FeatureCollection',
        features: nations.map((n) => ({
          type: 'Feature',
          properties: { name: n.name },
          geometry: { type: 'Point', coordinates: [n.lon, n.lat] },
        })),
      }
      // Fitted to the current nation set, not the world. The 65px padding keeps
      // labels and the zoom buttons off a marker near an edge.
      projection.fitExtent(
        [
          [65, 65],
          [WIDTH - 65, HEIGHT - 65],
        ],
        points
      )

      const g = svg.append('g')
      gRef.current = g
      // Signals that the async setup has finished. Effects that style the
      // markers key off this: they run once on mount, find nothing built yet
      // because the coastline is still loading, and would otherwise never run
      // again if their own dependency never changes afterwards. That is exactly
      // what happened to the storm fade once the map stopped being rendered
      // until after a storm was already chosen -- the fade simply never applied.
      setBuilt(true)

      // Classed so the theme effect below can recolour these in place.
      const initialColors = MAP_COLORS[themeRef.current] ?? MAP_COLORS.light
      g.append('rect')
        .attr('class', 'ocean-bg')
        .attr('x', -2000)
        .attr('y', -2000)
        .attr('width', WIDTH + 4000)
        .attr('height', HEIGHT + 4000)
        .attr('fill', initialColors.ocean)

      const geoPath = d3.geoPath(projection)
      const landFeature = feature(land50m, land50m.objects.land)
      g.append('path')
        .attr('class', 'land')
        .datum(landFeature)
        .attr('d', geoPath)
        .attr('fill', initialColors.land)
        .attr('stroke', initialColors.coastline)
        .attr('stroke-width', 0.5)

      // Wheel is excluded so scrolling past the map doesn't zoom it. Drag and
      // pinch stay on.
      const zoom = d3
        .zoom()
        .scaleExtent([1, 6])
        .filter((event) => event.type !== 'wheel')
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })
      zoomRef.current = zoom
      svg.call(zoom)

      const marker = g
        .selectAll('g.marker')
        .data(nations)
        .join('g')
        .attr('class', 'marker')
        .attr('transform', (d) => {
          const [x, y] = projection([d.lon, d.lat])
          return `translate(${x},${y})`
        })
        .attr('role', 'button')
        .attr('tabindex', 0)
        .attr('aria-label', (d) => `Select ${d.name}`)
        .on('click', (event, d) => {
          onToggle(d.name)
          // selectedRef hasn't caught this toggle yet: one beat behind, once.
          showTooltip(event, markerTooltipContent(d, selectedRef.current, stormRef.current))
        })
        .on('keydown', (event, d) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle(d.name)
          }
        })
        .on('pointerenter pointermove', (event, d) => {
          setHighlightRef.current(d.name)
          setPreviewRef.current(d.name)
          showTooltip(event, markerTooltipContent(d, selectedRef.current, stormRef.current))
        })
        .on('pointerleave', () => {
          setHighlightRef.current(null)
          setPreviewRef.current(null)
          hideTooltip()
        })
        .on('focus', (event, d) => {
          setHighlightRef.current(d.name)
          setPreviewRef.current(d.name)
          showTooltip(event, markerTooltipContent(d, selectedRef.current, stormRef.current))
        })
        .on('blur', () => {
          setHighlightRef.current(null)
          setPreviewRef.current(null)
          hideTooltip()
        })

      // Comfortable tap target without enlarging the visible dot.
      marker
        .append('circle')
        .attr('class', 'marker-hit')
        .attr('r', 18)
        .attr('fill', 'transparent')
        .attr('pointer-events', 'all')

      // Resolved once: themeRef can't change mid-append, and three lookups for
      // one palette invited them to drift apart.
      const markerPalette = chartColorsFor(themeRef.current)

      marker
        .append('circle')
        .attr('class', 'marker-dot')
        .attr('r', 7)
        .attr('fill', markerPalette.idle)
        .attr('stroke', markerPalette.markRing)
        .attr('stroke-width', 1.5)
        .style('transition', 'r 150ms ease-out')

      marker
        .append('text')
        .attr('class', 'marker-badge')
        .attr('text-anchor', 'middle')
        .attr('y', 4)
        .attr('font-size', 9)
        .attr('font-weight', 700)
        .attr('fill', markerPalette.onMark)
        .style('pointer-events', 'none')

      marker
        .append('text')
        .attr('class', 'marker-label')
        .text((d) => d.name)
        .attr('x', 12)
        .attr('y', 4)
        .attr('font-size', 11)
        .attr('fill', 'currentColor')
        .style('pointer-events', 'none')

      // Shrinks back to whichever resting size is currently right (8.5 when
      // selected, 7 when not) -- the selection pop below leaves either.
      marker
        .on('pointerenter.grow', function () {
          d3.select(this).select('circle.marker-dot').attr('r', 10)
        })
        .on('pointerleave.grow', function (event, d) {
          const resting = selectedRef.current.includes(d.name) ? 8.5 : 7
          d3.select(this).select('circle.marker-dot').attr('r', resting)
        })
    }

    setup()
    return () => {
      cancelled = true
    }
    // `nations` is intentionally excluded: every caller passes a fixed array,
    // and the whole component remounts on a route change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recolour pins and show a 1/2 badge on selection, without rebuilding. The
  // dot overshoots then settles, so a pick reads as confirmed.
  useEffect(() => {
    if (!gRef.current) return
    const markers = gRef.current.selectAll('g.marker')
    const palette = chartColorsFor(theme)
    const duration = motionDuration(200)

    markers
      .select('circle.marker-dot')
      .transition()
      .duration(duration)
      .attr('fill', (d) => {
        const i = selected.indexOf(d.name)
        return i === -1 ? palette.idle : palette.selection[i]
      })
      .transition()
      .duration(motionDuration(180))
      .ease(d3.easeBackOut.overshoot(2.5))
      .attr('r', (d) => (selected.includes(d.name) ? 8.5 : 7))

    markers
      .select('circle.marker-dot')
      .attr('stroke', palette.markRing)

    markers
      .select('text.marker-badge')
      .attr('fill', palette.onMark)
      .text((d) => {
        const i = selected.indexOf(d.name)
        return i === -1 ? '' : String(i + 1)
      })
    // `theme` is a dependency because the pin colours live in the same
    // palette the charts use, and that palette flips with the theme.
  }, [selected, theme, built])

  // Fade the nations this storm never reached, matching .nation-unstruck in the
  // charts so the map and the chain agree about who was hit. Opacity only --
  // pointer events are untouched, because these markers must stay clickable.
  useEffect(() => {
    if (!gRef.current) return
    gRef.current
      .selectAll('g.marker')
      .transition()
      .duration(motionDuration(200))
      .style('opacity', (d) => (!storm || storm.nations.includes(d.name) ? 1 : 0.42))

    // The visual fade is invisible to a screen reader, so the label carries it.
    gRef.current
      .selectAll('g.marker')
      .attr('aria-label', (d) =>
        !storm || storm.nations.includes(d.name)
          ? `Select ${d.name}`
          : `Select ${d.name}. Not struck by ${storm.name}; shown for comparison.`
      )
  }, [storm, built])

  // No-ops if setup() hasn't finished; that race is covered by themeRef.
  useEffect(() => {
    if (!gRef.current) return
    const colors = MAP_COLORS[theme] ?? MAP_COLORS.light
    const duration = motionDuration(200)
    gRef.current.select('rect.ocean-bg').transition().duration(duration).attr('fill', colors.ocean)
    gRef.current
      .select('path.land')
      .transition()
      .duration(duration)
      .attr('fill', colors.land)
      .attr('stroke', colors.coastline)
  }, [theme])

  function zoomBy(factor) {
    if (!zoomRef.current || !svgRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(motionDuration(200))
      .call(zoomRef.current.scaleBy, factor)
  }

  function resetView() {
    if (!zoomRef.current || !svgRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(motionDuration(200))
      .call(zoomRef.current.transform, d3.zoomIdentity)
  }

  // Pointed-at first, then the most recent pick. Falling back to the selection
  // means the summary keeps saying something useful after the pointer leaves,
  // which is the state a touch reader is in for all but the moment of the tap.
  const summaryFor = preview ?? selected[selected.length - 1] ?? null

  return (
    <Section style={style}>
      <h2 className="type-h2 mb-2">Explore the Pacific</h2>
      <p className="prose-column prose-wide prose-short mb-3 text-sm opacity-70">
        Every country on this map is selectable. Tap a marker to select it, tap a second one to
        compare, and the ripple chain, the divergence and the comparison all follow your pick. Drag
        to pan, pinch to zoom, or use the buttons.
      </p>
      <div ref={containerRef} className="map-frame relative">
        {/* overflow-hidden is load-bearing: the ocean rect is drawn far past
            the viewBox so panning never reveals empty space, and without a clip
            its laid-out width pushed the whole page into horizontal overflow.
            Also what makes rounded-2xl round the contents, not just the border. */}
        <svg
          ref={svgRef}
          role="img"
          aria-label={
            storm
              ? `Map of the Pacific with ${nations.length} selectable nations. ${storm.name} struck ${storm.nations.length} of them.`
              : `Map of the Pacific with ${nations.length} selectable nations`
          }
          className="h-auto w-full overflow-hidden rounded-2xl border-2 border-ink/15 shadow-sm"
        />
        {/* Top-right: a bottom-right column covered Tonga's label. */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {/* 44px: minimum comfortable touch target, and this is the section
              where a mis-tap is most disruptive. */}
          <button
            type="button"
            onClick={() => zoomBy(1.5)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface/50 shadow-sm backdrop-blur-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-surface/70 active:scale-90"
            aria-label="Zoom in"
          >
            <MapControlIcon kind="zoomIn" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.5)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface/50 shadow-sm backdrop-blur-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-surface/70 active:scale-90"
            aria-label="Zoom out"
          >
            <MapControlIcon kind="zoomOut" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface/50 shadow-sm backdrop-blur-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-surface/70 active:scale-90"
            aria-label="Reset view"
          >
            <MapControlIcon kind="reset" />
          </button>
        </div>
        <Tooltip tooltip={tooltip} />
      </div>
      {/* The summary, the picker and the reset, in that order: what you are
          pointing at, the other way to point at it, and the way back out.

          The height is reserved whether or not there is anything to say, so
          moving the pointer across the map does not shunt the picker below it
          up and down the slide. */}
      <div className="mt-4 min-h-[3.5rem] rounded-xl border border-ink/10 bg-surface/50 px-4 py-3 text-sm">
        {summaryFor ? (
          <>
            <p className="font-semibold">
              {summaryFor}
              {selected.includes(summaryFor) && (
                <span className="ml-2 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                  Selected {selected.indexOf(summaryFor) + 1}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs leading-snug opacity-75">
              {stormBlurb({ name: summaryFor }, storm) ?? 'No storm selected.'}
            </p>
          </>
        ) : (
          <p className="opacity-60">
            Point at a country, or tab to one, for what {storm ? storm.name : 'the storm'} did
            there.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <CountryPicker
          nations={nations}
          selected={selected}
          storm={storm}
          onToggle={onToggle}
          onPreview={setPreview}
        />
        {/* Always present once there is something to clear, and a real
            control rather than a line of underlined text: this is the way
            back to an unselected map, and the reader should not have to
            wonder whether it is a link. */}
        <div className="min-h-[44px]">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="press-target animate-pop-in min-h-[44px] rounded-full border border-ink/20 px-4 py-2 text-sm opacity-80 transition-opacity duration-150 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>
    </Section>
  )
}
