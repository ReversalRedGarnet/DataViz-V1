// Slideshow or one long page.
//
// This is not a preference switch, it is an accessibility escape hatch, and it
// is the reason the slideshow was allowed to happen at all. Paging the piece
// costs find-in-page, printing, scroll restoration and the browser's own scroll
// gestures -- the same costs StoryGate's comment argues against paying. This
// gives all of them back for one click.
//
// It stays cheap only as long as PageSections never conditionally renders a
// section: both layouts are the same mounted tree, so switching loses no chart,
// no zoom transform and no scroll position in either direction.
export default function LayoutToggle({ layout, onChange }) {
  const slides = layout === 'slides'

  return (
    <button
      type="button"
      onClick={() => onChange(slides ? 'document' : 'slides')}
      aria-pressed={!slides}
      title={slides ? 'Read as one page' : 'Read as slides'}
      aria-label={slides ? 'Read as one page' : 'Read as slides'}
      className="flex h-9 w-9 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="none">
        {slides ? (
          // Stacked rows: what you would be switching to.
          <>
            <rect x="4" y="4" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
            <rect x="4" y="10" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
            <rect x="4" y="16" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
          </>
        ) : (
          // One framed panel with its neighbours peeking in at the edges.
          <>
            <rect x="7" y="5" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4 8v8M20 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  )
}
