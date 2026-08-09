// One fetch of the coastline topology, shared by everything that draws a map.
//
// public/land-50m.json is half a megabyte, and two components on the cyclones
// page now want it -- the interactive map and the storm journey. Mounting them
// in the same tick meant two requests in flight before either could populate
// the HTTP cache. Holding the promise at module scope means the second caller
// waits on the first caller's request instead of starting its own.
//
// A failed load clears the promise so a later mount can retry, rather than
// every future caller inheriting one bad network moment for the life of the
// page.
let pending = null

export function loadLandTopology() {
  if (!pending) {
    pending = fetch('/land-50m.json')
      .then((res) => {
        if (!res.ok) throw new Error(`land-50m.json responded ${res.status}`)
        return res.json()
      })
      .catch((error) => {
        pending = null
        throw error
      })
  }
  return pending
}
