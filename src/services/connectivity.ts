// Keeps track of whether the app is online and whether the data on screen is a saved copy.
// Components read it through the useConnectivity hook.

export interface Connectivity {
  online: boolean
  showingSavedData: boolean // the service worker answered with an old copy of API data
}

type Listener = () => void

let state: Connectivity = { online: navigator.onLine, showingSavedData: false }
const listeners = new Set<Listener>()

function update(changes: Partial<Connectivity>) {
  const next = { ...state, ...changes }
  if (next.online === state.online && next.showingSavedData === state.showingSavedData) return
  state = next
  listeners.forEach((listener) => listener())
}

window.addEventListener('online', () => update({ online: true }))
window.addEventListener('offline', () => update({ online: false }))

export function subscribeToConnectivity(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getConnectivity() {
  return state
}

// The service worker adds this header when it answers with a saved copy.
export function reportResponse(response: Response) {
  update({ showingSavedData: response.headers.get('X-Served-From') === 'cache' })
}

// navigator.onLine can say "online" without a real connection, so "Retry connection" makes
// a real request. The ?probe part tells the service worker to skip its cache.
export async function checkConnection(): Promise<boolean> {
  try {
    await fetch(`${import.meta.env.BASE_URL}manifest.json?probe=${Date.now()}`, { cache: 'no-store' })
    update({ online: true })
    return true
  } catch {
    update({ online: false })
    return false
  }
}
