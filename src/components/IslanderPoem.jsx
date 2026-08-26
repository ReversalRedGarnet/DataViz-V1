import Section from './Section.jsx'
import VisuallyHidden from './VisuallyHidden.jsx'
import { scatterBackdrop } from '../content/patterns.js'

// The site's one slide that isn't a finding. It carries no chart and no
// `requires`, and it is deliberately not counted toward the deck's "N /
// total" readout -- see the `cover` flag on this section's entry in App.jsx
// and the pageNumber logic in PageSections.jsx. It exists to put the reader
// inside what the data is about before the data itself arrives.
//
// `atmosphere={false}` turns off the ambient rings every other section
// carries: the poem is the one place on the site meant to sit still rather
// than breathe. `scatterBackdrop` is left on, unlike the Hero -- see the note
// in content/patterns.js on why Hero alone omits it. The poem, like every
// other section, has open margins beside a centred column of content, which
// is exactly the condition the weave is meant to sit inside.
//
// DELIBERATELY NOT `lock`. Only one other slide takes that prop, and Section.jsx
// says what it is for: a slide bounded by construction, where a scrollbar is a
// layout fault rather than more to read. Eleven paragraphs of reflowing prose
// are the opposite -- their height is a function of the viewport width, not of
// the markup. `lock` sets overflow:hidden on the section, and because that also
// stops the panel ever becoming scrollable, anything past the fold is not
// merely hidden but unreachable: at 1280x720 the closing stanza was cut, and at
// 360x640 roughly half the poem was gone with no way to scroll to it. Without
// the prop the panel scrolls like every other long-prose slide and the deck's
// own chevron says there is more.
const STANZAS = [
  'As an Islander, you grew up beneath the sun, the ocean always within reach, salt upon your skin.',
  'The wind moved through the trees, through your hair, through the houses you and your kin had built.',
  'One day, the wind came for another visit. This time, it came screaming.',
  'It tore through the trees where you had played and ripped apart the roofs of your homes.',
  'The ocean stirred with a ferocity greater than you had ever known. It swallowed entire stretches of coastline and battered the playgrounds of your childhood.',
  'The ocean that had fed your family was now eating away at your shores.',
  'It made you wonder.',
  'What had you done to deserve this?',
  'When had the wind stopped being a friend?',
  'When had the sea stopped being one, too?',
  'You wondered, and wondered, and wondered, while your islands slowly sank and your culture suffered for actions that were never your own.',
]

export default function IslanderPoem() {
  return (
    <Section
      width="narrow"
      atmosphere={false}
      backdrop={scatterBackdrop('islander-poem')}
    >
      {/* Every other panel's arrival focus (see useFocusOnArrival in
          SlidePanel.jsx) looks for an h1/h2 to move to. A visible heading
          would compete with the poem for the reader's first look, so this
          one exists for screen readers and keyboard focus only. */}
      <VisuallyHidden>
        <h2>Opening</h2>
      </VisuallyHidden>
      {/* The questions carry full ink and the narration sits back at 85%.
          Written as one branch rather than as a base class plus an override:
          `text-ink/85 text-ink` puts two colour utilities of equal specificity
          on the same element, so which one wins is decided by their order in
          the compiled stylesheet rather than by the order they are written
          here -- and the /85 was winning, which made the emphasis a no-op. */}
      {STANZAS.map((line, i) => (
        <p
          key={i}
          className={`font-serif text-lg italic leading-relaxed sm:text-xl ${
            i === 0 ? '' : 'mt-5'
          } ${line.endsWith('?') ? 'text-ink' : 'text-ink/85'}`}
        >
          {line}
        </p>
      ))}
    </Section>
  )
}
