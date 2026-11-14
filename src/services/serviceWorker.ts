// Registers the service worker and tells the app when a new version is waiting.

type Listener = () => void

let waitingWorker: ServiceWorker | null = null
const listeners = new Set<Listener>()

function setWaitingWorker(worker: ServiceWorker | null) {
  waitingWorker = worker
  listeners.forEach((listener) => listener())
}

export function subscribeToUpdates(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function isUpdateAvailable() {
  return waitingWorker !== null
}

// Asks the waiting worker to take over. The page reloads when it does (see below).
export function applyUpdate() {
  waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
}

export function registerServiceWorker() {
  // In development there is no built sw.js, and an old cache would only get in the way.
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return

  // The first install also changes the controller, and that must not reload the page.
  const hadController = navigator.serviceWorker.controller !== null
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    window.location.reload()
  })

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
        updateViaCache: 'none', // always check the server for a new sw.js
      })

      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(registration.waiting)
      }

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(worker)
          }
        })
      })

      // Look for a new version when the user comes back to the tab.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {})
        }
      })
    } catch (error) {
      console.error('Service worker registration failed', error)
    }
  })
}
