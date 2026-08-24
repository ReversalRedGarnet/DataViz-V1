import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'

// THE KEY FOR A MULTI-NATION CHART: a line preview, its dash pattern, and a
// name.
//
// The preview draws the real dash rather than a plain swatch, because the dash
// is the cue that survives a greyscale print or a reader who cannot separate
// the hues -- which is the whole reason the four-series palette carries dash
// patterns at all.
//
// TWO MODES, because two sections want the same key with different behaviour.
// With `pinned` and `onPin` each entry is a button that holds the cross-chart
// highlight until pressed again -- the divergence section's, and the reason it
// is a press rather than a hover is that a touch screen has no pointer to rest.
// Without them each entry is a focusable note that holds the highlight only
// while pointed at or focused, which is all a chart card needs.
//
// Props:
//   styles -- [{ nation, color, dash }], from utils/charts/series.js. Taking
//     the resolved styles rather than computing them here is deliberate: a
//     legend that assigns its own colours is a legend that can disagree with
//     the chart beside it.
//   pinned, onPin -- optional; see above
//   className -- layout hook
export default function SeriesLegend({ styles, pinned, onPin, className = '' }) {
  const { setHighlight } = useNationHighlight()
  if (!styles || styles.length === 0) return null

  const pressable = typeof onPin === 'function'

  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      {styles.map(({ nation, color, dash }) => {
        const swatch = (
          <svg width="26" height="8" aria-hidden="true" className="shrink-0">
            <line
              x1="0"
              y1="4"
              x2="26"
              y2="4"
              stroke={color}
              strokeWidth="2"
              strokeDasharray={dash ?? undefined}
              strokeLinecap="round"
            />
          </svg>
        )

        if (pressable) {
          return (
            <li key={nation}>
              <button
                type="button"
                onClick={() => onPin(pinned === nation ? null : nation)}
                aria-pressed={pinned === nation}
                aria-label={`Emphasise ${nation}'s trajectory on every chart in this section`}
                className={`press-target flex min-h-[44px] items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  pinned === nation ? 'border-accent bg-accent/10' : 'border-transparent hover:border-ink/15'
                }`}
                {...highlightHandlers(nation, setHighlight)}
              >
                {swatch}
                {nation}
              </button>
            </li>
          )
        }

        // role="note" plus an explicit name: a focusable <li> with neither
        // announces as an unlabelled list item, and the line preview that
        // tells the series apart is drawn in an aria-hidden swatch.
        return (
          <li
            key={nation}
            tabIndex={0}
            role="note"
            aria-label={`${nation}. Focus to emphasise it on every chart in this section.`}
            className="flex cursor-help items-center gap-2 rounded text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            {...highlightHandlers(nation, setHighlight)}
          >
            {swatch}
            {nation}
          </li>
        )
      })}
    </ul>
  )
}
