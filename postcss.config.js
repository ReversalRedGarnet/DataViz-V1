// PostCSS configuration. Vite runs every stylesheet through these plugins in
// order: postcss-import (joins src/index.css's @imports into one file),
// Tailwind (turns class names like `text-ink` into real CSS) and Autoprefixer
// (adds browser prefixes).

export default {
  plugins: {
    // Must run first: it inlines src/index.css's @import statements so the
    // @layer blocks in styles/ are visible to Tailwind rather than being left
    // as unresolved at-rules.
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
