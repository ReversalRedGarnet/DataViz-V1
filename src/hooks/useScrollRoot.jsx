import { createContext, useContext } from 'react'

// Which element a chart's visibility should be measured against.
//
// In the single-document layout the answer is the viewport, and `null` is
// exactly what IntersectionObserver wants for that. In slideshow layout each
// panel is its own scrolling box, so a chart three levels down inside one needs
// to be observed against *that* box -- otherwise a chart sitting below the fold
// of panel 7's internal scroll counts as "in view" from the moment the page
// loads, and its entrance animation plays where nobody is looking.
//
// A context rather than a prop because the consumers are a dozen components
// deep: PageSections -> Section -> RippleChain -> TrendChart -> useChartCanvas.
// Threading a ref through all of that would put slideshow plumbing into the
// signature of every chart on the site.
const ScrollRootContext = createContext(null)

export function ScrollRootProvider({ node, children }) {
  return <ScrollRootContext.Provider value={node}>{children}</ScrollRootContext.Provider>
}

export function useScrollRoot() {
  return useContext(ScrollRootContext)
}
