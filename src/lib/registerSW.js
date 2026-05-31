/* ──────────────────────────────────────────────────────────────
   registerSW — registers the service worker and surfaces an
   "update available" signal via a callback. No-ops in dev and
   where service workers aren't supported.
────────────────────────────────────────────────────────────── */
let updateCallback = null
let waitingWorker = null

export function onUpdateAvailable(cb) {
  updateCallback = cb
  if (waitingWorker) cb(waitingWorker)
}

export function applyUpdate() {
  if (!waitingWorker) return
  waitingWorker.postMessage('SKIP_WAITING')
}

export function registerSW() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return
  // Skip in dev — the SW lives in /public and is only built for production.
  if (import.meta.env && import.meta.env.DEV) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        // A worker is already waiting (update downloaded on a previous load).
        if (reg.waiting && navigator.serviceWorker.controller) {
          waitingWorker = reg.waiting
          updateCallback?.(reg.waiting)
        }

        reg.addEventListener('updatefound', () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorker = installing
              updateCallback?.(installing)
            }
          })
        })
      })
      .catch(() => { /* registration failed — app still works online */ })

    // Reload once the new worker takes control.
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  })
}
