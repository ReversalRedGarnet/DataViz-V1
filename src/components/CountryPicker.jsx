import { useNationHighlight, highlightHandlers } from '../hooks/useNationHighlight.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { nationLabel } from '../content/nations.js'

const STRINGS = {
  en: {
    chooseCountry: 'Choose a country',
    orChoose: 'Or choose from the list',
    notStruck: (name, stormName) => `${name}. Not struck by ${stormName}; shown for comparison.`,
    missed: 'missed',
  },
  fr: {
    chooseCountry: 'Choisir un pays',
    orChoose: 'Ou choisir dans la liste',
    notStruck: (name, stormName) => `${name}. Non touché par ${stormName}\u00A0; affiché à des fins de comparaison.`,
    missed: 'non touché',
  },
}

// The map, as a row of buttons.
//
// Section 4.5 of the brief asks for a non-map way to choose a country on
// mobile, and this is it -- but it is not hidden on desktop, for two reasons.
// A 7px pin inside a pannable, zoomable SVG is a small target for anyone using
// a trackpad or a touch screen, whatever the width of their screen; and the
// markers, being D3-drawn SVG groups with role="button", are a far rougher
// keyboard experience than four real buttons. Making this the mobile-only
// fallback would mean the accessible route is the one nobody sees.
//
// It writes to the same selection state the pins do -- one source of truth, so
// a country picked here shows a numbered pin on the map beside it -- and it
// pulls the same cross-chart highlight thread, so hovering a name here dims the
// other countries on every chart in the deck.
//
// Props:
//   nations -- [{ name, ... }], the same array the map is drawn from
//   selected -- ordered pair
//   storm -- for the "not struck" annotation; a country the storm missed stays
//     pickable, because it is the nearest thing this data has to a control
//   onToggle / onPreview -- selection, and the hover/focus summary above
export default function CountryPicker({ nations, selected, storm, onToggle, onPreview }) {
  const { setHighlight } = useNationHighlight()
  const { language } = useLanguage()
  const t = STRINGS[language]

  return (
    <div>
      {/* "Choose a country", not "or choose from the list". On a phone this is
          the primary control and the map is the picture beside it: four
          full-width rows a thumb cannot miss, against four 7px pins inside a
          pannable SVG. The wording follows the fact rather than describing the
          desktop arrangement. */}
      <p className="type-eyebrow mb-2 opacity-soft">
        <span className="sm:hidden">{t.chooseCountry}</span>
        <span className="hidden sm:inline">{t.orChoose}</span>
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        {nations.map((nation) => {
          const index = selected.indexOf(nation.name)
          const picked = index !== -1
          const missed = storm != null && !storm.nations.includes(nation.name)
          const displayName = nationLabel(nation.name, language)
          return (
            <li key={nation.name}>
              <button
                type="button"
                onClick={() => onToggle(nation.name)}
                onPointerEnter={() => onPreview?.(nation.name)}
                onPointerLeave={() => onPreview?.(null)}
                onFocus={() => onPreview?.(nation.name)}
                onBlur={() => onPreview?.(null)}
                {...highlightHandlers(nation.name, setHighlight)}
                aria-pressed={picked}
                aria-label={missed ? t.notStruck(displayName, storm.name) : displayName}
                className={`press-target flex w-full min-h-[48px] items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel sm:w-auto sm:min-h-[44px] sm:rounded-full sm:py-2 ${
                  picked
                    ? 'border-accent bg-accent/10 font-semibold'
                    : 'border-ink/20 bg-surface/60 hover:border-accent/60'
                } ${missed ? 'opacity-70' : ''}`}
              >
                {/* The same 1/2 badge the pin carries, so the two controls are
                    visibly the same selection rather than two that agree. */}
                <span
                  aria-hidden="true"
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-[11px] font-bold leading-none ${
                    picked ? 'border-accent text-accent' : 'border-ink/25 text-ink/40'
                  }`}
                >
                  {picked ? index + 1 : '+'}
                </span>
                {displayName}
                {/* Not colour alone: a country the storm missed says so in a
                    word as well as by being drawn faint. */}
                {missed && <span className="text-[10px] uppercase tracking-wide opacity-soft">{t.missed}</span>}
                {/* A tick as well as the badge and the fill: three cues for
                    one state, none of them colour on its own. It sits at the
                    end of a full-width row, which is where a thumb has just
                    been. */}
                {picked && (
                  <span aria-hidden="true" className="ml-auto text-accent">
                    &#10003;
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
