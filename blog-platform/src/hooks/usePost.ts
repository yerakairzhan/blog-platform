import { useEffect } from 'react'
import {
  fetchPostDetails,
  getEntryStatus,
  selectPostDetailsInvalidatedAt,
  selectPostEntry,
} from '../features/postDetails/postDetailsSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

// Loads one post (with author and comments) into the store, saved under its id.
export function usePost(postId: number) {
  const dispatch = useAppDispatch()
  const entry = useAppSelector((state) => selectPostEntry(state, postId))
  const invalidatedAt = useAppSelector(selectPostDetailsInvalidatedAt)

  useEffect(() => {
    const request = dispatch(fetchPostDetails(postId))
    // Cleanup: when the id changes or the page closes, the old request is cancelled,
    // so a slow answer for an old post can never replace the current one.
    return () => request.abort()
  }, [dispatch, postId, invalidatedAt])

  return {
    data: entry?.data ?? null,
    status: getEntryStatus(entry),
    error: entry?.error ?? '',
    retry: () => dispatch(fetchPostDetails(postId)),
  }
}
