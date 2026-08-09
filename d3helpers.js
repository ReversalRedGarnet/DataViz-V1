import * as d3 from 'd3'

// Clears an SVG for a fresh D3 draw and returns the selection, viewBox set.
// Takes either a ref object or the element itself.
export function resetSvg(target, width, height) {
  const svg = d3.select(target?.current ?? target)
  svg.selectAll('*').remove()
  svg.attr('viewBox', `0 0 ${width} ${height}`)
  return svg
}

// A country name as a CSS-class-safe token. Shared because the class names the
// chart renderers put on their marks are the same names the cross-chart
// highlight looks for -- two copies of this rule would be two chances for a
// country to become un-highlightable.
export function slug(nation) {
  return String(nation).replace(/\s+/g, '')
}
