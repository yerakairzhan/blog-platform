import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { Author, Post } from '../types'
import { AuthorLine } from './AuthorLine'
import { CommentSection } from './CommentSection'
import { Icon } from './Icon'
import { LikeButton } from './LikeButton'
import { TagList } from './TagList'
import styles from './PostDetail.module.css'

interface PostDetailProps {
  post: Post
  author: Author
  previous: Post | undefined
  next: Post | undefined
  backTo: string
  onToggleLike: (id: number) => void
  onDelete: (id: number) => void
}

/**
 * The parent renders this with key={post.id}. Without the key, React would reuse this
 * instance for the next post and keep `confirmingDelete` (and the comment draft) from the old one.
 */
export function PostDetail({ post, author, previous, next, backTo, onToggleLike, onDelete }: PostDetailProps) {
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleDelete() {
    onDelete(post.id)
    navigate(backTo)
  }

  return (
    <article className={styles.article}>
      <Link to={backTo} className={styles.back}>
        ← Back to feed
      </Link>

      <header className={styles.header}>
        <TagList tags={post.tags} />
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.byline}>
          <AuthorLine author={author} size="large" />
          <div className={styles.stats}>
            <span className={styles.stat}>
              <Icon name="eye" size={16} /> {post.views.toLocaleString()} views
            </span>
            <span className={styles.stat}>{post.dislikes.toLocaleString()} dislikes</span>
            <LikeButton liked={post.likedByMe} count={post.likes} onToggle={() => onToggleLike(post.id)} />
          </div>
        </div>
      </header>

      <p className={styles.body}>{post.body}</p>

      {post.isLocal && (
        <div className={styles.ownerBar}>
          <span>You wrote this post. It's stored in this browser.</span>
          {confirmingDelete ? (
            <span className={styles.confirm}>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Yes, delete
              </button>
            </span>
          ) : (
            <button type="button" className="btn" onClick={() => setConfirmingDelete(true)}>
              Delete post
            </button>
          )}
        </div>
      )}

      <nav className={styles.pager} aria-label="More posts">
        {previous && (
          <Link to={`/posts/${previous.id}`} state={{ backTo }} className={styles.pagerLink}>
            <span className={styles.pagerLabel}>← Previous</span>
            <span className={styles.pagerTitle}>{previous.title}</span>
          </Link>
        )}
        {next && (
          <Link to={`/posts/${next.id}`} state={{ backTo }} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span className={styles.pagerLabel}>Next →</span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        )}
      </nav>

      <CommentSection post={post} />
    </article>
  )
}
