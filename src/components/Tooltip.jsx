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

// How far above the anchored point the box's bottom edge sits. Exported for
// the same reason the width is: useTooltip clamps against the box's real
// footprint, and that footprint starts here.
export const TOOLTIP_GAP = 10

export default function Tooltip({ tooltip }) {
  if (!tooltip) return null

  return (
    <div
      role="tooltip"
      className="animate-tooltip-pop-in pointer-events-none absolute z-30 rounded-md border border-ink/15 bg-sand px-2.5 py-1.5 text-[11px] leading-snug text-ink shadow-md"
      style={{
        left: tooltip.x,
        top: tooltip.y - TOOLTIP_GAP,
        maxWidth: TOOLTIP_MAX_WIDTH,
        // WRITTEN HERE, NOT ONLY IN THE KEYFRAMES. This is what makes (x, y)
        // mean "the point the box is centred over and sits above" rather than
        // "the box's top-left corner", and the clamps in useTooltip are
        // computed against exactly that. It used to arrive only as a side
        // effect of tooltip-pop-in's `both` fill -- so under
        // prefers-reduced-motion, where index.css sets `animation: none`, the
        // transform vanished with it: the box dropped below its mark and sat
        // half a width to the right of where the x clamp had placed it, which
        // put it over the container's right edge on any mark past centre.
        // The keyframes still carry the same translate, so this changes
        // nothing for a reader who has motion on.
        transform: 'translate(-50%, -100%)',
      }}
    >
      {tooltip.content}
    </div>
  )
}
