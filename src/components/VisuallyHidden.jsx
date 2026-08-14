// Screen-reader-only content, kept out of the visual layout.
//
// This is a wrapper element rather than a class you put on the content itself,
// and that distinction is the entire point of the file.
//
// Tailwind's .sr-only collapses a box with `position: absolute; height: 1px;
// overflow: hidden`. That works on a block container and does nothing whatever
// to a <table>: a table box treats `height` as a minimum rather than a ceiling
// (CSS 2.1 17.5.3) and is not a block container, so `overflow` does not apply
// to it either. A <table className="sr-only"> therefore stays at full rendered
// size -- invisible, because it is clipped and behind everything, but fully
// laid out and absolutely positioned, so it extends the scrollable overflow of
// whichever ancestor happens to be scrolling.
//
// That is what put a few hundred pixels of empty space below the content on the
// storm-profile and comparison slides: the panel scrolled down into nothing,
// because a 1300px-tall hidden table was sitting under a 500px section. The
// same bug in its horizontal form had already been found and patched once, with
// `whitespace-normal` to stop the table stretching a panel to ~2000px wide --
// but that treated the symptom on one axis and left the cause in place.
//
// A <div> is a block container, so here the clip actually applies. The table
// inside keeps `display: table`, which is what a screen reader needs in order
// to announce it as rows and columns -- so this fixes the layout without
// costing the accessibility the tables exist to provide.
//
// whitespace-normal lives here rather than on each table because .sr-only sets
// `white-space: nowrap`, which inherits: without the reset every prose cell
// lays out as one unbroken line inside the clip. Harmless now that it is
// clipped, but it is wasted layout work on every render.
export default function VisuallyHidden({ children }) {
  return <div className="sr-only whitespace-normal">{children}</div>
}
