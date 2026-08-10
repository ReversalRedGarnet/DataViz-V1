import * as d3 from 'd3'
import { chartColorsFor, CHART_INK, CHART_SURFACE } from './theme.js'
import { motionDuration } from './motion.js'
import { slug } from './d3helpers.js'

// Every chart is drawn at its container's measured pixel width (see
// useElementWidth.js), so the numbers below are real CSS pixels rather than
// viewBox units multiplied by whatever ratio the container imposes. One type
// scale, one stroke weight, one point size, everywhere on the site.
const AXIS_FONT = 11
const VALUE_FONT = 11
const MARK_STROKE = 2
const POINT_R = 3.5
const POINT_R_HOVER = 6

// The second series is dashed. The two picks are a blue and a gold chosen for
// contrast against the card, which leaves them near-identical in luminance --
// distinguishable by hue alone, and blue-yellow is the one axis tritanopia
// loses. A dash pattern separates them without colour, and matters most
// exactly where it costs least: two lines crossing each other.
const SERIES_DASH = [null, '7 4']

// Uniform for every metric and snapshot chart, so a chart spanning two grid
// columns is wider than its neighbours but exactly as tall.
export const CHART_HEIGHT = 210
export const STORM_CHART_HEIGHT = 260

// Left margin holds a four-character tick label plus its gap; bottom holds one
// row of horizontal labels, or a taller band when they have to be angled.
const MARGIN = { top: 16, right: 14, bottom: 30, left: 48 }
const MARGIN_TILTED_BOTTOM = 62

const POP_EASE = d3.easeBackOut.overshoot(1.4)
const INT_FORMAT = d3.format('d')

// Axis labels have to fit a band that can be under 50px wide on a phone.
// Truncating to the first word was the old rule, which turned "Federated
// States of Micronesia" into "Federated" -- so the long names get a real short
// form, and anything not listed is left alone.
const SHORT_NAMES = {
  'Federated States of Micronesia': 'Micronesia',
  'Papua New Guinea': 'PNG',
  'Marshall Islands': 'Marshall Is.',
  'Solomon Islands': 'Solomon Is.',
  'Cook Islands': 'Cook Is.',
  'New Caledonia': 'N. Caledonia',
  'French Polynesia': 'Fr. Polynesia',
}

function shortName(nation) {
  return SHORT_NAMES[nation] ?? nation
}

// Measuring text properly would mean a hidden canvas; a per-character estimate
// at these font sizes is accurate enough to decide whether a label fits.
function textWidth(text, fontSize = AXIS_FONT) {
  return String(text).length * fontSize * 0.58
}

function labelsFit(names, bandwidth) {
  return Math.max(...names.map((n) => textWidth(shortName(n)))) <= bandwidth - 4
}

// Whether the printed figures would touch each other. Decided for the chart as
// a whole, not per bar, so a section never shows some bars labelled and others
// not.
function valueLabelsFit(rows, format, bandwidth) {
  return Math.max(...rows.map((d) => textWidth(format(d.value), VALUE_FONT))) + 4 <= bandwidth
}

// A domain that extends below zero when the data does. Signed metrics (SPI/
// SPEI, sea-level anomaly) need this: a d3 linear scale happily returns a pixel
// position for an out-of-domain input, so a negative value on a [0, max] domain
// doesn't error, it just collapses to a zero-height bar.
// `pad` is the headroom past the data. The snapshots ask for more of it so a
// value label printed past the end of a bar has somewhere to sit -- without it
// the tallest bar's label had to move inside while its neighbours' stayed
// outside, and one chart ended up with two treatments.
function zeroAnchoredDomain(values, pad = 1.1) {
  const dataMin = Math.min(0, ...values)
  const dataMax = Math.max(0, ...values)
  return [dataMin < 0 ? dataMin * pad : 0, dataMax * pad]
}

// A bar's top y and height, for a value either side of the baseline. SVG y
// grows downward, so which of y(0)/y(value) is the top depends on the sign.
// Nothing measured should be invisible.
//
// Two separate ways a bar used to disappear. A reported zero drew at height 0,
// which looks exactly like a year nobody reported -- and Tonga reported no one
// affected in 2016 and 2017, and Fiji none in 2017, which are measurements. And
// a small value next to a large one rounded to a fraction of a pixel: against
// Fiji's 633,584 in 2016, Tonga's 68 in 2020 came out at two hundredths of a
// pixel.
//
// So: any non-zero value gets at least MIN_BAR_HEIGHT, and an exact zero is
// labelled with a printed "0" on the baseline instead of a bar (see
// drawZeroLabels). Giving zero a stub was the first attempt and it was worse --
// it made a reported nothing taller than a reported 68 people.
const MIN_BAR_HEIGHT = 2
const ZERO_LABEL_FONT = 10

