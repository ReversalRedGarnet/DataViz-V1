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
import MethodPanel from './components/MethodPanel.jsx'
import ComparisonView from './components/ComparisonView.jsx'
import DataDetective from './components/DataDetective.jsx'
import StoryConclusion from './components/StoryConclusion.jsx'
import CitationPanel from './components/CitationPanel.jsx'
import PageSections from './components/PageSections.jsx'
import { useDeck } from './hooks/useDeck.js'
import { PAGE_SECTIONS } from './content/pageSections.js'
import { ThemeProvider } from './hooks/useTheme.jsx'
import { useStory } from './hooks/useStory.js'
import { selectionAnnouncement } from './hooks/useSelection.js'
import { useMetricData } from './hooks/useMetricData.js'
import { METRICS } from './utils/metrics.js'
import { NATIONS } from './components/MapView.jsx'
import { STORMS } from './content/storms.js'

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
  {
    label: 'Mid-year population estimates — Pacific Data Hub (SPC)',
    url: 'https://stats.pacificdata.org/',
  },
  // Supplementary sources follow, drawn from the roster itself so a storm and
  // its citations cannot drift apart. Not from the official Pacific Data Hub
  // list, and used only for the "storm itself" facts in the profile and journey
  // sections -- never for a ripple-chain metric above.
  ...STORMS.flatMap((storm) => storm.sources),
]

// The page, top to bottom. PageSections owns the shape: it gives each entry its
// anchor id and its place in the entrance stagger, so the two can't drift apart
// the way they could when App kept parallel arrays and destructured them
// positionally.
//
// There is no per-section `tone` here any more. It existed to colour the wave
// divider between two sections, and once that divider was removed the field was
// read by nothing while still looking like the colour knob -- so a section's
// background is now set where it is painted, in the component's own <Section>.
// Every id here must also appear in content/pageSections.js, which is what the
// header's jump-to menu links to.
// The first two sections are always present; the rest appear once a storm is
// chosen. Split into two lists rather than filtered from one, so where the
// story opens out is a structural fact of this file rather than an index
// somebody has to keep in step.
const SECTION_LABELS = Object.fromEntries(PAGE_SECTIONS.map((s) => [s.id, s.label]))

// The comparison's pickers offer every in-scope nation, not only the two
// currently chosen, so the pair can be changed from the section that asks the
// question rather than from the map four slides back.
const NATION_NAMES = NATIONS.map((n) => n.name)

function pageSections(data, story, onSelectStorm) {
  const { storm, selected } = story

  return [
    { id: 'top', element: <Hero /> },
    {
      id: 'timeline',
      // The same hold the map uses further down, for the same reason: every
      // section after this one is about one storm, so paging past without one
      // chosen would walk the reader through nine slides with nothing in them.
      //
      // It is also a structural fact rather than only a narrative one: with no
      // storm chosen the later sections do not exist, so there is nothing to
      // walk forward into until this question is answered.
      requires: storm ? null : 'Select a cyclone',
      // What the opening slide's Next button says. The section is still called
      // "How Often, and to Whom" everywhere it is a destination -- in the menu,
      // in the progress readout -- but the control that walks a reader into it
      // asks them for the one thing it wants.
      cue: 'Choose a storm',
      element: <StormTimeline selectedId={storm?.id ?? null} onSelect={onSelectStorm} />,
    },
    ...(!storm
      ? []
      : [
    {
      id: 'storm-journey',
      element: (
        <StormJourney storm={storm} index={story.journeyIndex} onIndex={story.setStop} />
      ),
    },
    { id: 'storm-profile', element: <StormProfile storm={storm} /> },
    { id: 'big-picture', element: <BigPicture data={data} storm={storm} /> },
    {
      id: 'map',
      // Everything from here on is driven by the map's selection: the ripple
      // chain, the comparison and the divergence panels all read it. Paging
      // past without a country picked would show three empty states in a row
      // and read as a broken site rather than an unanswered question.
      //
      requires: selected.length === 0 ? 'Pick a country on the map' : null,
      element: (
        <MapView
          storm={storm}
          selected={selected}
          onToggle={story.toggleNation}
          onClear={story.clearNations}
        />
      ),
    },
    {
      id: 'ripple-chain',
      element: (
        <RippleChain
          data={data}
          storm={storm}
          selectedNations={selected}
          activeMetric={story.activeMetric}
          onActiveMetric={story.setActiveMetric}
        />
      ),
    },
    { id: 'divergence', element: <DivergenceView data={data} storm={storm} /> },
    { id: 'context', element: <ContextPanel data={data} /> },
    {
      id: 'compare',
      element: (
        <ComparisonView
          data={data}
          storm={storm}
          selectedNations={selected}
          nations={NATION_NAMES}
          onSetNationAt={story.setNationAt}
          onSwapNations={story.swapNations}
        />
      ),
    },
    // The question, then the answer. Both sit after the comparison and before
    // the method: the reader has now seen everything the site can show, which
    // is the only honest moment to ask them what they make of it.
    {
      id: 'detective',
      element: <DataDetective storm={storm} />,
    },
    {
      id: 'conclusion',
      element: (
        <StoryConclusion storm={storm} selectedNations={selected} onReset={story.reset} />
      ),
    },
    // Method sits second to last, immediately before the sources it explains.
    // It began as an exclusions-only slide in third place, where it broke off
    // the argument to answer an objection nobody had raised yet.
    { id: 'method', element: <MethodPanel /> },
    { id: 'sources', element: <CitationPanel sources={DATA_SOURCES} /> },
        ]),
  ].map((section) => ({ ...section, label: SECTION_LABELS[section.id] ?? section.id }))
}

