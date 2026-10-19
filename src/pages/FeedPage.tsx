import { useEffect, useState } from 'react'
import { fetchPosts, getErrorMessage } from '../api'
import { Message } from '../components/Message'
import { Pagination } from '../components/Pagination'
import { PostCard } from '../components/PostCard'
import { SearchInput } from '../components/SearchInput'
import { SelectField } from '../components/SelectField'
import { DEFAULT_FILTERS, PAGE_SIZE, SORT_OPTIONS, applyFilters, getAllTags } from '../filters'
import { getLocalPosts } from '../localPosts'
import type { Filters, Post, Status } from '../types'

interface FeedPageProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function FeedPage({ filters, onFiltersChange }: FeedPageProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  // Load posts on mount, and again whenever "Try again" increases reloadCount.
  useEffect(() => {
    const controller = new AbortController()

    fetchPosts(controller.signal)
      .then((apiPosts) => {
        setPosts([...getLocalPosts(), ...apiPosts])
        setStatus('success')
      })
      .catch((err) => {
        // The request was cancelled because we left the page: ignore it.
        if (controller.signal.aborted) return
        setError(getErrorMessage(err))
        setStatus('error')
      })

    // Cleanup: cancel the request if the page is closed before it finishes.
    return () => controller.abort()
  }, [reloadCount])

  function handleRetry() {
    setStatus('loading')
    setReloadCount(reloadCount + 1)
  }

  // Changing search, tag or sort always goes back to page 1.
  function changeFilter(name: 'search' | 'tag' | 'sort', value: string) {
    onFiltersChange({ ...filters, [name]: value, page: 1 })
  }

  function changePage(page: number) {
    onFiltersChange({ ...filters, page })
    window.scrollTo(0, 0)
  }

  // These values are calculated from posts + filters on every render, so they are not state.
  const tagOptions = [
    { value: '', label: 'All tags' },
    ...getAllTags(posts).map((tag) => ({ value: tag, label: tag })),
  ]
  const visiblePosts = applyFilters(posts, filters)
  const totalPages = Math.max(1, Math.ceil(visiblePosts.length / PAGE_SIZE))
  const page = Math.min(filters.page, totalPages)
  const start = (page - 1) * PAGE_SIZE
  const pagePosts = visiblePosts.slice(start, start + PAGE_SIZE)

  return (
    <div>
      <h1>All posts</h1>

      <div className="toolbar">
        <SearchInput value={filters.search} onChange={(value) => changeFilter('search', value)} />
        <SelectField
          label="Tag"
          value={filters.tag}
          options={tagOptions}
          onChange={(value) => changeFilter('tag', value)}
        />
        <SelectField
          label="Sort by"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(value) => changeFilter('sort', value)}
        />
        <button onClick={() => onFiltersChange(DEFAULT_FILTERS)}>Reset</button>
      </div>

      {status === 'loading' && <Message text="Loading posts..." />}

      {status === 'error' && (
        <Message text={`Could not load posts. ${error}`}>
          <button onClick={handleRetry}>Try again</button>
        </Message>
      )}

      {status === 'success' && visiblePosts.length === 0 && (
        <Message text="No posts match your search." />
      )}

      {status === 'success' && visiblePosts.length > 0 && (
        <>
          <p className="muted">
            Showing {start + 1}-{start + pagePosts.length} of {visiblePosts.length} posts
          </p>
          {pagePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
        </>
      )}
    </div>
  )
}
