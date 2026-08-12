import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import StormJourney from './components/StormJourney.jsx'
import StormProfile from './components/StormProfile.jsx'
import BigPicture from './components/BigPicture.jsx'
import MapView from './components/MapView.jsx'
import RippleChain from './components/RippleChain.jsx'
import DivergenceView from './components/DivergenceView.jsx'
import ContextPanel from './components/ContextPanel.jsx'
import StormTimeline from './components/StormTimeline.jsx'
import ExclusionsPanel from './components/ExclusionsPanel.jsx'
import StoryGate from './components/StoryGate.jsx'
import ComparisonView from './components/ComparisonView.jsx'
import CitationPanel from './components/CitationPanel.jsx'
import PageSections from './components/PageSections.jsx'
import { useDeck } from './hooks/useDeck.js'
import { PAGE_SECTIONS } from './content/pageSections.js'
import { ThemeProvider } from './hooks/useTheme.jsx'
import { useSelection, selectionAnnouncement } from './hooks/useSelection.js'
import { useMetricData } from './hooks/useMetricData.js'
import { METRICS } from './utils/metrics.js'
import { STORMS, stormById } from './content/storms.js'

const DATA_SOURCES = [
  {
    label: 'Number of directly affected persons attributed to disasters — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=ds%3ASPC2&df[id]=DF_SDG_11&df[ag]=SPC&df[vs]=3.0&dq=A.VC_DSR_AFFCT.........&pd=,&to[TIME_PERIOD]=false&lb=bt',
  },
  {
    label: 'Direct disaster economic loss — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=ds%3ASPC2&df[id]=DF_SDG_11&df[ag]=SPC&df[vs]=3.0&dq=A.VC_DSR_AALT...._T.....&pd=,&to[TIME_PERIOD]=false',
  },
  {
    label: 'Crop yield — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.CROP_YIELD.&pd=,&to[TIME_PERIOD]=false',
  },
  {
    label: 'Tourist arrivals — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.TRSM_ARR.&pd=,&to[TIME_PERIOD]=false',
  },
  {
    label: 'Power generation — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.POWER_GEN.&pd=,&to[TIME_PERIOD]=false',
  },
  // Supplementary sources follow, drawn from the roster itself so a storm and
  // its citations cannot drift apart. Not from the official Pacific Data Hub
  // list, and used only for the "storm itself" facts in the profile and journey
  // sections -- never for a ripple-chain metric above.
  ...STORMS.flatMap((storm) => storm.sources),
]

// The page, top to bottom. PageSections owns the shape: it gives each entry its
// anchor id, its place in the entrance stagger, and the wave divider above and
// below it coloured to match the two tones it sits between -- so an id, a
// stagger position and a divider colour can't drift apart the way they could
// when App kept a parallel SECTION_TONES array and destructured it positionally.
//
// `tone` is the background the section actually paints, read only to colour
// those dividers. Keep it in step with what the section renders or the wave
// seam shows a visible colour mismatch. Every id here must also appear in
// content/pageSections.js, which is what the header's jump-to menu links to.
// Sections before the gate are always present; the rest appear once a storm is
// chosen. Split into two lists rather than filtered from one, so the gate's
// position is a structural fact of this file rather than an index somebody has
// to keep in step.
const SECTION_LABELS = Object.fromEntries(PAGE_SECTIONS.map((s) => [s.id, s.label]))

