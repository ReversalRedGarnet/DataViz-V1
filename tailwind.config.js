/** @type {import('tailwindcss').Config} */

export default {
  // Use class-based dark mode so users can override and persist
  // their preferred theme independently of the OS setting.
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  theme: {
    extend: {
      // TWO NEW BREAKPOINTS, AND THEY ARE NOT THE SAME QUESTION.
      //
      // `compact` is the width band the compact-laptop pass is written
      // against: wide enough for every two-column layout the desktop uses,
      // narrow enough that those columns need their gaps tightened rather
      // than collapsed. Appended after the defaults, so it wins over `lg`
      // and `xl` in the generated output the way a later breakpoint should.
      //
      // `short` is the one that actually carries this pass. Measured across
      // the whole deck, the thing that separates a comfortable laptop from a
      // cramped one is height, not width: at 1440x900 every slide fits, and
      // at 1366x768 -- barely narrower -- the timeline, the map and the
      // journey all overflow. A width-only rule would tighten a 1280x1024
      // window that has room to spare and leave a 1600x768 one broken.
      //
      // min-width guard on `short` so none of it can reach a phone in
      // landscape, which is short by definition and already has its own
      // layout.
      screens: {
        compact: { min: '1100px', max: '1399px' },
        short: { raw: '(min-width: 1024px) and (max-height: 960px)' },
      },

      // Headings and the wordmark only; body, UI and data stay on the system
      // sans Tailwind's preflight already sets. An editorial serif is what
      // separates a data story from a dashboard, and one face used with
      // restraint is cheaper than two used everywhere.
      //
      // Georgia leads the fallback because its metrics are close enough that a
      // swap after the webfont lands doesn't visibly reflow a headline.
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'ui-serif', 'serif'],
      },

      colors: {
        // Fixed brand colors used across both themes.
        ocean: '#5B8FA3',
        sun: '#F0C868',

        // Theme-aware colors defined in index.css.
        // <alpha-value> lets Tailwind's opacity modifiers (e.g. text-ink/70)
        // substitute the real opacity value in place of this placeholder --
        // without it, every /NN utility built on these four colors silently
        // stops generating any rule at all.
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        sand: 'rgb(var(--color-sand) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        // Text-safe ocean, for eyebrows. Not interchangeable with `ocean`,
        // which is decorative only -- see the note in index.css.
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
      },
    },
  },

  plugins: [],
};
