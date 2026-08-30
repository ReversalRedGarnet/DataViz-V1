import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import Section from './Section.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import Tooltip from './Tooltip.jsx'
import VisuallyHidden from './VisuallyHidden.jsx'
import CountryPicker from './CountryPicker.jsx'
import MapControlButton from './MapControlButton.jsx'
import { useTooltip } from '../hooks/useTooltip.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useLatest } from '../hooks/useLatest.js'
import { useViewBoxScale } from '../hooks/useViewBoxScale.js'
import { chartColorsFor } from '../utils/theme.js'
import { resetSvg } from '../utils/d3helpers.js'
import { motionDuration } from '../utils/motion.js'
import { pluralize } from '../utils/pluralize.js'
import { loadLandTopology } from '../utils/loadLand.js'
import { drawBasemap, fitToPoints, pacificProjection, recolourBasemap } from '../utils/map.js'
import { NATIONS, nationLabel } from '../content/nations.js'
import { useNationHighlight } from '../hooks/useNationHighlight.jsx'

const STRINGS = {
  en: {
    exploreHeading: 'Explore the Pacific',
    exploreBody:
      'Every country on this map is selectable. Tap a marker to select it, tap a second one to compare, and the ripple chain, the divergence and the comparison all follow your pick. Drag to pan, pinch to zoom, or use the buttons.',
    mapAriaWithStorm: (nationCount, stormName, hitCount) =>
      `Map of the Pacific with ${nationCount} selectable nations. ${stormName} struck ${hitCount} of them.`,
    mapAriaNoStorm: (nationCount) => `Map of the Pacific with ${nationCount} selectable nations`,
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset view',
    selectedBadge: (n) => `Selected ${n}`,
    noStormSelected: 'No storm selected.',
    pointAt: (stormName) => `Point at a country, or tab to one, for what ${stormName} did there.`,
    theStorm: 'the storm',
    clearSelection: 'Clear selection',
    select: (name) => `Select ${name}`,
    selectNotStruck: (name, stormName) =>
      `Select ${name}. Not struck by ${stormName}; shown for comparison.`,
    didNotReach: (stormName, name) => `${stormName} did not reach ${name}.`,
    deathsNeverReported: 'Deaths never reported.',
    deathsReported: (n) => `${n} ${pluralize(n, { one: 'death', other: 'deaths' }, 'en')} reported.`,
    selectedTapDeselect: 'Selected -- tap again to deselect.',
    tapToSwap: 'Tap to swap into the comparison.',
    tapToCompare: 'Tap to compare with your first pick.',
    tapToSelect: 'Tap to select.',
    tableCaption: (stormName) =>
      stormName ? `Nations on the map, and what ${stormName} did to each` : 'Nations on the map',
    thCountry: 'Country',
    thSelected: 'Selected',
    thStatus: 'Storm impact',
    yes: 'Yes',
    no: 'No',
  },
  fr: {
    exploreHeading: 'Explorer le Pacifique',
    exploreBody:
      "Chaque pays sur cette carte est sélectionnable. Touchez un repère pour le sélectionner, touchez-en un deuxième pour comparer : la chaîne de répercussions, la divergence et la comparaison suivent votre choix. Faites glisser pour vous déplacer, pincez pour zoomer, ou utilisez les boutons.",
    mapAriaWithStorm: (nationCount, stormName, hitCount) =>
      `Carte du Pacifique avec ${nationCount} nations sélectionnables. ${stormName} en a touché ${hitCount}.`,
    mapAriaNoStorm: (nationCount) => `Carte du Pacifique avec ${nationCount} nations sélectionnables`,
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    resetView: 'Réinitialiser la vue',
    selectedBadge: (n) => `Sélection ${n}`,
    noStormSelected: 'Aucun cyclone sélectionné.',
    pointAt: (stormName) =>
      `Pointez un pays, ou naviguez jusqu\u2019à un pays, pour voir ce que ${stormName} y a fait.`,
    theStorm: 'le cyclone',
    clearSelection: 'Effacer la sélection',
    select: (name) => `Sélectionner ${name}`,
    selectNotStruck: (name, stormName) =>
      `Sélectionner ${name}. Non touché par ${stormName}\u00A0; affiché à des fins de comparaison.`,
    didNotReach: (stormName, name) => `${stormName} n\u2019a pas touché ${name}.`,
    deathsNeverReported: 'Décès jamais recensés.',
    deathsReported: (n) => `${n} ${pluralize(n, { one: 'décès', other: 'décès' }, 'fr')} recensés.`,
    selectedTapDeselect: 'Sélectionné — touchez à nouveau pour désélectionner.',
    tapToSwap: 'Touchez pour remplacer dans la comparaison.',
    tapToCompare: 'Touchez pour comparer avec votre premier choix.',
    tapToSelect: 'Touchez pour sélectionner.',
    tableCaption: (stormName) =>
      stormName
        ? `Nations sur la carte, et ce que ${stormName} a fait à chacune`
        : 'Nations sur la carte',
    thCountry: 'Pays',
    thSelected: 'Sélectionné',
    thStatus: 'Impact du cyclone',
    yes: 'Oui',
    no: 'Non',
  },
}

