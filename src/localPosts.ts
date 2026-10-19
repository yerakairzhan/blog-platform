import type { Post } from './types'

// DummyJSON does not save new posts, so we keep them in localStorage.
const STORAGE_KEY = 'blog-platform-posts'

export function getLocalPosts(): Post[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveLocalPost(post: Post) {
  const posts = [post, ...getLocalPosts()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}
