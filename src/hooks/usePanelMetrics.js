import { useEffect, useLayoutEffect, useState } from 'react'

// How much overflow a panel is allowed before it stops counting as fitting.
//
// ONE NUMBER, read by both hooks below, because they are two halves of the
// same question and they used to disagree. Centring called a panel fitted at
// 1px of overflow; the "more in this section" hint appeared only past 24px.
// Between the two a slide was top-aligned -- visibly off-centre, with dead
// space under it -- AND silently scrollable with nothing on screen saying so.
//
// That band is exactly where a wording pass sends every slide: cutting copy
// walks a section down through its own height, and on the way past it lands in
// the gap.
//
// 24, not 1, because the hint's threshold is the one with a reason behind it:
// under about 24px there is nothing below the fold worth pointing at.
export const OVERFLOW_SLACK = 24

// Watch a node until it settles, then run `measure`. Shared because both hooks
// need the same three triggers: a resize of the box, a resize of its content,
// and one late reading after any chart that draws on activation has finished.
function observeSettled(node, measure) {
  let frame = null
  const schedule = () => {
    if (frame == null) frame = requestAnimationFrame(() => {
      frame = null
      measure()
    })
  }
  const resize = new ResizeObserver(schedule)
  resize.observe(node)
  if (node.firstElementChild) resize.observe(node.firstElementChild)
  measure()
  const settle = setTimeout(measure, 720)
  return () => {
    resize.disconnect()
    clearTimeout(settle)
    if (frame) cancelAnimationFrame(frame)
  }
}

// Does this panel's content fit inside it?
//
// Answered by measurement rather than by a flag on the section, because it is
// not a property of the section: the same block centres on a desktop and
// overflows on a laptop, and half the slides change height as the reader picks
// countries or a chart draws for the first time.
//
// Measured for every panel, on stage or off. Off-stage panels have live layout
// -- the rule PageSections exists to enforce -- so a slide that arrives already
// centred saves the reader a visible jump on the frame after it lands.
//
// useLayoutEffect, not useEffect: this decides how the panel is laid out, so it
// has to resolve before paint or the first frame of every short slide shows it
// top-aligned and then snaps.
//
// This cannot oscillate: the section already fills the panel whenever it fits
// (`.slide-scroll > *` grows and never shrinks), so centring only repositions
// content inside a box whose height is unchanged.
export function usePanelFit(node, isActive) {
  const [fits, setFits] = useState(false)

  useLayoutEffect(() => {
    if (!node) return
    return observeSettled(node, () =>
      setFits(node.scrollHeight - node.clientHeight <= OVERFLOW_SLACK)
    )
  }, [node, isActive])

  return fits
}

// How far down this panel the reader has scrolled, and whether there is more
// below the fold. Only the on-stage panel reports: the others sit wherever the
// reader last left them and would fight over the readout.
export function usePanelProgress(node, isActive, onProgress, onOverflow) {
  useEffect(() => {
    if (!isActive || !node) return

    const report = () => {
      const scrollable = node.scrollHeight - node.clientHeight
      const fraction = scrollable > 4 ? Math.min(1, Math.max(0, node.scrollTop / scrollable)) : 0
      if (onProgress) onProgress(fraction)
      // Hidden once the reader is near the end: an arrow still pointing down
      // at the bottom of a panel is an instruction that does nothing.
      if (onOverflow) {
        onOverflow(scrollable > OVERFLOW_SLACK && node.scrollTop < scrollable - OVERFLOW_SLACK)
      }
    }

    let frame = null
    const onScroll = () => {
      if (frame == null) frame = requestAnimationFrame(() => {
        frame = null
        report()
      })
    }

    node.addEventListener('scroll', onScroll, { passive: true })
    const stop = observeSettled(node, report)
    return () => {
      node.removeEventListener('scroll', onScroll)
      stop()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [isActive, node, onProgress, onOverflow])
}
