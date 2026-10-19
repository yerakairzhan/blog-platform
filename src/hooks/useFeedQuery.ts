import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import type { SortKey, SourceFilter } from '../lib/feed'

export interface FeedQuery {
  search: string
  tag: string
  source: SourceFilter
  sort: SortKey
  page: number
  pageSize: number
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most liked' },
  { value: 'views', label: 'Most viewed' },
  { value: 'title', label: 'Title A–Z' },
]

export const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'All posts' },
  { value: 'mine', label: 'Written by you' },
  { value: 'liked', label: 'Liked by you' },
]

export const PAGE_SIZES = [6, 12, 24]

const DEFAULTS: FeedQuery = {
  search: '',
  tag: '',
  source: 'all',
  sort: 'latest',
  page: 1,
  pageSize: 12,
}

function pick<T extends string>(value: string | null, allowed: T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback
}

// The URL is user-editable, so every value is validated and falls back to a default.
function parse(params: URLSearchParams): FeedQuery {
  const page = Number(params.get('page'))
  const pageSize = Number(params.get('size'))
  return {
    search: params.get('q') ?? '',
    tag: params.get('tag') ?? '',
    source: pick(params.get('show'), SOURCE_OPTIONS.map((o) => o.value), DEFAULTS.source),
    sort: pick(params.get('sort'), SORT_OPTIONS.map((o) => o.value), DEFAULTS.sort),
    page: Number.isInteger(page) && page > 0 ? page : DEFAULTS.page,
    pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULTS.pageSize,
  }
}

// Defaults are left out to keep shared links short.
function serialize(query: FeedQuery): URLSearchParams {
  const params = new URLSearchParams()
  if (query.search) params.set('q', query.search)
  if (query.tag) params.set('tag', query.tag)
  if (query.source !== DEFAULTS.source) params.set('show', query.source)
  if (query.sort !== DEFAULTS.sort) params.set('sort', query.sort)
  if (query.pageSize !== DEFAULTS.pageSize) params.set('size', String(query.pageSize))
  if (query.page > 1) params.set('page', String(query.page))
  return params
}

/**
 * Feed search/filter/sort/page state, stored in the URL query string.
 * It survives opening a post and pressing Back, and filtered views can be shared as links.
 */
export function useFeedQuery() {
  const [params, setParams] = useSearchParams()
  const query = parse(params)

  const updateQuery = useCallback(
    (patch: Partial<FeedQuery>) => {
      // `page: 1` comes before the patch: any change except paging starts from the first page.
      // `prev` is the URL from the last render (React Router does not queue these like
      // setState), so flushSync re-renders right away. Otherwise two quick changes, e.g.
      // the search debounce firing just as a filter changes, would read the same stale
      // `prev` and the second would undo the first.
      setParams((prev) => serialize({ ...parse(prev), page: 1, ...patch }), {
        replace: true,
        flushSync: true,
      })
    },
    [setParams],
  )

  const resetQuery = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true, flushSync: true })
  }, [setParams])

  // Filters narrow the result set; sort and page size only change how it is shown.
  const isFiltered = query.search !== '' || query.tag !== '' || query.source !== DEFAULTS.source
  // Anything differs from the defaults (defaults are never written to the URL).
  const canReset = params.toString() !== ''

  return { query, updateQuery, resetQuery, isFiltered, canReset }
}
