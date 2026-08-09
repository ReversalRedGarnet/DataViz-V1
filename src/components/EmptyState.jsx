import Section from './Section.jsx'

// "Nothing to show yet" placeholder. `tone` must match the tone the filled-in
// state of the same section uses, or the wave divider above it -- told a fixed
// tone per section -- will mismatch the background actually painted.
export default function EmptyState({ tone, style, children }) {
  return (
    <Section tone={tone} style={style}>
      <p className="max-w-xl mx-auto py-6 text-center text-sm opacity-70">{children}</p>
    </Section>
  )
}