// Illustrative Pacific map: real coastlines, fixed markers, pan and zoom, click
// to select. Two selections at most, because everything downstream of this
// slide is a pairwise comparison.
//
// The land is real TopoJSON. The markers come from content/nations.js, which
// this file used to own and export -- so App, BigPicture, ContextPanel,
// DivergenceView and StormJourney all imported the project's scope from a UI
// component. It is scope data, not map data, and it now lives with the rest of
// the content.

const WIDTH = 700
const HEIGHT = 460

// Marker furniture, in CSS pixels rather than viewBox units. The counter-scale
// effect below keeps them at these sizes whatever box the map is drawn into --
// see hooks/useViewBoxScale.js for the 4.8px labels this replaces.
//
// 22 is the hit radius, so the target is 44px across: the same floor every
// other control on this site uses, and previously the one place it was missed.
// The markers are at least 146 viewBox units apart at every fit, so they cannot
// collide at this size.
const MARKER_HIT_R = 22
// Gap between a pin and its name, and the margin the name must keep from the
// map's edge before it flips to the other side of the pin.
const LABEL_GAP = 12
const LABEL_MARGIN = 6

// What the selected storm did to this nation, in the storm's own words -- the
// date and category from its profile, and the death toll with the same
// reported/unreported distinction the profile chart makes. A nation the storm
// never reached says so, because a marker with nothing under it reads as
// missing data rather than as a country that was spared.
//
// `entry.date`/`entry.categoryLabel` come from content/storms.js, already
// localized by localizeStorm() before `storm` reaches this component -- see
// the note in that file. `entry.deaths` stays a number either way.
function stormBlurb(nationName, storm, language = 'en') {
  const t = STRINGS[language]
  if (!storm) return null
  const entry = storm.profile?.find((p) => p.name === nationName)
  const displayName = nationLabel(nationName, language)
  if (!entry) return t.didNotReach(storm.name, displayName)

  const toll = entry.deaths == null ? t.deathsNeverReported : t.deathsReported(entry.deaths)
  return `${entry.date}. ${entry.categoryLabel}. ${toll}`
}

// The marker's aria-label and, once a storm is selected, whether it was
// struck. One function so the initial label the setup effect draws at mount
// and the one the storm-fade effect keeps in sync afterwards can't drift
// apart -- see the setup effect below for why the initial draw needs its own
// copy rather than waiting for that later effect to run.
function markerSelectLabel(nationName, storm, language = 'en') {
  const t = STRINGS[language]
  const name = nationLabel(nationName, language)
  return !storm || storm.nations.includes(nationName) ? t.select(name) : t.selectNotStruck(name, storm.name)
}

