import { useEffect } from 'react'
import { fetchPosts } from '../features/posts/postsSlice'
import {
  selectAllPosts,
  selectPostsError,
  selectPostsInvalidatedAt,
  selectPostsStatus,
} from '../features/posts/postsSelectors'
import { useAppDispatch, useAppSelector } from '../store/hooks'

// Loads all posts into the store. The Posts page and the Dashboard share the same list, so
// moving between them does not send a new request while the list is fresh.
export function usePosts() {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const status = useAppSelector(selectPostsStatus)
  const error = useAppSelector(selectPostsError)
  const invalidatedAt = useAppSelector(selectPostsInvalidatedAt)

  // Runs on mount and again when the data is marked as out of date.
  useEffect(() => {
    const request = dispatch(fetchPosts())
    // Cleanup: cancel the request if the page is closed before it finishes.
    return () => request.abort()
  }, [dispatch, invalidatedAt])

  return {
    posts,
    status,
    error,
    retry: () => dispatch(fetchPosts({ force: true })),
  }
}
