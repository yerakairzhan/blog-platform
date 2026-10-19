export interface Post {
  id: number
  title: string
  body: string
  tags: string[]
  reactions: { likes: number; dislikes: number }
  views: number
  userId: number
  isLocal?: boolean // true for posts created in this browser
}

export interface User {
  id: number
  firstName: string
  lastName: string
}

export interface Comment {
  id: number
  body: string
  user: { fullName: string }
}

export interface Filters {
  search: string
  tag: string
  sort: string
  page: number
}

export type Status = 'loading' | 'error' | 'success'
