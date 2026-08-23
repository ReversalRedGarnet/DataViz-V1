import { useEffect, useMemo, useRef } from 'react'
import * as d3 from 'd3'
import Section from './Section.jsx'
import { NATION_COORDS, NATION_COUNT } from '../content/nations.js'
import EmptyState from './EmptyState.jsx'
import { sectionGuard } from './sectionGuard.jsx'
import JourneyScrubber from './JourneyScrubber.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { useLatest } from '../hooks/useLatest.js'
import { useOverflowFade } from '../hooks/useOverflowFade.js'
import { chartTheme, MAP_COLORS } from '../utils/theme.js'
import { resetSvg } from '../utils/d3helpers.js'
import { motionDuration } from '../utils/motion.js'
import { loadLandTopology } from '../utils/loadLand.js'
import { drawBasemap, fitToPoints, pacificProjection } from '../utils/map.js'

// The selected storm's route across the nations it struck, driven by the reader.
//
// A map that draws itself from the roster: one marker per documented stop, a
// track joining them in strike order, and a cyclone glyph on the current one.
// The scrubber beside it moves through the stops -- dragging it, pressing the
// steppers, or pressing a stop by name all write the same index.
//
// The map is painted imperatively with d3 rather than rendered as JSX, because
// every element on it is positioned from a projection that depends on the
// container's measured width. See build() below: it is a plain function so the
// same pass can run on mount, on resize, on theme change and on index change
// without four effects disagreeing about what the scene should look like.
const TRACK_NOTE =
  'The line joins documented impact points; it is not the official track. Dates, categories and ' +
  'tolls come from national meteorological services and UN OCHA, cited in full in the sources.'

const WIDTH = 800
const HEIGHT = 540

// One coordinate set for the whole site: NATION_COORDS is the same approximate
// capital-city positions the interactive map uses, from content/nations.js.

// Built per storm rather than once at module load: each storm reached a
// different set of nations in a different order, and the track is drawn through
// the stops in array order.
function buildSteps(storm) {
  return (storm?.profile ?? []).map((row) => ({ ...row, lonLat: NATION_COORDS[row.name] }))
}

// The connecting sentence for each stop now lives with that stop in
// src/content/storms.js as `lead`, so a storm's facts and the sentences that
// join them cannot drift apart across six storms.

// Where along the track each stop actually sits.
//
// The track is a smoothed curve through the stops, so a stop's own projected
// coordinates are not exactly on it; the curve has to be sampled to find where
// it passes closest.
//
// SAMPLED ONCE, SCANNED MANY TIMES. This used to be a function called per stop,
// each call walking its own 500 points -- and getPointAtLength() forces layout
// on every call, so a four-stop storm cost about 2,000 synchronous layout calls
// in the frame the map is built. The 500 points are identical on every one of
// those walks; only the target moves. Taking them once and scanning the
// resulting array in plain JavaScript gives bit-for-bit the same answer for a
// quarter of the layout work on Harold, and a half on every two-stop storm.
//
// Deliberately not a coarser sample with a refinement pass. That is faster
// still, but it finds a local minimum rather than the global one whenever a
// track doubles back on itself, and "the tracks we have today are smooth" is
// not a property anything here enforces.
const TRACK_SAMPLES = 500

function sampleTrack(pathNode) {
  const total = pathNode.getTotalLength()
  const points = new Array(TRACK_SAMPLES + 1)
  for (let i = 0; i <= TRACK_SAMPLES; i++) {
    const length = (i / TRACK_SAMPLES) * total
    const point = pathNode.getPointAtLength(length)
    points[i] = { length, x: point.x, y: point.y }
  }
  return points
}

function lengthAtPoint(samples, [px, py]) {
  let best = 0
  let bestDistance = Infinity
  for (const sample of samples) {
    const distance = (sample.x - px) ** 2 + (sample.y - py) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = sample.length
    }
  }
  return best
}

