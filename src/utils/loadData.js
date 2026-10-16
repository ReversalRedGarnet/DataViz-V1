// ONE FETCH FOR EVERY METRIC ON THE PAGE.
//
// Fetching all ten datasets separately and waiting on Promise.all would let the
// slowest of ten round trips gate every chart. Together they are about 34 KB:
// the cost is the round trips, not the bytes, and on the high-latency mobile
// connections this project is aimed at, round trips dominate the first load.
//
// data-pipeline/common.py's write_bundle() produces the file, keyed by the same
// filenames the per-metric datasets have on disk. Those per-metric files are
// written and committed too: they are what the bundler reads, and they remain the
// readable unit for anyone inspecting the data by hand. Nothing fetches them.
//
// The promise is held at module scope for the same reason loadLand.js holds
// its own, and a failure clears it so a later mount can retry rather than
// inheriting one bad network moment for the life of the page.
let pending = null

export function loadMetricBundle() {
  if (!pending) {
    pending = fetch('/data/metrics.json')
      .then((res) => {
        if (!res.ok) throw new Error(`metrics.json responded ${res.status}`)
        return res.json()
      })
      .catch((error) => {
        pending = null
        throw error
      })
  }
  return pending
}
