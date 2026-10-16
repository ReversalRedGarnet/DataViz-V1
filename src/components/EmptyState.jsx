// The "nothing to show yet" box a slide shows when it cannot draw yet -- for
// example before a storm or a pair of nations has been chosen.

import Section from './Section.jsx'

// "Nothing to show yet" placeholder. Paints the same background as the section
// it stands in for, so an unanswered question does not look like a different
// kind of slide.
export default function EmptyState({ children }) {
  return (
    <Section>
      <p className="max-w-xl mx-auto py-6 text-center text-sm opacity-70">{children}</p>
    </Section>
  )
}
