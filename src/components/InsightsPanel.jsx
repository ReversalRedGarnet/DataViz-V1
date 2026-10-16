// The bordered "here's what changed" panel under the ripple chain's charts.
// The comparison itself is worked out in utils/insights.js; this component
// only lays the card out.
//
// Props:
//   title -- panel heading
//   summary -- optional one-line takeaway, shown above the bullets in the
//     panel's own voice rather than buried at the end of them. Callers that
//     don't have a summary (or don't have enough comparable metrics to earn
//     one) simply omit it.
//   items -- [{ key, text }]
//   staggerItems -- true makes the bullets pop in one by one rather than all
//     at once. RippleChain, the only caller, passes it; the default (false)
//     keeps the panel usable without the animation.
export default function InsightsPanel({ title, summary, items, staggerItems = false }) {
  return (
    <div
      className="animate-pop-in mt-10 rounded-xl border border-ink/10 bg-surface/60 p-6"
      style={{ animationDelay: '120ms' }}
    >
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {summary && <p className="mb-3 text-sm font-medium">{summary}</p>}
      <ul className="space-y-2.5 text-sm opacity-85">
        {items.map((item, i) => (
          <li
            key={item.key}
            className={staggerItems ? 'animate-pop-in flex gap-2' : 'flex gap-2'}
            style={staggerItems ? { animationDelay: `${160 + i * 70}ms` } : undefined}
          >
            <span aria-hidden="true" className="opacity-quiet">
              •
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
