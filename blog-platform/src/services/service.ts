import { getLocalPosts, saveLocalPost } from '../localPosts'
import { reportResponse } from './connectivity'
import type { Comment, Post, User } from '../types'

const BASE_URL = 'https://dummyjson.com'

// A failed fetch (no network) throws a TypeError with an unhelpful message.
async function request(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error(navigator.onLine ? 'The server could not be reached.' : 'No internet connection.')
  }
}

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await request(BASE_URL + path, { signal })
  reportResponse(response) // tells the app if this is a saved copy from the service worker
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
  const response = await request(BASE_URL + '/posts/add', {
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

// All posts: the ones written in this browser first, then the ones from the API.
export async function loadPosts(signal: AbortSignal): Promise<Post[]> {
  const apiPosts = await fetchPosts(signal)
  return [...getLocalPosts(), ...apiPosts]
}

// One post with its author and comments. Posts written in this browser are not on the server.
export async function loadPostDetails(id: number, signal: AbortSignal) {
  const localPost = getLocalPosts().find((post) => post.id === id)
  if (localPost) {
    return { post: localPost, author: null, comments: [] as Comment[] }
  }

  const post = await fetchPost(id, signal)
  const [author, comments] = await Promise.all([
    fetchUser(post.userId, signal),
    fetchComments(id, signal),
  ])
  return { post, author, comments }
}

// Sends the post to the API and keeps a copy in this browser (DummyJSON does not save it).
export async function publishPost(input: { title: string; body: string; tags: string[] }) {
  const saved = await createPost(input)
  const newPost: Post = {
    id: Date.now(), // unique id that never clashes with DummyJSON ids
    title: saved.title,
    body: saved.body,
    tags: saved.tags,
    reactions: { likes: 0, dislikes: 0 },
    views: 0,
    userId: 0,
    isLocal: true,
  }
  saveLocalPost(newPost)
  return newPost
}
