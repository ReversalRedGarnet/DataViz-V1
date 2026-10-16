// Loads the cleaned data (public/data/metrics.json, via utils/loadData.js) and
// hands each chart its rows. Returns { data, error } so slides can tell
// "still loading" from "failed".

import { useState, useEffect } from 'react'
import { loadMetricBundle } from '../utils/loadData.js'

// Loads a list of { key, file } metrics into one { [key]: rows } object. Every
// chart's year-by-year data comes through here.
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
// RETURNS { data, error }, NOT JUST data, because null data on its own looks
// the same whether the request is still in flight or has failed. With the
// error returned separately, sectionGuard can tell a slow network from a 404
// and say which one it is.
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
            // A dataset absent from the bundle is treated like a failed
            // request: optional degrades, required fails.
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
