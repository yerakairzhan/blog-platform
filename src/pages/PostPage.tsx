import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { CommentList } from '../components/CommentList'
import { Message } from '../components/Message'
import { TagList } from '../components/TagList'
import { usePost } from '../hooks/usePost'
import { NotFoundPage } from './NotFoundPage'
import type { Status } from '../types'

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
  const { data, status: queryStatus, error: queryError } = usePost(postId)
  const navigate = useNavigate()
  const location = useLocation()

  const post = data ? data.post : null
  const author = data ? data.author : null
  const comments = data ? data.comments : []
  const error = queryError ? queryError.message : ''

  let status: Status = 'loading'
  if (queryStatus === 'error') {
    status = 'error'
  } else if (queryStatus === 'success') {
    status = 'success'
  }

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
