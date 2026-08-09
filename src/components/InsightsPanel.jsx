// The bordered "here's what changed" panel below a hazard's trend charts. Each
// hazard supplies its own comparison logic; the card is the same.
//
// Props:
//   title -- panel heading
//   items -- [{ key, text }]
//   staggerItems -- bullets pop in one by one. Only RippleChain does this; the
//     inconsistency predates this component and is kept opt-in rather than
//     silently unified.
export default function InsightsPanel({ title, items, staggerItems = false }) {
  return (
    <div
      className="animate-pop-in mt-10 rounded-xl border border-ink/10 bg-surface/60 p-6"
      style={{ animationDelay: '120ms' }}
    >
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2.5 text-sm opacity-85">
        {items.map((item, i) => (
          <li
            key={item.key}
            className={staggerItems ? 'animate-pop-in flex gap-2' : 'flex gap-2'}
            style={staggerItems ? { animationDelay: `${160 + i * 70}ms` } : undefined}
          >
            <span aria-hidden="true" className="opacity-50">
              •
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
