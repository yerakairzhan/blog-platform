import { useCallback } from 'react'
import { Link } from 'react-router'
import { FeedToolbar } from '../components/FeedToolbar'
import { Pagination } from '../components/Pagination'
import { Panel } from '../components/Panel'
import { PostGrid, PostGridSkeleton } from '../components/PostGrid'
import { StatusMessage } from '../components/StatusMessage'
import { TopTags } from '../components/TopTags'
import { usePosts } from '../context/PostsContext'
import { useFeedQuery } from '../hooks/useFeedQuery'
import type { FeedQuery } from '../hooks/useFeedQuery'
import { countTags, filterPosts, paginate, sortPosts } from '../lib/feed'
import type { PageSlice } from '../lib/feed'
import type { Post } from '../types'
import styles from './FeedPage.module.css'

const TOP_TAGS_LIMIT = 12

export function FeedPage() {
  const { status, error, posts, authors, toggleLike, retry } = usePosts()
  const { query, updateQuery, resetQuery, isFiltered, canReset } = useFeedQuery()

  // Stable while the URL is unchanged, so SearchBar's debounce timer isn't restarted by
  // unrelated re-renders (e.g. a like).
  const handleSearch = useCallback((search: string) => updateQuery({ search }), [updateQuery])
  const handleTag = useCallback((tag: string) => updateQuery({ tag }), [updateQuery])

  // Everything below is derived from posts + query on each render; none of it is state.
  const tagCounts = countTags(posts)
  const results = sortPosts(filterPosts(posts, query), query.sort)
  const slice = paginate(results, query.page, query.pageSize)
  const writtenCount = posts.filter((post) => post.isLocal).length
  const likedCount = posts.filter((post) => post.likedByMe).length

  function renderResults() {
    if (status === 'loading') {
      return (
        <>
          <p role="status" className="visually-hidden">
            Loading posts…
          </p>
          <PostGridSkeleton count={6} />
        </>
      )
    }

    if (status === 'error') {
      return (
        <StatusMessage
          variant="error"
          title="Couldn't load the stories"
          action={
            <button type="button" className="btn btn-primary" onClick={retry}>
              Try again
            </button>
          }
        >
          {error}
        </StatusMessage>
      )
    }

    if (slice.total === 0) {
      return <EmptyResults query={query} writtenCount={writtenCount} likedCount={likedCount} onReset={resetQuery} />
    }

    return (
      <>
        <ResultsSummary slice={slice} search={query.search} isFiltered={isFiltered} />
        <PostGrid
          posts={slice.items}
          authors={authors}
          activeTag={query.tag}
          onToggleLike={toggleLike}
          onTagClick={handleTag}
        />
        <Pagination page={slice.page} totalPages={slice.totalPages} onPageChange={(page) => updateQuery({ page })} />
      </>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heading}>Stories worth a slow read</h1>
        <p className={styles.lead}>
          Browse short stories from the community, follow the tags you love, and add your own.
        </p>
      </section>

      <div className={styles.layout}>
        <div className={styles.content}>
          <FeedToolbar
            query={query}
            tags={tagCounts}
            canReset={canReset}
            onSearch={handleSearch}
            onChange={updateQuery}
            onReset={resetQuery}
          />
          {renderResults()}
        </div>

        <aside className={styles.sidebar}>
          <Panel title="Popular tags">
            {status === 'success' ? (
              <TopTags tags={tagCounts.slice(0, TOP_TAGS_LIMIT)} activeTag={query.tag} onSelect={handleTag} />
            ) : (
              <p className={styles.muted}>{status === 'loading' ? 'Loading tags…' : 'Tags are unavailable.'}</p>
            )}
          </Panel>
          <Panel title="At a glance">
            <dl className={styles.stats}>
              <div>
                <dt>Stories</dt>
                <dd>{status === 'success' ? posts.length : '–'}</dd>
              </div>
              <div>
                <dt>Writers</dt>
                <dd>{status === 'success' ? authors.size : '–'}</dd>
              </div>
              <div>
                <dt>Written by you</dt>
                <dd>{writtenCount}</dd>
              </div>
              <div>
                <dt>Liked by you</dt>
                <dd>{likedCount}</dd>
              </div>
            </dl>
          </Panel>
        </aside>
      </div>
    </div>
  )
}

interface ResultsSummaryProps {
  slice: PageSlice<Post>
  search: string
  isFiltered: boolean
}

function ResultsSummary({ slice, search, isFiltered }: ResultsSummaryProps) {
  return (
    <p className={styles.summary} role="status">
      Showing <strong>{slice.start}</strong>–<strong>{slice.end}</strong> of <strong>{slice.total}</strong>{' '}
      {isFiltered && 'matching '}
      {slice.total === 1 ? 'story' : 'stories'}
      {search.trim() && <> for “{search.trim()}”</>}
    </p>
  )
}

interface EmptyResultsProps {
  query: FeedQuery
  writtenCount: number
  likedCount: number
  onReset: () => void
}

function EmptyResults({ query, writtenCount, likedCount, onReset }: EmptyResultsProps) {
  if (query.source === 'mine' && writtenCount === 0) {
    return (
      <StatusMessage
        variant="empty"
        title="You haven't written anything yet"
        action={
          <Link to="/posts/new" className="btn btn-primary">
            Write your first post
          </Link>
        }
      >
        Your posts will show up here and in the main feed.
      </StatusMessage>
    )
  }

  if (query.source === 'liked' && likedCount === 0) {
    return (
      <StatusMessage
        variant="empty"
        title="No liked stories yet"
        action={
          <button type="button" className="btn" onClick={onReset}>
            Browse all stories
          </button>
        }
      >
        Tap the heart on any story to keep it here.
      </StatusMessage>
    )
  }

  return (
    <StatusMessage
      variant="empty"
      title="No stories match your filters"
      action={
        <button type="button" className="btn" onClick={onReset}>
          Reset filters
        </button>
      }
    >
      Try a different search term or another tag.
    </StatusMessage>
  )
}
