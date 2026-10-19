import type { Comment } from '../types'

export const STORAGE_KEYS = {
  posts: 'inkwell:posts',
  likes: 'inkwell:likes',
  comments: 'inkwell:comments',
} as const

// localStorage can throw (private mode, quota, blocked storage); the app must keep working.
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Not persisting is acceptable; the in-memory state is still correct.
  }
}

type CommentsByPost = Record<string, Comment[]>

export function readLocalComments(postId: number): Comment[] {
  return readJson<CommentsByPost>(STORAGE_KEYS.comments, {})[postId] ?? []
}

export function removeLocalComments(postId: number): void {
  const { [postId]: _removed, ...rest } = readJson<CommentsByPost>(STORAGE_KEYS.comments, {})
  writeJson(STORAGE_KEYS.comments, rest)
}

export function saveLocalComment(comment: Comment): void {
  const all = readJson<CommentsByPost>(STORAGE_KEYS.comments, {})
  const forPost = all[comment.postId] ?? []
  writeJson(STORAGE_KEYS.comments, { ...all, [comment.postId]: [...forPost, comment] })
}
