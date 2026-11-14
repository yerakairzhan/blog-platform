import { useQueryClient } from '@tanstack/react-query'
import { useConnectivity } from '../hooks/useConnectivity'

// Small "Online / Offline" label for the header.
export function ConnectionIndicator() {
  const { online } = useConnectivity()

  return (
    <span className={online ? 'status status-online' : 'status status-offline'} role="status">
      {online ? 'Online' : 'Offline'}
    </span>
  )
}

// Bar under the header: shown while offline, or while the data on screen is a saved copy.
export function ConnectionNotice() {
  const { online, showingSavedData } = useConnectivity()
  const queryClient = useQueryClient()

  if (!online) {
    return (
      <div className="notice notice-offline">
        You are offline. Pages and posts you have already opened are still available.
      </div>
    )
  }
  if (showingSavedData) {
    return (
      <div className="notice">
        <span>Showing saved data.</span>
        <button onClick={() => queryClient.invalidateQueries()}>Refresh</button>
      </div>
    )
  }
  return null
}
