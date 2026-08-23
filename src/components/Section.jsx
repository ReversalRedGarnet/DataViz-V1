// Section wrapper: semantic <section>, consistent padding, the shared content
// column, and the site's one entrance animation (.animate-pop-in).
//
// `tone` is the background. 'panel' is the site default: a restrained neutral
// a step away from the sand the header and footer are painted in, so the frame
// reads as frame and the content reads as content. 'ink' is the inversion the
// closing citations use -- its dark: pair is bg-panel/text-ink rather than a
// straight flip, because the flip reads too bright in dark mode.
const TONES = {
  panel: 'bg-panel',
  ink: 'bg-ink text-sand dark:bg-panel dark:text-ink',
}

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
export default function Section({
  tone = 'panel',
  lock = false,
  width = 'wide',
  className = '',
  style,
  children,
  ...rest
}) {
  return (
    <section
      className={`animate-pop-in px-6 py-14 sm:px-8 md:py-20 ${TONES[tone] ?? TONES.panel} ${
        lock ? 'section-lock' : ''
      } ${className}`}
      style={{ '--content-max': WIDTHS[width] ?? WIDTHS.wide, ...style }}
      {...rest}
    >
      <div className="section-content">{children}</div>
    </section>
  )
}
