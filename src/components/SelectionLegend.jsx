import { useTheme } from '../hooks/useTheme.jsx'
import { chartColorsFor } from '../utils/theme.js'
import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'

// The key tying a chart series to a map pin. The swatch carries the same
// number the pin does, so the two picks are told apart by a digit and not only
// by a colour -- the blue and the gold are close in lightness, and a reader
// who can't separate them by hue still has "1" and "2".
// Each chip is also the handle for the cross-chart highlight: pointing at a
// country here dims the other one on every chart on the page. tabIndex makes
// that reachable from the keyboard, and the chips carry no other behaviour, so
// there's nothing a reader can trigger by accident.
export default function SelectionLegend({ selected }) {
  const { theme } = useTheme()
  const palette = chartColorsFor(theme)
  const { setHighlight } = useNationHighlight()

  if (!selected || selected.length === 0) return null

  return (
    <ul className="mb-4 flex flex-wrap gap-4 text-sm">
      {selected.map((name, i) => (
        <li
          key={name}
          tabIndex={0}
          className="flex cursor-help items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          {...highlightHandlers(name, setHighlight)}
        >
          <span
            className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] font-bold leading-none"
            style={{ backgroundColor: palette.selection[i], color: palette.onMark }}
            aria-hidden="true"
          >
            {i + 1}
          </span>
          {name}
        </li>
      ))}
    </ul>
  )
}
