import { figureNumber } from '../content/figures.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { sourceLabel } from '../utils/metrics.js'

const STRINGS = {
  en: { fig: 'Fig', data: '. Data: ' },
  fr: { fig: 'Fig.', data: '. Données\u00A0: ' },
}

// FIG N, THE TITLE, AND WHERE THE NUMBERS CAME FROM -- UNDER THE CHART.
//
// The site already had both halves of this and neither was next to a chart.
// The per-metric caveat printed underneath says what a record cannot be read
// as; the sources slide at the end lists every dataset with its query URL. So a
// reader looking at a chart could find out what it does not prove, but had to
// travel to the last slide of the deck to find out where it came from -- and
// then work out which of ten entries was the one they had been looking at.
//
// Moving one line of that bibliography under each figure changes what it is. At
// the end of the deck it is a formality; under the chart it is an invitation to
// check, and the link is the FILTERED query rather than the portal's front
// page, so checking takes one click instead of ten minutes of re-deriving
// somebody else's export.
//
// The sources slide is unchanged and stays where it is. It is the whole
// bibliography, including the storms' supplementary citations, which is a
// different job from this one.
//
// Props:
//   figureKey -- key in content/figures.js. Decides the number.
//   title -- what the figure shows. Usually the chart's own label, passed
//     rather than re-derived so a caption can be more specific than a heading
//     that has to fit a card.
//   source -- { label, url } | null | undefined. Omitted where a record has no
//     citable query of its own, in which case the caption is just the number
//     and the title rather than a "Data:" line pointing nowhere.
//   className -- spacing at the call site
export default function FigureCaption({ figureKey, title, source, className = '' }) {
  const n = figureNumber(figureKey)
  const { language } = useLanguage()
  const t = STRINGS[language]

  return (
    <p className={`figure-caption ${className}`}>
      {/* The number and the title are one phrase and must not break apart
          across a line: "Fig" on one line and "7" on the next reads as a
          typesetting fault in exactly the element whose job is to look
          careful. */}
      {n != null && (
        <span className="figure-caption-n">
          {t.fig}&nbsp;{n}
          {'\u00a0\u00b7 '}
        </span>
      )}
      {title}
      {source && (
        <>
          {t.data}
          <a href={source.url} target="_blank" rel="noreferrer noopener">
            {sourceLabel(source, language)}
          </a>
        </>
      )}
    </p>
  )
}
