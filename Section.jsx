// Section wrapper: semantic <section>, consistent padding, a max-width reading
// column, and the site's one entrance animation (.animate-pop-in, index.css).
//
// `tone` is the background, and must match what the page tells PageSections so
// the wave divider's seam lands on a real colour change rather than a flat cut.
// 'plain' is the page background, 'panel' a restrained neutral for editorial
// asides, 'ink' the inversion Home's hero and the footer use.
//
// ink's dark: pair is bg-panel/text-ink, not a straight ink/sand flip -- see
// CitationPanel.jsx for why the flip reads too bright in dark mode.
const TONES = {
  plain: 'bg-sand',
  panel: 'bg-panel',
  ink: 'bg-ink text-sand dark:bg-panel dark:text-ink',
}

export default function Section({ tone = 'plain', className = '', style, children, ...rest }) {
  return (
    <section
      className={`animate-pop-in px-6 py-14 sm:px-8 md:py-20 ${TONES[tone] ?? TONES.plain} ${className}`}
      style={style}
      {...rest}
    >
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  )
}
