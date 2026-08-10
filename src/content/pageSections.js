// The page's in-page anchors, read by SectionNav to build its jump-to menu.
//
// Ripple is a single page, so this is one flat list rather than the
// pathname-keyed map a multi-page site would need. Each `id` must match the
// `id` on the matching entry in App.jsx's PageSections list -- nothing checks
// this at runtime, so renaming one side means renaming the other.
export const PAGE_SECTIONS = [
  { id: 'top', label: 'Overview' },
  { id: 'storm-journey', label: 'Follow the Storm' },
  { id: 'storm-profile', label: 'Storm Profile' },
  { id: 'big-picture', label: 'The Bigger Picture' },
  { id: 'map', label: 'Explore the Map' },
  { id: 'ripple-chain', label: 'The Ripple Chain' },
  { id: 'divergence', label: 'Where They Part Ways' },
  { id: 'context', label: 'Capacity & Context' },
  { id: 'compare', label: 'Compare Recovery' },
  { id: 'sources', label: 'Sources' },
]
