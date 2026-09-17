import './instrument.js'              // ← MUST stay first: Sentry installs its
                                      //   global handlers before anything else runs

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { reactErrorHandler } from '@sentry/react'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { captureAttribution } from './lib/attribution.js'
import { registerSW } from './lib/registerSW.js'
import { installChunkReloadGuard } from './lib/lazyWithRetry.js'

captureAttribution()
registerSW()
installChunkReloadGuard()

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

// React 19 root-level error hooks. These catch errors our own ErrorBoundary
// never sees — recoverable hydration/render errors, and anything thrown outside
// a boundary — so the two are complementary, not redundant.
createRoot(rootEl, {
  onUncaughtError:   reactErrorHandler(),
  onCaughtError:     reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
