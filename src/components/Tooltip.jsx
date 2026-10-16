// Floating tooltip box, positioned by useTooltip.js.
//
// Animation, not transition: this element mounts and unmounts each time it
// appears, and a transition needs a prior style on the same node to animate
// from, so it would never run on entrance.
//
// SIZED TO BE GLANCED AT. A tooltip is supporting information for a mark the
// reader is already looking at, so it has to stay smaller than the thing it
// supports. A tooltip carrying everything known about a mark -- the nation,
// the full category label, the death toll, a reporting note and a research
// paragraph -- can run past 800 characters, which in a 220px column is taller
// than the chart it explains and covers the marks a reader is about to
// compare it against.
//
// The cap and the padding are the ceiling; keeping bodies to two or three short
// lines (see utils/charts/tooltips.jsx) is what keeps them well under it.
//
// Props:
//   tooltip -- { x, y, content } | null, from useTooltip()

// Exported so useTooltip clamps against the real width. Set independently, the
// two could disagree -- a 220px box clamped as though it were 180 still
// overhangs the edge it is being kept away from.
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
        // computed against exactly that. If it came only from tooltip-pop-in's
        // `both` fill, it would vanish under prefers-reduced-motion (where
        // index.css sets `animation: none`): the box would drop below its mark
        // and sit half a width to the right of where the x clamp placed it,
        // over the container's right edge for any mark past centre.
        // The keyframes still carry the same translate, so this changes
        // nothing for a reader who has motion on.
        transform: 'translate(-50%, -100%)',
      }}
    >
      {tooltip.content}
    </div>
  )
}
