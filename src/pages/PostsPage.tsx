import { useSearchParams } from 'react-router'
import { Message } from '../components/Message'
import { Pagination } from '../components/Pagination'
import { PostCard } from '../components/PostCard'
import { SearchInput } from '../components/SearchInput'
import { SelectField } from '../components/SelectField'
import {
  MIN_LIKES_OPTIONS,
  PAGE_SIZE,
  SORT_OPTIONS,
  applyFilters,
  getAllTags,
  getFiltersFromParams,
} from '../filters'
import { usePosts } from '../hooks/usePosts'

export default function PostsPage() {
  const { posts, status, error, retry } = usePosts()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = getFiltersFromParams(searchParams)

  // Changing search, tag, likes or sort updates the URL and goes back to page 1.
  function changeFilter(name: 'search' | 'tag' | 'minLikes' | 'sort', value: string) {
    const nextParams = new URLSearchParams(searchParams)
    if (value === '') {
      nextParams.delete(name)
    } else {
      nextParams.set(name, value)
    }
    nextParams.delete('page')
    // replace: typing in the search box should not add a history entry per letter
    setSearchParams(nextParams, { replace: true })
  }

  function changePage(page: number) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(page))
    setSearchParams(nextParams)
    window.scrollTo(0, 0)
  }

  function handleReset() {
    setSearchParams({})
  }

  // These values are calculated from posts + URL on every render, so they are not state.
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
          label="Likes"
          value={filters.minLikes}
          options={MIN_LIKES_OPTIONS}
          onChange={(value) => changeFilter('minLikes', value)}
        />
        <SelectField
          label="Sort by"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(value) => changeFilter('sort', value)}
        />
        <button onClick={handleReset}>Reset</button>
      </div>

      {status === 'loading' && <Message text="Loading posts..." />}

      {status === 'error' && (
        <Message text={`Could not load posts. ${error}`}>
          <button onClick={retry}>Try again</button>
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
