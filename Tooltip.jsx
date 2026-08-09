// Floating tooltip box, positioned by useTooltip.js.
//
// Animation, not transition: this element mounts and unmounts each time it
// appears, and a transition needs a prior style on the same node to animate
// from, so it would never run on entrance.
//
// Props:
//   tooltip -- { x, y, content } | null, from useTooltip()
export default function Tooltip({ tooltip }) {
  if (!tooltip) return null

  return (
    <div
      role="tooltip"
      className="animate-tooltip-pop-in pointer-events-none absolute z-30 max-w-[220px] rounded-lg border border-ink/15 bg-sand px-3 py-2 text-xs leading-snug text-ink shadow-lg"
      style={{ left: tooltip.x, top: tooltip.y - 10 }}
    >
      {tooltip.content}
    </div>
  )
}
