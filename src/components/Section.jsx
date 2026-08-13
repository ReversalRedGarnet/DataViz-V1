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

// There is no `center` prop any more. Vertical centring used to be opted into
// section by section, which was a guess at the reader's window: a section
// marked centred went on centring after it had outgrown the panel, and an
// unmarked one sat against the top edge with a screen of dead space under it on
// a tall monitor. It is now measured per panel instead -- see the data-fits
// block in PageSections.jsx and the rule it drives in styles/slideshow.css --
// so every slide centres exactly while it fits and top-aligns the moment it
// does not.
//
// `lock` is for slides whose content is bounded by construction -- a heading, a
// few short paragraphs, one fixed-height chart -- where a scrollbar is always a
// layout fault rather than more to read. See styles/slideshow.css for what it
// does and why it is gated on viewport height.
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
