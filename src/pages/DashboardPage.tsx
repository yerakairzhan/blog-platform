import { useState } from 'react'
import { Link } from 'react-router'
import { Message } from '../components/Message'
import { SelectField } from '../components/SelectField'
import { getAllTags } from '../filters'
import { usePosts } from '../hooks/usePosts'

const TOP_TAGS_COUNT = 5

export default function DashboardPage() {
  const { posts, status, error, retry } = usePosts()
  const [tag, setTag] = useState('')

  // The tag filter changes every number on this page.
  const tagOptions = [
    { value: '', label: 'All tags' },
    ...getAllTags(posts).map((name) => ({ value: name, label: name })),
  ]
  const selectedPosts = tag === '' ? posts : posts.filter((post) => post.tags.includes(tag))

  // Statistics
  const totalPosts = selectedPosts.length
  const totalLikes = selectedPosts.reduce((sum, post) => sum + post.reactions.likes, 0)
  const totalViews = selectedPosts.reduce((sum, post) => sum + post.views, 0)
  const averageLikes = totalPosts === 0 ? 0 : Math.round(totalLikes / totalPosts)
  const mostViewed = [...selectedPosts].sort((a, b) => b.views - a.views)[0]

  // Breakdown 1: how many posts have each tag
  const tagCounts: Record<string, number> = {}
  for (const post of selectedPosts) {
    for (const postTag of post.tags) {
      tagCounts[postTag] = (tagCounts[postTag] ?? 0) + 1
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_TAGS_COUNT)

  // Breakdown 2: how many posts have few, some or many likes
  const lowLikes = selectedPosts.filter((post) => post.reactions.likes < 100).length
  const mediumLikes = selectedPosts.filter(
    (post) => post.reactions.likes >= 100 && post.reactions.likes < 300,
  ).length
  const highLikes = selectedPosts.filter((post) => post.reactions.likes >= 300).length

  return (
    <div>
      <h1>Dashboard</h1>

      {status === 'loading' && <Message text="Loading statistics..." />}

      {status === 'error' && (
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
