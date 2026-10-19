import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { fetchComments, fetchPost, fetchUser, getErrorMessage } from '../api'
import { CommentList } from '../components/CommentList'
import { Message } from '../components/Message'
import { TagList } from '../components/TagList'
import { getLocalPosts } from '../localPosts'
import type { Comment, Post, Status, User } from '../types'

const LAST_POST_ID = 251 // DummyJSON has posts with ids 1 to 251

export function PostPage() {
  const { id } = useParams()

  // key={id}: when the id changes (e.g. "Next post"), React creates a new PostDetails
  // instead of reusing the old one, so all its state starts fresh from "loading".
  return <PostDetails key={id} postId={Number(id)} />
}

function PostDetails({ postId }: { postId: number }) {
  const [post, setPost] = useState<Post | null>(null)
  const [author, setAuthor] = useState<User | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    // Posts created in this browser are not on the server.
    const localPost = getLocalPosts().find((p) => p.id === postId)
    if (localPost) {
      setPost(localPost)
      setStatus('success')
      return
    }

    const controller = new AbortController()

    async function loadPost() {
      try {
        const loadedPost = await fetchPost(postId, controller.signal)
        const [loadedAuthor, loadedComments] = await Promise.all([
          fetchUser(loadedPost.userId, controller.signal),
          fetchComments(postId, controller.signal),
        ])
        setPost(loadedPost)
        setAuthor(loadedAuthor)
        setComments(loadedComments)
        setStatus('success')
      } catch (err) {
        // Cancelled because the user already moved to another post: ignore the old result.
        if (controller.signal.aborted) return
        setError(getErrorMessage(err))
        setStatus('error')
      }
    }

    loadPost()

    // Cleanup runs when postId changes or the page closes, and cancels the old request,
    // so a slow response for an old post can never replace the current one.
    return () => controller.abort()
  }, [postId])

  const authorName = author ? `${author.firstName} ${author.lastName}` : 'You'

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to all posts
      </Link>

      {status === 'loading' && <Message text="Loading post..." />}

      {status === 'error' && <Message text={`Could not load the post. ${error}`} />}

      {status === 'success' && post && (
        <article className="post">
          <h1>{post.title}</h1>
          <p className="muted">
            By {authorName} · {post.reactions.likes} likes · {post.reactions.dislikes} dislikes ·{' '}
            {post.views} views
          </p>
          <TagList tags={post.tags} />
          <p className="post-body">{post.body}</p>

          <h2>Comments ({comments.length})</h2>
          <CommentList comments={comments} />
        </article>
      )}

      {postId <= LAST_POST_ID && (
        <div className="pagination">
          {postId > 1 && <Link to={`/posts/${postId - 1}`}>← Previous post</Link>}
          {postId < LAST_POST_ID && <Link to={`/posts/${postId + 1}`}>Next post →</Link>}
        </div>
      )}
    </div>
  )
}
