import { Link, useLocation, useParams } from 'react-router'
import { PostDetail } from '../components/PostDetail'
import { StatusMessage } from '../components/StatusMessage'
import { usePosts } from '../context/PostsContext'
import { getAuthor } from '../lib/authors'

/** Where "Back to feed" goes: the feed URL (with filters) the user came from, if any. */
function readBackTo(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'backTo' in state) {
    const { backTo } = state
    if (typeof backTo === 'string' && backTo.startsWith('/')) return backTo
  }
  return '/'
}

export function PostPage() {
  const { postId } = useParams()
  const location = useLocation()
  const { status, error, posts, authors, toggleLike, deletePost, retry } = usePosts()
  const backTo = readBackTo(location.state)

  if (status === 'loading') {
    return <StatusMessage variant="loading" title="Loading story…" />
  }

  if (status === 'error') {
    return (
      <StatusMessage
        variant="error"
        title="Couldn't load this story"
        action={
          <button type="button" className="btn btn-primary" onClick={retry}>
            Try again
          </button>
        }
      >
        {error}
      </StatusMessage>
    )
  }

  const index = posts.findIndex((post) => post.id === Number(postId))
  const post = posts[index]

  if (!post) {
    return (
      <StatusMessage
        variant="empty"
        title="Story not found"
        action={
          <Link to="/" className="btn btn-primary">
            Back to feed
          </Link>
        }
      >
        It may have been deleted, or the link is incorrect.
      </StatusMessage>
    )
  }

  return (
    // The route element stays mounted between /posts/1 and /posts/2; the key forces a fresh
    // PostDetail (and CommentSection) per post so no state leaks from the previous one.
    <PostDetail
      key={post.id}
      post={post}
      author={getAuthor(authors, post.userId)}
      previous={posts[index - 1]}
      next={posts[index + 1]}
      backTo={backTo}
      onToggleLike={toggleLike}
      onDelete={deletePost}
    />
  )
}
