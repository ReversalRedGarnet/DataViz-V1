import * as d3 from 'd3'
import { chartTheme } from '../theme.js'
import { motionDuration } from '../motion.js'
import { slug } from '../d3helpers.js'
import {
  CHART_HEIGHT,
  MARGIN,
  MARGIN_TILTED_BOTTOM,
  POP_EASE,
  VALUE_FONT,
} from './constants.js'
import { labelsFit, shortName, siTickFormat, valueLabelsFit } from './labels.js'
import { barTopAndHeight, zeroAnchoredDomain } from './scales.js'
import { drawXAxis, drawYAxis, drawZeroLine } from './axes.js'
import { snapshotTooltip } from './tooltips.jsx'
import { nationLabel } from '../../content/nations.js'

// One bar per nation for a single year.
export function renderSnapshotChart(
  svg,
  {
    width,
    height = CHART_HEIGHT,
    rows,
    format,
    showTooltip,
    hideTooltip,
    yTickFormat,
    theme = 'light',
    language = 'en',
  }
) {
  const { ink, palette } = chartTheme(theme)

  const names = rows.map((d) => d.nation)
  const plotWidth = width - MARGIN.left - MARGIN.right
  const tilt = !labelsFit(names, plotWidth / Math.max(1, names.length))
  const margin = { ...MARGIN, bottom: tilt ? MARGIN_TILTED_BOTTOM : MARGIN.bottom }

  const x = d3
    .scaleBand()
    .domain(names)
    .range([margin.left, width - margin.right])
    .padding(0.3)

  const showValues = valueLabelsFit(rows, format, x.bandwidth())
  const domain = zeroAnchoredDomain(rows.map((d) => d.value), showValues ? 1.28 : 1.1)
  const y = d3
    .scaleLinear()
    .domain(domain)
    .nice()
    .range([height - margin.bottom, margin.top])

  drawYAxis(svg, y, { ink, width, margin, tickFormat: yTickFormat ?? siTickFormat(language) })
  drawXAxis(svg, d3.axisBottom(x).tickSizeOuter(0).tickFormat((d) => shortName(d, language)), {
    ink,
    height,
    margin,
    tilt,
  })
  drawZeroLine(svg, y, { ink, width, margin, domain })

  const bars = svg
    .selectAll('rect.snapshot-bar')
    .data(rows)
    .join('rect')
    .attr('class', (d) => `snapshot-bar chart-mark nation-mark nation-${slug(d.nation)}`)
    .attr('x', (d) => x(d.nation))
    .attr('width', x.bandwidth())
    .attr('y', y(0))
    .attr('height', 0)
    .attr('fill', palette.single)
    .attr('fill-opacity', 0.9)
    .attr('stroke', 'transparent')
    .attr('stroke-width', 1.5)
    .on('pointerenter pointermove', function (event, d) {
      showTooltip(event, snapshotTooltip(nationLabel(d.nation, language), d.value, format, language))
      d3.select(this).attr('stroke', palette.single).attr('stroke-opacity', 0.45)
    })
    .on('pointerleave', function () {
      hideTooltip()
      d3.select(this).attr('stroke', 'transparent')
    })
    .on('click', (event, d) =>
      showTooltip(event, snapshotTooltip(nationLabel(d.nation, language), d.value, format, language))
    )

  bars
    .transition()
    .duration(motionDuration(550))
    .delay((_, i) => motionDuration(i * 70))
    .ease(POP_EASE)
    .attr('y', (d) => barTopAndHeight(y, d.value).top)
    .attr('height', (d) => barTopAndHeight(y, d.value).height)

  // The figure printed on the bar, so the comparison can be read without
  // hovering anything. This is the one chart where every bar is a single
  // number a reader might want exactly -- the trend charts have too many
  // points for the same treatment. Dropped once the bars are narrow enough
  // for the numbers to collide.
  if (showValues) {
    // Preferred position is just past the end of the bar. A bar running to the
    // edge of the plot has no room there, so its label moves inside the bar
    // instead -- which is also why the fill is chosen per label rather than
    // once for all of them.
    const placement = (d) => {
      const { top, height: barHeight } = barTopAndHeight(y, d.value)
      const outside = d.value < 0 ? top + barHeight + VALUE_FONT + 1 : top - 6
      const fitsOutside =
        d.value < 0 ? outside <= height - margin.bottom - 2 : outside - VALUE_FONT >= margin.top - 2
      if (fitsOutside) return { y: outside, inside: false }
      return {
        y: d.value < 0 ? top + barHeight - 6 : top + VALUE_FONT + 4,
        inside: barHeight >= VALUE_FONT + 10,
      }
    }

    svg
      .selectAll('text.snapshot-value')
      .data(rows)
      .join('text')
      .attr('class', 'snapshot-value')
      .attr('x', (d) => x(d.nation) + x.bandwidth() / 2)
      .attr('y', (d) => placement(d).y)
      .attr('text-anchor', 'middle')
      .attr('font-size', VALUE_FONT)
      .attr('font-weight', 600)
      .attr('fill', (d) => (placement(d).inside ? palette.onMark : ink))
      .attr('fill-opacity', 0)
      .text((d) => format(d.value, language))
      .transition()
      .delay((_, i) => motionDuration(400 + i * 70))
      .duration(motionDuration(300))
      .attr('fill-opacity', (d) => (placement(d).inside ? 0.95 : 0.8))
  }
}
