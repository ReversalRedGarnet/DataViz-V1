import { useCallback, useEffect, useMemo, useState } from 'react'
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
import DisplayCheck from './components/DisplayCheck.jsx'
import IslanderPoem from './components/IslanderPoem.jsx'
import { useDeck } from './hooks/useDeck.js'
import { PAGE_SECTIONS, sectionLabel } from './content/pageSections.js'
import { NATION_NAMES } from './content/nations.js'
import { ThemeProvider } from './hooks/useTheme.jsx'
import { LanguageProvider, useLanguage } from './hooks/useLanguage.jsx'
import { useStory } from './hooks/useStory.js'
import { selectionAnnouncement } from './hooks/useSelection.js'
import { useMetricData } from './hooks/useMetricData.js'
import { METRICS } from './utils/metrics.js'
import { STORMS, localizeStorm } from './content/storms.js'

const APP_STRINGS = {
  en: {
    skipToContent: 'Skip to main content',
    openingLabel: 'The Opening',
    beginCue: 'Begin',
    chooseStormCue: 'Choose a storm',
    selectCycloneRequires: 'Select a cyclone',
    pickCountryRequires: 'Pick a country on the map',
    stormSelected: (stormName, chain) =>
      `${stormName} selected. The rest of the story is now available below. ${chain}`,
    pickStorm: 'Pick a storm from the timeline to continue.',
    showingChain: 'Showing its ripple chain.',
  },
  fr: {
    skipToContent: 'Passer au contenu principal',
    openingLabel: "L'ouverture",
    beginCue: 'Commencer',
    chooseStormCue: 'Choisir un cyclone',
    selectCycloneRequires: 'Sélectionner un cyclone',
    pickCountryRequires: 'Choisir un pays sur la carte',
    stormSelected: (stormName, chain) =>
      `${stormName} sélectionné. La suite du récit est maintenant disponible ci-dessous. ${chain}`,
    pickStorm: 'Choisissez un cyclone dans la chronologie pour continuer.',
    showingChain: 'Affiche sa chaîne de répercussions.',
  },
}

const DATA_SOURCES = [
  // THE DATASETS, FROM THE METRICS THEMSELVES.
  //
  // This used to be six hand-written entries whose URLs were the same six
  // strings utils/metrics.js is now the home of. Two copies of a query URL is
  // two chances for a re-export to update one of them, and nothing about the
  // page would look wrong afterwards -- the sources slide would simply point a
  // reader at a query that no longer produces the numbers above it, which is
  // the most expensive kind of quiet error on a site whose argument is that the
  // record can be checked.
  //
  // One copy now. A metric with no `source` contributes nothing here and
  // renders its figure caption without a data line; see the note in
  // utils/metrics.js about the four that are in that position.
  ...METRICS.filter((m) => m.source).map((m) => m.source),
  // EVERY STORM'S CITATIONS, NOT THE SELECTED STORM'S. This slide is a
  // bibliography for the whole piece rather than a footnote to the reader's
  // current choice: the roster is the argument, so a reader checking whether it
  // was picked to suit the conclusion needs to see what the storms they did not
  // choose were sourced from too. It is also why this is a module constant
  // rather than a function of `storm`.
  //
  // Drawn from the roster itself so a storm and its citations cannot drift
  // apart. Not from the official Pacific Data Hub list, and used only for the
  // "storm itself" facts in the profile and journey sections -- never for a
  // ripple-chain metric above.
  ...STORMS.flatMap((storm) => storm.sources),
]

// The page, top to bottom. PageSections owns the shape: it gives each entry its
// anchor id and its place in the entrance stagger, so the two can't drift the
// way they could when App kept parallel arrays and destructured positionally.
//
// Every id here must also appear in content/pageSections.js, which is what the
// header's jump-to menu links to. The first two sections are always present;
// the rest appear once a storm is chosen -- split into two lists rather than
// filtered from one, so where the story opens out is a structural fact of this
// file rather than an index somebody has to keep in step.
// Resolved per-language rather than a module constant, since 'islander-poem'
// (and every PAGE_SECTIONS label) now carries both languages -- see
// sectionLabel() in content/pageSections.js.
function sectionLabels(language) {
  const t = APP_STRINGS[language]
  return {
    ...Object.fromEntries(PAGE_SECTIONS.map((s) => [s.id, sectionLabel(s, language)])),
    // Not in PAGE_SECTIONS on purpose -- the poem is not a destination the
    // header's jump-to menu should offer, and it does not count toward the
    // deck's total (see `cover` below). It still needs a name here, though:
    // this is what the Hero's "Back" button reads once the poem is behind it.
    'islander-poem': t.openingLabel,
  }
}

