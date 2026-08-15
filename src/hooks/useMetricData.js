import { useState, useEffect } from 'react'
import { loadDataset } from '../utils/loadData.js'

// Loads a list of { key, file } metrics into one { [key]: rows }
// object. Every hazard page's year-by-year data comes through here.
// `metrics` must be a stable reference (all callers pass a module
// constant) -- it's the effect's dependency.
//
// A metric marked `optional` resolves to null instead of rejecting. The rest
// are deliberately all-or-nothing: Promise.all means one missing file leaves
// `data` null and every section shows its own "no data" state, which is the
// honest outcome when a series the page is built on didn't arrive. But an
// optional dataset is one the page can do without -- the population
// denominator only enables an extra view of a chart that already works -- and
// letting it take the whole site down with it would trade a missing toggle for
// a blank page.
export function useMetricData(metrics) {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all(
      metrics.map((m) =>
        m.optional
          ? loadDataset(m.file).catch((err) => {
              console.error(`Optional dataset ${m.file} unavailable:`, err)
              return null
            })
          : loadDataset(m.file)
      )
    )
      .then((results) => {
        const combined = {}
        metrics.forEach((m, i) => {
          combined[m.key] = results[i]
        })
        setData(combined)
      })
      .catch((err) => console.error('Failed to load datasets:', err))
  }, [metrics])

  return data
}

