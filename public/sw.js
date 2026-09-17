/* ──────────────────────────────────────────────────────────────
   CELPIPACE service worker — offline support + app-shell caching.
   Bump CACHE_VERSION to force clients to fetch fresh assets.
────────────────────────────────────────────────────────────── */
const CACHE_VERSION = 'v1'
const SHELL_CACHE = `celpipace-shell-${CACHE_VERSION}`
const RUNTIME_CACHE = `celpipace-runtime-${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

const SHELL_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.png',
  '/logo.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// Allow the page to trigger an immediate activation of a waiting worker.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

function isCacheableAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/images/') ||
    /\.(?:js|css|woff2?|ttf|png|jpe?g|svg|webp|ico)$/i.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Only handle same-origin requests; let the network handle the rest
  // (Supabase, Stripe, analytics, /api/*, fonts, etc.).
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  // App navigations: network-first, fall back to cache then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match(OFFLINE_URL) || caches.match('/')
        })
    )
    return
  }

  // Hashed static assets: cache-first (they're content-addressed/immutable).
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          }
          return response
        }).catch(() => cached)
      })
    )
    return
  }

  // Everything else same-origin: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
        }
        return response
      }).catch(() => cached)
      return cached || network
    })
  )
})
