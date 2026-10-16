// The current language (English or French) for the whole site, and the
// function the EN/FR button calls to switch it. Every component reads it to
// pick its own strings.

import { createContext, useContext, useEffect, useState } from 'react'

// Site-wide EN/FR state. Context for the same reason useTheme.jsx is: both
// ends of the site need it -- Header's toggle sets it, and every
// content/UI-string component on every slide reads it.
const LanguageContext = createContext(null)

// Two decisions keep this simple:
//
// 1. No persistence. Every fresh load starts English regardless of what a
//    reader picked last visit -- there is no localStorage read here and
//    nothing in index.html duplicating one. A toggle lasts for the session
//    (it survives paging through the deck, since this Provider sits above
//    PageSections), not across a reload.
// 2. No first-visit browser-locale detection. English is the default for
//    every reader.
//
// So there is no early, before-paint read that a hardened browser profile
// could throw on, because there is nothing to read.
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')

  // Kept in step for the same reason useTheme.jsx toggles the 'dark' class:
  // assistive tech and the browser's own language-dependent behaviour (spell
  // check, translation prompts, hyphenation) read documentElement.lang, not
  // component state.
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  function toggleLanguage() {
    setLanguage((l) => (l === 'en' ? 'fr' : 'en'))
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Throws rather than defaulting, matching useTheme -- a component quietly
// rendering in the wrong language is far harder to spot than an error at the
// call site.
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
