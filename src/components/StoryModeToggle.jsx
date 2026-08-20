// Two ways through the same piece.
//
// Story holds the reader at a section until they have answered it -- pick a
// storm, pick a country -- because the argument is cumulative and a reader who
// pages past the map lands on three empty charts. Explore lifts those holds and
// opens the section menu on every section at once, for a reader who already
// knows what the site says and wants a particular chart.
//
// What it deliberately does NOT do is change any data, any component or any
// calculation. Both modes render the same sections from the same state; the
// only difference is whether the deck gates and whether choosing a storm
// carries the reader onward by itself. See App.jsx, where both are applied.
//
// Rendered as two buttons rather than a switch: a switch has an implied "off"
// state and neither of these is off. aria-pressed carries which one is current,
// so it is announced as a pressed control rather than as two unrelated buttons.
//
// Props:
//   mode -- 'story' | 'explore'
//   onChange -- (mode) => void
const MODES = [
  { id: 'story', label: 'Story', hint: 'Guided: one step at a time' },
  { id: 'explore', label: 'Explore', hint: 'Free: jump to any section' },
]

export default function StoryModeToggle({ mode, onChange }) {
  return (
    <div
      role="group"
      aria-label="Reading mode"
      className="flex items-center rounded-full border border-ink/15 bg-surface/50 p-0.5"
    >
      {MODES.map((m) => {
        const active = mode === m.id
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            aria-pressed={active}
            title={m.hint}
            className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active ? 'bg-accent/15 text-accent' : 'text-ink/60 hover:text-ink'
            }`}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
