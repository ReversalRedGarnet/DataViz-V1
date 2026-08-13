import * as d3 from 'd3'
import { chartTheme } from '../theme.js'
import { motionDuration } from '../motion.js'
import { slug } from '../d3helpers.js'
import { AXIS_FONT, INT_FORMAT, POP_EASE, STORM_CHART_HEIGHT } from './constants.js'
import { shortName, textWidth } from './labels.js'
import { drawXAxis, drawYAxis } from './axes.js'
import { stormPointTooltip } from './tooltips.jsx'

// Deaths against storm category, one dot per nation-storm stop.
export function renderStormProfileChart(
  svg,
  { width, height = STORM_CHART_HEIGHT, rows, showTooltip, hideTooltip, theme = 'light' }
) {
  // Wider than the shared margins: this is the one chart with axis titles.
  const margin = { top: 20, right: 18, bottom: 52, left: 58 }
  const { ink, surface, palette } = chartTheme(theme)

  const x = d3.scaleLinear().domain([0.5, 5.5]).range([margin.left, width - margin.right])

  // Some stops have no published national fatality figure at all. That is not
  // the same fact as zero, and it must not be drawn as though it were: every
  // unreported stop on this roster is the secondary nation in its storm, so
  // plotting them at or near the axis would systematically understate exactly
  // the countries this site exists to draw attention to.
  //
  // They get their own band above the plot instead, separated by a rule and
  // labelled, so the reader sees the stop, sees its category, and sees that the
  // toll was never counted -- three facts, none of them invented.
  const reported = rows.filter((d) => d.deaths != null)
  const unreported = rows.filter((d) => d.deaths == null)

  // Tonga's nil death toll is a real and important reading, and on a domain
  // starting exactly at zero its dot sat half-buried in the axis line. The
  // domain drops slightly below zero to lift it clear; the ticks stay at or
  // above zero so the axis never implies negative deaths.
  const maxDeaths = d3.max(reported, (d) => d.deaths) || 1
  const bandHeight = unreported.length > 0 ? 26 : 0
  const plotTop = margin.top + bandHeight
  const y = d3
    .scaleLinear()
    .domain([-maxDeaths * 0.08, maxDeaths * 1.2])
    .range([height - margin.bottom, plotTop])

  const bandY = margin.top + bandHeight / 2 - 2

  drawYAxis(svg, y, {
    ink,
    width,
    margin,
    tickFormat: INT_FORMAT,
    tickValues: d3.ticks(0, maxDeaths * 1.2, 4).filter((t) => t >= 0),
  })

  // The band, drawn before the points so nothing sits on top of a marker.
  if (unreported.length > 0) {
    svg
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', plotTop - 8)
      .attr('y2', plotTop - 8)
      .attr('stroke', ink)
      .attr('stroke-opacity', 0.25)
      .attr('stroke-dasharray', '3 3')

    // Right-aligned. Left-aligned it sat on top of the unreported stop's own
    // name label, which is drawn at the same height and starts near the left
    // whenever that stop is a low category -- which, on this roster, it always
    // is.
    svg
      .append('text')
      .attr('x', width - margin.right)
      .attr('text-anchor', 'end')
      .attr('y', margin.top + 2)
      .attr('font-size', AXIS_FONT)
      .attr('font-style', 'italic')
      .attr('fill', ink)
      .attr('fill-opacity', 0.6)
      .text('Deaths not reported')
  }
  drawXAxis(svg, d3.axisBottom(x).ticks(5).tickFormat(INT_FORMAT), { ink, height, margin })

  svg
    .append('text')
    .attr('x', (margin.left + width - margin.right) / 2)
    .attr('y', height - 14)
    .attr('text-anchor', 'middle')
    .attr('font-size', AXIS_FONT)
    .attr('font-weight', 600)
    .attr('fill', ink)
    .attr('fill-opacity', 0.7)
    .text('Storm category at closest approach')

  svg
    .append('text')
    .attr('transform', `translate(16, ${(margin.top + height - margin.bottom) / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .attr('font-size', AXIS_FONT)
    .attr('font-weight', 600)
    .attr('fill', ink)
    .attr('fill-opacity', 0.7)
    .text('Deaths')

  // A hollow marker for deaths that were not caused by the storm directly.
  // Lola's four Solomon Islands deaths were a dysentery outbreak weeks after
  // landfall, from damaged water supplies; Harold's twenty-seven were drownings
  // during the storm. Both belong on this chart -- they are both real tolls --
  // but a filled dot at 4 beside a filled dot at 27 asserts a like-for-like
  // comparison the sources do not support.
  const isIndirect = (d) => d.deathsKind === 'indirect'
  const markY = (d) => (d.deaths == null ? bandY : y(d.deaths))

  const points = svg
    .selectAll('circle.storm-point')
    .data(rows)
    .join('circle')
    .attr('class', (d) => `storm-point chart-mark nation-mark nation-${slug(d.name)}`)
    .attr('cx', (d) => x(d.category + (d.dodge ?? 0)))
    .attr('cy', markY)
    .attr('r', 0)
    .attr('fill', (d) => (isIndirect(d) || d.deaths == null ? surface : palette.single))
    .attr('fill-opacity', 0.9)
    .attr('stroke', (d) => (isIndirect(d) || d.deaths == null ? palette.single : surface))
    .attr('stroke-width', (d) => (isIndirect(d) || d.deaths == null ? 2 : 1.5))
    .attr('stroke-dasharray', (d) => (d.deaths == null ? '3 2' : null))
    .on('pointerenter pointermove', function (event, d) {
      showTooltip(event, stormPointTooltip(d))
      d3.select(this).transition().duration(motionDuration(120)).attr('r', 10)
    })
    .on('pointerleave', function () {
      hideTooltip()
      d3.select(this).transition().duration(motionDuration(120)).attr('r', 7)
    })
    .on('click', (event, d) => showTooltip(event, stormPointTooltip(d)))

  points
    .transition()
    .delay((_, i) => motionDuration(i * 90))
    .duration(motionDuration(450))
    .ease(POP_EASE)
    .attr('r', 7)

  // Centred above each dot rather than offset to one side. Side-offset labels
  // collided whenever two nations landed at similar categories (Tonga and
  // Vanuatu do), and the rightmost one ran past the plot edge; centring
  // removes both problems, and the clamp keeps a long name inside the chart.
  const labelX = (d) => {
    const half = textWidth(shortName(d.name)) / 2
    const cx = x(d.category + (d.dodge ?? 0))
    return Math.max(margin.left + half, Math.min(cx, width - margin.right - half))
  }

  svg
    .selectAll('text.storm-label')
    .data(rows)
    .join('text')
    .attr('class', 'storm-label')
    .attr('x', labelX)
    .attr('y', (d) => markY(d) - (d.deaths == null ? 11 : 14))
    .attr('text-anchor', 'middle')
    .attr('font-size', AXIS_FONT)
    .attr('font-weight', 600)
    .attr('fill', ink)
    .attr('fill-opacity', 0)
    .text((d) => shortName(d.name))
    .transition()
    .delay((_, i) => motionDuration(300 + i * 90))
    .duration(motionDuration(300))
    .attr('fill-opacity', 0.8)
}
