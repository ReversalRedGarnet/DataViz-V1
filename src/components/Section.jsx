// Section wrapper: semantic <section>, consistent padding, a max-width reading
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

// There is no `center` prop: vertical centring is measured per panel instead
// (see the data-fits block in SlidePanel.jsx and the rule it drives in
// styles/slideshow.css), so a slide centres while it fits and top-aligns the
// moment it does not.
//
// `lock` is for slides bounded by construction -- a heading, a few paragraphs,
// one fixed-height chart -- where a scrollbar is a layout fault rather than
// more to read.
export default function Section({
  tone = 'panel',
  lock = false,
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
      style={style}
      {...rest}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  )
}
