// /src/lib/observability.js
// Thin wrapper over the Sentry SDK for the rest of the app.
//
// Initialisation lives in src/instrument.js (imported first in main.jsx) —
// Sentry has to install its global handlers before any other module runs.
// This file is only the reporting surface, so call sites never import Sentry
// directly and stay trivially testable.
//
// Both functions are no-ops when VITE_SENTRY_DSN is unset: Sentry.init() was
// skipped, so the SDK's own calls do nothing, and we still get the console
// output. Neither may ever throw — an error inside the error reporter is the
// worst possible failure mode.

import * as Sentry from '@sentry/react'

/** Report a caught exception with tags. Never throws. */
export function captureError(error, context = {}) {
  try {
    console.error('[error]', context, error)
    Sentry.withScope((scope) => {
      for (const [key, value] of Object.entries(context)) {
        if (value !== undefined && value !== null) scope.setTag(key, String(value))
      }
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)))
    })
  } catch { /* reporting must never break the app */ }
}

/**
 * Associate subsequent events with a user. Id only — sendDefaultPii is off and
 * support can map an id back to an account, so there is no reason to ship
 * emails to a third party.
 */
export function identify(userId) {
  try {
    Sentry.setUser(userId ? { id: userId } : null)
  } catch { /* no-op */ }
}
