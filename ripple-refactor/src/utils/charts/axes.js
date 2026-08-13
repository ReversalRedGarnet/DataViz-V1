import * as d3 from 'd3'
import { AXIS_FONT } from './constants.js'

const ZERO_LABEL_FONT = 10

// The printed "0" that stands in for a bar with nothing to draw. Unmistakable
// at any scale, and it can't be confused with a very short bar the way a stub
// could.
export function drawZeroLabels(svg, rows, { ink, x, y, valueField, group = 'all' }) {
  const zeros = rows.filter((d) => d[valueField] === 0)
  if (zeros.length === 0) return

  // Scoped per group: grouped bar charts call this once per country, and an
  // unscoped join would have each country's labels replace the last one's.
  svg
    .selectAll(`text.zero-label-${group}`)
    .data(zeros)
    .join('text')
    .attr('class', `zero-label-${group} zero-label`)
    .attr('x', (d) => x(d))
    .attr('y', y - 3)
    .attr('text-anchor', 'middle')
    .attr('font-size', ZERO_LABEL_FONT)
    .attr('font-weight', 600)
    .attr('fill', ink)
    .attr('fill-opacity', 0.55)
    .text('0')
}

// One axis look across every chart: no y-domain line, faint full-width
// gridlines, small theme-tracking tick text. Only the tick generators differ,
// so callers build the axis and these apply the styling.
export function drawYAxis(svg, y, { ink, width, margin, tickFormat, tickValues }) {
  const axis = d3
    .axisLeft(y)
    .tickFormat(tickFormat)
    .tickSize(-(width - margin.left - margin.right))
  if (tickValues) axis.tickValues(tickValues)
  else axis.ticks(4)

  const g = svg.append('g').attr('transform', `translate(${margin.left},0)`).call(axis)
  g.select('.domain').remove()
  g.selectAll('.tick line').attr('stroke', ink).attr('stroke-opacity', 0.12)
  g.selectAll('.tick text')
    .attr('fill', ink)
    .attr('fill-opacity', 0.75)
    .attr('font-size', AXIS_FONT)
    .attr('dx', -4)
  return g
}

export function drawXAxis(svg, axis, { ink, height, margin, tilt = false }) {
  const g = svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(axis)
  g.select('.domain').attr('stroke', ink).attr('stroke-opacity', 0.25)
  g.selectAll('.tick line').attr('stroke', ink).attr('stroke-opacity', 0.25)
  g.selectAll('.tick text').attr('fill', ink).attr('fill-opacity', 0.75).attr('font-size', AXIS_FONT)

  if (tilt) {
    g.selectAll('.tick text')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.3em')
      .attr('transform', 'rotate(-38)')
  }
  return g
}

// Zero is the reference these charts are read against -- "drier than this
// nation's own normal", "below this station's own average" -- so when the data
// crosses it, it gets a line of its own rather than blending into the
// gridlines. Skipped when nothing is negative, since the axis already sits there.
export function drawZeroLine(svg, y, { ink, width, margin, domain }) {
  if (domain[0] >= 0) return
  svg
    .append('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', y(0))
    .attr('y2', y(0))
    .attr('stroke', ink)
    .attr('stroke-opacity', 0.35)
    .attr('stroke-width', 1)
}
