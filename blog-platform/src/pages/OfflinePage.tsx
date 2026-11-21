import { useState } from 'react'
import { useNavigate } from 'react-router'
import { checkConnection } from '../services/connectivity'
import { dataInvalidated } from '../store/actions'
import { useAppDispatch } from '../store/hooks'

// Shown on /offline, and in place of a page whose data could not be loaded while offline.
export default function OfflinePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [checking, setChecking] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleRetry() {
    setChecking(true)
    setFailed(false)
    const online = await checkConnection()
    setChecking(false)

    if (online) {
      dispatch(dataInvalidated()) // load fresh data now that we are back
      // on /offline there is nothing to show, so go to the posts
      if (window.location.hash.startsWith('#/offline')) navigate('/posts', { replace: true })
    } else {
      setFailed(true)
    }
  }

  return (
    <div className="message offline-page">
      <h1>You are offline</h1>
      <p>
        This page needs an internet connection. Pages and posts you have already opened are still
        available.
      </p>
      <button className="primary" onClick={handleRetry} disabled={checking}>
        {checking ? 'Checking...' : 'Retry connection'}
      </button>
      {failed && (
        <p className="error" role="status">
          Still offline. Try again in a moment.
        </p>
      )}
    </div>
  )
}
