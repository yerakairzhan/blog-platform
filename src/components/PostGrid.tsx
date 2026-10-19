import { getAuthor } from '../lib/authors'
import type { Author, Post } from '../types'
import { PostCard } from './PostCard'
import styles from './PostGrid.module.css'

interface PostGridProps {
  posts: Post[]
  authors: Map<number, Author>
  activeTag: string
  onToggleLike: (id: number) => void
  onTagClick: (tag: string) => void
}

export function PostGrid({ posts, authors, activeTag, onToggleLike, onTagClick }: PostGridProps) {
  return (
    <ul className={styles.grid}>
      {posts.map((post) => (
        // post.id is unique and stable, so when sorting or filtering reorders the list React
        // moves each card (and its DOM, e.g. focus) with its post instead of re-using the
        // card at the same index for a different post.
        <li key={post.id}>
          <PostCard
            post={post}
            author={getAuthor(authors, post.userId)}
            activeTag={activeTag}
            onToggleLike={onToggleLike}
            onTagClick={onTagClick}
          />
        </li>
      ))}
    </ul>
  )
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className={styles.grid} aria-hidden="true">
      {/* A fixed placeholder list that never reorders, so index keys are fine here. */}
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={styles.skeleton}>
          <span className={styles.lineShort} />
          <span className={styles.lineTitle} />
          <span className={styles.line} />
          <span className={styles.line} />
        </li>
      ))}
    </ul>
  )
}
