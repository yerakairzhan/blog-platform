import type { Filters, Post } from './types'

export const PAGE_SIZE = 10

export const DEFAULT_FILTERS: Filters = {
  search: '',
  tag: '',
  minLikes: '',
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

export const MIN_LIKES_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '100', label: '100+ likes' },
  { value: '300', label: '300+ likes' },
  { value: '500', label: '500+ likes' },
]

// The URL is the source of truth: /posts?search=love&tag=history&page=2
export function getFiltersFromParams(params: URLSearchParams): Filters {
  const page = Number(params.get('page'))
  const hasValidPage = Number.isInteger(page) && page >= 1

  return {
    search: params.get('search') ?? DEFAULT_FILTERS.search,
    tag: params.get('tag') ?? DEFAULT_FILTERS.tag,
    minLikes: params.get('minLikes') ?? DEFAULT_FILTERS.minLikes,
    sort: params.get('sort') ?? DEFAULT_FILTERS.sort,
    page: hasValidPage ? page : 1,
  }
}

export function applyFilters(posts: Post[], filters: Filters): Post[] {
  const search = filters.search.trim().toLowerCase()
  const minLikes = Number(filters.minLikes) || 0

  const filtered = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search) || post.body.toLowerCase().includes(search)
    const matchesTag = filters.tag === '' || post.tags.includes(filters.tag)
    const matchesLikes = post.reactions.likes >= minLikes
    return matchesSearch && matchesTag && matchesLikes
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
