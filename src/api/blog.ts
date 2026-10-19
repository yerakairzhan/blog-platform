import type { Author, Comment, Post, PostDraft } from '../types'
import { request } from './client'

// DummyJSON requires an existing user id when creating a post.
const DEMO_USER_ID = 1

interface RawPost {
  id: number
  title: string
  body: string
  tags: string[]
  reactions: { likes: number; dislikes: number }
  views: number
  userId: number
}

interface RawUser {
  id: number
  firstName: string
  lastName: string
  username: string
  image: string
}

interface RawComment {
  id: number
  body: string
  postId: number
  likes: number
  user: { id: number; username: string; fullName: string }
}

interface RawCreatedPost {
  id: number
  title: string
  body: string
  tags?: string[]
}

function toPost(raw: RawPost): Post {
  return {
    id: raw.id,
    title: raw.title,
    body: raw.body,
    tags: raw.tags,
    likes: raw.reactions.likes,
    dislikes: raw.reactions.dislikes,
    views: raw.views,
    userId: raw.userId,
    isLocal: false,
    likedByMe: false,
  }
}

/** All posts in one request (`limit=0`), so search/filter/sort/paginate work on the full set. */
export async function fetchPosts(signal: AbortSignal): Promise<Post[]> {
  const data = await request<{ posts: RawPost[] }>('/posts?limit=0', { signal })
  return data.posts.map(toPost)
}

export async function fetchAuthors(signal: AbortSignal): Promise<Map<number, Author>> {
  const data = await request<{ users: RawUser[] }>(
    '/users?limit=0&select=firstName,lastName,username,image',
    { signal },
  )
  return new Map(
    data.users.map((user) => [
      user.id,
      {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        avatarUrl: user.image,
      },
    ]),
  )
}

export async function fetchComments(postId: number, signal: AbortSignal): Promise<Comment[]> {
  const data = await request<{ comments: RawComment[] }>(`/posts/${postId}/comments?limit=0`, {
    signal,
  })
  return data.comments.map((comment) => ({
    id: comment.id,
    postId: comment.postId,
    body: comment.body,
    likes: comment.likes,
    authorName: comment.user.fullName,
    authorUsername: comment.user.username,
    isLocal: false,
  }))
}

/**
 * DummyJSON validates the new post and echoes it back, but does not store it.
 * The caller is responsible for keeping the returned post (see PostsContext).
 */
export async function createPost(draft: PostDraft): Promise<PostDraft> {
  const saved = await request<RawCreatedPost>('/posts/add', {
    method: 'POST',
    body: JSON.stringify({ ...draft, userId: DEMO_USER_ID }),
  })
  return { title: saved.title, body: saved.body, tags: saved.tags ?? draft.tags }
}
