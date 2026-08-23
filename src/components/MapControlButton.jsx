import MapControlIcon from './MapControlIcon.jsx'

// One of the map's zoom/reset controls.
//
// The three of these carried an identical six-utility className between them --
// the only class string in the codebase repeated three times -- so a change to
// the hover behaviour meant three edits, and any one of them could be missed.
//
// 44px is not arbitrary: it is the minimum comfortable touch target, and the
// map is the section where a mis-tap is most disruptive.
//
// Props:
//   kind -- which glyph, passed straight to MapControlIcon
//   onClick, label -- what it does and what a screen reader calls it
export default function MapControlButton({ kind, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-surface/50 shadow-sm backdrop-blur-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-surface/70 active:scale-90"
    >
      <MapControlIcon kind={kind} />
    </button>
  )
}
