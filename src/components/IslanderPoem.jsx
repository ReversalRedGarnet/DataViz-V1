import CoastlineWash from './CoastlineWash.jsx'
import Section from './Section.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import VisuallyHidden from './VisuallyHidden.jsx'
import { scatterBackdrop } from '../content/patterns.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

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
  'You grew up with the wind. You felt it move through the trees, through your hair, through the houses you and your kin had built.',
  'The sea fed you. The wind carried you. They were never things to fear.',
  'Until one day, the wind came for another visit. This time, it came screaming.',
  'It tore through the trees where you had played and ripped apart the roofs of your homes.',
  'The ocean stirred with a ferocity greater than you had ever known. With one great gulp, it swallowed stretches of coastline, battering the playgrounds of your childhood.',
  'The sea that once fed your family was now eating away at your shores. The wind that once danced through the trees now carried destruction. And the things that had always been part of your home began to feel like threats.',
  'It made you wonder. What had you done to deserve this?',
  'When had the wind stopped being a friend? When had the sea stopped being a friend?',
  'You wondered, and wondered, and wondered, while your islands slowly changed beneath you.',
  'Homes were lost. Shorelines disappeared. Ways of life began to fade.',
  'And yet, the actions that had helped bring this changing climate were never your own.',
  'You were left to suffer the consequences of a changing world you did not create.',
]

// French draft by Ayga, September 2026 -- the crafted counterpart the note
// below used to say was still pending. Kept verbatim as given: this is a
// creative decision, not a mechanical string swap, and it isn't Claude's text
// to edit unasked. Any pronoun-register questions on this draft (tu/vous/
// nous) are worth a look before calling it final -- flagged separately,
// not resolved here.
const STANZAS_FR = [
  'En tant qu\u2019Insulaire, tu as grandi sous le soleil, avec l\u2019océan toujours à portée de main, le sel sur la peau.',
  'Tu as grandi avec le vent. Tu le sentais traverser les arbres, tes cheveux, les maisons que toi et les tiens aviez construites.',
  'La mer te nourrissait. Le vent te portait. Ils n\u2019étaient jamais des choses à craindre.',
  'Jusqu\u2019au jour où le vent revint te rendre visite. Cette fois, il arriva en hurlant.',
  'Il déchira les arbres où tu avais joué et arracha les toits de tes maisons.',
  'L\u2019océan se déchaîna avec une fureur plus grande que tout ce que tu avais connu. D\u2019une seule grande vague, il engloutit des portions entières du littoral, frappant les terrains de jeux de ton enfance.',
  'La mer qui autrefois nourrissait ta famille dévorait désormais tes côtes. Le vent qui autrefois dansait dans les arbres portait maintenant la destruction. Et les choses qui avaient toujours fait partie de ton foyer commencèrent à ressembler à des menaces.',
  'Cela t\u2019a fait te demander : qu\u2019avais-tu fait pour mériter cela ?',
  'À quel moment le vent avait-il cessé d\u2019être un ami ? À quel moment la mer avait-elle cessé d\u2019être une amie ?',
  'Tu te posais ces questions encore et encore, tandis que tes îles changeaient lentement sous tes yeux.',
  'Des maisons furent perdues. Des rivages disparurent. Des modes de vie commencèrent à s\u2019effacer.',
  'Et pourtant, les actions qui avaient contribué à provoquer ce changement climatique n\u2019étaient jamais les tiennes.',
  'Tu étais laissé à subir les conséquences d\u2019un monde en changement que tu n\u2019avais pas créé.',
]

// Was the "pending" note pointing at STANZAS_FR above -- removed now that
// the French draft exists. If STANZAS_FR is ever cleared back out, restore a
// note here rather than letting the toggle silently show English under a
// French heading.

export default function IslanderPoem() {
  const { language } = useLanguage()

  return (
    <Section
      width="narrow"
      atmosphere={false}
      backdrop={scatterBackdrop('islander-poem')}
      // TWO DECORATIVE LAYERS, AND THEY DO DIFFERENT JOBS. The weave is
      // texture in the margins; this is the place the poem is about. It came
      // off the title card, where it was competing with two other treatments,
      // and it is drawn much wider here -- `padding` is room left around the
      // four nations inside a fixed box, so a bigger number fits them into a
      // smaller area and more of the surrounding ocean survives the crop. At
      // the title card's 150 the reader gets four countries; at 250 they get
      // the basin those countries sit in, which is what the poem's "solwara
      // always within reach" is describing.
      //
      // The land only. The six storm tracks came with this layer from the
      // title card, where they were what the headline was counting; over the
      // poem they read as a diagram left switched on -- dashed lines with ends,
      // crossing the text, pointing at something the poem never mentions. See
      // the note in CoastlineWash.jsx; the drawing path is still there.
      //
      // .coast-wash-tall replaces the base mask and opacity, both of which
      // assume a container exactly one viewport tall. See styles/story.css.
      wash={<CoastlineWash padding={270} showTracks={false} className="coast-wash-tall" />}
    >
      {/* Every other panel's arrival focus (see useFocusOnArrival in
          SlidePanel.jsx) looks for an h1/h2 to move to. A visible heading
          would compete with the poem for the reader's first look, so this
          one exists for screen readers and keyboard focus only. */}
      <VisuallyHidden>
        <h2>{language === 'fr' ? 'Ouverture' : 'Opening'}</h2>
      </VisuallyHidden>
      {/* THE ONE CONTROL THE HEADER USUALLY CARRIES THAT THIS SLIDE STILL
          NEEDS -- now two of them. With the header faded out (see `chromeless`
          in App.jsx) neither the theme toggle nor the language toggle is
          otherwise reachable here, and this is the first screen of the piece --
          a reader who opens the site in the wrong theme, or wants French before
          reading the opening poem's English, would have to page forward to fix
          it. The sources slide carries the same pair now too (see
          CitationPanel.jsx): it used to get no equivalent, on the reasoning
          that a reader who reached the end had had the header on every slide in
          between -- true for theme, but not for language, since a reader who
          set French on slide one still wants French on the last slide without
          it silently reverting.

          In flow rather than positioned. .section-content is itself
          `position: relative`, so an absolute child anchors to the reading
          column rather than to the panel, which puts the button in the middle
          of the text instead of out at the corner. A right-aligned row above
          the first stanza costs one line of space and needs no positioning at
          all. Both toggles are self-contained -- each reads its own context and
          takes only a className -- so nothing here depends on Header.

          .poem-chrome (styles/slideshow.css) is what carries it out of the
          reading column to the panel's own edge, where it lines up with the
          "Begin" control in the opposite corner and reads as belonging to the
          slide rather than to the poem. */}
      <div className="poem-chrome mb-10 sm:mb-14 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      {/* The questions carry full ink and the narration sits back at 85%.
          Written as one branch rather than as a base class plus an override:
          `text-ink/85 text-ink` puts two colour utilities of equal specificity
          on the same element, so which one wins is decided by their order in
          the compiled stylesheet rather than by the order they are written
          here -- and the /85 was winning, which made the emphasis a no-op. */}
      {(language === 'fr' ? STANZAS_FR : STANZAS).map((line, i) => (
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
