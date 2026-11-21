import { useCallback } from 'react'
import {
  createPost,
  newPostReset,
  selectIsPublishing,
  selectPublishError,
} from '../features/newPost/newPostSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function useCreatePost() {
  const dispatch = useAppDispatch()
  const isPublishing = useAppSelector(selectIsPublishing)
  const error = useAppSelector(selectPublishError)

  return {
    // unwrap() returns the new post, or throws if publishing failed
    publish: (input: { title: string; body: string; tags: string[] }) =>
      dispatch(createPost(input)).unwrap(),
    isPublishing,
    error,
    reset: useCallback(() => dispatch(newPostReset()), [dispatch]),
  }
}
