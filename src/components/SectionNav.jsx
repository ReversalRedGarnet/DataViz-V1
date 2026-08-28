import { useEffect, useRef, useState } from 'react'
import { PAGE_SECTIONS, sectionLabel } from '../content/pageSections.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

const STRINGS = {
  en: { openMenu: 'Open section menu', closeMenu: 'Close section menu' },
  fr: { openMenu: 'Ouvrir le menu des sections', closeMenu: 'Fermer le menu des sections' },
}

// Three bars morphing into an X, drawn as one component rather than two icons
// so the morph itself gives feedback that the button did something.
function HamburgerIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <line
        x1="4"
        y1="7"
        x2="20"
        y2="7"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        style={{
          transformOrigin: '12px 7px',
          transform: open ? 'translateY(5px) rotate(45deg)' : 'none',
          transition: 'transform 180ms ease-out',
        }}
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        style={{ opacity: open ? 0 : 1, transition: 'opacity 120ms ease-out' }}
      />
      <line
        x1="4"
        y1="17"
        x2="20"
        y2="17"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        style={{
          transformOrigin: '12px 17px',
          transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none',
          transition: 'transform 180ms ease-out',
        }}
      />
    </svg>
  )
}

// In-page "jump to section" menu. Real anchor links, not a JS scroll: index.css
// already gives fragment navigation a smooth scroll and the right header
// clearance, and this way each section is a shareable URL. Renders nothing if
// the registry is empty.
// A fragment link has nothing to scroll to: the target panel is off-stage
// rather than below, so the menu drives the deck instead. The href is kept so
// each section is still a shareable URL that the hash sync in useDeck will
// honour on load.
export default function SectionNav({ availableIds, onNavigate }) {
  const { language } = useLanguage()
  const t = STRINGS[language]

  // While the story is gated, most sections are not in the document at all.
  // Listing them anyway would give the reader links that scroll nowhere, so the
  // menu shows only what currently exists.
  const sections = availableIds
    ? PAGE_SECTIONS.filter((s) => availableIds.includes(s.id))
    : PAGE_SECTIONS
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!sections || sections.length === 0) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="section-nav-menu"
        aria-label={open ? t.closeMenu : t.openMenu}
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/5"
      >
        <HamburgerIcon open={open} />
      </button>
      {open && (
        <ul
          id="section-nav-menu"
          role="menu"
          className="animate-pop-in absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-ink/10 bg-sand py-2 shadow-lg"
        >
          {sections.map((section) => (
            <li key={section.id} role="none">
              <a
                role="menuitem"
                href={`#${section.id}`}
                onClick={(event) => {
                  if (onNavigate) {
                    event.preventDefault()
                    onNavigate(section.id, { x: event.clientX, y: event.clientY })
                  }
                  setOpen(false)
                }}
                className="block px-4 py-2 text-sm text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {sectionLabel(section, language)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
