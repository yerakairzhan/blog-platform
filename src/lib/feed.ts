import type { Post } from '../types'

export type SortKey = 'latest' | 'popular' | 'views' | 'title'
export type SourceFilter = 'all' | 'mine' | 'liked'

export interface FeedFilters {
  search: string
  tag: string
  source: SourceFilter
}

export function filterPosts(posts: Post[], { search, tag, source }: FeedFilters): Post[] {
  const needle = search.trim().toLowerCase()

  return posts.filter((post) => {
    if (source === 'mine' && !post.isLocal) return false
    if (source === 'liked' && !post.likedByMe) return false
    if (tag && !post.tags.includes(tag)) return false
    if (!needle) return true
    return (
      post.title.toLowerCase().includes(needle) ||
      post.body.toLowerCase().includes(needle) ||
      post.tags.some((t) => t.includes(needle))
    )
  })
}

// Ties fall back to id so the order is stable between renders.
const comparators: Record<SortKey, (a: Post, b: Post) => number> = {
  // Local posts use Date.now() as id, so they always count as the newest.
  latest: (a, b) => b.id - a.id,
  popular: (a, b) => b.likes - a.likes || b.id - a.id,
  views: (a, b) => b.views - a.views || b.id - a.id,
  title: (a, b) => a.title.localeCompare(b.title) || a.id - b.id,
}

export function sortPosts(posts: Post[], sort: SortKey): Post[] {
  // Copy first: Array.prototype.sort mutates, and `posts` belongs to React state.
  return [...posts].sort(comparators[sort])
}

export interface PageSlice<T> {
  items: T[]
  page: number
  totalPages: number
  total: number
  /** 1-based index of the first item shown, 0 when empty. */
  start: number
  end: number
}

export function paginate<T>(items: T[], page: number, pageSize: number): PageSlice<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  // Clamp, e.g. when a filter shrinks the list while the URL still says page 9.
  const current = Math.min(Math.max(1, page), totalPages)
  const startIndex = (current - 1) * pageSize
  const pageItems = items.slice(startIndex, startIndex + pageSize)

  return {
    items: pageItems,
    page: current,
    totalPages,
    total: items.length,
    start: pageItems.length > 0 ? startIndex + 1 : 0,
    end: startIndex + pageItems.length,
  }
}

export interface TagCount {
  tag: string
  count: number
}

/** Tags ordered by how many posts use them, then alphabetically. */
export function countTags(posts: Post[]): TagCount[] {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}