function barTopAndHeight(y, value) {
  const yZero = y(0)
  if (value === 0) return { top: yZero, height: 0 }
  const yValue = y(value)
  const height = Math.max(MIN_BAR_HEIGHT, Math.abs(yZero - yValue))
  return { top: value < 0 ? yZero : yZero - height, height }
}

// The printed "0" that stands in for a bar with nothing to draw. Unmistakable
// at any scale, and it can't be confused with a very short bar the way a stub
// could.
function drawZeroLabels(svg, rows, { ink, x, y, valueField, group = 'all' }) {
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

// One axis look across all three charts: no y-domain line, faint full-width
// gridlines, small theme-tracking tick text. Only the tick generators differ,
// so callers build the axis and these apply the styling.
function drawYAxis(svg, y, { ink, width, margin, tickFormat, tickValues }) {
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

function drawXAxis(svg, axis, { ink, height, margin, tilt = false }) {
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
// gridlines. Skipped when nothing is negative, since the axis already sits
// there.
function drawZeroLine(svg, y, { ink, width, margin, domain }) {
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

// Year labels overlap long before the plot itself runs out of room.
function yearTickCount(width) {
  if (width < 360) return 3
  if (width < 560) return 5
  return 7
}

// For a band scale, whether every year can be labelled is a question about the
// band's actual step, not about the chart's overall width -- eight years in a
// narrow card label fine, sixty in a wide one don't.
function bandLabelStep(years, step) {
  const needed = textWidth('2020') + 8
  return Math.max(1, Math.ceil(needed / step))
}

function pointTooltip(nation, year, value, format) {
  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">
        {year}: {format(value)}
      </p>
    </>
  )
}

function stormPointTooltip(row) {
  return (
    <>
      <p className="font-semibold">{row.name}</p>
      <p className="opacity-80">{row.categoryLabel}</p>
      <p className="opacity-80">
        {row.deaths == null
          ? 'Deaths not reported'
          : `${row.deaths} ${row.deaths === 1 ? 'death' : 'deaths'}${
              row.deathsKind === 'indirect' ? ', indirect' : ''
            }`}
      </p>
      {row.deathsNote && <p className="mt-1 italic opacity-70">{row.deathsNote}</p>}
      <p className="mt-1 opacity-70">{row.fact}</p>
    </>
  )
}

function snapshotTooltip(row, format) {
  return (
    <>
      <p className="font-semibold">{row.nation}</p>
      <p className="opacity-80">{format(row.value)}</p>
    </>
  )
}

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
  }
) {
  const margin = MARGIN
  const ink = CHART_INK[theme] ?? CHART_INK.light
  const surface = CHART_SURFACE[theme] ?? CHART_SURFACE.light
  const palette = chartColorsFor(theme)

  const color = d3.scaleOrdinal(nations, palette.selection)

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
        showTooltip(event, pointTooltip(nation, d.year, d[valueField], format))
        if (growTo) d3.select(this).transition().duration(motionDuration(120)).attr('r', growTo)
      })
      .on('pointerleave', function () {
        hideTooltip()
        if (growTo) d3.select(this).transition().duration(motionDuration(120)).attr('r', POINT_R)
      })
      .on('click', (event, d) =>
        showTooltip(event, pointTooltip(nation, d.year, d[valueField], format))
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

    const dash = SERIES_DASH[nations.indexOf(nation)] ?? null
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

export function renderStormProfileChart(
  svg,
  { width, height = STORM_CHART_HEIGHT, rows, showTooltip, hideTooltip, theme = 'light' }
) {
  // Wider than the shared margins: this is the one chart with axis titles.
  const margin = { top: 20, right: 18, bottom: 52, left: 58 }
  const ink = CHART_INK[theme] ?? CHART_INK.light
  const surface = CHART_SURFACE[theme] ?? CHART_SURFACE.light
  const palette = chartColorsFor(theme)

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

export function renderSnapshotChart(
  svg,
  {
    width,
    height = CHART_HEIGHT,
    rows,
    format,
    showTooltip,
    hideTooltip,
    yTickFormat = d3.format('~s'),
    theme = 'light',
  }
) {
  const ink = CHART_INK[theme] ?? CHART_INK.light
  const palette = chartColorsFor(theme)

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

  drawYAxis(svg, y, { ink, width, margin, tickFormat: yTickFormat })
  drawXAxis(svg, d3.axisBottom(x).tickSizeOuter(0).tickFormat(shortName), {
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
      showTooltip(event, snapshotTooltip(d, format))
      d3.select(this).attr('stroke', palette.single).attr('stroke-opacity', 0.45)
    })
    .on('pointerleave', function () {
      hideTooltip()
      d3.select(this).attr('stroke', 'transparent')
    })
    .on('click', (event, d) => showTooltip(event, snapshotTooltip(d, format)))

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
      .text((d) => format(d.value))
      .transition()
      .delay((_, i) => motionDuration(400 + i * 70))
      .duration(motionDuration(300))
      .attr('fill-opacity', (d) => (placement(d).inside ? 0.95 : 0.8))
  }
}

// The dash patterns for the four-nation divergence charts. Same reasoning as
// SERIES_DASH above, extended: with four lines on one plot, hue is doing less
// work than it can carry, so each nation gets a pattern of its own.
const DIVERGENCE_DASH = [null, '7 4', '2 3', '9 3 2 3']

export const DIVERGENCE_HEIGHT = 220

// Where a series sits at a fractional year -- what the leading dot needs while
// the sweep is between two measured years. Before the first point and after
// the last it parks on the end value rather than extrapolating: a nation whose
// record stops in 2022 has stopped, and inventing a 2024 position for it would
// be inventing data.
function indexAtYear(points, year) {
  if (year <= points[0].year) return points[0].index
  const last = points[points.length - 1]
  if (year >= last.year) return last.index
  for (let i = 1; i < points.length; i++) {
    if (points[i].year >= year) {
      const a = points[i - 1]
      const b = points[i]
      return a.index + (b.index - a.index) * ((year - a.year) / (b.year - a.year))
    }
  }
  return last.index
}

// Push overlapping end labels apart, nearest-to-its-line first. Four nations
// starting from a common point spend the first second of the sweep stacked on
// top of each other, which is exactly the moment the labels are least useful
// and most in the way.
function spreadLabels(entries, minGap, top, bottom) {
  const sorted = [...entries].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].y - sorted[i - 1].y
    if (gap < minGap) sorted[i].y = sorted[i - 1].y + minGap
  }
  // The push above only ever moves labels down, so the last one can end up
  // past the bottom of the plot; walk back up to bring the run inside.
  const overflow = sorted[sorted.length - 1].y - bottom
  if (overflow > 0) {
    for (let i = sorted.length - 1; i >= 0; i--) {
      sorted[i].y = Math.min(sorted[i].y, bottom - (sorted.length - 1 - i) * minGap)
      if (i > 0 && sorted[i].y - sorted[i - 1].y < minGap) sorted[i - 1].y = sorted[i].y - minGap
    }
  }
  for (const entry of sorted) entry.y = Math.max(top, entry.y)
  return sorted
}

