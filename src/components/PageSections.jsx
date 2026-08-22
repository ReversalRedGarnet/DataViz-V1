import { useState } from 'react'
import { NationHighlightProvider } from '../hooks/useNationHighlight.jsx'
import SlidePanel from './SlidePanel.jsx'

// The deck. Every section of the piece, in order, as slides.
//
// THE RULE THIS FILE EXISTS TO ENFORCE: nothing is ever conditionally
// rendered. All sections are mounted all of the time. The off-stage ones sit
// in a horizontal flex track at full width with live layout -- translated out
// of sight, not removed.
//
// That is not a stylistic preference, it is the whole design. Every chart on
// this site measures a real DOM node (useElementWidth) and waits for a real
// IntersectionObserver callback (useInView) before drawing. An unmounted
// section has no box, so a conditionally-rendered deck would hand every chart
// a width of zero and then rely on an async retry to fix it -- which is
// precisely the failure mode that has produced every rendering bug here.
//
// Props:
//   sections -- [{ id, element, label, requires }], in order
//   active -- index of the on-stage section
//   direction -- 1 forward, -1 back; the enter animation reads it
//   onNavigate -- (index) => void
//   onProgress -- (fraction 0..1) => void, the active panel's own scroll
//   storyLength -- the whole story's length, for the footer counter
export default function PageSections({
  sections,
  active,
  direction,
  onNavigate,
  onProgress,
  storyLength,
}) {
  // Whether the panel on stage has more below the fold. Every scrollbar on the
  // site is hidden, so without this nothing says a slide continues -- and most
  // of them do.
  const [more, setMore] = useState(false)

  return (
    <NationHighlightProvider>
      <div className="slide-viewport" data-dir={direction < 0 ? 'back' : 'forward'}>
        <div className="slide-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {sections.map((section, i) => (
            <SlidePanel
              key={section.id}
              section={section}
              index={i}
              // The whole story's length, not the number of slides currently
              // mounted. Before a storm is picked only two sections exist, so
              // the footer read "1 / 2" on the opening screen -- telling a
              // reader arriving at a fourteen-section piece that it was two
              // pages long, and then appearing to grow under them.
              total={storyLength ?? sections.length}
              isActive={i === active}
              // `cue` over `label` when a section has one. The menu needs a
              // name for a place ("How Often, and to Whom"); the button that
              // walks you into it needs the instruction ("Choose a storm").
              // Only the forward control takes the cue -- going back to a
              // slide is not being asked to do the thing on it.
              nextLabel={sections[i + 1]?.cue ?? sections[i + 1]?.label}
              prevLabel={sections[i - 1]?.label}
              onNavigate={onNavigate}
              onProgress={onProgress}
              onOverflow={setMore}
            />
          ))}
        </div>

        {/* Outside the track, so it holds still while a panel scrolls beneath
            it. A mark rather than words: "More in this section" read as a
            second way forward competing with the footer's Next. This only says
            the current section has not finished yet. */}
        <div className={more ? 'slide-more is-visible' : 'slide-more'} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </NationHighlightProvider>
  )
}