// The comparison's pickers offer every in-scope nation, not only the two
// currently chosen, so the pair can be changed from the section that asks the
// question rather than from the map four slides back. NATION_NAMES comes from
// content/nations.js; this file used to derive it here, and so did BigPicture,
// ContextPanel and DivergenceView, each independently.

function pageSections(data, dataError, story, onSelectStorm, language) {
  const { storm, selected } = story
  const t = APP_STRINGS[language]
  // Swapped in once, here, rather than at each of the nine places `storm` is
  // passed down -- see the note at the top of content/storms.js. Boolean
  // checks below (`!storm`, `storm?.id`) still read the original `storm`;
  // only the object actually handed to a child needs its prose localized.
  const localizedStorm = localizeStorm(storm, language)

  return [
    // THE ONE SLIDE THAT ISN'T A FINDING.
    //
    // `cover` is read by PageSections.jsx to keep this out of the "N / total"
    // counter -- it is not the first of fourteen things the piece has to say,
    // it is what a reader feels before the first of them lands. For the same
    // reason its id is deliberately absent from content/pageSections.js: nothing
    // else on the site treats it as a destination, so the header's jump-to menu
    // shouldn't either.
    //
    // `chromeless` is the second flag it carries, and it is a different claim
    // from `cover`. `cover` is about counting; this is about furniture. The
    // poem and the sources slide are the piece's two bookends, and a bookend
    // reads as one because nothing frames it -- so on these two the site
    // header fades out, <main>'s header offset collapses to zero, and the
    // footer bar is replaced by a single quiet control. Read in
    // PageSections.jsx and SlidePanel.jsx, and by AppShell below for the
    // header. Flagged here rather than matched by id anywhere downstream, so
    // there is one place to change if either bookend moves.
    { id: 'islander-poem', cover: true, chromeless: true, element: <IslanderPoem /> },
    // `cue` overrides what the *previous* footer's Next button says -- see the
    // note on `cue` in PageSections.jsx. With the poem now in front of it, Hero
    // is the only section whose Next-button label this affects.
    { id: 'top', cue: t.beginCue, element: <Hero /> },
    {
      id: 'timeline',
      // The same hold the map uses further down, for the same reason: every
      // section after this one is about one storm, so paging past without one
      // chosen would walk the reader through nine slides with nothing in them.
      //
      // It is also a structural fact rather than only a narrative one: with no
      // storm chosen the later sections do not exist, so there is nothing to
      // walk forward into until this question is answered.
      requires: storm ? null : t.selectCycloneRequires,
      // What the opening slide's Next button says. The section is still called
      // "How Often, and to Whom" everywhere it is a destination -- in the menu,
      // in the progress readout -- but the control that walks a reader into it
      // asks them for the one thing it wants.
      cue: t.chooseStormCue,
      element: <StormTimeline selectedId={storm?.id ?? null} onSelect={onSelectStorm} />,
    },
    ...(!storm
      ? []
      : [
    {
      id: 'storm-journey',
      element: (
        <StormJourney storm={localizedStorm} index={story.journeyIndex} onIndex={story.setStop} />
      ),
    },
    { id: 'storm-profile', element: <StormProfile storm={localizedStorm} /> },
    { id: 'big-picture', element: <BigPicture data={data} dataError={dataError} storm={localizedStorm} /> },
    {
      id: 'map',
      // Everything from here on is driven by the map's selection: the ripple
      // chain, the comparison and the divergence panels all read it. Paging
      // past without a country picked would show three empty states in a row
      // and read as a broken site rather than an unanswered question.
      //
      requires: selected.length === 0 ? t.pickCountryRequires : null,
      element: (
        <MapView
          storm={localizedStorm}
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
          dataError={dataError}
          storm={localizedStorm}
          selectedNations={selected}
          activeMetric={story.activeMetric}
          onActiveMetric={story.setActiveMetric}
        />
      ),
    },
    { id: 'divergence', element: <DivergenceView data={data} dataError={dataError} storm={localizedStorm} /> },
    { id: 'context', element: <ContextPanel data={data} dataError={dataError} /> },
    {
      id: 'compare',
      element: (
        <ComparisonView
          data={data}
          dataError={dataError}
          storm={localizedStorm}
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
      element: <DataDetective storm={localizedStorm} />,
    },
    {
      id: 'conclusion',
      element: (
        <StoryConclusion storm={localizedStorm} selectedNations={selected} onReset={story.reset} />
      ),
    },
    // Method sits second to last, immediately before the sources it explains.
    // It began as an exclusions-only slide in third place, where it broke off
    // the argument to answer an objection nobody had raised yet.
    { id: 'method', element: <MethodPanel /> },
    // The other bookend. See `chromeless` on the poem above: nothing follows
    // this slide, so its one control points backwards.
    { id: 'sources', chromeless: true, element: <CitationPanel sources={DATA_SOURCES} /> },
        ]),
  ].map((section) => ({ ...section, label: sectionLabels(language)[section.id] ?? section.id }))
}

function AppShell() {
  const { language } = useLanguage()
  const t = APP_STRINGS[language]
  const { data, error: dataError } = useMetricData(METRICS)
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

  // ONE WAY FORWARD.
  //
  // The only thing that moves the reader between slides is the footer's Back
  // and Next. Nothing a reader does to the content navigates: pressing a storm
  // selects a storm, and the sections it unlocks appear behind the Next button
  // for the reader to walk into when they are ready.
  //
  // The alternative -- a press that both chooses and travels -- means the
  // reader cannot look at a second storm without being taken somewhere, and a
  // reader who has been moved without asking stops pressing things to find out
  // what they do.
  //
  // The header's section menu is the one other way to jump, and it stays: it is
  // a list of destinations that does nothing but go to them.
  // MEMOISED, AND THAT IS A CORRECTNESS FIX RATHER THAN A TUNING ONE.
  //
  // This was a bare call, so every render of AppShell produced a new array of
  // new objects holding new elements. AppShell re-renders on every frame of a
  // panel scroll -- onProgress below writes a fraction that changes each frame
  // -- so the whole fourteen-section tree was rebuilt and reconciled at 60fps,
  // and useDeck's hash-sync effect, which listed `sections` in its
  // dependencies, called history.replaceState just as often. WebKit throws
  // after 100 history writes in 30 seconds, which is under two seconds of
  // scrolling.
  //
  // `story` is itself memoised (see useStory), so this rebuilds when the
  // reader changes something and not when they scroll.
  const sections = useMemo(
    () => pageSections(data, dataError, story, story.selectStorm, language),
    [data, dataError, story, language]
  )
  const deck = useDeck(sections)
  const { active, go, goToId } = deck

  const deckProgress = sections.length > 0 ? (active + panelFraction) / sections.length : 0

  // THE TWO BOOKENDS RENDER WITHOUT SITE CHROME. See `chromeless` in
  // pageSections() above for which slides and why.
  //
  // The header is one fixed element for the whole app rather than per-slide
  // furniture, so "hide it here" can only mean "hide it while the deck is on
  // one of these slides" -- it fades as `active` crosses in and out. The
  // fade itself is CSS (.site-header in styles/slideshow.css); this is only
  // the flag.
  //
  // The offset it publishes goes to zero in the same commit. That change is
  // not animated and does not need to be: the deck's page change already
  // happens underneath the ripple curtain (utils/rippleTransition.js swaps
  // the page inside flushSync while the curtain is at full opacity), so the
  // layout has already settled by the time the reader can see anything. The
  // header's fade then plays out through the curtain's own fade, which is
  // what makes it read as dissolving rather than cutting.
  const chromeless = Boolean(sections[active]?.chromeless)
  const contentOffset = chromeless ? 0 : headerHeight

  // Keep the CSS scroll offset in step with the measured header height, so a
  // jump-to-section link doesn't land with its heading hidden behind the fixed
  // header (see --header-height in index.css).
  //
  // `contentOffset` rather than `headerHeight` directly, because a chromeless
  // slide has no header to clear -- see below. Header.jsx keeps measuring its
  // real height throughout: it is hidden with visibility and opacity, never
  // with display, so `headerHeight` stays correct and leaving a bookend
  // restores the right number rather than re-measuring from zero.
  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', `${contentOffset}px`)
  }, [contentOffset])


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
        {t.skipToContent}
      </a>

      <Header
        hidden={chromeless}
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
          ? t.stormSelected(
              storm.name,
              selectionAnnouncement(story.selected, t.showingChain, language)
            )
          : t.pickStorm}
      </div>

      <main id="main-content" style={{ paddingTop: contentOffset }}>
        <PageSections
          sections={sections}
          active={active}
          onNavigate={go}
          onProgress={onProgress}
          storyLength={PAGE_SECTIONS.length}
        />
      </main>

      {/* Last in the tree and outside <main>: it is chrome about the window
          rather than part of the story, and nothing in the deck depends on it
          rendering. */}
      <DisplayCheck />
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </LanguageProvider>
  )
}
