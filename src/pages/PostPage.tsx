import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { fetchComments, fetchPost, fetchUser, getErrorMessage } from '../services/service'
import { CommentList } from '../components/CommentList'
import { Message } from '../components/Message'
import { TagList } from '../components/TagList'
import { getLocalPosts } from '../localPosts'
import { NotFoundPage } from './NotFoundPage'
import type { Comment, Post, Status, User } from '../types'

const LAST_POST_ID = 251 // DummyJSON has posts with ids 1 to 251

export default function PostPage() {
  const { id } = useParams()
  const postId = Number(id)

  // /posts/abc or /posts/0 can never be a real post, so show 404 without calling the API.
  if (!Number.isInteger(postId) || postId < 1) {
    return <NotFoundPage />
  }

  // key={id}: when the id changes (e.g. "Next post"), React creates a new PostDetails
  // instead of reusing the old one, so all its state starts fresh from "loading".
  return <PostDetails key={id} postId={postId} />
}

function PostDetails({ postId }: { postId: number }) {
  const [post, setPost] = useState<Post | null>(null)
  const [author, setAuthor] = useState<User | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

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

  // "Back" returns to the previous page (with its filters). If the page was opened
  // directly there is no previous page in our app, so go to the list instead.
  function handleBack() {
    if (location.key === 'default') {
      navigate('/posts')
    } else {
      navigate(-1)
    }
  }

  // about 200 words per minute, at least 1 minute
  const wordCount = post ? post.body.split(' ').length : 0
  const readingMinutes = Math.max(1, Math.round(wordCount / 200))

  return (
    <div>
      <div className="back-links">
        <button onClick={handleBack}>← Back</button>
        <Link to="/posts">All posts</Link>
      </div>

      {status === 'loading' && <Message text="Loading post..." />}

      {status === 'error' && error === 'Not found.' && <Message text="This post does not exist." />}

      {status === 'error' && error !== 'Not found.' && (
        <Message text={`Could not load the post. ${error}`} />
      )}

      {status === 'success' && post && (
        <article className="post">
          <h1>{post.title}</h1>

          <dl className="details">
            <dt>Post ID</dt>
            <dd>{post.id}</dd>
            <dt>Author</dt>
            <dd>{authorName}</dd>
            <dt>Likes</dt>
            <dd>{post.reactions.likes}</dd>
            <dt>Dislikes</dt>
            <dd>{post.reactions.dislikes}</dd>
            <dt>Views</dt>
            <dd>{post.views}</dd>
            <dt>Comments</dt>
            <dd>{comments.length}</dd>
            <dt>Reading time</dt>
            <dd>{readingMinutes} min</dd>
            <dt>Tags</dt>
            <dd>
              <TagList tags={post.tags} />
            </dd>
          </dl>

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
