import js from '@eslint/js'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'
import a11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

// The project had no linter. That is how nine hand-rolled "latest value" refs,
// a stale dependency array, an eslint-disable suppressing a rule that no longer
// fired, and three focusable elements with no accessible name all went
// unnoticed at once.
//
// react-hooks and jsx-a11y are the two that earn their place here. The hooks
// rules catch the render-phase ref writes and cascading-setState patterns that
// work under React 18 and break under concurrent rendering; jsx-a11y catches
// the interactive-element mistakes that are invisible unless you drive the site
// with a screen reader.
export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },
  js.configs.recommended,
  // Build scripts run in Node, not the browser.
  {
    files: ['scripts/**/*.mjs', '*.config.js', '*.config.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: '18.3' } },
    plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y },
    rules: {
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      // The new JSX transform; React need not be in scope.
      'react/react-in-jsx-scope': 'off',
      // Props are documented in a comment block above every component here,
      // which is the convention this codebase already uses consistently.
      'react/prop-types': 'off',
      // Two lists carry role="note" with an explicit aria-label and tabIndex:
      // the selection legend and the timeline's strike-count cards. They are
      // the keyboard handle for the cross-chart highlight, which is otherwise
      // pointer-only, and they carry no other behaviour -- so there is nothing
      // a reader can trigger by accident. The rule is right in general and
      // wrong here, so the exception is narrowed to that one role rather than
      // the rule being switched off.
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['note'], allowExpressionValues: true },
      ],
    },
  },
]
