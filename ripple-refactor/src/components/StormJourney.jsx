import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import Section from './Section.jsx'
import { NATIONS } from './MapView.jsx'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { useActiveStep } from '../hooks/useActiveStep.js'
import { useScrollRoot } from '../hooks/useScrollRoot.jsx'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { chartTheme, MAP_COLORS } from '../utils/theme.js'
import { resetSvg } from '../utils/d3helpers.js'
import { motionDuration } from '../utils/motion.js'
import { loadLandTopology } from '../utils/loadLand.js'

// The selected storm's route across the nations it struck, read by scrolling.
// Stops come from the storm registry in the order the storm reached them. The
// map is
// sticky; the steps beside it are what moves, and each one advances the track,
// the storm glyph and the marker states.
//
// The map carries nothing the steps don't already say in text, so it's hidden
// from assistive technology entirely rather than given a description that would
// duplicate the list beside it.
const WIDTH = 800
const HEIGHT = 540

// One coordinate set for the whole site: these are the same approximate
// capital-city positions the interactive map uses.
const COORDS = Object.fromEntries(NATIONS.map((n) => [n.name, [n.lon, n.lat]]))

// Built per storm rather than once at module load: each storm reached a
// different set of nations in a different order, and the track is drawn through
// the stops in array order.
function buildSteps(storm) {
  return (storm?.profile ?? []).map((row) => ({ ...row, lonLat: COORDS[row.name] }))
}

// The connecting sentence for each stop now lives with that stop in
// src/content/storms.js as `lead`, so a storm's facts and the sentences that
// join them cannot drift apart across six storms.

// Distance along a path to the point closest to a given position. The track is
// a smoothed curve through the four stops, so a stop's own coordinates aren't
// exactly on it; sampling finds where the curve actually passes.
function lengthAtPoint(pathNode, [px, py]) {
  const total = pathNode.getTotalLength()
  const samples = 500
  let best = 0
  let bestDistance = Infinity
  for (let i = 0; i <= samples; i++) {
    const length = (i / samples) * total
    const point = pathNode.getPointAtLength(length)
    const distance = (point.x - px) ** 2 + (point.y - py) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = length
    }
  }
  return best
}

// The colour-and-progress pass, as a plain function rather than only an effect
// body, because whoever builds a scene has to be the one who paints it.
//
// It used to live only in an effect keyed on [active, theme, built]. On the
// first storm the coastline is fetched over the network, so setBuilt(false) and
// setBuilt(true) land in different React batches, `built` transitions and the
// effect runs. On every storm after that the topology is cached, the await
// resolves in a microtask, both updates collapse into one batch, `built` never
// changes value and the effect never runs -- leaving the ocean rect and the
// land path with no fill attribute at all. SVG's default fill is black, which
// is why the second storm rendered a black rectangle the size of the map.
function paintScene(scene, { active, theme }) {
  const mapColors = MAP_COLORS[theme] ?? MAP_COLORS.light
  const { ink, palette } = chartTheme(theme)
  const duration = motionDuration(650)

  scene.g.select('rect.ocean-bg').attr('fill', mapColors.ocean)
  scene.g.select('path.land').attr('fill', mapColors.land).attr('stroke', mapColors.coastline)

  const reached = scene.stopLengths[active]
  scene.track
    .attr('stroke', palette.single)
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr('stroke-dashoffset', scene.totalLength - reached)

  const head = scene.trackNode.getPointAtLength(reached)
  scene.eye
    .attr('opacity', 1)
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr('transform', `translate(${head.x},${head.y})`)
  scene.eye.selectAll('path.cyclone-arm').attr('fill', palette.single).attr('fill-opacity', 0.85)
  scene.eye.select('circle.cyclone-core').attr('fill', mapColors.land)

  const stops = scene.g.selectAll('g.stop')
  stops
    .select('circle.stop-dot')
    .attr('stroke', palette.markRing)
    .transition()
    .duration(motionDuration(300))
    .attr('fill', (_, i) => (i <= active ? palette.single : mapColors.coastline))
    .attr('r', (_, i) => (i === active ? 8 : 6))
  stops
    .select('circle.stop-halo')
    .attr('stroke', palette.single)
    .transition()
    .duration(motionDuration(300))
    .attr('stroke-opacity', (_, i) => (i === active ? 0.55 : 0))
    .attr('r', (_, i) => (i === active ? 15 : 9))
  stops
    .select('text.stop-name')
    .attr('fill', ink)
    .transition()
    .duration(motionDuration(300))
    .attr('fill-opacity', (_, i) => (i <= active ? 0.95 : 0.4))
  stops
    .select('text.stop-meta')
    .attr('fill', ink)
    .transition()
    .duration(motionDuration(300))
    .attr('fill-opacity', (_, i) => (i <= active ? 0.7 : 0))
}

