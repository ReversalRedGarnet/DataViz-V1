// Section wrapper: semantic <section>, consistent padding, the shared content
// column, and the site's one entrance animation (.animate-pop-in).
import Atmosphere from './Atmosphere.jsx'
import BackgroundPattern from './BackgroundPattern.jsx'

// EVERY SECTION IS bg-panel, AND THERE IS NO LONGER A PROP SAYING SO.
//
// There was once an inverted 'ink' background -- bg-ink/text-sand with a dark:
// override -- and no section ever passed it. The citations panel hardcoded the
// same three classes instead, which is how the closing slide came to be a
// black panel in light mode and an ordinary one in dark: an inconsistency
// invisible to anyone reviewing in dark mode. That option was removed and the
// panel brought back into the palette.
//
// What survived the removal was a prop, a lookup table with one entry, and a
// `?? default` fallback that resolved every possible input to the same class --
// threaded through Section, EmptyState, sectionGuard and PageHero, and passed
// explicitly by fourteen call sites that could not change anything by passing
// it. All of it is gone.
//
// A slide that needs to feel different has `backdrop` for it -- though every
// slide now passes the same scatter, so what it varies is the seed, not the
// motif.

// THE SITE'S TWO CONTENT WIDTHS, NAMED.
//
// Both already existed; neither was written down. 'wide' was Section's own
// max-w-5xl, and 'narrow' was an unnamed mx-auto max-w-3xl that four sections
// opened *inside* it -- so the answer to "how wide is this section" depended on
// which file you were in, and a new section had no default to inherit.
//
// The values are the Tailwind scale they replace, so nothing moves: 64rem is
// max-w-5xl, 48rem is max-w-3xl.
//
// Both are maxima, which is what keeps the responsive behaviour intact. A
// Surface-class laptop is narrower than 64rem once the page padding is taken
// off, so the column shrinks to the viewport there without a breakpoint being
// involved, and on a phone it is the padding that decides.
const WIDTHS = {
  wide: '64rem',
  narrow: '48rem',
}

// There is no `center` prop: vertical centring is measured per panel instead
// (see the data-fits block in SlidePanel.jsx and the rule it drives in
// styles/slideshow.css), so a slide centres while it fits and top-aligns the
// moment it does not.
//
// `lock` is for slides bounded by construction -- a heading, a few paragraphs,
// one fixed-height chart -- where a scrollbar is a layout fault rather than
// more to read.
//
// `width` sets --content-max for everything inside. Because it is a custom
// property it inherits, so a chart nested three levels down can align itself to
// the section's column without being handed a prop -- see .section-content in
// styles/layout.css.
//
// `atmosphere` is the site's decorative weather: 'ambient' (the default),
// 'hero' for the louder title-card variant, or false to switch it off. It lives
// here because this is the one component every section on every page already
// passes through, which is what makes "the animation appears consistently" a
// property of the layout rather than something each page has to remember.
//
// It is rendered as a SIBLING of .section-content, not inside it, so the two
// can be ordered explicitly: the layer at z-index 0, the content at 1. See the
// note on .atmos-layer in styles/story.css for what that replaces.
//
// `backdrop` is a tiling motif from content/patterns.js, off by default. It
// paints in the same band as the atmosphere -- behind .section-content, in
// front of the section's background -- and like the atmosphere it takes no
// pointer events and is hidden from assistive technology.
//
// Off by default on the component itself -- every slide opts in explicitly via
// scatterBackdrop(seed) from content/patterns.js, whose 'weaveScatter' motif
// scatters into the section's side margins rather than tiling behind it, which
// is what makes it safe on an argument slide. The tiling motifs
// (ripples/fish/weave) are chrome-only, and there are no longer any exceptions:
// the method and sources slides used to be two, and content/patterns.js has the
// note on why they stopped being.
//
// This is also why the section is `relative`: the layer positions against it.
// Note what is deliberately NOT added alongside -- overflow: hidden. The layer
// clips its own rings, and a section that clipped its overflow would clip the
// tooltips that sit near its edges.
//
// `.section-frame` is what makes a section measurable from the inside. It sets
// container-type: inline-size and publishes the section's own horizontal
// padding as --section-pad, which together are what let a child carrying
// .section-bleed take the panel's full width instead of the reading column's.
// See the long note on .section-bleed in styles/layout.css for why container
// query units and not vw or fixed positioning.
//
// One consequence worth stating, because it is the kind of thing that bites
// later: container-type makes the section a containing block for any
// fixed-position descendant. Nothing here is fixed -- the tooltip is absolute
// against the inner .relative wrapper each section already has, and the
// atmosphere is absolute against the section, which is where it was resolving
// anyway. If something fixed is ever added inside a section, this is the line
// that will have moved it.
export default function Section({
  lock = false,
  width = 'wide',
  atmosphere = 'ambient',
  backdrop = null,
  className = '',
  style,
  children,
  ...rest
}) {
  return (
    <section
      className={`animate-pop-in section-frame relative bg-panel px-6 py-14 sm:px-8 md:py-20 ${
        lock ? 'section-lock' : ''
      } ${className}`}
      style={{ '--content-max': WIDTHS[width] ?? WIDTHS.wide, ...style }}
      {...rest}
    >
      {/* Backdrop first: both layers sit below .section-content's z-index 1,
          so between themselves source order decides, and the tiling should be
          the further back of the two. */}
      {backdrop && <BackgroundPattern backdrop={backdrop} />}
      {atmosphere && <Atmosphere variant={atmosphere === true ? 'ambient' : atmosphere} />}
      <div className="section-content">{children}</div>
    </section>
  )
}