function AppShell() {
  const data = useMetricData(METRICS)
  // One hook, one source of truth: the storm, the country pair, the reading
  // mode, the position along the storm's path and the open ripple link. Every
  // section below is a view of these; none of them keeps a second copy.
  const story = useStory()
  const { storm } = story
  const [headerHeight, setHeaderHeight] = useState(0)

  // Progress through the whole piece: which slide, plus how far down that
  // slide. The canoe reads the same quantity it always did -- it just has to be
  // told, now that there is no document scroll left to derive it from.
  const [panelFraction, setPanelFraction] = useState(0)
  const onProgress = useCallback((fraction) => setPanelFraction(fraction), [])

  // The deck is the only layout. html gets is-slides permanently so the
  // document itself never scrolls -- the panels do.
  useEffect(() => {
    document.documentElement.classList.add('is-slides')
  }, [])

  // Keep the CSS scroll offset in step with the measured header height, so a
  // jump-to-section link doesn't land with its heading hidden behind the fixed
  // header (see --header-height in index.css).
  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`)
  }, [headerHeight])

  // ONE WAY FORWARD.
  //
  // Choosing a storm used to carry the reader to the journey it unlocked, after
  // a beat for the card's own confirmation animation. It does not any more, and
  // the rule it broke is worth stating once, here, because it governs the whole
  // deck: the only thing that moves the reader between slides is the footer's
  // Back and Next.
  //
  // Nothing a reader does to the content navigates. Pressing a storm selects a
  // storm; that is the entire effect, and the sections it unlocks appear behind
  // the Next button for the reader to walk into when they are ready. The
  // alternative -- a press that both chooses and travels -- means the reader
  // cannot look at a second storm without being taken somewhere, and a reader
  // who has been moved without asking stops pressing things to find out what
  // they do.
  //
  // The header's section menu is the one other way to jump, and it stays: it is
  // a list of destinations that does nothing but go to them. What it is not is
  // a side effect of reading.
  const sections = pageSections(data, story, story.selectStorm)
  const deck = useDeck(sections)
  const { active, direction, go, goToId } = deck

  const deckProgress = sections.length > 0 ? (active + panelFraction) / sections.length : 0

  // Reset the panel's own scroll fraction whenever the deck moves, so the
  // progress readout does not carry the previous slide's position into the
  // next one before its first scroll event arrives.
  useEffect(() => {
    setPanelFraction(0)
  }, [active])

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
        progress={deckProgress}
        onNavigate={goToId}
        storm={storm}
        selectedNations={story.selected}
        onClearNations={story.clearNations}
        onReset={story.reset}
      />

      {/* The charts and comparison view below update silently otherwise.
          Deliberately only the two choices the rest of the page is built on:
          the scrubber announces its own position through the slider's
          valuetext, and routing that through here as well would say the same
          country twice on every arrow press. */}
      <div aria-live="polite" className="sr-only">
        {storm
          ? `${storm.name} selected. The rest of the story is now available below. ${selectionAnnouncement(
              story.selected,
              'Showing its ripple chain.'
            )}`
          : 'Pick a storm from the timeline to continue.'}
      </div>

      <main id="main-content" style={{ paddingTop: headerHeight }}>
        <PageSections
          sections={sections}
          active={active}
          direction={direction}
          onNavigate={go}
          onProgress={onProgress}
          storyLength={PAGE_SECTIONS.length}
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
