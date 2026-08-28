// The page's in-page anchors, read by SectionNav to build its jump-to menu.
//
// Ripple is a single page, so this is one flat list rather than the
// pathname-keyed map a multi-page site would need. Each `id` must match the
// `id` on the matching entry in App.jsx's PageSections list -- nothing checks
// this at runtime, so renaming one side means renaming the other.
//
// `id` is also the deep-link anchor (`href="#${id}"` in SectionNav, and the
// hash useDeck reads and writes) -- it must never be translated or a shared
// link breaks. `label` is display-only and carries both languages; call
// sectionLabel(section, language) rather than reading .label directly.
export const PAGE_SECTIONS = [
  { id: 'top', label: { en: 'Overview', fr: 'Aperçu' } },
  { id: 'timeline', label: { en: 'How Often, and to Whom', fr: 'À quelle fréquence, et pour qui' } },
  { id: 'storm-journey', label: { en: 'Follow the Storm', fr: 'Suivre le cyclone' } },
  { id: 'storm-profile', label: { en: 'Storm Profile', fr: 'Profil du cyclone' } },
  { id: 'big-picture', label: { en: 'The Bigger Picture', fr: "Vue d'ensemble" } },
  { id: 'map', label: { en: 'Explore the Map', fr: 'Explorer la carte' } },
  { id: 'ripple-chain', label: { en: 'The Ripple Chain', fr: 'La chaîne de répercussions' } },
  { id: 'divergence', label: { en: 'Where They Part Ways', fr: 'Où les trajectoires divergent' } },
  { id: 'context', label: { en: 'Capacity & Context', fr: 'Capacité et contexte' } },
  { id: 'compare', label: { en: 'Compare Recovery', fr: 'Comparer le redressement' } },
  { id: 'detective', label: { en: 'What Shaped the Difference', fr: "Ce qui a fait la différence" } },
  { id: 'conclusion', label: { en: 'What It Adds Up To', fr: 'Ce que cela signifie' } },
  { id: 'method', label: { en: 'How This Was Made', fr: 'Comment ce site a été fait' } },
  { id: 'sources', label: { en: 'Sources', fr: 'Sources' } },
]

// The one function that should ever read .label. Falls back to English so a
// section added without its French half yet still renders something instead
// of undefined.
export function sectionLabel(section, language = 'en') {
  if (!section?.label) return ''
  return section.label[language] ?? section.label.en
}
