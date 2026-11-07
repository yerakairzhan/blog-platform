import { useQuery } from '@tanstack/react-query'
import { loadPostDetails } from '../services/service'

// Each post is cached under its own key: ['post', 5], ['post', 6], ...
export function usePost(postId: number) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: ({ signal }) => loadPostDetails(postId, signal),
  })
}
