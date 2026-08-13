// Section wrapper: semantic <section>, consistent padding, a max-width reading
// column, and the site's one entrance animation (.animate-pop-in).
//
// `tone` is the background. 'panel' is the site default and what every content
// section uses -- a restrained neutral that sits a step away from the sand the
// header and slide footer are painted in, so the frame reads as frame and the
// content reads as content. 'ink' is the inversion the closing citations use.
// 'plain' is the bare page background, kept for the document (non-deck) layout.
//
// ink's dark: pair is bg-panel/text-ink, not a straight ink/sand flip -- see
// CitationPanel.jsx for why the flip reads too bright in dark mode.
const TONES = {
  plain: 'bg-sand',
  panel: 'bg-panel',
  ink: 'bg-ink text-sand dark:bg-panel dark:text-ink',
}

// `center` is for slides whose content is a single short block -- the opening
// claim, the story gate. Left alone they sit against the top edge of a panel
// with a screen's worth of empty space under them, which reads as a section
// that failed to load rather than one that is deliberately spare. The rule
// itself lives in styles/slideshow.css, scoped to the deck.
export default function Section({
  tone = 'panel',
  center = false,
  className = '',
  style,
  children,
  ...rest
}) {
  return (
    <section
      className={`animate-pop-in px-6 py-14 sm:px-8 md:py-20 ${TONES[tone] ?? TONES.panel} ${
        center ? 'section-center' : ''
      } ${className}`}
      style={style}
      {...rest}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  )
}