// Props:
//   style -- forwarded to the underlying Section (entrance stagger)
export default function StormJourney({ storm, style }) {
  const STEPS = buildSteps(storm)
  const svgRef = useRef(null)
  // Published through state, not a ref: in slideshow layout this element is
  // also the IntersectionObserver root, and a ref's .current is still null on
  // the render where that root has to be chosen.
  const [stepsNode, setStepsNode] = useState(null)
  const sceneRef = useRef(null)
  const [built, setBuilt] = useState(false)

  // Drop the previous storm's scene immediately, so the progress effect below
  // cannot animate a track that belongs to a map no longer on screen.
  useEffect(() => {
    sceneRef.current = null
    setBuilt(false)
  }, [storm?.id])
  const { theme } = useTheme()
  // The steps are read against whatever box is actually scrolling them, and
  // that changes at the split breakpoint.
  //
  // Wide: the map is pinned beside the steps and only the step column moves, so
  // the column is both the container and the observer root.
  // Narrow: the columns stack and the panel scrolls as one, so the root is the
  // panel's scroll region and the column is just a list inside it.
  //
  // Getting this wrong is not a cosmetic failure. An observer rooted on an
  // element that does not scroll has a band that never moves, so a step that
  // has once intersected goes on intersecting, entries stop firing, and the
  // active step can only ever go forwards -- the map reaches the last country
  // and will not come back. That was the scroll-reversal bug on desktop, and
  // until now the narrow layout still had it.
  const panelScroll = useScrollRoot()
  const isSplit = useMediaQuery('(min-width: 768px)')
  const active = useActiveStep(stepsNode, STEPS.length, isSplit ? stepsNode : panelScroll)
  const hasSteps = STEPS.length > 0

  // Read inside build(), which resolves after the render that set them. Held in
  // refs rather than taken as effect dependencies: either one changing must
  // repaint the scene, not rebuild it. Assigned during render, matching the
  // setHighlightRef pattern in MapView.
  const activeRef = useRef(active)
  activeRef.current = active
  const themeRef = useRef(theme)
  themeRef.current = theme

  // Built once. The coastline fetch is the same static file the interactive
  // map uses, so this costs nothing extra after that section has loaded.
  useEffect(() => {
    let cancelled = false

    async function build() {
      const land50m = await loadLandTopology()
      if (cancelled || !svgRef.current) return

      const svg = resetSvg(svgRef, WIDTH, HEIGHT)
      const projection = d3.geoMercator().rotate([-180, 0])
      projection.fitExtent(
        [
          [58, 58],
          [WIDTH - 58, HEIGHT - 58],
        ],
        {
          type: 'FeatureCollection',
          features: STEPS.map((s) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: s.lonLat },
          })),
        }
      )

      // Filled at creation, not left for the paint pass to reach. An SVG shape
      // with no fill attribute is black, so any gap between building this and
      // colouring it is a black rectangle on screen -- for one frame at best.
      const initial = MAP_COLORS[themeRef.current] ?? MAP_COLORS.light

      const g = svg.append('g')
      g.append('rect')
        .attr('class', 'ocean-bg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('fill', initial.ocean)
      g.append('path')
        .attr('class', 'land')
        .datum(feature(land50m, land50m.objects.land))
        .attr('d', d3.geoPath(projection))
        .attr('fill', initial.land)
        .attr('stroke', initial.coastline)
        .attr('stroke-width', 0.5)

      const positions = STEPS.map((s) => projection(s.lonLat))

      const track = g
        .append('path')
        .attr('class', 'track')
        .attr('fill', 'none')
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('d', d3.line().curve(d3.curveCatmullRom.alpha(0.5))(positions))

      const trackNode = track.node()
      const totalLength = trackNode.getTotalLength()
      const stopLengths = positions.map((p) => lengthAtPoint(trackNode, p))
      track.attr('stroke-dasharray', `${totalLength} ${totalLength}`).attr('stroke-dashoffset', totalLength)

      const stops = g
        .selectAll('g.stop')
        .data(STEPS)
        .join('g')
        .attr('class', 'stop')
        .attr('transform', (_, i) => `translate(${positions[i][0]},${positions[i][1]})`)

      stops.append('circle').attr('class', 'stop-halo').attr('r', 15).attr('fill', 'none').attr('stroke-width', 1.5)
      stops.append('circle').attr('class', 'stop-dot').attr('r', 6).attr('stroke-width', 1.5)
      stops
        .append('text')
        .attr('class', 'stop-name')
        .attr('x', 12)
        .attr('y', 0)
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .text((d) => d.name)
      stops
        .append('text')
        .attr('class', 'stop-meta')
        .attr('x', 12)
        .attr('y', 14)
        .attr('font-size', 10.5)
        .text((d) => `Cat ${d.category} \u00b7 ${d.date}`)

      // The storm itself, riding the head of the drawn track. Two arms and an
      // eye is as much cyclone as survives at this size; the rotation is a CSS
      // animation on an inner group so it can't fight the translate below it.
      const eye = g.append('g').attr('class', 'storm-eye').attr('opacity', 0)
      const spinner = eye.append('g').attr('class', 'cyclone-spin')
      spinner
        .append('path')
        .attr('d', 'M0,-2 C7,-9 15,-6 14,1 C11,-4 5,-5 0,-2 Z')
        .attr('class', 'cyclone-arm')
      spinner
        .append('path')
        .attr('d', 'M0,2 C-7,9 -15,6 -14,-1 C-11,4 -5,5 0,2 Z')
        .attr('class', 'cyclone-arm')
      spinner.append('circle').attr('class', 'cyclone-core').attr('r', 2.6)

      sceneRef.current = { g, track, trackNode, totalLength, stopLengths, eye }
      // Painted here, by the code that built it. `built` cannot be relied on to
      // trigger the effect below -- see the note on paintScene.
      paintScene(sceneRef.current, { active: activeRef.current, theme: themeRef.current })
      setBuilt(true)
    }

    build()
    return () => {
      cancelled = true
    }
    // Keyed to the storm, not built once. With nothing selected on load this
    // component renders an empty state instead of the <svg>, so a mount-only
    // effect found no node, built nothing, and never ran again -- the map stayed
    // blank for every storm. It also has to rebuild on a *change* of storm,
    // since the projection is fitted to that storm's stops and the track is
    // drawn through them in order.
  }, [storm?.id])

  // Repaint on progress or theme. The scene is also painted at the end of
  // build(), so this effect is the update path rather than the first paint;
  // storm?.id is a dependency anyway, at the cost of one redundant repaint per
  // storm, so that a rebuild can never leave an unpainted scene on screen.
  useEffect(() => {
    if (sceneRef.current) paintScene(sceneRef.current, { active, theme })
  }, [active, theme, built, storm?.id])

  const blocked = sectionGuard({
    data: true,
    storm,
    style,
    tone: 'panel',
    subject: 'Storm journey',
    prompt: 'travel with it',
  })
  if (blocked) return blocked
  if (!hasSteps) {
    return (
      <EmptyState tone="panel" style={style}>
        {storm.name}&rsquo;s stop-by-stop record has not been compiled yet.
      </EmptyState>
    )
  }

  return (
    <Section tone="panel" className="journey-section" style={style}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {STEPS[0].date} &ndash; {STEPS[STEPS.length - 1].date}
      </p>
      <h2 className="mb-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
        Follow {storm.name}
      </h2>
      <p className="max-w-prose text-sm opacity-75">
        {storm.name} reached {STEPS.length} of these four countries, and was a different storm at
        each. Scroll the column on the right to travel with it.
      </p>

      <div className="journey-split mt-8 md:grid md:grid-cols-2 md:items-start md:gap-10">
        <div className="journey-sticky sticky top-[calc(var(--header-height)+8px)] z-10 -mx-6 bg-panel px-6 pb-4 pt-2 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 md:pt-0">
          <svg
            ref={svgRef}
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
            className="mx-auto block h-auto max-h-[38vh] w-full rounded-2xl border-2 border-ink/15 shadow-sm md:max-h-none"
          />
          {/* "four documented impact points" was hardcoded. Only Harold has
              four stops; the other five storms have two, and the caption was
              asserting a number the map beside it visibly contradicted. */}
          <p className="mt-2 text-xs italic leading-snug opacity-65">
            The line joins documented impact points; it is not the official track. Dates,
            categories and tolls come from national meteorological services and UN OCHA, cited in
            full in the sources.
          </p>
        </div>

        <ol ref={setStepsNode} className="journey-steps mt-4 md:mt-0">
          {STEPS.map((step, i) => (
            <li
              key={step.name}
              data-step={i}
              className="flex min-h-[58vh] flex-col justify-center border-l-2 py-6 pl-5 transition-[opacity,border-color] duration-500 motion-reduce:transition-none"
              style={{
                opacity: i === active ? 1 : 0.42,
                borderColor: i === active ? 'rgb(var(--color-accent))' : 'rgb(var(--color-ink) / 0.15)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {step.date}
              </p>
              <h3 className="mt-1 font-serif text-xl font-semibold tracking-tight md:text-2xl">
                {step.name}
              </h3>
              <p className="mt-2 text-sm font-medium">{step.lead}</p>
              <p className="mt-3 text-sm opacity-80">{step.fact}</p>
              {/* A null toll is never reported, not zero, and this line used
                  to render it as the empty string followed by the word
                  "deaths". Same distinction the profile chart's unreported
                  band makes, in the one place a reader meets it first. */}
              <p className="mt-3 text-xs uppercase tracking-[0.12em] opacity-60">
                {step.categoryLabel} &middot;{' '}
                {step.deaths == null
                  ? 'deaths not reported'
                  : `${step.deaths} ${step.deaths === 1 ? 'death' : 'deaths'}${
                      step.deathsKind === 'indirect' ? ', indirect' : ''
                    }`}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
