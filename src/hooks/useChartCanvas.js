// HOW A CHART GETS DRAWN -- the D3 setup in one place.
//
// React and D3 split the work. React renders the chart card: the heading, the
// caption and an empty <svg>. D3 (a JavaScript library for drawing data) then
// draws inside that <svg> -- axes, bars, lines, dots. They must not both try
// to manage the same elements, so React never touches what is inside the svg.
//
// This hook (a "hook" is a reusable piece of React logic whose name starts
// with `use`) does the hand-over:
//   1. measures the card's width in real pixels (useElementWidth.js),
//   2. waits until the card is on screen (useInView.js), so the entrance
//      animation is seen,
//   3. clears the svg (resetSvg in utils/d3helpers.js),
//   4. calls the chart's draw function -- one of the render*Chart functions in
//      utils/charts/ -- with the width, the theme and the language,
//   5. does it all again whenever the width, theme or language changes.
// Each render function turns data into pixels with D3 "scales" (functions
// that map a value, like 1,200 tonnes, to a position, like 140px), then draws
// axes, marks and tooltips. Colours come from utils/theme.js.

import { useEffect, useState } from 'react'
import { useElementWidth } from './useElementWidth.js'
import { useInView } from './useInView.js'
import { useTheme } from './useTheme.jsx'
import { useLanguage } from './useLanguage.jsx'
import { useLatest } from './useLatest.js'
import { resetSvg } from '../utils/d3helpers.js'

// The scaffolding every D3 chart card on this page needs: measure the card in
// real pixels, wait until it is on screen, clear the SVG, draw, and redraw when
// the theme or the language changes. Language needs a redraw too: axis labels,
// tooltips and any text drawn with d3's own .text() (rather than JSX) only pick
// up new strings when drawn again; there is no CSS-only path for SVG text
// drawn from JavaScript the way there is for colour.
//
// Worth centralising because the ordering is where the bugs live. A draw effect
// that runs before its data or its container is ready must still run again once
// they are -- an effect that fires early and never sees its dependencies change
// again leaves a chart blank for good. One implementation of that rule is one
// place to get it right.
//
// Options:
//   height -- fixed SVG height in px
//   ready -- false while data is missing; the draw is skipped and retried when
//     it flips, rather than drawing an empty chart once and stopping
//   waitForInView -- default true. Charts that animate on arrival want it;
//     a chart driven by an external scroll position does not, since it is
//     already mid-view by the time anything drives it.
//   draw -- (svg, { width, theme, language }) => cleanup?. Read from a ref, so
//     a caller can pass an inline closure without retriggering the effect
//     every render.
//   deps -- what should cause a redraw, beyond size, theme, language and
//     readiness.
//
// Returns the two refs the card needs -- `svgRef` on the <svg>, `cardRef` on the
// element whose visibility gates the draw -- plus the measured `node` itself,
// for the occasional effect that restyles marks after the fact rather than
// redrawing them.
//
// `drawCount` is what those restyling effects have to depend on. The marks
// belong to D3 and every redraw destroys and recreates them, so a class applied
// after the fact is gone the next time the chart is drawn -- on a theme flip,
// say. Node identity does not change across a redraw and neither does the data
// the restyle is keyed on, so there is nothing else for such an effect to
// notice. Depending on this makes "run again after every draw" expressible
// without falling back to a dependency-free effect that runs after every
// render.
export function useChartCanvas({ height, ready = true, waitForInView = true, draw, deps = [] }) {
  const [svgRef, node, width] = useElementWidth()
  const [cardRef, inView] = useInView()
  const { theme } = useTheme()
  const { language } = useLanguage()

  const drawRef = useLatest(draw)

  const visible = waitForInView ? inView : true

  const [drawCount, setDrawCount] = useState(0)

  useEffect(() => {
    if (!visible || !ready || !node || !width) return
    const cleanup = drawRef.current(resetSvg(node, width, height), { width, theme, language })
    // Not in this effect's own dependencies, so it cannot loop. Costs one
    // extra render per draw, and draws are rare -- the alternative was every
    // consumer re-running its restyle after every render forever.
    setDrawCount((n) => n + 1)
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, ready, node, width, height, theme, language, ...deps])

  return { svgRef, cardRef, node, inView, width, theme, language, drawCount }
}
