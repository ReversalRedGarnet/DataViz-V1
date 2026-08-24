/*
  Generates src/styles/tokens.css from src/styles/tokens.js.

    node scripts/build-tokens.mjs

  Also run automatically by Vite before every build and every dev server start
  -- see the ripple-theme-tokens plugin in vite.config.js -- so the generated
  file cannot go stale under someone who edits the palette and forgets.

  WHY A GENERATOR RATHER THAN A CHECK. The two forms are not interchangeable:
  the renderers need '#24333A' and Tailwind's <alpha-value> syntax needs
  '36 51 58'. A linter comparing them would still leave two places to type a
  value; deriving one from the other leaves one.
*/
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { THEME_TOKENS } from '../src/styles/tokens.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const TARGET = path.join(here, '..', 'src', 'styles', 'tokens.css')

// '#24333A' -> '36 51 58'. Tailwind composes these with a slash and an alpha
// value, so the channels have to be bare numbers rather than an rgb() call.
function channels(hex) {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`tokens.js: "${hex}" is not a six-digit hex colour`)
  }
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16)).join(' ')
}

function block(selector, tokens) {
  const lines = Object.entries(tokens).map(
    ([name, hex]) => `    --color-${name}: ${channels(hex)};`
  )
  return `  ${selector} {\n${lines.join('\n')}\n  }`
}

export function buildTokens() {
  const css = [
    '/*',
    '  GENERATED FILE -- DO NOT EDIT.',
    '',
    '  Written by scripts/build-tokens.mjs from src/styles/tokens.js, which is',
    '  where these colours are actually defined. Editing this file will work',
    '  until the next build and then silently stop working.',
    '*/',
    '',
    '@layer base {',
    block(':root', THEME_TOKENS.light),
    '',
    block('.dark', THEME_TOKENS.dark),
    '}',
    '',
  ].join('\n')

  // Only written when it actually differs. Vite watches src/, so an
  // unconditional write on every dev server start would trigger a reload of the
  // stylesheet it had just finished loading.
  const current = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, 'utf8') : null
  if (current === css) return false

  fs.writeFileSync(TARGET, css)
  return true
}

// Only when run directly, so importing this from vite.config.js does not
// produce a line of output on every build.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const wrote = buildTokens()
  console.log(wrote ? `wrote ${TARGET}` : `${TARGET} already up to date`)
}
