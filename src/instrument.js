// /src/instrument.js
// Sentry initialisation. MUST be the first import in src/main.jsx — Sentry has
// to install its global handlers before any other module runs, or errors thrown
// during early startup are never captured.
//
// Scope here is the Sentry skill's "first error" baseline: error monitoring +
// tracing, which is the SDK's recommended default init. Session Replay,
// Profiling, and structured logging are deliberately NOT enabled yet — see the
// notes at the bottom of this file for what adding them costs.
//
// Detected setup this is configured for:
//   React 19.2          -> reactErrorHandler() wired in main.jsx
//   react-router-dom 7  -> declarative <Routes>, so the hook-based v7 tracing
//                          integration (not wrapCreateBrowserRouterV7, which is
//                          for createBrowserRouter data routers)
//   Vite 8              -> DSN via import.meta.env.VITE_SENTRY_DSN

import { useEffect } from 'react'
import * as Sentry from '@sentry/react'
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom'

const dsn = import.meta.env.VITE_SENTRY_DSN
const isProd = import.meta.env.PROD

// No DSN (local dev, or before the env var is set) -> skip init entirely so the
// SDK stays inert rather than buffering events it can never deliver.
if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || undefined,

    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],

    // 20% in production keeps trace volume inside a modest Sentry quota while
    // still sampling every route; full rate locally so dev traces are complete.
    tracesSampleRate: isProd ? 0.2 : 1.0,

    // Attach trace headers only to our own API. Without this the browser sends
    // sentry-trace/baggage to Stripe, Supabase and Brevo too, which trips their
    // CORS preflights for no benefit.
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/(www\.)?celpipace\.ca/,
    ],

    // We never want PII in Sentry. AuthContext calls identify() with the user
    // id only; sendDefaultPii would otherwise attach emails and headers.
    sendDefaultPii: false,

    // Kept deliberately short. Chunk-load failures are NOT filtered here:
    // installChunkReloadGuard() already absorbs the transient ones by
    // reloading, so anything that still reaches Sentry has survived three
    // retries in lazyWithRetry and means a genuinely broken deploy. Filtering
    // on the message would have dropped exactly that signal.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],
  })
}

export { Sentry }

// ── Not enabled, and what they would cost ───────────────────────────────────
// Session Replay      — Sentry recommends it for user-facing apps and this is
//                       one. It is also the single largest part of the SDK
//                       bundle, and this site's acquisition model is organic
//                       search, so it is a real Lighthouse trade-off rather
//                       than a free win. Add via Sentry.replayIntegration().
// Structured logging  — enableLogs: true plus Sentry.logger.* calls.
// Profiling           — needs the Document-Policy: js-profiling response header.
// Source maps         — without them these stack traces point at minified code.
//                       Needs SENTRY_AUTH_TOKEN + sentryVitePlugin; see
//                       vite.config.js, which is already wired but inert until
//                       the token is present.
