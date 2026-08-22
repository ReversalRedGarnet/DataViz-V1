import { useCallback, useMemo, useState } from 'react'
import { useSelection } from './useSelection.js'
import { stormById } from '../content/storms.js'

// EVERYTHING THE READER HAS CHOSEN, IN ONE PLACE.
//
// The storm, the country pair, the position along the storm's path and the open
// ripple link. Every section is a view of these; none of them keeps a second
// copy, which is what makes the header's strip and the charts agree without
// anything syncing them.
export function useStory() {
  const selection = useSelection()
  const [stormId, setStormId] = useState(null)
  const [journeyIndex, setJourneyIndex] = useState(0)
  const [activeMetric, setActiveMetric] = useState(null)

  const storm = stormById(stormId)
  const { clear } = selection

  // Choosing a storm resets everything downstream of it, and that is a
  // correctness requirement rather than a courtesy. journeyIndex points into
  // one storm's stop list -- Harold has four, Pam has two -- so carrying an
  // index of 3 into Pam would ask for a stop that does not exist. The country
  // pair is cleared for the reason 4.3 of the brief gives: a selection made
  // against one storm's damage is not a selection against another's, and
  // silently keeping it would leave the ripple chain captioned with a storm
  // that never reached the country it is drawing.
  const selectStorm = useCallback(
    (id) => {
      if (id === stormId) return
      setStormId(id)
      setJourneyIndex(0)
      setActiveMetric(null)
      clear()
    },
    [stormId, clear]
  )

  // Clamped here rather than in the scrubber, so a stop index can never be out
  // of range no matter which control moved it.
  const stopCount = storm?.profile?.length ?? 0
  const setStop = useCallback(
    (next) => {
      if (stopCount === 0) return
      setJourneyIndex((current) => {
        const raw = typeof next === 'function' ? next(current) : next
        return Math.max(0, Math.min(stopCount - 1, Math.round(raw)))
      })
    },
    [stopCount]
  )

  // Back to the opening state. Used by the state bar's Reset and by the
  // ending's "start again", so the two cannot drift into meaning different
  // things.
  const reset = useCallback(() => {
    setStormId(null)
    setJourneyIndex(0)
    setActiveMetric(null)
    clear()
  }, [clear])

  return useMemo(
    () => ({
      storm,
      stormId,
      selectStorm,
      selected: selection.selected,
      toggleNation: selection.toggle,
      clearNations: selection.clear,
      setNationAt: selection.setAt,
      swapNations: selection.swap,
      journeyIndex: Math.min(journeyIndex, Math.max(0, stopCount - 1)),
      setStop,
      activeMetric,
      setActiveMetric,
      reset,
    }),
    [
      storm,
      stormId,
      selectStorm,
      selection.selected,
      selection.toggle,
      selection.clear,
      selection.setAt,
      selection.swap,
      journeyIndex,
      stopCount,
      setStop,
      activeMetric,
      reset,
    ]
  )
}
