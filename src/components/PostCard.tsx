import { Link, useLocation } from 'react-router'
import type { Author, Post } from '../types'
import { AuthorLine } from './AuthorLine'
import { Icon } from './Icon'
import { LikeButton } from './LikeButton'
import { TagList } from './TagList'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: Post
  author: Author
  activeTag: string
  onToggleLike: (id: number) => void
  onTagClick: (tag: string) => void
}

export function PostCard({ post, author, activeTag, onToggleLike, onTagClick }: PostCardProps) {
  const location = useLocation()

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <AuthorLine author={author} />
        {post.isLocal && <span className={styles.badge}>Your post</span>}
      </header>

      <h2 className={styles.title}>
        {/* The link's ::after covers the whole card; buttons sit above it via z-index. */}
        <Link
          className={styles.link}
          to={`/posts/${post.id}`}
          // Remember the current filters so "Back to feed" returns to the same view.
          state={{ backTo: `/${location.search}` }}
        >
          {post.title}
        </Link>
      </h2>
      <p className={styles.excerpt}>{post.body}</p>

      <TagList tags={post.tags} activeTag={activeTag} onTagClick={onTagClick} />

      <footer className={styles.footer}>
        <LikeButton liked={post.likedByMe} count={post.likes} onToggle={() => onToggleLike(post.id)} />
        <span className={styles.views}>
          <Icon name="eye" size={16} />
          {post.views.toLocaleString()}
          <span className="visually-hidden"> views</span>
        </span>
      </footer>
    </article>
  )
}
