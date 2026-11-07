import { useQuery } from '@tanstack/react-query'
import { loadPosts } from '../services/service'
import type { Status } from '../types'

// Query keys are used by React Query to store and find cached data.
export const POSTS_KEY = ['posts']

// Loads all posts. The result is cached, so going between Posts and Dashboard does not
// send a new request while the data is fresh. The signal cancels outdated requests.
export function usePosts() {
  const query = useQuery({
    queryKey: POSTS_KEY,
    queryFn: ({ signal }) => loadPosts(signal),
  })

  let status: Status = 'success'
  if (query.isPending) {
    status = 'loading'
  } else if (query.isError) {
    status = 'error'
  }

  return {
    posts: query.data ?? [],
    status,
    error: query.error ? query.error.message : '',
    retry: () => query.refetch(),
  }
}