// The colour-and-progress pass, as a plain function rather than only an effect
// body, because whoever builds a scene has to be the one who paints it.
//
// It used to live only in an effect keyed on a `built` state flag. On the first
// storm the coastline is fetched over the network, so setBuilt(false) and
// setBuilt(true) landed in different React batches, `built` transitioned and
// the effect ran. On every storm after that the topology is cached, the await
// resolves in a microtask, both updates collapsed into one batch, `built` never
// changed value and the effect never ran -- leaving the ocean rect and the land
// path with no fill attribute at all. SVG's default fill is black, which is why
// the second storm rendered a black rectangle the size of the map.
//
// The flag has since been removed entirely (see the scene-reset effect below):
// once build() paints its own scene, nothing was left for it to do.
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
//   storm -- the selected storm
//   index -- which documented stop is on the map, from the story state
//   onIndex -- (i) => void, the only way that position changes
//   style -- forwarded to the underlying Section (entrance stagger)
export default function StormJourney({ storm, index = 0, onIndex, style }) {
  // Memoised so it can be a real dependency of the build effect below rather
  // than something that effect closes over and hopes stays in step. `storm`
  // comes from stormById(), a .find() over a module constant, so the same id
  // yields the same object and this is stable for as long as the storm is.
  const STEPS = useMemo(() => buildSteps(storm), [storm])
  const svgRef = useRef(null)
  const sceneRef = useRef(null)

  // Drop the previous storm's scene immediately, so the progress effect below
  // cannot animate a track that belongs to a map no longer on screen.
  //
  // There used to be a `built` flag alongside this, set false here and true at
  // the end of build(), and listed in the repaint effect's dependencies. The
  // note on paintScene explains why it could not be relied on to fire that
  // effect -- which is why build() paints the scene itself. Once it did,
  // `built` was carrying nothing: storm?.id already covers every case it would
  // have, so it was state that existed only to be written.
  useEffect(() => {
    sceneRef.current = null
  }, [storm?.id])
  const { theme } = useTheme()
  // Clamped rather than trusted. The index is shared state and the stop list is
  // per storm -- Harold has four stops, Pam has two -- so a stale index is a
  // read past the end of an array rather than a cosmetic fault. useStory resets
  // it on every storm change; this is the second lock on the same door.
  const hasSteps = STEPS.length > 0
  const active = Math.min(Math.max(0, index), Math.max(0, STEPS.length - 1))
  const step = STEPS[active]

  // Read inside build(), which resolves after the render that set them. Held in
  // refs rather than taken as effect dependencies: either one changing must
  // repaint the scene, not rebuild it. See hooks/useLatest.js.
  const activeRef = useLatest(active)
  const themeRef = useLatest(theme)

  // The stop box swaps text as the reader moves along the track, so whether it
  // overflows is a per-stop question, not a per-storm one.
  const { ref: stopScrollRef, overflowing: stopOverflowing } = useOverflowFade([
    storm?.id,
    active,
  ])

  // Built once. The coastline fetch is the same static file the interactive
  // map uses, so this costs nothing extra after that section has loaded.
  useEffect(() => {
    let cancelled = false

    async function build() {
      const land50m = await loadLandTopology()
      if (cancelled || !svgRef.current) return

      const svg = resetSvg(svgRef, WIDTH, HEIGHT)
      const projection = fitToPoints(
        pacificProjection(),
        STEPS.map((s) => s.lonLat),
        { width: WIDTH, height: HEIGHT, padding: 58 }
      )

      // drawBasemap fills both shapes at creation rather than leaving them for
      // the paint pass to reach. An SVG shape with no fill attribute is black,
      // and this map is where that was learned. No bleed: this map cannot pan.
      const g = svg.append('g')
      drawBasemap(g, {
        land: land50m,
        projection,
        width: WIDTH,
        height: HEIGHT,
        theme: themeRef.current,
      })

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
      const trackSamples = sampleTrack(trackNode)
      const stopLengths = positions.map((p) => lengthAtPoint(trackSamples, p))
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
      // Painted here, by the code that built it -- see the note on paintScene
      // for why no effect can be trusted to do it instead.
      paintScene(sceneRef.current, { active: activeRef.current, theme: themeRef.current })
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
    //
    // STEPS is listed because build() reads it. It was previously closed over
    // while the effect depended on storm?.id alone -- which worked only because
    // the two always change together, a coincidence nothing enforced. activeRef
    // and themeRef are stable ref objects; naming them costs nothing and lets
    // the dependency array be honest.
  }, [storm?.id, STEPS, activeRef, themeRef])

  // Repaint on progress or theme. The scene is also painted at the end of
  // build(), so this effect is the update path rather than the first paint;
  // storm?.id is a dependency anyway, at the cost of one redundant repaint per
  // storm, so that a rebuild can never leave an unpainted scene on screen.
  useEffect(() => {
    if (sceneRef.current) paintScene(sceneRef.current, { active, theme })
  }, [active, theme, storm?.id])

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
      <p className="type-eyebrow mb-1 text-accent">
        {STEPS[0].date} &ndash; {STEPS[STEPS.length - 1].date}
      </p>
      <h2 className="type-h2 mb-2">
        Follow {storm.name}
      </h2>
      <p className="prose-column prose-wide prose-short text-sm opacity-75">
        {/* NATION_COUNT, not a typed 4. Same drift the timeline's eyebrow had:
            the scope of this project is four countries today and the number is
            written down in one place, so this sentence should read it rather
            than repeat it. */}
        {storm.name} reached {STEPS.length} of these {NATION_COUNT} countries. Drag the control
        beside the map, or use the arrow keys, to travel with it.
      </p>

      <div className="journey-split mt-6 md:grid md:grid-cols-2 md:items-start md:gap-10">
        <div className="journey-sticky sticky top-[calc(var(--header-height)+8px)] z-10 -mx-6 bg-panel px-6 pb-4 pt-2 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 md:pt-0">
          <svg
            ref={svgRef}
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
            className="mx-auto block h-auto max-h-[22vh] w-full rounded-2xl border-2 border-ink/15 shadow-sm md:max-h-none"
          />
          {/* "four documented impact points" was hardcoded. Only Harold has
              four stops; the other five storms have two, and the caption was
              asserting a number the map beside it visibly contradicted. */}
          <p className="mt-2 hidden text-xs italic leading-snug opacity-65 md:block">{TRACK_NOTE}</p>
        </div>

        <div className="journey-detail mt-5 md:mt-0">
          <JourneyScrubber
            stops={STEPS}
            index={active}
            onIndex={onIndex}
            label={`${storm.name}: move between documented impact points`}
          />

        {/*
          The stop itself, in a box of a fixed size. The facts run from three
          lines to twelve, so a box sized to its content resized on every move
          of the scrubber and took the control with it -- see .locked-box in
          styles/story.css. What changes is the words; nothing else moves.
        */}
          <article className="journey-stop locked-box mt-5 border-l-2 border-accent">
            <div ref={stopScrollRef} data-overflowing={stopOverflowing} className="locked-scroll pl-5 pr-1">
            <p className="type-eyebrow text-accent">{step.date}</p>
            <h3 className="type-h3 mt-1">{step.name}</h3>
            <p className="mt-2 text-sm font-medium">{step.lead}</p>
            <p className="mt-3 text-sm opacity-80">{step.fact}</p>
            {/* A null toll is never reported, not zero, and this line used
                to render it as the empty string followed by the word
                "deaths". Same distinction the profile chart's unreported
                band makes, in the one place a reader meets it first. */}
            <p className="type-meta mt-3 opacity-60">
              {step.categoryLabel} &middot;{' '}
              {step.deaths == null
                ? 'deaths not reported'
                : `${step.deaths} ${step.deaths === 1 ? 'death' : 'deaths'}${
                    step.deathsKind === 'indirect' ? ', indirect' : ''
                  }`}
            </p>
            {step.deathsNote && (
              <p className="mt-2 border-l-2 border-ink/15 pl-3 text-xs italic leading-snug opacity-70">
                {step.deathsNote}
              </p>
            )}
            </div>
          </article>
        </div>

        {/* Mobile placement of the same note. It sits after the detail rather
            than under the map, because on a phone the map is a pinned band and
            anything inside it is pinned too -- four lines of citation following
            the reader down the screen, in the space the stop text needs. It is
            md:hidden, so on desktop this is not a third grid child. */}
        <p className="mt-4 text-xs italic leading-snug opacity-65 md:hidden">{TRACK_NOTE}</p>
      </div>
    </Section>
  )
}
