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
