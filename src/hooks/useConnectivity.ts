import { useSyncExternalStore } from 'react'
import { getConnectivity, subscribeToConnectivity } from '../services/connectivity'

export function useConnectivity() {
  return useSyncExternalStore(subscribeToConnectivity, getConnectivity)
}
