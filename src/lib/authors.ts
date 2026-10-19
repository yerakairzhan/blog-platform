import type { Author } from '../types'

/** The visitor of this browser. Posts and comments they write use this id. */
export const CURRENT_USER: Author = {
  id: 0,
  name: 'You',
  username: 'you',
  avatarUrl: null,
}

const UNKNOWN_AUTHOR: Author = {
  id: -1,
  name: 'Unknown author',
  username: 'unknown',
  avatarUrl: null,
}

export function getAuthor(authors: Map<number, Author>, userId: number): Author {
  if (userId === CURRENT_USER.id) return CURRENT_USER
  return authors.get(userId) ?? UNKNOWN_AUTHOR
}
