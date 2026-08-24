// ONE FETCH FOR EVERY METRIC ON THE PAGE.
//
// The site used to request all ten datasets separately and wait on Promise.all
// before rendering anything, so the slowest of ten round trips gated every
// chart. Together they are about 34 KB -- what was being paid for was the round
// trips, not the bytes, and on the high-latency mobile connections this project
// is aimed at that was the dominant cost of the initial load.
//
// data-pipeline/common.py's write_bundle() produces the file, keyed by the same
// filenames the per-metric datasets have on disk. Those files are still written
// and still committed: they are what the bundler reads, and they remain the
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
