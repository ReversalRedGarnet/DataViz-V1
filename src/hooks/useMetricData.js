import { useState, useEffect } from 'react'
import { loadDataset } from '../utils/loadData.js'

// Loads a list of { key, file } metrics into one { [key]: rows }
// object. Every hazard page's year-by-year data comes through here.
// `metrics` must be a stable reference (all callers pass a module
// constant) -- it's the effect's dependency.
export function useMetricData(metrics) {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all(metrics.map((m) => loadDataset(m.file)))
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

