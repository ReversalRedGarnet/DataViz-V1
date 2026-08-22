import { createContext, useContext } from 'react'

// Which element a chart's visibility should be measured against.
//
// Each panel is its own scrolling box, so a chart three levels down inside one
// needs to be observed against *that* box. Against the viewport, a chart below
// the fold of panel 7's internal scroll counts as "in view" from the moment the
// page loads, and its entrance animation plays where nobody is looking.
//
// `null` -- the default, and what IntersectionObserver wants for the viewport --
// is the correct answer only outside a panel.
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
