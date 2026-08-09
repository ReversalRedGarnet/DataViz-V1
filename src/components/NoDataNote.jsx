const EXPLANATION =
  "This metric isn't consistently reported by every country in the official Pacific Data Hub dataset -- smaller nations often have less capacity to compile detailed disaster statistics. As disasters grow more frequent, closing that reporting gap will matter too."

// Inline "no data available" note, used anywhere a metric is missing for a
// selected nation. The explanation is worded once, here, and shown through the
// real tooltip rather than a native `title` (invisible on touch).
//
// Props:
//   showTooltip / hideTooltip -- from the nearest useTooltip() call
//   children -- the visible label, e.g. "No data available"
export default function NoDataNote({ showTooltip, hideTooltip, className = '', children }) {
  return (
    <span
      tabIndex={0}
      className={`data-note underline decoration-dotted decoration-ink/40 ${className}`}
      onMouseEnter={(e) => showTooltip(e, EXPLANATION)}
      onMouseLeave={hideTooltip}
      onFocus={(e) => showTooltip(e, EXPLANATION)}
      onBlur={hideTooltip}
      onClick={(e) => showTooltip(e, EXPLANATION)}
    >
      {children}
    </span>
  )
}
