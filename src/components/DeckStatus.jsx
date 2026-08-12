import { formatNationList } from '../utils/formatNationList.js'

// What the reader has currently chosen, visible from every slide.
//
// In the single-document layout this component would be redundant: the map and
// the charts it drives are a scroll apart, so a reader can see a pick and its
// consequence together and change their mind in one gesture. Paging separates
// them by four slides. This is the compensation -- the selection follows the
// reader, and can be cleared without navigating back to the map to do it.
//
// Renders nothing until there is something to report, so the header keeps its
// original height on the opening slides.
export default function DeckStatus({ storm, selectedNations, onClearNations }) {
  const nations = selectedNations ?? []
  if (!storm) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink/10 pt-2 text-xs">
      <span className="font-semibold uppercase tracking-[0.14em] text-accent">
        {storm.name} {storm.year}
      </span>
      {nations.length > 0 ? (
        <>
          <span className="opacity-70">{formatNationList(nations)}</span>
          <button
            type="button"
            onClick={onClearNations}
            className="rounded px-1.5 py-0.5 underline decoration-ink/30 underline-offset-2 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear
          </button>
        </>
      ) : (
        <span className="opacity-55">No countries selected yet</span>
      )}
    </div>
  )
}
