import Section from './Section.jsx'

// "Nothing to show yet" placeholder. `tone` defaults through to Section's own
// default, so an empty section paints the same background as its filled-in
// state without the caller having to say so.
export default function EmptyState({ tone, style, children }) {
  return (
    <Section tone={tone} style={style}>
      <p className="max-w-xl mx-auto py-6 text-center text-sm opacity-70">{children}</p>
    </Section>
  )
}
