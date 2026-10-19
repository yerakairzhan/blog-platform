export type LoadStatus = 'loading' | 'error' | 'success'

export interface Post {
  id: number
  title: string
  body: string
  tags: string[]
  likes: number
  dislikes: number
  views: number
  userId: number
  /** Written in this browser (kept in localStorage), not on DummyJSON. */
  isLocal: boolean
  likedByMe: boolean
}

export interface Author {
  id: number
  name: string
  username: string
  avatarUrl: string | null
}

export interface Comment {
  id: number
  postId: number
  body: string
  likes: number
  authorName: string
  authorUsername: string
  isLocal: boolean
}

export interface PostDraft {
  title: string
  body: string
  tags: string[]
}
