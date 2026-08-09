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

// Same, plus one-off datasets that aren't year-by-year series (a
// per-nation trend, a list of data-quality notes) and so don't fit the
// flat { [key]: rows } shape. Returns { series, ...extras }, or null
// until everything has landed.
//
// extras -- { [key]: { file, fallback } }, a stable module constant.
// `fallback` is what that key becomes if its fetch fails; omit it to
// treat a failure as "this page has no data yet".
export function useMetricDataWith(metrics, extras) {
  const series = useMetricData(metrics)
  const [loaded, setLoaded] = useState(null)

  useEffect(() => {
    const keys = Object.keys(extras)
    Promise.all(
      keys.map((key) =>
        loadDataset(extras[key].file).catch((err) => {
          console.error(`Failed to load ${extras[key].file}:`, err)
          return extras[key].fallback ?? null
        })
      )
    ).then((results) => {
      const combined = {}
      keys.forEach((key, i) => {
        combined[key] = results[i]
      })
      setLoaded(combined)
    })
  }, [extras])

  if (!series || !loaded) return null
  if (Object.values(loaded).some((value) => value === null)) return null

  return { series, ...loaded }
}
