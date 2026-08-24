import { useState, useEffect } from 'react'
import { loadMetricBundle } from '../utils/loadData.js'

// Loads a list of { key, file } metrics into one { [key]: rows } object. Every
// hazard page's year-by-year data comes through here.
//
// `metrics` must be a stable reference (all callers pass a module constant) --
// it's the effect's dependency.
//
// ONE REQUEST, NOT TEN. Every dataset arrives in a single bundle -- see
// utils/loadData.js for why -- so this maps the bundle onto the metric list
// rather than firing a fetch per metric.
//
// A metric marked `optional` resolves to null instead of rejecting. The rest
// are deliberately all-or-nothing: one missing dataset leaves `data` null and
// every section shows its own "no data" state, which is the honest outcome when
// a series the page is built on didn't arrive. But an optional dataset is one
// the page can do without -- the population denominator only enables an extra
// view of a chart that already works -- and letting it take the whole site down
// with it would trade a missing toggle for a blank page.
//
// RETURNS { data, error }, NOT JUST data. A failed fetch used to be logged to
// the console and then dropped, leaving `data` null forever -- and null is also
// what "still loading" looks like, so every section sat on "waiting on data"
// with no way to tell a slow network from a 404. The two states are now
// distinguishable by callers, which is what lets sectionGuard say which one it
// is instead of implying the request is still in flight.
export function useMetricData(metrics) {
  const [state, setState] = useState({ data: null, error: null })

  useEffect(() => {
    // Guards against a resolved promise writing state after the metrics list
    // has changed underneath it.
    let cancelled = false

    setState({ data: null, error: null })

    loadMetricBundle()
      .then((bundle) => {
        if (cancelled) return
        const combined = {}
        for (const m of metrics) {
          const rows = bundle[m.file]
          if (!rows) {
            // Absent from the bundle is the same fact a 404 used to be, and it
            // is answered the same way: optional degrades, required fails.
            if (m.optional) {
              console.error(`Optional dataset ${m.file} missing from the bundle`)
              combined[m.key] = null
              continue
            }
            throw new Error(`Dataset missing from the bundle: ${m.file}`)
          }
          combined[m.key] = rows
        }
        setState({ data: combined, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load datasets:', err)
        setState({ data: null, error: err })
      })

    return () => {
      cancelled = true
    }
  }, [metrics])

  return state
}
