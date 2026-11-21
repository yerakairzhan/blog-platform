import { useState } from 'react'
import { Link } from 'react-router'
import { Message } from '../components/Message'
import { SelectField } from '../components/SelectField'
import { selectAllTags, selectPostStats } from '../features/posts/postsSelectors'
import { useConnectivity } from '../hooks/useConnectivity'
import { usePosts } from '../hooks/usePosts'
import { useAppSelector } from '../store/hooks'
import OfflinePage from './OfflinePage'

const TOP_TAGS_COUNT = 5

export default function DashboardPage() {
  const { status, error, retry } = usePosts()
  const { online } = useConnectivity()
  const [tag, setTag] = useState('')

  // The tag filter changes every number on this page. The numbers come from a memoized
  // selector, so they are recalculated only when the posts or the tag change.
  const allTags = useAppSelector(selectAllTags)
  const tagOptions = [{ value: '', label: 'All tags' }, ...allTags.map((name) => ({ value: name, label: name }))]
  const { totalPosts, totalLikes, totalViews, averageLikes, mostViewed, topTags: allTopTags, lowLikes, mediumLikes, highLikes } =
    useAppSelector((state) => selectPostStats(state, tag))
  const topTags = allTopTags.slice(0, TOP_TAGS_COUNT)

  return (
    <div>
      <h1>Dashboard</h1>

      {status === 'loading' && <Message text="Loading statistics..." />}

      {status === 'error' && !online && <OfflinePage />}

      {status === 'error' && online && (
        <Message text={`Could not load posts. ${error}`}>
          <button onClick={retry}>Try again</button>
        </Message>
      )}

      {status === 'success' && (
        <>
          <div className="toolbar">
            <SelectField label="Tag" value={tag} options={tagOptions} onChange={setTag} />
          </div>

          <div className="stats">
            <div className="stat">
              <span className="stat-value">{totalPosts}</span>
              <span className="muted">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-value">{totalLikes}</span>
              <span className="muted">Total likes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{totalViews}</span>
              <span className="muted">Total views</span>
            </div>
            <div className="stat">
              <span className="stat-value">{averageLikes}</span>
              <span className="muted">Average likes per post</span>
            </div>
          </div>

          {mostViewed && (
            <p>
              Most viewed post: <Link to={`/posts/${mostViewed.id}`}>{mostViewed.title}</Link> (
              {mostViewed.views} views)
            </p>
          )}

          <h2>Posts by tag (top {TOP_TAGS_COUNT})</h2>
          <ul>
            {topTags.map(([name, count]) => (
              <li key={name}>
                <Link to={`/posts?tag=${encodeURIComponent(name)}`}>#{name}</Link>: {count} posts
              </li>
            ))}
          </ul>

          <h2>Posts by number of likes</h2>
          <ul>
            <li>Under 100 likes: {lowLikes}</li>
            <li>100-299 likes: {mediumLikes}</li>
            <li>300+ likes: {highLikes}</li>
          </ul>

          <p>
            <Link to={tag === '' ? '/posts' : `/posts?tag=${encodeURIComponent(tag)}`}>
              See these posts →
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
