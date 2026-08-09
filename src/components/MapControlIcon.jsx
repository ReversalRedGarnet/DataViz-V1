// Icons for the map's zoom/reset buttons. Same stroke weight and colour as the
// chart lines and the wave border, so they read as one icon set.
//
// Zoom-out is literally the cross's horizontal stroke, same coordinates. Reset
// is a ~290-degree arc (large-arc-flag 1, sweep-flag 0: the long way round, not
// the short way through the gap) with an arrowhead tangent to the curl.
//
// Props:
//   kind -- 'zoomIn' | 'zoomOut' | 'reset'
const STROKE = '#24333A'
const STROKE_WIDTH = 2.25

export default function MapControlIcon({ kind }) {
  if (kind === 'zoomIn') {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <line x1="12" y1="4" x2="12" y2="20" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
        <line x1="4" y1="12" x2="20" y2="12" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'zoomOut') {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <line x1="4" y1="12" x2="20" y2="12" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M 7.70 5.86 A 7.5 7.5 0 1 0 16.30 5.86"
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="14.42,4.54 18.82,5.05 16.41,8.49" fill={STROKE} />
    </svg>
  )
}
