import type { Filters, Post } from './types'

export const PAGE_SIZE = 10

export const DEFAULT_FILTERS: Filters = {
  search: '',
  tag: '',
  sort: 'newest',
  page: 1,
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'likes', label: 'Most liked' },
  { value: 'views', label: 'Most viewed' },
  { value: 'title', label: 'Title (A-Z)' },
]

export function applyFilters(posts: Post[], filters: Filters): Post[] {
  const search = filters.search.trim().toLowerCase()

  const filtered = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search) || post.body.toLowerCase().includes(search)
    const matchesTag = filters.tag === '' || post.tags.includes(filters.tag)
    return matchesSearch && matchesTag
  })

  // filter() returned a new array, so sorting it does not change the original posts
  return filtered.sort((a, b) => {
    switch (filters.sort) {
      case 'oldest':
        return a.id - b.id
      case 'likes':
        return b.reactions.likes - a.reactions.likes
      case 'views':
        return b.views - a.views
      case 'title':
        return a.title.localeCompare(b.title)
      default: // newest
        return b.id - a.id
    }
  })
}

export function getAllTags(posts: Post[]): string[] {
  const tags = new Set(posts.flatMap((post) => post.tags))
  return [...tags].sort()
}