// Built from live selection state so the "tap to select / compare / deselect"
// hint is accurate whenever the hover, focus or tap happens.
function markerTooltipContent(nation, selected, storm, language = 'en') {
  const t = STRINGS[language]
  const i = selected.indexOf(nation.name)
  let status
  if (i !== -1) status = t.selectedTapDeselect
  else if (selected.length >= 2) status = t.tapToSwap
  else if (selected.length === 1) status = t.tapToCompare
  else status = t.tapToSelect

  const blurb = stormBlurb(nation.name, storm, language)

  return (
    <>
      <p className="font-semibold">{nationLabel(nation.name, language)}</p>
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
  const setHighlightRef = useLatest(setHighlight)

  const { containerRef, tooltip, showTooltip, hideTooltip } = useTooltip()
  const { theme } = useTheme()
  const { language } = useLanguage()
  const languageRef = useLatest(language)

// Which country the reader is pointing at, for the summary under the map.
// Kept apart from the committed selection so hovering a second country does not
// disturb the one being followed -- the same split the timeline's preview uses.
  const [preview, setPreview] = useState(null)
  const setPreviewRef = useLatest(setPreview)

  // The setup effect runs once, so its D3 closures would capture `selected` at
  // mount and never see a later pick. A ref keeps the hint current without
  // rebuilding the map, which would reset pan and zoom.
  const [built, setBuilt] = useState(false)
  const selectedRef = useLatest(selected)

  // Same reasoning again, for the storm. The setup effect deliberately does not
  // re-run when the storm changes -- rebuilding would throw away the reader's
  // pan and zoom -- so without a ref the D3 handlers would keep describing
  // whichever storm happened to be selected when the map was first built.
  const stormRef = useLatest(storm)

  // Same reasoning, for the map's initial ocean/land paint.
  const themeRef = useLatest(theme)

  // How small the fixed viewBox is currently being drawn. Markers counter-scale
  // by it so their labels and tap targets stay the size they were designed at.
  const scale = useViewBoxScale(svgRef, WIDTH, HEIGHT)

  // Build the map once. Selection and theme recolouring happen in the effects
  // below so pan/zoom survives a marker click. `cancelled` guards against the
  // async coastline fetch resolving after unmount.
  useEffect(() => {
    let cancelled = false

    async function setup() {
      const land50m = await loadLandTopology()
      if (cancelled || !svgRef.current) return

      const svg = resetSvg(svgRef, WIDTH, HEIGHT)

      // Fitted to the current nation set, not the world. The 65px padding keeps
      // labels and the zoom buttons off a marker near an edge. The antimeridian
      // rotation lives in pacificProjection() -- see utils/map.js.
      const projection = fitToPoints(
        pacificProjection(),
        nations.map((n) => [n.lon, n.lat]),
        { width: WIDTH, height: HEIGHT, padding: 65 }
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

      // Classed by drawBasemap so the theme effect below can recolour in place.
      // The 2000px bleed is why the <svg> carries overflow-hidden: the ocean is
      // drawn far past the viewBox so panning never reveals empty space.
      drawBasemap(g, {
        land: land50m,
        projection,
        width: WIDTH,
        height: HEIGHT,
        theme: themeRef.current,
        bleed: 2000,
      })

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

      // Projected once and kept, because the label-flip pass below needs each
      // pin's x in viewBox units and the projection is not in scope there.
      const projected = new Map(nations.map((n) => [n.name, projection([n.lon, n.lat])]))

      const marker = g
        .selectAll('g.marker')
        .data(nations)
        .join('g')
        .attr('class', 'marker')
        .attr('transform', (d) => {
          const [x, y] = projected.get(d.name)
          return `translate(${x},${y})`
        })
        .attr('data-px', (d) => projected.get(d.name)[0])
        .attr('role', 'button')
        .attr('tabindex', 0)
        // aria-pressed is set by the selection effect below, alongside the
        // colour and the 1/2 badge. It is what tells a screen-reader user that
        // this marker is already in the comparison -- information that was
        // otherwise carried only by a fill colour and a digit drawn in SVG.
        .attr('aria-pressed', 'false')
        .attr('aria-label', (d) => markerSelectLabel(d.name, stormRef.current, languageRef.current))
        .on('click', (event, d) => {
          onToggle(d.name)
          // selectedRef hasn't caught this toggle yet: one beat behind, once.
          showTooltip(event, markerTooltipContent(d, selectedRef.current, stormRef.current, languageRef.current))
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
          showTooltip(event, markerTooltipContent(d, selectedRef.current, stormRef.current, languageRef.current))
        })
        .on('pointerleave', () => {
          setHighlightRef.current(null)
          setPreviewRef.current(null)
          hideTooltip()
        })
        .on('focus', (event, d) => {
          setHighlightRef.current(d.name)
          setPreviewRef.current(d.name)
          showTooltip(event, markerTooltipContent(d, selectedRef.current, stormRef.current, languageRef.current))
        })
        .on('blur', () => {
          setHighlightRef.current(null)
          setPreviewRef.current(null)
          hideTooltip()
        })

      // EVERYTHING VISIBLE HANGS OFF THIS GROUP, not off the marker itself.
      // The marker carries the projected position; this carries the
      // counter-scale that keeps the dot, badge, label and hit area at a fixed
      // pixel size. Two groups because they are two transforms -- writing the
      // scale onto the marker would overwrite the translate that puts it on the
      // map, the same split the cyclone glyph uses in StormJourney.
      const inner = marker.append('g').attr('class', 'marker-inner')

      // Comfortable tap target without enlarging the visible dot.
      inner
        .append('circle')
        .attr('class', 'marker-hit')
        .attr('r', MARKER_HIT_R)
        .attr('fill', 'transparent')
        .attr('pointer-events', 'all')

      // Resolved once: themeRef can't change mid-append, and three lookups for
      // one palette invited them to drift apart.
      const markerPalette = chartColorsFor(themeRef.current)

      inner
        .append('circle')
        .attr('class', 'marker-dot')
        .attr('r', 7)
        .attr('fill', markerPalette.idle)
        .attr('stroke', markerPalette.markRing)
        .attr('stroke-width', 1.5)
        .style('transition', 'r 150ms ease-out')

      inner
        .append('text')
        .attr('class', 'marker-badge')
        .attr('text-anchor', 'middle')
        .attr('y', 4)
        .attr('font-size', 9)
        .attr('font-weight', 700)
        .attr('fill', markerPalette.onMark)
        .style('pointer-events', 'none')

      inner
        .append('text')
        .attr('class', 'marker-label')
        .text((d) => nationLabel(d.name, languageRef.current))
        .attr('x', LABEL_GAP)
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

    // The visual state, said out loud. Without this a marker announced itself
    // as "Select Fiji" whether or not Fiji was already selected, so the one
    // piece of state the whole rest of the deck depends on was invisible to
    // anyone not looking at the colours.
    markers.attr('aria-pressed', (d) => (selected.includes(d.name) ? 'true' : 'false'))
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
    // Selection is carried by aria-pressed rather than folded in here, so the
    // two effects cannot fight over the same attribute.
    gRef.current
      .selectAll('g.marker')
      .attr('aria-label', (d) => markerSelectLabel(d.name, storm, language))
  }, [storm, built, language])

  // The visible label beside each pin. A separate effect from the storm-fade
  // one above -- this has nothing to do with which storm is selected, only
  // with which language is -- and separate from the setup effect, which
  // draws it once at mount and never again (rebuilding there would drop pan
  // and zoom). `built` guards the same race every other post-setup effect
  // here does: on mount the coastline is still loading and there is nothing
  // to select yet.
  useEffect(() => {
    if (!gRef.current) return
    gRef.current.selectAll('text.marker-label').text((d) => nationLabel(d.name, language))
  }, [language, built])

  // Counter-scale the marker furniture so the labels and tap targets stay the
  // size they were designed at while the geography scales with the box. `built`
  // is a dependency for the usual reason -- on mount the coastline is still in
  // flight and there are no markers to find yet.
  useEffect(() => {
    if (!gRef.current || !scale) return
    const inverse = 1 / scale
    gRef.current.selectAll('g.marker-inner').attr('transform', `scale(${inverse})`)

    // AND THEN FLIP THE ONES THAT NO LONGER FIT.
    //
    // Counter-scaling is what makes a label legible, and it is also what makes
    // it wide: at the phone's fit a name occupies more than twice the viewBox
    // room it used to, while the projection's padding is a fixed 65 units
    // chosen when the labels were small. Tonga sits nearest the right edge and
    // ran straight off it.
    //
    // So a name that would overflow is drawn on the other side of its pin,
    // which is what stormProfileChart does with its own clamp for the same
    // reason. Measured rather than assumed: getComputedTextLength reports the
    // real advance width in the marker's own units, so this stays correct for
    // a longer country name than any currently on the roster.
    gRef.current.selectAll('g.marker').each(function () {
      const label = d3.select(this).select('text.marker-label')
      const node = label.node()
      if (!node) return
      const px = Number(this.getAttribute('data-px'))
      const width = node.getComputedTextLength()
      const overflows = px + (LABEL_GAP + width) * inverse > WIDTH - LABEL_MARGIN
      label
        .attr('x', overflows ? -LABEL_GAP : LABEL_GAP)
        .attr('text-anchor', overflows ? 'end' : 'start')
    })
  }, [scale, built, language])

  // No-ops if setup() hasn't finished; that race is covered by themeRef.
  useEffect(() => {
    if (!gRef.current) return
    recolourBasemap(gRef.current, theme, motionDuration(200))
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
    <Section style={style} backdrop={scatterBackdrop('map')}>
      <h2 className="type-h2 mb-2">{STRINGS[language].exploreHeading}</h2>
      <p className="prose-column prose-wide prose-short mb-3 text-sm opacity-70">
        {STRINGS[language].exploreBody}
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
              ? STRINGS[language].mapAriaWithStorm(nations.length, storm.name, storm.nations.length)
              : STRINGS[language].mapAriaNoStorm(nations.length)
          }
          className="h-auto w-full overflow-hidden rounded-2xl border-2 border-ink/15 shadow-sm"
        />
        {/* Top-right: a bottom-right column covered Tonga's label. */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <MapControlButton kind="zoomIn" onClick={() => zoomBy(1.5)} label={STRINGS[language].zoomIn} />
          <MapControlButton kind="zoomOut" onClick={() => zoomBy(1 / 1.5)} label={STRINGS[language].zoomOut} />
          <MapControlButton kind="reset" onClick={resetView} label={STRINGS[language].resetView} />
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
              {nationLabel(summaryFor, language)}
              {selected.includes(summaryFor) && (
                <span className="ml-2 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                  {STRINGS[language].selectedBadge(selected.indexOf(summaryFor) + 1)}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs leading-snug opacity-75">
              {stormBlurb(summaryFor, storm, language) ?? STRINGS[language].noStormSelected}
            </p>
          </>
        ) : (
          <p className="opacity-soft">
            {STRINGS[language].pointAt(storm ? storm.name : STRINGS[language].theStorm)}
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
              {STRINGS[language].clearSelection}
            </button>
          )}
        </div>
      </div>

      {/* Screen-reader-only data table -- same pattern as StormProfile/TrendChart:
          the map conveys this through pin colour, fade opacity and a 1/2 badge,
          this gives the same facts as text. Reuses stormBlurb() so the table
          never says anything the tooltip and summary panel above don't already. */}
      <VisuallyHidden>
        <table>
          <caption>{STRINGS[language].tableCaption(storm?.name)}</caption>
          <thead>
            <tr>
              <th scope="col">{STRINGS[language].thCountry}</th>
              <th scope="col">{STRINGS[language].thSelected}</th>
              {storm && <th scope="col">{STRINGS[language].thStatus}</th>}
            </tr>
          </thead>
          <tbody>
            {nations.map((n) => (
              <tr key={n.name}>
                <td>{nationLabel(n.name, language)}</td>
                <td>{selected.includes(n.name) ? STRINGS[language].yes : STRINGS[language].no}</td>
                {storm && <td>{stormBlurb(n.name, storm, language)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </Section>
  )
}
