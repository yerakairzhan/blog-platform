import { useSyncExternalStore } from 'react'
import { isUpdateAvailable, subscribeToUpdates } from '../services/serviceWorker'

export function useUpdateAvailable() {
  return useSyncExternalStore(subscribeToUpdates, isUpdateAvailable)
}
