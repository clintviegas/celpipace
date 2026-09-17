/* global process */
// /api/_lib/observability.js
// Server-side error reporting. Sentry when configured, structured console
// otherwise.
//
// DESIGN: this module must never be the reason a request fails. Sentry is
// loaded lazily via dynamic import and every entry point is wrapped, so the
// codebase can call captureError() freely whether or not @sentry/node is
// installed and SENTRY_DSN is set. Until then it degrades to a tagged
// console.error, which is still a strict improvement on the silent
// `.catch(() => {})` swallowing this replaces.
//
// TO ACTIVATE:
//   npm install @sentry/node --legacy-peer-deps
//   set SENTRY_DSN in Vercel project env (and optionally SENTRY_ENVIRONMENT)
//
// Vercel exposes the deploy SHA as VERCEL_GIT_COMMIT_SHA, which we use as the
// release so stack traces map to a specific deploy.

// Memoise the PROMISE, not a flag plus a slot. Memoising the flag meant a
// second caller arriving while the first import was still in flight got back a
// null Sentry — so on serverless, where captureError() is immediately followed
// by flush(), the flush would silently no-op and the event would be dropped on
// container freeze. Every caller now awaits the same promise.
let _sentryPromise = null

function getSentry() {
  if (_sentryPromise) return _sentryPromise

  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    _sentryPromise = Promise.resolve(null)
    return _sentryPromise
  }

  _sentryPromise = import('@sentry/node')
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || 'development',
        release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
        tracesSampleRate: 0,   // errors only; tracing is a separate decision
        sendDefaultPii: false, // never ship user emails or tokens to Sentry
      })
      return Sentry
    })
    .catch(() => null) // package missing — fall back to console for the process

  return _sentryPromise
}

// Tracks in-flight capture() calls so flush() can await them. Without this,
// flush() can run before a capture's async init has even reached
// captureException, and the event never makes it onto the transport queue.
const _pending = new Set()

function track(promise) {
  const p = promise.catch(() => {}).finally(() => _pending.delete(p))
  _pending.add(p)
  return p
}

/**
 * Report an exception. Fire-and-forget: never awaited by callers on the hot
 * path, never throws.
 *
 * @param {Error|string} err
 * @param {object} [context] tags — job, event_type, stripe_event_id, user_id…
 * @param {'fatal'|'error'|'warning'|'info'} [level]
 */
export function captureError(err, context = {}, level = 'error') {
  const message = err?.stack || err?.message || String(err)
  console.error(`[${level}]`, JSON.stringify(context), message)

  track(getSentry().then((Sentry) => {
    if (!Sentry) return
    Sentry.withScope((scope) => {
      scope.setLevel(level)
      for (const [k, v] of Object.entries(context)) {
        if (v !== undefined && v !== null) scope.setTag(k, String(v))
      }
      Sentry.captureException(err instanceof Error ? err : new Error(message))
    })
  }))
}

/** Report a noteworthy non-exception condition (fail-open rate limiter, drift). */
export function captureMessage(message, context = {}, level = 'warning') {
  console.warn(`[${level}]`, JSON.stringify(context), message)

  track(getSentry().then((Sentry) => {
    if (!Sentry) return
    Sentry.withScope((scope) => {
      scope.setLevel(level)
      for (const [k, v] of Object.entries(context)) {
        if (v !== undefined && v !== null) scope.setTag(k, String(v))
      }
      Sentry.captureMessage(message)
    })
  }))
}

/**
 * Flush buffered events before a serverless function freezes. Vercel suspends
 * the container the moment the response is sent, so without this the last
 * error of an invocation is routinely lost.
 */
export async function flush(timeoutMs = 2000) {
  try {
    const Sentry = await getSentry()
    if (!Sentry) return false
    // Drain in-flight captures first, or flush() can beat them to the queue.
    if (_pending.size) await Promise.all([..._pending])
    return await Sentry.flush(timeoutMs)
  } catch {
    return false // never block the response on telemetry
  }
}

/**
 * Wrap a cron/worker handler so unhandled throws are reported and flushed
 * rather than vanishing into Vercel's log retention.
 */
export function withObservability(jobName, handler) {
  return async function wrapped(req, res) {
    try {
      return await handler(req, res)
    } catch (err) {
      captureError(err, { job: jobName })
      if (!res.headersSent) res.status(500).json({ error: 'job_failed', job: jobName })
    } finally {
      await flush()
    }
  }
}
