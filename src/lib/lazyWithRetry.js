import { lazy } from 'react'
import { captureError } from './observability'

const CHUNK_RE = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * lazy() wrapper that retries failed dynamic imports (stale deploy / CDN blip).
 */
export function lazyWithRetry(importer, retries = 2) {
  return lazy(async () => {
    let lastError
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await importer()
      } catch (error) {
        lastError = error
        const message = error?.message || String(error)
        if (!CHUNK_RE.test(message) || attempt >= retries) break
        await wait(800 * (attempt + 1))
      }
    }
    // Every retry is spent. Report before throwing — a chunk that stays
    // unreachable after 3 attempts is a broken deploy, not a CDN blip, and it
    // renders as a blank route for the user.
    captureError(lastError, { surface: 'lazyWithRetry', retries })
    throw lastError
  })
}

export function installChunkReloadGuard() {
  if (typeof window === 'undefined') return
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason || '')
    if (!CHUNK_RE.test(message)) return
    const key = 'celpipace_chunk_reload'
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    event.preventDefault()
    window.location.reload()
  })
}
