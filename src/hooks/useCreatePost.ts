import { useMutation, useQueryClient } from '@tanstack/react-query'
import { publishPost } from '../services/service'
import { POSTS_KEY } from './usePosts'

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishPost,
    // The cached list is now out of date, so it is marked as stale and loaded again.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: POSTS_KEY }),
  })
}
