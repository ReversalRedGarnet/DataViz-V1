// One fetch of the coastline topology, shared by everything that draws a map.
//
// Two components on the cyclones page want it -- the interactive map and the
// storm journey. Mounting them in the same tick meant two requests in flight
// before either could populate the HTTP cache. Holding the promise at module
// scope means the second caller waits on the first caller's request instead of
// starting its own.
//
// This used to say the file was half a megabyte. It is 41 KB: scripts/
// build-land.mjs clips the world's coastlines to the Pacific window, and the
// note here was never updated. The sharing is still worth it -- a duplicate
// request is a duplicate request -- but not for the reason it claimed.
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
