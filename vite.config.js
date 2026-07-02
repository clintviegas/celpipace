import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
export default defineConfig({
  plugins: [react(), legacyRedirectsPlugin()],
  build: {
    modulePreload: {
      resolveDependencies: () => [],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('@supabase')) return 'supabase'
          if (
            id.includes('react-router') ||
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('scheduler')
          ) return 'react-vendor'
        },
      },
    },
  },
})
