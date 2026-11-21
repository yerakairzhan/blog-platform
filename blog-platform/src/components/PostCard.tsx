import { Link } from 'react-router'
import type { Post } from '../types'
import { TagList } from './TagList'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const preview = post.body.length > 150 ? post.body.slice(0, 150) + '...' : post.body

  return (
    <article className="post-card">
      <h2>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <p>{preview}</p>
      <TagList tags={post.tags} />
      <p className="muted">
        {post.reactions.likes} likes · {post.views} views
        {post.isLocal && ' · Your post'}
      </p>
    </article>
  )
}
