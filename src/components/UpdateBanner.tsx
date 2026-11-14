import { useUpdateAvailable } from '../hooks/useUpdateAvailable'
import { applyUpdate } from '../services/serviceWorker'

// Shown when a new version of the app has been downloaded and is waiting.
export function UpdateBanner() {
  const updateAvailable = useUpdateAvailable()

  if (!updateAvailable) return null

  return (
    <div className="update-banner" role="alert">
      <span>A new version is available.</span>
      <button className="primary" onClick={applyUpdate}>
        Update now
      </button>
    </div>
  )
}
