import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createPost, fetchAuthors, fetchPosts } from '../api/blog'
import { errorMessage } from '../api/client'
import { CURRENT_USER } from '../lib/authors'
import { STORAGE_KEYS, readJson, removeLocalComments, writeJson } from '../lib/storage'
import type { Author, LoadStatus, Post, PostDraft } from '../types'

interface RemoteData {
  status: LoadStatus
  error: string | null
  posts: Post[]
  authors: Map<number, Author>
}

interface PostsContextValue {
  status: LoadStatus
  error: string | null
  /** Posts written here first, then DummyJSON posts, with the visitor's likes applied. */
  posts: Post[]
  authors: Map<number, Author>
  addPost: (draft: PostDraft) => Promise<Post>
  deletePost: (id: number) => void
  toggleLike: (id: number) => void
  retry: () => void
}

const PostsContext = createContext<PostsContextValue | null>(null)

/**
 * Lives above the routes so the feed, the post page and the editor share one copy
 * of the data and it is fetched once, not on every navigation.
 */
export function PostsProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<RemoteData>({
    status: 'loading',
    error: null,
    posts: [],
    authors: new Map(),
  })
  // Bumping this re-runs the fetch effect (used by "Try again").
  const [attempt, setAttempt] = useState(0)
  // Lazy initialisers: read localStorage once on mount, not on every render.
  const [localPosts, setLocalPosts] = useState<Post[]>(() => readJson(STORAGE_KEYS.posts, []))
  const [likedIds, setLikedIds] = useState<number[]>(() => readJson(STORAGE_KEYS.likes, []))

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([fetchPosts(controller.signal), fetchAuthors(controller.signal)])
      .then(([posts, authors]) => {
        setRemote({ status: 'success', error: null, posts, authors })
      })
      .catch((error: unknown) => {
        // Aborted by cleanup (unmount, StrictMode re-run, or a newer attempt): ignore.
        if (controller.signal.aborted) return
        setRemote((prev) => ({ ...prev, status: 'error', error: errorMessage(error) }))
      })

    return () => controller.abort()
  }, [attempt])

  useEffect(() => writeJson(STORAGE_KEYS.posts, localPosts), [localPosts])
  useEffect(() => writeJson(STORAGE_KEYS.likes, likedIds), [likedIds])

  const retry = useCallback(() => {
    // Both updates are batched into a single re-render.
    setRemote((prev) => ({ ...prev, status: 'loading', error: null }))
    setAttempt((n) => n + 1)
  }, [])

  const addPost = useCallback(async (draft: PostDraft) => {
    const saved = await createPost(draft)
    const post: Post = {
      ...saved,
      id: Date.now(),
      likes: 0,
      dislikes: 0,
      views: 0,
      userId: CURRENT_USER.id,
      isLocal: true,
      likedByMe: false,
    }
    setLocalPosts((prev) => [post, ...prev])
    return post
  }, [])

  const deletePost = useCallback((id: number) => {
    setLocalPosts((prev) => prev.filter((post) => post.id !== id))
    setLikedIds((prev) => prev.filter((likedId) => likedId !== id))
    removeLocalComments(id)
  }, [])

  const toggleLike = useCallback((id: number) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((likedId) => likedId !== id) : [...prev, id],
    )
  }, [])

  const posts = useMemo(() => {
    const liked = new Set(likedIds)
    return [...localPosts, ...remote.posts].map((post) =>
      // New object only for liked posts; the rest keep their identity.
      liked.has(post.id) ? { ...post, likes: post.likes + 1, likedByMe: true } : post,
    )
  }, [localPosts, remote.posts, likedIds])

  const value = useMemo<PostsContextValue>(
    () => ({
      status: remote.status,
      error: remote.error,
      posts,
      authors: remote.authors,
      addPost,
      deletePost,
      toggleLike,
      retry,
    }),
    [remote.status, remote.error, remote.authors, posts, addPost, deletePost, toggleLike, retry],
  )

  return <PostsContext value={value}>{children}</PostsContext>
}

export function usePosts(): PostsContextValue {
  const context = useContext(PostsContext)
  if (!context) throw new Error('usePosts must be used inside <PostsProvider>')
  return context
}
