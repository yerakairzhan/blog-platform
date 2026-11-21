import { useConnectivity } from '../hooks/useConnectivity'
import { dataInvalidated } from '../store/actions'
import { useAppDispatch } from '../store/hooks'

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
  const dispatch = useAppDispatch()

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
        <button onClick={() => dispatch(dataInvalidated())}>Refresh</button>
      </div>
    )
  }
  return null
}
