import { Fragment, cloneElement } from 'react'
import PacificBorder from './PacificBorder.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { sectionColorsFor } from '../utils/theme.js'
import { delayStyle } from '../utils/motion.js'
import { NationHighlightProvider } from '../hooks/useNationHighlight.jsx'

// Every page is the same shape: a vertical run of sections, each with an
// anchor id and a staggered entrance, separated by a wave divider that has to
// know the background colour on either side of it. This renders that shape
// from one list, so a section's id, its position in the stagger, and the two
// dividers touching it can't drift apart the way they could when each page
// kept a parallel SECTION_TONES array and destructured it positionally.
//
// Props:
//   sections -- [{ id, tone, element }], top to bottom
//     id -- must match the corresponding entry in content/pageSections.js,
//       which is what SectionNav's jump-to menu links to
//     tone -- the background this section actually paints. Read only to
//       colour the dividers above and below it (see sectionColorsFor); the
//       section decides its own background itself, either by hardcoding it
//       (DroughtSnapshot's tone="panel") or by taking a tone prop of its own
//       (the page's PageHero). Keep the two in step or the wave seam shows a
//       visible colour mismatch.
//     element -- the section itself. Cloned with the stagger delay, so call
//       sites don't pass `style` or track their own index.
//
// The last section gets no divider below it: it's the footer, and the page
// ends there.
//
// The whole run is wrapped in the cross-chart highlight provider, so pointing
// at a country in one section dims it out of the charts in every other section
// on the same page.
export default function PageSections({ sections }) {
  const { theme } = useTheme()
  const colors = sectionColorsFor(theme)

  return (
    <NationHighlightProvider>
      {sections.map((section, i) => (
        <Fragment key={section.id}>
          <div id={section.id}>{cloneElement(section.element, { style: delayStyle(i) })}</div>
          {i < sections.length - 1 && (
            <PacificBorder
              colorAbove={colors[section.tone]}
              colorBelow={colors[sections[i + 1].tone]}
            />
          )}
        </Fragment>
      ))}
    </NationHighlightProvider>
  )
}