function divergenceTooltip(nation, point, format) {
  const delta = point.index - 100
  return (
    <>
      <p className="font-semibold">{nation}</p>
      <p className="opacity-80">
        {point.year}: {format(point.raw)}
      </p>
      <p className="mt-1 opacity-70">
        {delta === 0 ? 'level with' : `${delta > 0 ? '+' : ''}${delta.toFixed(0)}% against`} its own{' '}
        {point.baseYear} figure
      </p>
    </>
  )
}

// A "same start, different finish" chart: every nation indexed to its own
// value in the event year, so all four lines begin at 100 and the only thing
// the chart can show is how far apart they end up.
//
// Built once and then driven, rather than redrawn: returns { update(progress) }
// where progress runs 0..1 across the year range. A section-wide sweep is
// animating three of these at 60fps, so an update has to be an attribute write
// on marks that already exist, not another pass of D3 draw code.
//
// Args:
//   series -- [{ nation, points: [{ year, index, raw, baseYear }] }], in the
//     order the colours should be assigned
//   years -- [firstYear, lastYear], shared across every chart in the section
//     so their sweeps stay in step even when their records end at different
//     points
export function buildDivergenceChart(
  svg,
  { width, height = DIVERGENCE_HEIGHT, series, years, format, showTooltip, hideTooltip, theme = 'light' }
) {
  const ink = CHART_INK[theme] ?? CHART_INK.light
  const surface = CHART_SURFACE[theme] ?? CHART_SURFACE.light
  const palette = chartColorsFor(theme)

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
    const year = years[0] + (years[1] - years[0]) * clamped
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
