import { useEffect, useState } from 'react'
import { fetchComments } from '../api/blog'
import { errorMessage } from '../api/client'
import { CURRENT_USER } from '../lib/authors'
import { readLocalComments, saveLocalComment } from '../lib/storage'
import type { Comment, LoadStatus, Post } from '../types'
import { CommentForm } from './CommentForm'
import { Icon } from './Icon'
import styles from './Comments.module.css'

interface RemoteComments {
  status: LoadStatus
  comments: Comment[]
  error: string | null
}

interface CommentSectionProps {
  post: Post
}

/**
 * Rendered with key={post.id} by the parent, so moving to another post remounts it with
 * fresh state (no comments or half-typed draft carried over from the previous post).
 */
export function CommentSection({ post }: CommentSectionProps) {
  const [remote, setRemote] = useState<RemoteComments>(() =>
    // Posts written in this browser have no comments on the server.
    post.isLocal
      ? { status: 'success', comments: [], error: null }
      : { status: 'loading', comments: [], error: null },
  )
  const [localComments, setLocalComments] = useState<Comment[]>(() => readLocalComments(post.id))
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (post.isLocal) return

    const controller = new AbortController()
    fetchComments(post.id, controller.signal)
      .then((comments) => setRemote({ status: 'success', comments, error: null }))
      .catch((error: unknown) => {
        // Aborted by cleanup: this response belongs to a post we already left. Ignore it.
        if (controller.signal.aborted) return
        setRemote({ status: 'error', comments: [], error: errorMessage(error) })
      })

    // Runs before the next effect and on unmount: cancels the in-flight request,
    // so a slow response for an old post can never overwrite the current one.
    return () => controller.abort()
  }, [post.id, post.isLocal, attempt])

  function handleRetry() {
    setRemote({ status: 'loading', comments: [], error: null })
    setAttempt((n) => n + 1)
  }

  function handleAdd(body: string) {
    const comment: Comment = {
      id: Date.now(),
      postId: post.id,
      body,
      likes: 0,
      authorName: CURRENT_USER.name,
      authorUsername: CURRENT_USER.username,
      isLocal: true,
    }
    setLocalComments((prev) => [...prev, comment])
    saveLocalComment(comment)
  }

  const comments = [...remote.comments, ...localComments]

  return (
    <section className={styles.section} aria-labelledby="comments-heading">
      <h2 id="comments-heading" className={styles.heading}>
        <Icon name="message" />
        Comments {remote.status === 'success' && <span className={styles.total}>{comments.length}</span>}
      </h2>

      <CommentForm onSubmit={handleAdd} />

      {remote.status === 'loading' && <p className={styles.note}>Loading comments…</p>}

      {remote.status === 'error' && (
        <div className={styles.error} role="alert">
          <span>Couldn't load comments. {remote.error}</span>
          <button type="button" className="btn" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {remote.status === 'success' && comments.length === 0 && (
        <p className={styles.note}>No comments yet. Be the first to share your thoughts.</p>
      )}

      {comments.length > 0 && (
        <ul className={styles.list}>
          {comments.map((comment) => (
            // Server and local ids come from different sources, so prefix them to keep keys unique.
            <li key={`${comment.isLocal ? 'local' : 'server'}-${comment.id}`} className={styles.item}>
              <div className={styles.meta}>
                <span className={styles.author}>{comment.authorName}</span>
                <span className={styles.username}>@{comment.authorUsername}</span>
                {comment.likes > 0 && (
                  <span className={styles.likes}>
                    <Icon name="heart" size={14} /> {comment.likes}
                  </span>
                )}
              </div>
              <p className={styles.body}>{comment.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
