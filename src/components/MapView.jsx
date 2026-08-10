import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import Section from './Section.jsx'
import Tooltip from './Tooltip.jsx'
import MapControlIcon from './MapControlIcon.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { chartColorsFor, MAP_COLORS } from '../utils/theme.js'
import { resetSvg } from '../utils/d3helpers.js'
import { motionDuration } from '../utils/motion.js'
import { loadLandTopology } from '../utils/loadLand.js'
import { useNationHighlight } from '../hooks/useNationHighlight.jsx'

// Illustrative Pacific map: real coastlines, fixed markers, pan and zoom, click
// to select up to two nations. No tile server or API key -- public/land-50m.json
// is a static export from the 'world-atlas' package, fetched at runtime so it
// stays out of the main bundle.
//
// Default nation set: the four countries Cyclone Harold hit. Coordinates are
// approximate (capital city), which is fine for an illustrative map and not for
// navigation. Other hazard pages pass their own set via the `nations` prop.
export const NATIONS = [
  { name: 'Fiji', lat: -18.14, lon: 178.44, blurb: 'Struck by the same cyclone; moderate, uneven impact.' },
  {
    name: 'Solomon Islands',
    lat: -9.43,
    lon: 159.95,
    blurb: 'A different kind of impact that same week: a ferry capsize, not storm strength.',
  },
  { name: 'Vanuatu', lat: -17.73, lon: 168.32, blurb: 'Hit hardest by Cyclone Harold, April 2020.' },
  { name: 'Tonga', lat: -21.14, lon: -175.2, blurb: 'The lightest direct impact of the four.' },
]

const WIDTH = 700
const HEIGHT = 460

// Built from live selection state so the "tap to select / compare / deselect"
// hint is accurate whenever the hover, focus or tap happens.
function markerTooltipContent(nation, selected) {
  const i = selected.indexOf(nation.name)
  let status
  if (i !== -1) status = 'Selected -- tap again to deselect.'
  else if (selected.length >= 2) status = 'Tap to swap into the comparison.'
  else if (selected.length === 1) status = 'Tap to compare with your first pick.'
  else status = 'Tap to select.'

  return (
    <>
      <p className="font-semibold">{nation.name}</p>
      <p className="opacity-80">{nation.blurb}</p>
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

  // The setup effect runs once, so its D3 closures would capture `selected` at
  // mount and never see a later pick. A ref keeps the hint current without
  // rebuilding the map, which would reset pan and zoom.
  const [built, setBuilt] = useState(false)
  const selectedRef = useRef(selected)
  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

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
          showTooltip(event, markerTooltipContent(d, selectedRef.current))
        })
        .on('keydown', (event, d) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle(d.name)
          }
        })
        .on('pointerenter pointermove', (event, d) => {
          setHighlightRef.current(d.name)
          showTooltip(event, markerTooltipContent(d, selectedRef.current))
        })
        .on('pointerleave', () => {
          setHighlightRef.current(null)
          hideTooltip()
        })
        .on('focus', (event, d) => {
          setHighlightRef.current(d.name)
          showTooltip(event, markerTooltipContent(d, selectedRef.current))
        })
        .on('blur', () => {
          setHighlightRef.current(null)
          hideTooltip()
        })

      // Comfortable tap target without enlarging the visible dot.
      marker
        .append('circle')
        .attr('class', 'marker-hit')
        .attr('r', 18)
        .attr('fill', 'transparent')
        .attr('pointer-events', 'all')

      marker
        .append('circle')
        .attr('class', 'marker-dot')
        .attr('r', 7)
        .attr('fill', chartColorsFor(themeRef.current).idle)
        .attr('stroke', chartColorsFor(themeRef.current).markRing)
        .attr('stroke-width', 1.5)
        .style('transition', 'r 150ms ease-out')

      marker
        .append('text')
        .attr('class', 'marker-badge')
        .attr('text-anchor', 'middle')
        .attr('y', 4)
        .attr('font-size', 9)
        .attr('font-weight', 700)
        .attr('fill', chartColorsFor(themeRef.current).onMark)
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

  return (
    <Section style={style}>
      <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">Explore the Pacific</h2>
      <p className="mb-5 max-w-prose text-sm opacity-70">
        Tap a marker to select it, tap a second one to compare. Drag to pan, pinch to zoom, or use
        the buttons.
      </p>
      <div ref={containerRef} className="relative">
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
      <div className="mt-3 min-h-[1.25rem]">
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="animate-pop-in text-sm opacity-70 underline transition-opacity duration-150 hover:opacity-100"
          >
            Clear selection
          </button>
        )}
      </div>
    </Section>
  )
}
