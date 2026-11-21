// Service worker. The build adds `self.__VERSION__` and `self.__PRECACHE__` at the top of this
// file (see vite.config.ts), so every new build gets its own shell cache.

const SHELL_CACHE = `shell-${self.__VERSION__}`
const STATIC_CACHE = 'static-v1'
const API_CACHE = 'api-v1'
const CURRENT_CACHES = [SHELL_CACHE, STATIC_CACHE, API_CACHE]

const MAX_STATIC_ENTRIES = 60
const MAX_API_ENTRIES = 80
const NETWORK_TIMEOUT = 5000 // after this we use the saved copy of an API response

const API_ORIGIN = 'https://dummyjson.com'
const scopeUrl = (path) => new URL(path, self.registration.scope).href

// The server may send "Vary: Origin". Page scripts send an Origin header and the files saved
// in install do not, so without this the saved files would not be found.
const MATCH_OPTIONS = { ignoreVary: true }

// install: save the app shell (html, js, css, icons, offline page). We do not call skipWaiting
// here, so a new version waits until the user presses "Update" in the app.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // cache: 'reload' skips the browser HTTP cache, so we never save an old file by mistake
      cache.addAll(self.__PRECACHE__.map((path) => new Request(scopeUrl(path), { cache: 'reload' }))),
    ),
  )
})

// activate: remove caches from older versions and take control of the open pages
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => !CURRENT_CACHES.includes(name)).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || request.headers.has('Authorization')) return

  const url = new URL(request.url)

  // The Redux version of the app lives in the redux/ folder and has its own service worker.
  if (url.pathname.startsWith(new URL('redux/', self.registration.scope).pathname)) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
  } else if (url.origin === API_ORIGIN) {
    event.respondWith(networkFirst(event, request))
  } else if (url.origin === self.location.origin && !url.searchParams.has('probe')) {
    event.respondWith(cacheFirst(request))
  }
  // Everything else (Firebase and Google sign-in requests) is not handled here: it goes
  // straight to the network and is never stored.
})

// The app is a single page, so every page address opens the saved index.html
// (except files we saved on purpose, like offline.html).
async function handleNavigation(request) {
  const shell = await caches.open(SHELL_CACHE)
  const page =
    (await shell.match(request, MATCH_OPTIONS)) || (await shell.match(scopeUrl('index.html'), MATCH_OPTIONS))
  if (page) return page
  try {
    return await fetch(request)
  } catch {
    return shell.match(scopeUrl('offline.html'), MATCH_OPTIONS)
  }
}

// Cache first: files that do not change (js, css, images, icons, fonts).
async function cacheFirst(request) {
  const cached = await caches.match(request, MATCH_OPTIONS)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      await cache.put(request, response.clone())
      await trimCache(cache, MAX_STATIC_ENTRIES)
    }
    return response
  } catch {
    return Response.error()
  }
}

// Network first: public API data. If the network is slow or down, use the last saved copy and
// mark it with a header so the app can tell the user it is old data.
async function networkFirst(event, request) {
  const cache = await caches.open(API_CACHE)

  const fromNetwork = fetch(request).then(async (response) => {
    if (response.ok) {
      await cache.delete(request) // so the newest entry is always last
      await cache.put(request, response.clone())
      await trimCache(cache, MAX_API_ENTRIES)
    }
    return response
  })
  // keep the worker alive so a slow response is still saved for next time
  event.waitUntil(fromNetwork.catch(() => {}))

  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT))

  try {
    return await Promise.race([fromNetwork, timeout])
  } catch {
    const saved = await cache.match(request, MATCH_OPTIONS)
    return saved ? markAsCached(saved) : Response.error()
  }
}

function markAsCached(response) {
  const headers = new Headers(response.headers)
  headers.set('X-Served-From', 'cache')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

// Keeps at most `max` entries by removing the oldest ones.
async function trimCache(cache, max) {
  const keys = await cache.keys()
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)))
}
