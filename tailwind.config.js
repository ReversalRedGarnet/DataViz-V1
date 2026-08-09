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
