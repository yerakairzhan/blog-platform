import { useEffect, useState } from 'react'
import { getLocalPosts } from '../localPosts'
import { fetchPosts, getErrorMessage } from '../services/service'
import type { Post, Status } from '../types'

// Loads all posts (plus the ones saved in this browser). Used by the list and the dashboard.
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  // Load posts on mount, and again whenever "Try again" increases reloadCount.
  useEffect(() => {
    const controller = new AbortController()

    fetchPosts(controller.signal)
      .then((apiPosts) => {
        setPosts([...getLocalPosts(), ...apiPosts])
        setStatus('success')
      })
      .catch((err) => {
        // The request was cancelled because we left the page: ignore it.
        if (controller.signal.aborted) return
        setError(getErrorMessage(err))
        setStatus('error')
      })

    // Cleanup: cancel the request if the page is closed before it finishes.
    return () => controller.abort()
  }, [reloadCount])

  function retry() {
    setStatus('loading')
    setReloadCount(reloadCount + 1)
  }

  return { posts, status, error, retry }
}
