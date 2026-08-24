import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { buildTokens } from './scripts/build-tokens.mjs'

// src/styles/tokens.css is generated from src/styles/tokens.js. Running it here
// rather than only from an npm script is what makes the generated file
// impossible to leave stale: it is rewritten before the CSS is transformed, on
// every build and every dev server start. It no-ops when nothing changed.
const themeTokens = {
  name: 'ripple-theme-tokens',
  buildStart() {
    buildTokens()
  },
}

export default defineConfig({
  plugins: [themeTokens, react()],
  server: {
    // BIND BOTH IP STACKS, and this is a bug fix rather than a preference.
    //
    // Vite's default host is 'localhost', which Node 17+ resolves to ::1 alone
    // -- the dev server ends up listening on IPv6 loopback and nothing at all
    // on 127.0.0.1. Whether that works then depends on what resolves
    // "localhost" first in whatever is asking. A browser that picks the IPv4
    // address gets ECONNREFUSED and the page dies on the spot, and the same
    // applies to the HMR websocket the client opens separately: when that half
    // lands on 127.0.0.1 the page loads once and then never updates again,
    // because the socket carrying the updates was refused.
    //
    // '::' is the dual-stack bind -- IPv6 plus IPv4-mapped -- so 127.0.0.1,
    // [::1] and localhost all reach the same server and it stops mattering
    // which one anything picks. The cost is that the server is also reachable
    // from the local network, which is what `--host` does anyway.
    host: '::',
  },
})
