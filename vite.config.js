import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

const LEGACY_REDIRECTS = {
  '/writing': '/celpip-writing-practice',
  '/speaking': '/celpip-speaking-practice',
  '/reading': '/celpip-reading-practice',
  '/listening': '/celpip-listening-practice',
  '/calculator': '/crs-score-calculator',
  '/tips': '/celpip-resources',
}

function legacyRedirectsPlugin() {
  const handler = (req, res, next) => {
    const path = req.url?.split('?')[0]
    const target = LEGACY_REDIRECTS[path]
    if (target) {
      res.writeHead(308, { Location: target })
      res.end()
      return
    }
    next()
  }
  return {
    name: 'legacy-redirects',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
// Source-map upload only runs when an auth token is present, so local and
// preview builds stay fast and CI without the secret does not fail. Without
// this, Sentry stack traces point at minified code and are close to useless.
const sentrySourceMaps = process.env.SENTRY_AUTH_TOKEN
  ? [sentryVitePlugin({
      org:       process.env.SENTRY_ORG,
      project:   process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        // CRITICAL: delete the .map files once Sentry has them. `sourcemap:
        // 'hidden'` only omits the //# sourceMappingURL comment — it still
        // WRITES the maps into dist/, and Vercel serves dist/ verbatim, so
        // without this anyone could fetch /assets/<chunk>.js.map and read the
        // entire unminified source. Sentry resolves traces from its own
        // uploaded copy, so nothing is lost by removing them here.
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
    })]
  : []

export default defineConfig({
  plugins: [react(), legacyRedirectsPlugin(), ...sentrySourceMaps],
  build: {
    // 'hidden' emits maps for upload but omits the sourceMappingURL comment,
    // so the maps are not advertised to visitors' devtools.
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
    modulePreload: {
      resolveDependencies: () => [],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Must be tested BEFORE the react-vendor rule below: the old
          // `id.includes('/react/')` matched `@sentry/react/` and dragged the
          // whole Sentry SDK into the eagerly-loaded vendor chunk (226 kB →
          // 699 kB), defeating its dynamic import. Its own chunk keeps it
          // lazy — fetched only when VITE_SENTRY_DSN is set at runtime.
          if (id.includes('@sentry')) return 'sentry'

          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('@supabase')) return 'supabase'

          // Anchored to node_modules/<pkg> so a scoped package that merely
          // ends in "react" can never fall in here again.
          if (
            /node_modules\/(react|react-dom|scheduler)\//.test(id) ||
            id.includes('node_modules/react-router')
          ) return 'react-vendor'
        },
      },
    },
  },
})
