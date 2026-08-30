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

// A second, separately-cached fetch for the wider window: same pattern, same
// module-scope promise, same clear-on-failure, just a different URL and a
// different variable so the two never share -- or block on -- each other.
//
// Why a second file at all, rather than widening land-50m.json itself: that
// file's window is sized to what MapView and StormJourney actually draw, at
// their fixed padding of 150. Only the opening poem asks for a much larger
// padding of 270 (see CoastlineWash.jsx's `wide` prop), and its wider crop is
// what pulls in New Zealand's South Island, Tasmania, and a large connected
// Africa-Eurasia ring -- geometry MapView and StormJourney would otherwise
// ship and, for StormJourney, re-walk on every storm selection, without ever
// rendering a pixel of it. See scripts/build-land.mjs for where the two boxes
// are derived.
let pendingWide = null

export function loadWideLandTopology() {
  if (!pendingWide) {
    pendingWide = fetch('/land-50m-wide.json')
      .then((res) => {
        if (!res.ok) throw new Error(`land-50m-wide.json responded ${res.status}`)
        return res.json()
      })
      .catch((error) => {
        pendingWide = null
        throw error
      })
  }
  return pendingWide
}
