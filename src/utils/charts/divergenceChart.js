import * as d3 from 'd3'
import { chartTheme } from '../theme.js'
import { slug } from '../d3helpers.js'
import {
  AXIS_FONT,
  DIVERGENCE_DASH,
  DIVERGENCE_HEIGHT,
  INT_FORMAT,
  MARK_STROKE,
  POINT_R,
  POINT_R_HOVER,
} from './constants.js'
import { shortName, spreadLabels } from './labels.js'
import { indexAtYear } from './scales.js'
import { drawXAxis, drawYAxis } from './axes.js'
import { divergenceTooltip } from './tooltips.jsx'

// A "same start, different finish" chart: every nation indexed to its own
// value in the event year, so all four lines begin at 100 and the only thing
// the chart can show is how far apart they end up.
//
// Built once and then driven, rather than redrawn: returns { update(progress) }
// where progress runs 0..1 across sweepYears. A page can have several of these
// sweeping independently at 60fps, so an update has to be an attribute write
// on marks that already exist, not another pass of D3 draw code.
//
// Args:
//   series -- [{ nation, points: [{ year, index, raw, baseYear }] }], in the
//     order the colours should be assigned
//   years -- [firstYear, lastYear], the x-axis domain. Shared across every
//     chart on the page so they stay visually aligned.
//   sweepYears -- [firstYear, lastYear], what progress 0..1 actually sweeps
//     across. This chart's own clock, so it is this metric's own last real
//     year, not the page-wide max -- a metric that stops in 2022 finishes at
//     2022, on its own timer, rather than idling until a 2024 metric catches
//     up.
export function buildDivergenceChart(
  svg,
  { width, height = DIVERGENCE_HEIGHT, series, years, sweepYears, format, showTooltip, hideTooltip, theme = 'light' }
) {
  const { ink, surface, palette } = chartTheme(theme)

  // Right margin holds the travelling end labels; they are what makes the
  // colours a second cue rather than the only one.
  const labelRoom = width < 380 ? 62 : 84
  const margin = { top: 18, right: labelRoom, bottom: 28, left: 44 }

  const x = d3.scaleLinear().domain(years).range([margin.left, width - margin.right])

  const allIndices = series.flatMap((s) => s.points.map((p) => p.index))
  const pad = Math.max(6, (d3.max(allIndices) - d3.min(allIndices)) * 0.12)
  const y = d3
    .scaleLinear()
    .domain([Math.min(100, d3.min(allIndices)) - pad, Math.max(100, d3.max(allIndices)) + pad])
    .nice()
    .range([height - margin.bottom, margin.top])

  drawYAxis(svg, y, { ink, width, margin, tickFormat: (v) => `${v}` })
  drawXAxis(svg, d3.axisBottom(x).ticks(Math.min(years[1] - years[0], 6)).tickFormat(INT_FORMAT), {
    ink,
    height,
    margin,
  })

  // The baseline the whole chart is read against. Heavier than a gridline and
  // labelled, because "100" here means something specific -- this nation's own
  // figure in the event year -- and not a round number on an axis.
  svg
    .append('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', y(100))
    .attr('y2', y(100))
    .attr('stroke', ink)
    .attr('stroke-opacity', 0.45)
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3 3')

  // WHICH WAY IS WHICH, SAID IN WORDS.
  //
  // The dashed line above is labelled "100" by the y-axis, and the card's
  // subtitle explains what 100 means. Neither tells the reader what it means to
  // be ABOVE it, and that is the only thing this chart is for. An index is a
  // decoding step -- 118 is a number before it is a recovery -- and a reader
  // who has to perform it on every glance performs it on none.
  //
  // Two lines of text remove the step. Above the baseline is more than this
  // nation had in the base year; below is less. That is the whole reading.
  //
  // WHY AT THE TOP AND BOTTOM OF THE PLOT rather than hugging the dashed line,
  // which is where they logically belong: every series starts at exactly 100 at
  // the left edge, so text next to the baseline would sit in the one place all
  // four lines are guaranteed to be. The extremes are where the padding above
  // and the .nice() rounding leave real space -- and the meaning survives the
  // move, because up is still up.
  //
  // Non-interactive, so they can never take a pointer event meant for a mark,
  // and appended before the lines so a line crossing one passes over the top
  // rather than under.
  const direction = svg.append('g').attr('class', 'divergence-direction').style('pointer-events', 'none')

  for (const [text, yPos] of [
    [`\u25b2 above its ${years[0]} level`, margin.top + 9],
    [`\u25bc below its ${years[0]} level`, height - margin.bottom - 7],
  ]) {
    direction
      .append('text')
      .attr('x', margin.left + 6)
      .attr('y', yPos)
      .attr('font-size', AXIS_FONT - 2)
      .attr('fill', ink)
      .attr('fill-opacity', 0.5)
      .text(text)
  }

  const clipId = `divergence-clip-${Math.random().toString(36).slice(2, 9)}`
  const clipRect = svg
    .append('clipPath')
    .attr('id', clipId)
    .append('rect')
    .attr('x', margin.left)
    .attr('y', 0)
    .attr('height', height)
    .attr('width', 0)

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.index))

  // Classed rather than positional: the axes above have already appended
  // groups of their own, so "the second g" is not a stable way to find these.
  const drawn = svg.append('g').attr('class', 'divergence-lines').attr('clip-path', `url(#${clipId})`)
  const heads = svg.append('g').attr('class', 'divergence-heads')
  const hits = svg.append('g').attr('class', 'divergence-hits').style('pointer-events', 'none')

  const marks = series.map((s, i) => {
    // Keyed to the nation's place in the page's own list, not to its place in
    // this chart's series: a nation missing from one metric would otherwise
    // shift every colour and dash after it, and the same country would be a
    // different colour in each panel.
    const slot = s.colorIndex ?? i
    const color = palette.series[slot % palette.series.length]

    drawn
      .append('path')
      .datum(s.points)
      .attr('class', `nation-mark nation-${slug(s.nation)}`)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', MARK_STROKE)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', DIVERGENCE_DASH[slot % DIVERGENCE_DASH.length])
      .attr('d', line)

    const dot = heads
      .append('circle')
      .attr('class', `nation-mark nation-${slug(s.nation)}`)
      .attr('r', POINT_R + 0.5)
      .attr('fill', color)
      .attr('stroke', surface)
      .attr('stroke-width', 1.5)

    const label = heads
      .append('text')
      .attr('class', `nation-mark nation-${slug(s.nation)}`)
      .attr('font-size', AXIS_FONT)
      .attr('font-weight', 600)
      .attr('fill', color)
      .attr('dominant-baseline', 'middle')
      .text(shortName(s.nation))

    // The hit targets sit on the real measured years only, so a tooltip can
    // never report a value from the sweep's interpolation.
    hits
      .selectAll(`circle.hit-${slug(s.nation)}`)
      .data(s.points)
      .join('circle')
      .attr('class', `hit-${slug(s.nation)} chart-mark`)
      .attr('cx', (d) => x(d.year))
      .attr('cy', (d) => y(d.index))
      .attr('r', POINT_R_HOVER)
      .attr('fill', 'transparent')
      .on('pointerenter pointermove', (event, d) => showTooltip(event, divergenceTooltip(s.nation, d, format)))
      .on('pointerleave', hideTooltip)
      .on('click', (event, d) => showTooltip(event, divergenceTooltip(s.nation, d, format)))

    return { series: s, dot, label, color }
  })

  function update(progress) {
    const clamped = Math.max(0, Math.min(1, progress))
    const year = sweepYears[0] + (sweepYears[1] - sweepYears[0]) * clamped
    clipRect.attr('width', Math.max(0, x(year) - margin.left))

    const placed = marks.map((mark) => {
      const last = mark.series.points[mark.series.points.length - 1]
      // A record that stops early stops moving; its dot parks on its own final
      // year rather than drifting along the bottom of the chart.
      const atYear = Math.min(year, last.year)
      return { mark, cx: x(atYear), cy: y(indexAtYear(mark.series.points, atYear)), ended: year > last.year }
    })

    const labelPositions = spreadLabels(
      placed.map((p) => ({ key: p.mark, y: p.cy })),
      AXIS_FONT + 3,
      margin.top,
      height - margin.bottom
    )

    for (const p of placed) {
      p.mark.dot.attr('cx', p.cx).attr('cy', p.cy).attr('fill-opacity', p.ended ? 0.5 : 1)
      const at = labelPositions.find((entry) => entry.key === p.mark)
      p.mark.label
        .attr('x', p.cx + 9)
        .attr('y', at ? at.y : p.cy)
        .attr('fill-opacity', p.ended ? 0.6 : 0.95)
    }

    // Hovering a point the sweep hasn't reached would read a figure off a line
    // that isn't on screen yet.
    hits.style('pointer-events', clamped >= 1 ? 'auto' : 'none')
  }

  update(0)
  return { update }
}
