import { useEffect, useRef } from 'react'
import { useElementWidth } from './useElementWidth.js'
import { useInView } from './useInView.js'
import { useTheme } from './useTheme.jsx'
import { resetSvg } from '../utils/d3helpers.js'

// The scaffolding every D3 chart card on this page needs: measure the card in
// real pixels, wait until it is on screen, clear the SVG, draw, and redraw when
// the theme flips.
//
// Worth centralising because the ordering is where the bugs live. A draw effect
// that runs before its data or its container is ready must still run again once
// they are, and twice this session a chart stayed blank because an effect fired
// early and its dependencies never changed afterwards. One implementation of
// that rule is one place to get it right.
//
// Options:
//   height -- fixed SVG height in px
//   ready -- false while data is missing; the draw is skipped and retried when
//     it flips, rather than drawing an empty chart once and stopping
//   waitForInView -- default true. Charts that animate on arrival want it;
//     a chart driven by an external scroll position does not, since it is
//     already mid-view by the time anything drives it.
//   draw -- (svg, { width, theme }) => cleanup?. Read from a ref, so a caller
//     can pass an inline closure without retriggering the effect every render.
//   deps -- what should cause a redraw, beyond size, theme and readiness.
//
// Returns the two refs the card needs -- `svgRef` on the <svg>, `cardRef` on the
// element whose visibility gates the draw -- plus the measured `node` itself,
// for the occasional effect that restyles marks after the fact rather than
// redrawing them.
export function useChartCanvas({ height, ready = true, waitForInView = true, draw, deps = [] }) {
  const [svgRef, node, width] = useElementWidth()
  const [cardRef, inView] = useInView()
  const { theme } = useTheme()

  const drawRef = useRef(draw)
  drawRef.current = draw

  const visible = waitForInView ? inView : true

  useEffect(() => {
    if (!visible || !ready || !node || !width) return
    return drawRef.current(resetSvg(node, width, height), { width, theme })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, ready, node, width, height, theme, ...deps])

  return { svgRef, cardRef, node, inView, width, theme }
}
