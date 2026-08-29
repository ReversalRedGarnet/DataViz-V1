import * as d3 from 'd3'
import { chartTheme } from '../theme.js'
import { motionDuration } from '../motion.js'
import { slug } from '../d3helpers.js'
import {
  CHART_HEIGHT,
  INT_FORMAT,
  MARGIN,
  MARK_STROKE,
  POINT_R,
  POINT_R_HOVER,
  POP_EASE,
} from './constants.js'
import { bandLabelStep, yearTickCount } from './labels.js'
import { seriesStyles } from './series.js'
import { barTopAndHeight, zeroAnchoredDomain } from './scales.js'
import { drawXAxis, drawYAxis, drawZeroLabels, drawZeroLine } from './axes.js'
import { pointTooltip } from './tooltips.jsx'
import { nationLabel } from '../../content/nations.js'

// The multi-year trend chart, in bar, line or area form.
export function renderMetricChart(
  svg,
  {
    width,
    height = CHART_HEIGHT,
    allRows,
    nations,
    valueField,
    chartType,
    format,
    showTooltip,
    hideTooltip,
    yTickFormat = d3.format('~s'),
    theme = 'light',
    language = 'en',
  }
) {
  const margin = MARGIN
  const { ink, surface, palette } = chartTheme(theme)

  // Colour and dash come from one resolver shared with the legend, and it
  // picks a wider palette above two nations -- see utils/charts/series.js for
  // the two countries that used to be drawn identically here.
  const styles = seriesStyles(nations, palette)
  const styleOf = (nation) => styles[nations.indexOf(nation)]
  const color = (nation) => styleOf(nation).color

  const isBand = chartType === 'bar'
  const years = Array.from(new Set(allRows.map((d) => d.year))).sort((a, b) => a - b)

  const x = isBand ? d3.scaleBand() : d3.scaleLinear()
  if (isBand) {
    x.domain(years).range([margin.left, width - margin.right]).padding(0.3)
  } else {
    x.domain(d3.extent(allRows, (d) => d.year)).range([margin.left, width - margin.right])
  }
  const x1 = isBand ? d3.scaleBand().domain(nations).range([0, x.bandwidth()]).padding(0.15) : null

  const domain = zeroAnchoredDomain(allRows.map((d) => d[valueField]))
  const y = d3
    .scaleLinear()
    .domain(domain)
    .nice()
    .range([height - margin.bottom, margin.top])

  drawYAxis(svg, y, { ink, width, margin, tickFormat: yTickFormat })

  const bandStep = isBand ? bandLabelStep(years, x.step()) : 1
  drawXAxis(
    svg,
    isBand
      ? d3
          .axisBottom(x)
          .tickSizeOuter(0)
          .tickValues(years.filter((_, i) => i % bandStep === 0))
      : d3.axisBottom(x).ticks(yearTickCount(width)).tickFormat(INT_FORMAT),
    { ink, height, margin }
  )
  drawZeroLine(svg, y, { ink, width, margin, domain })

  function wireMarkInteractions(selection, nation, growTo) {
    selection
      .on('pointerenter pointermove', function (event, d) {
        showTooltip(event, pointTooltip(nationLabel(nation, language), d.year, d[valueField], format, language))
        if (growTo) d3.select(this).transition().duration(motionDuration(120)).attr('r', growTo)
      })
      .on('pointerleave', function () {
        hideTooltip()
        if (growTo) d3.select(this).transition().duration(motionDuration(120)).attr('r', POINT_R)
      })
      .on('click', (event, d) =>
        showTooltip(event, pointTooltip(nationLabel(nation, language), d.year, d[valueField], format, language))
      )
  }

  if (chartType === 'bar') {
    for (const nation of nations) {
      const series = allRows.filter((d) => d.nation === nation)
      if (series.length === 0) continue

      const bars = svg
        .selectAll(`rect.bar-${slug(nation)}`)
        .data(series)
        .join('rect')
        .attr('class', `bar-${slug(nation)} chart-mark nation-mark nation-${slug(nation)}`)
        .attr('x', (d) => x(d.year) + x1(nation))
        .attr('width', x1.bandwidth())
        .attr('y', y(0))
        .attr('height', 0)
        .attr('fill', color(nation))
        .attr('fill-opacity', 0.9)
        .attr('stroke', 'transparent')
        .attr('stroke-width', 1.5)

      wireMarkInteractions(bars, nation, null)
      bars
        .on('pointerenter.hl', function () {
          d3.select(this).attr('stroke', color(nation)).attr('stroke-opacity', 0.4)
        })
        .on('pointerleave.hl', function () {
          d3.select(this).attr('stroke', 'transparent')
        })

      bars
        .transition()
        .duration(motionDuration(550))
        .delay((_, i) => motionDuration(i * 45))
        .ease(POP_EASE)
        .attr('y', (d) => barTopAndHeight(y, d[valueField]).top)
        .attr('height', (d) => barTopAndHeight(y, d[valueField]).height)

      drawZeroLabels(svg, series, {
        ink,
        x: (d) => x(d.year) + x1(nation) + x1.bandwidth() / 2,
        y: y(0),
        valueField,
        group: slug(nation),
      })
    }
    return
  }

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d[valueField]))
  const area = d3
    .area()
    .x((d) => x(d.year))
    .y0(y(0))
    .y1((d) => y(d[valueField]))

  for (const nation of nations) {
    const series = allRows.filter((d) => d.nation === nation).sort((a, b) => a.year - b.year)
    if (series.length === 0) continue

    if (chartType === 'area') {
      svg
        .append('path')
        .datum(series)
        .attr('fill', color(nation))
        .attr('fill-opacity', 0)
        .attr('d', area)
        .transition()
        .duration(motionDuration(500))
        .attr('fill-opacity', 0.2)
    }

    const dash = styleOf(nation).dash
    // Sixty years of a noisy index at full weight is a hairball. A lighter
    // stroke lets the two series read through each other where they cross.
    const dense = series.length > 30

    const path = svg
      .append('path')
      .datum(series)
      .attr('class', `nation-mark nation-${slug(nation)}`)
      .attr('fill', 'none')
      .attr('stroke', color(nation))
      .attr('stroke-width', dense ? MARK_STROKE - 0.4 : MARK_STROKE)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line)

    // The draw-in animation works by animating a dash offset, so it has to
    // finish before the series' own dash pattern can be applied.
    const totalLength = path.node().getTotalLength()
    if (totalLength > 0) {
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(motionDuration(650))
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)
        .on('end', () => path.attr('stroke-dasharray', dash).attr('stroke-dashoffset', null))
    } else {
      path.attr('stroke-dasharray', dash)
    }

    // A visible dot per year turns a long record into a solid bead of circles.
    // Past that density the line is the mark, and the tooltip still works: the
    // circles are still there, just transparent, so every year keeps a hit
    // target of its own.
    const showPoints = !dense

    const points = svg
      .selectAll(`circle.point-${slug(nation)}`)
      .data(series)
      .join('circle')
      .attr('class', `point-${slug(nation)} chart-mark nation-mark nation-${slug(nation)}`)
      .attr('cx', (d) => x(d.year))
      .attr('cy', (d) => y(d[valueField]))
      .attr('r', showPoints ? 0 : POINT_R_HOVER)
      .attr('fill', showPoints ? color(nation) : 'transparent')
      .attr('stroke', showPoints ? surface : 'none')
      .attr('stroke-width', 1.5)

    wireMarkInteractions(points, nation, showPoints ? POINT_R_HOVER : null)

    if (showPoints) {
      points
        .transition()
        .delay(motionDuration(500))
        .duration(motionDuration(400))
        .ease(POP_EASE)
        .attr('r', POINT_R)
    }
  }
}
