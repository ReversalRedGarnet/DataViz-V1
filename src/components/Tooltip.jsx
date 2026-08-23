// Floating tooltip box, positioned by useTooltip.js.
//
// Animation, not transition: this element mounts and unmounts each time it
// appears, and a transition needs a prior style on the same node to animate
// from, so it would never run on entrance.
//
// SIZED TO BE GLANCED AT. A tooltip is supporting information for a mark the
// reader is already looking at, so it has to stay smaller than the thing it
// supports. The storm profile's tooltip used to carry the nation, the full
// category label, the death toll, a reporting note and a research paragraph --
// over 800 characters at worst, which in a 220px column is a block of text
// taller than the chart it was explaining, covering the other marks a reader
// was about to compare it against.
//
// The cap and the padding are the ceiling; keeping bodies to two or three short
// lines (see utils/charts/tooltips.jsx) is what keeps them well under it.
//
// Props:
//   tooltip -- { x, y, content } | null, from useTooltip()

// Exported so useTooltip clamps against the real width. The two used to be set
// independently -- a 220px box clamped as though it were 180 -- so the box could
// still overhang the edge it was being kept away from.
export const TOOLTIP_MAX_WIDTH = 190

export default function Tooltip({ tooltip }) {
  if (!tooltip) return null

  return (
    <div
      role="tooltip"
      className="animate-tooltip-pop-in pointer-events-none absolute z-30 rounded-md border border-ink/15 bg-sand px-2.5 py-1.5 text-[11px] leading-snug text-ink shadow-md"
      style={{ left: tooltip.x, top: tooltip.y - 10, maxWidth: TOOLTIP_MAX_WIDTH }}
    >
      {tooltip.content}
    </div>
  )
}
