import type { Comment, Post, User } from './types'

const BASE_URL = 'https://dummyjson.com'

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(BASE_URL + path, { signal })
  if (!response.ok) {
    throw new Error(response.status === 404 ? 'Not found.' : `Request failed (${response.status}).`)
  }
  return response.json()
}

// limit=0 asks DummyJSON for all posts at once
export async function fetchPosts(signal: AbortSignal): Promise<Post[]> {
  const data = await getJson<{ posts: Post[] }>('/posts?limit=0', signal)
  return data.posts
}

export function fetchPost(id: number, signal: AbortSignal): Promise<Post> {
  return getJson<Post>(`/posts/${id}`, signal)
}

export function fetchUser(id: number, signal: AbortSignal): Promise<User> {
  return getJson<User>(`/users/${id}`, signal)
}

export async function fetchComments(postId: number, signal: AbortSignal): Promise<Comment[]> {
  const data = await getJson<{ comments: Comment[] }>(`/posts/${postId}/comments`, signal)
  return data.comments
}

// DummyJSON checks the post and sends it back, but does not actually save it.
export async function createPost(post: { title: string; body: string; tags: string[] }) {
  const response = await fetch(BASE_URL + '/posts/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...post, userId: 1 }),
  })
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}).`)
  }
  return response.json()
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.'
}