function pageSections(data, selection, storm, onSelectStorm) {
  const { selected, toggle, clear } = selection

  return [
    { id: 'top', tone: 'plain', element: <Hero /> },
    {
      id: 'timeline',
      tone: 'plain',
      element: <StormTimeline selectedId={storm?.id ?? null} onSelect={onSelectStorm} />,
    },
    { id: 'exclusions', tone: 'panel', element: <ExclusionsPanel /> },

    ...(storm ? [] : [{ id: 'gate', tone: 'plain', element: <StoryGate /> }]),
    ...(!storm
      ? []
      : [
    { id: 'storm-journey', tone: 'panel', element: <StormJourney storm={storm} /> },
    { id: 'storm-profile', tone: 'plain', element: <StormProfile storm={storm} /> },
    { id: 'big-picture', tone: 'panel', element: <BigPicture data={data} storm={storm} /> },
    {
      id: 'map',
      tone: 'plain',
      // Everything from here on is driven by the map's selection: the ripple
      // chain, the comparison and the divergence panels all read it. Paging
      // past without a country picked would show three empty states in a row
      // and read as a broken site rather than an unanswered question.
      requires: selected.length === 0 ? 'Pick a country on the map' : null,
      element: <MapView storm={storm} selected={selected} onToggle={toggle} onClear={clear} />,
    },
    {
      id: 'ripple-chain',
      tone: 'plain',
      element: <RippleChain data={data} storm={storm} selectedNations={selected} />,
    },
    { id: 'divergence', tone: 'panel', element: <DivergenceView data={data} storm={storm} /> },
    { id: 'context', tone: 'plain', element: <ContextPanel data={data} /> },
    {
      id: 'compare',
      tone: 'panel',
      element: <ComparisonView data={data} storm={storm} selectedNations={selected} />,
    },
    { id: 'sources', tone: 'ink', element: <CitationPanel sources={DATA_SOURCES} /> },
        ]),
  ].map((section) => ({ ...section, label: SECTION_LABELS[section.id] ?? section.id }))
}

function AppShell() {
  const data = useMetricData(METRICS)
  const selection = useSelection()
  // Nothing is selected on load, deliberately: the timeline is the argument and
  // a storm is the evidence for it, so the reader chooses which piece to open
  // rather than landing mid-way through one.
  const [stormId, setStormId] = useState(null)
  const storm = stormById(stormId)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Progress through the whole piece: which slide, plus how far down that
  // slide. The canoe reads the same quantity it always did -- it just has to be
  // told, now that there is no document scroll left to derive it from.
  const [panelFraction, setPanelFraction] = useState(0)
  const onProgress = useCallback((fraction) => setPanelFraction(fraction), [])

  // Slideshow by default; the single-document layout is one click away and is
  // remembered, because a reader who needed it once (find-in-page, printing, a
  // browser the stage misbehaves on) will need it again.
  const [layout, setLayout] = useState(() => {
    if (typeof window === 'undefined') return 'slides'
    return window.localStorage.getItem('ripple-layout') === 'document' ? 'document' : 'slides'
  })
  useEffect(() => {
    window.localStorage.setItem('ripple-layout', layout)
    // The document itself must not scroll while the panels do, or a wheel
    // gesture at a panel's end drags the whole stage.
    document.documentElement.classList.toggle('is-slides', layout === 'slides')
  }, [layout])

  // Keep the CSS scroll offset in step with the measured header height, so a
  // jump-to-section link doesn't land with its heading hidden behind the fixed
  // header (see --header-height in index.css).
  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`)
  }, [headerHeight])

  // Choosing a storm replaces the gate with the storm sections at the same
  // index, so the reader steps straight into the journey rather than being
  // returned to the top. Declared above `sections` because it is read while
  // building it.
  const selectStorm = useCallback((id) => {
    setStormId(id)
    setPanelFraction(0)
  }, [])

  const sections = pageSections(data, selection, storm, selectStorm)
  const slides = layout === 'slides'
  const { active, direction, go, goToId } = useDeck(sections, { enabled: slides })

  const deckProgress = sections.length > 0 ? (active + panelFraction) / sections.length : 0

  return (
    <>
      {/* Visually hidden until focused -- lets keyboard users jump past the
          header straight to the story without tabbing through it first. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:rounded-br-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <Header
        onHeightChange={setHeaderHeight}
        availableIds={sections.map((s) => s.id)}
        progress={slides ? deckProgress : undefined}
        layout={layout}
        onLayoutChange={setLayout}
        onNavigate={slides ? goToId : undefined}
        storm={storm}
        selectedNations={selection.selected}
        onClearNations={selection.clear}
      />

      {/* The charts and comparison view below update silently otherwise. */}
      <div aria-live="polite" className="sr-only">
        {storm
          ? `${storm.name} selected. The rest of the story is now available below. ${selectionAnnouncement(
              selection.selected,
              'Showing its ripple chain.'
            )}`
          : 'Pick a storm from the timeline to continue.'}
      </div>

      <main
        id="main-content"
        className={slides ? '' : 'min-h-screen'}
        style={{ paddingTop: headerHeight }}
      >
        <PageSections
          sections={sections}
          layout={layout}
          active={active}
          direction={direction}
          onNavigate={go}
          onProgress={onProgress}
        />
      </main>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
